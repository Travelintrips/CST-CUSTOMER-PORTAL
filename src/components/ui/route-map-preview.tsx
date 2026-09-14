import { useState, useEffect } from "react";
import { MapPin, Route, Clock, Loader2, Navigation } from "lucide-react";

interface Props {
  origin: string;
  destination: string;
}

const GMAPS_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ?? "";

export function RouteMapPreview({ origin, destination }: Props) {
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationText, setDurationText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isReady = origin.trim().length > 3 && destination.trim().length > 3;

  useEffect(() => {
    if (!isReady) {
      setDistanceKm(null);
      setDurationText(null);
      return;
    }
    // Controller lives at effect scope so cleanup can abort even before timer fires
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({
        origin: origin.trim(),
        destination: destination.trim(),
      });
      fetch(`/api/places/distance?${params.toString()}`, { signal: controller.signal })
        .then((r) => { if (!r.ok) throw new Error("distance"); return r.json(); })
        .then((d) => {
          setDistanceKm(d.distanceKm ?? null);
          setDurationText(d.durationText ?? null);
        })
        .catch((e) => { if (e?.name !== "AbortError") { /* ignore */ } })
        .finally(() => setLoading(false));
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [origin, destination, isReady]);

  if (!isReady) return null;

  const embedUrl = GMAPS_KEY
    ? `https://www.google.com/maps/embed/v1/directions?key=${GMAPS_KEY}&origin=${encodeURIComponent(origin.trim())}&destination=${encodeURIComponent(destination.trim())}&mode=driving&language=id`
    : null;

  const mapsLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin.trim())}&destination=${encodeURIComponent(destination.trim())}&travelmode=driving`;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 mt-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-slate-200 text-sm flex-wrap">
        <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
        <span className="truncate max-w-[160px] text-slate-600 text-xs">{origin.trim()}</span>
        <Navigation className="h-3 w-3 text-slate-400 shrink-0" />
        <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
        <span className="truncate max-w-[160px] text-slate-600 text-xs">{destination.trim()}</span>
        <span className="ml-auto flex items-center gap-2 flex-wrap">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
          {!loading && distanceKm != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 px-2.5 py-0.5 text-xs font-semibold">
              <Route className="h-3 w-3" />
              {distanceKm.toLocaleString("id-ID")} km
            </span>
          )}
          {!loading && durationText && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs">
              <Clock className="h-3 w-3" />
              {durationText}
            </span>
          )}
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-orange-600 hover:underline"
          >
            <Navigation className="h-3 w-3" />
            Buka Maps
          </a>
        </span>
      </div>
      {embedUrl ? (
        <iframe
          title="Peta Rute"
          width="100%"
          height="240"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          className="block"
        />
      ) : (
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 h-16 text-sm text-orange-600 hover:underline"
        >
          <Navigation className="h-4 w-4" />
          Lihat rute di Google Maps
        </a>
      )}
    </div>
  );
}
