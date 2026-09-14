#!/usr/bin/env python3
"""
Apply all missing translations to locale files.
Scope: values-only edits. No key additions, no structural changes.
Run: python3 scripts/apply-translations.py
"""
import re, sys, os

LOCALES_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'i18n', 'locales')

def apply(fname, replacements):
    path = os.path.join(LOCALES_DIR, fname)
    with open(path, encoding='utf-8') as f:
        src = f.read()
    original = src
    for old, new in replacements:
        if old not in src:
            print(f"  WARNING [{fname}]: pattern not found:\n    {old!r}", file=sys.stderr)
            continue
        src = src.replace(old, new, 1)
    if src == original:
        print(f"  [{fname}] no changes (already correct?)")
        return
    with open(path, 'w', encoding='utf-8') as f:
        f.write(src)
    changed = sum(1 for o, n in replacements if o in original and o != n and src.count(n) > 0)
    print(f"  [{fname}] applied {len(replacements)} replacement(s)")

# ─── Common Indonesian block (identical in 10 locales) ────────────────────────
# Appears in nav section ~line 396. Replace with per-locale values.
ID_NAV_OLD = """\
    createRequest: 'Buat Permintaan',
    createRequestFull: 'Buat Permintaan Baru',
    marketplace: 'Marketplace',
    uploadDocs: 'Upload Dokumen',
    trackShipment: 'Tracking Shipment',
    viewInvoice: 'Lihat Invoice',
    recentShipments: 'Shipment Terbaru',
    noShipments: 'Belum ada shipment',
    noShipmentsDesc: 'Mulai buat permintaan pengiriman pertama Anda.',
    statShipmentAktif: 'Shipment Aktif',
    statMenungguPenawaran: 'Menunggu Penawaran',
    statMenungguApproval: 'Menunggu Approval',
    statInvoiceBelumDibayar: 'Invoice Belum Dibayar',
    badgeAktif: 'Aktif',
    badgeProses: 'Proses',
    badgePerluAksi: 'Perlu aksi',
    badgeBayar: 'Bayar',"""

# ─── Common English home-stats/modes/badges block (identical in 11 locales) ──
HOME_EN_OLD = """\
    statActiveClients: 'Active Clients',
    statDestinations: 'Destination Countries',
    statExperience: 'Years of Experience',
    modeIndividual: 'Individual Items',
    modeIndividualSub: 'Choose per service',
    modeBulk: 'Bulk Package',
    modeBulkSub: 'Contract solutions',
    badgePPJK: 'Official PPJK License',
    badgePPJKSub: 'Registered with Customs',"""

HOME_PPJK_MOBILE_OLD = "    badgePPJKMobile: 'PPJK Licensed',"

# ─── Common English heroSubtitle (identical in 11 locales) ────────────────────
HERO_SUB_OLD = "    heroSubtitle: 'Export, import, customs, and domestic shipping — all on one integrated platform.',"

# ─── Common English services-filter block (identical in 10 locales) ──────────
SVC_EN_OLD = """\
    priceStarts: 'Starts from',
    contactUs: 'Contact Us',
    resetFilter: 'Reset semua filter',
    serviceCategory: 'Kategori Layanan',
    allServices: 'Semua Jasa',
    filterHint: 'Filter aktif setelah ada lebih banyak item',
    requestQuoteBtn: 'Request Quote / Pesan',
    statsUnavailable: 'Data statistik tidak tersedia',
    comparePrices: 'Bandingkan Harga',
    priceHighToLow: 'Harga Jual (terurut dari tertinggi)',"""

# ─── Common English globalLogisticsPartner ───────────────────────────────────
GLOBAL_OLD = "    globalLogisticsPartner: 'Global Logistics Partner',"

# ─── Common English onboarding block ─────────────────────────────────────────
OB_TITLE_OLD   = "    headerTitle: 'Complete Your Profile',"
OB_STEPDESC_OLD = "    stepProfileDesc: 'Complete your profile',"
OB_SUCCESS_OLD = "    successDesc: 'Your profile has been saved. Welcome!',"

# ─── zh-CN specific (only needs globalLogisticsPartner, headerTitle, successDesc) ─
apply('zh-CN.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: '全球物流合作伙伴',"),
    (OB_TITLE_OLD,     "    headerTitle: '完善您的个人资料',"),
    (OB_SUCCESS_OLD,   "    successDesc: '您的个人资料已保存。欢迎！',"),
])

