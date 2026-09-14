import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";
import { resolveImageUrl } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────────────────────────── */

type OrderItemInfo = {
  serviceName: string;
  category: string;
  subtotal: string | null;
  quantity: string | null;
  unit: string | null;
  unitPrice?: string | null;
};

type OrderInfo = {
  id: number;
  orderNumber: string;
  customerName?: string;
  serviceType: string;
  orderType?: string | null;
  origin: string;
  destination: string;
  commodity: string | null;
  grossWeight: string | null;
  requiredDate: string | null;
  vehicleType: string | null;
  status: string;
  items?: OrderItemInfo[];
  grandTotal?: string | null;
  subtotalBeforeTax?: string | null;
  taxAmount?: string | null;
  taxRate?: number | null;
  templateSnapshot?: Record<string, unknown> | null;
};

type TmplField = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  required?: boolean;
  options?: string[];
  section?: string;
  placeholder?: string;
};

type TmplServiceSnapshot = {
  templateKind: "service";
  serviceTemplate: {
    serviceType: string;
    label: string;
    fields: TmplField[];
    requiredDocuments?: { key: string; label: string; required?: boolean }[];
    checklist?: { key: string; label: string }[];
  };
};

type TmplProductSnapshot = {
  templateKind: "product";
  label?: string;
  customFields?: TmplField[];
  requiredDocuments?: { key: string; label: string; required?: boolean }[];
  checklist?: { key: string; label: string }[];
  packagingInstructions?: string;
};

type TmplSnapshot = TmplServiceSnapshot | TmplProductSnapshot | null;

function parseTemplateSnapshot(raw: Record<string, unknown> | null | undefined): TmplSnapshot {
  if (!raw) return null;
  const kind = raw.templateKind as string | undefined;
  if (kind === "service") return raw as unknown as TmplServiceSnapshot;
  if (kind === "product") return raw as unknown as TmplProductSnapshot;
  return null;
}

function getOperationalFields(snap: TmplSnapshot): TmplField[] {
  if (!snap || snap.templateKind !== "service") return [];
  return (snap.serviceTemplate?.fields ?? []).filter(
    (f) => f.section === "operational" || f.section === "both"
  );
}

const TMPL_TO_BACKEND: Record<string, keyof SubmittedData | "_extra"> = {
  driver_name: "driverName",
  driver_phone: "driverPhone",
  plate_number: "plateNumber",
  vehicle_type: "vehicleType",
  pickup_time: "pickupTime",
  delivery_time: "_extra",
  booking_number: "bookingNumber",
  vessel_name: "flightVessel",
  flight_number: "flightVessel",
  bl_number: "awbBlNumber",
  awb_number: "awbBlNumber",
  op_etd: "etd",
  op_eta: "eta",
  shipping_line: "carrierName",
  airline: "carrierName",
  nomor_aju: "customsPicName",
  status_customs: "customsDocuments",
  wh_receipt_number: "bookingNumber",
  op_notes: "_extra",
};

function buildTemplateSubmitBody(
  fields: Record<string, string>,
  notes: string
): Record<string, string> {
  const body: Record<string, string> = {};
  const extraLines: string[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (!v) continue;
    const bk = TMPL_TO_BACKEND[k];
    if (bk && bk !== "_extra") {
      body[bk as string] = v;
    } else {
      extraLines.push(`${k}: ${v}`);
    }
  }
  const allNotes = [notes, ...extraLines].filter(Boolean).join("\n");
  if (allNotes) body.notes = allNotes;
  return body;
}

type SubmittedData = {
  driverName: string | null;
  driverPhone: string | null;
  plateNumber: string | null;
  vehicleType: string | null;
  pickupTime: string | null;
  carrierName: string | null;
  awbBlNumber: string | null;
  flightVessel: string | null;
  bookingNumber: string | null;
  etd: string | null;
  eta: string | null;
  stockConfirmed: string | null;
  qtyConfirmed: string | null;
  readyDate: string | null;
  warehouseLocation: string | null;
  customsPicName: string | null;
  customsDocuments: string | null;
  customsProcessEta: string | null;
  priceConfirmed: string | null;
  revisedPrice: string | null;
  leadTime: string | null;
  deliveryMethod: string | null;
  stockPhotoUrl: string | null;
  packingListUrl: string | null;
  invoiceUrl: string | null;
  podUrl: string | null;
  supportingDocUrl: string | null;
  notes: string | null;
  submittedAt: string | null;
};

type ProgressEvent = {
  step_key: string;
  created_at: string;
};

type PageData = {
  token: string;
  isSubmitted: boolean;
  serviceType: string;
  vendorName: string | null;
  order: OrderInfo;
  submittedData?: SubmittedData;
  progressEvents?: ProgressEvent[];
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function businessDaysDiff(from: Date, toDate: Date): number {
  const d = new Date(from); d.setHours(0, 0, 0, 0);
  const end = new Date(toDate); end.setHours(0, 0, 0, 0);
  if (end <= d) return 0;
  let count = 0;
  while (d < end) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

function getReadyDateWarning(readyDate: string): { level: "error" | "warn"; msg: string } | null {
  if (!readyDate) return null;
  const today = new Date();
  const ready = new Date(readyDate + "T00:00:00");
  const bdays = businessDaysDiff(today, ready);
  if (bdays === 0) return { level: "error", msg: "⚠️ Tanggal hari ini — lead time kurang dari 1 hari kerja, pastikan barang benar-benar siap segera." };
  if (bdays === 1) return { level: "warn", msg: "⏰ Lead time sangat singkat: hanya 1 hari kerja. Pastikan proses dapat diselesaikan tepat waktu." };
  return null;
}

function getLeadTimeWarning(leadTime: string): string | null {
  if (!leadTime) return null;
  const lt = leadTime.toLowerCase();
  const jamMatch = lt.match(/(\d+(?:[.,]\d+)?)\s*jam/);
  if (jamMatch) {
    const jam = parseFloat(jamMatch[1].replace(",", "."));
    if (jam < 8) return `⚠️ Lead time ${jam} jam lebih pendek dari 1 hari kerja (8 jam).`;
  }
  const hariMatch = lt.match(/(\d+(?:[.,]\d+)?)\s*hari/);
  if (hariMatch) {
    const hari = parseFloat(hariMatch[1].replace(",", "."));
    if (hari < 1) return `⚠️ Lead time kurang dari 1 hari kerja.`;
  }
  return null;
}

function getServiceIcon(svcType: string) {
  if (svcType.includes("trucking")) return "🚚";
  if (svcType.includes("air"))      return "✈️";
  if (svcType.includes("sea"))      return "🚢";
  if (svcType.includes("product"))  return "🛒";
  if (svcType.includes("customs"))  return "🏛️";
  return "🔧";
}

function getServiceLabel(svcType: string) {
  if (svcType.includes("trucking"))    return "Trucking";
  if (svcType.includes("freight_air")) return "Freight Udara";
  if (svcType.includes("freight_sea")) return "Freight Laut";
  if (svcType.includes("product"))     return "Pemenuhan Produk";
  if (svcType.includes("customs"))     return "Kepabeanan";
  return "Fulfillment";
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];
  return `${pad(d.getDate())} ${BULAN[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())} WIB`;
}

function fmtDateLocal(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr + "T00:00:00");
    const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];
    return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function idr(n: number | string | null | undefined): string {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (isNaN(num)) return String(n);
  return `Rp ${Math.round(num).toLocaleString("id-ID")}`;
}

function needsPickup(serviceType: string): boolean {
  const s = (serviceType ?? "").toLowerCase();
  return s.includes("pickup") || s.includes("ex-warehouse") || s.includes("ex warehouse")
    || s.includes("exw") || s.includes("fca") || s.includes("gudang");
}

const STOCK_LABEL: Record<string, string> = {
  all: "Tersedia Semua ✅",
  partial: "Tersedia Sebagian ⚠️",
  none: "Tidak Tersedia ❌",
};

const PRICE_LABEL: Record<string, string> = {
  agree: "Setuju Harga Asal",
  revised: "Revisi Harga",
};

