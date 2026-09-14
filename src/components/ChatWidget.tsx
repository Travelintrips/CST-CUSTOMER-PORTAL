import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Mic,
  MicOff,
  ClipboardList,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Paperclip,
  FileText,
  ImageIcon,
  RotateCcw,
} from "lucide-react";
import { Link } from "wouter";
import { LocationCombobox } from "@/components/LocationCombobox";
import { COMPANY_CONFIG } from "@/config/company";
import { CUSTOMER_ASSETS } from "@/lib/staticAssets";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "admin";
  content: string;
  createdAt?: string;
  attachment?: { type: "image" | "pdf"; name: string };
}

interface OrderCreated {
  orderNumber: string;
  orderId: number;
}

interface OrderStatusEntry {
  orderNumber: string;
  status: string;
  shipmentType: string;
  origin: string;
  destination: string;
  customerName: string;
  requiredDate: string | null;
  createdAt: string;
  latestAdminReply: string | null;
}

/** SSE events sent by /api/ai-agent/chat */
type SseEvent =
  | { type: "session"; sessionToken: string }
  | { type: "token"; text: string }
  | { type: "order"; orderNumber: string; orderId: number }
  | { type: "status"; orders: OrderStatusEntry[] }
  | { type: "form"; service: string }
  | {
      type: "product_form";
      productId: number;
      productName: string;
      unitPrice: number;
      unit: string;
    }
  | { type: "done" }
  | { type: "error"; message: string };

