/**
 * Kalkulator Tarif Impor
 * Menghitung BM, PPN, PPh Pasal 22 berdasarkan HS Code BTKI 2022
 * Route: /kalkulator-impor
 *
 * Fitur:
 *  - Multi-mata uang (USD, CNY, EUR, JPY, GBP, SGD, dll.) dengan kurs JISDOR BI
 *  - Auto-recalculate saat input berubah (debounce 600ms)
 *  - Incoterm: CIF, FOB, CNF, EXW, DAP, DDP
 *  - Tarif preferensial FTA (ACFTA, AFTA, AIFTA, dll.)
 *  - LARTAS warning + detail regulasi
 *  - Multi-HS comparison (hingga 10 HS Code sekaligus)
 *  - Export CSV & JSON
 */
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Calculator, Search, ChevronDown, AlertTriangle,
  CheckCircle2, Info, Download, RefreshCw, ArrowRight,
  FileText, Globe, Package, Loader2, X, ChevronRight,
  Building2, Shield, Banknote, Receipt, Plus, Trash2, BarChart3,
  TrendingUp, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageSeo from "@/components/PageSeo";
import { useLanguage } from "@/i18n/LanguageContext";

// ── Types ─────────────────────────────────────────────────────────────────────
interface BtkiSearchResult {
  hsCode: string;
  descriptionId: string;
  descriptionEn: string | null;
  unit: string | null;
  category: string | null;
  tariff: {
    bmMfn: string | null;
    preferensial: Record<string, string | null>;
    ppn: string | null;
    ppnbm: string | null;
    pph22Api: string | null;
    pph22NonApi: string | null;
  };
  lartas: {
    import: boolean;
    description: string | null;
    regulatorImport: string | null;
    perizinanImport: unknown;
  };
}

interface CalcResult {
  hs: {
    code: string;
    descriptionId: string;
    descriptionEn: string | null;
    unit: string | null;
    category: string | null;
  };
  input: {
    goodsValue: number;
    currency: string;
    exchangeRate: number;
    goodsValueIDR: number;
    incoterm: string;
    freightCostIDR: number;
    insurancePct: number;
    isApi: boolean;
    preferentialScheme: string;
    incotermNote: string;
  };
  ndpbm: number;
  rates: {
    bm: string;
    bmRate: number;
    bmScheme: string;
    ppn: string;
    ppnRate: number;
    ppnbm: string;
    ppnbmRate: number;
    pph: string;
    pphRate: number;
  };
  duties: {
    bm: number;
    ppn: number;
    ppnbm: number;
    pph: number;
    totalDuties: number;
    effectiveRate: string;
  };
  ddp: number;
  lartas: {
    hasLartas: boolean;
    description: string | null;
    regulator: string | null;
    perizinan: unknown;
  };
  preferential: Record<string, string | null>;
  source: string;
  btkiLink: string;
  inswLink: string;
}

interface MultiCalcItem {
  id: string;
  hsCode: string;
  goodsValue: string;
  label: string;
  selectedHs: BtkiSearchResult | null;
  searchInput: string;
  searchOpen: boolean;
}

// ── Konstanta ─────────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", label: "USD — Dolar Amerika", flag: "🇺🇸" },
  { code: "CNY", label: "CNY — Yuan China", flag: "🇨🇳" },
  { code: "EUR", label: "EUR — Euro", flag: "🇪🇺" },

  { code: "SGD", label: "SGD — Dolar Singapura", flag: "🇸🇬" },
  { code: "JPY", label: "JPY — Yen Jepang", flag: "🇯🇵" },
  { code: "GBP", label: "GBP — Poundsterling", flag: "🇬🇧" },
  { code: "MYR", label: "MYR — Ringgit Malaysia", flag: "🇲🇾" },
  { code: "AUD", label: "AUD — Dolar Australia", flag: "🇦🇺" },
  { code: "HKD", label: "HKD — Dolar Hong Kong", flag: "🇭🇰" },
  { code: "KRW", label: "KRW — Won Korea", flag: "🇰🇷" },
  { code: "AED", label: "AED — Dirham UAE", flag: "🇦🇪" },
  { code: "SAR", label: "SAR — Riyal Saudi", flag: "🇸🇦" },
  { code: "THB", label: "THB — Baht Thailand", flag: "🇹🇭" },
  { code: "INR", label: "INR — Rupee India", flag: "🇮🇳" },
  { code: "TWD", label: "TWD — Dolar Taiwan", flag: "🇹🇼" },
  { code: "CHF", label: "CHF — Franc Swiss", flag: "🇨🇭" },
  { code: "CAD", label: "CAD — Dolar Kanada", flag: "🇨🇦" },
];

const INCOTERMS = [
  { value: "CIF", label: "CIF", desc: "Cost, Insurance & Freight — nilai sudah termasuk ongkir & asuransi" },
  { value: "FOB", label: "FOB", desc: "Free on Board — perlu input ongkir terpisah" },
  { value: "CNF", label: "CNF/CFR", desc: "Cost & Freight — perlu input asuransi terpisah" },
  { value: "EXW", label: "EXW", desc: "Ex Works — perlu input ongkir penuh terpisah" },
  { value: "DAP", label: "DAP", desc: "Delivered at Place — setara CIF untuk kalkulasi BM" },
  { value: "DDP", label: "DDP", desc: "Delivered Duty Paid — pajak sudah dibayar eksportir" },
];

const PREFERENTIAL = [
  { value: "", label: "MFN — Most Favoured Nation (default)" },
  { value: "ACFTA", label: "ACFTA — ASEAN-China FTA (Form E)" },
  { value: "AFTA", label: "AFTA — ASEAN FTA (Form D)" },
  { value: "AIFTA", label: "AIFTA — ASEAN-India FTA (Form AI)" },
  { value: "AANZFTA", label: "AANZFTA — ASEAN-Australia/NZ FTA" },
  { value: "AHKFTA", label: "AHKFTA — ASEAN-Hong Kong FTA" },
  { value: "AKFTA", label: "AKFTA — ASEAN-Korea FTA (Form AK)" },
  { value: "ASFTA", label: "ASFTA / IE-CEPA — EFTA (Swiss, dll.)" },
  { value: "IA-CEPA", label: "IA-CEPA — Indonesia-Australia CEPA" },
];

