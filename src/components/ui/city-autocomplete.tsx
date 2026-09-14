import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Plane, Ship, Loader2 } from "lucide-react";

export type AutocompleteType = "city" | "airport" | "port";

interface LocationItem {
  name: string;
  label: string;
  province?: string;
}

const ID_CITIES: LocationItem[] = [
  { name: "Jakarta", label: "Jakarta", province: "DKI Jakarta" },
  { name: "Jakarta Pusat", label: "Jakarta Pusat", province: "DKI Jakarta" },
  { name: "Jakarta Selatan", label: "Jakarta Selatan", province: "DKI Jakarta" },
  { name: "Jakarta Utara", label: "Jakarta Utara", province: "DKI Jakarta" },
  { name: "Jakarta Timur", label: "Jakarta Timur", province: "DKI Jakarta" },
  { name: "Jakarta Barat", label: "Jakarta Barat", province: "DKI Jakarta" },
  { name: "Surabaya", label: "Surabaya", province: "Jawa Timur" },
  { name: "Bandung", label: "Bandung", province: "Jawa Barat" },
  { name: "Medan", label: "Medan", province: "Sumatera Utara" },
  { name: "Semarang", label: "Semarang", province: "Jawa Tengah" },
  { name: "Makassar", label: "Makassar", province: "Sulawesi Selatan" },
  { name: "Palembang", label: "Palembang", province: "Sumatera Selatan" },
  { name: "Denpasar", label: "Denpasar", province: "Bali" },
  { name: "Tangerang", label: "Tangerang", province: "Banten" },
  { name: "Tangerang Selatan", label: "Tangerang Selatan", province: "Banten" },
  { name: "Bekasi", label: "Bekasi", province: "Jawa Barat" },
  { name: "Depok", label: "Depok", province: "Jawa Barat" },
  { name: "Bogor", label: "Bogor", province: "Jawa Barat" },
  { name: "Yogyakarta", label: "Yogyakarta", province: "DIY" },
  { name: "Malang", label: "Malang", province: "Jawa Timur" },
  { name: "Pekanbaru", label: "Pekanbaru", province: "Riau" },
  { name: "Balikpapan", label: "Balikpapan", province: "Kalimantan Timur" },
  { name: "Samarinda", label: "Samarinda", province: "Kalimantan Timur" },
  { name: "Batam", label: "Batam", province: "Kepulauan Riau" },
  { name: "Padang", label: "Padang", province: "Sumatera Barat" },
  { name: "Bandar Lampung", label: "Bandar Lampung", province: "Lampung" },
  { name: "Jambi", label: "Jambi", province: "Jambi" },
  { name: "Banjarmasin", label: "Banjarmasin", province: "Kalimantan Selatan" },
  { name: "Pontianak", label: "Pontianak", province: "Kalimantan Barat" },
  { name: "Mataram", label: "Mataram", province: "NTB" },
  { name: "Kupang", label: "Kupang", province: "NTT" },
  { name: "Manado", label: "Manado", province: "Sulawesi Utara" },
  { name: "Jayapura", label: "Jayapura", province: "Papua" },
  { name: "Ambon", label: "Ambon", province: "Maluku" },
  { name: "Palu", label: "Palu", province: "Sulawesi Tengah" },
  { name: "Kendari", label: "Kendari", province: "Sulawesi Tenggara" },
  { name: "Gorontalo", label: "Gorontalo", province: "Gorontalo" },
  { name: "Bengkulu", label: "Bengkulu", province: "Bengkulu" },
  { name: "Ternate", label: "Ternate", province: "Maluku Utara" },
  { name: "Manokwari", label: "Manokwari", province: "Papua Barat" },
  { name: "Sorong", label: "Sorong", province: "Papua Barat" },
  { name: "Timika", label: "Timika", province: "Papua" },
  { name: "Merauke", label: "Merauke", province: "Papua" },
  { name: "Solo", label: "Solo (Surakarta)", province: "Jawa Tengah" },
  { name: "Surakarta", label: "Surakarta", province: "Jawa Tengah" },
  { name: "Cirebon", label: "Cirebon", province: "Jawa Barat" },
  { name: "Sukabumi", label: "Sukabumi", province: "Jawa Barat" },
  { name: "Tasikmalaya", label: "Tasikmalaya", province: "Jawa Barat" },
  { name: "Serang", label: "Serang", province: "Banten" },
  { name: "Cilegon", label: "Cilegon", province: "Banten" },
  { name: "Pekalongan", label: "Pekalongan", province: "Jawa Tengah" },
  { name: "Tegal", label: "Tegal", province: "Jawa Tengah" },
  { name: "Magelang", label: "Magelang", province: "Jawa Tengah" },
  { name: "Salatiga", label: "Salatiga", province: "Jawa Tengah" },
  { name: "Purwokerto", label: "Purwokerto", province: "Jawa Tengah" },
  { name: "Kediri", label: "Kediri", province: "Jawa Timur" },
  { name: "Blitar", label: "Blitar", province: "Jawa Timur" },
  { name: "Madiun", label: "Madiun", province: "Jawa Timur" },
  { name: "Mojokerto", label: "Mojokerto", province: "Jawa Timur" },
  { name: "Jember", label: "Jember", province: "Jawa Timur" },
  { name: "Banyuwangi", label: "Banyuwangi", province: "Jawa Timur" },
  { name: "Pasuruan", label: "Pasuruan", province: "Jawa Timur" },
  { name: "Probolinggo", label: "Probolinggo", province: "Jawa Timur" },
  { name: "Sidoarjo", label: "Sidoarjo", province: "Jawa Timur" },
  { name: "Gresik", label: "Gresik", province: "Jawa Timur" },
  { name: "Karawang", label: "Karawang", province: "Jawa Barat" },
  { name: "Cikarang", label: "Cikarang", province: "Jawa Barat" },
  { name: "Garut", label: "Garut", province: "Jawa Barat" },
  { name: "Binjai", label: "Binjai", province: "Sumatera Utara" },
  { name: "Pematangsiantar", label: "Pematangsiantar", province: "Sumatera Utara" },
  { name: "Tebing Tinggi", label: "Tebing Tinggi", province: "Sumatera Utara" },
  { name: "Sibolga", label: "Sibolga", province: "Sumatera Utara" },
  { name: "Bukittinggi", label: "Bukittinggi", province: "Sumatera Barat" },
  { name: "Payakumbuh", label: "Payakumbuh", province: "Sumatera Barat" },
  { name: "Dumai", label: "Dumai", province: "Riau" },
  { name: "Tanjung Pinang", label: "Tanjung Pinang", province: "Kepulauan Riau" },
  { name: "Tanjungpinang", label: "Tanjungpinang", province: "Kepulauan Riau" },
  { name: "Pangkal Pinang", label: "Pangkal Pinang", province: "Bangka Belitung" },
  { name: "Metro", label: "Metro", province: "Lampung" },
  { name: "Lubuklinggau", label: "Lubuklinggau", province: "Sumatera Selatan" },
  { name: "Prabumulih", label: "Prabumulih", province: "Sumatera Selatan" },
  { name: "Baturaja", label: "Baturaja", province: "Sumatera Selatan" },
  { name: "Bandar Aceh", label: "Banda Aceh", province: "Aceh" },
  { name: "Banda Aceh", label: "Banda Aceh", province: "Aceh" },
  { name: "Lhokseumawe", label: "Lhokseumawe", province: "Aceh" },
  { name: "Langsa", label: "Langsa", province: "Aceh" },
  { name: "Sabang", label: "Sabang", province: "Aceh" },
  { name: "Banjarbaru", label: "Banjarbaru", province: "Kalimantan Selatan" },
  { name: "Palangkaraya", label: "Palangkaraya", province: "Kalimantan Tengah" },
  { name: "Kotabaru", label: "Kotabaru", province: "Kalimantan Selatan" },
  { name: "Tarakan", label: "Tarakan", province: "Kalimantan Utara" },
  { name: "Bontang", label: "Bontang", province: "Kalimantan Timur" },
  { name: "Sangatta", label: "Sangatta", province: "Kalimantan Timur" },
  { name: "Pare-Pare", label: "Pare-Pare", province: "Sulawesi Selatan" },
  { name: "Palopo", label: "Palopo", province: "Sulawesi Selatan" },
  { name: "Bone", label: "Bone", province: "Sulawesi Selatan" },
  { name: "Bitung", label: "Bitung", province: "Sulawesi Utara" },
  { name: "Tomohon", label: "Tomohon", province: "Sulawesi Utara" },
  { name: "Kotamobagu", label: "Kotamobagu", province: "Sulawesi Utara" },
  { name: "Luwuk", label: "Luwuk", province: "Sulawesi Tengah" },
  { name: "Poso", label: "Poso", province: "Sulawesi Tengah" },
  { name: "Bau-Bau", label: "Bau-Bau", province: "Sulawesi Tenggara" },
  { name: "Kolaka", label: "Kolaka", province: "Sulawesi Tenggara" },
  { name: "Maumere", label: "Maumere", province: "NTT" },
  { name: "Ende", label: "Ende", province: "NTT" },
  { name: "Ruteng", label: "Ruteng", province: "NTT" },
  { name: "Labuan Bajo", label: "Labuan Bajo", province: "NTT" },
  { name: "Bima", label: "Bima", province: "NTB" },
  { name: "Sumbawa", label: "Sumbawa", province: "NTB" },
  { name: "Singaraja", label: "Singaraja", province: "Bali" },
  { name: "Ubud", label: "Ubud", province: "Bali" },
  { name: "Nabire", label: "Nabire", province: "Papua" },
  { name: "Biak", label: "Biak", province: "Papua" },
  { name: "Wamena", label: "Wamena", province: "Papua" },
  { name: "Fakfak", label: "Fakfak", province: "Papua Barat" },
  { name: "Tual", label: "Tual", province: "Maluku" },
  { name: "Sofifi", label: "Sofifi", province: "Maluku Utara" },
  { name: "Tobelo", label: "Tobelo", province: "Maluku Utara" },
  { name: "Mamuju", label: "Mamuju", province: "Sulawesi Barat" },
];

