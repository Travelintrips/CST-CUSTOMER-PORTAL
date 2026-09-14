#!/usr/bin/env python3
"""Insert missing i18n keys into all 18 locales in translations.ts."""

import re, sys

TRANSLATIONS_PATH = "translations.ts"

# ── New importTariff keys per locale ─────────────────────────────────────────
TARIFF_KEYS: dict[str, dict[str, str]] = {
    "id-ID": {
        "lartasWarningText": "Wajib memiliki izin khusus sebelum impor. Hubungi PPJK kami untuk asistensi.",
        "prefHideBtn": "Sembunyikan",
        "prefShowAllBtn": "Tampilkan semua",
        "ftaCooNote": "Jika memiliki Certificate of Origin (COO) yang valid, tarif BM bisa lebih rendah:",
        "prefMoreItems": "+{n} lainnya",
        "importHelpDesc": "Tim PPJK kami siap membantu custom clearance, pengurusan dokumen, dan perhitungan biaya impor yang lebih akurat.",
        "importHelpCtaPabean": "Konsultasi Pabean",
        "importerTypeLabelShort": "Jenis Importir",
        "ftaSchemeLabelShort": "Skema FTA",
        "multiFreightLabel": "Ongkir Bersama (IDR)",
        "multiHsListTitle": "Daftar HS Code",
        "multiAddHsText": "Tambah HS Code",
        "multiTableTitle": "Tabel Perbandingan Pajak Impor",
        "multiColHs": "HS Code / Label",
        "multiColValue": "Nilai ({currency})",
        "multiColTotal": "Total",
    },
    "en-US": {
        "lartasWarningText": "Special import permit required before importing. Contact our PPJK team for assistance.",
        "prefHideBtn": "Hide",
        "prefShowAllBtn": "Show all",
        "ftaCooNote": "With a valid Certificate of Origin (COO), import duty rates may be lower:",
        "prefMoreItems": "+{n} more",
        "importHelpDesc": "Our PPJK team is ready to assist with customs clearance, document handling, and accurate import cost calculation.",
        "importHelpCtaPabean": "Customs Consultation",
        "importerTypeLabelShort": "Importer Type",
        "ftaSchemeLabelShort": "FTA Scheme",
        "multiFreightLabel": "Shared Freight (IDR)",
        "multiHsListTitle": "HS Code List",
        "multiAddHsText": "Add HS Code",
        "multiTableTitle": "Import Tax Comparison Table",
        "multiColHs": "HS Code / Label",
        "multiColValue": "Value ({currency})",
        "multiColTotal": "Total",
    },
    "en-GB": {
        "lartasWarningText": "Special import permit required before importing. Contact our PPJK team for assistance.",
        "prefHideBtn": "Hide",
        "prefShowAllBtn": "Show all",
        "ftaCooNote": "With a valid Certificate of Origin (COO), import duty rates may be lower:",
        "prefMoreItems": "+{n} more",
        "importHelpDesc": "Our PPJK team is ready to assist with customs clearance, document handling, and accurate import cost calculation.",
        "importHelpCtaPabean": "Customs Consultation",
        "importerTypeLabelShort": "Importer Type",
        "ftaSchemeLabelShort": "FTA Scheme",
        "multiFreightLabel": "Shared Freight (IDR)",
        "multiHsListTitle": "HS Code List",
        "multiAddHsText": "Add HS Code",
        "multiTableTitle": "Import Tax Comparison Table",
        "multiColHs": "HS Code / Label",
        "multiColValue": "Value ({currency})",
        "multiColTotal": "Total",
    },
    "zh-CN": {
        "lartasWarningText": "进口前需要特殊许可证。请联系我们的 PPJK 团队获取协助。",
        "prefHideBtn": "收起",
        "prefShowAllBtn": "查看全部",
        "ftaCooNote": "持有有效原产地证书（COO）时，进口关税税率可能更低：",
        "prefMoreItems": "+{n} 更多",
        "importHelpDesc": "我们的 PPJK 团队随时为您提供清关、文件处理和准确进口成本计算的帮助。",
        "importHelpCtaPabean": "海关咨询",
        "importerTypeLabelShort": "进口商类型",
        "ftaSchemeLabelShort": "FTA 方案",
        "multiFreightLabel": "共同运费 (IDR)",
        "multiHsListTitle": "HS 编码列表",
        "multiAddHsText": "添加 HS 编码",
        "multiTableTitle": "进口税比较表",
        "multiColHs": "HS 编码 / 标签",
        "multiColValue": "价值 ({currency})",
        "multiColTotal": "总计",
    },
    "zh-TW": {
        "lartasWarningText": "進口前需要特殊許可證。請聯繫我們的 PPJK 團隊獲取協助。",
        "prefHideBtn": "收起",
        "prefShowAllBtn": "查看全部",
        "ftaCooNote": "持有有效原產地證書（COO）時，進口關稅稅率可能更低：",
        "prefMoreItems": "+{n} 更多",
        "importHelpDesc": "我們的 PPJK 團隊隨時為您提供清關、文件處理和準確進口成本計算的幫助。",
        "importHelpCtaPabean": "海關諮詢",
        "importerTypeLabelShort": "進口商類型",
        "ftaSchemeLabelShort": "FTA 方案",
        "multiFreightLabel": "共同運費 (IDR)",
        "multiHsListTitle": "HS 編碼清單",
        "multiAddHsText": "新增 HS 編碼",
        "multiTableTitle": "進口稅比較表",
        "multiColHs": "HS 編碼 / 標籤",
        "multiColValue": "價值 ({currency})",
        "multiColTotal": "總計",
    },
    "ja-JP": {
        "lartasWarningText": "輸入前に特別な輸入許可が必要です。PPJKチームにお問い合わせください。",
        "prefHideBtn": "非表示",
        "prefShowAllBtn": "すべて表示",
        "ftaCooNote": "有効な原産地証明書（COO）があれば、輸入関税率が低くなる場合があります：",
        "prefMoreItems": "+{n} 件",
        "importHelpDesc": "通関手続き、書類処理、正確な輸入コスト計算についてPPJKチームがサポートします。",
        "importHelpCtaPabean": "税関相談",
        "importerTypeLabelShort": "輸入業者の種類",
        "ftaSchemeLabelShort": "FTA スキーム",
        "multiFreightLabel": "共有運賃 (IDR)",
        "multiHsListTitle": "HSコードリスト",
        "multiAddHsText": "HSコードを追加",
        "multiTableTitle": "輸入税比較表",
        "multiColHs": "HSコード / ラベル",
        "multiColValue": "価値 ({currency})",
        "multiColTotal": "合計",
    },
    "ko-KR": {
        "lartasWarningText": "수입 전 특별 수입 허가가 필요합니다. 저희 PPJK 팀에 문의하세요.",
        "prefHideBtn": "숨기기",
        "prefShowAllBtn": "모두 보기",
        "ftaCooNote": "유효한 원산지 증명서(COO)가 있으면 수입 관세율이 낮아질 수 있습니다:",
        "prefMoreItems": "+{n} 더보기",
        "importHelpDesc": "PPJK 팀이 통관, 서류 처리, 정확한 수입 비용 계산을 도와드립니다.",
        "importHelpCtaPabean": "세관 상담",
        "importerTypeLabelShort": "수입업체 유형",
        "ftaSchemeLabelShort": "FTA 방식",
        "multiFreightLabel": "공동 운임 (IDR)",
        "multiHsListTitle": "HS 코드 목록",
        "multiAddHsText": "HS 코드 추가",
        "multiTableTitle": "수입세 비교표",
        "multiColHs": "HS 코드 / 레이블",
        "multiColValue": "가치 ({currency})",
        "multiColTotal": "합계",
    },
    "ms-MY": {
        "lartasWarningText": "Permit import khas diperlukan sebelum import. Hubungi pasukan PPJK kami untuk bantuan.",
        "prefHideBtn": "Sembunyikan",
        "prefShowAllBtn": "Tunjukkan semua",
        "ftaCooNote": "Dengan Sijil Asal (COO) yang sah, kadar duti import boleh lebih rendah:",
        "prefMoreItems": "+{n} lagi",
        "importHelpDesc": "Pasukan PPJK kami sedia membantu pelepasan kastam, pengurusan dokumen, dan pengiraan kos import yang tepat.",
        "importHelpCtaPabean": "Rundingan Kastam",
        "importerTypeLabelShort": "Jenis Pengimport",
        "ftaSchemeLabelShort": "Skim FTA",
        "multiFreightLabel": "Pengangkutan Bersama (IDR)",
        "multiHsListTitle": "Senarai Kod HS",
        "multiAddHsText": "Tambah Kod HS",
        "multiTableTitle": "Jadual Perbandingan Cukai Import",
        "multiColHs": "Kod HS / Label",
        "multiColValue": "Nilai ({currency})",
        "multiColTotal": "Jumlah",
    },
    "en-SG": {
        "lartasWarningText": "Special import permit required. Contact our PPJK team for assistance.",
        "prefHideBtn": "Hide",
        "prefShowAllBtn": "Show all",
        "ftaCooNote": "With a valid Certificate of Origin (COO), import duty rates may be lower:",
        "prefMoreItems": "+{n} more",
        "importHelpDesc": "Our PPJK team is ready to assist with customs clearance, document handling, and accurate import cost calculation.",
        "importHelpCtaPabean": "Customs Consultation",
        "importerTypeLabelShort": "Importer Type",
        "ftaSchemeLabelShort": "FTA Scheme",
        "multiFreightLabel": "Shared Freight (IDR)",
        "multiHsListTitle": "HS Code List",
        "multiAddHsText": "Add HS Code",
        "multiTableTitle": "Import Tax Comparison Table",
        "multiColHs": "HS Code / Label",
        "multiColValue": "Value ({currency})",
        "multiColTotal": "Total",
    },
    "de-DE": {
        "lartasWarningText": "Sondergenehmigung vor dem Import erforderlich. Kontaktieren Sie unser PPJK-Team.",
        "prefHideBtn": "Ausblenden",
        "prefShowAllBtn": "Alle anzeigen",
        "ftaCooNote": "Mit einem gültigen Ursprungszeugnis (COO) können die Importzölle niedriger sein:",
        "prefMoreItems": "+{n} mehr",
        "importHelpDesc": "Unser PPJK-Team unterstützt Sie bei Zollabfertigung, Dokumentenbearbeitung und präziser Importkostenkalkulation.",
        "importHelpCtaPabean": "Zollberatung",
        "importerTypeLabelShort": "Importeurtyp",
        "ftaSchemeLabelShort": "FTA-Schema",
        "multiFreightLabel": "Gemeinsame Fracht (IDR)",
        "multiHsListTitle": "HS-Code-Liste",
        "multiAddHsText": "HS-Code hinzufügen",
        "multiTableTitle": "Importsteuer-Vergleichstabelle",
        "multiColHs": "HS-Code / Bezeichnung",
        "multiColValue": "Wert ({currency})",
        "multiColTotal": "Gesamt",
    },
    "fr-FR": {
        "lartasWarningText": "Permis d'importation spécial requis. Contactez notre équipe PPJK.",
        "prefHideBtn": "Masquer",
        "prefShowAllBtn": "Tout afficher",
        "ftaCooNote": "Avec un certificat d'origine (COO) valide, les taux de droits d'importation peuvent être inférieurs :",
        "prefMoreItems": "+{n} de plus",
        "importHelpDesc": "Notre équipe PPJK est prête à vous aider pour le dédouanement, la gestion des documents et le calcul précis des coûts d'importation.",
        "importHelpCtaPabean": "Consultation Douanière",
        "importerTypeLabelShort": "Type d'Importateur",
        "ftaSchemeLabelShort": "Régime ALE",
        "multiFreightLabel": "Fret Commun (IDR)",
        "multiHsListTitle": "Liste des Codes SH",
        "multiAddHsText": "Ajouter un Code SH",
        "multiTableTitle": "Tableau Comparatif des Taxes d'Importation",
        "multiColHs": "Code SH / Libellé",
        "multiColValue": "Valeur ({currency})",
        "multiColTotal": "Total",
    },
    "nl-NL": {
        "lartasWarningText": "Speciale invoervergunning vereist. Neem contact op met ons PPJK-team.",
        "prefHideBtn": "Verbergen",
        "prefShowAllBtn": "Alles weergeven",
        "ftaCooNote": "Met een geldig certificaat van oorsprong (COO) kunnen importtarieven lager zijn:",
        "prefMoreItems": "+{n} meer",
        "importHelpDesc": "Ons PPJK-team staat klaar om te helpen met douaneafhandeling, documentverwerking en nauwkeurige importkostenberekening.",
        "importHelpCtaPabean": "Douane Consultatie",
        "importerTypeLabelShort": "Type Importeur",
        "ftaSchemeLabelShort": "FTA-Schema",
        "multiFreightLabel": "Gedeelde Vracht (IDR)",
        "multiHsListTitle": "HS-code Lijst",
        "multiAddHsText": "HS-code Toevoegen",
        "multiTableTitle": "Vergelijkingstabel Invoerbelasting",
        "multiColHs": "HS-code / Label",
        "multiColValue": "Waarde ({currency})",
        "multiColTotal": "Totaal",
    },
    "es-ES": {
        "lartasWarningText": "Se requiere permiso especial de importación. Contacte a nuestro equipo PPJK.",
        "prefHideBtn": "Ocultar",
        "prefShowAllBtn": "Mostrar todo",
        "ftaCooNote": "Con un Certificado de Origen (COO) válido, las tasas arancelarias pueden ser más bajas:",
        "prefMoreItems": "+{n} más",
        "importHelpDesc": "Nuestro equipo PPJK está listo para ayudar con despacho aduanero, gestión de documentos y cálculo preciso de costos de importación.",
        "importHelpCtaPabean": "Consulta Aduanera",
        "importerTypeLabelShort": "Tipo de Importador",
        "ftaSchemeLabelShort": "Esquema FTA",
        "multiFreightLabel": "Flete Compartido (IDR)",
        "multiHsListTitle": "Lista de Códigos SA",
        "multiAddHsText": "Agregar Código SA",
        "multiTableTitle": "Tabla Comparativa de Impuestos de Importación",
        "multiColHs": "Código SA / Etiqueta",
        "multiColValue": "Valor ({currency})",
        "multiColTotal": "Total",
    },
    "it-IT": {
        "lartasWarningText": "Permesso speciale di importazione richiesto. Contatta il nostro team PPJK.",
        "prefHideBtn": "Nascondi",
        "prefShowAllBtn": "Mostra tutto",
        "ftaCooNote": "Con un Certificato di Origine (COO) valido, le aliquote dei dazi doganali possono essere inferiori:",
        "prefMoreItems": "+{n} altri",
        "importHelpDesc": "Il nostro team PPJK è pronto ad assistere con lo sdoganamento, la gestione documenti e il calcolo preciso dei costi di importazione.",
        "importHelpCtaPabean": "Consulenza Doganale",
        "importerTypeLabelShort": "Tipo di Importatore",
        "ftaSchemeLabelShort": "Schema FTA",
        "multiFreightLabel": "Nolo Condiviso (IDR)",
        "multiHsListTitle": "Lista Codici SA",
        "multiAddHsText": "Aggiungi Codice SA",
        "multiTableTitle": "Tabella Comparativa delle Imposte di Importazione",
        "multiColHs": "Codice SA / Etichetta",
        "multiColValue": "Valore ({currency})",
        "multiColTotal": "Totale",
    },
    "hi-IN": {
        "lartasWarningText": "आयात से पहले विशेष आयात परमिट आवश्यक है। सहायता के लिए हमारी PPJK टीम से संपर्क करें।",
        "prefHideBtn": "छुपाएं",
        "prefShowAllBtn": "सभी दिखाएं",
        "ftaCooNote": "वैध उत्पत्ति प्रमाण पत्र (COO) के साथ, आयात शुल्क दरें कम हो सकती हैं:",
        "prefMoreItems": "+{n} और",
        "importHelpDesc": "हमारी PPJK टीम सीमा शुल्क निकासी, दस्तावेज़ प्रबंधन और सटीक आयात लागत गणना में सहायता के लिए तैयार है।",
        "importHelpCtaPabean": "सीमा शुल्क परामर्श",
        "importerTypeLabelShort": "आयातक प्रकार",
        "ftaSchemeLabelShort": "FTA योजना",
        "multiFreightLabel": "साझा माल भाड़ा (IDR)",
        "multiHsListTitle": "HS कोड सूची",
        "multiAddHsText": "HS कोड जोड़ें",
        "multiTableTitle": "आयात कर तुलना तालिका",
        "multiColHs": "HS कोड / लेबल",
        "multiColValue": "मूल्य ({currency})",
        "multiColTotal": "कुल",
    },
    "ar-AE": {
        "lartasWarningText": "يلزم الحصول على تصريح استيراد خاص. تواصل مع فريق PPJK للمساعدة.",
        "prefHideBtn": "إخفاء",
        "prefShowAllBtn": "عرض الكل",
        "ftaCooNote": "مع شهادة منشأ (COO) صالحة، قد تكون معدلات رسوم الاستيراد أقل:",
        "prefMoreItems": "+{n} المزيد",
        "importHelpDesc": "فريق PPJK لدينا جاهز للمساعدة في التخليص الجمركي، ومعالجة المستندات، وحساب تكاليف الاستيراد بدقة.",
        "importHelpCtaPabean": "استشارة جمركية",
        "importerTypeLabelShort": "نوع المستورد",
        "ftaSchemeLabelShort": "مخطط FTA",
        "multiFreightLabel": "الشحن المشترك (IDR)",
        "multiHsListTitle": "قائمة رموز HS",
        "multiAddHsText": "إضافة رمز HS",
        "multiTableTitle": "جدول مقارنة ضرائب الاستيراد",
        "multiColHs": "رمز HS / التسمية",
        "multiColValue": "القيمة ({currency})",
        "multiColTotal": "المجموع",
    },
    "ar-SA": {
        "lartasWarningText": "يلزم الحصول على تصريح استيراد خاص. تواصل مع فريق PPJK للمساعدة.",
        "prefHideBtn": "إخفاء",
        "prefShowAllBtn": "عرض الكل",
        "ftaCooNote": "مع شهادة منشأ (COO) صالحة، قد تكون معدلات رسوم الاستيراد أقل:",
        "prefMoreItems": "+{n} المزيد",
        "importHelpDesc": "فريق PPJK لدينا جاهز للمساعدة في التخليص الجمركي، ومعالجة المستندات، وحساب تكاليف الاستيراد بدقة.",
        "importHelpCtaPabean": "استشارة جمركية",
        "importerTypeLabelShort": "نوع المستورد",
        "ftaSchemeLabelShort": "مخطط FTA",
        "multiFreightLabel": "الشحن المشترك (IDR)",
        "multiHsListTitle": "قائمة رموز HS",
        "multiAddHsText": "إضافة رمز HS",
        "multiTableTitle": "جدول مقارنة ضرائب الاستيراد",
        "multiColHs": "رمز HS / التسمية",
        "multiColValue": "القيمة ({currency})",
        "multiColTotal": "المجموع",
    },
    "en-AU": {
        "lartasWarningText": "Special import permit required. Contact our PPJK team for assistance.",
        "prefHideBtn": "Hide",
        "prefShowAllBtn": "Show all",
        "ftaCooNote": "With a valid Certificate of Origin (COO), import duty rates may be lower:",
        "prefMoreItems": "+{n} more",
        "importHelpDesc": "Our PPJK team is ready to assist with customs clearance, document handling, and accurate import cost calculation.",
        "importHelpCtaPabean": "Customs Consultation",
        "importerTypeLabelShort": "Importer Type",
        "ftaSchemeLabelShort": "FTA Scheme",
        "multiFreightLabel": "Shared Freight (IDR)",
        "multiHsListTitle": "HS Code List",
        "multiAddHsText": "Add HS Code",
        "multiTableTitle": "Import Tax Comparison Table",
        "multiColHs": "HS Code / Label",
        "multiColValue": "Value ({currency})",
        "multiColTotal": "Total",
    },
}

