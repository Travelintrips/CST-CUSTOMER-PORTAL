import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  Clock3,
  Filter,
  Inbox,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import { MarketplaceDealPriceEditor } from "@/components/admin/MarketplaceDealPriceEditor";
import { MarketplaceVendorAssignment } from "@/components/admin/MarketplaceVendorAssignment";
import { ProductOrderDealPriceEditor } from "@/components/admin/ProductOrderDealPriceEditor";

type ServiceSummary = {
  service_key: string;
  service_label: string;
  total: number;
  pending: number;
  ambiguous?: number;
};

type ServiceRow = {
  service_key: string;
  service_label: string;
  id: number;
  reference: string;
  status: string;
  status_known?: boolean;
  customer_name: string;
  customer_company: string;
  customer_phone?: string | null;
  company_id: number | null;
  portal_customer_id: number | null;
  available_actions?: string[];
  created_at: string;
  updated_at: string;
  management_path: string;
  summary: string;
};

type Notification = {
  id: number;
  type: string;
  order_number: string;
  customer_name: string;
  company_name: string | null;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type Detail = {
  service: string;
  id: number;
  record: Record<string, unknown>;
  history: Array<Record<string, unknown>>;
  projection?: {
    finance?: {
      available: boolean;
      source: string | null;
      invoice: {
        id: number;
        number: string | null;
        status: string;
        paymentStatus: string;
        total: number;
        amountPaid: number;
        outstanding: number;
        dueDate: string | null;
        pdfAvailable: boolean;
        downloadUrl: string;
      } | null;
      payment: {
        status: string;
        amountPaid: number;
        fulfillmentGate: string;
      } | null;
      paymentProof: {
        status: string;
        uploadedAt: string | null;
        remarks: string | null;
        fileUrl: string | null;
      } | null;
    };
    timeline?: {
      source: string;
      currentStatus: string | null;
      events: Array<Record<string, unknown>>;
    };
    operations?: {
      fulfillment: {
        status: "available" | "not_applicable";
        links: number;
        submissions: number;
        latestSubmissionAt: string | null;
      };
      tracking: {
        status: "available" | "not_applicable";
        source: string | null;
        currentStatus: string | null;
        events: Array<Record<string, unknown>>;
      };
      pod: {
        status: "available" | "not_applicable";
        available: boolean;
        items: Array<Record<string, unknown>>;
      };
      receipts: {
        status: "available" | "not_applicable";
        count: number;
      };
      completion: {
        status: "completed" | "in_progress" | "cancelled" | "not_applicable";
        currentStatus: string | null;
        source: string;
      };
    };
  };
};

const SERVICE_LABELS: Record<string, string> = {
  all: "Semua layanan",
  marketplace: "Marketplace / RFQ",
  "marketplace-po": "Marketplace / Purchase Order",
  "logistic-order": "Logistics / Customer Order",
  ppjk: "Pabean / PPJK",
  "quote-request": "Request a Quote",
  "product-order": "Marketplace / Product Order",
  "service-request": "Pabean / Custom Clearance / Layanan",
  "domestic-trucking": "Domestic / Trucking",
  "air-freight": "Air Freight",
  "ocean-freight": "Ocean / Sea Freight",
  "freight-forwarding": "Freight Forwarding",
  "custom-clearance": "Pabean / Custom Clearance",
};

const statusLabel = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const statusClass = (value: string) => {
  if (["completed", "done", "approved", "awarded", "confirmed"].includes(value)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (["cancelled", "rejected", "quote_declined", "expired"].includes(value)) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  if (["quoted", "rate_received", "booked"].includes(value)) {
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  }
  return "bg-amber-50 text-amber-700 border-amber-200";
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ServiceOperationsTab() {
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [summary, setSummary] = useState<ServiceSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState("");
  const [service, setService] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "50", offset: "0" });
      if (search.trim()) params.set("search", search.trim());
      if (service !== "all") params.set("service", service);
      if (status !== "all") params.set("status", status);
      const response = await fetch(`/api/portal/admin/service-operations?${params}`, {
        headers: getAuthHeaders(),
        credentials: "include",
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Gagal memuat workload");
      setRows(payload.data ?? []);
      setSummary(payload.summary ?? []);
      setTotal(Number(payload.total ?? 0));
      setUnread(Number(payload.unreadNotifications ?? 0));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat workload");
    } finally {
      setLoading(false);
    }
  }, [search, service, status]);

  const loadNotifications = useCallback(async () => {
    const response = await fetch("/api/portal/admin/service-operations/notifications?limit=8", {
      headers: getAuthHeaders(),
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) return;
    const payload = await response.json();
    setNotifications(payload.data ?? []);
  }, []);

  useEffect(() => {
    void load();
    void loadNotifications();
  }, [load, loadNotifications]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void load();
      void loadNotifications();
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [load, loadNotifications]);

  const serviceOptions = useMemo(() => {
    const keys = new Set(summary.map((item) => item.service_key));
    return ["all", ...Object.keys(SERVICE_LABELS).filter((key) => key !== "all" && keys.has(key))];
  }, [summary]);

  async function openDetail(row: ServiceRow) {
    setDetailLoading(true);
    try {
      const response = await fetch(
        `/api/portal/admin/service-operations/${row.service_key}/${row.id}`,
        { headers: getAuthHeaders(), credentials: "include", cache: "no-store" },
      );
      const payload = await response.json();
      if (response.ok) setSelected(payload);
    } finally {
      setDetailLoading(false);
    }
  }

  async function markAllRead() {
    await fetch("/api/portal/admin/service-operations/notifications/mark-all-read", {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    setUnread(0);
    setNotifications((items) => items.map((item) => ({ ...item, read_at: new Date().toISOString() })));
  }

  async function markRead(id: number) {
    await fetch(`/api/portal/admin/service-operations/notifications/${id}/read`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, read_at: new Date().toISOString() } : item));
    setUnread((count) => Math.max(0, count - 1));
  }

  async function runAction(action: "approve" | "request_revision" | "reject" | "contact") {
    if (!selected || actionBusy) return;
    const row = rows.find((item) => item.service_key === selected.service && item.id === selected.id);
    if (action !== "contact" && row?.available_actions && !row.available_actions.includes(action)) return;
    let reason = "";
    if (action === "reject" || action === "request_revision") {
      reason = window.prompt(action === "reject" ? "Alasan penolakan" : "Data yang perlu direvisi")?.trim() ?? "";
      if (!reason) return;
    } else if (action === "approve" && !window.confirm("Setujui transaksi ini dan lanjutkan lifecycle canonical?")) {
      return;
    }
    setActionBusy(true);
    setActionError("");
    try {
      const response = await fetch(`/api/portal/admin/service-operations/${selected.service}/${selected.id}/actions`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, reason }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Action gagal dijalankan");
      if (action === "contact" && payload.contactUrl) {
        window.open(payload.contactUrl, "_blank", "noopener,noreferrer");
      } else {
        setSelected(null);
        await Promise.all([load(), loadNotifications()]);
      }
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Action gagal dijalankan");
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-950 text-white p-5 md:p-6 relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-[0.18em]">
              <Inbox className="h-4 w-4" /> Customer Portal Operations
            </div>
            <h2 className="text-2xl font-bold mt-2">Semua layanan dalam satu antrean</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking,
              kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowNotifications((value) => !value)}
              className="relative inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm hover:bg-slate-800"
            >
              <Bell className="h-4 w-4" /> Notifikasi
              {unread > 0 && <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold">{unread}</span>}
            </button>
            <button
              type="button"
              onClick={() => { void load(); void loadNotifications(); }}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h3 className="font-semibold text-slate-900">Inbox admin</h3>
              <p className="text-xs text-slate-500">Notifikasi memakai tabel dan SSE existing.</p>
            </div>
            <button type="button" onClick={() => void markAllRead()} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              Tandai semua dibaca
            </button>
          </div>
          <div className="divide-y">
            {notifications.length === 0 && <p className="p-5 text-sm text-slate-500">Belum ada notifikasi.</p>}
            {notifications.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => item.read_at ? undefined : void markRead(item.id)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${item.read_at ? "" : "bg-amber-50/50"}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${item.read_at ? "bg-slate-300" : "bg-amber-500"}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">{item.title || item.type}</span>
                    <span className="block text-sm text-slate-600">{item.body}</span>
                    <span className="block mt-1 text-xs text-slate-400">{formatDate(item.created_at)}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-slate-500">Total antrean</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{total.toLocaleString("id-ID")}</p>
        </div>
        {summary.map((item) => (
          <button
            type="button"
            key={item.service_key}
            onClick={() => setService(item.service_key)}
            className={`rounded-xl border bg-white p-4 text-left hover:border-amber-300 ${service === item.service_key ? "ring-2 ring-amber-400/50" : ""}`}
          >
            <p className="text-xs text-slate-500 truncate">{item.service_label}</p>
            <div className="flex items-end justify-between gap-2 mt-1">
              <p className="text-2xl font-bold text-slate-900">{Number(item.total).toLocaleString("id-ID")}</p>
              <span className="text-xs text-amber-700">{Number(item.pending)} pending{Number(item.ambiguous) > 0 ? ` · ${Number(item.ambiguous)} review` : ""}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nomor, customer, perusahaan, rute..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-slate-400" />
            <select value={service} onChange={(event) => setService(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              {serviceOptions.map((key) => <option key={key} value={key}>{SERVICE_LABELS[key] ?? key}</option>)}
            </select>
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="all">Semua status</option>
            <option value="submitted">Submitted</option>
            <option value="pending_review">Pending review</option>
            <option value="waiting_rate">Waiting rate</option>
            <option value="quoted">Quoted</option>
            <option value="approved">Approved</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1.2fr_auto] gap-4 border-b bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <span>Layanan</span><span>Referensi / Customer</span><span>Status</span><span>Ownership</span><span>Dibuat</span><span />
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Memuat workload...</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center"><Inbox className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-600">Tidak ada transaksi sesuai filter.</p></div>
        ) : (
          <div className="divide-y">
            {rows.map((row) => (
              <button type="button" key={`${row.service_key}-${row.id}`} onClick={() => void openDetail(row)} className="grid w-full md:grid-cols-[1.2fr_1.5fr_1fr_1fr_1.2fr_auto] gap-3 md:gap-4 px-4 py-4 text-left hover:bg-slate-50 items-center">
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{row.service_label}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">{row.summary || "—"}</span>
                </span>
                <span>
                  <span className="block font-mono text-xs text-indigo-700">{row.reference}</span>
                  <span className="block text-sm text-slate-700 mt-1">{row.customer_name}</span>
                  {row.customer_company && <span className="block text-xs text-slate-400">{row.customer_company}</span>}
                   {row.customer_phone && <span className="block text-xs text-slate-400">{row.customer_phone}</span>}
                </span>
                <span>
                  {!row.status_known && <span className="block text-[10px] text-slate-500 mb-1">Mapping perlu review</span>}
                  <span className={`inline-flex w-fit items-center rounded-full border px-2 py-1 text-xs font-medium ${statusClass(row.status)}`}>{statusLabel(row.status)}</span>
                </span>
                <span className="text-xs text-slate-500">{row.company_id ? `Company #${row.company_id}` : row.portal_customer_id ? `Customer #${row.portal_customer_id}` : "Guest / portal"}</span>
                <span className="text-xs text-slate-500">{formatDate(row.created_at)}</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label="Detail transaksi layanan">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{SERVICE_LABELS[selected.service] ?? selected.service}</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{String(selected.record["request_number"] ?? selected.record["booking_number"] ?? selected.record["order_number"] ?? selected.record["doc_number"] ?? `#${selected.id}`)}</h3>
                <p className="text-xs text-slate-500 mt-1">Canonical record dan history dari sumber transaksi.</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup detail"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ["Customer", selected.record["customer_name"] ?? selected.record["buyer_name"]],
                  ["Perusahaan", selected.record["customer_company"] ?? selected.record["buyer_company"]],
                   ["Telepon", selected.record["customer_phone"] ?? selected.record["phone"] ?? selected.record["whatsapp"]],
                  ["Status", selected.record["status"]],
                  ["Dibuat", formatDate(String(selected.record["created_at"] ?? ""))],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">{String(label)}</p>
                    <p className="mt-1 text-sm font-medium text-slate-800 break-words">{String(value ?? "—")}</p>
                  </div>
                ))}
              </div>
              {selected.projection?.finance && (
                <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-sm font-semibold text-slate-800">Invoice & Payment</h4>
                    <span className="text-[11px] text-slate-500">
                      {selected.projection.finance.source ? `Sumber: ${selected.projection.finance.source}` : "Belum terhubung"}
                    </span>
                  </div>
                  {selected.projection.finance.invoice ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        ["Invoice", selected.projection.finance.invoice.number ?? "—"],
                        ["Total", `Rp ${selected.projection.finance.invoice.total.toLocaleString("id-ID")}`],
                        ["Dibayar", `Rp ${selected.projection.finance.invoice.amountPaid.toLocaleString("id-ID")}`],
                        ["Outstanding", `Rp ${selected.projection.finance.invoice.outstanding.toLocaleString("id-ID")}`],
                        ["Payment", statusLabel(selected.projection.finance.invoice.paymentStatus)],
                        ["Proof", statusLabel(selected.projection.finance.paymentProof?.status ?? "not_uploaded")],
                        ["Jatuh tempo", formatDate(selected.projection.finance.invoice.dueDate)],
                        ["Fulfillment gate", statusLabel(selected.projection.finance.payment?.fulfillmentGate ?? "payment_required")],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="rounded-lg bg-white/80 p-3">
                          <p className="text-[11px] uppercase tracking-wide text-slate-400">{String(label)}</p>
                          <p className="mt-1 text-sm font-medium text-slate-800 break-words">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">Belum ada invoice canonical yang terhubung.</p>
                  )}
                  {selected.projection.finance.paymentProof?.remarks && (
                    <p className="mt-3 text-xs text-slate-600">Catatan proof: {selected.projection.finance.paymentProof.remarks}</p>
                  )}
                  {selected.projection.finance.paymentProof?.fileUrl && (
                    <a
                      href={selected.projection.finance.paymentProof.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex text-xs font-semibold text-sky-700 hover:underline"
                    >
                      Buka bukti pembayaran
                    </a>
                  )}
                </div>
              )}
              {selected.projection?.timeline && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock3 className="h-4 w-4 text-indigo-500" />
                    <h4 className="text-sm font-semibold">Timeline canonical</h4>
                    <span className="text-[11px] text-slate-400">({selected.projection.timeline.source})</span>
                  </div>
                  {selected.projection.timeline.events.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Belum ada event timeline. Status saat ini: {statusLabel(selected.projection.timeline.currentStatus ?? "unknown")}.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selected.projection.timeline.events.map((event, index) => (
                        <div key={`${String(event.id ?? index)}`} className="flex items-start gap-3 rounded-lg border p-3">
                          <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {statusLabel(String(event.status ?? event.event_type ?? event.new_status ?? "event"))}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {String(event.notes ?? event.note ?? event.location ?? "")}{" "}
                              {event.created_at ? `· ${formatDate(String(event.created_at))}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {selected.projection?.operations && (
                <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-sm font-semibold text-slate-800">Fulfillment & delivery operations</h4>
                    <span className="text-[11px] text-slate-500">Data canonical</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      ["Fulfillment", selected.projection.operations.fulfillment.status === "available"
                        ? `${selected.projection.operations.fulfillment.submissions}/${selected.projection.operations.fulfillment.links} submission`
                        : "N/A"],
                      ["Tracking", selected.projection.operations.tracking.status === "available"
                        ? statusLabel(selected.projection.operations.tracking.currentStatus ?? "available")
                        : "N/A"],
                      ["POD", selected.projection.operations.pod.status === "available"
                        ? (selected.projection.operations.pod.available ? "Tersedia" : "Belum ada")
                        : "N/A"],
                      ["Goods receipt", selected.projection.operations.receipts.status === "available"
                        ? `${selected.projection.operations.receipts.count} receipt`
                        : "N/A"],
                      ["Completion", statusLabel(selected.projection.operations.completion.status)],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="rounded-lg bg-white/80 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">{String(label)}</p>
                        <p className="mt-1 text-sm font-medium text-slate-800 break-words">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                  {selected.projection.operations.tracking.events.length > 0 && (
                    <p className="mt-3 text-xs text-slate-500">
                      {selected.projection.operations.tracking.events.length} event tracking tersedia dari {selected.projection.operations.tracking.source ?? "sumber canonical"}.
                    </p>
                  )}
                  {selected.projection.operations.fulfillment.latestSubmissionAt && (
                    <p className="mt-1 text-xs text-slate-500">
                      Submission terakhir: {formatDate(selected.projection.operations.fulfillment.latestSubmissionAt)}
                    </p>
                  )}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2"><Clock3 className="h-4 w-4 text-indigo-500" /><h4 className="text-sm font-semibold">History</h4></div>
                <div className="space-y-2">
                  {selected.history.length === 0 ? <p className="text-sm text-slate-500">Belum ada history tambahan.</p> : selected.history.map((event, index) => (
                    <div key={`${String(event.id ?? index)}`} className="flex items-start gap-3 rounded-lg border p-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                      <div><p className="text-sm font-medium text-slate-800">{statusLabel(String(event.action ?? "event"))}</p><p className="text-xs text-slate-500 mt-0.5">{String(event.description ?? event.status ?? "")} {event.created_at ? `· ${formatDate(String(event.created_at))}` : ""}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              {actionError && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{actionError}</div>}
              <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Action</span>
                {selected.service === "marketplace" && (
                  <>
                    <MarketplaceVendorAssignment rfqId={selected.id} />
                    <MarketplaceDealPriceEditor rfqId={selected.id} rfqStatus={String(selected.record["status"] ?? "")} />
                  </>
                )}
                {selected.service === "product-order" && (
                  <ProductOrderDealPriceEditor
                    orderId={selected.id}
                    status={String(selected.record["status"] ?? "")}
                    initialVendorName={selected.record["vendor_name_selected"] as string | null | undefined}
                    initialQuotedPrice={selected.record["vendor_quoted_price"] as string | number | null | undefined}
                  />
                )}
                {(rows.find((row) => row.service_key === selected.service && row.id === selected.id)?.available_actions ?? []).includes("approve") && (
                  <button type="button" disabled={actionBusy} onClick={() => void runAction("approve")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                    <Check className="h-3.5 w-3.5" /> Setujui
                  </button>
                )}
                {(rows.find((row) => row.service_key === selected.service && row.id === selected.id)?.available_actions ?? []).includes("request_revision") && (
                  <button type="button" disabled={actionBusy} onClick={() => void runAction("request_revision")} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50">
                    <RefreshCw className="h-3.5 w-3.5" /> Minta Revisi
                  </button>
                )}
                {(rows.find((row) => row.service_key === selected.service && row.id === selected.id)?.available_actions ?? []).includes("reject") && (
                  <button type="button" disabled={actionBusy} onClick={() => void runAction("reject")} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50">
                    <X className="h-3.5 w-3.5" /> Tolak
                  </button>
                )}
                {(rows.find((row) => row.service_key === selected.service && row.id === selected.id)?.available_actions ?? []).includes("contact") && (
                  <button type="button" disabled={actionBusy} onClick={() => void runAction("contact")} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50">
                    <MessageCircle className="h-3.5 w-3.5" /> Hubungi Customer
                  </button>
                )}
              </div>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t pt-4">
                 <p className="text-xs text-slate-500">Action lifecycle memakai state machine atau update conditional canonical.</p>
                  {selected.service === "marketplace-po" && (
                    <a href="/admin?tab=marketplace-operations" className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                      Buka Marketplace Operations
                    </a>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
      {detailLoading && <div className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Memuat detail</div>}
    </div>
  );
}