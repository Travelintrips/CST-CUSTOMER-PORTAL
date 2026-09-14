import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Send, CheckCircle2, User, Building2, Mail, Phone,
  Globe, Package, Hash, MessageSquare, Loader2, X,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ContactSupplierModalProps {
  open: boolean;
  onClose: () => void;
  vendorId: number;
  vendorName: string;
  /** Optional — pre-fill "Product Interested" field */
  productName?: string;
}

// ── Countries list (subset, common trade partners) ────────────────────────────

const COUNTRIES = [
  "Indonesia", "Malaysia", "Singapore", "Thailand", "Vietnam", "Philippines",
  "China", "Japan", "South Korea", "India", "Australia", "United States",
  "United Kingdom", "Germany", "Netherlands", "Saudi Arabia", "UAE",
  "Bangladesh", "Pakistan", "Myanmar", "Cambodia", "Laos", "Brunei", "Other",
];

// ── Form state ────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  productInterested: string;
  quantity: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  country: "Indonesia",
  productInterested: "",
  quantity: "",
  message: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ContactSupplierModal({
  open,
  onClose,
  vendorId,
  vendorName,
  productName = "",
}: ContactSupplierModalProps) {
  const [form, setForm] = useState<FormState>({
    ...INITIAL_FORM,
    productInterested: productName,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inquiryNumber, setInquiryNumber] = useState<string | null>(null);

  function field(key: keyof FormState) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  const { t } = useLanguage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) { setError(t("contactSupplier.errorNameRequired", "Nama wajib diisi")); return; }
    if (!form.phone.trim()) { setError(t("contactSupplier.errorPhoneRequired", "Nomor telepon wajib diisi")); return; }

    setIsSubmitting(true);
    try {
      const r = await fetch(`/api/portal/vendors/${vendorId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          company: form.company.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim(),
          country: form.country || undefined,
          productInterested: form.productInterested.trim() || undefined,
          quantity: form.quantity.trim() || undefined,
          message: form.message.trim() || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data?.error ?? t("contactSupplier.errorGeneral", "Gagal mengirim inquiry. Silakan coba lagi."));
        return;
      }
      setInquiryNumber(data.inquiryNumber);
    } catch {
      setError(t("contactSupplier.errorNetwork", "Terjadi kesalahan jaringan. Silakan coba lagi."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setForm({ ...INITIAL_FORM, productInterested: productName });
      setError(null);
      setInquiryNumber(null);
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full rounded-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-0.5">
                {t("contactSupplier.header", "Contact Supplier")}
              </p>
              <DialogTitle className="text-[16px] font-extrabold text-slate-800 leading-tight">
                {vendorName}
              </DialogTitle>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Success state */}
        {inquiryNumber ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-slate-800 mb-1">{t("contactSupplier.successTitle", "Inquiry Terkirim!")}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                {t("contactSupplier.successDesc", "Inquiry Anda telah diterima. Vendor akan menghubungi Anda segera.")}
              </p>
              <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                <Hash className="h-4 w-4 text-sky-500" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("contactSupplier.inquiryNumber", "Nomor Inquiry")}</p>
                  <p className="text-[14px] font-black text-slate-800 font-mono">{inquiryNumber}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleClose}
              className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold mt-2"
            >
              {t("contactSupplier.doneBtn", "Selesai")}
            </Button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600 flex items-center gap-1">
                <User className="h-3.5 w-3.5" />Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Nama Anda"
                className="rounded-xl text-[13px] border-slate-200 focus:border-sky-400"
                required
                {...field("name")}
              />
            </div>

            {/* Company */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />Perusahaan
              </Label>
              <Input
                placeholder="Nama perusahaan Anda (opsional)"
                className="rounded-xl text-[13px] border-slate-200 focus:border-sky-400"
                {...field("company")}
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />Email
                </Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  className="rounded-xl text-[13px] border-slate-200 focus:border-sky-400"
                  {...field("email")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />No. Telepon / WA <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  placeholder="+62 8xx xxxx xxxx"
                  className="rounded-xl text-[13px] border-slate-200 focus:border-sky-400"
                  required
                  {...field("phone")}
                />
              </div>
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />Negara
              </Label>
              <select
                className="w-full rounded-xl border border-slate-200 focus:border-sky-400 text-[13px] px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-colors"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Product Interested */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600 flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />Produk/Layanan yang Diminati
              </Label>
              <Input
                placeholder="Nama produk atau layanan yang ingin ditanyakan"
                className="rounded-xl text-[13px] border-slate-200 focus:border-sky-400"
                {...field("productInterested")}
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600 flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" />Estimasi Kuantitas
              </Label>
              <Input
                placeholder="Contoh: 10 ton, 500 unit, dll."
                className="rounded-xl text-[13px] border-slate-200 focus:border-sky-400"
                {...field("quantity")}
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600 flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />Pesan
              </Label>
              <textarea
                placeholder={t("contactSupplier.messagePh", "Ceritakan kebutuhan Anda secara singkat...")}
                rows={4}
                className="w-full rounded-xl border border-slate-200 focus:border-sky-400 text-[13px] px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-colors resize-none"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-2 pb-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl font-semibold border-slate-200"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t("contactSupplier.cancelBtn", "Batal")}
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />{t("contactSupplier.sending", "Mengirim...")}</>
                ) : (
                  <><Send className="h-4 w-4" />{t("contactSupplier.sendBtn", "Kirim Inquiry")}</>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