# ─── ar-SA: has correct nav, correct service filter; needs home, global, onboarding ─
apply('ar-SA.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: 'شريك لوجستي عالمي',"),
    (HERO_SUB_OLD,     "    heroSubtitle: 'التصدير والاستيراد والجمارك والشحن المحلي — كل ذلك على منصة متكاملة واحدة.',"),
    (HOME_EN_OLD, """\
    statActiveClients: 'عملاء نشطون',
    statDestinations: 'دول الوجهة',
    statExperience: 'سنوات من الخبرة',
    modeIndividual: 'طلبات فردية',
    modeIndividualSub: 'اختر حسب الخدمة',
    modeBulk: 'حزمة جملة',
    modeBulkSub: 'حلول تعاقدية',
    badgePPJK: 'رخصة PPJK رسمية',
    badgePPJKSub: 'مسجل في الجمارك',"""),
    (HOME_PPJK_MOBILE_OLD, "    badgePPJKMobile: 'PPJK مرخص',"),
    (OB_STEPDESC_OLD,  "    stepProfileDesc: 'أكمل ملفك الشخصي',"),
    (OB_TITLE_OLD,     "    headerTitle: 'أكمل ملفك الشخصي',"),
    (OB_SUCCESS_OLD,   "    successDesc: 'تم حفظ ملفك الشخصي. أهلاً وسهلاً!',"),
])

# ─── ar-AE ───────────────────────────────────────────────────────────────────
apply('ar-AE.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: 'شريك لوجستي عالمي',"),
    (HERO_SUB_OLD,     "    heroSubtitle: 'التصدير والاستيراد والجمارك والشحن المحلي — كل ذلك على منصة متكاملة واحدة.',"),
    (HOME_EN_OLD, """\
    statActiveClients: 'عملاء نشطون',
    statDestinations: 'دول الوجهة',
    statExperience: 'سنوات من الخبرة',
    modeIndividual: 'طلبات فردية',
    modeIndividualSub: 'اختر حسب الخدمة',
    modeBulk: 'حزمة جملة',
    modeBulkSub: 'حلول تعاقدية',
    badgePPJK: 'رخصة PPJK رسمية',
    badgePPJKSub: 'مسجل في الجمارك',"""),
    (HOME_PPJK_MOBILE_OLD, "    badgePPJKMobile: 'PPJK مرخص',"),
    (ID_NAV_OLD, """\
    createRequest: 'إنشاء طلب',
    createRequestFull: 'إنشاء طلب جديد',
    marketplace: 'Marketplace',
    uploadDocs: 'رفع المستندات',
    trackShipment: 'تتبع الشحنة',
    viewInvoice: 'عرض الفاتورة',
    recentShipments: 'الشحنات الأخيرة',
    noShipments: 'لا توجد شحنات',
    noShipmentsDesc: 'ابدأ بإنشاء أول طلب شحن لك.',
    statShipmentAktif: 'شحنات نشطة',
    statMenungguPenawaran: 'في انتظار عروض الأسعار',
    statMenungguApproval: 'في انتظار الموافقة',
    statInvoiceBelumDibayar: 'فواتير غير مدفوعة',
    badgeAktif: 'نشط',
    badgeProses: 'قيد المعالجة',
    badgePerluAksi: 'يحتاج إجراء',
    badgeBayar: 'ادفع',"""),
    (SVC_EN_OLD, """\
    priceStarts: 'يبدأ من',
    contactUs: 'اتصل بنا',
    resetFilter: 'إعادة ضبط جميع الفلاتر',
    serviceCategory: 'فئة الخدمة',
    allServices: 'جميع الخدمات',
    filterHint: 'يصبح الفلتر نشطاً عند توفر المزيد من العناصر',
    requestQuoteBtn: 'طلب عرض سعر / طلب',
    statsUnavailable: 'الإحصائيات غير متاحة',
    comparePrices: 'مقارنة الأسعار',
    priceHighToLow: 'السعر (من الأعلى إلى الأدنى)',"""),
    (OB_STEPDESC_OLD,  "    stepProfileDesc: 'أكمل ملفك الشخصي',"),
    (OB_TITLE_OLD,     "    headerTitle: 'أكمل ملفك الشخصي',"),
    (OB_SUCCESS_OLD,   "    successDesc: 'تم حفظ ملفك الشخصي. أهلاً وسهلاً!',"),
])