function formatMsgTime(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const hhmm = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return hhmm;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Kemarin ${hhmm}`;
  return (
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
    " " +
    hhmm
  );
}

const SESSION_KEY = "cst_ai_chat_session";
const MESSAGES_KEY = "cst_ai_chat_messages";
const LAST_SEEN_KEY = "cst_ai_chat_last_seen";

function loadSession(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}
function saveSession(token: string) {
  try {
    localStorage.setItem(SESSION_KEY, token);
  } catch {
    /* empty */
  }
}
function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}
function saveMessages(msgs: ChatMessage[]) {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs.slice(-80)));
  } catch {
    /* empty */
  }
}

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    `Halo! 👋 Selamat datang di ${COMPANY_CONFIG.brandName}.\n\n` +
    "Saya siap membantu Anda:\n" +
    "• Informasi layanan (Sea/Air/Trucking/Customs)\n" +
    "• **Buat order cepat** — ketik 'mau kirim' atau 'trucking', form langsung muncul!\n" +
    "• Cek status order Anda\n\n" +
    "Ada yang bisa saya bantu?",
};

interface OrderFormProps {
  service: string;
  sessionToken: string | null;
  onSuccess: (orderNumber: string, orderId: number, token: string) => void;
  onDismiss: () => void;
}

const SERVICE_OPTIONS = [
  "Trucking",
  "Sea Freight",
  "Air Freight",
  "Customs",
  "Packing & Crating",
];

function OrderForm({
  service,
  sessionToken,
  onSuccess,
  onDismiss,
}: OrderFormProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    companyName: "",
    shipmentType: service || "Trucking",
    origin: "",
    destination: "",
    commodity: "",
    grossWeight: "",
    volumeCbm: "",
    requiredDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.customerName.trim() ||
      !form.phone.trim() ||
      !form.origin.trim() ||
      !form.destination.trim()
    ) {
      setError(t("chatWidget.formFillRequired", "Isi semua field bertanda *"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/ai-agent/quick-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sessionToken }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        orderNumber?: string;
        orderId?: number;
        sessionToken?: string;
        error?: string;
      };
      if (!res.ok || !data.success) {
        setError(data.error ?? t("chatWidget.formCreateOrderFail", "Gagal membuat order, coba lagi."));
        return;
      }
      onSuccess(
        data.orderNumber!,
        data.orderId!,
        data.sessionToken ?? sessionToken ?? "",
      );
    } catch {
      setError(t("chatWidget.formConnectFail", "Gagal koneksi, coba lagi."));
    } finally {
      setSubmitting(false);
    }
  }

  const inp =
    "w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100 bg-white transition-all duration-200";
  const lbl =
    "text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-sky-200 rounded-2xl shadow-sm"
    >
      <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 border-b border-sky-100 rounded-t-2xl">
        <ClipboardList className="h-4 w-4 text-sky-600 shrink-0" />
        <p className="text-xs font-semibold text-sky-800 flex-1">
          {t("chatWidget.formOrderTitle", "Form Order Cepat")}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-3 py-2.5 space-y-2">
        <div>
          <label className={lbl}>{t("chatWidget.fullName", "Nama Lengkap")} *</label>
          <input
            className={inp}
            placeholder="Budi Santoso"
            {...field("customerName")}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={lbl}>{t("chatWidget.whatsapp", "No. WhatsApp")} *</label>
            <input
              className={inp}
              placeholder="081234..."
              type="tel"
              {...field("phone")}
            />
          </div>
          <div>
            <label className={lbl}>{t("chatWidget.email", "Email")}</label>
            <input
              className={inp}
              placeholder="email@..."
              type="email"
              {...field("email")}
            />
          </div>
        </div>

        <div>
          <label className={lbl}>{t("chatWidget.companyName", "Nama Perusahaan")}</label>
          <input
            className={inp}
            placeholder="PT Contoh / individu"
            {...field("companyName")}
          />
        </div>

        <div>
          <label className={lbl}>{t("chatWidget.shipmentType", "Jenis Pengiriman")} *</label>
          <select className={inp} {...field("shipmentType")}>
            {SERVICE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={lbl}>{t("chatWidget.originCity", "Kota Asal")} *</label>
            <LocationCombobox
              value={form.origin}
              onChange={(label) => setForm((p) => ({ ...p, origin: label }))}
              placeholder="Surabaya"
              className="text-xs"
            />
          </div>
          <div>
            <label className={lbl}>{t("chatWidget.destCity", "Kota Tujuan")} *</label>
            <LocationCombobox
              value={form.destination}
              onChange={(label) => setForm((p) => ({ ...p, destination: label }))}
              placeholder="Jakarta"
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <label className={lbl}>{t("chatWidget.commodity", "Komoditi / Jenis Barang")}</label>
          <input
            className={inp}
            placeholder={t("chatWidget.commodityPh", "Elektronik, Tekstil, dll")}
            {...field("commodity")}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={lbl}>{t("chatWidget.weightKg", "Berat (kg)")}</label>
            <input
              className={inp}
              placeholder="500"
              type="number"
              min="0"
              {...field("grossWeight")}
            />
          </div>
          <div>
            <label className={lbl}>{t("chatWidget.volumeCbm", "Volume (CBM)")}</label>
            <input
              className={inp}
              placeholder="2.5"
              type="number"
              min="0"
              step="0.1"
              {...field("volumeCbm")}
            />
          </div>
        </div>

        <div>
          <label className={lbl}>{t("chatWidget.shipmentDate", "Tanggal Pengiriman")}</label>
          <input className={inp} type="date" {...field("requiredDate")} />
        </div>

        <div>
          <label className={lbl}>{t("chatWidget.notes", "Catatan")}</label>
          <textarea
            className={`${inp} resize-none`}
            rows={2}
            placeholder={t("chatWidget.notesPh", "Info tambahan...")}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>

        {error && (
          <p className="text-[11px] text-red-600 bg-red-50 rounded-lg px-2 py-1">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 text-xs py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t("chatWidget.close", "Tutup")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 text-xs py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 disabled:opacity-50 transition-colors"
          >
            {submitting ? t("chatWidget.sending", "Mengirim…") : t("chatWidget.createOrder", "Buat Order →")}
          </button>
        </div>
      </div>
    </form>
  );
}

interface ProductOrderFormProps {
  productId: number;
  productName: string;
  unitPrice: number;
  unit: string;
  sessionToken: string | null;
  onSuccess: (orderNumber: string, orderId: number, token: string) => void;
  onDismiss: () => void;
}

function ProductOrderForm({
  productId,
  productName,
  unitPrice,
  unit,
  sessionToken,
  onSuccess,
  onDismiss,
}: ProductOrderFormProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    qty: "1",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  const totalPrice = unitPrice * (parseInt(form.qty) || 0);
  const fmtPrice = (n: number) =>
    n.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qtyNum = parseInt(form.qty);
    if (
      !form.customerName.trim() ||
      !form.phone.trim() ||
      !qtyNum ||
      qtyNum <= 0
    ) {
      setError(t("chatWidget.formFillRequired", "Isi semua field bertanda *"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/ai-agent/quick-product-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken,
          customerName: form.customerName,
          phone: form.phone,
          email: form.email,
          productId,
          productName,
          qty: qtyNum,
          unitPrice,
          notes: form.notes,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        orderNumber?: string;
        orderId?: number;
        sessionToken?: string;
        error?: string;
      };
      if (!res.ok || !data.success) {
        setError(data.error ?? t("chatWidget.formCreateOrderFail", "Gagal membuat order, coba lagi."));
        return;
      }
      onSuccess(
        data.orderNumber!,
        data.orderId!,
        data.sessionToken ?? sessionToken ?? "",
      );
    } catch {
      setError(t("chatWidget.formConnectFail", "Gagal koneksi, coba lagi."));
    } finally {
      setSubmitting(false);
    }
  }

  const inp =
    "w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 bg-white transition-all duration-200";
  const lbl =
    "text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-emerald-200 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border-b border-emerald-100">
        <Package className="h-4 w-4 text-emerald-600 shrink-0" />
        <p className="text-xs font-semibold text-emerald-800 flex-1">
          {t("chatWidget.orderProduct", "Pesan Produk")}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-3 py-2 bg-emerald-50/50 border-b border-emerald-100">
        <p className="text-xs font-semibold text-gray-800 truncate">
          {productName}
        </p>
        <p className="text-[11px] text-gray-500">
          {fmtPrice(unitPrice)} / {unit}
        </p>
      </div>

      <div className="px-3 py-2.5 space-y-2">
        <div>
          <label className={lbl}>{t("chatWidget.fullName", "Nama Lengkap")} *</label>
          <input
            className={inp}
            placeholder="Budi Santoso"
            {...field("customerName")}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={lbl}>{t("chatWidget.whatsapp", "No. WhatsApp")} *</label>
            <input
              className={inp}
              placeholder="081234..."
              type="tel"
              {...field("phone")}
            />
          </div>
          <div>
            <label className={lbl}>{t("chatWidget.email", "Email")}</label>
            <input
              className={inp}
              placeholder="email@..."
              type="email"
              {...field("email")}
            />
          </div>
        </div>

        <div>
          <label className={lbl}>{t("chatWidget.quantity", "Jumlah")} ({unit}) *</label>
          <input
            className={inp}
            type="number"
            min="1"
            placeholder="1"
            {...field("qty")}
          />
        </div>

        {totalPrice > 0 && (
          <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
            {t("chatWidget.total", "Total")}: {fmtPrice(totalPrice)}
          </div>
        )}

        <div>
          <label className={lbl}>{t("chatWidget.notes", "Catatan")}</label>
          <textarea
            className={`${inp} resize-none`}
            rows={2}
            placeholder={t("chatWidget.productNotesPh", "Alamat pengiriman, catatan khusus...")}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>

        {error && (
          <p className="text-[11px] text-red-600 bg-red-50 rounded-lg px-2 py-1">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 text-xs py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t("chatWidget.close", "Tutup")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 text-xs py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {submitting ? t("chatWidget.sending", "Mengirim…") : t("chatWidget.orderNow", "Pesan Sekarang →")}
          </button>
        </div>
      </div>
    </form>
  );
}

export function ChatWidget() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = loadMessages();
    return saved.length > 0 ? saved : [GREETING];
  });
  const [sessionToken, setSessionToken] = useState<string | null>(loadSession);
  /** Content being streamed right now (null = not streaming) */
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [orderCreated, setOrderCreated] = useState<OrderCreated | null>(null);
  /** Latest order status results shown as a compact card */
  const [orderStatuses, setOrderStatuses] = useState<OrderStatusEntry[]>([]);
  const [unread, setUnread] = useState(0);
  /** Inline quick-order form triggered by AI or user */
  const [showForm, setShowForm] = useState<{ service: string } | null>(null);
  /** Inline product order form triggered by AI */
  const [showProductForm, setShowProductForm] = useState<{
    productId: number;
    productName: string;
    unitPrice: number;
    unit: string;
  } | null>(null);
  /** Voice input state */
  const [isListening, setIsListening] = useState(false);
  /** TTS output: auto-speak AI responses when enabled */
  const [voiceOutput, setVoiceOutput] = useState<boolean>(() => {
    try {
      return localStorage.getItem("cst_ai_voice_output") === "1";
    } catch {
      return false;
    }
  });
  /** True while speechSynthesis is reading aloud */
  const [isSpeaking, setIsSpeaking] = useState(false);
  /** Sound effects toggle — persisted across sessions */
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("cst_chat_sfx") !== "off";
    } catch {
      return true;
    }
  });
  /** True when viewport width is < 640px (phone-sized) — drives bottom-sheet layout */
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches,
  );
  /** Pixels the soft keyboard has pushed up the visual viewport on mobile */
  const [kbOffset, setKbOffset] = useState(0);
  /** File selected by user, waiting to be sent */
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  /** Base64 preview URL for image attachments */
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  /** True while uploading+OCR-ing a file */
  const [uploadingFile, setUploadingFile] = useState(false);

  /** Mirrors kbOffset without triggering re-renders — used for pure comparison in the viewport handler */
  const kbOffsetRef = useRef(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** Keep a mutable ref to accumulate text tokens without extra re-renders */
  const streamBufferRef = useRef<string>("");
  /** AbortController so we can cancel inflight stream on unmount */
  const abortRef = useRef<AbortController | null>(null);
  /** SpeechRecognition instance */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  /** Cached TTS voices — populated asynchronously via voiceschanged */
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  /** Stores the transcript captured during a push-to-talk session */
  const pendingTranscriptRef = useRef<string>("");
  /** ISO timestamp of when the user last viewed the widget — used for admin-reply polling */
  const lastSeenAtRef = useRef<string>(
    (() => {
      try {
        return localStorage.getItem(LAST_SEEN_KEY) ?? "";
      } catch {
        return "";
      }
    })(),
  );
  /** Admin messages received while widget was closed — flushed to state on next open */
  const pendingAdminRef = useRef<ChatMessage[]>([]);
  /** Hidden file input element */
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** In-session image previews: message id → data URL (not persisted to localStorage) */
  const imgPreviewsRef = useRef<Map<string, string>>(new Map());
  /**
   * Shared AudioContext — created once on first user gesture and reused for all
   * subsequent sounds. Mobile browsers (iOS/Android) block audio from async
   * callbacks unless the AudioContext was created AND resumed inside a user
   * gesture. By unlocking it on the first tap and keeping the instance alive,
   * sounds triggered from SSE callbacks (received, notification) also play.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audioCtxRef = useRef<any>(null);

  const isStreaming = streamingContent !== null;

  // On open: flush pending admin messages into chat, clear unread, update lastSeenAt
  useEffect(() => {
    if (open) {
      setUnread(0);
      if (pendingAdminRef.current.length > 0) {
        const pending = pendingAdminRef.current;
        pendingAdminRef.current = [];
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const toAdd = pending.filter((m) => !existingIds.has(m.id));
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
        });
      }
      const now = new Date().toISOString();
      lastSeenAtRef.current = now;
      try {
        localStorage.setItem(LAST_SEEN_KEY, now);
      } catch {
        /* empty */
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Poll for new admin replies every 30 s while widget is closed
  useEffect(() => {
    if (!sessionToken || open) return;

    async function pollAdminReplies() {
      if (!sessionToken) return;
      try {
        const since = lastSeenAtRef.current || new Date(0).toISOString();
        const res = await fetch(
          `/api/ai-agent/session/${sessionToken}?since=${encodeURIComponent(since)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          messages: Array<{
            id: number;
            role: string;
            content: string;
            createdAt: string;
          }>;
        };
        const adminMsgs = data.messages.filter((m) => m.role === "admin");
        if (adminMsgs.length === 0) return;

        const existingIds = new Set(pendingAdminRef.current.map((m) => m.id));
        const toAdd = adminMsgs
          .map((m) => ({
            id: String(m.id),
            role: "admin" as const,
            content: m.content,
            createdAt: m.createdAt,
          }))
          .filter((m) => !existingIds.has(m.id));

        if (toAdd.length > 0) {
          pendingAdminRef.current = [...pendingAdminRef.current, ...toAdd];
          setUnread((n) => n + toAdd.length);
          playSound("notification");
        }
      } catch {
        /* network errors are silently ignored */
      }
    }

    // Run once immediately on start, then every 30 s
    void pollAdminReplies();
    const id = setInterval(() => void pollAdminReplies(), 30_000);
    return () => clearInterval(id);
  }, [sessionToken, open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (!isStreaming) saveMessages(messages);
  }, [messages, isStreaming]);

  // Cancel any inflight stream on unmount; also stop any TTS
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Pre-load TTS voices — on Android/iOS voices load asynchronously
  useEffect(() => {
    if (!window.speechSynthesis) return;
    function loadVoices() {
      voicesRef.current = window.speechSynthesis.getVoices();
    }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // Sync isMobile with viewport width changes (e.g. rotation, resize)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Scroll-lock: prevent the page from scrolling while the mobile bottom-sheet is open
  useEffect(() => {
    if (!isMobile || !open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  // Track keyboard height via visualViewport so the input bar stays above the keyboard
  useEffect(() => {
    if (!isMobile || !open) {
      setKbOffset(0);
      return;
    }
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      // Use innerHeight - vv.height for keyboard height. Do NOT subtract
      // vv.offsetTop: on iOS the page may scroll when an input is focused,
      // which would make kbOffset smaller than the real keyboard height and
      // leave the input partially hidden behind the keyboard.
      const next = Math.max(0, window.innerHeight - vv.height);
      if (next === kbOffsetRef.current) return;
      kbOffsetRef.current = next;
      setKbOffset(next);
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      kbOffsetRef.current = 0;
      setKbOffset(0);
    };
  }, [isMobile, open]);

  /** Strip markdown symbols so TTS sounds natural */
  function stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#{1,6}\s*/g, "")
      .replace(/`{1,3}[^`]*`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^\s*[-•]\s*/gm, "")
      .trim();
  }

  /** Speak text aloud using Web Speech API */
  function speak(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = stripMarkdown(text);
    if (!clean) return;
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "id-ID";
    utt.rate = 1.05;
    utt.pitch = 1;
    // Use pre-loaded voices (works on mobile where getVoices() is async)
    const voices = voicesRef.current.length
      ? voicesRef.current
      : window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang.startsWith("id"));
    // Only set voice if found — let browser pick default if no Indonesian voice
    if (idVoice) utt.voice = idVoice;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  }

  function stopSpeaking() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  function toggleVoiceOutput() {
    setVoiceOutput((v) => {
      const next = !v;
      try {
        localStorage.setItem("cst_ai_voice_output", next ? "1" : "0");
      } catch {
        /* empty */
      }
      if (!next) stopSpeaking();
      // Unlock audio on the same user gesture that enables voice output
      unlockAudio();
      return next;
    });
  }

  /**
   * Must be called inside a user gesture (click/touchstart).
   * Creates the shared AudioContext (if not yet created) and resumes it so that
   * subsequent async sound calls (received, notification) work on mobile browsers.
   * Also primes speechSynthesis on iOS which otherwise refuses to speak from async.
   */
  function unlockAudio() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = (window as any).AudioContext ?? (window as any).webkitAudioContext;
      if (!AC) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AC();
      }
      const ctx = audioCtxRef.current;
      // Resume if suspended — this is the key step for mobile
      if (ctx.state === "suspended") {
        void (ctx as AudioContext).resume();
      }
      // Prime speechSynthesis on iOS: speak an empty utterance to unlock it
      if (window.speechSynthesis) {
        const primer = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(primer);
        // Cancel immediately — we only need the unlock side-effect
        setTimeout(() => window.speechSynthesis.cancel(), 50);
      }
    } catch {
      /* silently ignore — non-fatal */
    }
  }

  /** Synthesize a short UI sound via Web Audio API — no external files, iOS/Android safe */
  function playSound(type: "sent" | "received" | "notification" | "error") {
    if (!sfxEnabled) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = (window as any).AudioContext ?? (window as any).webkitAudioContext;
      if (!AC) return;
      // Reuse the shared context (pre-unlocked by user gesture).
      // If not yet created, create it — but it may be suspended on mobile until
      // the next user gesture calls unlockAudio().
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AC();
      }
      const ctx: AudioContext = audioCtxRef.current as AudioContext;
      // If still suspended (user hasn't tapped yet), skip rather than fail silently
      if (ctx.state === "suspended") return;
      const g = ctx.createGain();
      g.connect(ctx.destination);

      const configs: Record<
        typeof type,
        {
          wave: OscillatorType;
          freqStart: number;
          freqEnd: number;
          duration: number;
          gain: number;
        }
      > = {
        sent: {
          wave: "sine",
          freqStart: 880,
          freqEnd: 1100,
          duration: 0.12,
          gain: 0.28,
        },
        received: {
          wave: "sine",
          freqStart: 660,
          freqEnd: 880,
          duration: 0.18,
          gain: 0.32,
        },
        notification: {
          wave: "triangle",
          freqStart: 1200,
          freqEnd: 900,
          duration: 0.25,
          gain: 0.28,
        },
        error: {
          wave: "sawtooth",
          freqStart: 280,
          freqEnd: 140,
          duration: 0.2,
          gain: 0.18,
        },
      };
      const c = configs[type];
      const osc = ctx.createOscillator();
      osc.type = c.wave;
      osc.frequency.setValueAtTime(c.freqStart, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(
        c.freqEnd,
        ctx.currentTime + c.duration,
      );
      g.gain.setValueAtTime(c.gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.duration);
      osc.connect(g);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + c.duration);
      osc.onended = () => {
        // Do NOT close the shared AudioContext — it must stay open for future sounds
        g.disconnect();
      };
    } catch {
      /* audio blocked or unsupported — silently ignore */
    }
  }

  function toggleSfx() {
    setSfxEnabled((v) => {
      const next = !v;
      try {
        localStorage.setItem("cst_chat_sfx", next ? "on" : "off");
      } catch {
        /* empty */
      }
      return next;
    });
  }

  /**
   * Low-level: open the SSE stream with a given message string and handle all events.
   * Caller must have already added the user bubble to messages and reset streaming state.
   */
  async function _executeStream(messageForAI: string) {
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai-agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, message: messageForAI }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = "";
      let pendingOrder: OrderCreated | null = null;
      /** Guard: was the stream cleanly terminated by the server? */
      let doneReceived = false;

      // Update streaming bubble every N ms to batch React re-renders
      let rafId: ReturnType<typeof setTimeout> | null = null;

      function flushStreamToState() {
        rafId = null;
        setStreamingContent(streamBufferRef.current);
      }

      function scheduleFlush() {
        if (rafId === null) {
          rafId = setTimeout(flushStreamToState, 30);
        }
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        lineBuffer += decoder.decode(value, { stream: true });

        // Split on newlines; keep incomplete last segment in buffer
        const lines = lineBuffer.split("\n");
        lineBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event: SseEvent;
          try {
            event = JSON.parse(line.slice(6)) as SseEvent;
          } catch {
            continue;
          }

          switch (event.type) {
            case "session":
              setSessionToken(event.sessionToken);
              saveSession(event.sessionToken);
              break;

            case "token":
              streamBufferRef.current += event.text;
              scheduleFlush();
              break;

            case "order":
              pendingOrder = {
                orderNumber: event.orderNumber,
                orderId: event.orderId,
              };
              break;

            case "status":
              setOrderStatuses(event.orders);
              break;

            case "form":
              setShowForm({ service: event.service });
              break;

            case "product_form":
              setShowProductForm({
                productId: event.productId,
                productName: event.productName,
                unitPrice: event.unitPrice,
                unit: event.unit,
              });
              break;

            case "done": {
              doneReceived = true;
              // Finalize: move streamed content into completed messages
              if (rafId !== null) {
                clearTimeout(rafId);
                rafId = null;
              }
              const finalText = streamBufferRef.current;
              streamBufferRef.current = "";
              setStreamingContent(null);
              if (finalText) {
                const aiMsg: ChatMessage = {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: finalText,
                  createdAt: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, aiMsg]);
                if (!open) {
                  setUnread((n) => n + 1);
                  playSound("notification");
                } else {
                  playSound("received");
                }
                // Auto-speak if voice output mode is on
                if (voiceOutput) speak(finalText);
              }
              if (pendingOrder) setOrderCreated(pendingOrder);
              break;
            }

            case "error":
              doneReceived = true;
              if (rafId !== null) {
                clearTimeout(rafId);
                rafId = null;
              }
              streamBufferRef.current = "";
              setStreamingContent(null);
              playSound("error");
              setMessages((prev) => [
                ...prev,
                {
                  id: (Date.now() + 2).toString(),
                  role: "assistant",
                  content: event.message,
                  createdAt: new Date().toISOString(),
                },
              ]);
              break;
          }
        }
      }

      // Defensive finalization: if the TCP connection closed without a done/error event
      // (e.g. proxy timeout, server crash mid-stream), flush whatever was buffered and
      // restore the input so the user is never left with a permanently disabled widget.
      if (!doneReceived) {
        if (rafId !== null) {
          clearTimeout(rafId);
          rafId = null;
        }
        const leftover = streamBufferRef.current;
        streamBufferRef.current = "";
        setStreamingContent(null);
        if (leftover) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 4).toString(),
              role: "assistant",
              content: leftover,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") return;
      streamBufferRef.current = "";
      setStreamingContent(null);
      playSound("error");
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 3).toString(),
          role: "assistant",
          content: "Maaf, terjadi kesalahan koneksi. Silakan coba lagi.",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }

  /** Add a user text message to chat and stream AI response */
  async function doSend(text: string) {
    if (!text.trim() || isStreaming) return;
    // Unlock audio on every send gesture so async sounds (received/notification)
    // work immediately after on mobile — no-op if already unlocked.
    unlockAudio();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    playSound("sent");
    streamBufferRef.current = "";
    setStreamingContent("");
    setOrderStatuses([]);
    setShowForm(null);
    setShowProductForm(null);
    stopSpeaking();
    await _executeStream(text.trim());
  }

  /** Send handler: handles plain text OR file attachment */
  async function sendMessage() {
    if (isStreaming || uploadingFile) return;
    const text = input.trim();
    if (!text && !attachedFile) return;
    unlockAudio(); // ensure AudioContext is running before async sounds
    setInput("");

    if (attachedFile) {
      const file = attachedFile;
      const preview = attachedPreview;
      setAttachedFile(null);
      setAttachedPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      const msgId = Date.now().toString();
      const fileType: "image" | "pdf" = file.type.startsWith("image/") ? "image" : "pdf";
      const userMsg: ChatMessage = {
        id: msgId,
        role: "user",
        content: text || `📎 ${file.name}`,
        createdAt: new Date().toISOString(),
        attachment: { type: fileType, name: file.name },
      };
      if (preview) imgPreviewsRef.current.set(msgId, preview);
      setMessages((prev) => [...prev, userMsg]);
      playSound("sent");
      streamBufferRef.current = "";
      setStreamingContent("");
      setOrderStatuses([]);
      setShowForm(null);
      setShowProductForm(null);
      stopSpeaking();

      setUploadingFile(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        if (sessionToken) fd.append("sessionToken", sessionToken);
        const upRes = await fetch("/api/ai-agent/upload", { method: "POST", body: fd });
        if (!upRes.ok) {
          let serverMsg = "";
          try { serverMsg = ((await upRes.json()) as { message?: string }).message ?? ""; } catch { /* ignore */ }
          if (upRes.status === 401) {
            throw new Error(serverMsg || "Kirim pesan ke AI terlebih dahulu sebelum mengunggah file.");
          }
          if (upRes.status === 429) {
            throw new Error(serverMsg || "Batas upload tercapai. Coba lagi nanti.");
          }
          throw new Error(serverMsg || `HTTP ${upRes.status}`);
        }
        const data = (await upRes.json()) as {
          text: string;
          type: string;
          filename: string;
        };
        setUploadingFile(false);
        const label = data.type === "image" ? "gambar" : "dokumen PDF";
        const aiCtx =
          `[Pengguna mengirim ${label}: ${data.filename}]\n\nAnalisis AI:\n${data.text}` +
          (text ? `\n\nPesan dari pengguna: ${text}` : "");
        await _executeStream(aiCtx);
      } catch (uploadErr: unknown) {
        setUploadingFile(false);
        streamBufferRef.current = "";
        setStreamingContent(null);
        playSound("error");
        const uploadErrMsg =
          uploadErr instanceof Error && uploadErr.message
            ? uploadErr.message
            : "Maaf, gagal memproses file. Periksa koneksi dan coba lagi.";
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 5).toString(),
            role: "assistant",
            content: uploadErrMsg,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } else {
      await doSend(text);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  function statusStyle(status: string) {
    switch (status) {
      case "New Order":
        return {
          icon: Clock,
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-500",
          badge: "bg-blue-100 text-blue-700",
        };
      case "In Progress":
        return {
          icon: Truck,
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-500",
          badge: "bg-amber-100 text-amber-700",
        };
      case "Completed":
        return {
          icon: CheckCircle2,
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-500",
          badge: "bg-green-100 text-green-700",
        };
      case "Cancelled":
        return {
          icon: XCircle,
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-500",
          badge: "bg-red-100 text-red-700",
        };
      default:
        return {
          icon: Package,
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-500",
          badge: "bg-gray-100 text-gray-700",
        };
    }
  }

  /** Push-to-talk: call on mousedown/touchstart */
  function startListening() {
    if (isStreaming || isListening) return;
    unlockAudio(); // mic tap is a user gesture — unlock audio for subsequent async sounds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const SR:
      | (new () => {
          lang: string;
          continuous: boolean;
          interimResults: boolean;
          maxAlternatives: number;
          onresult: ((e: any) => void) | null;
          onend: (() => void) | null;
          onerror: ((e: any) => void) | null;
          start(): void;
          stop(): void;
        })
      | undefined = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      alert("Browser Anda belum mendukung input suara. Coba Chrome atau Edge.");
      return;
    }
    pendingTranscriptRef.current = "";
    const recognition = new SR();
    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pendingTranscriptRef.current = String(e.results[0][0].transcript);
    };
    recognition.onend = () => {
      setIsListening(false);
      const transcript = pendingTranscriptRef.current.trim();
      pendingTranscriptRef.current = "";
      if (transcript) void doSend(transcript);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (e: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ((e as { error?: string }).error !== "no-speech") {
        setIsListening(false);
        pendingTranscriptRef.current = "";
      }
      // "no-speech" is handled by onend naturally
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);

    // Use document-level release listeners so recording doesn't stop if the
    // pointer drifts off the button while the user is still holding it.
    const release = () => {
      recognitionRef.current?.stop();
      document.removeEventListener("mouseup", release);
      document.removeEventListener("touchend", release);
    };
    document.addEventListener("mouseup", release, { once: true });
    document.addEventListener("touchend", release, { once: true });
  }

  function resetChat() {
    abortRef.current?.abort();
    recognitionRef.current?.stop();
    stopSpeaking();
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(MESSAGES_KEY);
    } catch {
      /* empty */
    }
    setSessionToken(null);
    setMessages([GREETING]);
    setOrderCreated(null);
    setOrderStatuses([]);
    setShowForm(null);
    setIsListening(false);
    streamBufferRef.current = "";
    setStreamingContent(null);
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[9998] transition-opacity duration-300"
          style={{
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            animation: "backdropIn 0.25s ease-out",
          }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Chat panel — bottom-sheet on mobile, centered modal on desktop */}
      {open && (
        <div
          className={`fixed z-[9999] flex flex-col bg-white overflow-hidden${isMobile ? " chat-mobile-sheet" : ""}`}
          style={
            isMobile
              ? {
                  // Use top + bottom (no explicit height) so the panel
                  // automatically shrinks when the keyboard pushes bottom up.
                  top: "5dvh",
                  bottom: kbOffset,
                  left: 0,
                  right: 0,
                  width: "100%",
                  borderRadius: "20px 20px 0 0",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 -4px 24px rgba(0,0,0,0.14), 0 -1px 4px rgba(0,0,0,0.06)",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  WebkitTapHighlightColor: "transparent",
                  animation: "chatSheetIn 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
                  // Always transition bottom so the panel smoothly tracks the keyboard
                  transition: "bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }
              : {
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "min(92vw, 450px)",
                  maxWidth: 450,
                  height: "min(70vh, 600px)",
                  borderRadius: 20,
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow:
                    "0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  WebkitTapHighlightColor: "transparent",
                  animation: "chatModalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }
          }
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{
              background: "linear-gradient(135deg, #0052D4 0%, #4364F7 100%)",
            }}
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 ring-2 ring-white/30">
              <img src={CUSTOMER_ASSETS.logoBrand} className="h-6 w-6 object-contain" alt="logo" />
            </div>

            {/* Title + status — left-aligned, truncates before reaching buttons */}
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-white text-sm leading-tight truncate"
                style={{ letterSpacing: "0.2px" }}
              >
                {COMPANY_CONFIG.brandName}
              </p>
              <p className="flex items-center gap-1.5 mt-0.5">
                {isSpeaking ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse shrink-0" />
                    {t("chatWidget.speaking", "Berbicara…")}
                  </>
                ) : (
                  <>
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${isStreaming ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`}
                    />
                    <span className="text-[11px] text-sky-200">
                      {isStreaming ? t("chatWidget.typing", "Mengetik…") : t("chatWidget.online", "Online")}
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Icon button group — all uniform w-8 h-8 */}
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Sound effects toggle */}
              <button
                onClick={toggleSfx}
                title={sfxEnabled ? t("chatWidget.muteSfx", "Matikan suara efek") : t("chatWidget.enableSfx", "Aktifkan suara efek")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                  sfxEnabled
                    ? "bg-white/20 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/15"
                }`}
              >
                {sfxEnabled ? (
                  <Bell className="h-[15px] w-[15px]" />
                ) : (
                  <BellOff className="h-[15px] w-[15px]" />
                )}
              </button>

              {/* Voice output toggle */}
              <button
                onClick={isSpeaking ? stopSpeaking : toggleVoiceOutput}
                title={
                  isSpeaking
                    ? t("chatWidget.stopSpeaking", "Berhenti bicara")
                    : voiceOutput
                      ? t("chatWidget.muteAiVoice", "Matikan suara AI")
                      : t("chatWidget.enableAiVoice", "Aktifkan suara AI")
                }
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                  voiceOutput || isSpeaking
                    ? "bg-white/20 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/15"
                }`}
              >
                {voiceOutput || isSpeaking ? (
                  <Volume2 className="h-[15px] w-[15px]" />
                ) : (
                  <VolumeX className="h-[15px] w-[15px]" />
                )}
              </button>

              {/* Divider */}
              <span className="w-px h-4 bg-white/20 mx-1 shrink-0" />

              {/* Reset — icon only */}
              <button
                onClick={resetChat}
                title={t("chatWidget.resetConversation", "Reset percakapan")}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-colors duration-200"
              >
                <RotateCcw className="h-[15px] w-[15px]" />
              </button>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-colors duration-200"
              >
                <X className="h-[15px] w-[15px]" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 sm:px-3 py-4 sm:py-3 space-y-3 bg-gray-50"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollBehavior: "smooth",
            }}
          >
            {messages.map((msg) => {
              const msgTime = formatMsgTime(msg.createdAt);
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role !== "user" && (
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0 mt-0.5">
                      {msg.role === "admin" ? (
                        <User className="h-4 w-4 text-sky-700" />
                      ) : (
                        <img src={CUSTOMER_ASSETS.logoBrand} className="h-5 w-5 object-contain" alt="logo" />
                      )}
                    </div>
                  )}
                  <div
                    className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl rounded-tr-sm"
                          : msg.role === "admin"
                            ? "bg-amber-50 border border-amber-200 text-gray-800 rounded-2xl rounded-tl-sm"
                            : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
                      }`}
                      style={{
                        boxShadow:
                          msg.role === "user"
                            ? "0 2px 8px rgba(14,165,233,0.22)"
                            : "0 2px 8px rgba(0,0,0,0.06)",
                        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    >
                      {msg.role === "admin" && (
                        <p className="text-[10px] font-semibold text-amber-600 mb-1">
                          {t("chatWidget.adminLabel", "Admin CST")}
                        </p>
                      )}
                      {msg.attachment && (
                        <div className="mb-1.5">
                          {msg.attachment.type === "image" &&
                          imgPreviewsRef.current.get(msg.id) ? (
                            <img
                              src={imgPreviewsRef.current.get(msg.id)}
                              alt={msg.attachment.name}
                              className="max-w-[180px] max-h-[160px] rounded-xl object-cover mb-1"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-2 py-1.5 mb-1">
                              {msg.attachment.type === "pdf" ? (
                                <FileText className="h-3.5 w-3.5 shrink-0" />
                              ) : (
                                <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                              )}
                              <span className="text-xs truncate max-w-[160px]">
                                {msg.attachment.name}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {msg.content}
                    </div>
                    {msgTime && (
                      <p className="text-[10px] text-gray-400 mt-1 px-1">
                        {msgTime}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Live streaming bubble — replaces the old bouncing dots */}
            {isStreaming && (
              <div className="flex gap-2 flex-row">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0 mt-0.5">
                  <img src={CUSTOMER_ASSETS.logoBrand} className="h-5 w-5 object-contain" alt="logo" />
                </div>
                <div
                  className="max-w-[85%] bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                >
                  {streamingContent || (
                    /* Bouncing dots only while waiting for the first token */
                    <span className="flex gap-1 items-center h-5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full bg-sky-400 inline-block animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </span>
                  )}
                  {/* Blinking cursor at end of streaming text */}
                  {streamingContent && (
                    <span className="inline-block w-0.5 h-4 bg-sky-500 align-middle ml-0.5 animate-pulse" />
                  )}
                </div>
              </div>
            )}

            {orderCreated && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3">
                <Package className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    {t("chatWidget.orderCreated", "Order Berhasil Dibuat!")}
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    {t("chatWidget.orderNumber", "No. Order")}: {orderCreated.orderNumber}
                  </p>
                  <Link
                    href="/track"
                    className="text-xs text-green-700 underline font-medium mt-1 inline-block"
                    onClick={() => setOpen(false)}
                  >
                    {t("chatWidget.trackOrder", "Lacak status order →")}
                  </Link>
                </div>
              </div>
            )}

            {showForm && (
              <OrderForm
                service={showForm.service}
                sessionToken={sessionToken}
                onSuccess={(orderNumber, orderId, token) => {
                  setShowForm(null);
                  setOrderCreated({ orderNumber, orderId });
                  if (token && token !== sessionToken) {
                    setSessionToken(token);
                    saveSession(token);
                  }
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: (Date.now() + 10).toString(),
                      role: "assistant",
                      content: `✅ Order berhasil dibuat! No. Order: **${orderNumber}**\nTim kami akan segera menghubungi Anda untuk konfirmasi harga.`,
                      createdAt: new Date().toISOString(),
                    },
                  ]);
                }}
                onDismiss={() => setShowForm(null)}
              />
            )}

            {showProductForm && (
              <ProductOrderForm
                productId={showProductForm.productId}
                productName={showProductForm.productName}
                unitPrice={showProductForm.unitPrice}
                unit={showProductForm.unit}
                sessionToken={sessionToken}
                onSuccess={(orderNumber, orderId, token) => {
                  setShowProductForm(null);
                  setOrderCreated({ orderNumber, orderId });
                  if (token && token !== sessionToken) {
                    setSessionToken(token);
                    saveSession(token);
                  }
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: (Date.now() + 11).toString(),
                      role: "assistant",
                      content: `✅ Pesanan **${showProductForm.productName}** berhasil dibuat! No. Order: **${orderNumber}**\nTim kami akan segera menghubungi Anda untuk konfirmasi dan pengiriman.`,
                      createdAt: new Date().toISOString(),
                    },
                  ]);
                }}
                onDismiss={() => setShowProductForm(null)}
              />
            )}

            {orderStatuses.length > 0 && (
              <div className="space-y-2">
                {orderStatuses.map((ord) => {
                  const {
                    icon: StatusIcon,
                    bg,
                    border,
                    text,
                    badge,
                  } = statusStyle(ord.status);
                  return (
                    <div
                      key={ord.orderNumber}
                      className={`rounded-xl border ${border} ${bg} p-3`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <StatusIcon className={`h-4 w-4 ${text} shrink-0`} />
                        <span className="text-xs font-semibold text-gray-700 flex-1 truncate">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Truck className="h-3 w-3 shrink-0 text-gray-400" />
                        <span className="truncate">{ord.shipmentType}</span>
                        <span className="mx-0.5 text-gray-300">·</span>
                        <span className="truncate">{ord.origin}</span>
                        <ArrowRight className="h-3 w-3 shrink-0 text-gray-400" />
                        <span className="truncate">{ord.destination}</span>
                      </div>
                      {ord.latestAdminReply && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 mt-1 leading-snug line-clamp-2">
                          💬 {ord.latestAdminReply}
                        </p>
                      )}
                      <Link
                        href="/track"
                        className="text-[11px] text-sky-600 underline font-medium mt-1.5 inline-block"
                        onClick={() => setOpen(false)}
                      >
                        {t("chatWidget.viewDetail", "Lihat detail →")}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="px-3 pt-3 sm:pt-2.5 bg-white border-t border-gray-100 shrink-0"
            style={{
              paddingBottom: kbOffset > 0
                ? "12px"
                : "calc(12px + env(safe-area-inset-bottom))",
            }}
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setAttachedFile(f);
                if (f.type.startsWith("image/")) {
                  const reader = new FileReader();
                  reader.onload = (ev) =>
                    setAttachedPreview(ev.target?.result as string);
                  reader.readAsDataURL(f);
                } else {
                  setAttachedPreview(null);
                }
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />

            {/* File attachment preview */}
            {attachedFile && (
              <div className="flex items-center gap-2 mb-2 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
                {attachedPreview ? (
                  <img
                    src={attachedPreview}
                    alt={attachedFile.name}
                    className="h-10 w-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-sky-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-sky-800 truncate">
                    {attachedFile.name}
                  </p>
                  <p className="text-[10px] text-sky-600">
                    {attachedFile.type.startsWith("image/") ? "Gambar" : "PDF"} ·{" "}
                    {(attachedFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAttachedFile(null);
                    setAttachedPreview(null);
                  }}
                  className="text-sky-400 hover:text-sky-600 shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Uploading indicator */}
            {uploadingFile && (
              <div className="flex items-center gap-2 mb-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <div className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  {t("chatWidget.analyzingFile", "Menganalisis file dengan AI…")}
                </p>
              </div>
            )}

            {isListening && (
              <div className="flex items-center gap-1.5 text-[11px] text-red-600 font-medium mb-2">
                <span className="flex gap-0.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-red-500 inline-block animate-bounce"
                      style={{
                        height: `${6 + i * 3}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </span>
                {t("chatWidget.recording", "Merekam… lepas tombol untuk kirim")}
              </div>
            )}
            <div className="flex gap-2 items-center min-w-0">
              {/* Attachment button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming || uploadingFile}
                title={t("chatWidget.uploadFileTitle", "Upload gambar atau PDF")}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0 disabled:opacity-40 ${
                  attachedFile
                    ? "bg-sky-100 text-sky-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  startListening();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startListening();
                }}
                disabled={isStreaming || uploadingFile}
                title={t("chatWidget.holdToRecord", "Tahan untuk merekam suara, lepas untuk kirim")}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0 disabled:opacity-40 select-none ${
                  isListening
                    ? "bg-red-500 text-white scale-110 shadow-lg"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 active:bg-red-100 active:text-red-500"
                }`}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={
                  isStreaming
                    ? t("chatWidget.waitingReply", "Menunggu balasan…")
                    : isListening
                      ? t("chatWidget.speakNow", "Bicara sekarang…")
                      : t("chatWidget.typeOrSpeak", "Ketik atau bicara…")
                }
                className="flex-1 min-w-0 rounded-full border outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                style={{
                  fontSize: 16,
                  lineHeight: "1.4",
                  background: "#f8f9fa",
                  borderColor: "#e9ecef",
                  padding: "10px 14px",
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                }}
                disabled={isStreaming}
              />
              <button
                onClick={() => void sendMessage()}
                disabled={isStreaming || uploadingFile || (!input.trim() && !attachedFile)}
                aria-label={t("chatWidget.sendMessage", "Kirim pesan")}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shrink-0"
                style={{
                  background:
                    isStreaming || uploadingFile || (!input.trim() && !attachedFile)
                      ? "linear-gradient(135deg, #93c5fd, #6366f1)"
                      : "linear-gradient(135deg, #0284c7, #1d4ed8)",
                  boxShadow: "0 2px 8px rgba(14,165,233,0.35)",
                  opacity: isStreaming || uploadingFile || (!input.trim() && !attachedFile) ? 0.55 : 1,
                }}
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowForm({ service: "" })}
              className="w-full mt-2 text-[11px] text-sky-600 hover:text-sky-700 flex items-center justify-center gap-1 py-1.5 rounded-xl hover:bg-sky-50 transition-all duration-200 min-h-[36px]"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              {t("chatWidget.openOrderForm", "Buka form order langsung")}
            </button>
          </div>
        </div>
      )}

      {/* Bubble button — fixed at bottom-right; hidden on mobile when panel is open */}
      <button
        onClick={() => { unlockAudio(); setOpen((v) => !v); }}
        className="fixed z-[9999] rounded-full text-white flex items-center justify-center transition-all duration-300 hover:-translate-y-1 active:scale-95"
        style={{
          bottom: 24,
          right: 20,
          width: 52,
          height: 52,
          background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)",
          boxShadow:
            "0 4px 20px rgba(14,165,233,0.5), 0 2px 8px rgba(0,0,0,0.15)",
          WebkitTapHighlightColor: "transparent",
          display: isMobile && open ? "none" : undefined,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 8px 28px rgba(14,165,233,0.6), 0 4px 12px rgba(0,0,0,0.18)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 4px 20px rgba(14,165,233,0.5), 0 2px 8px rgba(0,0,0,0.15)";
        }}
        aria-label={t("chatWidget.openChat", "Chat dengan AI assistant")}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
