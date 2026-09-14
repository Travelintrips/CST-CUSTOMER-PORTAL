import { useState } from "react";
import { useLocation } from "wouter";
import { COMPANY_CONFIG } from "@/config/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
// C1: auth via cookie (credentials: "include") — localStorage Bearer removed
import { useGetPortalMe, getGetPortalMeQueryKey } from "@shared/api-client-react";
import {
  Ship, ArrowLeft, RefreshCw, CheckCircle2, MapPin,
  User, Loader2, Package, ChevronDown, Anchor, Send,
  Clock, Info, Globe,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import PageSeo from "@/components/PageSeo";
import { useLanguage } from "@/i18n/LanguageContext";

/* ─── Types ──────────────────────────────────────────────── */
interface EstimateOption {
  estimate_option: string;
  rate_id: number;
  carrier: string;
  route: string;
  shipment_type: string;
  container_type: string | null;
  transit_days: number | null;
  direct_or_transshipment: string;
  base_ocean_freight: number;
  origin_charges: number;
  destination_charges: number;
  document_charges: number;
  trucking_charges: number;
  customs_charges: number;
  surcharge_breakdown: Record<string, number>;
  total_estimate: number;
  currency: string;
  total_estimate_idr: number;
  exchange_rate_to_idr: number;
  price_status: string;
  validity: string;
}

/* ─── Module-level static data (no hardcoded display text) ── */
const OPTION_META: Record<string, { labelKey: string; badgeCls: string; descKey: string }> = {
  economy:  { labelKey: "oceanFreightBooking.optionEconomy",  badgeCls: "bg-green-50 text-green-700",  descKey: "oceanFreightBooking.optionEconomyDesc" },
  standard: { labelKey: "oceanFreightBooking.optionStandard", badgeCls: "bg-blue-50 text-blue-700",    descKey: "oceanFreightBooking.optionStandardDesc" },
  priority: { labelKey: "oceanFreightBooking.optionPriority", badgeCls: "bg-orange-50 text-orange-700",descKey: "oceanFreightBooking.optionPriorityDesc" },
};

const PORTS = [
  "Tanjung Priok","Tanjung Perak","Tanjung Emas","Soekarno-Hatta Makassar",
  "Belawan","Kariangau","Dwikora","PSA Singapore","Port Klang",
  "Penang Port","Laem Chabang","Yangshan","Ningbo","Kwai Tsing",
  "Busan New Port","Tokyo Port","Jebel Ali","Rotterdam","Hamburg","Long Beach",
];
const CONTAINER_TYPES = ["20ft","40ft","40HC","Reefer 20ft","Reefer 40ft","Open Top","Flat Rack"];
const TRADE_TYPES = [
  { v:"export",       labelKey:"oceanFreightBooking.tradeTypeExport"      },
  { v:"import",       labelKey:"oceanFreightBooking.tradeTypeImport"      },
  { v:"domestic",     labelKey:"oceanFreightBooking.tradeTypeDomestic"    },
  { v:"cross_border", labelKey:"oceanFreightBooking.tradeTypeCrossBorder" },
];
const SERVICE_MODES = [
  { v:"port_to_port", labelKey:"oceanFreightBooking.serviceModePortPort" },
  { v:"door_to_port", labelKey:"oceanFreightBooking.serviceModeDoorPort" },
  { v:"port_to_door", labelKey:"oceanFreightBooking.serviceModePortDoor" },
  { v:"door_to_door", labelKey:"oceanFreightBooking.serviceModeDoorDoor" },
];
const CARGO_CONDITIONS = [
  { v:"general",    labelKey:"oceanFreightBooking.cargoGeneral"   },
  { v:"dg",         labelKey:"oceanFreightBooking.cargoDG"        },
  { v:"reefer",     labelKey:"oceanFreightBooking.cargoReefer"    },
  { v:"fragile",    labelKey:"oceanFreightBooking.cargoFragile"   },
  { v:"oversize",   labelKey:"oceanFreightBooking.cargoOversize"  },
  { v:"high_value", labelKey:"oceanFreightBooking.cargoHighValue" },
];
const ADDITIONAL_SERVICES = [
  { v:"trucking_pickup",    labelKey:"oceanFreightBooking.addonTruckingPickup"   },
  { v:"trucking_delivery",  labelKey:"oceanFreightBooking.addonTruckingDelivery" },
  { v:"customs_clearance",  labelKey:"oceanFreightBooking.addonCustoms"          },
  { v:"insurance",          labelKey:"oceanFreightBooking.addonInsurance"        },
  { v:"fumigation",         labelKey:"oceanFreightBooking.addonFumigation"       },
  { v:"coo_certificate",    labelKey:"oceanFreightBooking.addonCOO"              },
  { v:"warehouse_handling", labelKey:"oceanFreightBooking.addonWarehouse"        },
];

/* shared style tokens */
const inputCls  = "bg-white border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all";
const labelCls  = "block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5";
const cardCls   = "bg-white rounded-2xl border border-slate-100 overflow-hidden";
const cardShadow= { boxShadow: "0 2px 16px rgba(15,23,42,0.06)" };

/* ─── Main Component ─────────────────────────────────────── */
export default function OceanFreightBookingPage() {
  const [, setLocation] = useLocation();
  const { toast }       = useToast();
  const { data: me }    = useGetPortalMe({ query: { retry: false, queryKey: getGetPortalMeQueryKey() } });
  const { t, locale }   = useLanguage();

  /* RC-6: locale-aware formatters — inside component so locale is available */
  const IDR = (n: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  const fmtNum = (n: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);

  const [step, setStep]               = useState<"form"|"results"|"inquiry"|"success">("form");
  const [loading, setLoading]         = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Route
  const [originCity,     setOriginCity]     = useState("Jakarta");
  const [originPort,     setOriginPort]     = useState("Tanjung Priok");
  const [destCity,       setDestCity]       = useState("");
  const [destPort,       setDestPort]       = useState("");
  const [tradeType,      setTradeType]      = useState("export");
  const [serviceMode,    setServiceMode]    = useState("port_to_port");

  // Cargo
  const [shipmentType,   setShipmentType]   = useState("FCL");
  const [containerType,  setContainerType]  = useState("20ft");
  const [containerQty,   setContainerQty]   = useState(1);
  const [totalCbm,       setTotalCbm]       = useState("");
  const [grossWeight,    setGrossWeight]    = useState("");
  const [koli,           setKoli]           = useState("");
  const [commodity,      setCommodity]      = useState("");
  const [cargoCondition, setCargoCondition] = useState("general");
  const [incoterm,       setIncoterm]       = useState("");
  const [etdPreferred,   setEtdPreferred]   = useState("");
  const [selectedSvc,    setSelectedSvc]    = useState<string[]>([]);
  const toggleSvc = (v: string) => setSelectedSvc(prev =>
    prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  // Results
  const [options,        setOptions]        = useState<EstimateOption[]>([]);
  const [noRates,        setNoRates]        = useState(false);
  const [selectedOption, setSelectedOption] = useState<EstimateOption | null>(null);
  const [showBreakdown,  setShowBreakdown]  = useState(false);

  // Inquiry
  const [custName,    setCustName]    = useState((me as any)?.name ?? "");
  const [custPhone,   setCustPhone]   = useState((me as any)?.phone ?? "");
  const [custEmail,   setCustEmail]   = useState((me as any)?.email ?? "");
  const [custCompany, setCustCompany] = useState("");

  async function handleCalculate() {
    if (!originPort || !destPort) { toast({ title: t("oceanFreightBooking.errorFillPorts"), variant: "destructive" }); return; }
    if (shipmentType === "FCL" && !containerType) { toast({ title: t("oceanFreightBooking.errorSelectContainer"), variant: "destructive" }); return; }
    if (shipmentType === "LCL" && !totalCbm && !grossWeight) { toast({ title: t("oceanFreightBooking.errorFillCbm"), variant: "destructive" }); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/ocean-freight/calculate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_city: originCity, origin_port: originPort,
          destination_city: destCity, destination_port: destPort,
          trade_type: tradeType, service_mode: serviceMode, shipment_type: shipmentType,
          container_type: shipmentType === "FCL" ? containerType : null,
          container_qty:  shipmentType === "FCL" ? containerQty  : 1,
          total_cbm: totalCbm ? Number(totalCbm) : null,
          gross_weight: grossWeight ? Number(grossWeight) : null,
          cargo_condition: cargoCondition,
          selected_additional_services: selectedSvc,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (!d.options?.length) { setNoRates(true); setOptions([]); }
      else { setOptions(d.options); setNoRates(false); }
      setStep("results");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  }

  async function handleSubmitInquiry() {
    if (!custName) { toast({ title: t("oceanFreightBooking.errorNameRequired"), variant: "destructive" }); return; }
    if (!custPhone && !custEmail) { toast({ title: t("oceanFreightBooking.errorContactRequired"), variant: "destructive" }); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/ocean-freight/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          origin_city: originCity, origin_port: originPort,
          destination_city: destCity, destination_port: destPort,
          trade_type: tradeType, service_mode: serviceMode, shipment_type: shipmentType,
          container_type: shipmentType === "FCL" ? containerType : null,
          container_qty:  shipmentType === "FCL" ? containerQty  : 1,
          total_cbm: totalCbm ? Number(totalCbm) : null,
          gross_weight: grossWeight ? Number(grossWeight) : null,
          koli: koli ? Number(koli) : null,
          commodity, cargo_condition: cargoCondition,
          incoterm, etd_preferred: etdPreferred,
          selected_additional_services: selectedSvc,
          estimated_price_idr: selectedOption?.total_estimate_idr ?? null,
          currency: selectedOption?.currency ?? "IDR",
          pricing_breakdown: selectedOption ?? null,
          candidate_rate_ids: options.map(o => o.rate_id),
          customer_name: custName, customer_phone: custPhone, customer_email: custEmail,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setOrderNumber(d.order_number);
      setStep("success");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  }

  /* ════════════════════════════════════════
     SUCCESS
  ════════════════════════════════════════ */
  if (step === "success") return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f8fafc" }}>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", boxShadow: "0 8px 32px rgba(22,163,74,0.25)" }}>
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">{t("oceanFreightBooking.successTitle")}</h2>
          <p className="text-slate-500 mt-1 text-sm">{t("oceanFreightBooking.successDesc")}</p>
        </div>
        <div className={cardCls + " p-5"} style={cardShadow}>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{t("oceanFreightBooking.orderNumberLabel")}</p>
          <p className="text-xl font-extrabold text-blue-700 font-mono">{orderNumber}</p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-slate-400 transition-all flex items-center justify-center gap-1.5 bg-white"
            onClick={() => setLocation(`/ocean-freight/track/${orderNumber}`)}
          >
            <MapPin className="h-4 w-4" /> {t("oceanFreightBooking.tracking")}
          </button>
          <button
            className="flex-1 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-all"
            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 4px 16px rgba(29,78,216,0.3)" }}
            onClick={() => { setStep("form"); setOptions([]); setSelectedOption(null); setOrderNumber(""); }}
          >
            <RefreshCw className="h-4 w-4" /> {t("oceanFreightBooking.orderAgain")}
          </button>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     INQUIRY FORM
  ════════════════════════════════════════ */
  if (step === "inquiry") return (
    <div className="min-h-screen py-8 px-4" style={{ background: "#f8fafc" }}>
      <div className="max-w-xl mx-auto space-y-4">
        {/* Back */}
        <button onClick={() => setStep("results")}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("oceanFreightBooking.backToEstimate")}
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{t("oceanFreightBooking.senderTitle")}</h2>
            {selectedOption && (
              <p className="text-slate-500 text-sm">
                {t("oceanFreightBooking.estimate")}: <span className="font-bold text-blue-700">{IDR(selectedOption.total_estimate_idr)}</span>
                {" · "}{t((OPTION_META[selectedOption.estimate_option] ?? { labelKey: "oceanFreightBooking.optionStandard" }).labelKey as any)}
              </p>
            )}
          </div>
        </div>

        {/* Form card */}
        <div className={cardCls} style={cardShadow}>
          <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">{t("oceanFreightBooking.contactInfo")}</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t("oceanFreightBooking.fullName")}</label>
                <Input value={custName} onChange={e => setCustName(e.target.value)} placeholder="John Doe" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t("oceanFreightBooking.phoneWa")}</label>
                <Input value={custPhone} onChange={e => setCustPhone(e.target.value)} placeholder="+62812..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t("oceanFreightBooking.email")}</label>
                <Input type="email" value={custEmail} onChange={e => setCustEmail(e.target.value)} placeholder="email@domain.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t("oceanFreightBooking.company")}</label>
                <Input value={custCompany} onChange={e => setCustCompany(e.target.value)} placeholder="PT ..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Incoterm</label>
                <Select value={incoterm} onValueChange={setIncoterm}>
                  <SelectTrigger className={inputCls + " mt-0"}><SelectValue placeholder="EXW / FOB / CIF..." /></SelectTrigger>
                  <SelectContent>
                    {["EXW","FOB","CFR/CNF","CIF","DAP","DDP"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelCls}>{t("oceanFreightBooking.targetEtd")}</label>
                <Input type="date" value={etdPreferred} onChange={e => setEtdPreferred(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t("oceanFreightBooking.commodity")}</label>
              <Input value={commodity} onChange={e => setCommodity(e.target.value)} placeholder="..." className={inputCls} />
            </div>

            <div className="p-3 rounded-xl flex gap-2" style={{ background: "#eff6ff" }}>
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-700 leading-relaxed">{t("oceanFreightBooking.confirmNote")}</p>
            </div>

            <button
              onClick={handleSubmitInquiry} disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-[15px] flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 4px 16px rgba(29,78,216,0.3)" }}
            >
              {loading
                ? <><Loader2 className="h-5 w-5 animate-spin" />{t("oceanFreightBooking.sending")}</>
                : <><Send className="h-5 w-5" />{t("oceanFreightBooking.submitInquiry")}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     RESULTS
  ════════════════════════════════════════ */
  if (step === "results") return (
    <div className="min-h-screen py-8 px-4" style={{ background: "#f8fafc" }}>
      <div className="max-w-2xl mx-auto space-y-4">
        <button onClick={() => setStep("form")}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("oceanFreightBooking.changeSearch")}
        </button>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900">{t("oceanFreightBooking.resultsTitle")}</h2>
          <p className="text-slate-500 text-sm mt-1">
            {originPort} → {destPort} · {shipmentType}
            {shipmentType === "FCL" ? ` / ${containerType} × ${containerQty}` : ` / ${totalCbm} CBM`}
          </p>
        </div>

        {noRates ? (
          <div className={cardCls + " p-8 text-center"} style={cardShadow}>
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Ship className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">{t("oceanFreightBooking.noRatesTitle")}</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">{t("oceanFreightBooking.noRatesDesc")}</p>
            <button
              className="mt-5 px-6 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}
              onClick={() => setStep("inquiry")}
            >
              {t("oceanFreightBooking.requestManualQuote")}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {options.map(opt => {
              const meta      = OPTION_META[opt.estimate_option] ?? { labelKey: opt.estimate_option, badgeCls: "bg-blue-50 text-blue-700", descKey: "" };
              const isSelected= selectedOption?.rate_id === opt.rate_id;
              return (
                <div
                  key={opt.rate_id}
                  className={`bg-white rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? "border-blue-500" : "border-slate-100 hover:border-blue-200"}`}
                  style={isSelected ? { boxShadow: "0 4px 24px rgba(37,99,235,0.15)" } : cardShadow}
                  onClick={() => { setSelectedOption(opt); setShowBreakdown(false); }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${meta.badgeCls}`}>
                            {t(meta.labelKey as any)}
                          </span>
                          <span className="text-slate-600 text-sm font-medium">{opt.carrier}</span>
                        </div>
                        <p className="text-slate-400 text-xs">{meta.descKey ? t(meta.descKey as any) : ""}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {opt.transit_days != null && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />{opt.transit_days} {t("oceanFreightBooking.daysTransit")}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {opt.direct_or_transshipment === "transshipment" ? t("oceanFreightBooking.transshipmentViaTS") : t("oceanFreightBooking.transshipmentDirect")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[22px] font-extrabold text-blue-700 leading-tight">{IDR(opt.total_estimate_idr)}</p>
                        {opt.currency !== "IDR" && (
                          <p className="text-slate-400 text-xs">{opt.currency} {fmtNum(opt.total_estimate)}</p>
                        )}
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                          {opt.price_status === "estimate" ? t("oceanFreightBooking.estimate") : t("oceanFreightBooking.fixedPrice")}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <button
                          onClick={e => { e.stopPropagation(); setShowBreakdown(!showBreakdown); }}
                          className="flex items-center gap-1.5 text-slate-500 text-xs hover:text-slate-800 font-medium transition-colors"
                        >
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
                          {showBreakdown ? t("oceanFreightBooking.hideBreakdown") : t("oceanFreightBooking.showBreakdown")} {t("oceanFreightBooking.breakdownTitle")}
                        </button>
                        {showBreakdown && (
                          <div className="mt-3 space-y-1.5 text-sm">
                            {[
                              [t("oceanFreightBooking.titleOceanFreight"),        opt.base_ocean_freight],
                              [t("oceanFreightBooking.breakdownTHCOrigin"),      opt.origin_charges],
                              [t("oceanFreightBooking.breakdownTHCDestination"), opt.destination_charges],
                              [t("oceanFreightBooking.docCharges"),              opt.document_charges],
                              ...(opt.trucking_charges > 0  ? [[t("oceanFreightBooking.breakdownTrucking"),          opt.trucking_charges]]  : []),
                              ...(opt.customs_charges  > 0  ? [[t("oceanFreightBooking.breakdownCustomsClearance"), opt.customs_charges]]   : []),
                              ...Object.entries(opt.surcharge_breakdown).map(([k, v]) => [k, v] as [string, number]),
                            ].map(([label, val]) => (
                              <div key={label as string} className="flex justify-between text-slate-600">
                                <span>{label}</span>
                                <span className="font-medium text-slate-800">{IDR((val as number) * opt.exchange_rate_to_idr)}</span>
                              </div>
                            ))}
                            <div className="border-t border-slate-100 pt-2 flex justify-between font-extrabold text-slate-900">
                              <span>{t("oceanFreightBooking.totalEstimate")}</span>
                              <span className="text-blue-700">{IDR(opt.total_estimate_idr)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex gap-3 pt-1">
              <button
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-slate-400 transition-all bg-white"
                onClick={() => { setSelectedOption(null); setStep("inquiry"); }}
              >
                {t("oceanFreightBooking.requestManual")}
              </button>
              <button
                disabled={!selectedOption}
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 4px 16px rgba(29,78,216,0.3)" }}
                onClick={() => setStep("inquiry")}
              >
                {t("oceanFreightBooking.requestFinal")}
              </button>
            </div>
            <p className="text-slate-400 text-xs text-center">{t("oceanFreightBooking.priceNote")}</p>
          </div>
        )}
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     FORM (main booking form)
  ════════════════════════════════════════ */
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "#f8fafc" }}>
      <PageSeo path="/ocean-freight-booking" />
      <div className="max-w-xl mx-auto space-y-4">

        {/* Header */}
        <div>
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/jasa")}
            className="inline-flex items-center gap-1.5 mb-5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t("oceanFreightBooking.back")}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 4px 16px rgba(29,78,216,0.3)" }}>
              <Ship className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{t("oceanFreightBooking.titleOceanFreight")}</h1>
              <p className="text-slate-500 text-sm">{t("oceanFreightBooking.subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Card: Rute Pengiriman */}
        <div className={cardCls} style={cardShadow}>
          <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
            <Anchor className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-800 text-sm">{t("oceanFreightBooking.shippingRoute")}</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t("oceanFreightBooking.labelOriginPort")}</label>
                <Select value={originPort} onValueChange={setOriginPort}>
                  <SelectTrigger className={inputCls + " mt-0 h-10"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {PORTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelCls}>{t("oceanFreightBooking.labelDestPort")}</label>
                <Select value={destPort} onValueChange={setDestPort}>
                  <SelectTrigger className={inputCls + " mt-0 h-10"}>
                    <SelectValue placeholder={t("oceanFreightBooking.selectPort")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {PORTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelCls}>{t("oceanFreightBooking.labelTradeType")}</label>
                <Select value={tradeType} onValueChange={setTradeType}>
                  <SelectTrigger className={inputCls + " mt-0 h-10"}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRADE_TYPES.map(item => <SelectItem key={item.v} value={item.v}>{t(item.labelKey as any)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelCls}>{t("oceanFreightBooking.labelServiceMode")}</label>
                <Select value={serviceMode} onValueChange={setServiceMode}>
                  <SelectTrigger className={inputCls + " mt-0 h-10"}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_MODES.map(item => <SelectItem key={item.v} value={item.v}>{t(item.labelKey as any)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Jenis Muatan */}
        <div className={cardCls} style={cardShadow}>
          <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-800 text-sm">{t("oceanFreightBooking.cargoType")}</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* FCL / LCL toggle */}
            <div className="grid grid-cols-2 gap-3">
              {(["FCL","LCL"] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setShipmentType(st)}
                  className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    shipmentType === st
                      ? st === "FCL"
                        ? "border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "border-slate-700 bg-slate-800 text-white shadow-md"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {st === "FCL" ? t("oceanFreightBooking.fclFull") : t("oceanFreightBooking.lclLess")}
                </button>
              ))}
            </div>

            {shipmentType === "FCL" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{t("oceanFreightBooking.labelContainerType")}</label>
                  <Select value={containerType} onValueChange={setContainerType}>
                    <SelectTrigger className={inputCls + " mt-0 h-10"}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTAINER_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={labelCls}>{t("oceanFreightBooking.containerQty")}</label>
                  <Input
                    type="number" min="1" value={containerQty}
                    onChange={e => setContainerQty(Math.max(1, Number(e.target.value)))}
                    className={inputCls}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>{t("oceanFreightBooking.labelVolumeCbm")}</label>
                  <Input type="number" min="0" step="0.01" value={totalCbm} onChange={e => setTotalCbm(e.target.value)} placeholder="0.00" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t("oceanFreightBooking.grossWeightKg")}</label>
                  <Input type="number" min="0" step="0.1" value={grossWeight} onChange={e => setGrossWeight(e.target.value)} placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t("oceanFreightBooking.colliCount")}</label>
                  <Input type="number" min="0" value={koli} onChange={e => setKoli(e.target.value)} placeholder="0" className={inputCls} />
                </div>
              </div>
            )}

            <div>
              <label className={labelCls}>{t("oceanFreightBooking.cargoCondition")}</label>
              <Select value={cargoCondition} onValueChange={setCargoCondition}>
                <SelectTrigger className={inputCls + " mt-0 h-10"}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CARGO_CONDITIONS.map(item => <SelectItem key={item.v} value={item.v}>{t(item.labelKey as any)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Card: Layanan Tambahan */}
        <div className={cardCls} style={cardShadow}>
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="font-bold text-slate-800 text-sm">{t("oceanFreightBooking.additionalServices")}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{t("oceanFreightBooking.additionalServicesHint")}</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-2">
              {ADDITIONAL_SERVICES.map(s => (
                <label
                  key={s.v}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedSvc.includes(s.v)
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSvc.includes(s.v)}
                    onChange={() => toggleSvc(s.v)}
                    className="accent-blue-600 w-3.5 h-3.5 shrink-0"
                  />
                  <span className={`text-[12px] font-medium ${selectedSvc.includes(s.v) ? "text-blue-700" : "text-slate-600"}`}>
                    {t(s.labelKey as any)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleCalculate}
          disabled={loading || !originPort || !destPort}
          className="w-full py-4 rounded-xl font-bold text-white text-[15px] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 4px 20px rgba(29,78,216,0.35)" }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(29,78,216,0.5)"; }}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(29,78,216,0.35)"}
        >
          {loading
            ? <><Loader2 className="h-5 w-5 animate-spin" />{t("oceanFreightBooking.calculating")}</>
            : <><RefreshCw className="h-5 w-5" />{t("oceanFreightBooking.checkPrice")}</>}
        </button>

      </div>
    </div>
  );
}