# ─── de-DE ───────────────────────────────────────────────────────────────────
apply('de-DE.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: 'Globaler Logistikpartner',"),
    (HERO_SUB_OLD,     "    heroSubtitle: 'Export, Import, Zoll und Inlandsversand — alles auf einer integrierten Plattform.',"),
    (HOME_EN_OLD, """\
    statActiveClients: 'Aktive Kunden',
    statDestinations: 'Zielländer',
    statExperience: 'Jahre Erfahrung',
    modeIndividual: 'Einzelne Artikel',
    modeIndividualSub: 'Pro Service wählen',
    modeBulk: 'Paketlösung',
    modeBulkSub: 'Vertragslösungen',
    badgePPJK: 'Offizielle PPJK-Lizenz',
    badgePPJKSub: 'Beim Zoll registriert',"""),
    (HOME_PPJK_MOBILE_OLD, "    badgePPJKMobile: 'PPJK Lizenziert',"),
    (ID_NAV_OLD, """\
    createRequest: 'Anfrage erstellen',
    createRequestFull: 'Neue Anfrage erstellen',
    marketplace: 'Marketplace',
    uploadDocs: 'Dokumente hochladen',
    trackShipment: 'Sendung verfolgen',
    viewInvoice: 'Rechnung anzeigen',
    recentShipments: 'Aktuelle Sendungen',
    noShipments: 'Keine Sendungen',
    noShipmentsDesc: 'Erstellen Sie Ihre erste Sendungsanfrage.',
    statShipmentAktif: 'Aktive Sendungen',
    statMenungguPenawaran: 'Warten auf Angebote',
    statMenungguApproval: 'Warten auf Genehmigung',
    statInvoiceBelumDibayar: 'Offene Rechnungen',
    badgeAktif: 'Aktiv',
    badgeProses: 'In Bearbeitung',
    badgePerluAksi: 'Aktion erforderlich',
    badgeBayar: 'Bezahlen',"""),
    (SVC_EN_OLD, """\
    priceStarts: 'Ab',
    contactUs: 'Kontakt',
    resetFilter: 'Alle Filter zurücksetzen',
    serviceCategory: 'Dienstkategorie',
    allServices: 'Alle Dienste',
    filterHint: 'Filter wird mit mehr Elementen aktiv',
    requestQuoteBtn: 'Angebot anfragen / Bestellen',
    statsUnavailable: 'Statistiken nicht verfügbar',
    comparePrices: 'Preise vergleichen',
    priceHighToLow: 'Verkaufspreis (höchster zuerst)',"""),
    (OB_STEPDESC_OLD,  "    stepProfileDesc: 'Profil vervollständigen',"),
    (OB_TITLE_OLD,     "    headerTitle: 'Profil vervollständigen',"),
    (OB_SUCCESS_OLD,   "    successDesc: 'Ihr Profil wurde gespeichert. Willkommen!',"),
])

# ─── es-ES ───────────────────────────────────────────────────────────────────
apply('es-ES.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: 'Socio logístico global',"),
    (HERO_SUB_OLD,     "    heroSubtitle: 'Exportación, importación, aduanas y envío nacional — todo en una plataforma integrada.',"),
    (HOME_EN_OLD, """\
    statActiveClients: 'Clientes activos',
    statDestinations: 'Países de destino',
    statExperience: 'Años de experiencia',
    modeIndividual: 'Artículos individuales',
    modeIndividualSub: 'Elegir por servicio',
    modeBulk: 'Paquete a granel',
    modeBulkSub: 'Soluciones por contrato',
    badgePPJK: 'Licencia PPJK oficial',
    badgePPJKSub: 'Registrado en Aduanas',"""),
    (HOME_PPJK_MOBILE_OLD, "    badgePPJKMobile: 'PPJK Autorizado',"),
    (ID_NAV_OLD, """\
    createRequest: 'Crear solicitud',
    createRequestFull: 'Crear nueva solicitud',
    marketplace: 'Marketplace',
    uploadDocs: 'Subir documentos',
    trackShipment: 'Rastrear envío',
    viewInvoice: 'Ver factura',
    recentShipments: 'Envíos recientes',
    noShipments: 'Sin envíos',
    noShipmentsDesc: 'Comienza creando tu primera solicitud de envío.',
    statShipmentAktif: 'Envíos activos',
    statMenungguPenawaran: 'Esperando cotizaciones',
    statMenungguApproval: 'Esperando aprobación',
    statInvoiceBelumDibayar: 'Facturas pendientes',
    badgeAktif: 'Activo',
    badgeProses: 'En proceso',
    badgePerluAksi: 'Requiere acción',
    badgeBayar: 'Pagar',"""),
    (SVC_EN_OLD, """\
    priceStarts: 'Desde',
    contactUs: 'Contáctenos',
    resetFilter: 'Restablecer todos los filtros',
    serviceCategory: 'Categoría de servicio',
    allServices: 'Todos los servicios',
    filterHint: 'El filtro se activa con más elementos',
    requestQuoteBtn: 'Solicitar cotización / Pedir',
    statsUnavailable: 'Estadísticas no disponibles',
    comparePrices: 'Comparar precios',
    priceHighToLow: 'Precio de venta (mayor a menor)',"""),
    (OB_STEPDESC_OLD,  "    stepProfileDesc: 'Completa tu perfil',"),
    (OB_TITLE_OLD,     "    headerTitle: 'Completa tu perfil',"),
    (OB_SUCCESS_OLD,   "    successDesc: 'Tu perfil ha sido guardado. ¡Bienvenido!',"),
])