const ID_AIRPORTS: LocationItem[] = [
  { name: "CGK", label: "CGK — Soekarno-Hatta, Jakarta/Tangerang", province: "DKI Jakarta" },
  { name: "SUB", label: "SUB — Juanda, Surabaya", province: "Jawa Timur" },
  { name: "DPS", label: "DPS — Ngurah Rai, Denpasar (Bali)", province: "Bali" },
  { name: "KNO", label: "KNO — Kualanamu, Medan", province: "Sumatera Utara" },
  { name: "UPG", label: "UPG — Sultan Hasanuddin, Makassar", province: "Sulawesi Selatan" },
  { name: "BPN", label: "BPN — Sultan Aji Muhammad Sulaiman, Balikpapan", province: "Kalimantan Timur" },
  { name: "SRG", label: "SRG — Ahmad Yani, Semarang", province: "Jawa Tengah" },
  { name: "JOG", label: "JOG — Adisutjipto, Yogyakarta", province: "DIY" },
  { name: "YIA", label: "YIA — Yogyakarta International Airport", province: "DIY" },
  { name: "SOC", label: "SOC — Adisumarmo, Solo", province: "Jawa Tengah" },
  { name: "MLG", label: "MLG — Abdul Rachman Saleh, Malang", province: "Jawa Timur" },
  { name: "PKU", label: "PKU — Sultan Syarif Kasim II, Pekanbaru", province: "Riau" },
  { name: "BTH", label: "BTH — Hang Nadim, Batam", province: "Kepulauan Riau" },
  { name: "PDG", label: "PDG — Minangkabau, Padang", province: "Sumatera Barat" },
  { name: "BDJ", label: "BDJ — Syamsuddin Noor, Banjarmasin", province: "Kalimantan Selatan" },
  { name: "PNK", label: "PNK — Supadio, Pontianak", province: "Kalimantan Barat" },
  { name: "SRI", label: "SRI — Sultan Syarif Idrus, Samarinda", province: "Kalimantan Timur" },
  { name: "AMQ", label: "AMQ — Pattimura, Ambon", province: "Maluku" },
  { name: "MDC", label: "MDC — Sam Ratulangi, Manado", province: "Sulawesi Utara" },
  { name: "PLM", label: "PLM — Sultan Mahmud Badaruddin II, Palembang", province: "Sumatera Selatan" },
  { name: "TKG", label: "TKG — Radin Inten II, Bandar Lampung", province: "Lampung" },
  { name: "DJJ", label: "DJJ — Sentani, Jayapura", province: "Papua" },
  { name: "TIM", label: "TIM — Moses Kilangin, Timika", province: "Papua" },
  { name: "MKQ", label: "MKQ — Mopah, Merauke", province: "Papua" },
  { name: "WNP", label: "WNP — Biak Numfor", province: "Papua" },
  { name: "BTJ", label: "BTJ — Sultan Iskandar Muda, Banda Aceh", province: "Aceh" },
  { name: "MES", label: "MES — Soewondo, Medan (militer)", province: "Sumatera Utara" },
  { name: "TRK", label: "TRK — Juwata, Tarakan", province: "Kalimantan Utara" },
  { name: "BIK", label: "BIK — Frans Kaisiepo, Biak", province: "Papua" },
  { name: "GTO", label: "GTO — Jalaluddin, Gorontalo", province: "Gorontalo" },
  { name: "KDI", label: "KDI — Haluoleo, Kendari", province: "Sulawesi Tenggara" },
  { name: "PLW", label: "PLW — Mutiara SIS Al-Jufrie, Palu", province: "Sulawesi Tengah" },
  { name: "LLO", label: "LLO — Labuha, Ternate", province: "Maluku Utara" },
  { name: "TTR", label: "TTR — Sultan Bantilan, Toli-Toli", province: "Sulawesi Tengah" },
  { name: "SQR", label: "SQR — Maimun Saleh, Sabang", province: "Aceh" },
  { name: "LBJ", label: "LBJ — Komodo, Labuan Bajo", province: "NTT" },
  { name: "MOF", label: "MOF — Frans Sales Lega, Maumere", province: "NTT" },
  { name: "RTG", label: "RTG — Frans Sales Lega, Ruteng", province: "NTT" },
  { name: "SAU", label: "SAU — Tardamu, Saumlaki", province: "Maluku" },
  { name: "BJW", label: "BJW — Soa, Ende", province: "NTT" },
  { name: "MJU", label: "MJU — Tampa Padang, Mamuju", province: "Sulawesi Barat" },
  { name: "RGT", label: "RGT — Japura, Rengat", province: "Riau" },
  { name: "NTX", label: "NTX — Ranai, Natuna", province: "Kepulauan Riau" },
  { name: "SIN", label: "SIN — Changi, Singapura", province: "Singapore" },
  { name: "KUL", label: "KUL — Kuala Lumpur, Malaysia", province: "Malaysia" },
  { name: "HKG", label: "HKG — Hong Kong", province: "Hong Kong" },
  { name: "AMS", label: "AMS — Schiphol, Amsterdam", province: "Netherlands" },
  { name: "FRA", label: "FRA — Frankfurt, Jerman", province: "Germany" },
];