# ── New marketplace keys per locale ──────────────────────────────────────────
MARKET_KEYS: dict[str, dict[str, str]] = {
    "id-ID": {"comingSoonTitleLine1": "Marketplace Komoditas B2B", "comingSoonTitleLine2": "dalam Pengembangan"},
    "en-US": {"comingSoonTitleLine1": "B2B Commodity Marketplace", "comingSoonTitleLine2": "In Development"},
    "en-GB": {"comingSoonTitleLine1": "B2B Commodity Marketplace", "comingSoonTitleLine2": "In Development"},
    "zh-CN": {"comingSoonTitleLine1": "B2B 大宗商品市场", "comingSoonTitleLine2": "开发中"},
    "zh-TW": {"comingSoonTitleLine1": "B2B 大宗商品市場", "comingSoonTitleLine2": "開發中"},
    "ja-JP": {"comingSoonTitleLine1": "B2B コモディティマーケット", "comingSoonTitleLine2": "開発中"},
    "ko-KR": {"comingSoonTitleLine1": "B2B 원자재 마켓플레이스", "comingSoonTitleLine2": "개발 중"},
    "ms-MY": {"comingSoonTitleLine1": "Pasaran Komoditi B2B", "comingSoonTitleLine2": "Dalam Pembangunan"},
    "en-SG": {"comingSoonTitleLine1": "B2B Commodity Marketplace", "comingSoonTitleLine2": "In Development"},
    "de-DE": {"comingSoonTitleLine1": "B2B-Rohstoffmarktplatz", "comingSoonTitleLine2": "In Entwicklung"},
    "fr-FR": {"comingSoonTitleLine1": "Place de Marché B2B", "comingSoonTitleLine2": "En Développement"},
    "nl-NL": {"comingSoonTitleLine1": "B2B Grondstoffenmarkt", "comingSoonTitleLine2": "In Ontwikkeling"},
    "es-ES": {"comingSoonTitleLine1": "Mercado de Materias Primas B2B", "comingSoonTitleLine2": "En Desarrollo"},
    "it-IT": {"comingSoonTitleLine1": "Marketplace B2B di Materie Prime", "comingSoonTitleLine2": "In Sviluppo"},
    "hi-IN": {"comingSoonTitleLine1": "B2B कमोडिटी मार्केटप्लेस", "comingSoonTitleLine2": "विकास में"},
    "ar-AE": {"comingSoonTitleLine1": "سوق السلع B2B", "comingSoonTitleLine2": "قيد التطوير"},
    "ar-SA": {"comingSoonTitleLine1": "سوق السلع B2B", "comingSoonTitleLine2": "قيد التطوير"},
    "en-AU": {"comingSoonTitleLine1": "B2B Commodity Marketplace", "comingSoonTitleLine2": "In Development"},
}