/* ─── UI Primitives ───────────────────────────────────────────────────────── */

function Loader() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">{t("vendorFulfillment.loading", "Memuat…")}</span>
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("vendorFulfillment.linkInvalid", "Link tidak valid")}</h2>
        <p className="text-sm text-slate-600">{message}</p>
        <p className="text-xs text-slate-400 mt-3">{t("vendorFulfillment.linkInvalidHint", "Pastikan link yang Anda buka sudah benar.")}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-3 py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500 flex-shrink-0 min-w-[130px]">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right break-words">{value}</span>
    </div>
  );
}

function OrderRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-sm text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1.5 ${bold ? "border-t border-amber-200 pt-2.5 mt-1" : ""}`}>
      <span className={`text-sm ${bold ? "font-bold text-slate-800" : "text-slate-600"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-bold text-emerald-700 text-base" : "font-medium text-slate-700"}`}>{value}</span>
    </div>
  );
}

/* ─── Submitted Review ────────────────────────────────────────────────────── */

const STEP_LABELS: Record<string, string> = {
  ORDER_RECEIVED:   "Order Diterima",
  VENDOR_CONFIRMED: "Vendor Dikonfirmasi",
  IN_PROGRESS:      "Sedang Diproses",
  PICKUP:           "Penjemputan",
  IN_TRANSIT:       "Dalam Perjalanan",
  ARRIVED:          "Tiba di Tujuan",
  DELIVERED:        "Terkirim",
  COMPLETED:        "Selesai",
};