# ─── fr-FR ───────────────────────────────────────────────────────────────────
apply('fr-FR.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: 'Partenaire logistique mondial',"),
    (HERO_SUB_OLD,     "    heroSubtitle: 'Export, import, douanes et livraison nationale — tout sur une plateforme intégrée.',"),
    (HOME_EN_OLD, """\
    statActiveClients: 'Clients actifs',
    statDestinations: 'Pays de destination',
    statExperience: "Années d'expérience",
    modeIndividual: 'Articles individuels',
    modeIndividualSub: 'Choisir par service',
    modeBulk: 'Forfait groupé',
    modeBulkSub: 'Solutions contractuelles',
    badgePPJK: 'Licence PPJK officielle',
    badgePPJKSub: 'Enregistré en douane',"""),
    (HOME_PPJK_MOBILE_OLD, "    badgePPJKMobile: 'PPJK Licencié',"),
    (OB_STEPDESC_OLD,  "    stepProfileDesc: 'Complétez votre profil',"),
    (OB_TITLE_OLD,     "    headerTitle: 'Complétez votre profil',"),
    (OB_SUCCESS_OLD,   "    successDesc: 'Votre profil a été enregistré. Bienvenue !',"),
])

# ─── hi-IN ───────────────────────────────────────────────────────────────────
apply('hi-IN.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: 'वैश्विक लॉजिस्टिक्स भागीदार',"),
    (HERO_SUB_OLD,     "    heroSubtitle: 'निर्यात, आयात, सीमा शुल्क और घरेलू शिपिंग — एक एकीकृत प्लेटफॉर्म पर सब कुछ।',"),
    (HOME_EN_OLD, """\
    statActiveClients: 'सक्रिय ग्राहक',
    statDestinations: 'गंतव्य देश',
    statExperience: 'वर्षों का अनुभव',
    modeIndividual: 'व्यक्तिगत वस्तुएं',
    modeIndividualSub: 'सेवा के अनुसार चुनें',
    modeBulk: 'थोक पैकेज',
    modeBulkSub: 'अनुबंध समाधान',
    badgePPJK: 'आधिकारिक PPJK लाइसेंस',
    badgePPJKSub: 'सीमा शुल्क के साथ पंजीकृत',"""),
    (HOME_PPJK_MOBILE_OLD, "    badgePPJKMobile: 'PPJK लाइसेंसित',"),
    (ID_NAV_OLD, """\
    createRequest: 'अनुरोध बनाएं',
    createRequestFull: 'नया अनुरोध बनाएं',
    marketplace: 'Marketplace',
    uploadDocs: 'दस्तावेज़ अपलोड करें',
    trackShipment: 'शिपमेंट ट्रैक करें',
    viewInvoice: 'चालान देखें',
    recentShipments: 'हाल के शिपमेंट',
    noShipments: 'कोई शिपमेंट नहीं',
    noShipmentsDesc: 'अपना पहला शिपमेंट अनुरोध बनाकर शुरुआत करें।',
    statShipmentAktif: 'सक्रिय शिपमेंट',
    statMenungguPenawaran: 'कोटेशन की प्रतीक्षा',
    statMenungguApproval: 'अनुमोदन की प्रतीक्षा',
    statInvoiceBelumDibayar: 'अवैतनिक चालान',
    badgeAktif: 'सक्रिय',
    badgeProses: 'प्रक्रियाधीन',
    badgePerluAksi: 'कार्रवाई आवश्यक',
    badgeBayar: 'भुगतान करें',"""),
    (SVC_EN_OLD, """\
    priceStarts: 'से शुरू',
    contactUs: 'संपर्क करें',
    resetFilter: 'सभी फ़िल्टर रीसेट करें',
    serviceCategory: 'सेवा श्रेणी',
    allServices: 'सभी सेवाएं',
    filterHint: 'अधिक आइटम होने पर फ़िल्टर सक्रिय होता है',
    requestQuoteBtn: 'कोटेशन अनुरोध / ऑर्डर करें',
    statsUnavailable: 'आँकड़े उपलब्ध नहीं',
    comparePrices: 'कीमतें तुलना करें',
    priceHighToLow: 'बिक्री मूल्य (उच्च से निम्न)',"""),
    (OB_STEPDESC_OLD,  "    stepProfileDesc: 'अपना प्रोफ़ाइल पूरा करें',"),
    (OB_TITLE_OLD,     "    headerTitle: 'अपना प्रोफ़ाइल पूरा करें',"),
    (OB_SUCCESS_OLD,   "    successDesc: 'आपकी प्रोफ़ाइल सहेज ली गई है। स्वागत है!',"),
])

