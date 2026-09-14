import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { searchAirports, type Airport } from "@/lib/airports-data";
import { PlaneTakeoff } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function AirportCombobox({ value, onChange, placeholder, className }: Props) {
  const { t } = useLanguage();
  const resolvedPlaceholder = placeholder ?? t("combobox.airport", "Kode IATA atau Kota");
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Airport[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(searchAirports(query));
  }, [query]);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(airport: Airport) {
    onChange(airport.iata);
    setQuery(airport.iata);
    setOpen(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toUpperCase();
    setQuery(val);
    onChange(val);
    setOpen(true);
  }

  const showDropdown = open && results.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <Input
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        placeholder={resolvedPlaceholder}
        className="mt-1 uppercase font-mono tracking-wider"
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden">
          {results.map((airport) => (
            <button
              key={airport.iata}
              type="button"
              onMouseDown={() => handleSelect(airport)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent/5 transition-colors border-b border-border/50 last:border-0"
            >
              <div className="bg-primary/10 rounded-md p-1.5 flex-shrink-0">
                <PlaneTakeoff className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-primary">{airport.iata}</span>
                  <span className="text-xs text-muted-foreground truncate">{airport.city}, {airport.country}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate leading-tight">{airport.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
