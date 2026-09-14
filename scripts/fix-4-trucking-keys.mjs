/**
 * Targeted fix: inject 4 missing truckingPage keys
 * (step1Title, step3Title, step4Title, adminReview)
 * after `ratingValue:` in each locale's truckingPage block.
 *
 * These keys exist in OTHER page sections so the previous inject script
 * considered them "already present" — this script scopes strictly to
 * the truckingPage block.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const LOCALES_DIR = new URL("../src/i18n/locales", import.meta.url).pathname;

// Translations for the 4 missing keys per locale
const KEYS = {
  "id-ID": {
    step1Title:  "Pilih Armada",
    step3Title:  "Isi Formulir",
    step4Title:  "Pantau Pengiriman",
    adminReview: "Admin akan meninjau dan mengkonfirmasi order",
  },
  "en-US": {
    step1Title:  "Choose Fleet",
    step3Title:  "Fill Form",
    step4Title:  "Track Shipment",
    adminReview: "Admin will review and confirm your order",
  },
  "en-AU": {
    step1Title:  "Choose Fleet",
    step3Title:  "Fill Form",
    step4Title:  "Track Shipment",
    adminReview: "Admin will review and confirm your order",
  },
  "en-GB": {
    step1Title:  "Choose Fleet",
    step3Title:  "Fill Form",
    step4Title:  "Track Shipment",
    adminReview: "Admin will review and confirm your order",
  },
  "en-SG": {
    step1Title:  "Choose Fleet",
    step3Title:  "Fill Form",
    step4Title:  "Track Shipment",
    adminReview: "Admin will review and confirm your order",
  },
  "zh-CN": {
    step1Title:  "选择车辆",
    step3Title:  "填写表单",
    step4Title:  "追踪货物",
    adminReview: "管理员将审核并确认您的订单",
  },
  "zh-TW": {
    step1Title:  "選擇車輛",
    step3Title:  "填寫表單",
    step4Title:  "追蹤貨物",
    adminReview: "管理員將審核並確認您的訂單",
  },
  "ms-MY": {
    step1Title:  "Pilih Armada",
    step3Title:  "Isi Borang",
    step4Title:  "Pantau Penghantaran",
    adminReview: "Admin akan menyemak dan mengesahkan pesanan anda",
  },
  "ja-JP": {
    step1Title:  "車両を選ぶ",
    step3Title:  "フォーム記入",
    step4Title:  "配送追跡",
    adminReview: "管理者が注文を確認します",
  },
  "ko-KR": {
    step1Title:  "차량 선택",
    step3Title:  "양식 작성",
    step4Title:  "배송 추적",
    adminReview: "관리자가 주문을 검토하고 확인합니다",
  },
  "de-DE": {
    step1Title:  "Fahrzeug wählen",
    step3Title:  "Formular ausfüllen",
    step4Title:  "Sendung verfolgen",
    adminReview: "Admin prüft und bestätigt Ihre Bestellung",
  },
  "fr-FR": {
    step1Title:  "Choisir le véhicule",
    step3Title:  "Remplir le formulaire",
    step4Title:  "Suivre l'expédition",
    adminReview: "L'admin examinera et confirmera votre commande",
  },
  "es-ES": {
    step1Title:  "Elegir vehículo",
    step3Title:  "Rellenar formulario",
    step4Title:  "Rastrear envío",
    adminReview: "El admin revisará y confirmará su pedido",
  },
  "it-IT": {
    step1Title:  "Scegli il veicolo",
    step3Title:  "Compila il modulo",
    step4Title:  "Traccia la spedizione",
    adminReview: "L'admin esaminerà e confermerà il tuo ordine",
  },
  "nl-NL": {
    step1Title:  "Voertuig kiezen",
    step3Title:  "Formulier invullen",
    step4Title:  "Zending volgen",
    adminReview: "Admin zal uw bestelling beoordelen en bevestigen",
  },
  "ar-AE": {
    step1Title:  "اختيار المركبة",
    step3Title:  "ملء النموذج",
    step4Title:  "تتبع الشحنة",
    adminReview: "سيراجع المسؤول طلبك ويؤكده",
  },
  "ar-SA": {
    step1Title:  "اختيار المركبة",
    step3Title:  "ملء النموذج",
    step4Title:  "تتبع الشحنة",
    adminReview: "سيراجع المسؤول طلبك ويؤكده",
  },
  "hi-IN": {
    step1Title:  "वाहन चुनें",
    step3Title:  "फ़ॉर्म भरें",
    step4Title:  "शिपमेंट ट्रैक करें",
    adminReview: "व्यवस्थापक आपके ऑर्डर की समीक्षा करेगा",
  },
};

// Find the truckingPage block boundaries in a file
function findTruckingPageBlock(content) {
  const start = content.indexOf("truckingPage:");
  if (start === -1) return null;
  const block = content.slice(start);
  let depth = 0, end = -1;
  for (let i = 0; i < block.length; i++) {
    if (block[i] === "{") depth++;
    else if (block[i] === "}") {
      depth--;
      if (depth === 0) { end = start + i + 1; break; }
    }
  }
  return end === -1 ? null : { start, end };
}

let updated = 0, skipped = 0, alreadyDone = 0;

const files = readdirSync(LOCALES_DIR).filter(f => f.endsWith(".ts") && f !== "types.ts").sort();

for (const file of files) {
  const locale = file.replace(".ts", "");
  const translations = KEYS[locale];
  if (!translations) { console.log(`SKIP (no translations defined): ${locale}`); skipped++; continue; }

  const filePath = join(LOCALES_DIR, file);
  let content = readFileSync(filePath, "utf8");

  const bounds = findTruckingPageBlock(content);
  if (!bounds) { console.error(`ERROR: truckingPage not found in ${locale}`); skipped++; continue; }

  const tp = content.slice(bounds.start, bounds.end);

  // Check if ALL 4 keys already present in truckingPage block
  const alreadyPresent = ["step1Title","step3Title","step4Title","adminReview"].every(k =>
    new RegExp(`\\b${k}:`).test(tp)
  );
  if (alreadyPresent) { console.log(`ALREADY DONE: ${locale}`); alreadyDone++; continue; }

  // Find ratingValue: line inside truckingPage block and inject after it
  // Match the whole line: `    ratingValue: '...',`
  const rvMatch = tp.match(/( {4}ratingValue:\s*['"][^'"]*['"],?\n?)/);
  if (!rvMatch) {
    console.error(`ERROR: ratingValue not found in truckingPage block for ${locale}`);
    skipped++;
    continue;
  }

  const injection = [
    `    step1Title:  '${translations.step1Title}',`,
    `    step3Title:  '${translations.step3Title}',`,
    `    step4Title:  '${translations.step4Title}',`,
    `    adminReview: '${translations.adminReview}',`,
  ].join("\n") + "\n";

  // Check which keys are already missing and only inject missing ones
  const missingKeys = ["step1Title","step3Title","step4Title","adminReview"].filter(k =>
    !new RegExp(`\\b${k}:`).test(tp)
  );
  const filteredLines = injection.split("\n").filter(line => {
    if (!line.trim()) return false;
    return missingKeys.some(k => line.includes(k + ":") || line.includes(k + "  "));
  }).join("\n") + "\n";

  // Insert after ratingValue line in the full file content
  // Find the exact offset of ratingValue within the truckingPage block in the full content
  const rvAbsOffset = bounds.start + tp.indexOf(rvMatch[0]);
  const rvEnd = rvAbsOffset + rvMatch[0].length;

  // Ensure the ratingValue line ends with a newline
  const before = content.slice(0, rvEnd);
  const after = content.slice(rvEnd);

  content = before + filteredLines + after;
  writeFileSync(filePath, content, "utf8");
  console.log(`UPDATED: ${locale} (+${missingKeys.length} keys: ${missingKeys.join(", ")})`);
  updated++;
}

console.log(`\nDone: ${updated} updated, ${alreadyDone} already done, ${skipped} skipped.`);