function SubmittedReview({
  data,
  localFields,
  justSubmitted,
}: {
  data: PageData;
  localFields?: Record<string, string>;
  justSubmitted?: boolean;
}) {
  const { t } = useLanguage();
  const progressEvents = data.progressEvents ?? [];

  const svc = data.serviceType;
  const icon = getServiceIcon(svc);
  const svcLabel = getServiceLabel(svc);
  const sd = data.submittedData;
  const lf = localFields ?? {};

  function val(key: keyof SubmittedData): string | null {
    if (sd?.[key]) return String(sd[key]);
    if (lf[key]) return lf[key];
    return null;
  }

  const order      = data.order;
  const tmplSnap   = parseTemplateSnapshot(order.templateSnapshot);
  const isTemplateService = tmplSnap?.templateKind === "service";
  const isTemplateProduct = tmplSnap?.templateKind === "product";

  const isTrucking = !isTemplateService && svc.includes("trucking");
  const isFreight  = !isTemplateService && (svc.includes("freight_air") || svc.includes("freight_sea") || svc.includes("freight")) && !svc.includes("trucking");
  const isProduct  = !isTemplateService && svc.includes("product");
  const isCustoms  = !isTemplateService && svc.includes("customs");

  const TAX_RATE = order.taxRate ?? 11;
  const stockStatus = val("stockConfirmed");
  const priceChoice = val("priceConfirmed");
  const isRevised = priceChoice === "revised";
  const isPartial = stockStatus === "partial";

  let dpp = 0, ppn = 0, total = 0;
  if (isProduct && stockStatus !== "none") {
    if (isRevised && val("revisedPrice")) {
      dpp   = Number(val("revisedPrice"));
      ppn   = Math.round(dpp * TAX_RATE / 100);
      total = dpp + ppn;
    } else {
      dpp   = Number(order.subtotalBeforeTax ?? 0);
      ppn   = Number(order.taxAmount ?? 0);
      total = Number(order.grandTotal ?? 0);
    }
  }

  const hasAnyData =
    isTemplateService ||
    val("driverName") || val("carrierName") || val("stockConfirmed") ||
    val("customsPicName") || val("plateNumber") || val("awbBlNumber");

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-4">

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 text-center">
          <div className="text-5xl mb-3">{justSubmitted ? "✅" : "📋"}</div>
          <h1 className="text-xl font-bold text-slate-800 mb-1">
            {justSubmitted ? t("vendorFulfillment.successTitle", "Data Berhasil Dikirim!") : t("vendorFulfillment.reviewTitle", "Data Fulfillment")}
          </h1>
          <p className="text-sm text-slate-500 mb-4">
            {justSubmitted
              ? t("vendorFulfillment.successDesc", "Data fulfillment Anda telah berhasil dikirim.")
              : t("vendorFulfillment.reviewDesc", "Berikut ringkasan data yang telah dikirim.")}
          </p>
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-700">
            <span>✓ Submitted</span>
            {sd?.submittedAt && (
              <span className="text-emerald-500 font-normal">{fmtDateTime(sd.submittedAt)}</span>
            )}
          </div>
        </div>

        {progressEvents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">📊 {t("vendorFulfillment.progressOrder", "Progress Order")}</h3>
            <div className="space-y-2">
              {progressEvents.map((ev) => (
                <div key={ev.step_key} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-sm text-slate-700 flex-1">
                    {STEP_LABELS[ev.step_key] ?? ev.step_key}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(ev.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{icon}</span>
            <div>
              <h2 className="text-sm font-semibold text-slate-700">{t("vendorFulfillment.orderDetail", "Detail Order")} — {svcLabel}</h2>
              {data.vendorName && (
                <p className="text-xs text-slate-400">{t("vendorFulfillment.vendor", "Vendor")}: {data.vendorName}</p>
              )}
            </div>
          </div>
          <div className="space-y-2.5">
            <OrderRow label={t("vendorFulfillment.orderNumber", "No. Order")} value={order.orderNumber} />
            {order.customerName && <OrderRow label={t("vendorFulfillment.customer", "Customer")} value={order.customerName} />}
            <OrderRow label={t("vendorFulfillment.service", "Layanan")} value={order.serviceType} />
            {!isProduct && <OrderRow label={t("vendorFulfillment.route", "Rute")} value={`${order.origin} → ${order.destination}`} />}
            {order.commodity && <OrderRow label={t("vendorFulfillment.commodity", "Komoditi")} value={order.commodity} />}
            {order.templateSnapshot && (order.templateSnapshot as any).label && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">📋 {t("vendorFulfillment.productTemplate", "Template Produk")}</p>
                <p className="text-sm font-medium text-slate-700">{String((order.templateSnapshot as any).label)}</p>
                {Array.isArray((order.templateSnapshot as any).requiredDocuments) &&
                  ((order.templateSnapshot as any).requiredDocuments as any[]).filter((d) => d.required).length > 0 && (
                  <ul className="text-xs text-slate-500 list-disc pl-4 mt-0.5">
                    {((order.templateSnapshot as any).requiredDocuments as any[]).filter((d) => d.required).map((d, i) => (
                      <li key={i}>{d.label}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {hasAnyData && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
              {icon} {t("vendorFulfillment.submittedFulfillmentData", "Data Fulfillment yang Dikirim")}
            </h2>
            <p className="text-xs text-slate-400 mb-4">{t("vendorFulfillment.readOnly", "Read-only — tidak dapat diubah.")}</p>

            {isTemplateService && (() => {
              const snap = tmplSnap as TmplServiceSnapshot;
              const opFields = getOperationalFields(snap);
              return opFields.map((f) => {
                const bk = TMPL_TO_BACKEND[f.key];
                const v = bk && bk !== "_extra"
                  ? val(bk as keyof SubmittedData)
                  : (lf[f.key] ?? null);
                return <Row key={f.key} label={f.label} value={v} />;
              });
            })()}
            {isTrucking && (
              <>
                <Row label={t("vendorFulfillment.driverName", "Nama Driver")}    value={val("driverName")} />
                <Row label={t("vendorFulfillment.driverPhone", "No. HP Driver")}  value={val("driverPhone")} />
                <Row label={t("vendorFulfillment.plateNumber", "Nomor Plat")}     value={val("plateNumber")} />
                <Row label={t("vendorFulfillment.vehicleType", "Tipe Kendaraan")} value={val("vehicleType")} />
                <Row label={t("vendorFulfillment.estPickup", "Est. Pickup")}    value={val("pickupTime")} />
              </>
            )}
            {isFreight && (
              <>
                <Row label={t("vendorFulfillment.carrier", "Carrier / Maskapai")}     value={val("carrierName")} />
                <Row label={t("vendorFulfillment.awbBl", "No. AWB / BL")}            value={val("awbBlNumber")} />
                <Row label={t("vendorFulfillment.flightVessel", "No. Penerbangan/Vessel")}  value={val("flightVessel")} />
                <Row label={t("vendorFulfillment.bookingNumber", "No. Booking")}             value={val("bookingNumber")} />
                <Row label="ETD"                     value={val("etd")} />
                <Row label="ETA"                     value={val("eta")} />
              </>
            )}
            {isProduct && (
              <>
                {/* Product items table */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-4 overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-slate-400 text-xs">
                          <th className="text-left px-3 py-2 font-medium">{t("vendorFulfillment.product", "Produk")}</th>
                          <th className="text-right px-3 py-2 font-medium">Qty</th>
                          <th className="text-right px-3 py-2 font-medium">{t("vendorFulfillment.unit", "Satuan")}</th>
                          <th className="text-right px-3 py-2 font-medium">{t("vendorFulfillment.pricePerUnit", "Harga/Unit")}</th>
                          <th className="text-right px-3 py-2 font-medium">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {order.items.map((it, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-slate-700">{it.serviceName || "—"}</td>
                            <td className="px-3 py-2 text-right text-slate-600">{it.quantity ?? "—"}</td>
                            <td className="px-3 py-2 text-right text-slate-500">{it.unit ?? "—"}</td>
                            <td className="px-3 py-2 text-right text-slate-500">{it.unitPrice ? idr(it.unitPrice) : "—"}</td>
                            <td className="px-3 py-2 text-right font-medium text-slate-700">{idr(it.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <Row label={t("vendorFulfillment.stockStatus", "Status Stok")}      value={stockStatus ? STOCK_LABEL[stockStatus] ?? stockStatus : null} />
                {isPartial && <Row label={t("vendorFulfillment.qtyFulfilled", "Qty Terpenuhi")}   value={val("qtyConfirmed")} />}
                <Row label={t("vendorFulfillment.readyDate", "Tanggal Siap Kirim")} value={val("readyDate") ? fmtDateLocal(val("readyDate")) : null} />
                <Row label={t("vendorFulfillment.leadTime", "Lead Time")}          value={val("leadTime")} />
                <Row label={t("vendorFulfillment.warehouseLocation", "Lokasi Gudang")}      value={val("warehouseLocation")} />
                <Row label={t("vendorFulfillment.priceConfirm", "Konfirmasi Harga")}   value={priceChoice ? PRICE_LABEL[priceChoice] ?? priceChoice : null} />
                {isRevised && <Row label={t("vendorFulfillment.revisedPriceDpp", "Harga Revisi (DPP)")} value={val("revisedPrice") ? idr(val("revisedPrice")) : null} />}
                {stockStatus !== "none" && total > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">DPP</span>
                      <span className="text-slate-700">{idr(dpp)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">PPN {TAX_RATE}%</span>
                      <span className="text-slate-700">{idr(ppn)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-slate-100 pt-2">
                      <span className="text-slate-700">Grand Total</span>
                      <span className="text-emerald-700">{idr(total)}</span>
                    </div>
                  </div>
                )}
                {val("deliveryMethod") && (
                  <Row label={t("vendorFulfillment.deliveryMethod", "Metode Pengiriman")} value={
                    val("deliveryMethod") === "vendor_delivery" ? "🚛 Vendor Delivery" :
                    val("deliveryMethod") === "customer_pickup" ? "🏭 Customer Pickup" :
                    val("deliveryMethod") === "third_party" ? "📦 Third Party Carrier" :
                    val("deliveryMethod")
                  } />
                )}
                {val("stockPhotoUrl") && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-1.5">{t("vendorFulfillment.stockPhoto", "Foto Barang / Stok")}</p>
                    {val("stockPhotoUrl")!.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i) ? (
                      <img src={resolveImageUrl(val("stockPhotoUrl")) ?? val("stockPhotoUrl")!} alt={t("vendorFulfillment.stockPhotoAlt", "Foto stok")} className="max-h-40 rounded-lg border border-slate-200" />
                    ) : (
                      <a href={val("stockPhotoUrl")!} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">{t("vendorFulfillment.viewStockPhoto", "Lihat file foto stok")}</a>
                    )}
                  </div>
                )}
                {val("packingListUrl") && (
                  <div className="mt-2">
                    <a href={val("packingListUrl")!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 underline">
                      📋 {t("vendorFulfillment.viewPackingList", "Lihat Packing List")}
                    </a>
                  </div>
                )}
                {val("invoiceUrl") && (
                  <div className="mt-2">
                    <a href={val("invoiceUrl")!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 underline">
                      📄 {t("vendorFulfillment.viewInvoice", "Lihat Invoice")}
                    </a>
                  </div>
                )}
                {val("podUrl") && (
                  <div className="mt-2">
                    <a href={val("podUrl")!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 underline">
                      ✅ {t("vendorFulfillment.viewPod", "Lihat POD (Proof of Delivery)")}
                    </a>
                  </div>
                )}
                {val("supportingDocUrl") && (
                  <div className="mt-1">
                    <a href={val("supportingDocUrl")!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 underline">
                      📎 {t("vendorFulfillment.viewSupportingDoc", "Lihat Dokumen Pendukung")}
                    </a>
                  </div>
                )}
              </>
            )}
            {isCustoms && (
              <>
                <Row label={t("vendorFulfillment.customsPic", "Nama PIC Kepabeanan")}      value={val("customsPicName")} />
                <Row label={t("vendorFulfillment.customsDocuments", "Dokumen Dibutuhkan")}        value={val("customsDocuments")} />
                <Row label={t("vendorFulfillment.customsProcessEta", "Est. Selesai Bea Cukai")}   value={val("customsProcessEta")} />
              </>
            )}
            {!isTrucking && !isFreight && !isProduct && !isCustoms && (
              <>
                <Row label={t("vendorFulfillment.driverShort", "Driver")}         value={val("driverName")} />
                <Row label={t("vendorFulfillment.platShort", "No. Plat")}       value={val("plateNumber")} />
                <Row label="Carrier"        value={val("carrierName")} />
                <Row label="AWB/BL"         value={val("awbBlNumber")} />
                <Row label="ETD"            value={val("etd")} />
                <Row label="ETA"            value={val("eta")} />
                <Row label={t("vendorFulfillment.stockShort", "Stok")}           value={val("stockConfirmed")} />
                <Row label={t("vendorFulfillment.customsPicShort", "PIC Kepabeanan")} value={val("customsPicName")} />
              </>
            )}
            {val("notes") && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1">{t("vendorFulfillment.additionalNotes", "Catatan Tambahan")}</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{val("notes")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Driver Types ────────────────────────────────────────────────────────── */

type VendorDriver = {
  id: number;
  name: string;
  phone: string | null;
  vehiclePlate: string | null;
  vehicleType: string | null;
};

/* ─── Field primitives ────────────────────────────────────────────────────── */

function Field({
  label, name, value, onChange, placeholder = "", required = false, type = "text",
}: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type} name={name} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
    </div>
  );
}

function UploadField({
  label, fileType, url, uploading, onUpload,
}: {
  label: string;
  fileType: string;
  url: string;
  uploading: boolean;
  onUpload: (fileType: string, file: File) => void;
}) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const isImage = url && url.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(fileType, file);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
            url
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"
          } disabled:opacity-50`}
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              {t("vendorFulfillment.uploading", "Mengupload...")}
            </>
          ) : url ? (
            t("vendorFulfillment.uploadedChange", "✅ Terupload — Ganti")
          ) : (
            t("vendorFulfillment.chooseFile", "📎 Pilih File")
          )}
        </button>
        {url && (
          <a
            href={isImage ? (resolveImageUrl(url) ?? url) : url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 underline truncate max-w-[160px]"
          >
            {isImage ? t("vendorFulfillment.viewPhoto", "Lihat foto") : t("vendorFulfillment.viewDocument", "Lihat dokumen")}
          </a>
        )}
      </div>
      {url && isImage && (
        <img
          src={resolveImageUrl(url) ?? url}
          alt={label}
          className="mt-1 max-h-32 rounded-lg border border-slate-200 object-cover"
        />
      )}
    </div>
  );
}

/* ─── DriverPicker ────────────────────────────────────────────────────────── */

function DriverPicker({
  token,
  driverName,
  driverPhone,
  plateNumber,
  vehicleType,
  onSelect,
}: {
  token: string;
  driverName: string;
  driverPhone: string;
  plateNumber: string;
  vehicleType: string;
  onSelect: (d: { name: string; phone: string; plate: string; vehicleType: string }) => void;
}) {
  const { t } = useLanguage();
  const [drivers, setDrivers] = useState<VendorDriver[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Fetch driver list
  useEffect(() => {
    fetch(`/api/vendor-fulfillment/${token}/drivers`)
      .then((r) => r.json())
      .then((d: { drivers?: VendorDriver[] }) => { if (d.drivers) setDrivers(d.drivers); })
      .catch(() => {});
  }, [token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.vehiclePlate ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (d.phone ?? "").includes(search)
  );

  const handleSelect = useCallback((d: VendorDriver) => {
    onSelect({ name: d.name, phone: d.phone ?? "", plate: d.vehiclePlate ?? "", vehicleType: d.vehicleType ?? "" });
    setSearch("");
    setOpen(false);
  }, [onSelect]);

  const handleSaveNew = async () => {
    if (!newName.trim()) { setSaveError(t("vendorFulfillment.driverNameRequired", "Nama driver wajib diisi")); return; }
    setSaving(true); setSaveError(null);
    try {
      const r = await fetch(`/api/vendor-fulfillment/${token}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), phone: newPhone.trim(), vehiclePlate: newPlate.trim(), vehicleType: newVehicleType.trim() }),
      });
      const d = await r.json() as { driver?: VendorDriver; error?: string };
      if (!r.ok) throw new Error(d.error ?? t("vendorFulfillment.saveDriverFailed", "Gagal menyimpan driver"));
      if (d.driver) {
        setDrivers((prev) => [...prev, d.driver!]);
        handleSelect(d.driver!);
      }
      setShowAddForm(false);
      setNewName(""); setNewPhone(""); setNewPlate(""); setNewVehicleType("");
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400";
  const selectedLabel = driverName ? `${driverName}${plateNumber ? ` · ${plateNumber}` : ""}` : "";

  return (
    <div className="space-y-3">
      {/* Driver Combobox */}
      <div className="space-y-1.5" ref={dropRef}>
        <label className="text-sm font-medium text-slate-700">
          {t("vendorFulfillment.selectDriver", "Pilih Driver")}<span className="text-red-500 ml-0.5">*</span>
        </label>
        {/* Selected preview */}
        {selectedLabel && !open && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm">
            <div>
              <span className="font-medium text-emerald-800">{driverName}</span>
              {driverPhone && <span className="text-slate-500 ml-2">· {driverPhone}</span>}
              {plateNumber && <span className="text-slate-500 ml-2">· {plateNumber}</span>}
            </div>
            <button type="button" onClick={() => { setOpen(true); setSearch(""); }}
              className="text-xs text-emerald-600 hover:text-emerald-800 underline shrink-0">{t("vendorFulfillment.changeDriver", "Ganti")}</button>
          </div>
        )}
        {/* Search + dropdown */}
        {(!selectedLabel || open) && (
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder={drivers.length > 0 ? t("vendorFulfillment.searchDriver", "Cari nama driver atau plat...") : t("vendorFulfillment.noDriversRegistered", "Belum ada driver terdaftar")}
              className={inputCls}
              autoComplete="off"
            />
            {open && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {filtered.length > 0 ? (
                  filtered.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelect(d)}
                      className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 border-b border-slate-50 last:border-0"
                    >
                      <div className="text-sm font-medium text-slate-800">{d.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex gap-2">
                        {d.phone && <span>📱 {d.phone}</span>}
                        {d.vehiclePlate && <span>🚛 {d.vehiclePlate}</span>}
                        {d.vehicleType && <span>{d.vehicleType}</span>}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-sm text-slate-400 text-center">
                    {search ? `"${search}" ${t("vendorFulfillment.notFound", "tidak ditemukan")}` : t("vendorFulfillment.noDriversRegistered", "Belum ada driver terdaftar")}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setOpen(false); setShowAddForm(true); setNewName(search); setSearch(""); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-emerald-700 font-medium bg-emerald-50 hover:bg-emerald-100 border-t border-emerald-100 flex items-center gap-2"
                >
                  <span className="text-base">＋</span> {t("vendorFulfillment.addNewDriver", "Tambah driver baru")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add new driver mini form */}
      {showAddForm && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
          <p className="text-sm font-semibold text-emerald-800">➕ {t("vendorFulfillment.addNewDriverTitle", "Tambah Driver Baru")}</p>
          {saveError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">{t("vendorFulfillment.driverNameLabel", "Nama Driver")} <span className="text-red-500">*</span></label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder={t("vendorFulfillment.driverNamePlaceholder", "Nama lengkap driver")} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">{t("vendorFulfillment.driverPhoneLabel", "No. HP")}</label>
            <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
              placeholder="08xxxxxxxxxx" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">{t("vendorFulfillment.platNumberLabel", "Plat Nomor")}</label>
              <input type="text" value={newPlate} onChange={(e) => setNewPlate(e.target.value)}
                placeholder="B 1234 XYZ" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">{t("vendorFulfillment.vehicleTypeLabel", "Jenis Kendaraan")}</label>
              <input type="text" value={newVehicleType} onChange={(e) => setNewVehicleType(e.target.value)}
                placeholder={t("vendorFulfillment.vehicleTypePlaceholder", "Engkel, CDD, dll")} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveNew}
              disabled={saving}
              className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-medium py-2 transition-colors flex items-center justify-center gap-2"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? t("vendorFulfillment.saving", "Menyimpan...") : t("vendorFulfillment.saveAndSelect", "Simpan & Pilih")}
            </button>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setSaveError(null); }}
              className="px-4 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 py-2"
            >
              {t("vendorFulfillment.cancel", "Batal")}
            </button>
          </div>
        </div>
      )}

      {/* Readonly detail fields after driver selected */}
      {driverName && (
        <div className="grid grid-cols-1 gap-3">
          <Field label={t("vendorFulfillment.driverPhoneField", "No. HP Driver")} name="driverPhone" value={driverPhone} onChange={(v) => onSelect({ name: driverName, phone: v, plate: plateNumber, vehicleType })} placeholder="08xxxxxxxxxx" />
          <Field label={t("vendorFulfillment.plateNumberField", "Nomor Plat Kendaraan")} name="plateNumber" value={plateNumber} onChange={(v) => onSelect({ name: driverName, phone: driverPhone, plate: v, vehicleType })} placeholder="B 1234 XYZ" required />
          <Field label={t("vendorFulfillment.vehicleTypeField", "Tipe Kendaraan")} name="vehicleType" value={vehicleType} onChange={(v) => onSelect({ name: driverName, phone: driverPhone, plate: plateNumber, vehicleType: v })} placeholder={t("vendorFulfillment.vehicleTypePlaceholder2", "Engkel, Tronton, CDD, dll")} />
        </div>
      )}
    </div>
  );
}

/* ─── Trucking & Freight & Customs (unchanged) ────────────────────────────── */

function TruckingFields({ fields, setField, token }: { fields: Record<string, string>; setField: (k: string, v: string) => void; token: string }) {
  const { t } = useLanguage();
  const handleDriverSelect = useCallback((d: { name: string; phone: string; plate: string; vehicleType: string }) => {
    setField("driverName", d.name);
    setField("driverPhone", d.phone);
    setField("plateNumber", d.plate);
    setField("vehicleType", d.vehicleType);
  }, [setField]);

  return (
    <>
      <DriverPicker
        token={token}
        driverName={fields.driverName ?? ""}
        driverPhone={fields.driverPhone ?? ""}
        plateNumber={fields.plateNumber ?? ""}
        vehicleType={fields.vehicleType ?? ""}
        onSelect={handleDriverSelect}
      />
      <Field label={t("vendorFulfillment.estPickupTime", "Estimasi Waktu Pickup")} name="pickupTime" value={fields.pickupTime ?? ""} onChange={(v) => setField("pickupTime", v)} placeholder={t("vendorFulfillment.estPickupPlaceholder", "Contoh: 14 Jun 2026, 09:00 WIB")} />
    </>
  );
}

function FreightFields({ fields, setField }: { fields: Record<string, string>; setField: (k: string, v: string) => void }) {
  const { t } = useLanguage();
  return (
    <>
      <Field label={t("vendorFulfillment.carrierName", "Nama Carrier / Maskapai")} name="carrierName" value={fields.carrierName ?? ""} onChange={(v) => setField("carrierName", v)} placeholder={t("vendorFulfillment.carrierPlaceholder", "Garuda Cargo, Evergreen, dll")} required />
      <Field label={t("vendorFulfillment.awbBlNumber", "No. AWB / BL")} name="awbBlNumber" value={fields.awbBlNumber ?? ""} onChange={(v) => setField("awbBlNumber", v)} placeholder="AWB/BL number" />
      <Field label={t("vendorFulfillment.flightVesselNumber", "No. Penerbangan / Vessel")} name="flightVessel" value={fields.flightVessel ?? ""} onChange={(v) => setField("flightVessel", v)} placeholder={t("vendorFulfillment.flightVesselPlaceholder", "GA-123, MSC Elbe, dll")} />
      <Field label={t("vendorFulfillment.bookingNumberField", "No. Booking")} name="bookingNumber" value={fields.bookingNumber ?? ""} onChange={(v) => setField("bookingNumber", v)} placeholder={t("vendorFulfillment.bookingNumberPlaceholder", "Nomor booking jika ada")} />
      <Field label={t("vendorFulfillment.etdField", "ETD (Tanggal Keberangkatan)")} name="etd" value={fields.etd ?? ""} onChange={(v) => setField("etd", v)} placeholder="dd/mm/yyyy" required />
      <Field label={t("vendorFulfillment.etaField", "ETA (Tanggal Kedatangan)")} name="eta" value={fields.eta ?? ""} onChange={(v) => setField("eta", v)} placeholder="dd/mm/yyyy" />
    </>
  );
}

function CustomsFields({ fields, setField }: { fields: Record<string, string>; setField: (k: string, v: string) => void }) {
  const { t } = useLanguage();
  return (
    <>
      <Field label={t("vendorFulfillment.customsPicName", "Nama PIC Kepabeanan")} name="customsPicName" value={fields.customsPicName ?? ""} onChange={(v) => setField("customsPicName", v)} placeholder={t("vendorFulfillment.customsPicPlaceholder", "Nama PIC / PPJK")} required />
      <Field label={t("vendorFulfillment.customsDocumentsField", "Dokumen Dibutuhkan")} name="customsDocuments" value={fields.customsDocuments ?? ""} onChange={(v) => setField("customsDocuments", v)} placeholder={t("vendorFulfillment.customsDocumentsPlaceholder", "PIB, BC 2.3, Invoice, Packing List, dll")} />
      <Field label={t("vendorFulfillment.customsProcessEtaField", "Estimasi Selesai Proses Bea Cukai")} name="customsProcessEta" value={fields.customsProcessEta ?? ""} onChange={(v) => setField("customsProcessEta", v)} placeholder={t("vendorFulfillment.customsProcessEtaPlaceholder", "dd/mm/yyyy atau rentang waktu")} />
    </>
  );
}

/* ─── Template-Driven Components ─────────────────────────────────────────── */

function TemplateSelectField({
  field, value, onChange,
}: { field: TmplField; value: string; onChange: (v: string) => void }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">
        {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
      >
        <option value="">{t("vendorFulfillment.selectPlaceholder", "— Pilih —")}</option>
        {(field.options ?? []).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function TemplateTextareaField({
  field, value, onChange,
}: { field: TmplField; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">
        {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? ""}
        required={field.required}
        rows={3}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
      />
    </div>
  );
}

const DRIVER_TMPL_KEYS = new Set(["driver_name", "driver_phone", "plate_number", "vehicle_type"]);

function TemplateDrivenServiceForm({
  snap,
  fields,
  setField,
  token,
}: {
  snap: TmplServiceSnapshot;
  fields: Record<string, string>;
  setField: (k: string, v: string) => void;
  token: string;
}) {
  const opFields = (snap.serviceTemplate?.fields ?? []).filter(
    (f) => f.section === "operational" || f.section === "both"
  );
  const isTruckingTmpl = snap.serviceTemplate?.serviceType === "trucking";
  const hasDriverGroup = isTruckingTmpl && opFields.some((f) => DRIVER_TMPL_KEYS.has(f.key));

  const handleDriverSelect = useCallback(
    (d: { name: string; phone: string; plate: string; vehicleType: string }) => {
      setField("driver_name", d.name);
      setField("driver_phone", d.phone);
      setField("plate_number", d.plate);
      setField("vehicle_type", d.vehicleType);
    },
    [setField]
  );

  return (
    <>
      {hasDriverGroup && (
        <DriverPicker
          token={token}
          driverName={fields.driver_name ?? ""}
          driverPhone={fields.driver_phone ?? ""}
          plateNumber={fields.plate_number ?? ""}
          vehicleType={fields.vehicle_type ?? ""}
          onSelect={handleDriverSelect}
        />
      )}
      {opFields
        .filter((f) => !hasDriverGroup || !DRIVER_TMPL_KEYS.has(f.key))
        .map((f) => {
          const val = fields[f.key] ?? "";
          const onChange = (v: string) => setField(f.key, v);
          if (f.type === "select") return <TemplateSelectField key={f.key} field={f} value={val} onChange={onChange} />;
          if (f.type === "textarea") return <TemplateTextareaField key={f.key} field={f} value={val} onChange={onChange} />;
          return (
            <Field
              key={f.key}
              label={f.label}
              name={f.key}
              value={val}
              onChange={onChange}
              placeholder={f.placeholder ?? ""}
              required={!!f.required}
              type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
            />
          );
        })}
    </>
  );
}

/* ─── Product Fulfillment Form ───────────────────────────────────────────── */

function ProductFulfillmentForm({
  order,
  fields,
  setField,
  token,
}: {
  order: OrderInfo;
  fields: Record<string, string>;
  setField: (k: string, v: string) => void;
  token: string;
}) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!fields.readyDate) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ready = new Date(fields.readyDate + "T00:00:00");
    const diffMs = ready.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      setField("leadTime", t("vendorFulfillment.today", "Hari ini"));
    } else {
      setField("leadTime", `${diffDays} ${t("vendorFulfillment.days", "hari")}`);
    }
  }, [fields.readyDate]);

  const stockStatus = fields.stockConfirmed ?? "";
  const priceChoice = fields.priceConfirmed ?? "";
  const isPartial   = stockStatus === "partial";
  const isRevised   = priceChoice === "revised";
  const showWarehouse = needsPickup(order.serviceType ?? "");
  const TAX_RATE = order.taxRate ?? 11;

  const _itemsSum = (order.items ?? []).reduce((s, i) => s + Number(i.subtotal ?? 0), 0);
  const origDpp   = _itemsSum > 0 ? _itemsSum : Number(order.subtotalBeforeTax ?? Number(order.grandTotal ?? 0));
  const origPpn   = Math.round(origDpp * TAX_RATE / 100);
  const origGrand = origDpp + origPpn;

  let summaryDpp = origDpp, summaryPpn = origPpn, summaryTotal = origGrand;
  if (isRevised && fields.revisedPrice && Number(fields.revisedPrice) > 0) {
    summaryDpp   = Number(fields.revisedPrice);
    summaryPpn   = Math.round(summaryDpp * TAX_RATE / 100);
    summaryTotal = summaryDpp + summaryPpn;
  }

  const hasSummary = stockStatus && priceChoice && fields.readyDate;

  const handleUpload = async (fileType: string, file: File) => {
    setUploading((p) => ({ ...p, [fileType]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`/api/vendor-fulfillment/${token}/upload?type=${fileType}`, {
        method: "POST",
        body: fd,
      });
      const d = await r.json() as { url?: string; error?: string };
      if (!r.ok) throw new Error(d.error ?? t("vendorFulfillment.uploadFailed", "Upload gagal"));
      setField(`${fileType}Url`, d.url!);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading((p) => ({ ...p, [fileType]: false }));
    }
  };

  return (
    <>
      {/* ── 1. Detail Produk ── */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("vendorFulfillment.productDetail", "Detail Produk")}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 font-medium">{t("vendorFulfillment.productName", "Nama Produk")}</th>
                  <th className="text-right px-4 py-2.5 font-medium">{t("vendorFulfillment.qtyOrder", "Qty Order")}</th>
                  <th className="text-right px-4 py-2.5 font-medium">{t("vendorFulfillment.unitShort", "Satuan")}</th>
                  <th className="text-right px-4 py-2.5 font-medium">{t("vendorFulfillment.pricePerUnitShort", "Harga/Unit")}</th>
                  <th className="text-right px-4 py-2.5 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-700 font-medium">{item.serviceName || "—"}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{item.quantity ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{item.unit ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{item.unitPrice ? idr(item.unitPrice) : "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">{idr(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {origGrand > 0 && (
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 space-y-1.5">
              {origDpp > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("vendorFulfillment.dppBase", "DPP (Harga Dasar)")}</span>
                  <span className="text-slate-700">{idr(origDpp)}</span>
                </div>
              )}
              {origPpn > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">PPN {TAX_RATE}%</span>
                  <span className="text-slate-700">{idr(origPpn)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-slate-200 pt-2">
                <span className="text-slate-700">{t("vendorFulfillment.grandTotalOrder", "Grand Total Order")}</span>
                <span className="text-emerald-700 text-base">{idr(origGrand)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. Metode Pengiriman ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">🚚 {t("vendorFulfillment.deliveryMethodTitle", "Metode Pengiriman")}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t("vendorFulfillment.deliveryMethodHint", "Bagaimana barang akan dikirim ke customer?")}</p>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { val: "vendor_delivery", label: t("vendorFulfillment.vendorDelivery", "🚛 Vendor Delivery"), desc: t("vendorFulfillment.vendorDeliveryDesc", "Vendor mengirim langsung ke lokasi customer") },
            { val: "customer_pickup", label: t("vendorFulfillment.customerPickup", "🏭 Customer Pickup"), desc: t("vendorFulfillment.customerPickupDesc", "Customer mengambil sendiri dari gudang vendor") },
            { val: "third_party",     label: t("vendorFulfillment.thirdParty", "📦 Third Party Carrier"), desc: t("vendorFulfillment.thirdPartyDesc", "Dikirim via jasa pengiriman pihak ketiga") },
          ].map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => setField("deliveryMethod", opt.val)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between gap-2 ${
                fields.deliveryMethod === opt.val
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div>
                <p className={`text-sm font-semibold ${fields.deliveryMethod === opt.val ? "text-emerald-800" : "text-slate-700"}`}>
                  {opt.label}
                </p>
                <p className={`text-xs mt-0.5 ${fields.deliveryMethod === opt.val ? "text-slate-600" : "text-slate-400"}`}>
                  {opt.desc}
                </p>
              </div>
              {fields.deliveryMethod === opt.val && <span className="text-emerald-500 shrink-0">✓</span>}
            </button>
          ))}
        </div>
        {fields.deliveryMethod === "third_party" && (
          <div className="space-y-3 pt-1">
            <Field
              label={t("vendorFulfillment.carrierExpedisi", "Nama Carrier / Ekspedisi")}
              name="carrierName"
              value={fields.carrierName ?? ""}
              onChange={(v) => setField("carrierName", v)}
              placeholder={t("vendorFulfillment.carrierExpedisiPlaceholder", "JNE, J&T, Sicepat, dll")}
              required
            />
            <Field
              label={t("vendorFulfillment.vehicleService", "Tipe Kendaraan / Layanan")}
              name="vehicleType"
              value={fields.vehicleType ?? ""}
              onChange={(v) => setField("vehicleType", v)}
              placeholder={t("vendorFulfillment.vehicleServicePlaceholder", "Reguler, Express, Cargo, dll")}
            />
          </div>
        )}
        {fields.deliveryMethod === "vendor_delivery" && (
          <div className="space-y-3 pt-1">
            <DriverPicker
              token={token}
              driverName={fields.driverName ?? ""}
              driverPhone={fields.driverPhone ?? ""}
              plateNumber={fields.plateNumber ?? ""}
              vehicleType={fields.vehicleType ?? ""}
              onSelect={(d) => {
                setField("driverName", d.name);
                setField("driverPhone", d.phone);
                setField("plateNumber", d.plate);
                setField("vehicleType", d.vehicleType);
              }}
            />
          </div>
        )}
      </div>

      {/* ── 3. Konfirmasi Stok ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">📦 {t("vendorFulfillment.stockConfirmTitle", "Konfirmasi Stok")}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t("vendorFulfillment.stockConfirmHint", "Pilih ketersediaan stok untuk order ini")}</p>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { val: "all",     label: t("vendorFulfillment.stockAll", "✅ Tersedia Semua"),     desc: t("vendorFulfillment.stockAllDesc", "Semua qty dapat dipenuhi") },
            { val: "partial", label: t("vendorFulfillment.stockPartial", "⚠️ Tersedia Sebagian"),  desc: t("vendorFulfillment.stockPartialDesc", "Hanya sebagian qty tersedia") },
            { val: "none",    label: t("vendorFulfillment.stockNone", "❌ Tidak Tersedia"),      desc: t("vendorFulfillment.stockNoneDesc", "Stok kosong saat ini") },
          ].map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => setField("stockConfirmed", opt.val)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between gap-2 ${
                stockStatus === opt.val
                  ? opt.val === "all"
                    ? "border-emerald-500 bg-emerald-50"
                    : opt.val === "partial"
                    ? "border-amber-400 bg-amber-50"
                    : "border-red-400 bg-red-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div>
                <p className={`text-sm font-semibold ${stockStatus === opt.val ? (opt.val === "all" ? "text-emerald-800" : opt.val === "partial" ? "text-amber-800" : "text-red-800") : "text-slate-700"}`}>
                  {opt.label}
                </p>
                <p className={`text-xs mt-0.5 ${stockStatus === opt.val ? "text-slate-600" : "text-slate-400"}`}>
                  {opt.desc}
                </p>
              </div>
              {stockStatus === opt.val && (
                <span className="text-slate-400 shrink-0">✓</span>
              )}
            </button>
          ))}
        </div>
        {isPartial && (
          <div className="pt-1">
            <Field
              label={t("vendorFulfillment.qtyFulfilledField", "Jumlah yang Dapat Dipenuhi")}
              name="qtyConfirmed"
              value={fields.qtyConfirmed ?? ""}
              onChange={(v) => setField("qtyConfirmed", v)}
              placeholder={t("vendorFulfillment.qtyFulfilledPlaceholder", "Contoh: 50 karton atau 200 kg")}
              required
            />
          </div>
        )}
      </div>

      {/* ── 3. Jadwal ── */}
      {stockStatus && stockStatus !== "none" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">📅 {t("vendorFulfillment.fulfillmentScheduleTitle", "Jadwal Pemenuhan")}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t("vendorFulfillment.readyToShip", "Kapan barang siap dikirim?")}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              {t("vendorFulfillment.readyDateLabel", "Tanggal Siap Kirim")}<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="date"
              value={fields.readyDate ?? ""}
              onChange={(e) => setField("readyDate", e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                getReadyDateWarning(fields.readyDate ?? "")?.level === "error"
                  ? "border-red-400 bg-red-50"
                  : getReadyDateWarning(fields.readyDate ?? "")?.level === "warn"
                  ? "border-amber-400 bg-amber-50"
                  : "border-slate-200"
              }`}
            />
            {fields.readyDate && (
              <p className="text-xs text-emerald-600 font-medium">
                📅 {fmtDateLocal(fields.readyDate)}
              </p>
            )}
            {(() => {
              const w = getReadyDateWarning(fields.readyDate ?? "");
              if (!w) return null;
              return (
                <p className={`text-xs font-medium rounded-lg px-3 py-2 ${
                  w.level === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {w.msg}
                </p>
              );
            })()}
          </div>
          <Field
            label={t("vendorFulfillment.leadTime", "Lead Time")}
            name="leadTime"
            value={fields.leadTime ?? ""}
            onChange={(v) => setField("leadTime", v)}
            placeholder={t("vendorFulfillment.leadTimePlaceholder", "Contoh: 3 hari kerja")}
          />
          {getLeadTimeWarning(fields.leadTime ?? "") && (
            <p className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-3 py-2">
              {getLeadTimeWarning(fields.leadTime ?? "")}
            </p>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t("vendorFulfillment.leadTime", "Lead Time")}</label>
            <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {fields.leadTime || <span className="text-slate-400 italic">{t("vendorFulfillment.leadTimeAuto", "Otomatis dihitung dari tanggal siap")}</span>}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Lokasi Gudang (conditional) ── */}
      {showWarehouse && stockStatus && stockStatus !== "none" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">📍 {t("vendorFulfillment.warehouseTitle", "Lokasi Gudang / Pickup")}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t("vendorFulfillment.warehouseAddressHint", "Alamat lengkap gudang/lokasi pickup barang")}</p>
          </div>
          <Field
            label={t("vendorFulfillment.warehouseAddressLabel", "Alamat Gudang")}
            name="warehouseLocation"
            value={fields.warehouseLocation ?? ""}
            onChange={(v) => setField("warehouseLocation", v)}
            placeholder={t("vendorFulfillment.warehouseAddressPlaceholder", "Jl. Industri No. 10, Kawasan Pabrik, Jakarta Utara")}
            required
          />
        </div>
      )}

      {/* ── 5. Konfirmasi Harga ── */}
      {stockStatus && stockStatus !== "none" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">💰 {t("vendorFulfillment.priceConfirmTitle", "Konfirmasi Harga")}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("vendorFulfillment.orderPrice", "Harga order:")} <span className="font-semibold text-slate-600">{idr(order.grandTotal)}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setField("priceConfirmed", "agree")}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                priceChoice === "agree"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <p className={`text-sm font-semibold ${priceChoice === "agree" ? "text-emerald-800" : "text-slate-700"}`}>
                ✅ {t("vendorFulfillment.agreePrice", "Setuju Harga Asal")}
              </p>
              <p className={`text-xs mt-0.5 ${priceChoice === "agree" ? "text-slate-600" : "text-slate-400"}`}>
                {t("vendorFulfillment.agreePriceDesc", "Harga sesuai")} {idr(order.grandTotal)} {t("vendorFulfillment.includingPpn", "(sudah termasuk PPN)")}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setField("priceConfirmed", "revised")}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                priceChoice === "revised"
                  ? "border-amber-400 bg-amber-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <p className={`text-sm font-semibold ${priceChoice === "revised" ? "text-amber-800" : "text-slate-700"}`}>
                ✏️ {t("vendorFulfillment.revisePrice", "Ajukan Revisi Harga")}
              </p>
              <p className={`text-xs mt-0.5 ${priceChoice === "revised" ? "text-amber-600" : "text-slate-400"}`}>
                {t("vendorFulfillment.revisePriceDesc", "Input harga baru yang Anda tawarkan (sebelum PPN)")}
              </p>
            </button>
          </div>
          {isRevised && (
            <div className="space-y-1.5 pt-1">
              <Field
                label={t("vendorFulfillment.revisedPriceField", "Harga Total Penawaran (sebelum PPN, Rp)")}
                name="revisedPrice"
                type="number"
                value={fields.revisedPrice ?? ""}
                onChange={(v) => setField("revisedPrice", v)}
                placeholder={t("vendorFulfillment.revisedPricePlaceholder", "Contoh: 5000000")}
                required
              />
              {fields.revisedPrice && Number(fields.revisedPrice) > 0 && (
                <div className="bg-amber-50 rounded-lg px-3 py-2.5 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("vendorFulfillment.dpp", "DPP")}</span>
                    <span className="font-medium text-slate-700">{idr(fields.revisedPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PPN {TAX_RATE}%</span>
                    <span className="font-medium text-slate-700">{idr(Math.round(Number(fields.revisedPrice) * TAX_RATE / 100))}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-amber-200 pt-1.5">
                    <span className="text-slate-700">{t("vendorFulfillment.totalInclPpn", "Total inkl. PPN")}</span>
                    <span className="text-amber-700">{idr(Number(fields.revisedPrice) + Math.round(Number(fields.revisedPrice) * TAX_RATE / 100))}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 6. Upload Dokumen ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-5 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-800">📎 {t("vendorFulfillment.uploadDocTitle", "Upload Dokumen")}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t("vendorFulfillment.uploadHint", "Lampirkan foto produk, packing list, invoice, dan dokumen lainnya")}</p>
        </div>
        <UploadField
          label={t("vendorFulfillment.stockPhotoLabel", "Foto Barang / Stok")}
          fileType="stockPhoto"
          url={fields.stockPhotoUrl ?? ""}
          uploading={!!uploading["stockPhoto"]}
          onUpload={handleUpload}
        />
        <UploadField
          label={t("vendorFulfillment.packingListLabel", "Packing List")}
          fileType="packingList"
          url={fields.packingListUrl ?? ""}
          uploading={!!uploading["packingList"]}
          onUpload={handleUpload}
        />
        <UploadField
          label={t("vendorFulfillment.invoiceLabel", "Invoice / Faktur")}
          fileType="invoice"
          url={fields.invoiceUrl ?? ""}
          uploading={!!uploading["invoice"]}
          onUpload={handleUpload}
        />
        <UploadField
          label={t("vendorFulfillment.podLabel", "POD (Proof of Delivery)")}
          fileType="pod"
          url={fields.podUrl ?? ""}
          uploading={!!uploading["pod"]}
          onUpload={handleUpload}
        />
        <UploadField
          label={t("vendorFulfillment.supportingDocLabel", "Dokumen Pendukung Lainnya")}
          fileType="supportingDoc"
          url={fields.supportingDocUrl ?? ""}
          uploading={!!uploading["supportingDoc"]}
          onUpload={handleUpload}
        />
      </div>

      {/* ── 7. Ringkasan Fulfillment ── */}
      {hasSummary && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">📋 {t("vendorFulfillment.fulfillmentSummaryTitle", "Ringkasan Fulfillment")}</h2>
          <div className="space-y-0.5">
            <SummaryRow label={t("vendorFulfillment.stockStatusLabel", "Status Stok")} value={STOCK_LABEL[stockStatus] ?? stockStatus} />
            {isPartial && fields.qtyConfirmed && (
              <SummaryRow label={t("vendorFulfillment.qtyFulfilled", "Qty Terpenuhi")} value={fields.qtyConfirmed} />
            )}
            <SummaryRow label={t("vendorFulfillment.readyDateLabel", "Tanggal Siap Kirim")} value={fmtDateLocal(fields.readyDate)} />
            {fields.leadTime && <SummaryRow label={t("vendorFulfillment.leadTime", "Lead Time")} value={fields.leadTime} />}
            {stockStatus !== "none" && summaryTotal > 0 && (
              <>
                <SummaryRow label={t("vendorFulfillment.dppBase", "DPP (Harga Dasar)")} value={idr(summaryDpp)} />
                <SummaryRow label={`PPN ${TAX_RATE}%`} value={idr(summaryPpn)} />
                <SummaryRow label="Grand Total" value={idr(summaryTotal)} bold />
              </>
            )}
            {priceChoice && (
              <div className="pt-1.5">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  priceChoice === "agree" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {priceChoice === "agree" ? t("vendorFulfillment.agreedPrice", "✅ Setuju harga asal") : t("vendorFulfillment.revisedPriceSubmitted", "✏️ Revisi harga diajukan")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */

export default function VendorFulfillmentPage() {
  const { t } = useLanguage();
  const { token } = useParams<{ token: string }>();
  const [data, setData]       = useState<PageData | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fields, setFields]   = useState<Record<string, string>>({});
  const [notes, setNotes]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const setField = (k: string, v: string) =>
    setFields((prev) => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (!token) return;
    fetch(`/api/vendor-fulfillment/${token}`)
      .then(async (r) => {
        const d = await r.json() as PageData & { error?: string };
        if (!r.ok) throw new Error(d.error ?? t("vendorFulfillment.genericError", "Terjadi kesalahan"));
        setData(d);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const svc = data.serviceType;
    const tmplSnapH = parseTemplateSnapshot(data.order.templateSnapshot);
    const isTemplateServiceH = tmplSnapH?.templateKind === "service";
    const isProduct = !isTemplateServiceH && svc.includes("product");

    if (isProduct) {
      if (!fields.stockConfirmed) { alert(t("vendorFulfillment.selectStockFirst", "Pilih status konfirmasi stok terlebih dahulu.")); return; }
      if (fields.stockConfirmed !== "none") {
        if (!fields.readyDate) { alert(t("vendorFulfillment.readyDateRequired", "Tanggal siap kirim wajib diisi.")); return; }
        if (!fields.priceConfirmed) { alert(t("vendorFulfillment.selectPriceFirst", "Pilih konfirmasi harga terlebih dahulu.")); return; }
        if (fields.priceConfirmed === "revised" && !fields.revisedPrice) {
          alert(t("vendorFulfillment.enterRevisedPrice", "Masukkan harga revisi.")); return;
        }
      }
    }

    const submitBody = isTemplateServiceH
      ? buildTemplateSubmitBody(fields, notes)
      : { ...fields, notes };

    setSubmitting(true);
    try {
      const res = await fetch(`/api/vendor-fulfillment/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitBody),
      });
      const d = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(d.error ?? t("vendorFulfillment.sendFailed", "Gagal mengirim"));
      setJustSubmitted(true);
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (error)   return <ErrorCard message={error} />;
  if (!data)   return <ErrorCard message={t("vendorFulfillment.dataNotFound", "Data tidak ditemukan")} />;

  if (data.isSubmitted) {
    return <SubmittedReview data={data} justSubmitted={false} />;
  }

  if (justSubmitted) {
    return <SubmittedReview data={data} localFields={{ ...fields, notes }} justSubmitted />;
  }

  const svc      = data.serviceType;
  const icon     = getServiceIcon(svc);
  const svcLabel = getServiceLabel(svc);
  const order    = data.order;
  const tmplSnapR = parseTemplateSnapshot(order.templateSnapshot);
  const isTemplateServiceR = tmplSnapR?.templateKind === "service";
  const isTemplateProductR = tmplSnapR?.templateKind === "product";
  const isProduct = !isTemplateServiceR && svc.includes("product");

  const tmplLabel = isTemplateServiceR
    ? ((tmplSnapR as TmplServiceSnapshot).serviceTemplate?.label ?? svcLabel)
    : isTemplateProductR
    ? ((tmplSnapR as TmplProductSnapshot).label ?? svcLabel)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-10 px-4">
      <form onSubmit={handleSubmit}>
        <div className="max-w-lg mx-auto space-y-4">

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{icon}</span>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  {isProduct ? t("vendorFulfillment.productFulfillmentConfirm", "Konfirmasi Pemenuhan Produk") : `${t("vendorFulfillment.fulfillmentForm", "Form Fulfillment")} ${tmplLabel ?? svcLabel}`}
                </h1>
                {data.vendorName && (
                  <p className="text-sm text-slate-500">{t("vendorFulfillment.vendor", "Vendor")}: {data.vendorName}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {isProduct
                ? t("vendorFulfillment.productFormDesc", "Lengkapi data konfirmasi produk, stok, harga, dan jadwal pengiriman.")
                : t("vendorFulfillment.serviceFormDesc", "Lengkapi data di bawah ini untuk mengkonfirmasi penugasan order Anda.")}
            </p>
          </div>

          {/* Order info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">{t("vendorFulfillment.orderDetail", "Detail Order")}</h2>
            <div className="space-y-2.5">
              <OrderRow label={t("vendorFulfillment.orderNumber", "No. Order")} value={order.orderNumber} />
              {order.customerName && <OrderRow label={t("vendorFulfillment.customer", "Customer")} value={order.customerName} />}
              {!isProduct && <OrderRow label={t("vendorFulfillment.service", "Layanan")} value={tmplLabel ?? order.serviceType} />}
              {!isProduct && <OrderRow label={t("vendorFulfillment.route", "Rute")} value={`${order.origin} → ${order.destination}`} />}
              {order.commodity && <OrderRow label={t("vendorFulfillment.commodity", "Komoditi")} value={order.commodity} />}
              {order.grossWeight && !isProduct && <OrderRow label={t("vendorFulfillment.weight", "Berat")} value={`${order.grossWeight} kg`} />}
              {order.requiredDate && <OrderRow label={t("vendorFulfillment.requiredDate", "Tgl Butuh")} value={order.requiredDate} />}
              {order.vehicleType && !isProduct && <OrderRow label={t("vendorFulfillment.vehicleTypeOrder", "Tipe Kendaraan")} value={order.vehicleType} />}
            </div>
          </div>

          {/* Fulfillment fields */}
          <div className={`${isProduct ? "" : "bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 space-y-4"}`}>
            {!isProduct && !isTemplateServiceR && (
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                {icon} {t("vendorFulfillment.fulfillmentData", "Data Fulfillment")}
              </h2>
            )}
            {!isProduct && isTemplateServiceR && (
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                {icon} {t("vendorFulfillment.fulfillmentData", "Data Fulfillment")} — {tmplLabel}
              </h2>
            )}
            {isTemplateServiceR && (
              <TemplateDrivenServiceForm
                snap={tmplSnapR as TmplServiceSnapshot}
                fields={fields}
                setField={setField}
                token={token!}
              />
            )}
            {!isTemplateServiceR && svc.includes("trucking") && <TruckingFields fields={fields} setField={setField} token={token!} />}
            {!isTemplateServiceR && (svc.includes("freight_air") || svc.includes("freight_sea") || svc.includes("freight")) &&
              !svc.includes("trucking") && <FreightFields fields={fields} setField={setField} />}
            {isProduct && (
              <ProductFulfillmentForm
                order={order}
                fields={fields}
                setField={setField}
                token={token!}
              />
            )}
            {!isTemplateServiceR && svc.includes("customs") && <CustomsFields fields={fields} setField={setField} />}
            {!isTemplateServiceR && svc.includes("general") && (
              <p className="text-sm text-slate-500">{t("vendorFulfillment.fillNotesDesc", "Isi catatan di bawah untuk menjelaskan progres fulfillment Anda.")}</p>
            )}

            {/* Catatan tambahan */}
            <div className={`${isProduct ? "bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-5" : ""} space-y-1.5`}>
              <label className="text-sm font-medium text-slate-700">{t("vendorFulfillment.additionalNotes", "Catatan Tambahan")}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={t("vendorFulfillment.additionalNotesPlaceholder", "Catatan operasional, kendala, atau informasi lain yang relevan...")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-base transition-colors active:scale-95 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("vendorFulfillment.sending", "Mengirim...")}
              </>
            ) : isProduct ? (
              t("vendorFulfillment.confirmProductFulfillment", "✓ Konfirmasi Pemenuhan Produk")
            ) : (
              t("vendorFulfillment.submitFulfillmentData", "Kirim Data Fulfillment")
            )}
          </button>

          <p className="text-center text-xs text-slate-400 pb-8">
            {isProduct
              ? t("vendorFulfillment.productSubmitNote", "Data Anda akan langsung diproses oleh tim kami")
              : t("vendorFulfillment.serviceSubmitNote", "Data tidak dapat diubah setelah dikirim")}
          </p>

        </div>
      </form>
    </div>
  );
}
