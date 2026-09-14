import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Ship, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const IDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function OceanFreightVendorFormPage() {
  const { t } = useLanguage();
  const params = useParams<{ token: string }>();
  const token  = params.token ?? "";
  const { toast } = useToast();

  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData,   setFormData]   = useState<any>(null);

  const [carrier,             setCarrier]             = useState("");
  const [rateSourceName,      setRateSourceName]      = useState("");
  const [oceanFreightAmount,  setOceanFreightAmount]  = useState("");
  const [currency,            setCurrency]            = useState("USD");
  const [exchangeRate,        setExchangeRate]        = useState("16500");
  const [validityDate,        setValidityDate]        = useState("");
  const [vesselName,          setVesselName]          = useState("");
  const [voyage,              setVoyage]              = useState("");
  const [etd,                 setEtd]                 = useState("");
  const [eta,                 setEta]                 = useState("");
  const [transitDays,         setTransitDays]         = useState("");
  const [directOrTS,          setDirectOrTS]          = useState("direct");
  const [thcOrigin,           setThcOrigin]           = useState("0");
  const [thcDest,             setThcDest]             = useState("0");
  const [docFee,              setDocFee]              = useState("0");
  const [blFee,               setBlFee]               = useState("0");
  const [doFee,               setDoFee]               = useState("0");
  const [handlingFee,         setHandlingFee]         = useState("0");
  const [truckingPickup,      setTruckingPickup]      = useState("0");
  const [truckingDelivery,    setTruckingDelivery]    = useState("0");
  const [customsClearanceFee, setCustomsClearanceFee] = useState("0");
  const [surchargeAmount,     setSurchargeAmount]     = useState("0");
  const [notes,               setNotes]               = useState("");
  const [attachment,          setAttachment]          = useState<File | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/ocean-freight-form/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setFormData(d);
        setLoading(false);
      })
      .catch(() => { setError(t("oceanFreightVendorForm.loadError", "Gagal memuat form")); setLoading(false); });
  }, [token, t]);

  const total = [oceanFreightAmount, thcOrigin, thcDest, docFee, blFee, doFee, handlingFee,
    truckingPickup, truckingDelivery, customsClearanceFee, surchargeAmount]
    .reduce((s, v) => s + Number(v || 0), 0);
  const totalIdr = currency === "IDR" ? total : total * Number(exchangeRate || 16500);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!oceanFreightAmount || Number(oceanFreightAmount) <= 0) {
      toast({ title: "Error", description: t("oceanFreightVendorForm.validation.oceanFreightRequired", "Ocean Freight Amount wajib diisi"), variant: "destructive" }); return;
    }
    if (currency !== "IDR" && Number(exchangeRate) <= 0) {
      toast({ title: "Error", description: t("oceanFreightVendorForm.validation.exchangeRateRequired", "Exchange Rate wajib diisi"), variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("rate_source_name", rateSourceName);
      fd.append("carrier", carrier);
      fd.append("ocean_freight_amount", oceanFreightAmount);
      fd.append("currency", currency);
      fd.append("exchange_rate", exchangeRate);
      fd.append("validity_date", validityDate);
      fd.append("vessel_name", vesselName);
      fd.append("voyage", voyage);
      fd.append("etd", etd);
      fd.append("eta", eta);
      fd.append("transit_days", transitDays);
      fd.append("direct_or_transshipment", directOrTS);
      fd.append("thc_origin", thcOrigin);
      fd.append("thc_destination", thcDest);
      fd.append("doc_fee", docFee);
      fd.append("bl_fee", blFee);
      fd.append("do_fee", doFee);
      fd.append("handling_fee", handlingFee);
      fd.append("trucking_pickup", truckingPickup);
      fd.append("trucking_delivery", truckingDelivery);
      fd.append("customs_clearance_fee", customsClearanceFee);
      fd.append("surcharge_amount", surchargeAmount);
      fd.append("notes", notes);
      if (attachment) fd.append("attachment", attachment);

      const res = await fetch(`/api/ocean-freight-form/${token}`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("oceanFreightVendorForm.submitError", "Gagal submit"));
      setSubmitted(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">{t("oceanFreightVendorForm.invalidLink", "Link Tidak Valid")}</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">{t("oceanFreightVendorForm.submitted.title", "Rate Berhasil Disubmit")}</h2>
        <p className="text-gray-600">{t("oceanFreightVendorForm.submitted.desc", "Terima kasih. Rate Anda telah diterima dan akan segera diproses oleh tim kami.")}</p>
      </div>
    </div>
  );

  const order = formData?.order;

  return (
    <div className="min-h-screen bg-blue-950 py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="bg-blue-900 rounded-2xl p-5 mb-4 flex items-center gap-3">
          <Ship className="w-8 h-8 text-blue-300" />
          <div>
            <h1 className="text-white font-bold text-lg">{t("oceanFreightVendorForm.title", "Submit Rate Ocean Freight")}</h1>
            <p className="text-blue-300 text-xs">{t("oceanFreightVendorForm.orderNo", "No. Order")}: {order?.order_number}</p>
          </div>
        </div>

        {/* Order Summary */}
        {order && (
          <div className="bg-white/10 rounded-xl p-4 mb-4 text-sm text-white space-y-1">
            <div className="flex justify-between">
              <span className="text-white/60">{t("oceanFreightVendorForm.summary.route", "Rute")}</span>
              <span className="font-medium">{order.origin_port} → {order.destination_port}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">{t("oceanFreightVendorForm.summary.type", "Jenis")}</span>
              <span>{order.shipment_type}{order.container_type ? " - " + order.container_type : ""}</span>
            </div>
            {order.container_qty && (
              <div className="flex justify-between">
                <span className="text-white/60">{t("oceanFreightVendorForm.summary.qty", "Qty")}</span>
                <span>{order.container_qty} {t("oceanFreightVendorForm.summary.unit", "unit")}</span>
              </div>
            )}
            {order.total_cbm && (
              <div className="flex justify-between">
                <span className="text-white/60">CBM</span>
                <span>{order.total_cbm}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-white/60">{t("oceanFreightVendorForm.summary.commodity", "Komoditi")}</span>
              <span>{order.commodity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">{t("oceanFreightVendorForm.summary.tradeType", "Trade Type")}</span>
              <span className="capitalize">{order.trade_type}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-5 space-y-4">
          <h2 className="font-bold text-gray-800 text-base border-b pb-2">{t("oceanFreightVendorForm.form.rateDetail", "Detail Rate")}</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">{t("oceanFreightVendorForm.form.rateSourceName", "Nama Perusahaan / Sumber Rate")}</Label>
              <Input value={rateSourceName} onChange={e => setRateSourceName(e.target.value)} placeholder={t("oceanFreightVendorForm.form.rateSourceNamePlaceholder", "NVOCC / Forwarder / Agen")} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">{t("oceanFreightVendorForm.form.carrier", "Carrier / Shipping Line")}</Label>
              <Input value={carrier} onChange={e => setCarrier(e.target.value)} placeholder={t("oceanFreightVendorForm.form.carrierPlaceholder", "Maersk / CMA CGM / MSC")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">{t("oceanFreightVendorForm.form.oceanFreight", "Ocean Freight *")}</Label>
              <Input type="number" min="0" step="0.01" value={oceanFreightAmount} onChange={e => setOceanFreightAmount(e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs">{t("oceanFreightVendorForm.form.currency", "Currency")}</Label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                {["USD","IDR","SGD","EUR"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">{t("oceanFreightVendorForm.form.rateIdr", "Rate IDR")}{currency !== "IDR" ? " *" : ""}</Label>
              <Input type="number" min="0" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} disabled={currency === "IDR"} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t("oceanFreightVendorForm.form.validityDate", "Validity Date")}</Label>
              <Input type="date" value={validityDate} onChange={e => setValidityDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t("oceanFreightVendorForm.form.transitDays", "Transit Days")}</Label>
              <Input type="number" min="0" value={transitDays} onChange={e => setTransitDays(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t("oceanFreightVendorForm.form.directOrTs", "Direct / Transshipment")}</Label>
              <select value={directOrTS} onChange={e => setDirectOrTS(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="direct">Direct</option>
                <option value="transshipment">Transshipment</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">{t("oceanFreightVendorForm.form.etd", "ETD (Perkiraan)")}</Label>
              <Input type="date" value={etd} onChange={e => setEtd(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t("oceanFreightVendorForm.form.eta", "ETA (Perkiraan)")}</Label>
              <Input type="date" value={eta} onChange={e => setEta(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t("oceanFreightVendorForm.form.vessel", "Vessel (opsional)")}</Label>
              <Input value={vesselName} onChange={e => setVesselName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t("oceanFreightVendorForm.form.voyage", "Voyage (opsional)")}</Label>
              <Input value={voyage} onChange={e => setVoyage(e.target.value)} />
            </div>
          </div>

          <h3 className="font-semibold text-gray-700 text-sm border-t pt-3">{t("oceanFreightVendorForm.form.additionalFees", "Biaya Tambahan")}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              [t("oceanFreightVendorForm.fee.thcOrigin", "THC Origin"), thcOrigin, setThcOrigin],
              [t("oceanFreightVendorForm.fee.thcDest", "THC Destination"), thcDest, setThcDest],
              [t("oceanFreightVendorForm.fee.docFee", "Doc Fee"), docFee, setDocFee],
              [t("oceanFreightVendorForm.fee.blFee", "B/L Fee"), blFee, setBlFee],
              [t("oceanFreightVendorForm.fee.doFee", "D/O Fee"), doFee, setDoFee],
              [t("oceanFreightVendorForm.fee.handlingFee", "Handling Fee"), handlingFee, setHandlingFee],
              [t("oceanFreightVendorForm.fee.truckingPickup", "Trucking Pickup"), truckingPickup, setTruckingPickup],
              [t("oceanFreightVendorForm.fee.truckingDelivery", "Trucking Delivery"), truckingDelivery, setTruckingDelivery],
              [t("oceanFreightVendorForm.fee.customsClearance", "Customs Clearance"), customsClearanceFee, setCustomsClearanceFee],
              [t("oceanFreightVendorForm.fee.surcharge", "Surcharge"), surchargeAmount, setSurchargeAmount],
            ].map(([label, val, setter]) => (
              <div key={label as string}>
                <Label className="text-xs">{label as string} ({currency})</Label>
                <Input type="number" min="0" step="0.01"
                  value={val as string}
                  onChange={e => (setter as (v: string) => void)(e.target.value)} />
              </div>
            ))}
          </div>

          {/* Total preview */}
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <div className="flex justify-between font-bold text-blue-800">
              <span>{t("oceanFreightVendorForm.totalEstimate", "Total Estimasi")}</span>
              <span>{currency} {total.toLocaleString("id-ID")}</span>
            </div>
            {currency !== "IDR" && (
              <div className="flex justify-between text-blue-600 text-xs mt-0.5">
                <span>≈ IDR</span>
                <span>{IDR(totalIdr)}</span>
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs">{t("oceanFreightVendorForm.form.notes", "Notes")}</Label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder={t("oceanFreightVendorForm.form.notesPlaceholder", "Catatan atau syarat khusus...")}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <Label className="text-xs">{t("oceanFreightVendorForm.form.uploadQuotation", "Upload Quotation (PDF/JPG, opsional)")}</Label>
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setAttachment(e.target.files?.[0] ?? null)} />
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
            {submitting ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />{t("oceanFreightVendorForm.submitting", "Mengirim...")}</> : t("oceanFreightVendorForm.submitBtn", "Submit Rate")}
          </Button>
        </form>
      </div>
    </div>
  );
}
