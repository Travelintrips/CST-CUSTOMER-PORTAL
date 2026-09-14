import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export type GeoLocation = {
  label: string;
  lat: number;
  lon: number;
};

type Props = {
  value: string;
  onChange: (label: string, geo?: GeoLocation) => void;
  placeholder?: string;
  className?: string;
  countryCode?: string;
};

export function LocationCombobox({ value, onChange, placeholder, className, countryCode }: Props) {
  const { t } = useLanguage();
  const resolvedPlaceholder = placeholder ?? t("combobox.searchCity", "Ketik nama kota...");
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
    });
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q });
      if (countryCode) params.set("countrycodes", countryCode);
      const res = await fetch(`/api/geocode?${params.toString()}`);
      if (!res.ok) { setResults([]); return; }
      const data = await res.json();
      setResults(
        (data as Array<{ display_name: string; lat: string; lon: string }>).map((item) => ({
          label: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }))
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [countryCode]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onChange(val, undefined);
    updateDropdownPosition();
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  }

  function handleSelect(geo: GeoLocation) {
    const short = geo.label.split(",").slice(0, 3).join(", ");
    setQuery(short);
    onChange(short, geo);
    setOpen(false);
    setResults([]);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const portal = document.getElementById("loc-dropdown-portal");
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        !(portal?.contains(target))
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleScroll() { updateDropdownPosition(); }
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open, updateDropdownPosition]);

  const showDropdown = open && (results.length > 0 || loading);

  const dropdown = showDropdown ? createPortal(
    <div
      id="loc-dropdown-portal"
      style={dropdownStyle}
      className="bg-white border border-border rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto"
    >
      {loading && results.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("combobox.searching", "Mencari lokasi...")}
        </div>
      )}
      {results.map((geo, idx) => {
        const parts = geo.label.split(",");
        const title = parts.slice(0, 2).join(",");
        const sub = parts.slice(2, 5).join(",");
        return (
          <button
            key={idx}
            type="button"
            onMouseDown={() => handleSelect(geo)}
            className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-accent/5 transition-colors border-b border-border/50 last:border-0"
          >
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{title}</p>
              {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
            </div>
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin pointer-events-none" />}
        <Input
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            updateDropdownPosition();
            setOpen(true);
            if (query.length >= 3) search(query);
          }}
          placeholder={resolvedPlaceholder}
          className="mt-1 pl-9"
          autoComplete="off"
        />
      </div>
      {dropdown}
    </div>
  );
}
