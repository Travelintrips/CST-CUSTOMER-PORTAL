import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Truck, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface ShipmentItem {
  productName: string;
  qty: number;
  unit: string;
  subtotal: number;
}

interface ShipmentData {
  orderNumber: string;
  customerName: string;
  status: string;
  items: ShipmentItem[];
  totalProduct: number;
  canSelect: boolean;
  selectedMode: string | null;
}

const SHIPMENT_OPTIONS = [
  { id: "pickup_self",  labelKey: "shipment.mode.pickupSelf",  label: "Ambil Sendiri",  icon: "🏭", descKey: "shipment.mode.pickupSelfDesc",  description: "Ambil produk langsung di gudang kami" },
  { id: "trucking",     labelKey: "shipment.mode.trucking",    label: "Trucking",        icon: "🚛", descKey: "shipment.mode.truckingDesc",    description: "Pengiriman darat, kota ke kota" },
  { id: "air_freight",  labelKey: "shipment.mode.airFreight",  label: "Kargo Udara",     icon: "✈️", descKey: "shipment.mode.airFreightDesc",  description: "Pengiriman cepat via udara" },
  { id: "sea_freight",  labelKey: "shipment.mode.seaFreight",  label: "Kargo Laut",      icon: "🚢", descKey: "shipment.mode.seaFreightDesc",  description: "FCL / LCL, impor & ekspor" },
  { id: "door_to_door", labelKey: "shipment.mode.doorToDoor",  label: "Door to Door",    icon: "🚪", descKey: "shipment.mode.doorToDoorDesc",  description: "Pengiriman langsung ke pintu tujuan" },
];

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function ShipmentSelectionPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useLanguage();
  const [data, setData] = useState<ShipmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ mode: string; isPending: boolean } | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/api/portal-product/shipment-selection/${token}`)
      .then(r => r.json())
      .then((d: ShipmentData & { error?: string }) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        if (d.selectedMode) setSelected(d.selectedMode);
      })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit() {
    if (!token || !selected) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${BASE}/api/portal-product/orders/${token}/select-shipment-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentMode: selected }),
      });
      const d = await r.json() as { success?: boolean; error?: string };
      if (!r.ok) throw new Error(d.error ?? t("shipment.saveError", "Gagal menyimpan pilihan"));
      setDone({ mode: selected, isPending: selected !== "pickup_self" });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t("shipment.loading", "Memuat pilihan pengiriman...")}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {t("shipment.pageUnavailable", "Halaman Tidak Tersedia")}
          </h2>
          <p className="text-gray-500 text-sm">
            {error ?? t("shipment.pageUnavailableDesc", "Link tidak valid atau pesanan belum siap memilih pengiriman.")}
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-800 mb-2">
            {t("shipment.savedTitle", "Pilihan Tersimpan!")}
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            {t("shipment.orderNumber", "No. Pesanan:")} <strong className="font-mono">{data.orderNumber}</strong>
          </p>
          {done.isPending ? (
            <p className="text-gray-500 text-sm">
              {t("shipment.pendingDesc", "Tim kami akan mengirimkan penawaran pengiriman untuk Anda. Mohon tunggu konfirmasi via WhatsApp.")}
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              {t("shipment.pickupDesc", "Pesanan Anda siap diambil di gudang kami. Tim kami akan menghubungi Anda dengan detail lokasi.")}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!data.canSelect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {t("shipment.notYetTitle", "Belum Saatnya Memilih")}
          </h2>
          <p className="text-gray-500 text-sm">
            {t("shipment.notYetDesc", "Halaman ini hanya bisa dibuka saat status:")} <strong>Shipment Selection Pending</strong>.
          </p>
          <p className="text-gray-400 text-xs mt-2">{t("shipment.currentStatus", "Status sekarang:")} {data.status}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-8 h-8 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                {t("shipment.selectModeTitle", "Pilih Mode Pengiriman")}
              </p>
              <p className="font-mono font-bold text-lg text-gray-800">{data.orderNumber}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">{data.customerName}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">
            {t("shipment.confirmedProducts", "Produk Dikonfirmasi")}
          </p>
          <div className="space-y-2">
            {data.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-gray-800">{item.productName}</p>
                  <p className="text-xs text-gray-400">{item.qty} {item.unit}</p>
                </div>
                <p className="font-semibold text-gray-700">{idr(item.subtotal)}</p>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-bold">
              <span>{t("shipment.totalProduct", "Total Produk")}</span>
              <span className="text-blue-600">{idr(data.totalProduct)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">
            {t("shipment.chooseService", "Pilih Layanan Pengiriman")}
          </p>
          <div className="space-y-2">
            {SHIPMENT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  selected === opt.id
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl shrink-0">{opt.icon}</span>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${selected === opt.id ? "text-blue-700" : "text-gray-800"}`}>
                    {t(opt.labelKey, opt.label)}
                  </p>
                  <p className={`text-xs ${selected === opt.id ? "text-blue-600" : "text-gray-500"}`}>
                    {t(opt.descKey, opt.description)}
                  </p>
                </div>
                {selected === opt.id && (
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selected || submitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
        >
          {submitting
            ? <><Loader2 className="w-5 h-5 animate-spin" /> {t("shipment.saving", "Menyimpan...")}</>
            : <><CheckCircle2 className="w-5 h-5" /> {t("shipment.confirm", "Konfirmasi Pilihan")}</>}
        </button>

        <p className="text-center text-xs text-gray-400 pb-4">
          {t("shipment.priceNote", "Harga pengiriman akan dikonfirmasi oleh tim kami setelah Anda memilih layanan.")}
        </p>
      </div>
    </div>
  );
}
