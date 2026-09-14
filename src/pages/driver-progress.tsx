import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { COMPANY_CONFIG } from "@/config/company";
import { resolveImageUrl } from "@/lib/utils";

type StepMeta = {
  photoUrl?: string;
  gpsLatitude?: number | null;
  gpsLongitude?: number | null;
  deviceTimestamp?: string | null;
  mapUrl?: string | null;
  streetViewUrl?: string | null;
};

type PageData = {
  orderNumber: string;
  customerName: string;
  origin: string | null;
  destination: string | null;
  driverName: string | null;
  completedSteps: string[];
  completedStepsMeta: Record<string, StepMeta>;
  allowedSteps: string[];
  stepLabel: Record<string, string>;
};

const STEP_ICON: Record<string, string> = {
  PICKUP:     "🚛",
  IN_TRANSIT: "🛣️",
  ARRIVED:    "📍",
  DELIVERED:  "📦",
  COMPLETED:  "📋",
};

const PHOTO_REQUIRED = new Set(["PICKUP", "ARRIVED", "DELIVERED", "COMPLETED"]);
// GPS wajib untuk step tracking lapangan; COMPLETED tidak butuh GPS (hanya konfirmasi selesai)
const GPS_REQUIRED = new Set(["PICKUP", "IN_TRANSIT", "ARRIVED", "DELIVERED"]);

function formatDeviceTs(ts: string | null | undefined): string {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch {
    return ts;
  }
}

type GpsResult =
  | { ok: true; latitude: number; longitude: number; timestamp: string }
  | { ok: false; reason: "unsupported" | "denied" | "timeout" | "unavailable" };

async function captureGps(): Promise<GpsResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ok: false, reason: "unsupported" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        ok: true,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        timestamp: new Date(pos.timestamp).toISOString(),
      }),
      (err) => {
        if (err.code === 1) resolve({ ok: false, reason: "denied" });
        else if (err.code === 3) resolve({ ok: false, reason: "timeout" });
        else resolve({ ok: false, reason: "unavailable" });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  });
}

function gpsErrorMessage(reason: "unsupported" | "denied" | "timeout" | "unavailable"): string {
  if (reason === "denied") return "GPS belum aktif / izin lokasi belum diberikan. Aktifkan GPS di pengaturan browser, lalu coba lagi.";
  if (reason === "timeout") return "GPS timeout — sinyal lemah. Pindah ke area terbuka lalu coba lagi.";
  if (reason === "unsupported") return "Browser tidak mendukung GPS. Gunakan browser lain (Chrome/Firefox terbaru).";
  return "GPS tidak tersedia. Pastikan lokasi diaktifkan lalu coba lagi.";
}

