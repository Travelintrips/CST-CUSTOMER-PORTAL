export interface PriceBreakdownProps {
  subtotal?: number | null;
  taxRate?: number | null;
  taxAmount?: number | null;
  grandTotal?: number | null;
  currency?: string;
  className?: string;
  subtotalLabel?: string;
  grandTotalLabel?: string;
  note?: string;
  variant?: "default" | "indigo" | "compact";
}

function fmt(n: number, currency: string) {
  return `${currency} ${Math.round(n).toLocaleString("id-ID")}`;
}

export function PriceBreakdown({
  subtotal,
  taxRate = 11,
  taxAmount,
  grandTotal,
  currency = "IDR",
  className = "",
  subtotalLabel = "Subtotal",
  grandTotalLabel = "Grand Total",
  note,
  variant = "default",
}: PriceBreakdownProps) {
  const rate = taxRate ?? 11;

  const derivedSubtotal =
    subtotal ??
    (grandTotal != null && taxAmount != null
      ? grandTotal - taxAmount
      : grandTotal != null
      ? Math.round((grandTotal * 100) / (100 + rate))
      : null);

  const derivedTaxAmount =
    taxAmount ??
    (derivedSubtotal != null ? Math.round((derivedSubtotal * rate) / 100) : null);

  const derivedGrandTotal =
    grandTotal ??
    (derivedSubtotal != null && derivedTaxAmount != null
      ? derivedSubtotal + derivedTaxAmount
      : null);

  if (derivedGrandTotal == null) return null;

  if (variant === "compact") {
    return (
      <div className={`text-xs space-y-0.5 ${className}`}>
        {derivedSubtotal != null && (
          <div className="flex justify-between text-slate-500">
            <span>{subtotalLabel}</span>
            <span>{fmt(derivedSubtotal, currency)}</span>
          </div>
        )}
        {derivedTaxAmount != null && (
          <div className="flex justify-between text-slate-500">
            <span>PPN {rate}%</span>
            <span>{fmt(derivedTaxAmount, currency)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-slate-800 pt-0.5 border-t border-slate-200">
          <span>{grandTotalLabel}</span>
          <span>{fmt(derivedGrandTotal, currency)}</span>
        </div>
        {note && <p className="text-[10px] text-slate-400 pt-0.5">{note}</p>}
      </div>
    );
  }

  if (variant === "indigo") {
    return (
      <div className={`rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-2 text-sm ${className}`}>
        {derivedSubtotal != null && (
          <div className="flex justify-between text-slate-600 text-xs">
            <span>{subtotalLabel}</span>
            <span>{fmt(derivedSubtotal, currency)}</span>
          </div>
        )}
        {derivedTaxAmount != null && (
          <div className="flex justify-between text-slate-500 text-xs">
            <span>PPN {rate}%</span>
            <span>{fmt(derivedTaxAmount, currency)}</span>
          </div>
        )}
        <div className="h-px bg-indigo-200" />
        <div className="flex justify-between font-semibold text-indigo-800">
          <span>{grandTotalLabel}</span>
          <span>{fmt(derivedGrandTotal, currency)}</span>
        </div>
        {note && <p className="text-[11px] text-slate-400">{note}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 pt-2 border-t border-slate-100 ${className}`}>
      {derivedSubtotal != null && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>{subtotalLabel}</span>
          <span>{fmt(derivedSubtotal, currency)}</span>
        </div>
      )}
      {derivedTaxAmount != null && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>PPN {rate}%</span>
          <span>{fmt(derivedTaxAmount, currency)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm font-bold text-slate-800 pt-1 border-t border-slate-100">
        <span>{grandTotalLabel}</span>
        <span>{fmt(derivedGrandTotal, currency)}</span>
      </div>
      {note && <p className="text-[10px] text-slate-400">{note}</p>}
    </div>
  );
}