def escape_val(s: str) -> str:
    """Escape single quotes in value for use in single-quoted TS string."""
    return s.replace("\\", "\\\\").replace("'", "\\'")


def find_namespace_close(lines: list[str], start: int, ns: str) -> int:
    """Find the line index of the closing '},' or '}' of namespace `ns` starting at `start`."""
    # Find the namespace opening line
    ns_open = -1
    for i in range(start, min(start + 3000, len(lines))):
        if re.match(rf'\s+{re.escape(ns)}\s*:\s*\{{', lines[i]):
            ns_open = i
            break
    if ns_open == -1:
        return -1

    depth = 0
    for i in range(ns_open, min(ns_open + 500, len(lines))):
        depth += lines[i].count('{') - lines[i].count('}')
        if depth <= 0 and i > ns_open:
            return i  # closing line of the namespace block
    return -1


def keys_exist(lines: list[str], close_line: int, keys: list[str], search_back: int = 200) -> set[str]:
    """Return set of keys that already exist in the block above close_line."""
    existing = set()
    for i in range(max(0, close_line - search_back), close_line):
        for k in keys:
            if re.match(rf'\s+{re.escape(k)}\s*:', lines[i]):
                existing.add(k)
    return existing


def build_insertion(keys: dict[str, str], indent: str) -> str:
    lines = []
    for k, v in keys.items():
        lines.append(f"{indent}{k}: '{escape_val(v)}',")
    return "\n".join(lines) + "\n"