export default function DriverProgressPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [gpsWarning, setGpsWarning] = useState<string | null>(null);
  // step yang sedang menunggu retry GPS (diblokir karena GPS gagal + GPS_REQUIRED)
  const [gpsBlockedStep, setGpsBlockedStep] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch(`/api/driver-progress/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); } else { setData(d); }
      })
      .catch(() => setError("Gagal memuat data."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handlePhotoChange(stepKey: string, file: File) {
    setUploading(stepKey);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("stepKey", stepKey);
      const r = await fetch(`/api/driver-progress/${token}/photo`, { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok || d.error) {
        alert(d.error ?? "Upload foto gagal.");
        if (fileRefs.current[stepKey]) fileRefs.current[stepKey]!.value = "";
      } else {
        setPendingPhotos((prev) => ({ ...prev, [stepKey]: d.url as string }));
      }
    } catch {
      alert("Gagal mengunggah foto.");
    } finally {
      setUploading(null);
    }
  }

  async function handleUpdate(stepKey: string) {
    if (!data) return;
    const photoUrl = pendingPhotos[stepKey];
    if (PHOTO_REQUIRED.has(stepKey) && !photoUrl) {
      alert(`Foto wajib diunggah untuk step ${data.stepLabel[stepKey] ?? stepKey}.`);
      return;
    }
    setGpsWarning(null);
    setGpsBlockedStep(null);
    setSubmitting(stepKey);
    try {
      const gpsResult = await captureGps();

      if (!gpsResult.ok) {
        // GPS_REQUIRED steps: blokir submit, tampilkan pesan jelas + opsi retry
        if (GPS_REQUIRED.has(stepKey)) {
          setGpsWarning(gpsErrorMessage(gpsResult.reason));
          setGpsBlockedStep(stepKey);
          setSubmitting(null);
          return;
        }
        // GPS_OPTIONAL steps (COMPLETED): lanjutkan tanpa GPS, tampilkan info
        setGpsWarning("GPS tidak tersedia. Update dikirim tanpa koordinat lokasi.");
      }

      const payload: Record<string, unknown> = { stepKey, photoUrl: photoUrl ?? undefined };
      if (gpsResult.ok) {
        payload.gpsLatitude = gpsResult.latitude;
        payload.gpsLongitude = gpsResult.longitude;
        payload.deviceTimestamp = gpsResult.timestamp;
      }

      const r = await fetch(`/api/driver-progress/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok || d.error) {
        alert(d.error ?? "Gagal memperbarui status.");
      } else {
        setSuccess(`Status "${data.stepLabel[stepKey] ?? stepKey}" berhasil diperbarui.`);
        setGpsWarning(null);
        setGpsBlockedStep(null);
        const newMeta: StepMeta = {};
        if (photoUrl) newMeta.photoUrl = photoUrl;
        if (gpsResult.ok) {
          newMeta.gpsLatitude = gpsResult.latitude;
          newMeta.gpsLongitude = gpsResult.longitude;
          newMeta.deviceTimestamp = gpsResult.timestamp;
          newMeta.mapUrl = d.mapUrl ?? null;
          newMeta.streetViewUrl = d.streetViewUrl ?? null;
        }
        setData((prev) =>
          prev
            ? {
                ...prev,
                completedSteps: [...prev.completedSteps, stepKey],
                completedStepsMeta: {
                  ...prev.completedStepsMeta,
                  [stepKey]: newMeta,
                },
                allowedSteps: prev.allowedSteps.filter((s) => s !== stepKey),
              }
            : prev
        );
        setPendingPhotos((prev) => {
          const next = { ...prev };
          delete next[stepKey];
          return next;
        });
      }
    } catch {
      alert("Gagal terhubung ke server.");
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Memuat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow p-6 max-w-sm w-full text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-gray-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-sm space-y-4 mt-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1">Update Pengiriman</p>
          <p className="text-lg font-bold text-gray-800">{data.orderNumber}</p>
          <p className="text-sm text-gray-600">{data.customerName}</p>
          {data.origin && data.destination && (
            <p className="text-xs text-gray-500 mt-1">{data.origin} → {data.destination}</p>
          )}
          {data.driverName && (
            <p className="text-xs text-gray-500 mt-0.5">👤 {data.driverName}</p>
          )}
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
            ✅ {success}
          </div>
        )}

        {/* GPS Warning */}
        {gpsWarning && (
          <div className={`rounded-xl p-3 text-sm ${gpsBlockedStep ? "bg-red-50 border border-red-200 text-red-700" : "bg-yellow-50 border border-yellow-200 text-yellow-700"}`}>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">{gpsBlockedStep ? "🚫" : "📡"}</span>
              <div className="flex-1">
                <p className="font-medium">{gpsBlockedStep ? "GPS Diperlukan" : "Perhatian GPS"}</p>
                <p className="mt-0.5">{gpsWarning}</p>
                {gpsBlockedStep && (
                  <button
                    onClick={() => handleUpdate(gpsBlockedStep)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 transition"
                  >
                    🔄 Coba Lagi Setelah Aktifkan GPS
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Completed steps */}
        {data.completedSteps.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Sudah Diupdate</p>
            <div className="space-y-3">
              {data.completedSteps.map((s) => {
                const meta = data.completedStepsMeta?.[s];
                const thumb = meta?.photoUrl;
                const hasGps = meta?.gpsLatitude != null && meta?.gpsLongitude != null;
                return (
                  <div key={s} className="text-sm text-gray-600 border border-gray-100 rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <span>{STEP_ICON[s] ?? "•"}</span>
                      <span className="line-through text-gray-400">{data.stepLabel[s] ?? s}</span>
                      <span className="ml-auto text-green-500 text-xs flex-shrink-0">✓</span>
                    </div>

                    {thumb && (
                      <a href={resolveImageUrl(thumb) ?? thumb} target="_blank" rel="noopener noreferrer">
                        <img
                          src={resolveImageUrl(thumb) ?? thumb}
                          alt={`Foto ${data.stepLabel[s] ?? s}`}
                          className="mt-2 w-full rounded-lg object-cover border border-gray-200"
                          style={{ maxHeight: 140 }}
                        />
                      </a>
                    )}

                    {/* GPS info */}
                    {hasGps && (
                      <div className="mt-2 rounded-md bg-blue-50 border border-blue-100 p-2 space-y-1 text-xs text-blue-700">
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          <span className="font-mono">
                            {meta!.gpsLatitude!.toFixed(6)}, {meta!.gpsLongitude!.toFixed(6)}
                          </span>
                        </div>
                        {meta?.deviceTimestamp && (
                          <div className="text-blue-500">🕐 {formatDeviceTs(meta.deviceTimestamp)}</div>
                        )}
                        <div className="flex gap-2 pt-0.5">
                          {meta?.mapUrl && (
                            <a
                              href={meta.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline font-medium text-blue-600"
                            >
                              🗺️ Lihat di Maps
                            </a>
                          )}
                          {meta?.streetViewUrl && (
                            <a
                              href={meta.streetViewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline font-medium text-blue-600"
                            >
                              🏙️ Street View
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Allowed steps */}
        {data.allowedSteps.length > 0 ? (
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Pilih Status Sekarang</p>
            <div className="space-y-4">
              {data.allowedSteps.map((s) => {
                const isPhotoRequired = PHOTO_REQUIRED.has(s);
                const isGpsRequired = GPS_REQUIRED.has(s);
                const photoUrl = pendingPhotos[s];
                const isUploading = uploading === s;
                const isBlocked = gpsBlockedStep === s;
                const canSubmit = (!isPhotoRequired || !!photoUrl) && !isBlocked;
                return (
                  <div key={s} className="space-y-2">
                    {/* Photo upload section */}
                    <div className={`rounded-lg border p-3 ${isBlocked ? "border-red-200 bg-red-50" : "border-gray-200"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{STEP_ICON[s] ?? "•"}</span>
                        <span className="text-sm font-medium text-gray-700">{data.stepLabel[s] ?? s}</span>
                        <div className="ml-auto flex flex-col items-end gap-0.5">
                          {isPhotoRequired && (
                            <span className="text-xs text-red-500 font-medium">Foto wajib</span>
                          )}
                          {!isPhotoRequired && (
                            <span className="text-xs text-gray-400">Foto opsional</span>
                          )}
                          {isGpsRequired && (
                            <span className="text-xs text-blue-600 font-medium">📍 GPS wajib</span>
                          )}
                          {!isGpsRequired && (
                            <span className="text-xs text-gray-400">📍 GPS opsional</span>
                          )}
                        </div>
                      </div>

                      {/* Photo preview */}
                      {photoUrl && (
                        <img
                          src={photoUrl}
                          alt="Preview"
                          className="w-full rounded-lg object-cover mb-2 border border-gray-100"
                          style={{ maxHeight: 180 }}
                        />
                      )}

                      {/* File input */}
                      <label className={`flex items-center justify-center gap-2 w-full py-2 px-3 rounded-md border text-sm cursor-pointer transition ${
                        photoUrl
                          ? "border-green-300 bg-green-50 text-green-700"
                          : "border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}>
                        {isUploading ? (
                          <span>Mengunggah...</span>
                        ) : photoUrl ? (
                          <span>📷 Ganti Foto</span>
                        ) : (
                          <span>📷 {isPhotoRequired ? "Ambil / Pilih Foto" : "Tambah Foto (opsional)"}</span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          disabled={isUploading || submitting !== null}
                          ref={(el) => { fileRefs.current[s] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoChange(s, file);
                          }}
                        />
                      </label>
                    </div>

                    {/* GPS note */}
                    {isGpsRequired ? (
                      <p className="text-xs text-blue-600 px-1 font-medium">
                        📍 GPS wajib diaktifkan untuk step ini. Lokasi akan direkam saat submit.
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 px-1">
                        📡 GPS opsional untuk step ini. Update tetap jalan meski GPS mati.
                      </p>
                    )}

                    {/* Submit button */}
                    <button
                      onClick={() => handleUpdate(s)}
                      disabled={submitting !== null || isUploading || !canSubmit}
                      className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-white text-sm font-medium transition ${
                        isBlocked
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
                      }`}
                    >
                      {submitting === s ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Mengambil GPS & Menyimpan...</span>
                        </>
                      ) : isBlocked ? (
                        <span>🚫 GPS Diperlukan — Aktifkan Lalu Coba Lagi</span>
                      ) : (
                        <span>Update: {data.stepLabel[s] ?? s}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-sm text-gray-600 font-medium">Semua status pengiriman sudah diupdate.</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-6">{COMPANY_CONFIG.brandName} — Driver Update Link</p>
      </div>
    </div>
  );
}
