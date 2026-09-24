import path from "node:path";
import os from "node:os";

const MAX_RAW_TEXT = 3000;
const POSITIVE_CONTEXT = /(jumlah|total|nominal|amount|transfer|payment|pembayaran|sent|kirim|debit|rp\.?|idr)/i;
const STRONG_CONTEXT = /(jumlah\s*(transfer|bayar|pembayaran)?|total\s*(transfer|bayar|pembayaran)?|nominal|amount|rp\.?|idr)/i;
const NEGATIVE_CONTEXT = /(rekening|account|ref(?:erensi)?|reference|nomor|kode|tanggal|date|waktu|time|saldo|balance|admin|fee)/i;

export function isLikelyYearAmount(value) {
  return Number.isInteger(value) && value >= 2000 && value <= 2099;
}

function isDateLike(value) {
  const s = String(Math.trunc(value));
  if (s.length !== 8) return false;
  const ymdY = Number(s.slice(0, 4));
  const ymdM = Number(s.slice(4, 6));
  const ymdD = Number(s.slice(6, 8));
  if (ymdY >= 2000 && ymdY <= 2099 && ymdM >= 1 && ymdM <= 12 && ymdD >= 1 && ymdD <= 31) return true;
  const dmyD = Number(s.slice(0, 2));
  const dmyM = Number(s.slice(2, 4));
  const dmyY = Number(s.slice(4, 8));
  return dmyY >= 2000 && dmyY <= 2099 && dmyM >= 1 && dmyM <= 12 && dmyD >= 1 && dmyD <= 31;
}

function isReasonableAmount(value) {
  return Number.isFinite(value)
    && value >= 1_000
    && value <= 999_999_999_999
    && !isLikelyYearAmount(value)
    && !isDateLike(value);
}

function normalizeMoneyToken(token) {
  const raw = String(token ?? "").trim().replace(/\s+/g, "");
  if (!raw) return null;

  // Indonesian bank receipts commonly use 1.000.000,00; international ones use 1,000,000.00.
  const decimalMatch = raw.match(/^([\d.,]+?)[.,](\d{2})$/);
  let integerPart = decimalMatch ? decimalMatch[1] : raw;
  integerPart = integerPart.replace(/[.,]/g, "");
  if (!/^\d+$/.test(integerPart)) return null;

  const value = Number(integerPart);
  return isReasonableAmount(value) ? value : null;
}

function candidateTokens(line) {
  const values = [];
  const re = /(?:Rp\.?\s*|IDR\s*)?(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|\d{4,12}(?:[.,]\d{2})?)/gi;
  let match;
  while ((match = re.exec(line)) !== null) {
    const amount = normalizeMoneyToken(match[1]);
    if (amount != null) values.push({
      amount,
      hasCurrencyPrefix: /(?:Rp\.?\s*|IDR\s*)/i.test(match[0]),
      token: match[0],
    });
  }
  return values;
}

export function parsePaymentAmountText(text, expectedAmount = null) {
  const rawText = String(text ?? "").replace(/[’‘]/g, "'").trim();
  if (!rawText) return { amount: null, confidence: 0, matchedExpected: false };

  const expected = Number(expectedAmount);
  const hasExpected = Number.isFinite(expected) && expected > 0;
  const candidates = [];

  for (const originalLine of rawText.split(/\r?\n/)) {
    const line = originalLine.replace(/\s+/g, " ").trim();
    if (!line) continue;

    const positive = POSITIVE_CONTEXT.test(line);
    const strong = STRONG_CONTEXT.test(line);
    const negative = NEGATIVE_CONTEXT.test(line);

    for (const item of candidateTokens(line)) {
      let score = 0.45;
      if (item.hasCurrencyPrefix) score += 0.25;
      if (positive) score += 0.15;
      if (strong) score += 0.1;
      if (negative && !strong) score -= 0.25;
      if (hasExpected && item.amount === expected) score += 0.4;
      candidates.push({ ...item, line, score: Math.max(0, Math.min(1, score)) });
    }
  }

  if (!candidates.length) return { amount: null, confidence: 0, matchedExpected: false };

  if (hasExpected) {
    const exact = candidates
      .filter((candidate) => candidate.amount === expected)
      .sort((a, b) => b.score - a.score)[0];
    if (exact) {
      return {
        amount: exact.amount,
        confidence: Math.max(0.95, exact.score),
        matchedExpected: true,
      };
    }
  }

  candidates.sort((a, b) => b.score - a.score || b.amount - a.amount);
  const best = candidates[0];
  return {
    amount: best.amount,
    confidence: Number(best.score.toFixed(2)),
    matchedExpected: hasExpected ? best.amount === expected : false,
  };
}

function validImageMagic(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 16) return false;
  const signatures = [
    [0xff, 0xd8, 0xff],
    [0x89, 0x50, 0x4e, 0x47],
    [0x52, 0x49, 0x46, 0x46],
  ];
  return signatures.some((signature) => signature.every((byte, index) => buffer[index] === byte));
}

export async function extractPaymentAmountFromFile(file, expectedAmount = null) {
  const mimeType = String(file?.type ?? "").toLowerCase();
  if (!["image/jpeg", "image/png"].includes(mimeType)) {
    const error = new Error("OCR nominal hanya mendukung JPG atau PNG.");
    error.statusCode = 415;
    throw error;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!validImageMagic(buffer)) {
    const error = new Error("File bukti pembayaran bukan gambar yang valid.");
    error.statusCode = 415;
    throw error;
  }

  const Tesseract = await import("tesseract.js");
  const worker = await Tesseract.createWorker("eng", 1, {
    cachePath: path.join(os.tmpdir(), "cst-payment-ocr"),
    logger: () => {},
  });

  try {
    const { data } = await worker.recognize(buffer);
    const rawText = String(data?.text ?? "").trim();
    const parsed = parsePaymentAmountText(rawText, expectedAmount);
    const engineConfidence = Math.max(0, Math.min(1, Number(data?.confidence ?? 0) / 100));
    const confidence = parsed.amount == null
      ? 0
      : Number(Math.min(parsed.confidence, engineConfidence || parsed.confidence).toFixed(4));

    return {
      extractedAmount: parsed.amount,
      confidence,
      matchedExpected: parsed.matchedExpected,
      rawText: rawText.slice(0, MAX_RAW_TEXT),
    };
  } finally {
    await worker.terminate().catch(() => {});
  }
}