# ─── it-IT ───────────────────────────────────────────────────────────────────
apply('it-IT.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: 'Partner logistico globale',"),
    (HERO_SUB_OLD,     "    heroSubtitle: \"Export, import, dogana e spedizione nazionale — tutto su un'unica piattaforma integrata.\","),
    (HOME_EN_OLD, """\
    statActiveClients: 'Clienti attivi',
    statDestinations: 'Paesi di destinazione',
    statExperience: 'Anni di esperienza',
    modeIndividual: 'Articoli singoli',
    modeIndividualSub: 'Scegli per servizio',
    modeBulk: 'Pacchetto bulk',
    modeBulkSub: 'Soluzioni contrattuali',
    badgePPJK: 'Licenza PPJK ufficiale',
    badgePPJKSub: 'Registrato in Dogana',"""),
    (HOME_PPJK_MOBILE_OLD, "    badgePPJKMobile: 'PPJK Autorizzato',"),
    (ID_NAV_OLD, """\
    createRequest: 'Crea richiesta',
    createRequestFull: 'Crea nuova richiesta',
    marketplace: 'Marketplace',
    uploadDocs: 'Carica documenti',
    trackShipment: 'Traccia spedizione',
    viewInvoice: 'Visualizza fattura',
    recentShipments: 'Spedizioni recenti',
    noShipments: 'Nessuna spedizione',
    noShipmentsDesc: 'Inizia creando la tua prima richiesta di spedizione.',
    statShipmentAktif: 'Spedizioni attive',
    statMenungguPenawaran: 'In attesa di preventivi',
    statMenungguApproval: 'In attesa di approvazione',
    statInvoiceBelumDibayar: 'Fatture non pagate',
    badgeAktif: 'Attivo',
    badgeProses: 'In elaborazione',
    badgePerluAksi: 'Azione richiesta',
    badgeBayar: 'Paga',"""),
    (SVC_EN_OLD, """\
    priceStarts: 'A partire da',
    contactUs: 'Contattaci',
    resetFilter: 'Reimposta tutti i filtri',
    serviceCategory: 'Categoria di servizio',
    allServices: 'Tutti i servizi',
    filterHint: 'Il filtro si attiva con più elementi',
    requestQuoteBtn: 'Richiedi preventivo / Ordina',
    statsUnavailable: 'Statistiche non disponibili',
    comparePrices: 'Confronta prezzi',
    priceHighToLow: 'Prezzo di vendita (dal più alto)',"""),
    (OB_STEPDESC_OLD,  "    stepProfileDesc: 'Completa il tuo profilo',"),
    (OB_TITLE_OLD,     "    headerTitle: 'Completa il tuo profilo',"),
    (OB_SUCCESS_OLD,   "    successDesc: 'Il tuo profilo è stato salvato. Benvenuto!',"),
])

