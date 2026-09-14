import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Loader2 } from "lucide-react";

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface SelectedGooglePlace {
  displayName: string;
  formattedAddress: string;
  placeId: string;
  latitude: number;
  longitude: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  country?: string;
  onPlaceSelected?: (place: SelectedGooglePlace | null) => void;
}

export function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = "Ketik alamat...",
  className,
  disabled,
  country = "id",
  onPlaceSelected,
}: Props) {
  const [inputVal, setInputVal] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // sync external value → local input when parent changes programmatically
  useEffect(() => {
    setInputVal(value);
  }, [value]);

  const fetchPredictions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setPredictions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ input: q, country });
      const res = await fetch(`/api/places/autocomplete?${params.toString()}`);
      if (!res.ok) { setPredictions([]); return; }
      const data: { predictions: Prediction[] } = await res.json();
      setPredictions(data.predictions ?? []);
      setOpen((data.predictions ?? []).length > 0);
      setActiveIdx(-1);
    } catch {
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, [country]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    onChange(val); // keep parent in sync while typing
    onPlaceSelected?.(null); // typing after a selection returns to manual fallback
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(val), 350);
  };

  const selectPrediction = async (p: Prediction) => {
    setOpen(false);
    setPredictions([]);
    setInputVal(p.description);
    onChange(p.description);
    try {
      const res = await fetch(`/api/places/detail?place_id=${encodeURIComponent(p.place_id)}`);
      if (!res.ok) return;
      const data = await res.json() as {
        name?: string;
        address?: string;
        placeId?: string;
        lat?: number;
        lng?: number;
      };
      if (
        data.placeId === p.place_id &&
        typeof data.name === "string" &&
        typeof data.address === "string" &&
        Number.isFinite(data.lat) &&
        Number.isFinite(data.lng)
      ) {
        onChange(data.address);
        setInputVal(data.address);
        onPlaceSelected?.({
          displayName: data.name,
          formattedAddress: data.address,
          placeId: data.placeId,
          latitude: data.lat as number,
          longitude: data.lng as number,
        });
      }
    } catch {
      // The typed address remains usable as a manual fallback.
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, predictions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      selectPrediction(predictions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 animate-spin pointer-events-none z-10" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => predictions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={cn(
          "w-full rounded-md border border-input bg-background pl-9 pr-9 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
      {open && predictions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border border-border bg-white shadow-lg max-h-60 overflow-y-auto text-sm">
          {predictions.map((p, i) => (
            <li
              key={p.place_id}
              onMouseDown={(e) => { e.preventDefault(); selectPrediction(p); }}
              className={cn(
                "flex items-start gap-2 px-3 py-2.5 cursor-pointer hover:bg-slate-50",
                i === activeIdx && "bg-slate-100"
              )}
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
              <div className="min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {p.structured_formatting?.main_text ?? p.description}
                </p>
                {p.structured_formatting?.secondary_text && (
                  <p className="text-xs text-slate-500 truncate">{p.structured_formatting.secondary_text}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
