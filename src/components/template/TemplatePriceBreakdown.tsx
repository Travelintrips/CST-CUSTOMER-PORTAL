export type PriceRole = "customer" | "vendor" | "admin";

interface Props {
  role: PriceRole;
  basePrice?: number;
  sellingPrice?: number;
  qty?: number;
  unit?: string;
  currency?: string;
  ppnRate?: number;
  hint?: string;
}

import { useLanguage } from "@/i18n/LanguageContext";

function fmtIDR(n: number) {
  return n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
}

function fmt(n: number, currency: string) {
  return currency === "IDR" ? fmtIDR(n) : n.toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " " + currency;
}

export function TemplatePriceBreakdown({
  role,
  basePrice = 0,
  sellingPrice,
  qty = 1,
  unit = "Ls",
  currency = "IDR",
  ppnRate = 0.11,
  hint,
}: Props) {
  const { t } = useLanguage();

  const subtotalBase = qty * basePrice;
  const ppnBase = Math.round(subtotalBase * ppnRate * 100) / 100;
  const totalBase = subtotalBase + ppnBase;

  const subtotalSell = sellingPrice != null ? qty * sellingPrice : null;
  const ppnSell = subtotalSell != null ? Math.round(subtotalSell * ppnRate * 100) / 100 : null;
  const totalSell = subtotalSell != null && ppnSell != null ? subtotalSell + ppnSell : null;

  const margin = subtotalSell != null && subtotalBase > 0 ? subtotalSell - subtotalBase : null;
  const marginPct =
    margin != null && subtotalBase > 0 ? ((margin / subtotalBase) * 100).toFixed(1) : null;

  const ppnLabel = `${t("cartDrawer.ppn", "PPN")} ${Math.round(ppnRate * 100)}%`;

  if (role === "vendor" && subtotalBase <= 0) return null;
  if (role === "customer" && !subtotalSell) return null;
  if (role === "admin" && subtotalBase <= 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
        {role === "vendor"
          ? t("tmpl.priceBase", "💰 Ringkasan Harga Dasar")
          : role === "customer"
          ? t("tmpl.priceDetail", "💰 Rincian Harga")
          : t("tmpl.priceAnalysis", "💰 Analisa Harga")}
      </h2>
      {hint && <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">{hint}</p>}

      {role === "vendor" && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>{qty} {unit} × {fmt(basePrice, currency)}</span>
            <span className="font-medium">{fmt(subtotalBase, currency)}</span>
          </div>
          <div className="flex justify-between text-slate-500 text-xs">
            <span>{ppnLabel}</span>
            <span>{fmt(ppnBase, currency)}</span>
          </div>
          <div className="h-px bg-indigo-200 my-1" />
          <div className="flex justify-between font-semibold text-indigo-800">
            <span>{t("tmpl.totalWithPPN", "Total (dengan PPN)")}</span>
            <span>{fmt(totalBase, currency)}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {t("tmpl.vendorBaseNote", "* Harga dasar Anda. Harga jual ke customer ditentukan admin.")}
          </p>
        </div>
      )}

      {role === "customer" && subtotalSell != null && ppnSell != null && totalSell != null && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>{qty} {unit} × {fmt(sellingPrice!, currency)}</span>
            <span className="font-medium">{fmt(subtotalSell, currency)}</span>
          </div>
          <div className="flex justify-between text-slate-500 text-xs">
            <span>{ppnLabel}</span>
            <span>{fmt(ppnSell, currency)}</span>
          </div>
          <div className="h-px bg-emerald-200 my-1" />
          <div className="flex justify-between font-semibold text-emerald-800">
            <span>{t("tmpl.totalInclPPN", "Total (termasuk PPN)")}</span>
            <span>{fmt(totalSell, currency)}</span>
          </div>
        </div>
      )}

      {role === "admin" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 space-y-2 text-sm">
            <p className="text-xs font-semibold text-orange-700 mb-2">{t("tmpl.vendorBasePrice", "Harga Dasar (Vendor)")}</p>
            <div className="flex justify-between text-slate-600">
              <span>{qty} {unit} × {fmt(basePrice, currency)}</span>
              <span className="font-medium">{fmt(subtotalBase, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-xs">
              <span>{ppnLabel}</span>
              <span>{fmt(ppnBase, currency)}</span>
            </div>
            <div className="flex justify-between font-semibold text-orange-800">
              <span>{t("tmpl.baseTotal", "Total Dasar")}</span>
              <span>{fmt(totalBase, currency)}</span>
            </div>
          </div>

          {subtotalSell != null && ppnSell != null && totalSell != null && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 space-y-2 text-sm">
              <p className="text-xs font-semibold text-emerald-700 mb-2">{t("tmpl.customerSellPrice", "Harga Jual (Customer)")}</p>
              <div className="flex justify-between text-slate-600">
                <span>{qty} {unit} × {fmt(sellingPrice!, currency)}</span>
                <span className="font-medium">{fmt(subtotalSell, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-xs">
                <span>{ppnLabel}</span>
                <span>{fmt(ppnSell, currency)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-800">
                <span>{t("tmpl.sellTotal", "Total Jual")}</span>
                <span>{fmt(totalSell, currency)}</span>
              </div>
            </div>
          )}

          {margin != null && marginPct != null && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">{t("tmpl.margin", "Margin")}</span>
              <div className="text-right">
                <div className="font-bold text-blue-800">{fmt(margin, currency)}</div>
                <div className="text-xs text-blue-600">{marginPct}%</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