# ─── ja-JP ───────────────────────────────────────────────────────────────────
apply('ja-JP.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: 'グローバル物流パートナー',"),
    (HERO_SUB_OLD,     "    heroSubtitle: '輸出、輸入、通関、国内配送 — すべてが一つの統合プラットフォームで。',"),
    (HOME_EN_OLD, """\
    statActiveClients: 'アクティブ顧客',
    statDestinations: '目的地の国',
    statExperience: '年の経験',
    modeIndividual: '個別サービス',
    modeIndividualSub: 'サービスごとに選択',
    modeBulk: '一括パッケージ',
    modeBulkSub: '契約ソリューション',
    badgePPJK: '公式PPJK許可証',
    badgePPJKSub: '税関登録済み',"""),
    (HOME_PPJK_MOBILE_OLD, "    badgePPJKMobile: 'PPJK 認可',"),
    (ID_NAV_OLD, """\
    createRequest: 'リクエスト作成',
    createRequestFull: '新規リクエスト作成',
    marketplace: 'Marketplace',
    uploadDocs: '書類をアップロード',
    trackShipment: '配送追跡',
    viewInvoice: '請求書を見る',
    recentShipments: '最近の配送',
    noShipments: '配送がありません',
    noShipmentsDesc: '最初の配送リクエストを作成してください。',
    statShipmentAktif: 'アクティブな配送',
    statMenungguPenawaran: '見積もり待ち',
    statMenungguApproval: '承認待ち',
    statInvoiceBelumDibayar: '未払い請求書',
    badgeAktif: 'アクティブ',
    badgeProses: '処理中',
    badgePerluAksi: 'アクションが必要',
    badgeBayar: '支払う',"""),
    (SVC_EN_OLD, """\
    priceStarts: '価格から',
    contactUs: 'お問い合わせ',
    resetFilter: 'すべてのフィルタをリセット',
    serviceCategory: 'サービスカテゴリ',
    allServices: 'すべてのサービス',
    filterHint: 'アイテムが増えるとフィルタが有効になります',
    requestQuoteBtn: '見積もり依頼 / 注文',
    statsUnavailable: '統計情報がありません',
    comparePrices: '価格を比較',
    priceHighToLow: '販売価格（高い順）',"""),
    (OB_STEPDESC_OLD,  "    stepProfileDesc: 'プロフィールを完成させる',"),
    (OB_TITLE_OLD,     "    headerTitle: 'プロフィールを完成させてください',"),
    (OB_SUCCESS_OLD,   "    successDesc: 'プロフィールが保存されました。ようこそ！',"),
])

# ─── ko-KR ───────────────────────────────────────────────────────────────────
apply('ko-KR.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: '글로벌 물류 파트너',"),
    (HERO_SUB_OLD,     "    heroSubtitle: '수출, 수입, 통관, 국내 배송 — 하나의 통합 플랫폼에서 모두.',"),
    (HOME_EN_OLD, """\
    statActiveClients: '활성 고객',
    statDestinations: '목적지 국가',
    statExperience: '년의 경험',
    modeIndividual: '개별 항목',
    modeIndividualSub: '서비스별 선택',
    modeBulk: '대량 패키지',
    modeBulkSub: '계약 솔루션',
    badgePPJK: '공식 PPJK 라이선스',
    badgePPJKSub: '세관 등록',"""),
    (HOME_PPJK_MOBILE_OLD, "    badgePPJKMobile: 'PPJK 인가',"),
    (ID_NAV_OLD, """\
    createRequest: '요청 만들기',
    createRequestFull: '새 요청 만들기',
    marketplace: 'Marketplace',
    uploadDocs: '서류 업로드',
    trackShipment: '배송 추적',
    viewInvoice: '청구서 보기',
    recentShipments: '최근 배송',
    noShipments: '배송 없음',
    noShipmentsDesc: '첫 번째 배송 요청을 생성하여 시작하세요.',
    statShipmentAktif: '활성 배송',
    statMenungguPenawaran: '견적 대기',
    statMenungguApproval: '승인 대기',
    statInvoiceBelumDibayar: '미결 청구서',
    badgeAktif: '활성',
    badgeProses: '처리 중',
    badgePerluAksi: '조치 필요',
    badgeBayar: '결제',"""),
    (SVC_EN_OLD, """\
    priceStarts: '가격부터',
    contactUs: '문의하기',
    resetFilter: '모든 필터 초기화',
    serviceCategory: '서비스 카테고리',
    allServices: '모든 서비스',
    filterHint: '항목이 늘어나면 필터가 활성화됩니다',
    requestQuoteBtn: '견적 요청 / 주문',
    statsUnavailable: '통계를 사용할 수 없습니다',
    comparePrices: '가격 비교',
    priceHighToLow: '판매 가격 (높은 순)',"""),
    (OB_STEPDESC_OLD,  "    stepProfileDesc: '프로필 작성',"),
    (OB_TITLE_OLD,     "    headerTitle: '프로필 작성 완료',"),
    (OB_SUCCESS_OLD,   "    successDesc: '프로필이 저장되었습니다. 환영합니다!',"),
])

