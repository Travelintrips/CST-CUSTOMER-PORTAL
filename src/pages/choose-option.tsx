// [MULTI-MODE] Halaman customer memilih opsi anonim (Opsi 1, Opsi 2, ...)
import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, Truck, Ship, Plane, MapPin, Package, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

function formatTanggal(iso: string | null, locale = "id-ID"): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  try {
    return new Date(`${y}-${m}-${d}T00:00:00`).toLocaleDateString(locale, {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return iso;
  }
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
function apiUrl(path: string) { return `${BASE}${path}`; }

function getTokenFromUrl(): string {
  const parts = window.location.pathname.split("/");
  return decodeURIComponent(parts[parts.length - 1] ?? "");
}

interface Option {
  id: number;
  label: string;
  price: number;
  vehicleYear: number | null;
  truckType: string | null;
  carrierInfo: string | null;
  transitDays: number | null;
  notes: string | null;
  status: string;
  isChosen: boolean;
}

interface OptionFormData {
  orderNumber: string;
  origin: string;
  destination: string;
  commodity: string | null;
  pickupDate: string | null;
  pickupTime: string | null;
  truckType: string | null;
  transportMode: string | null;
  originPort: string | null;
  destPort: string | null;
  etd: string | null;
  eta: string | null;
  isTrucking: boolean;
  alreadyChosen: boolean;
  options: Option[];
}

const fmt = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

export default function ChooseOptionPage() {
  const { t, locale } = useLanguage();
  const token = getTokenFromUrl();
  const [data, setData] = useState<OptionFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [choosing, setChoosing] = useState<number | null>(null);
  const [chosen, setChosen] = useState<{ label: string; price: number } | null>(null);

  useEffect(() => {
    if (!token) { setError(t("chooseOption.invalidToken")); setLoading(false); return; }
    fetch(apiUrl(`/api/logistic/orders/choose-option-form/${encodeURIComponent(token)}`))
      .then((r) => r.ok ? r.json() : r.json().then((e: { message?: string }) => { throw new Error(e.message ?? "Error"); }))
      .then((d: OptionFormData) => { setData(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [token, t]);

  async function handleChoose(optionId: number, label: string, price: number) {
    setChoosing(optionId);
    try {
      const res = await fetch(apiUrl("/api/logistic/orders/choose-option"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, optionId }),
      });
      const body = await res.json() as { ok?: boolean; message?: string; chosenLabel?: string; price?: number };
      if (!res.ok) throw new Error(body.message ?? t("chooseOption.failedChoice"));
      setChosen({ label, price });
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setChoosing(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-slate-500 text-sm">{t("chooseOption.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="font-bold text-slate-800">{t("chooseOption.invalidLink")}</h2>
          <p className="text-sm text-slate-500">{error ?? t("chooseOption.linkExpired")}</p>
        </div>
      </div>
    );
  }

  if (chosen || data.alreadyChosen) {
    const chosenOpt = data.options.find((o) => o.isChosen);
    const displayLabel = chosen?.label ?? chosenOpt?.label ?? "Opsi";
    const displayPrice = chosen?.price ?? chosenOpt?.price ?? 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
          <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
          <h2 className="font-bold text-xl text-slate-800">{t("chooseOption.choiceMade")}</h2>
          <div className="bg-green-50 rounded-xl p-4 space-y-1">
            <p className="text-sm text-slate-500">{t("chooseOption.youChose")}</p>
            <p className="font-bold text-lg text-green-700">{displayLabel}</p>
            <p className="font-mono text-xl font-bold text-slate-800">{fmt(displayPrice)}</p>
          </div>
          <p className="text-sm text-slate-500">{t("chooseOption.contactSoon")}</p>
          <p className="text-xs text-slate-400">{t("chooseOption.orderRef")} {data.orderNumber}</p>
        </div>
      </div>
    );
  }

  const ModeIcon = data.transportMode === "SEA_FREIGHT" ? Ship
    : data.transportMode === "AIR_FREIGHT" ? Plane
    : data.isTrucking ? Truck
    : data.options[0]?.transitDays != null ? Ship : Plane;
  const modeLabel = data.transportMode === "SEA_FREIGHT" ? "Sea Freight"
    : data.transportMode === "AIR_FREIGHT" ? "Air Freight"
    : "Trucking";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Back button */}
        <div>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-white/80 hover:bg-white border border-slate-200 transition-all shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t("common.back")}
          </button>
        </div>
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
            <ModeIcon className="h-4 w-4" />
            {modeLabel}
          </div>
          <h1 className="text-xl font-bold text-slate-800">{t("chooseOption.offerTitle")}</h1>
          <p className="text-sm text-slate-500">{t("chooseOption.offerSubtitle")}</p>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">{t("chooseOption.routeLabel")}</p>
              <p className="font-medium text-slate-700">{data.origin} → {data.destination}</p>
            </div>
          </div>
          {data.isTrucking && data.pickupDate && (
            <div className="flex items-start gap-3">
              <Truck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{t("chooseOption.pickupLabel")}</p>
                <p className="font-medium text-slate-700">
                  {formatTanggal(data.pickupDate, locale)}{data.pickupTime ? ` · ${data.pickupTime} WIB` : ""}
                </p>
              </div>
            </div>
          )}
          {data.truckType && (
            <div className="flex items-start gap-3">
              <Truck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{t("chooseOption.unitType")}</p>
                <p className="font-medium text-slate-700">{data.truckType}</p>
              </div>
            </div>
          )}
          {!data.isTrucking && (data.originPort || data.destPort) && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{t("chooseOption.portAirport")}</p>
                <p className="font-medium text-slate-700">
                  {[data.originPort, data.destPort].filter(Boolean).join(" → ")}
                </p>
              </div>
            </div>
          )}
          {!data.isTrucking && (data.etd || data.eta) && (
            <div className="flex items-start gap-3">
              <Plane className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{t("chooseOption.etdEta")}</p>
                <p className="font-medium text-slate-700">
                  {data.etd ? formatTanggal(data.etd, locale) : "—"} → {data.eta ? formatTanggal(data.eta, locale) : "—"}
                </p>
              </div>
            </div>
          )}
          {data.commodity && (
            <div className="flex items-start gap-3">
              <Package className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{t("chooseOption.commodity")}</p>
                <p className="font-medium text-slate-700">{data.commodity}</p>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400">{t("chooseOption.orderNo")}: {data.orderNumber}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            {data.options.length} {t("chooseOption.optionsCount")}
          </p>
          {data.options.map((opt, i) => (
            <div
              key={opt.id}
              className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${
                opt.isChosen ? "border-green-400 bg-green-50" : "border-transparent hover:border-blue-200"
              }`}
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      i === 0 ? "bg-blue-100 text-blue-700" :
                      i === 1 ? "bg-purple-100 text-purple-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {opt.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{fmt(opt.price)}</p>
                    <p className="text-xs text-slate-400">{t("chooseOption.includedFees")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {data.isTrucking && opt.vehicleYear && (
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-400">{t("chooseOption.vehicleYear")}</p>
                      <p className="font-semibold text-slate-700">{opt.vehicleYear}</p>
                    </div>
                  )}
                  {!data.isTrucking && opt.transitDays && (
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-400">{t("chooseOption.transitTime")}</p>
                      <p className="font-semibold text-slate-700">{opt.transitDays} {t("chooseOption.days")}</p>
                    </div>
                  )}
                  {opt.carrierInfo && (
                    <div className="bg-slate-50 rounded-lg px-3 py-2 col-span-2">
                      <p className="text-xs text-slate-400">{t("chooseOption.info")}</p>
                      <p className="font-semibold text-slate-700">{opt.carrierInfo}</p>
                    </div>
                  )}
                  {opt.notes && (
                    <div className="bg-amber-50 rounded-lg px-3 py-2 col-span-2">
                      <p className="text-xs text-amber-500">{t("chooseOption.notes")}</p>
                      <p className="text-sm text-slate-700">{opt.notes}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleChoose(opt.id, opt.label, opt.price)}
                  disabled={choosing !== null}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    choosing === opt.id
                      ? "bg-blue-400 text-white"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-200"
                  }`}
                >
                  {choosing === opt.id ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> {t("chooseOption.processing")}</>
                  ) : (
                    <>{t("chooseOption.choose")} {opt.label}</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 pb-4">
          {t("chooseOption.confirmText")}
          <br />{t("chooseOption.priceNote")}
        </p>
      </div>
    </div>
  );
}