def insert_keys_for_locale(
    lines: list[str],
    locale: str,
    locale_start: int,
    namespace: str,
    new_keys: dict[str, str],
) -> int:
    """Insert missing keys into `namespace` block of the locale. Returns count inserted."""
    close = find_namespace_close(lines, locale_start, namespace)
    if close == -1:
        print(f"  WARN: {locale}/{namespace} — namespace not found", file=sys.stderr)
        return 0

    existing = keys_exist(lines, close, list(new_keys.keys()))
    to_insert = {k: v for k, v in new_keys.items() if k not in existing}
    if not to_insert:
        return 0

    # Determine indent from the closing line (strip trailing }, add 2 spaces)
    close_line = lines[close]
    indent_match = re.match(r'(\s+)', close_line)
    base_indent = indent_match.group(1) if indent_match else "      "
    key_indent = base_indent + "  "  # one level deeper than the namespace closing brace

    insertion = build_insertion(to_insert, key_indent)
    lines.insert(close, insertion)
    return len(to_insert)


def main():
    with open(TRANSLATIONS_PATH, encoding="utf-8") as f:
        text = f.read()
    lines = text.split("\n")

    # Find all locale start positions
    locale_pattern = re.compile(r'^\s+"([^"]+)"\s*:\s*\{')
    locale_starts: list[tuple[int, str]] = []
    for i, line in enumerate(lines):
        m = locale_pattern.match(line)
        if m:
            locale_starts.append((i, m.group(1)))

    if not locale_starts:
        print("ERROR: No locales found", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(locale_starts)} locales: {[l for _, l in locale_starts]}")

    # Determine end of each locale (start of next locale or end of file)
    locale_ranges: list[tuple[int, str, int]] = []
    for idx, (start, locale) in enumerate(locale_starts):
        end = locale_starts[idx + 1][0] if idx + 1 < len(locale_starts) else len(lines)
        locale_ranges.append((start, locale, end))

    total_inserted = 0

    # Process in REVERSE order so line numbers stay valid
    for start, locale, end in reversed(locale_ranges):
        t_keys = TARIFF_KEYS.get(locale)
        m_keys = MARKET_KEYS.get(locale)

        if t_keys:
            n = insert_keys_for_locale(lines, locale, start, "importTariff", t_keys)
            if n:
                print(f"  {locale}/importTariff: +{n} keys")
                total_inserted += n

        if m_keys:
            n = insert_keys_for_locale(lines, locale, start, "marketplace", m_keys)
            if n:
                print(f"  {locale}/marketplace: +{n} keys")
                total_inserted += n

    print(f"\nTotal keys inserted: {total_inserted}")

    # Write back
    with open(TRANSLATIONS_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("Done — translations.ts updated.")


if __name__ == "__main__":
    main()
