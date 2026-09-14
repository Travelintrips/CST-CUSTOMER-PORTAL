import { useState, useCallback, useRef } from "react";
import { ArrowLeftRight, Copy, Check, Loader2, Globe2, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PageSeo from "@/components/PageSeo";

// ── Language definitions ──────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "id", label: "🇮🇩 Indonesia" },
  { code: "en", label: "🇬🇧 English" },
  { code: "zh", label: "🇨🇳 中文 (Simplified)" },
  { code: "ar", label: "🇸🇦 العربية" },
  { code: "ms", label: "🇲🇾 Melayu" },
  { code: "ja", label: "🇯🇵 日本語" },
  { code: "ko", label: "🇰🇷 한국어" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "de", label: "🇩🇪 Deutsch" },
  { code: "es", label: "🇪🇸 Español" },
  { code: "ru", label: "🇷🇺 Русский" },
  { code: "th", label: "🇹🇭 ไทย" },
  { code: "vi", label: "🇻🇳 Tiếng Việt" },
] as const;

type LangCode = (typeof LANGUAGES)[number]["code"] | "auto";

interface HistoryItem {
  id: string;
  sourceText: string;
  translation: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
}

const MAX_CHARS = 5000;

function langLabel(code: string): string {
  if (code === "auto") return "Auto-detect";
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TranslationHub() {
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [sourceLang, setSourceLang] = useState<LangCode>("auto");
  const [targetLang, setTargetLang] = useState<LangCode>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Translate ───────────────────────────────────────────────────────────────
  const translate = useCallback(async (text: string, src: LangCode, tgt: LangCode) => {
    if (!text.trim() || !tgt || tgt === "auto") return;
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, string> = { text: text.trim(), targetLang: tgt };
      if (src !== "auto") body.sourceLang = src;

      const res = await fetch("/api/ai-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Translation failed");

      setTargetText(data.translation);
      setHistory((prev) => [
        {
          id: Date.now().toString(),
          sourceText: text.trim(),
          translation: data.translation,
          sourceLang: src === "auto" ? "auto" : src,
          targetLang: tgt,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9), // keep last 10
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
      setTargetText("");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Debounced input ─────────────────────────────────────────────────────────
  const handleSourceChange = (val: string) => {
    setSourceText(val);
    setTargetText("");
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length > 2) {
      debounceRef.current = setTimeout(() => {
        translate(val, sourceLang, targetLang);
      }, 900);
    }
  };

  // ── Swap languages ──────────────────────────────────────────────────────────
  const swap = () => {
    if (sourceLang === "auto") return;
    const newSrc = targetLang as LangCode;
    const newTgt = sourceLang as LangCode;
    const newSourceText = targetText;
    setSourceLang(newSrc);
    setTargetLang(newTgt);
    setSourceText(newSourceText);
    setTargetText(sourceText);
  };

  // ── Copy to clipboard ───────────────────────────────────────────────────────
  const copyResult = () => {
    if (!targetText) return;
    navigator.clipboard.writeText(targetText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Load history item ───────────────────────────────────────────────────────
  const loadHistory = (item: HistoryItem) => {
    setSourceText(item.sourceText);
    setTargetText(item.translation);
    setSourceLang(item.sourceLang as LangCode);
    setTargetLang(item.targetLang as LangCode);
    setError(null);
  };

  const charsLeft = MAX_CHARS - sourceText.length;
  const canSwap = sourceLang !== "auto" && !!targetText;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <PageSeo path="/translation-hub" />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-sky-900 text-white py-14 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-4 backdrop-blur-sm">
          <Globe2 className="h-4 w-4" />
          Didukung oleh AI — OpenAI GPT-4o mini
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Translation Hub</h1>
        <p className="text-slate-300 max-w-lg mx-auto text-sm md:text-base">
          Terjemahkan teks secara real-time untuk pelanggan, vendor, dan staf — mendukung 13+ bahasa.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">

        {/* Language selectors + swap */}
        <div className="flex items-center gap-3">
          {/* Source language */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Bahasa Sumber</p>
            <Select value={sourceLang} onValueChange={(v) => { setSourceLang(v as LangCode); setTargetText(""); }}>
              <SelectTrigger className="bg-white border-slate-200 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">🌐 Auto-detect</SelectItem>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap button */}
          <Button
            variant="outline"
            size="icon"
            onClick={swap}
            disabled={!canSwap}
            className="mt-5 shrink-0 rounded-full border-slate-200 shadow-sm hover:bg-sky-50 hover:border-sky-300 transition-colors disabled:opacity-30"
            title="Tukar bahasa"
          >
            <ArrowLeftRight className="h-4 w-4 text-slate-600" />
          </Button>

          {/* Target language */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Bahasa Tujuan</p>
            <Select value={targetLang} onValueChange={(v) => { setTargetLang(v as LangCode); setTargetText(""); }}>
              <SelectTrigger className="bg-white border-slate-200 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Translation panels */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Source */}
          <div className="relative">
            <Textarea
              value={sourceText}
              onChange={(e) => handleSourceChange(e.target.value)}
              placeholder="Ketik atau tempel teks di sini…"
              maxLength={MAX_CHARS}
              rows={10}
              className="resize-none bg-white border-slate-200 shadow-sm text-slate-800 placeholder:text-slate-400 text-base leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {sourceText && (
                <button
                  onClick={() => { setSourceText(""); setTargetText(""); setError(null); }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <span className={`text-xs tabular-nums ${charsLeft < 200 ? "text-amber-500" : "text-slate-400"}`}>
                {sourceText.length}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Target */}
          <div className="relative">
            <div
              className={`min-h-[232px] rounded-md border p-3 text-base leading-relaxed transition-colors ${
                error
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2 text-slate-400 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Menerjemahkan…</span>
                </div>
              ) : error ? (
                <p className="text-red-600 text-sm">{error}</p>
              ) : targetText ? (
                <p className="text-slate-800 whitespace-pre-wrap">{targetText}</p>
              ) : (
                <p className="text-slate-400 text-sm mt-2">Hasil terjemahan akan muncul di sini</p>
              )}
            </div>

            {targetText && !loading && (
              <div className="absolute bottom-3 right-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyResult}
                  className="h-7 gap-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Tersalin!" : "Salin"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Translate button */}
        <div className="flex justify-center">
          <Button
            onClick={() => translate(sourceText, sourceLang, targetLang)}
            disabled={loading || !sourceText.trim() || targetLang === "auto"}
            className="bg-sky-600 hover:bg-sky-700 text-white px-8 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menerjemahkan…
              </>
            ) : (
              <>
                <Globe2 className="h-4 w-4 mr-2" />
                Terjemahkan
              </>
            )}
          </Button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Riwayat Terjemahan</h2>
              <button
                onClick={() => setHistory([])}
                className="ml-auto text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Hapus semua
              </button>
            </div>
            <div className="space-y-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadHistory(item)}
                  className="w-full text-left bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-sky-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className="text-xs font-normal border-slate-300 text-slate-500">
                      {langLabel(item.sourceLang)} → {langLabel(item.targetLang)}
                    </Badge>
                    <span className="text-xs text-slate-400 ml-auto">
                      {item.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 truncate">{item.sourceText}</p>
                  <p className="text-sm text-sky-700 truncate">{item.translation}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