const ID_PORTS: LocationItem[] = [
  { name: "Tanjung Priok, Jakarta", label: "Tanjung Priok — Jakarta", province: "DKI Jakarta" },
  { name: "Tanjung Perak, Surabaya", label: "Tanjung Perak — Surabaya", province: "Jawa Timur" },
  { name: "Belawan, Medan", label: "Belawan — Medan", province: "Sumatera Utara" },
  { name: "Tanjung Emas, Semarang", label: "Tanjung Emas — Semarang", province: "Jawa Tengah" },
  { name: "Makassar New Port", label: "Makassar New Port — Makassar", province: "Sulawesi Selatan" },
  { name: "Soekarno-Hatta Port, Makassar", label: "Soekarno-Hatta — Makassar", province: "Sulawesi Selatan" },
  { name: "Balikpapan Port", label: "Pelabuhan Balikpapan", province: "Kalimantan Timur" },
  { name: "Banjarmasin Port", label: "Pelabuhan Banjarmasin (Trisakti)", province: "Kalimantan Selatan" },
  { name: "Pontianak Port", label: "Pelabuhan Pontianak", province: "Kalimantan Barat" },
  { name: "Batam Center Port", label: "Batam Center — Batam", province: "Kepulauan Riau" },
  { name: "Batu Ampar Port, Batam", label: "Batu Ampar — Batam", province: "Kepulauan Riau" },
  { name: "Tanjung Pinang Port", label: "Pelabuhan Tanjung Pinang", province: "Kepulauan Riau" },
  { name: "Panjang Port, Lampung", label: "Pelabuhan Panjang — Lampung", province: "Lampung" },
  { name: "Palembang Port", label: "Pelabuhan Palembang (Boom Baru)", province: "Sumatera Selatan" },
  { name: "Ambon Port", label: "Pelabuhan Ambon", province: "Maluku" },
  { name: "Bitung Port", label: "Pelabuhan Bitung — Manado", province: "Sulawesi Utara" },
  { name: "Sorong Port", label: "Pelabuhan Sorong", province: "Papua Barat" },
  { name: "Jayapura Port", label: "Pelabuhan Jayapura", province: "Papua" },
  { name: "Kendari Port", label: "Pelabuhan Kendari", province: "Sulawesi Tenggara" },
  { name: "Tarakan Port", label: "Pelabuhan Tarakan", province: "Kalimantan Utara" },
  { name: "Dumai Port", label: "Pelabuhan Dumai", province: "Riau" },
  { name: "Krueng Geukueh, Banda Aceh", label: "Krueng Geukueh — Banda Aceh", province: "Aceh" },
  { name: "Kupang Port", label: "Pelabuhan Kupang", province: "NTT" },
  { name: "Mataram Port", label: "Pelabuhan Lembar — Mataram", province: "NTB" },
  { name: "Manokwari Port", label: "Pelabuhan Manokwari", province: "Papua Barat" },
  { name: "Timika Port", label: "Pelabuhan Timika", province: "Papua" },
  { name: "Ternate Port", label: "Pelabuhan Ternate", province: "Maluku Utara" },
  { name: "SGSIN", label: "SGSIN — Singapore", province: "Singapore" },
  { name: "MYPKG", label: "MYPKG — Port Klang, Malaysia", province: "Malaysia" },
  { name: "CNSHA", label: "CNSHA — Shanghai, China", province: "China" },
  { name: "HKHKG", label: "HKHKG — Hong Kong", province: "Hong Kong" },
  { name: "NLRTM", label: "NLRTM — Rotterdam, Belanda", province: "Netherlands" },
  { name: "USNYC", label: "USNYC — New York, USA", province: "USA" },
];

