import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";
import { PriceBreakdown } from "@/components/PriceBreakdown";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderInfo = {
  id: number;
  orderNumber: string;
  customerName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  orderType: string | null;
  serviceType: string;
  origin: string;
  destination: string;
  commodity: string | null;
  cargoDescription: string | null;
  grossWeight: string | null;
  volumeCbm: string | null;
  jumlahKoli: number | null;
  requiredDate: string | null;
  notes: string | null;
  paymentType: string | null;
  grandTotal: string | null;
  subtotalBeforeTax?: string | null;
  taxRate?: number | null;
  taxAmount?: string | null;
  status: string;
  items?: Array<{ serviceName: string; category: string; subtotal: string | null; quantity?: string | null; unit?: string | null }>;
};

type Vendor = {
  id: number;
  name: string;
  phone: string | null;
  hasPhone?: boolean;
  serviceType?: string | null;
  isMatching?: boolean;
  hasCommodityMatch?: boolean;
  priceBase?: number | null;
  orderQty?: number | null;
  orderUnit?: string | null;
  vendorEstSubtotal?: number | null;
  vendorEstTax?: number | null;
  vendorEstTotal?: number | null;
  taxRate?: number | null;
};

type VendorRow = {
  linkId: number;
  vendorId: number;
  vendorName: string;
  status: string;
  basicPrice: number | null;
  offeredPrice: number | null;
  eta: string | null;
  notes: string | null;
  submittedAt: string | null;
};

type Rfq = { id: number; rfqNumber: string; status: string };

type BaseData = {
  token: string;
  actionType: string;
  isUsed: boolean;
  usedAt: string | null;
  order: OrderInfo;
};

type ReviewData = BaseData & { vendors: Vendor[]; rfqs: Rfq[]; vendorFilterApplied: boolean; filterMode: "service" | "commodity" | "etalase" | "none"; shipmentType: string; commodity: string | null };
type CompareData = BaseData & { rfq: Rfq; vendors: VendorRow[] };
type ForwardData = BaseData & {
  rfq: Rfq | null;
  selectedVendor: Vendor | null;
  selectedVendorLink: { id: number; vendorId: number; offeredPrice: string | null } | null;
};

type VendorFulfillmentLink = {
  id: number; serviceType: string; status: string;
  stockConfirmed: string | null; qtyConfirmed: string | null;
  readyDate: string | null; leadTime: string | null; warehouseLocation: string | null;
  priceConfirmed: string | null; revisedPrice: number | null;
  notes: string | null; stockPhotoUrl: string | null;
  invoiceUrl: string | null; supportingDocUrl: string | null;
  submittedAt: string | null;
};
type ConfirmFulfillmentData = BaseData & { vendorFulfillmentLink: VendorFulfillmentLink | null };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const idr = (n: number | null | undefined) =>
  n == null ? "—" : `Rp ${Math.round(n).toLocaleString("id-ID")}`;

function Loader({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}

function SuccessCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between gap-2 py-1 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <span className="text-xs text-slate-700 text-right font-medium">{value}</span>
    </div>
  );
}