# ─── ms-MY ───────────────────────────────────────────────────────────────────
apply('ms-MY.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: 'Rakan Logistik Global',"),
    (HERO_SUB_OLD,     "    heroSubtitle: 'Eksport, import, kastam dan penghantaran domestik — semuanya pada satu platform bersepadu.',"),
    (HOME_EN_OLD, """\
    statActiveClients: 'Pelanggan Aktif',
    statDestinations: 'Negara Destinasi',
    statExperience: 'Tahun Pengalaman',
    modeIndividual: 'Item Individu',
    modeIndividualSub: 'Pilih mengikut perkhidmatan',
    modeBulk: 'Pakej Pukal',
    modeBulkSub: 'Penyelesaian kontrak',
    badgePPJK: 'Lesen PPJK Rasmi',
    badgePPJKSub: 'Berdaftar dengan Kastam',"""),
    (HOME_PPJK_MOBILE_OLD, "    badgePPJKMobile: 'PPJK Berlesen',"),
    (ID_NAV_OLD, """\
    createRequest: 'Buat Permintaan',
    createRequestFull: 'Buat Permintaan Baharu',
    marketplace: 'Marketplace',
    uploadDocs: 'Muat Naik Dokumen',
    trackShipment: 'Jejak Penghantaran',
    viewInvoice: 'Lihat Invois',
    recentShipments: 'Penghantaran Terkini',
    noShipments: 'Tiada penghantaran',
    noShipmentsDesc: 'Mulakan dengan membuat permintaan penghantaran pertama anda.',
    statShipmentAktif: 'Penghantaran Aktif',
    statMenungguPenawaran: 'Menunggu Sebut Harga',
    statMenungguApproval: 'Menunggu Kelulusan',
    statInvoiceBelumDibayar: 'Invois Belum Dibayar',
    badgeAktif: 'Aktif',
    badgeProses: 'Diproses',
    badgePerluAksi: 'Perlu Tindakan',
    badgeBayar: 'Bayar',"""),
    (SVC_EN_OLD, """\
    priceStarts: 'Bermula dari',
    contactUs: 'Hubungi Kami',
    resetFilter: 'Set semula semua penapis',
    serviceCategory: 'Kategori Perkhidmatan',
    allServices: 'Semua Perkhidmatan',
    filterHint: 'Penapis aktif apabila ada lebih banyak item',
    requestQuoteBtn: 'Minta Sebut Harga / Pesan',
    statsUnavailable: 'Statistik tidak tersedia',
    comparePrices: 'Bandingkan Harga',
    priceHighToLow: 'Harga Jualan (tertinggi dahulu)',"""),
    (OB_STEPDESC_OLD,  "    stepProfileDesc: 'Lengkapkan profil anda',"),
    (OB_TITLE_OLD,     "    headerTitle: 'Lengkapkan Profil Anda',"),
    (OB_SUCCESS_OLD,   "    successDesc: 'Profil anda telah disimpan. Selamat datang!',"),
])