function getDataByType(type: AutocompleteType): LocationItem[] {
  if (type === "airport") return ID_AIRPORTS;
  if (type === "port") return ID_PORTS;
  return ID_CITIES;
}

function searchItems(query: string, items: LocationItem[]): LocationItem[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();
  const exact: LocationItem[] = [];
  const starts: LocationItem[] = [];
  const contains: LocationItem[] = [];

  for (const item of items) {
    const n = item.name.toLowerCase();
    const l = item.label.toLowerCase();
    const p = (item.province ?? "").toLowerCase();
    if (n === q || l === q) { exact.push(item); continue; }
    if (n.startsWith(q) || l.startsWith(q)) { starts.push(item); continue; }
    if (n.includes(q) || l.includes(q) || p.includes(q)) contains.push(item);
  }
  return [...exact, ...starts, ...contains].slice(0, 8);
}

interface CityAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: AutocompleteType;
  className?: string;
  disabled?: boolean;
}

export function CityAutocompleteInput({
  value,
  onChange,
  placeholder,
  type = "city",
  className,
  disabled,
}: CityAutocompleteInputProps) {
  const [query, setQuery] = useState(value ?? "");
  const [results, setResults] = useState<LocationItem[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value ?? ""); }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(v: string) {
    setQuery(v);
    onChange(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (v.length < 1) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(() => {
      const found = searchItems(v, getDataByType(type));
      setResults(found);
      setOpen(found.length > 0);
    }, 120);
  }

  function handleSelect(item: LocationItem) {
    setQuery(item.name);
    onChange(item.name);
    setOpen(false);
    setResults([]);
  }

  const Icon = type === "airport" ? Plane : type === "port" ? Ship : MapPin;
  const defaultPlaceholder =
    type === "airport" ? "Cari kode/nama bandara..." :
    type === "port" ? "Cari nama pelabuhan..." :
    "Cari kota...";

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder ?? defaultPlaceholder}
          className="pl-9 pr-3"
          disabled={disabled}
          onFocus={() => {
            if (query.length >= 1) {
              const found = searchItems(query, getDataByType(type));
              setResults(found);
              setOpen(found.length > 0);
            }
          }}
          autoComplete="off"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-900 border border-border rounded-lg shadow-xl max-h-56 overflow-auto">
          {results.map((r, i) => (
            <button
              key={`${r.name}-${i}`}
              type="button"
              className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-start gap-2 transition-colors"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
            >
              <Icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <span className="font-medium text-foreground">{r.label}</span>
                {r.province && (
                  <span className="ml-1 text-[10px] text-muted-foreground">· {r.province}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