function OrderCard({ order }: { order: OrderInfo }) {
  const { t } = useLanguage();
  const isProduct = order.orderType === "product";
  const hasRoute = !isProduct && (order.origin || order.destination);
  const idr = (v: string | null) => v && Number(v) > 0 ? `Rp ${Math.round(Number(v)).toLocaleString("id-ID")}` : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{isProduct ? "🛍️" : "🚢"}</span>
        <div>
          <h1 className="text-lg font-bold text-slate-800">{order.orderNumber}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {order.companyName ? `${order.companyName} · ` : ""}{order.customerName}
          </p>
        </div>
        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">{order.status}</span>
      </div>

      <div className="space-y-0.5">
        {hasRoute && (
          <div className="flex justify-between gap-2 py-1 border-b border-slate-50">
            <span className="text-xs text-slate-400 shrink-0">{t("adminAction.route", "Rute")}</span>
            <span className="text-xs text-slate-700 text-right font-medium">
              {order.origin || "?"} → {order.destination || "?"}
            </span>
          </div>
        )}
        <DetailRow label={t("adminAction.commodity", "Komoditi")} value={order.commodity} />
        <DetailRow label={t("adminAction.cargoDescription", "Deskripsi Kargo")} value={order.cargoDescription} />
        {(order.grossWeight || order.volumeCbm || order.jumlahKoli) && (
          <div className="flex justify-between gap-2 py-1 border-b border-slate-50">
            <span className="text-xs text-slate-400 shrink-0">{t("adminAction.dimensionsWeight", "Dimensi / Berat")}</span>
            <span className="text-xs text-slate-700 text-right font-medium">
              {[
                order.grossWeight ? `${Number(order.grossWeight).toLocaleString("id-ID")} kg` : null,
                order.volumeCbm ? `${Number(order.volumeCbm).toLocaleString("id-ID")} CBM` : null,
                order.jumlahKoli ? `${order.jumlahKoli} koli` : null,
              ].filter(Boolean).join(" · ")}
            </span>
          </div>
        )}
        {order.items && order.items.length > 0 && (
          <div className="py-2 border-b border-slate-50">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">{isProduct ? t("adminAction.orderedProducts", "Produk Dipesan") : t("adminAction.serviceItems", "Layanan / Item")}</p>
            <ul className="space-y-2">
              {order.items.map((it, i) => (
                <li key={i} className="text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-700">• {it.serviceName}</span>
                    <span className="text-slate-500 shrink-0">{idr(it.subtotal) ?? ""}</span>
                  </div>
                  {it.quantity && (
                    <div className="flex justify-between gap-2 ml-3 mt-0.5">
                      <span className="text-slate-400">Quantity</span>
                      <span className="text-slate-500 shrink-0">{it.quantity}{it.unit ? ` ${it.unit}` : ""}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <DetailRow label={t("adminAction.requiredDate", "Tanggal Diperlukan")} value={order.requiredDate} />
        <DetailRow label={t("adminAction.payment", "Pembayaran")} value={order.paymentType} />
        {order.grandTotal && Number(order.grandTotal) > 0 && (
          <PriceBreakdown
            subtotal={order.subtotalBeforeTax ? Number(order.subtotalBeforeTax) : null}
            taxRate={order.taxRate ?? 11}
            taxAmount={order.taxAmount ? Number(order.taxAmount) : null}
            grandTotal={Number(order.grandTotal)}
            subtotalLabel={order.orderType === "product" ? t("adminAction.productSubtotal", "Subtotal Produk") : t("adminAction.subtotal", "Subtotal")}
            grandTotalLabel="Grand Total"
            className="mt-1"
          />
        )}
        {order.notes && (
          <div className="pt-2 mt-1">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">{t("adminAction.customerNotes", "Catatan Customer")}</p>
            <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_BADGE: Record<string, string> = {
  waiting_response: "bg-yellow-100 text-yellow-800",
  accepted_basic_price: "bg-green-100 text-green-800",
  counter_offer: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-500",
  not_selected: "bg-gray-100 text-gray-500",
  selected: "bg-emerald-100 text-emerald-800",
};

const STATUS_LABEL: Record<string, string> = {
  waiting_response: "Menunggu",
  accepted_basic_price: "Terima Harga Dasar",
  counter_offer: "Counter Offer",
  rejected: "Menolak",
  expired: "Kadaluarsa",
  not_selected: "Tidak Dipilih",
  selected: "Dipilih",
};

// ─── Review Order View (blast vendors) ───────────────────────────────────────

function ReviewOrderView({ token, data }: { token: string; data: ReviewData }) {
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deadline, setDeadline] = useState(48);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const toggle = (id: number) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleBlast = async () => {
    if (!selectedIds.length) { alert(t("adminAction.selectAtLeastOneVendor", "Pilih minimal satu vendor.")); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin-action/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorIds: selectedIds, deadlineHours: deadline }),
      });
      const d = await res.json() as { ok?: boolean; error?: string; rfqNumber?: string; results?: { vendorName: string; sent: boolean }[] };
      if (!res.ok) throw new Error(d.error ?? t("adminAction.failed", "Gagal"));
      const sent = (d.results ?? []).filter((r) => r.sent).map((r) => r.vendorName).join(", ");
      setResult({ ok: true, message: `RFQ ${d.rfqNumber} ${t("adminAction.rfqBlastSuccess", "berhasil di-blast ke")}: ${sent || t("adminAction.selectedVendors", "vendor terpilih")}.` });
    } catch (e: unknown) {
      setResult({ ok: false, message: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.ok) return <SuccessCard title={t("adminAction.rfqSent", "RFQ Terkirim!")} message={result.message} />;

  const hasServiceType = !!(data.shipmentType && data.shipmentType.trim());
  const hasCommodity   = !!(data.commodity && data.commodity.trim());
  const filterMode     = data.filterMode ?? "none";

  const VENDOR_CONFIRMED_STATUSES = ["Vendor Confirmed", "In Progress", "Completed", "Cancelled"];
  const isVendorConfirmed = VENDOR_CONFIRMED_STATUSES.includes(data.order.status ?? "");

  const vendorsWithPhone    = data.vendors.filter((v) => v.hasPhone !== false && !!v.phone);
  const vendorsWithoutPhone = data.vendors.filter((v) => v.hasPhone === false || !v.phone);
  const selectedCount = selectedIds.filter((id) => vendorsWithPhone.some((v) => v.id === id)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold text-slate-800">{t("adminAction.reviewOrderTitle", "Review Order & Blast Vendor")}</h1>
          </div>
          <p className="text-sm text-slate-500">{t("adminAction.reviewOrderSub", "Pilih vendor yang akan menerima RFQ untuk order ini.")}</p>
        </div>

        <OrderCard order={data.order} />

        {isVendorConfirmed && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl px-4 py-3 text-sm text-emerald-800">
            <p className="font-semibold mb-1">✅ {t("adminAction.vendorSubmittedFulfillment", "Vendor sudah submit fulfillment (status:")} {data.order.status})</p>
            <p className="text-xs text-emerald-700">
              {t("adminAction.nextStepFulfillment", "Langkah selanjutnya: buka link")} <strong>{t("adminAction.confirmFulfillment", "Konfirmasi Fulfillment")}</strong> {t("adminAction.sentViaWhatsApp", "yang dikirim via WhatsApp ke admin,")}{" "}
              {t("adminAction.thenClickConfirm", "lalu klik")} "{t("adminAction.confirmAndStart", "Konfirmasi & Mulai Pengiriman")}" {t("adminAction.onThatPage", "di halaman tersebut.")}{" "}
              {t("adminAction.ifNoWhatsapp", "Jika tidak menerima WA, hubungi tim teknis.")}
            </p>
          </div>
        )}

        {data.isUsed && !isVendorConfirmed && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
            ⚠️ {t("adminAction.linkAlreadyUsed", "Link ini sudah pernah digunakan. Anda masih bisa blast ulang ke vendor lain.")}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-slate-800">
              {t("adminAction.availableVendors", "Vendor Tersedia")} ({data.vendors.length})
            </h2>
            {filterMode === "service" && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Filter: {data.shipmentType}
              </span>
            )}
            {filterMode === "commodity" && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                Filter: {data.commodity}
              </span>
            )}
          </div>

          {/* Kasus: shipmentType ada, tidak ada vendor yg cocok */}
          {hasServiceType && !data.vendorFilterApplied && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
              ℹ️ {t("adminAction.noMatchingVendor", "Tidak ada vendor yang cocok dengan")} "<strong>{data.shipmentType}</strong>" — {t("adminAction.showingAllActive", "menampilkan semua vendor aktif.")}.
            </div>
          )}
          {/* Kasus: shipmentType kosong, ada commodity / item produk */}
          {filterMode === "commodity" && (() => {
            const label = (data.commodity && data.commodity.trim())
              || (data.order.items && data.order.items[0]?.serviceName)
              || "";
            return data.vendors.length > 0 ? (
              <div className="mb-3 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700">
                ✅ {t("adminAction.showingVendorsSelling", "Menampilkan vendor yang menjual")} "<strong>{label}</strong>" {t("adminAction.inCatalog", "di etalase.")}.
              </div>
            ) : (
              <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                ⚠️ {t("adminAction.noVendorWithCommodity", "Belum ada vendor yang punya")} "<strong>{label}</strong>" {t("adminAction.inCatalogAddFirst", "di etalase. Tambahkan item ke katalog vendor terlebih dahulu.")}.
              </div>
            );
          })()}
          {/* Kasus: shipmentType kosong, menampilkan hanya vendor yg punya etalase */}
          {filterMode === "etalase" && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700">
              🛍️ {t("adminAction.productOrderShowCatalog", "Order produk — menampilkan vendor yang memiliki katalog produk/etalase.")}
            </div>
          )}
          {/* Kasus: tidak ada etalase sama sekali, fallback ke serviceType */}
          {!hasServiceType && !data.vendorFilterApplied && filterMode === "none" && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
              ⚠️ {t("adminAction.noCatalogFallback", "Belum ada vendor dengan etalase produk — menampilkan vendor berdasarkan tipe layanan terdaftar.")}
            </div>
          )}

          {data.vendors.length === 0 ? (
            <p className="text-sm text-slate-500 mt-2">{t("adminAction.noActiveVendors", "Tidak ada vendor aktif yang terdaftar di sistem.")}</p>
          ) : (
            <div className="space-y-2 mt-3">
              {/* Vendor dengan WA/phone — bisa diblast */}
              {vendorsWithPhone.map((v) => (
                <label key={v.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedIds.includes(v.id) ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(v.id)}
                    onChange={() => toggle(v.id)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-medium text-slate-800 text-sm">{v.name}</p>
                      {v.hasCommodityMatch && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">✓ {t("adminAction.commodity", "Komoditi")}</span>
                      )}
                      {v.isMatching && !v.hasCommodityMatch && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">✓ {t("adminAction.service", "Layanan")}</span>
                      )}
                    </div>
                    {v.priceBase != null && (
                      <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                        <div className="flex justify-between gap-2">
                          <span>{t("adminAction.basePrice", "Harga Dasar")}{v.orderUnit ? ` / ${v.orderUnit}` : ""}</span>
                          <span className="font-semibold text-slate-700">Rp {Math.round(v.priceBase).toLocaleString("id-ID")}{v.orderUnit ? `/${v.orderUnit}` : ""}</span>
                        </div>
                        {v.vendorEstSubtotal != null && v.orderQty != null && (
                          <>
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-400">{t("adminAction.subtotal", "Subtotal")} <span className="text-slate-300">({Math.round(v.priceBase).toLocaleString("id-ID")} × {v.orderQty}{v.orderUnit ? ` ${v.orderUnit}` : ""})</span></span>
                              <span className="font-semibold text-slate-700">Rp {v.vendorEstSubtotal.toLocaleString("id-ID")}</span>
                            </div>
                            {v.vendorEstTax != null && (
                              <div className="flex justify-between gap-2">
                                <span className="text-slate-400">PPN {v.taxRate ?? 11}% <span className="text-slate-300">({v.vendorEstSubtotal.toLocaleString("id-ID")} × {v.taxRate ?? 11}%)</span></span>
                                <span className="text-slate-600">Rp {v.vendorEstTax.toLocaleString("id-ID")}</span>
                              </div>
                            )}
                            {v.vendorEstTotal != null && (
                              <div className="flex justify-between gap-2 font-semibold border-t border-slate-100 pt-1 mt-0.5">
                                <span className="text-slate-700">{t("adminAction.estGrandTotal", "Est. Grand Total")}</span>
                                <span className="text-slate-800">IDR {v.vendorEstTotal.toLocaleString("id-ID")}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {v.phone && <span className="text-xs text-slate-400 shrink-0">{v.phone}</span>}
                </label>
              ))}

              {/* Vendor tanpa WA — tidak bisa diblast, tampil greyed out */}
              {vendorsWithoutPhone.length > 0 && (
                <>
                  {vendorsWithPhone.length > 0 && (
                    <p className="text-[11px] text-slate-400 pt-1 pb-0.5">{t("adminAction.vendorsNoWhatsApp", "Vendor berikut tidak memiliki nomor WA — tidak bisa di-blast:")}</p>
                  )}
                  {vendorsWithPhone.length === 0 && (
                    <div className="mb-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                      ⚠️ {t("adminAction.allVendorsNoWhatsApp", "Semua vendor aktif belum memiliki nomor WhatsApp. Tambahkan nomor WA vendor di menu Pembelian → Vendor agar bisa di-blast.")}
                    </div>
                  )}
                  {vendorsWithoutPhone.map((v) => (
                    <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 opacity-60">
                      <div className="w-4 h-4 rounded border border-slate-300 bg-slate-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-medium text-slate-500 text-sm">{v.name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500">{t("adminAction.noWA", "Tanpa WA")}</span>
                          {v.hasCommodityMatch && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-600 border border-green-200">✓ {t("adminAction.commodity", "Komoditi")}</span>
                          )}
                        </div>
                        {v.serviceType && <p className="text-xs text-slate-400 mt-0.5">{v.serviceType}</p>}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <label className="text-sm font-medium text-slate-700 block mb-2">
            {t("adminAction.vendorResponseDeadline", "Batas Waktu Respons Vendor")}
          </label>
          <select
            value={deadline}
            onChange={(e) => setDeadline(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value={24}>24 {t("adminAction.hours", "jam")}</option>
            <option value={48}>48 {t("adminAction.hours", "jam")}</option>
            <option value={72}>72 {t("adminAction.hours", "jam")}</option>
          </select>
        </div>

        {result && !result.ok && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠️ {result.message}
          </div>
        )}

        <button
          onClick={handleBlast}
          disabled={submitting || selectedCount === 0}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm transition-colors"
        >
          {submitting ? t("adminAction.sending", "Mengirim...") : `🚀 ${t("adminAction.blastRfq", "Blast RFQ ke")} ${selectedCount} ${t("adminAction.vendorCount", "Vendor")}`}
        </button>

      </div>
    </div>
  );
}

// ─── Compare Vendors View ─────────────────────────────────────────────────────

function CompareVendorsView({ token, data }: { token: string; data: CompareData }) {
  const { t } = useLanguage();
  const [selectedLinkId, setSelectedLinkId] = useState<number | null>(null);
  const [sellingPrice, setSellingPrice] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [sendToCustomer, setSendToCustomer] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Auto-select vendor termurah saat mount
  useEffect(() => {
    const answered = data.vendors.filter((v) => v.offeredPrice !== null || v.status === "accepted_basic_price");
    if (answered.length === 0) return;
    const cheapest = answered.reduce((a, b) => {
      const pa = a.offeredPrice ?? a.basicPrice ?? Infinity;
      const pb = b.offeredPrice ?? b.basicPrice ?? Infinity;
      return pa <= pb ? a : b;
    });
    setSelectedLinkId(cheapest.linkId);
    const price = cheapest.offeredPrice ?? cheapest.basicPrice;
    if (price != null) setSellingPrice(String(price));
  }, [data.vendors]);

  const handleSelect = async () => {
    if (!selectedLinkId) { alert(t("adminAction.selectVendorFirst", "Pilih vendor terlebih dahulu.")); return; }
    if (sendToCustomer && !sellingPrice) { alert(t("adminAction.sellingPriceRequired", "Harga jual ke customer wajib diisi.")); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin-action/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId: selectedLinkId,
          sellingPrice: sellingPrice ? Number(sellingPrice) : undefined,
          quoteNotes: quoteNotes || undefined,
          sendQuoteToCustomer: sendToCustomer,
        }),
      });
      const d = await res.json() as { ok?: boolean; error?: string; vendorName?: string; quoteUrl?: string; waSent?: boolean };
      if (!res.ok) throw new Error(d.error ?? t("adminAction.failed", "Gagal"));
      const msg = `${t("adminAction.vendorSelected", "Vendor")} ${d.vendorName ?? ""} ${t("adminAction.selectedSuffix", "dipilih.")}${d.waSent ? ` ${t("adminAction.waSentToCustomer", "WA penawaran terkirim ke customer.")}` : d.quoteUrl ? ` ${t("adminAction.quotePreparedNoPhone", "Penawaran disiapkan (nomor HP customer tidak ada — WA tidak terkirim).")}` : ""}`;
      setResult({ ok: true, message: msg });
    } catch (e: unknown) {
      setResult({ ok: false, message: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.ok) return <SuccessCard title={t("adminAction.vendorChosen", "Vendor Dipilih!")} message={result.message} />;

  const answered = data.vendors.filter((v) => v.offeredPrice !== null || v.status === "accepted_basic_price");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⚖️</span>
            <h1 className="text-xl font-bold text-slate-800">{t("adminAction.compareVendorsTitle", "Bandingkan Penawaran Vendor")}</h1>
          </div>
          <p className="text-sm text-slate-500">RFQ: {data.rfq.rfqNumber} · {answered.length}/{data.vendors.length} {t("adminAction.vendorsResponded", "vendor merespons")}</p>
        </div>

        <OrderCard order={data.order} />

        <div className="space-y-3">
          {data.vendors.map((v) => {
            const price = v.offeredPrice ?? v.basicPrice;
            const isSelected = selectedLinkId === v.linkId;
            const hasResponse = v.offeredPrice !== null || v.status === "accepted_basic_price";
            return (
              <button
                key={v.linkId}
                onClick={() => {
                  if (!hasResponse) return;
                  setSelectedLinkId(v.linkId);
                  const p = v.offeredPrice ?? v.basicPrice;
                  if (p != null) setSellingPrice(String(p));
                }}
                disabled={!hasResponse}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200"
                    : hasResponse
                    ? "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
                    : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 text-sm">{v.vendorName}</p>
                      {isSelected && <span className="text-xs bg-indigo-600 text-white rounded-full px-2 py-0.5">✓ {t("adminAction.chosen", "Dipilih")}</span>}
                    </div>
                    {v.eta && <p className="text-xs text-slate-500 mt-0.5">ETA: {v.eta}</p>}
                    {v.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{v.notes}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-800">{idr(price)}</p>
                    <span className={`text-xs rounded-full px-2 py-0.5 mt-1 inline-block ${STATUS_BADGE[v.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABEL[v.status] ?? v.status}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedLinkId && (() => {
          const sel = data.vendors.find((v) => v.linkId === selectedLinkId);
          const vendorPrice = sel ? (sel.offeredPrice ?? sel.basicPrice) : null;
          return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <h2 className="font-semibold text-slate-800">💰 {t("adminAction.sellingPriceToCustomer", "Harga Jual ke Customer")}</h2>

              {/* Harga vendor dipilih — seluruh baris bisa diklik */}
              {vendorPrice != null && (
                <button
                  type="button"
                  onClick={() => setSellingPrice(String(vendorPrice))}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group"
                >
                  <div className="text-left">
                    <p className="text-[11px] text-slate-400 mb-0.5">{t("adminAction.selectedVendorPrice", "Harga vendor dipilih")}</p>
                    <p className="text-sm font-semibold text-slate-800">{idr(vendorPrice)}</p>
                  </div>
                  <span className="text-xs text-indigo-600 font-medium group-hover:underline shrink-0">{t("adminAction.useThisPrice", "Pakai harga ini")}</span>
                </button>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">{t("adminAction.sellingPrice", "Harga Jual")} (Rp)</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder={t("adminAction.sellingPricePlaceholder", "Contoh: 5500000")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {sellingPrice && (
                  <p className="text-xs text-slate-400">{idr(Number(sellingPrice))}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">{t("adminAction.notesOptional", "Catatan (opsional)")}</label>
                <textarea
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  rows={2}
                  placeholder={t("adminAction.quoteNotesPlaceholder", "Syarat & kondisi, catatan untuk customer...")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

              {/* Checkbox kirim WA — default checked, posisi bawah */}
              <label className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border transition-colors ${sendToCustomer ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                <input
                  type="checkbox"
                  checked={sendToCustomer}
                  onChange={(e) => setSendToCustomer(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-slate-700">📤 {t("adminAction.sendQuoteViaWA", "Kirim penawaran ke customer via WA")}</p>
                  <p className="text-xs text-slate-500">{t("adminAction.sendQuoteViaWASub", "Customer akan menerima link untuk menyetujui / menolak harga")}</p>
                </div>
              </label>
            </div>
          );
        })()}

        {result && !result.ok && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠️ {result.message}
          </div>
        )}

        <button
          onClick={handleSelect}
          disabled={submitting || !selectedLinkId}
          className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm transition-colors"
        >
          {submitting ? t("adminAction.processing", "Memproses...") : `✅ ${t("adminAction.confirmVendorChoice", "Konfirmasi Pilihan Vendor")}`}
        </button>

      </div>
    </div>
  );
}

// ─── Forward Vendor View ──────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { value: "trucking", label: "🚚 Trucking" },
  { value: "freight_air", label: "✈️ Freight Udara" },
  { value: "freight_sea", label: "🚢 Freight Laut" },
  { value: "product", label: "📦 Produk / Gudang" },
  { value: "customs", label: "🏛️ Kepabeanan" },
  { value: "general", label: "🔧 Umum" },
];

function ForwardVendorView({ token, data }: { token: string; data: ForwardData }) {
  const { t } = useLanguage();
  const [serviceType, setServiceType] = useState("trucking");
  const [customVendorId, setCustomVendorId] = useState<number | null>(
    data.selectedVendor?.id ?? null
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const vendorId = customVendorId ?? data.selectedVendor?.id;

  const handleForward = async () => {
    if (!vendorId) { alert(t("adminAction.selectVendorFirst", "Pilih vendor terlebih dahulu.")); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin-action/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, serviceType }),
      });
      const d = await res.json() as { ok?: boolean; error?: string; vendorName?: string };
      if (!res.ok) throw new Error(d.error ?? t("adminAction.failed", "Gagal"));
      setResult({ ok: true, message: `${t("adminAction.fulfillmentLinkSent", "Link fulfillment dikirim ke")} ${d.vendorName ?? t("adminAction.vendor", "vendor")} ${t("adminAction.viaWhatsApp", "via WhatsApp.")}.` });
    } catch (e: unknown) {
      setResult({ ok: false, message: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.ok) return <SuccessCard title={t("adminAction.vendorForwarded", "Vendor Diteruskan!")} message={result.message} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📤</span>
            <h1 className="text-xl font-bold text-slate-800">{t("adminAction.forwardVendorTitle", "Forward ke Vendor untuk Eksekusi")}</h1>
          </div>
          <p className="text-sm text-slate-500">{t("adminAction.forwardVendorSub", "Kirim link fulfillment ke vendor untuk mengisi data operasional.")}</p>
        </div>

        <OrderCard order={data.order} />

        {data.selectedVendor && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <p className="text-sm font-medium text-emerald-800">✅ {t("adminAction.selectedVendorLabel", "Vendor Terpilih:")} {data.selectedVendor.name}</p>
            {data.selectedVendorLink?.offeredPrice && (
              <p className="text-xs text-emerald-600 mt-0.5">{t("adminAction.price", "Harga:")}: {idr(Number(data.selectedVendorLink.offeredPrice))}</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t("adminAction.serviceTypeForFulfillment", "Jenis Layanan untuk Fulfillment")}</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {SERVICE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {!data.selectedVendor && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{t("adminAction.vendorIdLabel", "Vendor ID (jika belum ada di RFQ)")}</label>
              <input
                type="number"
                value={customVendorId ?? ""}
                onChange={(e) => setCustomVendorId(Number(e.target.value) || null)}
                placeholder={t("adminAction.vendorIdPlaceholder", "Masukkan vendor ID...")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          )}
        </div>

        {result && !result.ok && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠️ {result.message}
          </div>
        )}

        <button
          onClick={handleForward}
          disabled={submitting || !vendorId}
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm transition-colors"
        >
          {submitting ? t("adminAction.sending", "Mengirim...") : `📨 ${t("adminAction.sendFulfillmentLink", "Kirim Link Fulfillment ke Vendor")}`}
        </button>

      </div>
    </div>
  );
}

// ─── Confirm Fulfillment View ─────────────────────────────────────────────────

function ConfirmFulfillmentView({ token, data }: { token: string; data: ConfirmFulfillmentData }) {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const vfl = data.vendorFulfillmentLink;

  const STOCK_MAP: Record<string, string> = {
    all: `✅ ${t("adminAction.stockAll", "Tersedia Semua")}`,
    partial: `⚠️ ${t("adminAction.stockPartial", "Tersedia Sebagian")}`,
    none: `❌ ${t("adminAction.stockNone", "Tidak Tersedia")}`,
  };
  const PRICE_MAP: Record<string, string> = {
    agree: `✅ ${t("adminAction.priceAgree", "Setuju harga asal")}`,
    revised: `✏️ ${t("adminAction.priceRevised", "Revisi harga")}`,
  };

  const handleConfirm = async () => {
    if (!confirm(t("adminAction.confirmFulfillmentPrompt", "Konfirmasi fulfillment? Order akan diubah ke In Progress dan WA dikirim ke customer."))) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin-action/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const d = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(d.error ?? t("adminAction.failed", "Gagal"));
      setResult({ ok: true, message: t("adminAction.orderConfirmedMessage", "Order dikonfirmasi. WA otomatis dikirim ke customer.") });
    } catch (e: unknown) {
      setResult({ ok: false, message: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.ok) return <SuccessCard title={`✅ ${t("adminAction.confirmed", "Dikonfirmasi!")}`} message={result.message} />;

  const alreadyDone = data.order.status === "In Progress" || data.order.status === "Completed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🚀</span>
            <h1 className="text-xl font-bold text-slate-800">{t("adminAction.confirmFulfillmentTitle", "Konfirmasi Fulfillment Vendor")}</h1>
          </div>
          <p className="text-sm text-slate-500">{t("adminAction.confirmFulfillmentSub", "Vendor telah submit data. Tinjau lalu konfirmasi untuk mulai pengiriman.")}</p>
        </div>

        <OrderCard order={data.order} />

        {vfl ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📦</span>
                <h2 className="font-semibold text-slate-800">{t("adminAction.dataFromVendor", "Data dari Vendor")}</h2>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${vfl.status === "submitted" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {vfl.status === "submitted" ? `✅ ${t("adminAction.submitted", "Submitted")}` : vfl.status}
              </span>
            </div>
            <div className="space-y-0.5">
              {vfl.stockConfirmed && <DetailRow label={t("adminAction.stockStatus", "Status Stok")} value={STOCK_MAP[vfl.stockConfirmed] ?? vfl.stockConfirmed} />}
              {vfl.qtyConfirmed && <DetailRow label={t("adminAction.qtyFulfilled", "Qty Dipenuhi")} value={vfl.qtyConfirmed} />}
              {vfl.readyDate && <DetailRow label={t("adminAction.readyToShipDate", "Tanggal Siap Kirim")} value={vfl.readyDate} />}
              {vfl.leadTime && <DetailRow label={t("adminAction.leadTime", "Lead Time")} value={vfl.leadTime} />}
              {vfl.warehouseLocation && <DetailRow label={t("adminAction.warehouseLocation", "Lokasi Gudang")} value={vfl.warehouseLocation} />}
              {vfl.priceConfirmed && <DetailRow label={t("adminAction.priceConfirmation", "Konfirmasi Harga")} value={PRICE_MAP[vfl.priceConfirmed] ?? vfl.priceConfirmed} />}
              {vfl.revisedPrice != null && vfl.priceConfirmed === "revised" && (
                <DetailRow label={t("adminAction.revisedPriceDpp", "Harga Revisi (DPP)")} value={idr(vfl.revisedPrice)} />
              )}
              {vfl.notes && <DetailRow label={t("adminAction.notes", "Catatan")} value={vfl.notes} />}
              {vfl.stockPhotoUrl && (
                <div className="flex justify-between gap-2 py-1 border-b border-slate-50">
                  <span className="text-xs text-slate-400 shrink-0">{t("adminAction.stockPhoto", "Foto Stok")}</span>
                  <a href={vfl.stockPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">{t("adminAction.viewPhoto", "Lihat foto")} ↗</a>
                </div>
              )}
              {vfl.invoiceUrl && (
                <div className="flex justify-between gap-2 py-1 border-b border-slate-50">
                  <span className="text-xs text-slate-400 shrink-0">{t("adminAction.invoice", "Invoice")}</span>
                  <a href={vfl.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">{t("adminAction.viewInvoice", "Lihat invoice")} ↗</a>
                </div>
              )}
              {vfl.supportingDocUrl && (
                <div className="flex justify-between gap-2 py-1 border-b border-slate-50">
                  <span className="text-xs text-slate-400 shrink-0">{t("adminAction.supportingDoc", "Dok. Pendukung")}</span>
                  <a href={vfl.supportingDocUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">{t("adminAction.viewDocument", "Lihat dokumen")} ↗</a>
                </div>
              )}
              {vfl.submittedAt && (
                <p className="text-[10px] text-slate-400 pt-2">
                  {t("adminAction.submittedAt", "Disubmit:")}: {new Date(vfl.submittedAt).toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
            ⚠️ {t("adminAction.noFulfillmentData", "Belum ada data fulfillment dari vendor.")}
          </div>
        )}

        {alreadyDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
            ✅ {t("adminAction.alreadyConfirmed", "Order sudah dikonfirmasi sebelumnya. Status:")} <strong>{data.order.status}</strong>
          </div>
        )}

        {result && !result.ok && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠️ {result.message}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={submitting || !vfl || vfl.status !== "submitted" || alreadyDone}
          className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-colors"
        >
          {submitting
            ? t("adminAction.confirming", "Mengkonfirmasi...")
            : alreadyDone
            ? `✅ ${t("adminAction.alreadyConfirmedBtn", "Sudah Dikonfirmasi")}`
            : `🚀 ${t("adminAction.confirmAndStartShipping", "Konfirmasi & Mulai Pengiriman")}`}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminActionPage() {
  const { t } = useLanguage();
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ReviewData | CompareData | ForwardData | ConfirmFulfillmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/admin-action/${token}`)
      .then(async (r) => {
        const d = await r.json() as (ReviewData | CompareData | ForwardData | ConfirmFulfillmentData) & { error?: string };
        if (!r.ok) throw new Error(d.error ?? t("adminAction.errorOccurred", "Terjadi kesalahan"));
        setData(d);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Loader label={t("adminAction.loadingData", "Memuat data...")} />;
  if (error) return <ErrorCard message={error} />;
  if (!data) return <ErrorCard message={t("adminAction.dataNotFound", "Data tidak ditemukan")} />;

  if (data.actionType === "review_order") {
    return <ReviewOrderView token={token!} data={data as ReviewData} />;
  }
  if (data.actionType === "compare_vendors") {
    return <CompareVendorsView token={token!} data={data as CompareData} />;
  }
  if (data.actionType === "forward_vendor") {
    return <ForwardVendorView token={token!} data={data as ForwardData} />;
  }
  if (data.actionType === "confirm_fulfillment") {
    return <ConfirmFulfillmentView token={token!} data={data as ConfirmFulfillmentData} />;
  }

  return <ErrorCard message={`${t("adminAction.unknownActionType", "Tipe aksi tidak dikenal")}: ${data.actionType}`} />;
}