// ── Utilities ─────────────────────────────────────────────────────────────────
function idr(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function num(n: number, currency = "IDR") {
  if (currency === "IDR") return idr(n);
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(n) + " " + currency;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ImportTariffCalculatorPage() {
  const { t } = useLanguage();
  // ── Form state ──────────────────────────────────────────────────────────────
  const [hsInput, setHsInput]               = useState("");
  const [selectedHs, setSelectedHs]         = useState<BtkiSearchResult | null>(null);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [goodsValue, setGoodsValue]         = useState("");
  const [currency, setCurrency]             = useState("USD");
  const [incoterm, setIncoterm]             = useState("CIF");
  const [freightCost, setFreightCost]       = useState("");
  const [insurancePct, setInsurancePct]     = useState("0.5");
  const [isApi, setIsApi]                   = useState(true);
  const [prefScheme, setPrefScheme]         = useState("");
  const [lartasOpen, setLartasOpen]         = useState(false);
  const [prefOpen, setPrefOpen]             = useState(false);
  const [result, setResult]                 = useState<CalcResult | null>(null);
  const [activeTab, setActiveTab]           = useState<"single" | "multi">("single");

  // Multi-HS comparison state
  const [multiItems, setMultiItems] = useState<MultiCalcItem[]>([]);
  const [multiResults, setMultiResults] = useState<Array<(CalcResult & { label: string; ok: boolean; error?: string }) | null>>([]);
  const [multiSearchData, setMultiSearchData] = useState<Record<string, { results: BtkiSearchResult[] }>>({});

  const searchRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown search saat klik di luar
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // ── Fetch exchange rates ─────────────────────────────────────────────────────
  const { data: ratesData, isLoading: ratesLoading } = useQuery({
    queryKey: ["import-rates"],
    queryFn: () =>
      fetch("/api/import-calculator/rates").then((r) => r.json()) as Promise<{
        rates: Record<string, number>;
        source: string;
        sourceLabel: string;
        updatedAt: string;
      }>,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Live exchange rate for selected currency
  const currentRate = ratesData?.rates[currency] ?? null;

  // ── BTKI search ──────────────────────────────────────────────────────────────
  const { data: searchData, isFetching: searching } = useQuery({
    queryKey: ["btki-search", hsInput],
    queryFn: () =>
      fetch(`/api/btki/search?q=${encodeURIComponent(hsInput)}&limit=15`).then(
        (r) => r.json()
      ) as Promise<{ results: BtkiSearchResult[] }>,
    enabled: hsInput.trim().length >= 2 && !selectedHs,
    staleTime: 5 * 60 * 1000,
  });

  // ── Auto-recalculate (debounced) ─────────────────────────────────────────────
  const canCalculate =
    !!selectedHs && goodsValue.trim() !== "" && parseFloat(goodsValue) > 0;

  const needsFreight = ["FOB", "EXW", "CNF"].includes(incoterm);

  // Build a stable key from all inputs for debounce tracking
  const inputKey = useMemo(() => {
    if (!canCalculate) return null;
    return JSON.stringify({ hs: selectedHs?.hsCode, goodsValue, currency, incoterm, freightCost, insurancePct, isApi, prefScheme });
  }, [canCalculate, selectedHs?.hsCode, goodsValue, currency, incoterm, freightCost, insurancePct, isApi, prefScheme]);

  const debouncedKey = useDebounce(inputKey, 600);

  // ── Calculate mutation ───────────────────────────────────────────────────────
  const calcMutation = useMutation({
    mutationFn: async () => {
      const body = {
        hsCode:           selectedHs!.hsCode,
        goodsValue:       parseFloat(goodsValue.replace(/,/g, "")),
        currency,
        incoterm,
        freightCostIDR:   parseFloat(freightCost.replace(/,/g, "") || "0"),
        insurancePct:     parseFloat(insurancePct || "0.5"),
        isApi,
        preferentialScheme: prefScheme || undefined,
      };
      const res = await fetch("/api/import-calculator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error ?? "Gagal menghitung");
      }
      return res.json() as Promise<CalcResult>;
    },
    onSuccess: (data) => setResult(data),
  });

  // Trigger auto-recalculate when debounced key changes
  useEffect(() => {
    if (debouncedKey && canCalculate) {
      calcMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKey]);

  // ── Multi-HS calculate mutation ───────────────────────────────────────────────
  const multiCalcMutation = useMutation({
    mutationFn: async () => {
      const validItems = multiItems.filter((it) => it.selectedHs && it.goodsValue);
      if (validItems.length === 0) throw new Error("Tambahkan minimal 1 HS Code");
      const body = {
        items: validItems.map((it) => ({
          hsCode: it.selectedHs!.hsCode,
          goodsValue: parseFloat(it.goodsValue.replace(/,/g, "")),
          label: it.label || it.selectedHs!.hsCode,
        })),
        currency,
        incoterm,
        freightCostIDR: parseFloat(freightCost.replace(/,/g, "") || "0"),
        insurancePct: parseFloat(insurancePct || "0.5"),
        isApi,
        preferentialScheme: prefScheme || undefined,
      };
      const res = await fetch("/api/import-calculator/multi-calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error ?? "Gagal menghitung multi-HS");
      }
      return res.json() as Promise<{ results: Array<CalcResult & { label: string; ok: boolean; error?: string }>; rateSource: string }>;
    },
    onSuccess: (data) => setMultiResults(data.results),
  });

  // ── Multi-HS search per item ─────────────────────────────────────────────────
  async function searchForItem(itemId: string, q: string) {
    if (q.trim().length < 2) return;
    const res = await fetch(`/api/btki/search?q=${encodeURIComponent(q)}&limit=10`).then(r => r.json()) as { results: BtkiSearchResult[] };
    setMultiSearchData((prev) => ({ ...prev, [itemId]: res }));
  }

  function addMultiItem() {
    if (multiItems.length >= 10) return;
    const id = crypto.randomUUID();
    setMultiItems((prev) => [...prev, { id, hsCode: "", goodsValue: "", label: "", selectedHs: null, searchInput: "", searchOpen: false }]);
  }

  function removeMultiItem(id: string) {
    setMultiItems((prev) => prev.filter((it) => it.id !== id));
    setMultiSearchData((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  function updateMultiItem(id: string, patch: Partial<MultiCalcItem>) {
    setMultiItems((prev) => prev.map((it) => it.id === id ? { ...it, ...patch } : it));
  }

  // ── Export CSV ───────────────────────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    if (!result) return;
    const rows = [
      ["Field", "Nilai"],
      ["HS Code", result.hs.code],
      ["Deskripsi", result.hs.descriptionId],
      ["Nilai Barang", `${result.input.goodsValue} ${result.input.currency}`],
      ["Kurs IDR", String(result.input.exchangeRate)],
      ["Nilai Barang (IDR)", String(result.input.goodsValueIDR)],
      ["Incoterm", result.input.incoterm],
      ["NDPBM (CIF IDR)", String(result.ndpbm)],
      ["Tarif BM", result.rates.bm],
      ["Skema BM", result.rates.bmScheme],
      ["BM (IDR)", String(result.duties.bm)],
      ["PPN (IDR)", String(result.duties.ppn)],
      ["PPnBM (IDR)", String(result.duties.ppnbm)],
      ["PPh Pasal 22 (IDR)", String(result.duties.pph)],
      ["Total Pungutan (IDR)", String(result.duties.totalDuties)],
      ["Effective Tax Rate", result.duties.effectiveRate],
      ["Total DDP (IDR)", String(result.ddp)],
      ["LARTAS", result.lartas.hasLartas ? "YA" : "TIDAK"],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kalkulator-impor-${result.hs.code.replace(/\./g, "")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const exportJSON = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kalkulator-impor-${result.hs.code.replace(/\./g, "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const exportMultiCSV = useCallback(() => {
    if (!multiResults.length) return;
    const rows = [
      ["Label", "HS Code", "Nilai Barang", "Currency", "NDPBM (IDR)", "BM (IDR)", "PPN (IDR)", "PPh (IDR)", "Total Pungutan (IDR)", "DDP (IDR)", "Effective Rate", "LARTAS"],
    ];
    for (const r of multiResults) {
      if (!r || !r.ok) {
        rows.push([r?.label ?? "—", "—", "—", "—", "ERROR", "—", "—", "—", "—", "—", "—", "—"]);
        continue;
      }
      rows.push([
        r.label, r.hs.code,
        String(r.input.goodsValue), r.input.currency,
        String(r.ndpbm), String(r.duties.bm), String(r.duties.ppn), String(r.duties.pph),
        String(r.duties.totalDuties), String(r.ddp), r.duties.effectiveRate,
        r.lartas.hasLartas ? "YA" : "TIDAK",
      ]);
    }
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `multi-hs-comparison.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [multiResults]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <PageSeo
        title={t("importTariffCalc.pageSeoTitle", "Kalkulator Tarif Impor — BM, PPN, PPh")}
        description={t("importTariffCalc.pageSeoDesc", "Hitung Bea Masuk, PPN Impor, dan PPh Pasal 22 secara otomatis berdasarkan HS Code BTKI 2022. Mendukung multi-mata uang (JISDOR BI) dan berbagai Incoterm.")}
      />

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-sky-900 via-sky-800 to-indigo-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sky-300 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">{t("importTariffCalc.breadcrumbHome", "Beranda")}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>{t("importTariffCalc.pageTitle", "Kalkulator Tarif Impor")}</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("importTariffCalc.pageTitle", "Kalkulator Tarif Impor")}</h1>
              <p className="text-sky-200 mt-1 text-sm leading-relaxed">
                {t("importTariffCalc.pageSubtitle", "Hitung Bea Masuk (BM), PPN Impor, dan PPh Pasal 22 berdasarkan BTKI 2022. Multi-mata uang, kurs live JISDOR BI, tarif FTA, auto-hitung otomatis.")}
              </p>
            </div>
          </div>

          {/* Exchange rate info bar */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {ratesLoading ? (
              <div className="flex items-center gap-2 text-xs text-sky-300">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{t("importTariffCalc.loadingRates", "Mengambil kurs terkini…")}</span>
              </div>
            ) : ratesData ? (
              <>
                <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                  ratesData.source === "bi_jisdor"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : ratesData.source === "live"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {ratesData.source === "bi_jisdor" ? (
                    <><Zap className="h-3 w-3" /> {t("importTariffCalc.rateJisdor", "JISDOR BI — Live")}</>
                  ) : ratesData.source === "live" ? (
                    <><RefreshCw className="h-3 w-3" /> {t("importTariffCalc.rateLive", "Kurs Live")}</>
                  ) : (
                    <><AlertTriangle className="h-3 w-3" /> {t("importTariffCalc.rateEstimate", "Kurs Estimasi")}</>
                  )}
                </div>
                <span className="text-xs text-sky-300">
                  1 USD ≈ {ratesData.rates.USD ? idr(ratesData.rates.USD) : "—"}
                </span>
                {currency !== "USD" && currency !== "IDR" && ratesData.rates[currency] && (
                  <span className="text-xs text-sky-300">
                    · 1 {currency} ≈ {idr(ratesData.rates[currency])}
                  </span>
                )}
                <span className="text-xs text-sky-400 ml-auto">
                  {t("importTariffCalc.updatedAt", "Diperbarui")} {new Date(ratesData.updatedAt).toLocaleTimeString("id-ID")}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("single")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "single"
                  ? "border-sky-500 text-sky-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Calculator className="h-4 w-4" />
              {t("importTariffCalc.tabSingle", "Kalkulasi Tunggal")}
            </button>
            <button
              onClick={() => setActiveTab("multi")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "multi"
                  ? "border-sky-500 text-sky-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              {t("importTariffCalc.tabMulti", "Perbandingan Multi-HS")}
              <span className="text-[10px] bg-sky-100 text-sky-600 rounded-full px-1.5 py-0.5 font-bold">{t("importTariffCalc.tabMultiBadge", "Baru")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ══════════════════ TAB: SINGLE ══════════════════ */}
        {activeTab === "single" && (
          <div className="grid lg:grid-cols-5 gap-6">

            {/* ── Kiri: Form Input ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* 1. HS Code */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-sky-600">1</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{t("importTariffCalc.step1Title", "HS Code — BTKI 2022")}</span>
                </div>

                {selectedHs ? (
                  <div className="relative rounded-xl border border-sky-200 bg-sky-50 p-3">
                    <button
                      onClick={() => { setSelectedHs(null); setHsInput(""); setResult(null); }}
                      className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs font-bold text-sky-700 font-mono">{selectedHs.hsCode}</p>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed pr-5">
                      {selectedHs.descriptionId}
                    </p>
                    {selectedHs.tariff.bmMfn && (
                      <span className="inline-block mt-1.5 text-[10px] bg-sky-100 text-sky-700 rounded-full px-2 py-0.5 font-semibold">
                        BM MFN: {selectedHs.tariff.bmMfn}
                      </span>
                    )}
                    {selectedHs.lartas.import && (
                      <span className="inline-block mt-1.5 ml-1 text-[10px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-semibold">
                        ⚠ LARTAS
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative" ref={searchRef}>
                    <div className="flex items-center gap-2 border border-slate-300 rounded-xl px-3 py-2 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all bg-white">
                      <Search className="h-4 w-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={hsInput}
                        onChange={(e) => { setHsInput(e.target.value); setSearchOpen(true); }}
                        onFocus={() => setSearchOpen(true)}
                        placeholder={t("importTariffCalc.hsSearchPlaceholder", "Cari HS Code atau deskripsi barang…")}
                        className="flex-1 text-sm outline-none placeholder-slate-400"
                      />
                      {searching && <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />}
                    </div>

                    {searchOpen && searchData?.results && searchData.results.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                        {searchData.results.map((item) => (
                          <button
                            key={item.hsCode}
                            onClick={() => {
                              setSelectedHs(item);
                              setHsInput(item.hsCode);
                              setSearchOpen(false);
                            }}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-sky-50 transition-colors border-b border-slate-100 last:border-0"
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-[11px] font-mono font-bold text-sky-700 shrink-0 mt-0.5">
                                {item.hsCode}
                              </span>
                              <div className="min-w-0">
                                <p className="text-[12px] text-slate-800 leading-tight truncate">
                                  {item.descriptionId}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {item.tariff.bmMfn && (
                                    <p className="text-[10px] text-slate-400">
                                      BM: {item.tariff.bmMfn} · PPN: {item.tariff.ppn}
                                    </p>
                                  )}
                                  {item.lartas.import && (
                                    <span className="text-[9px] bg-amber-100 text-amber-600 rounded-full px-1.5 py-0.5 font-bold">
                                      LARTAS
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchOpen && hsInput.length >= 2 && !searching && searchData?.results?.length === 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
                        <p className="text-sm text-slate-500">{t("importTariffCalc.notFound", "Tidak ditemukan. Coba kata kunci lain.")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Nilai Barang & Mata Uang */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-sky-600">2</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{t("importTariffCalc.step2Title", "Nilai Barang & Mata Uang")}</span>
                </div>

                <div className="space-y-3">
                  {/* Currency selector */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">{t("importTariffCalc.currencyLabel", "Mata Uang")}</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-white"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Goods value input */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      {t("importTariffCalc.goodsValueLabel", "Nilai Barang")} ({t("importTariffCalc.inCurrency", "dalam")} {currency})
                    </label>
                    <div className="flex items-center gap-0 border border-slate-300 rounded-xl overflow-hidden focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
                      <span className="bg-slate-50 border-r border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 shrink-0">
                        {currency}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={goodsValue}
                        onChange={(e) => setGoodsValue(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 text-sm px-3 py-2.5 outline-none bg-white"
                      />
                    </div>
                  </div>

                  {/* Live conversion preview */}
                  {goodsValue && parseFloat(goodsValue) > 0 && ratesData && (
                    <div className="rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{t("importTariffCalc.convertToIdr", "Konversi ke IDR")}</p>
                          <p className="text-base font-bold text-sky-700 mt-0.5">
                            {idr(parseFloat(goodsValue) * (currentRate ?? 16200))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400">{t("importTariffCalc.rateUsed", "Kurs pakai")}</p>
                          <p className="text-xs font-semibold text-slate-600">
                            1 {currency} = {idr(currentRate ?? 16200)}
                          </p>
                          <p className={`text-[9px] mt-0.5 font-medium ${
                            ratesData.source === "bi_jisdor" ? "text-emerald-500"
                            : ratesData.source === "live" ? "text-sky-500"
                            : "text-amber-500"
                          }`}>
                            {ratesData.source === "bi_jisdor" ? "✓ JISDOR BI"
                             : ratesData.source === "live" ? "✓ Live"
                             : "⚠ Estimasi"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Incoterm */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-sky-600">3</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{t("importTariffCalc.step3Title", "Incoterm")} <span className="text-slate-400 font-normal text-xs">({t("importTariffCalc.step3Optional", "opsional, default CIF")})</span></span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {INCOTERMS.map((it) => (
                    <button
                      key={it.value}
                      onClick={() => setIncoterm(it.value)}
                      title={it.desc}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                        incoterm === it.value
                          ? "border-sky-500 bg-sky-50 text-sky-800"
                          : "border-slate-200 hover:border-sky-300 text-slate-600"
                      }`}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 px-0.5">
                  {INCOTERMS.find(it => it.value === incoterm)?.desc}
                </p>

                {needsFreight && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-slate-100">
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">{t("importTariffCalc.freightLabel", "Ongkir / Freight (IDR)")}</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={freightCost}
                        onChange={(e) => setFreightCost(e.target.value)}
                        placeholder={t("importTariffCalc.freightPlaceholder", "0")}
                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">{t("importTariffCalc.insuranceLabel", "Asuransi (%)")}</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={insurancePct}
                        onChange={(e) => setInsurancePct(e.target.value)}
                        placeholder="0.5"
                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Jenis Importir & FTA */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-sky-600">4</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{t("importTariffCalc.step4Title", "Jenis Importir & FTA")}</span>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">{t("importTariffCalc.importerTypeLabel", "Jenis Importir (PPh Pasal 22)")}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsApi(true)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                        isApi
                          ? "bg-green-600 text-white border-green-600"
                          : "border-slate-300 text-slate-600 hover:border-green-400"
                      }`}
                    >
                      API — 2.5%
                    </button>
                    <button
                      onClick={() => setIsApi(false)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                        !isApi
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-slate-300 text-slate-600 hover:border-orange-400"
                      }`}
                    >
                      Non-API — 7.5%
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {t("importTariffCalc.apiNote", "API = importir berlisensi (Angka Pengenal Importir). Non-API = perorangan/umum.")}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">{t("importTariffCalc.ftaRateLabel", "Skema Tarif FTA (Preferensi)")}</p>
                  <select
                    value={prefScheme}
                    onChange={(e) => setPrefScheme(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-white"
                  >
                    {PREFERENTIAL.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  {prefScheme && (
                    <p className="text-[10px] text-sky-600 mt-1.5">
                      {t("importTariffCalc.cooCertNote", "Memerlukan Certificate of Origin (COO) yang valid.")}
                    </p>
                  )}
                </div>
              </div>

              {/* Auto-calc indicator */}
              <div className="flex items-center gap-2 px-1">
                {calcMutation.isPending ? (
                  <div className="flex items-center gap-2 text-xs text-sky-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t("importTariffCalc.calculating", "Menghitung…")}</span>
                  </div>
                ) : canCalculate && result ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <Zap className="h-3.5 w-3.5" />
                    <span>{t("importTariffCalc.autoCalcActive", "Auto-hitung aktif")}</span>
                  </div>
                ) : canCalculate ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{t("importTariffCalc.calcSpinner", "Menunggu input…")}</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">{t("importTariffCalc.fillForm", "Isi HS Code dan nilai barang untuk mulai kalkulasi.")}</p>
                )}
              </div>

              {calcMutation.isError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{(calcMutation.error as Error).message}</p>
                </div>
              )}
            </div>

            {/* ── Kanan: Hasil Kalkulasi ── */}
            <div className="lg:col-span-3 space-y-5">
              {!result && !calcMutation.isPending && (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <Calculator className="h-7 w-7 text-slate-400" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700">{t("importTariffCalc.readyTitle", "Kalkulator Siap")}</h3>
                  <p className="text-sm text-slate-500 mt-1.5 max-w-xs">
                    {t("importTariffCalc.readyDesc", "Pilih HS Code dan isi nilai barang untuk menghitung BM, PPN, dan PPh secara otomatis.")}
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-left w-full max-w-sm">
                    {[
                      { icon: <Receipt className="h-4 w-4 text-blue-500" />, label: t("importTariffCalc.calcLabelBm", "Bea Masuk (BM)"), color: "bg-blue-50" },
                      { icon: <Banknote className="h-4 w-4 text-green-500" />, label: t("importTariffCalc.calcLabelPpn", "PPN Impor"), color: "bg-green-50" },
                      { icon: <Building2 className="h-4 w-4 text-orange-500" />, label: t("importTariffCalc.calcLabelPph", "PPh Pasal 22"), color: "bg-orange-50" },
                    ].map((item) => (
                      <div key={item.label} className={`${item.color} rounded-xl p-3 text-center`}>
                        <div className="flex justify-center mb-1.5">{item.icon}</div>
                        <p className="text-[10px] text-slate-600 font-medium leading-tight">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {calcMutation.isPending && (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-sky-500 animate-spin mb-3" />
                  <p className="text-sm text-slate-600">{t("importTariffCalc.calcLoading", "Menghitung tarif impor…")}</p>
                </div>
              )}

              {result && !calcMutation.isPending && (
                <>
                  {/* LARTAS warning */}
                  {result.lartas.hasLartas && (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-amber-800">
                              ⚠ {t("importTariffCalc.lartasWarning", "Barang Terkena LARTAS (Larangan & Pembatasan)")}
                            </p>
                            <button
                              onClick={() => setLartasOpen((v) => !v)}
                              className="text-xs text-amber-700 hover:underline flex items-center gap-1 shrink-0"
                            >
                              {t("importTariffCalc.lartasDetail", "Detail")}
                              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${lartasOpen ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                          <p className="text-xs text-amber-700 mt-0.5">
                            {t("importTariffCalc.lartasDesc", "Wajib memiliki izin khusus sebelum impor. Hubungi PPJK kami untuk asistensi.")}
                          </p>
                          {lartasOpen && (
                            <div className="mt-3 space-y-2 text-xs text-amber-800 bg-amber-100 rounded-xl p-3">
                              {result.lartas.description && (
                                <p><strong>{t("importTariffCalc.lartasKeterangan", "Keterangan")}:</strong> {result.lartas.description}</p>
                              )}
                              {result.lartas.regulator && (
                                <p><strong>{t("importTariffCalc.lartasRegulator", "Regulator")}:</strong> {result.lartas.regulator}</p>
                              )}
                              {!!result.lartas.perizinan && Array.isArray(result.lartas.perizinan) && (
                                <div>
                                  <strong>{t("importTariffCalc.lartasPerizinan", "Perizinan yang dibutuhkan")}:</strong>
                                  <ul className="mt-1 space-y-0.5 list-disc list-inside">
                                    {(result.lartas.perizinan as string[]).map((p, i) => (
                                      <li key={i}>{p}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <a
                                href={result.inswLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-amber-700 hover:underline mt-1"
                              >
                                <Globe className="h-3 w-3" />
                                {t("importTariffCalc.lartasInsw", "Cek detail di INSW")}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Identitas barang */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-sky-500" />
                          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">HS Code — BTKI 2022</span>
                        </div>
                        <p className="text-xl font-bold text-sky-700 font-mono">{result.hs.code}</p>
                        <p className="text-sm text-slate-800 mt-0.5">{result.hs.descriptionId}</p>
                        {result.hs.descriptionEn && (
                          <p className="text-xs text-slate-400 mt-0.5 italic">{result.hs.descriptionEn}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {result.hs.unit && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                              Satuan: {result.hs.unit}
                            </span>
                          )}
                          {result.hs.category && (
                            <span className="text-[10px] bg-sky-100 text-sky-700 rounded-full px-2 py-0.5">
                              {result.hs.category}
                            </span>
                          )}
                          {!result.lartas.hasLartas && (
                            <span className="text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 flex items-center gap-1">
                              <CheckCircle2 className="h-2.5 w-2.5" /> {t("importTariffCalc.noLartas", "Bebas LARTAS")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={exportCSV}
                          title={t("importTariffCalc.exportCsv", "Export CSV")}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={exportJSON}
                          title={t("importTariffCalc.exportJson", "Export JSON")}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Input summary */}
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      <div>
                        <span className="text-slate-400">{t("importTariffCalc.inputGoodsValueLabel", "Nilai Barang")}</span>
                        <p className="font-semibold text-slate-700">
                          {num(result.input.goodsValue, result.input.currency)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">{t("importTariffCalc.inputRateUsedLabel", "Kurs Dipakai")}</span>
                        <p className="font-semibold text-slate-700">
                          {idr(result.input.exchangeRate)} / {result.input.currency}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">{t("importTariffCalc.step3Title", "Incoterm")}</span>
                        <p className="font-semibold text-slate-700">{result.input.incoterm}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">{t("importTariffCalc.inputDutyScheme", "Skema Tarif BM")}</span>
                        <p className="font-semibold text-slate-700">{result.rates.bmScheme}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">{t("importTariffCalc.inputNdpbm", "NDPBM (CIF IDR)")}</span>
                        <p className="font-semibold text-sky-700">{idr(result.ndpbm)}</p>
                      </div>
                      {result.input.incotermNote && (
                        <div className="col-span-2 text-[10px] text-slate-400 italic">
                          {result.input.incotermNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Tabel Kalkulasi Pajak ── */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-800">{t("importTariffCalc.taxDetailTitle", "Rincian Kalkulasi Pajak Impor")}</h3>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-5 py-2.5">{t("importTariffCalc.tableColComponent", "Komponen")}</th>
                          <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-5 py-2.5">{t("importTariffCalc.tableColRate", "Tarif")}</th>
                          <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-5 py-2.5">{t("importTariffCalc.tableColAmount", "Jumlah (IDR)")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="px-5 py-3 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-300" />
                              {t("importTariffCalc.ndpbmLabel", "NDPBM (Nilai Dasar Perhitungan Bea Masuk)")}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right text-sm text-slate-400">—</td>
                          <td className="px-5 py-3 text-right text-sm font-medium text-slate-800">
                            {idr(result.ndpbm)}
                          </td>
                        </tr>
                        <tr className="bg-blue-50/40">
                          <td className="px-5 py-3 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-400" />
                              {t("importTariffCalc.calcLabelBm", "Bea Masuk (BM)")}
                            </div>
                            <p className="text-[10px] text-slate-400 ml-4 mt-0.5">
                              NDPBM × {result.rates.bm} [{result.rates.bmScheme}]
                            </p>
                          </td>
                          <td className="px-5 py-3 text-right text-sm text-blue-600 font-medium">{result.rates.bm}</td>
                          <td className="px-5 py-3 text-right text-sm font-semibold text-blue-700">
                            {idr(result.duties.bm)}
                          </td>
                        </tr>
                        <tr className="bg-green-50/40">
                          <td className="px-5 py-3 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              {t("importTariffCalc.calcLabelPpn", "PPN Impor")}
                            </div>
                            <p className="text-[10px] text-slate-400 ml-4 mt-0.5">
                              (NDPBM + BM) × {result.rates.ppn}
                            </p>
                          </td>
                          <td className="px-5 py-3 text-right text-sm text-green-600 font-medium">{result.rates.ppn}</td>
                          <td className="px-5 py-3 text-right text-sm font-semibold text-green-700">
                            {idr(result.duties.ppn)}
                          </td>
                        </tr>
                        {result.duties.ppnbm > 0 && (
                          <tr className="bg-purple-50/40">
                            <td className="px-5 py-3 text-sm text-slate-700">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-400" />
                                {t("importTariffCalc.calcLabelPpnbm", "PPnBM (Barang Mewah)")}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right text-sm text-purple-600 font-medium">{result.rates.ppnbm}</td>
                            <td className="px-5 py-3 text-right text-sm font-semibold text-purple-700">
                              {idr(result.duties.ppnbm)}
                            </td>
                          </tr>
                        )}
                        <tr className="bg-orange-50/40">
                          <td className="px-5 py-3 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-orange-400" />
                              PPh Pasal 22 {result.input.isApi ? "(API)" : "(Non-API)"}
                            </div>
                            <p className="text-[10px] text-slate-400 ml-4 mt-0.5">
                              (NDPBM + BM) × {result.rates.pphRate}%
                            </p>
                          </td>
                          <td className="px-5 py-3 text-right text-sm text-orange-600 font-medium">
                            {result.rates.pphRate}%
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-semibold text-orange-700">
                            {idr(result.duties.pph)}
                          </td>
                        </tr>
                        <tr className="border-t-2 border-slate-200 bg-slate-50">
                          <td className="px-5 py-3 text-sm font-bold text-slate-800">
                            {t("importTariffCalc.totalImportDuties", "Total Pungutan Impor")}
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-bold text-slate-600">
                            {result.duties.effectiveRate}
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-bold text-slate-900">
                            {idr(result.duties.totalDuties)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* DDP footer */}
                    <div className="bg-sky-600 px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-sky-200 uppercase tracking-wide">
                            {t("importTariffCalc.ddpTitle", "Total DDP (Landed Cost)")}
                          </p>
                          <p className="text-[10px] text-sky-300 mt-0.5">
                            {t("importTariffCalc.ddpDesc", "Nilai barang + semua pungutan impor")}
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">{idr(result.ddp)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tarif Preferensi */}
                  {Object.keys(result.preferential).length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-bold text-slate-800">{t("importTariffCalc.ftaTitle", "Tarif Preferensi FTA")}</span>
                        </div>
                        <button
                          onClick={() => setPrefOpen((v) => !v)}
                          className="text-xs text-sky-600 hover:underline flex items-center gap-1"
                        >
                          {prefOpen ? t("importTariffCalc.hide", "Sembunyikan") : t("importTariffCalc.showAll", "Tampilkan semua")}
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${prefOpen ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        {t("importTariffCalc.ftaDesc", "Jika memiliki Certificate of Origin (COO) yang valid, tarif BM bisa lebih rendah:")}
                      </p>
                      {prefOpen && (
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(result.preferential).map(([scheme, rate]) => (
                            <div
                              key={scheme}
                              className={`rounded-xl px-3 py-2 border text-xs ${
                                rate === "0%" || rate === "0.0%"
                                  ? "border-emerald-300 bg-emerald-50"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <p className="font-semibold text-slate-700">{scheme}</p>
                              <p className={`font-bold mt-0.5 ${
                                rate === "0%" || rate === "0.0%" ? "text-emerald-600" : "text-slate-600"
                              }`}>
                                BM: {rate ?? "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {!prefOpen && (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(result.preferential).slice(0, 5).map(([scheme, rate]) => (
                            <span
                              key={scheme}
                              className={`text-[10px] rounded-full px-2.5 py-1 font-semibold ${
                                rate === "0%" || rate === "0.0%"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {scheme}: {rate}
                            </span>
                          ))}
                          {Object.keys(result.preferential).length > 5 && (
                            <button
                              onClick={() => setPrefOpen(true)}
                              className="text-[10px] text-sky-500 hover:underline self-center"
                            >
                              +{Object.keys(result.preferential).length - 5} {t("importTariffCalc.more", "lainnya")}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                        <Info className="h-5 w-5 text-sky-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-sky-900">{t("importTariffCalc.ctaTitle", "Butuh Bantuan Pengurusan Impor?")}</p>
                        <p className="text-xs text-sky-700 mt-0.5">
                          {t("importTariffCalc.ctaDesc", "Tim PPJK kami siap membantu custom clearance, pengurusan dokumen, dan perhitungan biaya impor yang lebih akurat.")}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Link href="/pabean">
                            <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white text-xs gap-1.5 rounded-xl">
                              {t("importTariffCalc.consultButton", "Konsultasi Pabean")}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Link href="/custom-clearance">
                            <Button size="sm" variant="outline" className="text-xs gap-1.5 rounded-xl border-sky-300 text-sky-700">
                              {t("importTariffCalc.customClearanceButton", "Custom Clearance")}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center">
                    Sumber: {result.source} ·{" "}
                    <a href={result.btkiLink} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">
                      btki.kemenkeu.go.id
                    </a>
                    {" "}· {t("importTariffCalc.disclaimer", "Kalkulasi bersifat estimasi, hubungi PPJK untuk kepastian.")}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════ TAB: MULTI-HS ══════════════════ */}
        {activeTab === "multi" && (
          <div className="space-y-6">
            {/* Shared settings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-sky-500" />
                {t("importTariffCalc.multiSharedSettings", "Pengaturan Bersama")}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1.5">{t("importTariffCalc.currencyLabel", "Mata Uang")}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-sky-500 bg-white"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  {ratesData?.rates[currency] && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      1 {currency} = {idr(ratesData.rates[currency])}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1.5">Incoterm</label>
                  <select
                    value={incoterm}
                    onChange={(e) => setIncoterm(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-sky-500 bg-white"
                  >
                    {INCOTERMS.map((it) => (
                      <option key={it.value} value={it.value}>{it.value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1.5">{t("importTariffCalc.importerTypeShort", "Jenis Importir")}</label>
                  <select
                    value={isApi ? "api" : "nonapi"}
                    onChange={(e) => setIsApi(e.target.value === "api")}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-sky-500 bg-white"
                  >
                    <option value="api">API — 2.5%</option>
                    <option value="nonapi">Non-API — 7.5%</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1.5">{t("importTariffCalc.ftaSchemeLabel", "Skema FTA")}</label>
                  <select
                    value={prefScheme}
                    onChange={(e) => setPrefScheme(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-sky-500 bg-white"
                  >
                    {PREFERENTIAL.map((p) => (
                      <option key={p.value} value={p.value}>{p.value || "MFN (default)"}</option>
                    ))}
                  </select>
                </div>
              </div>
              {needsFreight && (
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">{t("importTariffCalc.sharedFreight", "Ongkir Bersama (IDR)")}</label>
                    <input type="number" min="0" value={freightCost} onChange={(e) => setFreightCost(e.target.value)}
                      placeholder="0" className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-sky-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">{t("importTariffCalc.insurancePctLabel", "Asuransi (%)")}</label>
                    <input type="number" min="0" max="5" step="0.1" value={insurancePct} onChange={(e) => setInsurancePct(e.target.value)}
                      placeholder="0.5" className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-sky-500" />
                  </div>
                </div>
              )}
            </div>

            {/* HS Code list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  {t("importTariffCalc.hsListTitle", "Daftar HS Code")} ({multiItems.length}/10)
                </h3>
                <button
                  onClick={addMultiItem}
                  disabled={multiItems.length >= 10}
                  className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 disabled:text-slate-400 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("importTariffCalc.addHsCode", "Tambah HS Code")}
                </button>
              </div>

              {multiItems.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                  <BarChart3 className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">{t("importTariffCalc.emptyHsList", "Belum ada HS Code. Klik Tambah HS Code untuk mulai.")}</p>
                </div>
              )}

              {multiItems.map((item, idx) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateMultiItem(item.id, { label: e.target.value })}
                      placeholder={`Label (opsional) — mis. Barang A`}
                      className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-sky-500"
                    />
                    <button onClick={() => removeMultiItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {/* HS Code search */}
                    <div className="relative">
                      {item.selectedHs ? (
                        <div className="flex items-center gap-2 border border-sky-200 bg-sky-50 rounded-xl px-3 py-2">
                          <span className="text-xs font-mono font-bold text-sky-700">{item.selectedHs.hsCode}</span>
                          <span className="text-xs text-slate-600 flex-1 truncate">{item.selectedHs.descriptionId}</span>
                          <button onClick={() => updateMultiItem(item.id, { selectedHs: null, searchInput: "", hsCode: "" })}
                            className="text-slate-400 hover:text-slate-600 shrink-0">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 border border-slate-300 rounded-xl px-3 py-2 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-100">
                            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              value={item.searchInput}
                              onChange={(e) => {
                                updateMultiItem(item.id, { searchInput: e.target.value, searchOpen: true });
                                searchForItem(item.id, e.target.value);
                              }}
                              onFocus={() => updateMultiItem(item.id, { searchOpen: true })}
                              placeholder="Cari HS Code…"
                              className="flex-1 text-xs outline-none placeholder-slate-400"
                            />
                          </div>
                          {item.searchOpen && multiSearchData[item.id]?.results?.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                              {multiSearchData[item.id].results.map((r) => (
                                <button
                                  key={r.hsCode}
                                  onClick={() => {
                                    updateMultiItem(item.id, { selectedHs: r, hsCode: r.hsCode, searchInput: r.hsCode, searchOpen: false });
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-sky-50 border-b border-slate-100 last:border-0 text-xs"
                                >
                                  <span className="font-mono font-bold text-sky-700">{r.hsCode}</span>
                                  <span className="text-slate-600 ml-2 truncate">{r.descriptionId}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Goods value */}
                    <div className="flex items-center gap-0 border border-slate-300 rounded-xl overflow-hidden focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-100">
                      <span className="bg-slate-50 border-r border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 shrink-0">
                        {currency}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.goodsValue}
                        onChange={(e) => updateMultiItem(item.id, { goodsValue: e.target.value })}
                        placeholder={t("importTariffCalc.goodsValuePlaceholder", "Nilai barang")}
                        className="flex-1 text-xs px-3 py-2 outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculate button */}
            {multiItems.length > 0 && (
              <Button
                onClick={() => multiCalcMutation.mutate()}
                disabled={multiCalcMutation.isPending || multiItems.filter(i => i.selectedHs && i.goodsValue).length === 0}
                className="w-full h-11 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white gap-2"
              >
                {multiCalcMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {t("importTariffCalc.calculating", "Menghitung…")} {multiItems.filter(i => i.selectedHs && i.goodsValue).length} HS Code…</>
                ) : (
                  <><BarChart3 className="h-4 w-4" /> {t("importTariffCalc.compareButton", "Bandingkan")} {multiItems.filter(i => i.selectedHs && i.goodsValue).length} HS Code</>
                )}
              </Button>
            )}

            {multiCalcMutation.isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <p className="text-xs text-red-700">{(multiCalcMutation.error as Error).message}</p>
              </div>
            )}

            {/* Multi results table */}
            {multiResults.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">{t("importTariffCalc.multiTableTitle", "Tabel Perbandingan Pajak Impor")}</h3>
                  <button
                    onClick={exportMultiCSV}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {t("importTariffCalc.exportCsvBtn", "Export CSV")}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5 sticky left-0 bg-slate-50">HS Code / Label</th>
                        <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5">Nilai ({currency})</th>
                        <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5">NDPBM</th>
                        <th className="text-right text-[11px] font-semibold text-blue-500 uppercase tracking-wide px-4 py-2.5">BM</th>
                        <th className="text-right text-[11px] font-semibold text-green-500 uppercase tracking-wide px-4 py-2.5">PPN</th>
                        <th className="text-right text-[11px] font-semibold text-orange-500 uppercase tracking-wide px-4 py-2.5">PPh</th>
                        <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5">Total</th>
                        <th className="text-right text-[11px] font-semibold text-sky-600 uppercase tracking-wide px-4 py-2.5">DDP</th>
                        <th className="text-center text-[11px] font-semibold text-amber-500 uppercase tracking-wide px-4 py-2.5">LARTAS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {multiResults.map((r, i) => (
                        <tr key={i} className={i % 2 === 0 ? "" : "bg-slate-50/50"}>
                          {!r || !r.ok ? (
                            <>
                              <td className="px-4 py-3 text-sm">
                                <p className="font-mono text-xs text-slate-600">{r?.label ?? "—"}</p>
                                <p className="text-xs text-red-500 mt-0.5">{(r as { error?: string })?.error ?? "Error"}</p>
                              </td>
                              <td className="px-4 py-3 text-center text-slate-400 text-xs" colSpan={8}>—</td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 sticky left-0 bg-inherit">
                                <p className="font-mono text-xs font-bold text-sky-700">{r.hs.code}</p>
                                <p className="text-xs text-slate-600 mt-0.5 max-w-[180px] truncate" title={r.hs.descriptionId}>
                                  {r.label !== r.hs.code ? r.label : r.hs.descriptionId}
                                </p>
                                <p className="text-[10px] text-slate-400">{r.rates.bmScheme}</p>
                              </td>
                              <td className="px-4 py-3 text-right text-xs text-slate-700">
                                {num(r.input.goodsValue, r.input.currency)}
                              </td>
                              <td className="px-4 py-3 text-right text-xs text-slate-700">{idr(r.ndpbm)}</td>
                              <td className="px-4 py-3 text-right text-xs text-blue-700 font-medium">{idr(r.duties.bm)}</td>
                              <td className="px-4 py-3 text-right text-xs text-green-700 font-medium">{idr(r.duties.ppn)}</td>
                              <td className="px-4 py-3 text-right text-xs text-orange-700 font-medium">{idr(r.duties.pph)}</td>
                              <td className="px-4 py-3 text-right text-xs font-semibold text-slate-800">
                                {idr(r.duties.totalDuties)}
                                <span className="block text-[10px] text-slate-400 font-normal">{r.duties.effectiveRate}</span>
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-bold text-sky-700">{idr(r.ddp)}</td>
                              <td className="px-4 py-3 text-center">
                                {r.lartas.hasLartas ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-bold">YA</span>
                                ) : (
                                  <span className="text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-bold">-</span>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary bar: find min DDP */}
                {multiResults.filter(r => r && r.ok).length > 1 && (() => {
                  const valid = multiResults.filter(r => r && r.ok) as (CalcResult & { label: string; ok: boolean })[];
                  const minDdp = valid.reduce((a, b) => a.ddp < b.ddp ? a : b);
                  return (
                    <div className="bg-emerald-50 border-t border-emerald-100 px-5 py-3 flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <p className="text-xs text-emerald-800">
                        <strong>{t("importTariffCalc.lowestLandedCost", "Landed cost terendah")}:</strong> {minDdp.label !== minDdp.hs.code ? minDdp.label : minDdp.hs.code} — {idr(minDdp.ddp)} (effective rate {minDdp.duties.effectiveRate})
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