# ─── nl-NL ───────────────────────────────────────────────────────────────────
apply('nl-NL.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: 'Wereldwijde Logistiekpartner',"),
    (HERO_SUB_OLD,     "    heroSubtitle: 'Export, import, douane en binnenlandse verzending — alles op één geïntegreerd platform.',"),
    (HOME_EN_OLD, """\
    statActiveClients: 'Actieve klanten',
    statDestinations: 'Bestemmingslanden',
    statExperience: 'Jaar ervaring',
    modeIndividual: 'Individuele items',
    modeIndividualSub: 'Kies per dienst',
    modeBulk: 'Bulkpakket',
    modeBulkSub: 'Contractoplossingen',
    badgePPJK: 'Officiële PPJK-licentie',
    badgePPJKSub: 'Geregistreerd bij Douane',"""),
    (HOME_PPJK_MOBILE_OLD, "    badgePPJKMobile: 'PPJK Gecertificeerd',"),
    (ID_NAV_OLD, """\
    createRequest: 'Aanvraag aanmaken',
    createRequestFull: 'Nieuwe aanvraag aanmaken',
    marketplace: 'Marketplace',
    uploadDocs: 'Documenten uploaden',
    trackShipment: 'Zending volgen',
    viewInvoice: 'Factuur bekijken',
    recentShipments: 'Recente zendingen',
    noShipments: 'Geen zendingen',
    noShipmentsDesc: 'Begin met het maken van uw eerste verzendaanvraag.',
    statShipmentAktif: 'Actieve zendingen',
    statMenungguPenawaran: 'Wachten op offertes',
    statMenungguApproval: 'Wachten op goedkeuring',
    statInvoiceBelumDibayar: 'Onbetaalde facturen',
    badgeAktif: 'Actief',
    badgeProses: 'In behandeling',
    badgePerluAksi: 'Actie vereist',
    badgeBayar: 'Betalen',"""),
    (SVC_EN_OLD, """\
    priceStarts: 'Vanaf',
    contactUs: 'Neem contact op',
    resetFilter: 'Alle filters resetten',
    serviceCategory: 'Servicecategorie',
    allServices: 'Alle diensten',
    filterHint: 'Filter wordt actief met meer items',
    requestQuoteBtn: 'Offerte aanvragen / Bestellen',
    statsUnavailable: 'Statistieken niet beschikbaar',
    comparePrices: 'Prijzen vergelijken',
    priceHighToLow: 'Verkoopprijs (hoog naar laag)',"""),
    (OB_STEPDESC_OLD,  "    stepProfileDesc: 'Vul uw profiel in',"),
    (OB_TITLE_OLD,     "    headerTitle: 'Vul uw profiel in',"),
    (OB_SUCCESS_OLD,   "    successDesc: 'Uw profiel is opgeslagen. Welkom!',"),
])

# ─── zh-TW ───────────────────────────────────────────────────────────────────
apply('zh-TW.ts', [
    (GLOBAL_OLD,       "    globalLogisticsPartner: '全球物流合作夥伴',"),
    (HERO_SUB_OLD,     "    heroSubtitle: '出口、進口、報關及國內配送 — 一站式整合平台。',"),
    (HOME_EN_OLD, """\
    statActiveClients: '活躍客戶',
    statDestinations: '目的地國',
    statExperience: '年行業經驗',
    modeIndividual: '單項服務',
    modeIndividualSub: '按項選擇',
    modeBulk: '套餐服務',
    modeBulkSub: '合同方案',
    badgePPJK: '持證 PPJK',
    badgePPJKSub: '海關注冊認證',"""),
    (HOME_PPJK_MOBILE_OLD, "    badgePPJKMobile: '持證 PPJK',"),
    (ID_NAV_OLD, """\
    createRequest: '建立請求',
    createRequestFull: '建立新請求',
    marketplace: 'Marketplace',
    uploadDocs: '上傳文件',
    trackShipment: '追蹤貨件',
    viewInvoice: '查看發票',
    recentShipments: '最近貨件',
    noShipments: '暫無貨件',
    noShipmentsDesc: '立即建立您的第一個貨運請求。',
    statShipmentAktif: '活躍貨件',
    statMenungguPenawaran: '等待報價',
    statMenungguApproval: '等待審批',
    statInvoiceBelumDibayar: '未付發票',
    badgeAktif: '活躍',
    badgeProses: '處理中',
    badgePerluAksi: '需要操作',
    badgeBayar: '付款',"""),
    (SVC_EN_OLD, """\
    priceStarts: '起價',
    contactUs: '聯絡我們',
    resetFilter: '重設所有篩選器',
    serviceCategory: '服務類別',
    allServices: '所有服務',
    filterHint: '有更多項目時篩選器才會啟用',
    requestQuoteBtn: '索取報價 / 訂購',
    statsUnavailable: '統計資料不可用',
    comparePrices: '比較價格',
    priceHighToLow: '售價（由高至低）',"""),
    (OB_STEPDESC_OLD,  "    stepProfileDesc: '完善個人資料',"),
    (OB_TITLE_OLD,     "    headerTitle: '完善個人資料',"),
    (OB_SUCCESS_OLD,   "    successDesc: '您的個人資料已儲存。歡迎！',"),
])

print("\n✅ All translations applied.")
