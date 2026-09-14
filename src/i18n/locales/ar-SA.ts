// @refresh reset
// @ts-nocheck
import type { DeepRecord } from "./types";

const locale: DeepRecord = {
  nav: {
    home: 'الرئيسية',
    products: 'المنتجات',
    services: 'الخدمات',
    about: 'من نحن',
    contact: 'تواصل معنا',
    trackOrder: 'تتبع الطلب',
    calculator: 'حاسبة التكلفة',
    orderProduct: 'طلب منتج',
    login: 'تسجيل الدخول',
    register: 'سجل الآن',
    dashboard: 'لوحة التحكم',
    logout: 'تسجيل الخروج',
    admin: 'الإدارة',
    cart: 'سلة التسوق',
    more: 'المزيد',
    marketplace: 'السوق الإلكتروني',
    hsCode: 'حاسبة رمز HS',
    createRequest: 'إنشاء طلب',
    request: 'طلب',
    myShipments: 'شحناتي',
    documents: 'الوثائق',
    invoicePayment: 'الفاتورة والدفع',
    invoice: 'فاتورة',
    companyProfile: 'ملف الشركة',
    profile: 'الملف',
    importTariffCalc: 'حاسبة رسوم الاستيراد',
    logisticCostCalc: 'حاسبة تكاليف الشحن',
    myRfqs: 'طلبات عروض الأسعار',
    myPurchaseOrders: 'طلبات الشراء',
    pendingApprovals: 'بانتظار الموافقة',
  },
  navbar: {
    searchPlaceholder: 'ابحث عن الخدمات والمنتجات…',
    searchBtn: 'بحث',
    searchSuggestions: 'اقتراحات البحث',
    searchPopular: 'شائع',
    searchEnterHint: 'اضغط Enter للبحث عن الكل',
    searchNoSuggestions: 'لا توجد اقتراحات',
    searchPressEnter: 'اضغط Enter للبحث عن "{query}"',
    uploadLogoFailed: 'فشل رفع الشعار',
    kindService: 'خدمة',
    kindProduct: 'منتج',
    globalLogisticsPartner: 'شريك لوجستي عالمي',
    track: 'تتبع',
    order: 'طلب',
    tariffAndCost: 'التعرفة والتكلفة',
    navLabel: 'التنقل',
  },
  hero: {
    badge: 'حلول لوجستية متكاملة مدعومة بأحدث التقنيات',
    title: 'لوجستيات عالمية، دقة بلا تنازلات.',
    description: 'حلول موثوقة للتصدير والاستيراد والجمارك — تربط أعمالك بالعالم بأمان وفي المواعيد المحددة.',
    primaryCta: 'تصفح الخدمات',
    secondaryCta: 'كن شريكاً تجارياً',
    trusted: '· موثوق به من قبل 500+ شركة',
    scrollDown: 'تمرير',
  },
  quickActions: {
    track: 'تتبع الطلب',
    calculate: 'احسب التكلفة',
    order: 'اطلب الآن',
  },
  stats: {
    countries: 'الدول المستهدفة',
    security: 'أمان الشحنات',
    shipments: 'الشحنات شهرياً',
    support: 'خدمة العملاء',
  },
  about: {
    label: 'من نحن',
    title: 'بنية تحتية وخبرة لا مثيل لها',
    description: 'شركة موثوقة لشحن البضائع والوساطة الجمركية تخدم احتياجات التصدير والاستيراد للشركات والمنشآت في إندونيسيا. نمتلك فريقاً معتمداً وشبكة وكلاء عالمية تمتد في أكثر من 150 دولة.',
    cta: 'انضم إلى عائلتنا',
    point1: 'رؤية شاملة لسلسلة الإمداد من المصدر حتى الوجهة في الوقت الفعلي',
    point2: 'متخصصون جمارك مرخصون لإنجاز المستندات بسرعة فائقة',
    point3: 'منشآت تخزين استراتيجية بالقرب من الموانئ الرئيسية',
    point4: 'مديرو حسابات مخصصون لخدمة العملاء المؤسسيين',
    point5: 'تقنية متطورة لتتبع الشحنات عبر الحوسبة السحابية',
  },
  why: {
    label: 'لماذا نحن',
    title: 'لماذا تثق بنا في إدارة لوجستياتك؟',
    description: 'لسنا مجرد ناقلين للبضائع — نحن نضمن أن تسير رحلة شحنك بسلاسة تامة من لحظة التوثيق حتى التسليم.',
    card1Title: 'تخليص جمركي سريع',
    card1Desc: 'يُسرّع متخصصونا معالجة المستندات الجمركية لضمان انسيابية البضائع دون توقف في الموانئ.',
    card2Title: 'شبكة عالمية واسعة',
    card2Desc: 'شبكة وكلاء في أكثر من 150 دولة تكفل إيصال شحناتك من الباب إلى الباب في أي مكان بالعالم.',
    card3Title: 'تقنية شفافة وموثوقة',
    card3Desc: 'توفر منصتنا السحابية إمكانية متابعة حالة شحنتك بشكل كامل في أي وقت ومن أي مكان.',
    card4Title: 'تأمين شامل للبضائع',
    card4Desc: 'تغطية تأمينية متكاملة لكل شحنة لحماية استثمارك التجاري من أي مخاطر محتملة.',
    card5Title: 'أسعار تنافسية للغاية',
    card5Desc: 'نتفاوض على أفضل الأسعار مع كبرى شركات الطيران والشحن البحري لخفض تكاليف لوجستياتك.',
    card6Title: 'دعم متواصل على مدار الساعة',
    card6Desc: 'فريق خدمة عملائنا في خدمتك على مدار الساعة طوال أيام الأسبوع للرد على استفساراتك وحل طوارئك.',
  },
  cta: {
    title: 'هل أنت جاهز للارتقاء بلوجستياتك العالمية؟',
    titleHighlight: 'العالمية',
    description: 'اختارت شحناتها معنا',
    suffix: 'انضم إلينا واكتشف الفارق الحقيقي.',
    prefix: 'آلاف الشركات والمنشآت',
    primaryBtn: 'أنشئ حساباً مجانياً',
    secondaryBtn: 'تواصل مع فريق المبيعات',
  },
  contact: {
    label: 'تواصل معنا',
    title: 'كيف يمكننا خدمتك؟',
    description: 'فريقنا على أتم الاستعداد للإجابة على كافة تساؤلاتك حول خدمات التصدير والاستيراد والتخليص الجمركي والتخزين وجميع الحلول اللوجستية.',
    sendMessage: 'أرسل رسالتك',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    company: 'اسم الشركة أو المنشأة',
    serviceNeed: 'الخدمة المطلوبة',
    message: 'رسالتك',
    submit: 'إرسال الرسالة',
    successAlert: 'وصلت رسالتك بنجاح. سيتواصل معك فريقنا في أقرب وقت.',
    addressLabel: 'عنوان المكتب',
    emailLabel: 'البريد الإلكتروني',
    phoneLabel: 'رقم الجوال',
    selectPlaceholder: 'اختر الخدمة المناسبة...',
    namePlaceholder: 'عبدالله محمد',
    messagePlaceholder: 'شاركنا احتياجاتك اللوجستية...',
    companyPlaceholder: 'شركة النموذج للخدمات اللوجستية',
    optExport: 'تصدير',
    optImport: 'استيراد',
    optCustoms: 'تخليص جمركي',
    optWarehouse: 'تخزين',
    optInternational: 'شحن دولي',
    optOther: 'أخرى',
  },
  footer: {
    quickLinks: 'روابط مفيدة',
    services: 'خدماتنا',
    servicesTitle: 'خدماتنا',
    contactUs: 'تواصل معنا',
    home: 'الرئيسية',
    portal: 'بوابة العملاء',
    customerPortal: 'بوابة العملاء',
    seaFreight: 'الشحن البحري الدولي',
    airFreight: 'وكالة الشحن الجوي',
    customsBrokerage: 'التخليص الجمركي',
    domesticDistribution: 'التوزيع المحلي',
    customs: 'خدمات الوساطة الجمركية',
    domestic: 'التوزيع المحلي',
    allRights: 'جميع الحقوق محفوظة.',
    tagline: 'حلول لوجستية متكاملة لأعمالك على الصعيد العالمي.',
    description: 'حلول لوجستية متكاملة ومبنية على التقنية لتلبية احتياجات التصدير والاستيراد والتوزيع لأعمالك.',
    location: 'الموقع',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    copyright: 'جميع الحقوق محفوظة.',
    waMessage: 'مرحباً، أرغب في الاستعلام عن خدماتكم.',
    track: 'تتبع الطلب',
    calculator: 'حاسبة التكلفة',
    about: 'من نحن',
    backToTop: 'العودة إلى الأعلى',
  },
  testimonials: {
    label: 'آراء العملاء',
    title: 'موثوقون من قِبل مئات الشركات',
    desc: 'استمع مباشرة إلى عملائنا الذين جرّبوا خدماتنا اللوجستية.',
    t1Name: 'بودي سانتوسو',
    t1Role: 'مدير العمليات · PT. Karya Maju Bersama',
    t1Text: 'ساعدتنا B2B Marketplace and Logistic على تصدير منتجات الأثاث إلى 12 دولة دون أي عوائق. عملية التخليص الجمركي السريعة غيّرت بالفعل طريقة عملنا على المستوى العالمي.',
    t2Name: 'ساري ديوي',
    t2Role: 'مديرة سلسلة التوريد · Retailindo Group',
    t2Text: 'منصة التتبع اللحظي الخاصة بهم مفيدة للغاية. يمكننا مراقبة الشحنات من المستودع الأصلي حتى وصولها لعملائنا في الخارج في أي وقت.',
    t3Name: 'أحمد فوزي',
    t3Role: 'الرئيس التنفيذي · PT. Nusantara Trading Co.',
    t3Text: 'فريقهم متجاوب على مدار الساعة. عندما حدث تغيير مفاجئ في لوائح الاستيراد، وجدوا لنا الحل الأمثل فوراً لاستمرارية أعمالنا.',
  },
  partners: {
    label: 'شركاء الشحن العالميون',
    title: 'شبكة نقل عالمية المستوى',
    desc: 'نتعاون مع شركات الطيران والشحن البحري الرائدة لتوفير أفضل الأسعار وتوافر مساحة الشحن.',
  },
  login: {
    welcomeBack: 'أهلاً بعودتك',
    subtitle: 'أدخل بيانات حسابك للوصول إلى البوابة الإلكترونية',
    sideTitle: 'أدر شحناتك العالمية بكل يسر وسهولة.',
    sideDesc: 'ادخل إلى لوحة التحكم لتتبع طلباتك وإدارة مستنداتك وطلب عروض الأسعار الجديدة.',
    sideTrust: 'تحظى بثقة أكثر من 1000 شركة حول العالم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    signingIn: 'جارٍ تسجيل الدخول...',
    noAccount: 'ليس لديك حساب بعد؟',
    createAccount: 'أنشئ حساباً جديداً',
    loginRequired: 'يرجى تسجيل الدخول أولاً للمتابعة إلى صفحة الدفع.',
    devLoginFailed: 'فشل تسجيل الدخول للمطورين.',
    invalidEmail: 'تنسيق البريد الإلكتروني غير صالح.',
    otpSendFailed: 'فشل إرسال الرمز.',
    otpSent: 'تم إرسال رمز OTP.',
    serverError: 'فشل الاتصال بالخادم.',
    enterOtp: 'أدخل رمز OTP.',
    otpInvalid: 'رمز OTP غير صحيح.',
    enterPhone: 'أدخل رقم الهاتف / WhatsApp.',
    otpSentWa: 'تم إرسال OTP إلى WhatsApp.',
    otpSentToWaPrefix: 'تم إرسال الرمز إلى WhatsApp',
    otpLabel: 'رمز OTP (6 أرقام)',
    authUnavailable: 'خدمة المصادقة غير متاحة. يرجى الاتصال بالمسؤول.',
    sending: 'جارٍ الإرسال...',
    devLoginAs: 'تسجيل الدخول بصفة {role}',
    devLoginBanner: 'تسجيل دخول المطور — يظهر فقط في وضع التطوير',
    useOtherPhone: 'استخدام رقم آخر',
    notRegistered: 'رقم الهاتف غير مسجل.',
    registerNow: 'سجّل الآن',
    phoneFormat: 'الصيغة: 081234… أو 628… أو 8…',
    emailOrPasswordWrong: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    enterEmailFirst: 'أدخل بريدك الإلكتروني أولًا.',
    sendEmailFailed: 'فشل إرسال بريد إعادة تعيين كلمة المرور.',
    resetEmailSent: 'إذا كان البريد الإلكتروني مسجلًا، تم إرسال رابط إعادة التعيين.',
    serverErrorRetry: 'فشل الاتصال بالخادم. حاول مرة أخرى.',
    tabEmailOtp: 'بريد OTP',
    tabPhone: 'رقم الهاتف / WA',
  },
  register: {
    title: 'أنشئ حسابك الآن',
    subtitle: 'انضم إلى منصتنا لإدارة لوجستياتك باحترافية وسهولة',
    stepOf: 'الخطوة',
    of: 'من',
    continueToServices: 'المتابعة لاختيار الخدمات',
    fullName: 'الاسم الكامل',
    emailAddress: 'عنوان البريد الإلكتروني',
    company: 'اسم الشركة أو المنشأة',
    phone: 'رقم الجوال',
    password: 'كلمة المرور',
    servicesTitle: 'ما الخدمات التي تودّ الاستفادة منها؟',
    servicesDesc: 'اختر كل ما ينطبق على احتياجاتك لنتمكن من تقديم تجربة مخصصة لك.',
    selected: 'محدد',
    back: 'رجوع',
    createAccount: 'إنشاء الحساب',
    creatingAccount: 'جارٍ إنشاء الحساب...',
    alreadyHaveAccount: 'هل لديك حساب مسبقاً؟',
    signIn: 'تسجيل الدخول',
    redirectToCheckout: 'أنشئ حساباً لمتابعة طلب الخدمات اللوجستية. بعد إتمام التسجيل، ستنتقل مباشرةً إلى صفحة الدفع.',
  },
  products: {
    catalogLabel: 'كتالوج المنتجات',
    title: 'منتجاتنا',
    description: 'تصفح منتجاتنا عالية الجودة لتلبية احتياجات عملك.',
    search: 'ابحث عن المنتجات أو الفئات...',
    all: 'جميع المنتجات',
    negotiable: 'السعر قابل للتفاوض',
    descriptionLabel: 'الوصف',
    quantityLabel: 'الكمية',
    shippingLabel: 'اختر طريقة الشحن / الخدمة',
    serviceTab: 'خدمة',
    courierTab: 'شركة شحن',
    noShipping: 'لا تتوفر خيارات متاحة',
    subtotal: 'المجموع الفرعي',
    freight: 'رسوم الشحن',
    serviceNote: '+ رسوم الخدمة تُحسب في صفحة تفاصيل الخدمة',
    proceedOrder: 'متابعة الطلب',
    proceedTo: 'الانتقال إلى',
    selectShipping: 'اختر طريقة الشحن / الخدمة',
    redirectNote: 'ستنتقل إلى صفحة تفاصيل الخدمة',
    noProducts: 'لم يتم العثور على منتجات',
    noMatches: 'لا توجد منتجات تطابق بحثك',
    sold: 'تم بيع أكثر من 100',
    viewOrder: 'استعرض وأطلب',
    tryOtherKeyword: 'جرب البحث بكلمة مفتاحية أخرى.',
    noProductsYet: 'لا تتوفر منتجات حتى الآن.',
  },
  jasa: {
    catalogLabel: 'كتالوج الخدمات',
    title: 'الخدمات',
    search: 'ابحث عن الخدمات أو الفئات...',
    all: 'جميع الخدمات',
    createOrder: 'إنشاء طلب',
    submitService: 'تقديم الطلب',
    viewDetail: 'عرض التفاصيل',
    noMatches: 'لا توجد خدمات مطابقة',
    calcCost: 'حاسبة التكاليف',
    calcButton: 'احسب التكلفة',
    customsTitle: 'إدارة الجمارك / PPJK',
    importLabel: 'استيراد',
    exportLabel: 'تصدير',
    domesticLabel: 'محلي',
    backBtn: 'رجوع',
    heroTitle1: 'حلول لوجستية',
    heroTitleAccent: 'موثوقة',
    heroTitle2: 'لأعمالك',
    heroSubtitle: 'التصدير والاستيراد والجمارك والشحن المحلي — كل ذلك على منصة متكاملة واحدة.',
    statActiveClients: 'عملاء نشطون',
    statDestinations: 'دول الوجهة',
    statExperience: 'سنوات من الخبرة',
    modeIndividual: 'طلبات فردية',
    modeIndividualSub: 'اختر حسب الخدمة',
    modeBulk: 'حزمة جملة',
    modeBulkSub: 'حلول تعاقدية',
    badgePPJK: 'رخصة PPJK رسمية',
    badgePPJKSub: 'مسجل في الجمارك',
    badgeRating: 'Rating 4.9 / 5.0',
    badgeRatingSub: 'From 1,200+ reviews',
    badgeDelivery: 'On-Time Delivery',
    badgeDeliverySub: '98.5% on-time rate',
    badgePPJKMobile: 'PPJK مرخص',
    badgeRatingMobile: 'Rating 4.9/5.0',
    badgeDeliveryMobile: 'On-Time 98.5%',
    badgeTimeMobile: 'On-time',
    searchPlaceholder: 'Search services, e.g.: air freight, trucking, customs...',
    searchResultCount: 'vendor services found for',
    breadcrumbServices: 'الخدمات',
    bulkConsultBtn: 'استشارة مجانية',
    bulkCtaFreeConsult: 'استشارة مجانية، بلا التزام.',
    bulkCtaTeamWill: 'سيقوم فريقنا بصياغة حزمة الحلول المناسبة لاحتياجاتك اللوجستية.',
    bulkDesc: 'لوجستيات عقدية شاملة لاحتياجات التصدير والاستيراد والتوزيع بالجملة.',
    bulkFullForwardingDesc: 'معالجة كاملة من استلام الشحنة حتى التسليم في الوجهة النهائية.',
    bulkSeaFreightBundleDesc: 'حزم FCL/LCL بأسعار تعاقدية تنافسية وجداول ثابتة.',
    bulkSubLabel: 'حلول تعاقدية',
    bulkSubmitBtn: 'تقديم حزمة جملة',
    bulkTitle: 'حزمة الجملة',
    bulkWarehouseDesc: 'خدمات التخزين والفرز وإعادة التغليف وفق احتياجات العميل.',
    bulkWarehouseTitle: 'التخزين والمناولة',
    categoryNotFound: 'فئة الخدمة غير موجودة.',
    categoryServicesCount: 'خدمات',
    categoryVendorCount: 'عروض موردين',
    contactUsOffer: 'تواصل معنا للحصول على عرض سعر.',
    detail: 'عرض التفاصيل',
    filterAndSort: 'تصفية وترتيب',
    mulairequest: 'بدء الطلب',
    noVendorOffers: 'لا توجد عروض موردين لهذه الخدمة بعد.',
    pickService: 'اختر خدمة',
    registerAndRequest: 'التسجيل وتقديم الطلب',
    resetAllFilter: 'إعادة تعيين جميع الفلاتر',
    searchResultsTitle: 'نتائج البحث',
    searchVendorPlaceholder: 'ابحث عن موردين...',
    sortPrice: 'ترتيب حسب السعر',
    tryChangeFilter: 'حاول تغيير الفلتر أو كلمة البحث.',
    vendorOffers: 'عروض الموردين',
    vendorOffersAvailable: 'عروض موردين متاحة',
    vendorOffersDesc: 'الموردون المسجلون الذين يقدمون هذه الخدمة.',
    allServices: 'جميع الخدمات',
    backToServices: 'العودة إلى الخدمات',
    breadcrumbHome: 'الرئيسية',
    noResults: 'لا توجد نتائج',
    notFoundDesc: 'فريقنا جاهز للمساعدة. استشر احتياجات الشحن الخاصة بك مباشرة.',
    notFoundTitle: 'لم تجد ما تبحث عنه؟',
    priceNego: 'السعر قابل للتفاوض',
    vendorBadge: 'Vendor',
    internalBadge: 'Internal',
    bulkFullForwardingTitle: 'Full Forwarding',
    bulkSeaFreightBundleTitle: 'Sea Freight Bundle',
    resetFilter: 'إعادة تعيين الفلتر',
    serviceType: 'نوع الخدمة',
    sortCheapest: 'الأرخص',
    sortDefault: 'الافتراضي',
    sortMostExpensive: 'الأغلى',
    viewAll: 'عرض الكل',
  },
  services: {
    catalogLabel: 'كتالوج الخدمات',
    title: 'خدماتنا',
    description: 'تعرف على خدمات اللوجستيات والتخليص الجمركي والشحن الدولي المصممة خصيصاً لاحتياجات أعمالك.',
    search: 'ابحث عن الخدمات أو الفئات...',
    price: 'السعر',
    negotiable: 'السعر قابل للتفاوض',
    addToCart: 'اطلب الآن',
    inCart: 'أضف مجدداً',
    noServices: 'لم يتم العثور على خدمات',
    noResults: 'لا تتوفر خدمات في الوقت الحالي.',
    tryOther: 'جرب البحث بكلمة مفتاحية أخرى.',
    back: 'رجوع',
    serviceUnit: 'خدمة',
    realtimeUpdated: 'محدَّث',
    realtimeLive: 'مباشر',
    truckingBannerTitle: 'احجز أسطول الشاحنات مباشرةً',
    truckingBannerDesc: 'اختر من بين 12 نوعاً من الأساطيل، تحقق من تكلفة الشحن فوراً، وأضف الخدمات حسب حاجتك. سهل وشفاف.',
    truckingBannerCta: 'تحقق من التكلفة واحجز',
    folderViewContents: 'عرض المحتويات',
    folderMore: 'المزيد',
    truckingBannerBadge: 'حجز الشاحنات',
    folderCardDesc: 'خدمات النقل البري وتأجير الحاويات للتسليم المحلي وبين المدن.',
    folderViewAll: 'عرض جميع الخدمات',
    sellingPrice: 'سعر البيع',
    dialogSub: 'اختر الخدمة التي تناسب احتياجاتك',
  },
  dashboard: {
    welcomeBack: 'أهلاً بعودتك',
    overview: 'إليك ملخص شامل لنشاطاتك اللوجستية.',
    totalOrders: 'إجمالي الطلبات',
    activeShipments: 'الشحنات الجارية',
    recentOrders: 'آخر الطلبات',
    viewAll: 'عرض جميعها',
    activities: 'أحدث طلباتك اللوجستية',
    newOrder: 'طلب جديد',
    profileDetails: 'تفاصيل الملف الشخصي',
    company: 'الشركة / المنشأة',
    email: 'البريد الإلكتروني',
    phone: 'رقم الجوال',
    editProfile: 'تعديل الملف الشخصي',
    notProvided: 'غير مُدرج',
    logisticOrdering: 'طلب خدمة لوجستية',
    bookDescription: 'احجز خدمات التصدير والاستيراد والشحن',
    createOrder: 'إنشاء طلب',
    trackOrder: 'تتبع الطلب',
    noOrders: 'لا توجد طلبات بعد',
    noOrdersDesc: 'لم تقم بإنشاء أي طلبات حتى الآن.',
    noStatusOrders: 'لا توجد طلبات',
    noStatusDesc: 'جرب تصفية حالة أخرى.',
    showingOrders: 'عرض',
    orders: 'طلبات',
    clearFilter: 'إلغاء التصفية',
    selectIcon: 'اختر الأيقونة',
    createRequest: 'إنشاء طلب',
    createRequestFull: 'إنشاء طلب جديد',
    marketplace: 'Marketplace',
    uploadDocs: 'رفع المستندات',
    trackShipment: 'Tracking Shipment',
    viewInvoice: 'عرض الفاتورة',
    recentShipments: 'الشحنات الأخيرة',
    noShipments: 'لا توجد شحنات بعد',
    noShipmentsDesc: 'ابدأ بإنشاء أول طلب شحن لك.',
    statShipmentAktif: 'الشحنات النشطة',
    statMenungguPenawaran: 'في انتظار العروض',
    statMenungguApproval: 'في انتظار الموافقة',
    statInvoiceBelumDibayar: 'فاتورة غير مدفوعة',
    badgeAktif: 'نشط',
    badgeProses: 'جارٍ المعالجة',
    badgePerluAksi: 'يتطلب إجراءً',
    badgeBayar: 'ادفع',
  },
  orders: {
    title: 'سجل الطلبات',
    description: 'استعرض وتابع جميع طلباتك وشحناتك اللوجستية.',
    search: 'ابحث برقم الطلب...',
    orderDetails: 'تفاصيل الطلب',
    date: 'التاريخ',
    status: 'الحالة',
    amount: 'المبلغ',
    allFilter: 'الكل',
    activeFilter: 'نشط',
    noOrders: 'لا توجد طلبات بعد',
    noOrdersDesc: 'لم تقم بإنشاء أي طلبات حتى الآن.',
    noResults: 'لا توجد نتائج',
    noResultsDesc: 'جرب البحث بكلمة مفتاحية أخرى.',
    cancelOrder: 'إلغاء الطلب',
    cancelConfirmPrefix: 'إلغاء الطلب',
    cancelFailed: 'تعذّر إلغاء الطلب. يرجى المحاولة مجدداً.',
    activeFilterLabel: 'التصفية الحالية:',
    hapusFilter: 'إلغاء التصفية',
    type: 'النوع',
    total: 'الإجمالي',
    emptyStateMsg: 'ستظهر طلباتك هنا.',
    typeLogistic: 'لوجستي',
    typeCrm: 'طلب مبيعات',
    typeProduct: 'منتج',
    myOrders: 'طلباتي',
    myOrdersDesc: 'جميع طلبات اللوجستيات والمنتجات والمبيعات الخاصة بك في مكان واحد.',
  },
  tracking: {
    title: 'تتبع حالة طلبك',
    description: 'أدخل رقم طلبك للاطلاع على آخر تحديث',
    placeholder: 'مثال: LOG-250429-12345',
    search: 'بحث',
    searching: 'جارٍ البحث...',
    back: 'رجوع',
    notFound: 'لم يتم العثور على الطلب',
    notFoundDesc: 'يرجى التأكد من رقم الطلب وإعادة المحاولة',
    orderNumber: 'رقم الطلب',
    company: 'الشركة',
    pic: 'المسؤول عن التواصل',
    shipmentType: 'نوع الشحنة',
    ItemCategory: 'فئة البضائع',
    origin: 'بلد الشحن',
    destination: 'بلد الوجهة',
    createdAt: 'تاريخ تقديم الطلب',
    subtotal: 'المجموع الفرعي',
    total: 'الإجمالي التقديري',
    services: 'الخدمات المطلوبة',
    infoTitle: 'تنبيه',
    infoDesc: 'سيتواصل معك مسؤولنا لتأكيد الطلب وتزويدك بالسعر النهائي. لأي استفسار تواصل مع فريق خدمة العملاء.',
    newOrder: 'إنشاء طلب جديد',
    trackOrder: 'تتبع الطلب',
  },
  notFound: {
    title: '404 الصفحة غير موجودة',
    description: 'الصفحة التي تبحث عنها غير متاحة.',
  },
  common: {
    loading: 'جارٍ التحميل...',
    error: 'حدث خطأ ما',
    retry: 'إعادة المحاولة',
    close: 'إغلاق',
    draftBannerPre: 'لديك',
    draftBannerUnit: 'طلب خدمة',
    draftBannerPost: 'غير مكتمل.',
    draftBannerResume: 'استئناف الطلب',
    cancel: 'إلغاء',
    save: 'حفظ',
    confirm: 'تأكيد',
    back: 'رجوع',
    search: 'بحث',
  },
  servicesMenu: {
    tagline: 'خدمات لوجستية متكاملة لتلبية احتياجات أعمالك',
    viewAll: 'عرض جميع الخدمات',
    freight: {
      title: 'خدمة الشحن الدولي',
      desc: 'شحن جوي وبحري دولي إلى جميع أنحاء العالم',
    },
    airFreight: {
      title: 'حجز الشحن الجوي',
      desc: 'حجز جوي مباشر — حساب الوزن الخاضع للتسعير واختيار السعر',
    },
    ocean: {
      title: 'الشحن البحري',
      desc: 'شحن بحري دولي FCL/LCL',
    },
    customs: {
      title: 'إدارة الجمارك',
      desc: 'إدارة التخليص الجمركي ومستندات الاستيراد والتصدير',
    },
    domestic: {
      title: 'التوزيع المحلي',
      desc: 'توزيع البضائع محلياً في جميع أنحاء إندونيسيا',
    },
    trucking: {
      title: 'النقل البري',
      desc: 'نقل بري محترف، داخل المدن وبينها',
    },
    tracking: {
      title: 'تتبع الشحنات',
      desc: 'تتبع حالة شحنتك في الوقت الفعلي',
    },
    groupForwarding: 'الشحن الدولي',
    groupPpjk: 'الجمارك / الوسيط',
    consultant: {
      title: 'مستشار جمركي',
      desc: 'استشارة ومساعدة في إجراءات الجمارك',
      sub1: 'إجراءات الاستيراد والتصدير',
      sub2: 'تصاريح الاستيراد والتصدير',
      sub3: 'حساب ضريبة الاستيراد (الرسوم الجمركية، ضريبة القيمة المضافة والضريبة)',
    },
    groupForwardingSubtitle: 'شحن البضائع الدولي والمحلي',
    groupPpjkSubtitle: 'التخليص الجمركي واستشارات إجراءات الاستيراد والتصدير',
    seaFreightCard: {
      title: 'شحن بحري',
      desc: 'شحن بحري FCL و LCL دولي',
    },
    airFreightCard: {
      title: 'شحن جوي',
      desc: 'شحن جوي سريع إلى جميع أنحاء العالم',
    },
    domesticCard: {
      title: 'محلي',
      desc: 'توزيع البضائع بين المدن والجزر في إندونيسيا',
    },
    customsClearanceCard: {
      title: 'التخليص الجمركي',
      desc: 'إدارة كاملة لجمارك الاستيراد والتصدير في الميناء',
    },
  },
  homePromo: {
    products: {
      label: 'منتجات مميزة',
      title: 'أفضل المنتجات لأعمالك',
      desc: 'اكتشف مجموعة متنوعة من المنتجات عالية الجودة المصممة لدعم عمليات أعمالك اللوجستية.',
      cta: 'عرض جميع المنتجات',
    },
    services: {
      label: 'الخدمات الأكثر طلباً',
      title: 'خدمات لوجستية موثوقة',
      desc: 'من الشحن البحري إلى التخليص الجمركي — نقدم حلولاً متكاملة لاحتياجاتك في التصدير والاستيراد.',
      cta: 'عرض جميع الخدمات',
      item1Title: 'شحن البضائع',
      item1Desc: 'شحن جوي وبحري دولي إلى أكثر من 150 دولة.',
      item2Title: 'إدارة الجمارك',
      item2Desc: 'إدارة التخليص الجمركي ومستندات الاستيراد والتصدير.',
      item3Title: 'النقل البري',
      item3Desc: 'نقل بري محترف، داخل المدن وبينها.',
      item4Title: 'التوزيع المحلي',
      item4Desc: 'توزيع البضائع محلياً في جميع مناطق إندونيسيا.',
    },
    promo: {
      label: 'عروض وتخفيضات',
      title: 'عرض خاص لهذا الشهر',
      desc: 'احصل على أفضل الأسعار والعروض الحصرية لاحتياجاتك اللوجستية.',
      cta: 'احصل على العرض',
      item1Title: 'خصم 15% على الشحن البحري',
      item1Desc: 'استفد من خصم خاص للشحن البحري على خطوط جنوب شرق آسيا.',
      item1Badge: 'عرض',
      item1Valid: 'ساري حتى نهاية الشهر',
      item2Title: 'استشارة جمركية مجانية',
      item2Desc: 'استشارة مجانية لإدارة المستندات الجمركية للعملاء الجدد.',
      item2Badge: 'خاص',
      item2Valid: 'للعملاء الجدد',
      item3Title: 'باقة مجمّعة موفّرة',
      item3Desc: 'اجمع بين خدمات الشحن والتخليص الجمركي ووفر حتى 20%.',
      item3Badge: 'خصم',
      item3Valid: 'وفر حتى 20%',
    },
    contact: {
      title: 'تواصل معنا',
      desc: 'تحتاج مساعدة أو ترغب في استشارة؟ فريقنا جاهز لمساعدتك في احتياجاتك اللوجستية.',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف / واتساب',
      message: 'الرسالة',
      namePlaceholder: 'John Doe',
      emailPlaceholder: 'email@company.com',
      phonePlaceholder: '+966 50 123 4567',
      messagePlaceholder: 'أخبرنا عن احتياجاتك اللوجستية...',
      submit: 'إرسال الرسالة',
      whatsapp: 'محادثة واتساب',
      call: 'اتصل الآن',
      successMsg: 'تم إرسال رسالتك! سيتواصل فريقنا معك قريباً.',
      info: 'معلومات التواصل',
      infoDesc: 'نحن جاهزون لخدمتك كل يوم عمل',
    },
  },
  calculator: {
    title: 'حاسبة تقدير التكلفة',
    label: 'الحاسبة',
    desc: 'احسب تقدير تكلفة شحنتك فوراً',
    disclaimer: 'هذا التقدير إرشادي فقط. سيتم تأكيد السعر النهائي من فريق B2B Marketplace and Logistic.',
    serviceType: 'نوع الخدمة',
    selectService: 'اختر الخدمة...',
    origin: 'بلد المنشأ',
    destination: 'بلد الوجهة',
    originPlaceholder: 'مثال: إندونيسيا',
    destinationPlaceholder: 'مثال: سنغافورة',
    weight: 'الوزن (كجم)',
    weightPlaceholder: 'مثال: 100',
    length: 'الطول',
    width: 'العرض',
    height: 'الارتفاع',
    volume: 'الحجم (CBM)',
    cargoType: 'نوع البضائع',
    cargoPlaceholder: 'مثال: إلكترونيات، نسيج',
    cargoValue: 'قيمة البضائع (IDR)',
    valuePlaceholder: 'مثال: 50000000',
    incoterms: 'شروط التجارة الدولية (Incoterms)',
    selectIncoterms: 'اختر Incoterms...',
    insurance: 'إضافة تأمين على البضائع (+0.5% من قيمة البضائع)',
    express: 'سريع / أولوية (+20% من الإجمالي الفرعي)',
    calculate: 'احسب التقدير',
    reset: 'إعادة تعيين',
    result: 'نتيجة التقدير',
    baseCost: 'التكلفة الأساسية',
    weightCost: 'تكلفة الوزن/الحجم',
    handlingFee: 'رسوم المعالجة',
    customsFee: 'رسوم الجمارك',
    insuranceFee: 'تكلفة التأمين',
    expressFee: 'رسوم الشحن السريع',
    total: 'إجمالي التقدير',
    chargeableWeight: 'الوزن الخاضع للتسعير',
    cbm: 'الحجم',
    ctaQuote: 'طلب عرض سعر رسمي',
    ctaContact: 'تواصل مع الإدارة',
    ctaSend: 'إرسال تفاصيل الشحنة',
    projectNote: 'بالنسبة لشحنات المشاريع (Project Cargo)، يرجى التواصل مع فريقنا للحصول على عرض سعر خاص يناسب احتياجات مشروعك.',
    services: {
      seaFreight: 'الشحن البحري',
      airFreight: 'الشحن الجوي',
      customs: 'التخليص الجمركي',
      domestic: 'محلي',
      warehousing: 'التخزين',
      projectCargo: 'شحنات المشاريع',
    },
    validation: {
      selectService: 'يرجى اختيار نوع الخدمة أولاً',
      enterWeight: 'أدخل وزن البضائع',
      enterDimensions: 'أدخل أبعاد البضائع',
      enterOrigin: 'أدخل بلد المنشأ',
      enterDestination: 'أدخل بلد الوجهة',
    },
  },
  accountSecurity: {
    backToDashboard: 'لوحة التحكم',
    title: 'أمان الحساب',
    description: 'إدارة الأجهزة المحفوظة لتسجيل الدخول بدون OTP',
    trustedDevices: 'الأجهزة الموثوقة',
    loading: 'جار التحميل...',
    noDevices: 'لا توجد أجهزة محفوظة',
    deviceCount: '{count} جهاز محفوظ',
    revokeAll: 'إلغاء الكل',
    revoking: 'جار الإلغاء...',
    noDevicesStored: 'لا توجد أجهزة محفوظة بعد.',
    rememberDeviceHint: 'حدد "تذكر هذا الجهاز" عند تسجيل الدخول عبر واتساب لحفظ الجهاز.',
    deviceLabel: 'الجهاز #{index}',
    thisDevice: 'هذا الجهاز',
    addedAt: 'أُضيف في {date}',
    expiresToday: 'ينتهي اليوم',
    expiresInDays: 'صالح لـ {days} أيام أخرى',
    revoke: 'إلغاء',
    securityInfoTitle: 'معلومات الأمان',
    securityInfoDesc: 'تتيح الأجهزة الموثوقة تسجيل الدخول بدون OTP لمدة 30 يوماً. إذا فقدت الوصول إلى جهاز أو لاحظت نشاطاً مريباً، قم بإلغاء جميع الأجهزة فوراً.',
    errorLoadFailed: 'فشل تحميل قائمة الأجهزة.',
    errorRevokeFailed: 'فشل إلغاء الجهاز.',
    errorRevokeAllFailed: 'فشل إلغاء جميع الأجهزة.',
    errorServerError: 'فشل الاتصال بالخادم.',
    successRevoked: 'تم إلغاء الجهاز بنجاح.',
    successAllRevoked: 'تم إلغاء جميع الأجهزة بنجاح.',
  },
  registerPage: {
    backToLogin: 'Login',
    stepProgress: 'Step {current} of 3',
    title: 'Register via WhatsApp',
    stepPhoneDesc: 'Enter your WhatsApp number',
    stepOtpDesc: 'Verify OTP code',
    stepProfileDesc: 'أكمل ملفك الشخصي',
    checkoutReturnMsg: 'After registering, you will return to checkout.',
    phoneLabel: 'WhatsApp Number',
    phonePlaceholder: '08123456789',
    otpHint: 'OTP code will be sent via WhatsApp to this number.',
    sendOtp: 'Send OTP Code',
    sending: 'Sending...',
    alreadyHaveAccount: 'Already have an account?',
    otpSentTo: 'Code sent to',
    otpLabel: 'OTP Code (6 digits)',
    otpPlaceholder: '······',
    verify: 'Verify',
    verifying: 'Verifying...',
    changeNumber: 'Change number',
    resendOtp: 'Resend',
    resendCooldown: 'Resend ({seconds}s)',
    phoneVerified: 'Verified number:',
    roleLabel: 'I am registering as',
    roleCustomer: 'Customer',
    roleCustomerDesc: 'I need services/products',
    roleVendor: 'Vendor',
    roleVendorDesc: 'I provide services',
    fullNameLabel: 'Full Name *',
    fullNamePlaceholder: 'John Doe',
    companyLabelVendor: 'Company / Fleet Name',
    companyLabelCustomer: 'Company (optional)',
    companyPlaceholderVendor: 'Logistics Partner Ltd',
    companyPlaceholderCustomer: 'Acme Inc.',
    emailLabel: 'Email (optional)',
    servicesLabelVendor: 'Services you provide',
    servicesLabelCustomer: 'Interested services',
    rememberDevice: 'Remember this device for {days} days',
    completeRegistration: 'Complete Registration',
    registering: 'Registering...',
    errorInvalidPhone: 'Enter a valid phone number.',
    errorOtpLength: 'OTP code must be 6 digits.',
    errorNameRequired: 'Name is required.',
    errorServerError: 'Failed to contact server.',
    errorOtpSendFailed: 'Failed to send OTP.',
    errorVerifyFailed: 'Verification failed.',
    errorRegisterFailed: 'Registration failed.',
  },
  marketplace: {
    title: 'Marketplace',
    heroBadge: 'Integrated Catalog',
    heroTitle: 'Find the Best Products & Services',
    heroDescription: 'Compare prices and specifications from trusted vendors for your business needs.',
    vendorBadge: 'سوق الموردين',
    vendorPrefix: 'معرض',
    vendorHighlight: 'الموردين',
    vendorSuffix: 'الموثوقين',
    vendorDesc: 'استكشف السلع من الموردين المعتمدين. قارن المواصفات وتحقق من التوفر وقدم طلبات عروض الأسعار مباشرةً.',
    searchPlaceholder: 'Search products or services...',
    filterAll: 'All Products',
    statusAvailable: 'Available',
    statusLimited: 'Limited',
    statusOutOfStock: 'Out of Stock',
    statusPreOrder: 'Pre-Order',
    noPhoto: 'No photo yet',
    videoBadge: 'Video',
    priceStarts: 'Starts from',
    contactUs: 'Contact Us',
    resetFilter: 'إعادة ضبط جميع الفلاتر',
    serviceCategory: 'فئة الخدمة',
    allServices: 'جميع الخدمات',
    filterHint: 'يصبح الفلتر نشطاً عند توفر المزيد من العناصر',
    requestQuoteBtn: 'طلب عرض سعر / طلب',
    statsUnavailable: 'الإحصائيات غير متاحة',
    comparePrices: 'مقارنة الأسعار',
    priceHighToLow: 'سعر البيع (من الأعلى إلى الأدنى)',
    highest: 'الأعلى',
    medium: 'متوسط',
    lowest: 'الأدنى',
    statsCategories: 'فئات المنتجات',
    statsVendors: 'الموردون النشطون',
    statsItems: 'العناصر المتاحة',
    statsB2BPlatform: 'منصة B2B متخصصة',
    openFilter: 'فتح الفلاتر',
    closeFilter: 'إغلاق الفلاتر',
    close: 'إغلاق',
    priceChartItemCount: '{n} عنصر بسعر',
    priceChartClickHint: 'انقر على الشريط لتفاصيل العنصر',
    priceChartTitle: 'مقارنة أسعار الموردين',
    priceHighest: 'الأعلى',
    priceMid: 'متوسط',
    priceLowest: 'الأدنى',
    topSupplier: 'أفضل مورد',
    expiresNow: 'تنتهي اليوم',
    expiresInDays: 'يتبقى {n} يوم',
    registerAsVendor: 'التسجيل كمورد',
    viewLogistic: 'عرض خدمات اللوجستيات',
    areYouVendor: 'هل أنت مورد؟',
    vendorCtaDesc: 'سجّل شركتك وابدأ البيع للمشترين B2B اليوم.',
    prevPage: '← السابق',
    nextPage: 'التالي →',
    pageOf: 'الصفحة {current} من {total}',
    comingSoon: 'قريباً',
    comingSoonTitle: 'سوق B2B للسلع — قيد التطوير',
    comingSoonDesc: 'نحن نربط الموردين المختارين لتقديم سلع استيراد وتصدير عالية الجودة.',
    comingSoonCategories: 'الفئات القادمة',
    loadingMobile: 'جارٍ التحميل...',
    loadingProducts: 'جارٍ تحميل المنتجات...',
    resetFiltersCount: 'إعادة ضبط ({n})',
    noProductsMatch: 'لا توجد منتجات مطابقة.',
    tryChangeFilters: 'حاول تغيير الفلاتر أو إزالتها لرؤية المزيد من العناصر.',
    comingSoonHeader: 'قريباً',
    comingSoonTitleLine1: 'سوق السلع B2B',
    comingSoonTitleLine2: 'قيد التطوير',
    filterLabelStockStatus: 'حالة المخزون',
    filterLabelOrigin: 'المنشأ',
    filterLabelProvince: 'المقاطعة',
    filterLabelPrice: 'سعر البيع',
    filterBtn: 'تصفية',
    clearAllFilters: 'مسح جميع الفلاتر',
    replaceCategoryPhoto: 'تغيير صورة {label}',
    catSub_coffee: 'أرابيكا & روبوستا',
    catSub_coal: 'حراري & كوك',
    catSub_iron_steel: 'HRC، CRC، بليت',
    catSub_palm_oil: 'CPO & PKO',
    catSub_nickel: 'خام & فيرونيكل',
    catSub_copper: 'كاثود & مركّز',
    catSub_rice: 'متوسط & بريميوم',
    catSub_sugar: 'خام & مكرر',
    catSub_seafood: 'طازج & مجمد',
    catSub_rubber: 'SIR & RSS',
    catSub_live_fish: 'هامور & نقرور',
    catSub_bird_nest: 'درجة A & ممتاز',
    catSub_frozen_food: 'مصنّع & طازج',
    catSub_furniture: 'خشب الساج & الماهوغاني',
    catSub_chemical: 'صناعي & مختبر',
    catSub_textile: 'خيوط & قماش',
    itemFound: 'items found',
    itemFoundOf: '(of {n} total)',
    cat_all: 'All Products',
    cat_coffee: 'Coffee',
    cat_coal: 'Coal',
    cat_iron_steel: 'Iron & Steel',
    cat_palm_oil: 'Palm Oil',
    cat_nickel: 'Nickel',
    cat_copper: 'Copper',
    cat_rice: 'Rice',
    cat_sugar: 'Sugar',
    cat_seafood: 'Seafood',
    cat_cashew_nut: 'Cashew Nut',
    cat_fresh_pineapple: 'Fresh Pineapple',
    cat_canned_pineapple: 'Canned Pineapple',
    cat_fresh_vegetable: 'Fresh Vegetables',
    cat_peanut: 'Peanuts',
    cat_rubber: 'Rubber',
    cat_live_fish: 'Live Fish',
    cat_bird_nest: 'Bird\'s Nest',
    cat_frozen_food: 'Frozen Food',
    cat_furniture: 'Furniture',
    cat_chemical: 'Chemicals',
    cat_textile: 'Textile',
  },
  marketplaceDetail: {
    loading: 'Loading item details…',
    notFound: 'Item not found or not published',
    backToMarketplace: 'Back to Marketplace',
    shareCopyLink: 'Copy Link',
    shareCopied: 'Copied!',
    mediaTitle: 'Photos & Videos',
    mediaExternalVideo: 'Open External Video',
    serviceInfoTitle: 'Service Info',
    productInfoTitle: 'Product Info',
    specsTitle: 'Technical Specifications',
    docsTitle: 'Documents',
    docsNotUploaded: 'not uploaded',
    docsDownload: 'Download',
    calcTitle: 'Price Calculator',
    calcQty: 'Quantity',
    calcIncludePpn: 'Include 11% VAT',
    calcSubtotal: 'Subtotal',
    calcPpnAmount: 'VAT Amount',
    calcTotal: 'Total Price',
    calcRequestQuote: 'Request Official Quote',
    calcUnit: 'Unit',
    calcPpnDesc: 'Value Added Tax',
    calcGrandTotal: 'Grand Total',
    calcPriceConfirmNote: 'Price will be confirmed after quotation request',
    noPhoto: 'No photo yet',
    stockInStock: 'In Stock',
    stockAvailable: 'Available',
    stockLimited: 'Limited Stock',
    stockOut: 'Out of Stock',
    stockOnOrder: 'Available on Inquiry',
    typeProduct: 'Product',
    typeService: 'Service / Business',
    typeServiceShort: 'Service',
    priceOnRequest: 'Price on Request',
    priceNego: 'Price negotiable',
    moqNegotiable: 'Negotiable',
    moqUponRequest: 'Upon Request',
    metaOrigin: 'Origin',
    metaLocation: 'Location',
    metaValidUntil: 'Valid until',
    metaStock: 'Stock',
    ctaRfq: 'Send Quote Request',
    ctaQuote: 'Request Quote',
    ctaNotReady: 'Item not yet available',
    estimasiLabel: 'Estimate',
    inclPpn: 'incl. 11% VAT',
    inclPpnNote: 'Already includes 11% VAT',
    rfqHowTitle: 'How Quote Request Works',
    rfqStep1: 'Fill in quote request form',
    rfqStep2: 'Request reviewed by sales team',
    rfqStep3: 'Team contacts you via WhatsApp or email',
    vendorAbout: 'About Vendor',
    vendorOrdersDone: 'Orders Completed',
    fieldServiceType: 'نوع الخدمة',
    fieldRoute: 'المسار',
    fieldCapacity: 'السعة',
    fieldTransitTime: 'وقت العبور',
    fieldMaxLoad: 'الحمولة القصوى',
    fieldVesselType: 'وسيلة النقل',
    fieldCommodity: 'السلعة',
    fieldGrade: 'الدرجة / الجودة',
    fieldOrigin: 'المنشأ',
    fieldSize: 'الحجم',
    fieldMoisture: 'محتوى الرطوبة',
    fieldCalorie: 'القيمة الحرارية',
    fieldAsh: 'محتوى الرماد',
    fieldPackaging: 'التعبئة',
    fieldCertification: 'الشهادة',
    vendorPublicItems: 'Public Items',
    vendorMemberSince: 'Member since',
    vendorVerifiedNote: 'Verified vendor. Contact via button above for official quote.',
    vendorProducts: 'Products',
    vendorServices: 'Services',
    relatedTitle: 'Other Items from This Vendor',
    relatedSubtitle: 'items from the same vendor',
    similarTitle: 'Customers Also Viewed',
    similarSubtitle: 'Similar items from the same category',
    sameProvinceTitlePrefix: 'Products from',
    sameProvinceSubtitle: 'products from other vendors in the same province',
    rfqDialogTitle: 'Request for Quotation (RFQ)',
    rfqFieldName: 'Full Name',
    rfqFieldNamePlaceholder: 'Your Name / PIC',
    rfqFieldCompany: 'Company Name',
    rfqFieldCompanyPlaceholder: 'Company Name (optional)',
    rfqFieldDest: 'Shipping Destination',
    rfqFieldDestPlaceholder: 'City / Port destination (optional)',
    rfqFieldDate: 'Required Date',
    rfqFieldNotes: 'Notes / Special Requests',
    rfqFieldNotesPlaceholder: 'Additional specs, incoterm, special terms...',
    rfqSuccessTitle: 'Quote Request Sent!',
    rfqSuccessNote: 'Our team will contact you via WhatsApp soon.',
    rfqClose: 'Close',
    rfqNoteFooter: 'Your request will be forwarded to the sales team. We will contact you via email or WhatsApp after the request is reviewed.',
    rfqNoLabel: 'RFQ No.',
    viewDetail: 'View Detail',
    relatedTitleLegacy: 'Related Items',
    docsExtra: 'Additional Document',
    rfqFieldPhone: 'WhatsApp Number',
    metaLeadTime: 'Lead Time',
    vendorRespMin: 'min',
    vendorRespHour: 'hr',
  },
  catalog: {
    heroLabel: 'Our Catalog',
    heroTitle: 'Vendor Products & Services',
    heroDescription: 'Find and compare prices for products & services from our trusted vendors.',
    tabsEtalase: 'Vendor Showcase',
    tabsProductTemplate: 'Product Template',
    tabsServiceTemplate: 'Service Template',
    inquiryModalTitle: 'Request Quote',
    inquirySuccessTitle: 'Request Sent!',
    inquirySuccessDesc: 'Our team will contact you via WhatsApp soon.',
    inquiryErrorRequired: 'Name and WhatsApp are required',
    inquiryNameLabel: 'Full Name *',
    inquiryNamePlaceholder: 'Your Name',
    inquiryWaPlaceholder: '08xx-xxxx-xxxx',
    inquiryNotesLabel: 'Notes',
    inquiryNotesPlaceholder: 'Specific needs, specifications, etc.',
    inquirySubmit: 'Send Request',
    inquiryLoading: 'Sending...',
    compareModeBrowse: 'All Items',
    compareModeCompare: 'Compare Prices',
    compareSavings: 'Save up to',
    compareCheapest: 'CHEAPEST',
    emptyState: 'No items in showcase yet',
  },
  trackingPage: {
    orderReceived: 'Order Received',
    adminReview: 'Admin Review',
    rfqSent: 'RFQ Sent',
    quoteReceived: 'Quote Received',
    customerApproval: 'Customer Approval',
    vendorConfirmed: 'Vendor Confirmed',
    inProgress: 'In Progress',
    pickup: 'Pickup',
    inTransit: 'In Transit',
    arrived: 'Arrived',
    delivered: 'Delivered',
    podUploaded: 'POD Uploaded',
    invoiceIssued: 'Invoice Issued',
    paymentReceived: 'Payment Received',
    completed: 'Completed',
    invalidLink: 'Invalid Link',
    loading: 'Loading tracking...',
    contactUs: 'Contact our team for further information.',
    title: 'Order Tracking',
    service: 'Service',
    route: 'Route',
    commodity: 'Commodity',
    weight: 'Weight',
    vendor: 'Vendor',
    orderDate: 'Order Date',
    etd: 'ETD (Departure)',
    eta: 'ETA (Estimated Arrival)',
    orderDetails: 'Order Details',
    unitPrice: 'Unit Price',
    subtotal: 'Subtotal',
    tax: 'Tax 11%',
    total: 'Total',
    shipmentStatus: 'Shipment Status',
    currentStatus: 'Current status',
    operationalDetails: 'Operational Details',
    driverName: 'Driver',
    driverPhone: 'Driver Phone Number',
    vehiclePlate: 'Vehicle Plate',
    vehicleType: 'Vehicle Type',
    pickupTime: 'Pickup Time',
    carrier: 'Carrier',
    schedule: 'Schedule',
    awbBl: 'AWB / BL',
    driverPosition: 'Driver Position',
    openMaps: 'Open Maps',
    podDocs: 'Proof of Delivery (POD)',
    clickToView: 'Click to view',
    invoice: 'Shipment Invoice',
    orderNumber: 'Order Number',
  },
  booking: {
    logisticTitle: 'Shipment Booking',
    logisticSubtitle: 'Fill in this form to book a shipping service',
    originCity: 'Origin City',
    destinationCity: 'Destination City',
    serviceType: 'Service Type',
    commodity: 'Commodity / Goods Type',
    weight: 'Weight (kg)',
    length: 'L (cm)',
    width: 'W (cm)',
    height: 'H (cm)',
    quantity: 'Quantity',
    calcEstimate: 'Calculate Estimated Price',
    calculating: 'Calculating...',
    rateOptions: 'Select Rate Option',
    noRateNote: 'No active rates for this route. Click "Request Quote" below — our team will send prices via WhatsApp.',
    totalEstimate: 'Total Estimate',
    rateSelected: 'This rate is selected',
    pickupDate: 'Pickup Date',
    deliveryDate: 'Target Delivery',
    notes: 'Additional Notes',
    notesPlaceholder: 'Special instructions or other details...',
    customerData: 'Customer Data',
    fullName: 'Full Name',
    companyName: 'Company Name',
    whatsappNumber: 'WhatsApp Number',
    email: 'Email',
    submitRequest: 'Send Request',
    submitting: 'Sending...',
    whatsappNote: 'Our team will contact you via WhatsApp shortly',
    successTitle: 'Request Sent!',
    successNote: 'Our team will contact you with a final price offer via WhatsApp.',
    trackStatus: 'Track Order Status',
    airFreightTitle: 'Air Freight Booking',
    airFreightSubtitle: 'Fill in cargo details and flight route',
    originAirport: 'Origin Airport',
    destinationAirport: 'Destination Airport',
    airportPlaceholder: 'Search airport...',
    flightSchedule: 'Schedule (Optional)',
    flightPickupDate: 'Cargo Pickup Date',
    flightDate: 'Preferred Flight Date',
    arrivalDate: 'Target Arrival Date',
    additionalServices: 'Additional Services (Optional)',
    airFreightSummary: 'Request Summary',
    koliQty: "Number of Packages",
    containerFinalNote: "Final details subject to carrier confirmation.",
    lclCargo: "LCL Cargo",
    lclCargoSub: "Less than Container Load",
    lclRateNote: "Rate based on CBM used",
    checkEstimate: "Check Estimate",
    estimateResults: "Estimate Results",
    recalculate: "Recalculate",
    noRate: "No rates available for this route",
    noRateHint: "Please submit an inquiry to get a manual quote from our team.",
    requestManual: "Request Manual Quote",
    initialEstimate: "Initial Estimate",
    dayUnit: "days",
    validUntil: "Valid until",
    selectEstimate: "Select This Estimate",
    estimateNoticeShort: "This is an initial estimate. Final price confirmed after admin/vendor gets confirmation from shipping line/partner.",
    estimateNoticeFull: "This is an initial estimate. Final price confirmed after admin/vendor gets confirmation from shipping line, NVOCC, co-loader, or partner.",
    breakdownTitle: "Estimate Breakdown",
    totalBreakdown: "Total Estimate",
    custNameRequired: "Customer name is required",
    hsCodeOptional: "HS Code (optional)",
    requestFinalQuote: 'Request Final Quote',
    autoNote: 'Automatically filled from ordered products',
    autoDesc: 'Weight & dimensions calculated from cart items. Complete other details then click Calculate Estimate.',
    grossWeight: 'GW (kg)',
    koli: 'Piece',
  },
  contactPage: {
    heroTitle: 'Contact Us',
    heroSubtitle: 'Our team is ready to help with your logistics needs. Feel free to contact us anytime.',
    infoTitle: 'Contact Information',
    infoEmail: 'Email',
    infoWhatsapp: 'WhatsApp',
    infoPhone: 'Phone',
    hoursTitle: 'Business Hours',
    hoursWeekday: 'Monday – Friday, 08:00 – 17:00 WIB',
    hoursSaturday: 'Saturday, 08:00 – 13:00 WIB',
    locationTitle: 'Office Location',
    locationViewMaps: 'View on Google Maps',
    ctaTitle: 'Need a Price Quote?',
    ctaSubtitle: 'Get an instant shipping cost estimate.',
    ctaButton: 'Check Cost Calculator',
  },
  onboarding: {
    headerTitle: 'أكمل ملفك الشخصي',
    headerSubtitle: 'Fill in the following data to activate your account',
    stepsBasic: 'Basic Info',
    stepsAccountType: 'Account Type',
    stepsDetail: 'Detail',
    stepsReview: 'Confirmation',
    basicTitle: 'Basic Information',
    basicNameLabel: 'Full Name',
    basicNamePlaceholder: 'As per ID Card',
    basicPhoneLabel: 'Phone / WhatsApp Number',
    basicAddressLabel: 'Full Address',
    basicAddressPlaceholder: 'Street Name No. 123, Sub-district, District, City/Regency',
    basicKtpLabel: 'Upload ID Card (Optional, for automatic OCR)',
    basicKtpUploadClick: 'Click to upload ID Card photo',
    basicKtpUploadHint: 'JPG, PNG, max. 10MB',
    basicKtpOcrLoading: 'Reading ID Card data...',
    basicKtpOcrSuccess: 'ID Card data read successfully — please check and edit if necessary',
    accountTypeTitle: 'Select Account Type',
    accountTypeApprovalBadge: 'Requires admin approval',
    vendorTitle: 'Vendor Details',
    vendorCompanyNameLabel: 'Company Name',
    vendorServiceTypeLabel: 'Vendor Service Type',
    reviewTitle: 'Confirm Data',
    reviewSubmit: 'Save & Activate Account',
    reviewSubmitting: 'Saving...',
    reviewBack: 'Back',
    successTitle: 'Account Active!',
    successDesc: 'تم حفظ ملفك الشخصي. أهلاً وسهلاً!',
    errorRequired: 'Please complete all required fields.',
    errorServerError: 'Failed to save. Please try again.',
  },
  vendorForm: {
    rfqTitle: 'Request for Quotation',
    rfqRecipient: 'To Dear',
    rfqDeadlineLabel: 'Response Time Remaining',
    rfqDeadlineExpired: 'Time Limit Has Expired',
    rfqDetailProduct: 'Product Details',
    rfqDetailService: 'Service Details',
    rfqDetailCargo: 'Cargo Details',
    rfqBasicPrice: 'BASIC PRICE',
    rfqPpnInfo: 'excluding VAT',
    rfqReferenceInfo: 'Reference price from vendor showcase. Excluding margin & VAT.',
    actionsTitle: 'Select Action',
    actionsAcceptLabel: 'Accept Basic Price',
    actionsCounterLabel: 'Submit New Price',
    actionsRejectLabel: 'Cannot Serve',
    formEtaLabel: 'Estimated Time (optional)',
    formNotesLabel: 'Notes (optional)',
    formSubmitButton: 'Send Confirmation',
    formBack: 'Back',
    successTitle: 'Quote Sent!',
    successSubtitle: 'Thank you for your quote. Our team will review it shortly.',
  },
  vendorProfile: {
    statusNotFoundTitle: 'Vendor not found',
    statusNotFoundDesc: 'This vendor profile is unavailable or no longer active.',
    statusRetry: 'Try Again',
    headerVerified: 'Verified Supplier',
    headerPremium: 'Premium Supplier',
    headerFeatured: 'Featured',
    tabsAll: 'All',
    tabsProducts: 'Products',
    tabsServices: 'Services',
    infoAbout: 'ABOUT COMPANY',
    infoLocation: 'LOCATION & CONTACT',
    infoPerformance: 'PERFORMANCE & STATISTICS',
    infoLegality: 'LEGALITY DOCUMENTS',
    infoQa: 'QUALITY & CERTIFICATION',
    itemNegotiable: 'Negotiable price',
    itemViewProduct: 'View Product',
    itemViewService: 'View Details & Estimate',
    contactSupplier: 'Contact Supplier',
    contactLoginRequired: 'Login required',
  },
  importTariff: {
    breadcrumbHome: 'Home',
    pageTitle: 'Import Tariff Calculator',
    pageDesc: 'Calculate Import Duty (BM), Import VAT, and PPh Article 22 based on BTKI 2022. Multi-currency, live JISDOR BI rates, FTA tariffs, auto-calculation.',
    rateLoading: 'Fetching latest rates…',
    rateLive: 'Live Rate',
    rateEstimate: 'Estimated Rate',
    rateUpdated: 'Updated',
    tabSingle: 'Single Calculation',
    tabMulti: 'Multi-HS Comparison',
    tabMultiBadge: 'New',
    step1Title: 'Search HS Code',
    step2Title: 'Goods Value & Currency',
    step3Title: 'Incoterm',
    step4Title: 'Importer Type & FTA',
    hcSearchPlaceholder: 'Type HS Code or product name…',
    hcNotFound: 'Not found. Try another keyword.',
    currencyLabel: 'Currency',
    goodsValueLabel: 'Goods Value (in {currency})',
    convertLabel: 'Convert to IDR',
    rateUsed: 'Rate used',
    readyTitle: 'Ready to Calculate',
    readyDesc: 'Select HS Code and enter goods value — calculation runs automatically',
    calcLabel_bm: 'Import Duty (BM)',
    calcLabel_ppn: 'Import VAT',
    calcLabel_pph: 'PPh Article 22',
    calculating: 'Calculating automatically…',
    autoCalcActive: 'Auto-calculation active — updates automatically when input changes',
    fillForm: 'Complete the form to start calculating',
    calcLoading: 'Calculating import taxes…',
    totalEstimate: 'Total Estimate',
    indicative: '*indicative',
    multiAddHs: '+ Add HS Code',
    multiAddBtn: 'Add',
    multiPlaceholder: 'HS Code or product name...',
    multiCalculateAll: 'Calculate All',
    multiDownloadCsv: 'Download CSV',
    multiEmpty: 'Add at least 1 HS Code for comparison',
    multiCalculating: 'Calculating...',
    multiResultEmpty: 'Add HS Code above to start comparing',
    pageSeoTitle: 'حاسبة رسوم الاستيراد — BM, PPN & PPh المادة 22 | B2B لوجستيك',
    freightLabel: 'تكلفة الشحن (IDR)',
    freightPlaceholder: 'مثال 5,000,000',
    insuranceLabel: 'التأمين (%)',
    importerTypeLabel: 'نوع المستورد (ضريبة المادة 22)',
    ftaRateLabel: 'السعر التفضيلي (FTA) — اختياري',
    calcSpinner: 'جارٍ الحساب…',
    lartasNotes: 'ملاحظات:',
    lartasRegulator: 'الجهة التنظيمية:',
    lartasPermits: 'التصاريح المطلوبة:',
    hsSectionTitle: 'HS Code — BTKI 2022',
    exportCsv: 'تصدير CSV',
    exportJson: 'تصدير JSON',
    inputGoodsValueLabel: 'قيمة البضائع',
    inputRateUsedLabel: 'سعر الصرف المستخدم',
    inputDutyScheme: 'نظام الرسوم الجمركية',
    inputNdpbm: 'NDPBM (قيمة CIF بـ IDR)',
    ndpbmLabel: 'قيمة البضائع (NDPBM/CIF)',
    taxDetailTitle: 'تفصيل الضرائب والرسوم الجمركية',
    tableColComponent: 'المكوّن',
    tableColRate: 'المعدل',
    tableColAmount: 'المبلغ (IDR)',
    ftaRateResult: 'معدل تفضيلي FTA',
    importHelpTitle: 'هل تحتاج مساعدة في إجراءات الاستيراد؟',
    cooCertNote: '✓ يتطلب شهادة المنشأ (COO/نموذج) من المصدر',
    multiSharedSettings: 'الإعدادات المشتركة',
    lartasWarningText: 'يلزم الحصول على تصريح استيراد خاص. تواصل مع فريق PPJK للمساعدة.',
    prefHideBtn: 'إخفاء',
    prefShowAllBtn: 'عرض الكل',
    ftaCooNote: 'مع شهادة منشأ (COO) صالحة، قد تكون معدلات رسوم الاستيراد أقل:',
    prefMoreItems: '+{n} المزيد',
    importHelpDesc: 'فريق PPJK لدينا جاهز للمساعدة في التخليص الجمركي، ومعالجة المستندات، وحساب تكاليف الاستيراد بدقة.',
    importHelpCtaPabean: 'استشارة جمركية',
    importerTypeLabelShort: 'نوع المستورد',
    ftaSchemeLabelShort: 'مخطط FTA',
    multiFreightLabel: 'الشحن المشترك (IDR)',
    multiHsListTitle: 'قائمة رموز HS',
    multiAddHsText: 'إضافة رمز HS',
    multiTableTitle: 'جدول مقارنة ضرائب الاستيراد',
    multiColHs: 'رمز HS / التسمية',
    multiColValue: 'القيمة ({currency})',
    multiColTotal: 'المجموع',
  },
  pabean: {
    headerTitle: 'إدارة الجمارك / PPJK',
    headerSubtitle: 'خدمات الجمارك',
    step1Title: 'Select PPJK Consulting Services',
    step1Subtitle: 'Select one or more services you need',
    step2Title: 'Selected Service Details',
    step3Title: 'Requester Information',
    step4Title: 'Summary & Submit',
    selectedLabel: 'Selected:',
    serviceLabel: 'Service',
    estimatedCost: 'Estimated Cost',
    confirmedAfterDoc: 'Confirmed after document review',
    costNote: 'Cost estimates are indicative. Final costs will be confirmed by our PPJK team after document verification. Our team will contact you within 1 business day.',
    submitting: 'جارٍ الإرسال...',
    submitBtn: 'إرسال طلب PPJK',
    successMsg: 'تم إرسال طلب PPJK بنجاح! سيتواصل فريقنا معك قريباً.',
    errorMsg: 'Failed to submit request',
    profileAutoFilled: 'Data retrieved from your account profile. Only phone number can be changed.',
    loginToUpload: 'Please log in to upload documents',
    uploadOptional: 'Upload Related Documents (Optional)',
    consultDetail: 'Topic for consultation *',
    consultConfirm: 'Consultation fees will be confirmed by our PPJK team. They will contact you shortly after submission.',
    perijinanConsultDetail: 'Type of permit / consultation topic *',
    picName: 'PIC Name',
    companyNameLabel: 'Company Name',
    additionalNotes: 'Additional Notes',
    additionalNotesPlaceholder: 'Additional information for our team (optional)',
    fullNamePlaceholder: 'Full name',
    emailPlaceholder: 'email@company.com',
    phonePlaceholder: '+62 8xx xxxx xxxx',
    companyPlaceholder: 'Company Name',
    svc1Title: 'استشارة لوائح الاستيراد',
    svc1Desc: 'In-depth consultation on customs regulations and requirements for import activities',
    svc2Title: 'استشارة لوائح التصدير',
    svc2Desc: 'In-depth consultation on customs regulations and requirements for export activities',
    svc3Title: 'استشارة تراخيص الاستيراد/التصدير',
    svc3Desc: 'Consultation on licensing processes, NIB, API, and legal documents for import/export activities',
    svc4Title: 'استشارة ضرائب الاستيراد',
    svc4Desc: 'Consultation on import VAT, income tax Article 22, import duties, and tax obligations related to importation',
    svc1ConsultPlaceholder: 'Briefly describe the import regulation issue or question you want to consult about...',
    svc2ConsultPlaceholder: 'Briefly describe the export regulation issue or question you want to consult about...',
    svc3ConsultPlaceholder: 'E.g., API-U licensing process, NIB for import, or export permit requirements for specific products...',
    svc4ConsultPlaceholder: 'E.g., import VAT calculation, income tax Article 22 rates, HS Code and import duties, or KITE/KAHA fiscal facilities...',
    dropHint: 'انقر أو أسقط الملف هنا',
    dropHere: 'Drop to upload',
    uploadSuccess: 'تم التحميل بنجاح ✓',
    uploadFailed: 'فشل التحميل',
    serverResponseInvalid: 'Invalid server response',
    connectionFailed: 'Connection failed during upload',
    missingService: 'Service type',
    uploadingProgress: 'Uploading...',
    fileFormatError: 'Unsupported format (.{ext}). Use PDF, JPG, PNG, DOC, or DOCX.',
    fileSizeError: 'File too large ({size} MB). Max 10 MB.',
    pageTitle: 'إدارة الجمارك / PPJK',
    sectionTitle: 'خدمات الجمارك',
    consultTitle: 'اختر نوع استشارة PPJK',
    uploadDocTitle: 'رفع مستندات الدعم (اختياري)',
    submittingBtn: 'جارٍ الإرسال...',
    costTbd: 'سيتم التأكيد خلال 1×24 ساعة عمل',
    toastSuccess: 'تم تقديم الطلب! سيتواصل فريقنا معك في أقرب وقت ممكن.',
    toastError: 'فشل تقديم الطلب',
    dataFromProfile: 'البيانات مأخوذة من ملف حسابك.',
    notesPlaceholder: 'معلومات إضافية (اختياري)',
    namePic: 'اسم جهة الاتصال',
    companyName: 'اسم الشركة',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف / واتساب',
    serviceSummary: 'الخدمات المختارة',
    emailLabel: 'البريد الإلكتروني',
    phoneLabel: 'الهاتف / واتساب',
    uploadLogoTitle: 'رفع الشعار',
    removeLogoTitle: 'حذف الشعار',
    hoverUploadHint: 'مرر فوق الأيقونة → رفع الشعار',
  },
  customClearance: {
    headerTitle: 'عملية التخليص الجمركي',
    headerSubtitle: 'Official Customs Clearance — Certified PPJK',
    infoBannerTitle: 'Complete Customs Services by Official PPJK',
    infoBannerDesc: 'We handle the entire customs process: PIB/PEB document preparation, physical handling at the port, and undername services for companies without import/export licenses.',
    step1Title: 'Select Service Type',
    step1Subtitle: 'Select one or more services you need',
    step2Title: 'Selected Service Details',
    step3Title: 'Requester / PIC Information',
    step4Title: 'Summary & Submit Request',
    selectedLabel: 'Selected:',
    activityType: 'Activity Type',
    importActivity: 'Import (PIB)',
    exportActivity: 'Export (PEB)',
    clearanceImport: 'Import Clearance',
    clearanceExport: 'Export Clearance',
    underNameImport: 'Undername Import',
    underNameExport: 'Undername Export',
    goodsType: 'Goods Type / Name',
    hsCode: 'HS Code (if known)',
    cifValue: 'CIF Value',
    fobValue: 'FOB Value',
    exchangeRate: '{currency} → IDR Rate',
    importDutyRate: 'Import Duty Rate (%)',
    goodsWeight: 'Goods Weight (kg)',
    destinationPort: 'Destination Port',
    loadingPort: 'Loading Port',
    originCountry: 'Country of Origin',
    destinationCountry: 'Destination Country',
    pibPebDocNum: 'PIB / PEB Number (if available)',
    customsLane: 'Customs Lane',
    portAirport: 'Port / Airport',
    specialInstructions: 'Notes / Special Instructions',
    underNameType: 'Undername Type',
    underNameReason: 'Reason for Using Undername',
    estimatedCost: 'Estimated Cost',
    estimatedLabel: 'Total Estimate',
    indicativeNote: '*indicative',
    confirmedWithinHours: 'Confirmed within 1 business day',
    costNote: 'Service fees are indicative and will be confirmed by our PPJK team after document and goods type verification. Our team will contact you within 1 business day.',
    submitting: 'Submitting Request...',
    submitBtn: 'Submit Custom Clearance Request',
    successMsg: 'Custom Clearance request submitted successfully! Our team will contact you shortly.',
    errorMsg: 'Failed to submit request',
    profileAutoFilled: 'Data retrieved from your account profile.',
    loginToUpload: 'Please log in to upload documents',
    uploadDocs: 'Upload Supporting Documents',
    uploadDocsCompany: 'Your Company Documents',
    calculating: 'Calculating estimate...',
    enterValueToCalc: 'Enter {type} value above to see import duty estimate.',
    enterValueToCalcUndername: 'Enter {type} value to see automatic cost estimate',
    beaMasuk: 'Import Duty',
    ppnImpor: 'Import VAT',
    pphPasal22Api: 'Income Tax Art. 22 (with API)',
    pphPasal22NonApi: 'Income Tax Art. 22 (without API)',
    subTotalPajak: 'Tax & Duty Sub-Total',
    serviceDocFee: 'PIB/PEB Document Service Fee',
    serviceUndernameFee: 'Undername {direction} Service Fee',
    freeRate: '0% — Duty Free (ASEAN / FTA)',
    laneUnknown: 'Unknown',
    laneGreen: 'Green Lane — no physical inspection',
    laneRed: 'Red Lane — with physical inspection',
    handlingServiceDesc: 'This service includes: coordination with customs authorities, import duty and tax payment, physical inspection coordination (red lane), and goods release to your warehouse.',
    pibPebProcessNote: 'Our PPJK team will process PIB/PEB document preparation after all data and documents are received. Service fees will be confirmed within 1 business day.',
    underNameServiceNote: 'Undername service fees include: API/NIK usage, document processing, and customs handling. Will be confirmed by our team based on goods type and transaction value.',
    underNameInfoDesc: 'We provide import/export facilities using our company\'s official API / NIK. Ideal for companies without their own importer/exporter license.',
    picName: 'PIC Name',
    companyNameLabel: 'Company Name',
    additionalNotes: 'Additional Notes',
    additionalNotesPlaceholder: 'Additional information for our team (optional)',
    fullNamePlaceholder: 'Full name',
    emailPlaceholder: 'email@company.com',
    phonePlaceholder: '+62 8xx xxxx xxxx',
    companyPlaceholder: 'Company Name',
    svc1Title: 'إعداد وثائق PIB/PEB',
    svc1Desc: 'Complete processing and preparation of Customs Import Declaration (PIB) or Customs Export Declaration (PEB) documents',
    svc1Badge: '1–2 business days',
    svc2Title: 'معالجة التخليص',
    svc2Desc: 'Physical handling of customs process at the port: inspection coordination, import duty & tax payment, through to goods release from customs area',
    svc2Badge: '1–3 business days',
    svc3Title: 'استيراد/تصدير Undername',
    svc3Desc: 'Import or export services using our company name & license (API/NIK) — solution for companies without their own import/export license',
    svc3Badge: 'As needed',
    dropHint: 'Click or drop file here',
    dropHere: 'Drop to upload',
    uploadSuccess: 'Upload successful ✓',
    uploadFailed: 'Upload failed',
    serverResponseInvalid: 'Invalid server response',
    connectionFailed: 'Connection failed during upload',
    missingService: 'Service type',
    serviceSelected: 'Selected services',
    goodsInfo: 'PIB/PEB — Goods',
    fileFormatError: 'Unsupported format (.{ext}). Use PDF, JPG, PNG, DOC, or DOCX.',
    fileSizeError: 'File too large ({size} MB). Max 10 MB.',
    pageTitle: 'إجراءات التخليص الجمركي',
    pageSubtitle: 'الإدارة الجمركية الرسمية — اعتماد PPJK',
    submittingBtn: 'جارٍ الإرسال...',
    costTbd: 'سيتم التأكيد خلال 1×24 ساعة عمل',
    toastSuccess: 'تم تقديم طلب التخليص الجمركي! سيتواصل فريقنا معك في أقرب وقت ممكن.',
    toastError: 'فشل في تقديم الطلب',
    dataFromProfile: 'البيانات مأخوذة من ملف حسابك.',
    notesPlaceholder: 'معلومات إضافية (اختياري)',
    namePic: 'اسم جهة الاتصال',
    companyName: 'اسم الشركة',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف / واتساب',
    emailLabel: 'البريد الإلكتروني',
    phoneLabel: 'الهاتف / واتساب',
    labelExchangeRate: 'سعر الصرف {currency} → IDR',
    labelValue: 'القيمة',
    valueCifLabel: 'قيمة {type} (بالقيمة المعادلة IDR)',
    handlingLaneLabel: 'التخليص الجمركي — الممر',
    undernamCountryLabel: 'الوكالة للاستيراد — الدولة',
    phGoods1: 'على سبيل المثال: آلات الإنتاج، الملابس، المنتجات الإلكترونية...',
    phHsCode: 'مثال: 8477.80.00',
    phValueNumber: 'مثال: 15000',
    phExchangeRate: 'مثال: 15900',
    phWeight: 'مثال: 500',
    phCountry1: 'على سبيل المثال: الصين، الولايات المتحدة، اليابان...',
    phSpecialNotesPib: 'على سبيل المثال: يحتاج إلى ترخيص استيراد خاص، معدل ضريبي مميز، سلع حساسة، إلخ',
    phGoods2: 'على سبيل المثال: قطع غيار، منسوجات، مواد كيميائية...',
    phPibPebDocNum: 'رقم ملف PIB/PEB',
    phSpecialNotesHc: 'على سبيل المثال: السلع لها قيود خاصة، تحتاج إلى تنسيق مع المستودع...',
    phGoods3: 'على سبيل المثال: آلات، مواد خام، سلع استهلاكية...',
    phValueNumber2: 'مثال: 20000',
    phWeight2: 'مثال: 1000',
    phCountry2: 'على سبيل المثال: الصين، ألمانيا، الولايات المتحدة...',
    phSpecialNotesUn: 'على سبيل المثال: الشركة لم تحصل بعد على ترخيص API، تسجيل NIB جارٍ...',
  },
  importCalculator: {
    title: 'حاسبة رسوم الاستيراد',
    subtitle: 'Calculate Import Duty (BM), Import VAT, and Income Tax Art. 22 based on BTKI 2022. Multi-currency, live JISDOR BI rates, FTA rates, auto-calculation.',
    breadcrumbHome: 'الرئيسية',
    tabSingle: 'Single Calculation',
    tabMulti: 'Multi-HS Comparison',
    badgeNew: 'New',
    searchHsCode: 'Search HS Code',
    hsPlaceholder: 'Type HS Code or product name…',
    hsNotFound: 'Not found. Try a different keyword.',
    goodsValueSection: 'Goods Value & Currency',
    currencyLabel: 'Currency',
    goodsValueLabel: 'Goods Value (in {currency})',
    convertToIdr: 'Convert to IDR',
    rateUsed: 'Rate used',
    incotermSection: 'Incoterm',
    incotermOptional: '(optional, default CIF)',
    freightLabel: 'Freight Cost (IDR)',
    insuranceLabel: 'Insurance (%)',
    taxOptionsSection: 'Tax & Preferential Options',
    apiImporterLabel: 'Registered Importer (API)',
    apiImporterHint: 'Check if your company has an API. Affects income tax Article 22 rate.',
    preferentialLabel: 'FTA Preferential Scheme',
    preferentialDesc: 'Import duty rate under free trade agreement',
    availablePreferential: 'Available Preferential Rates',
    noPreferential: 'No preferential rates for this FTA',
    resultTitle: 'نتائج الحساب',
    resultNdpbm: 'NDPBM (CIF IDR)',
    resultBM: 'Import Duty',
    resultPPN: 'Import VAT',
    resultPPnBM: 'Luxury Goods Tax',
    resultPPh: 'Income Tax Art. 22',
    resultTotal: 'Total Levies',
    resultDDP: 'Total DDP (Est.)',
    resultEffective: 'Effective Rate',
    lartasTitle: 'LARTAS — Restricted/Prohibited Goods',
    lartasWarning: 'This item is subject to import restrictions.',
    noLartas: '✓ LARTAS Free',
    btkiLink: 'BTKI Details',
    inswLink: 'Check INSW',
    exportCSV: 'Export CSV',
    exportJSON: 'Export JSON',
    loadingRates: 'Fetching latest rates…',
    rateJisdor: 'JISDOR BI — Live',
    rateLive: 'Live Rate',
    rateEstimate: 'Estimated Rate',
    updatedAt: 'Updated',
    emptyResult: 'Select an HS Code and enter goods value to see automatic calculation',
    multiAddItem: 'Add HS Code',
    multiCalculate: 'Calculate All',
    multiCalculating: 'Calculating...',
    multiRemove: 'Remove',
    multiLabel: 'Label',
    multiGoodsValue: 'Goods Value',
    multiError: 'Error',
    multiResultTitle: 'Comparison Results',
    multiExportCSV: 'Export Multi CSV',
    incotermFreightNote: 'Separate freight input required',
    incotermInsuranceNote: 'Separate insurance input required',
    incotermFullNote: 'Full freight input required',
    incotermCifNote: 'Value already includes freight & insurance',
    contactCta: 'Consultation & Order',
    hcArahImpor: 'استيراد',
    hcArahEkspor: 'تصدير',
    jasaHandlingLabel: 'خدمة المناولة الجمركية',
    hcLaneLabel: 'مسار',
    hcFeeNote: '* لا يشمل الرسوم الجمركية والضرائب. السعر النهائي يتم تأكيده من فريقنا.',
    docPibPeb: 'مستند PIB / PEB',
    docAwbBl: 'AWB / بوليصة الشحن',
    docCommercialInvoice: 'الفاتورة التجارية',
    docPackingList: 'قائمة التعبئة',
    docCoo: 'COO / شهادة المنشأ',
    docLsLartas: 'LS / تصريح الاستيراد',
    docInvoicePackingList: 'الفاتورة وقائمة التعبئة',
    docLsJikaAda: 'LS / تصريح الاستيراد (إن وُجد)',
    docNpwp: 'رقم ضريبة الشركة (NPWP)',
    docNib: 'NIB / وثيقة الشركة',
    docLainnya: 'مستندات أخرى',
    contactCtaDesc: 'Need help with customs clearance, PIB/PEB, or import undername?',
  },
  mktCard: {
    statusOnOrder: 'متاح عند الطلب',
    expiresExpired: 'Expires today',
    expiresInDays: '{days}d left',
    priceOnRequest: 'السعر عند الطلب',
    requestQuotation: 'Request Quotation',
    shareProduct: 'Share product',
    removeFromCompare: 'Remove from comparison',
    maxCompareItems: 'Max 4 items',
    compare: 'Compare',
    sellPrice: 'سعر البيع',
    description: 'الوصف',
    specifications: 'المواصفات',
    originLabel: 'Origin',
    locationLabel: 'Location',
    leadTimeLabel: 'Lead Time',
    moqNego: 'MOQ: Negotiable',
    moqOnRequest: 'Upon Request',
    topSupplier: 'Top Supplier',
    filterAllOption: 'الكل',
    noPhotoYet: 'لا توجد صورة بعد',
    moqLabel: 'الحد الأدنى للطلب:',
    priceOnRequestDialog: 'السعر عند الطلب',
    customClearance: {
      headerTitle: 'إجراءات التخليص الجمركي',
      headerSubtitle: 'التخليص الجمركي الرسمي — PPJK معتمد',
      infoBannerTitle: 'خدمات التخليص الجمركي الكاملة بواسطة PPJK الرسمي',
      infoBannerDesc: 'نحن نتولى العملية الجمركية بالكامل: إعداد مستندات PIB/PEB، التعامل الفعلي في الميناء، وخدمات تحت الاسم للشركات التي لا تملك تراخيص استيراد/تصدير.',
      step1Title: 'اختر نوع الخدمة',
      step1Subtitle: 'اختر خدمة واحدة أو أكثر تحتاجها',
      step2Title: 'تفاصيل الخدمة المختارة',
      step3Title: 'معلومات الطالب / الشخص المسؤول',
      step4Title: 'ملخص & تقديم الطلب',
      selectedLabel: 'المختار:',
      activityType: 'نوع النشاط',
      importActivity: 'استيراد (PIB)',
      exportActivity: 'تصدير (PEB)',
      clearanceImport: 'تخليص الاستيراد',
      clearanceExport: 'تخليص التصدير',
      underNameImport: 'استيراد تحت الاسم',
      underNameExport: 'تصدير تحت الاسم',
      goodsType: 'نوع / اسم البضائع',
      hsCode: 'رمز HS (إذا كان معروفًا)',
      cifValue: 'قيمة CIF',
      fobValue: 'قيمة FOB',
      exchangeRate: '{currency} → سعر IDR',
      importDutyRate: 'معدل ضريبة الاستيراد (%)',
      goodsWeight: 'وزن البضائع (كجم)',
      destinationPort: 'ميناء الوجهة',
      loadingPort: 'ميناء التحميل',
      originCountry: 'بلد المنشأ',
      destinationCountry: 'بلد الوجهة',
      pibPebDocNum: 'رقم PIB / PEB (إذا كان متاحًا)',
      customsLane: 'ممر الجمارك',
      portAirport: 'ميناء / مطار',
      specialInstructions: 'ملاحظات / تعليمات خاصة',
      underNameType: 'نوع تحت الاسم',
      underNameReason: 'سبب استخدام تحت الاسم',
      estimatedCost: 'التكلفة المقدرة',
      estimatedLabel: 'التقدير الإجمالي',
      indicativeNote: '*إرشادي',
      confirmedWithinHours: 'تم التأكيد خلال يوم عمل واحد',
      costNote: 'رسوم الخدمة إرشادية وسيتم تأكيدها من قبل فريق PPJK لدينا بعد التحقق من المستندات ونوع البضائع. سيتواصل فريقنا معك خلال يوم عمل واحد.',
      submitting: 'جاري تقديم الطلب...',
      submitBtn: 'تقديم طلب التخليص الجمركي',
      successMsg: 'تم تقديم طلب التخليص الجمركي بنجاح! سيتواصل فريقنا معك في أقرب وقت ممكن.',
      errorMsg: 'فشل في تقديم الطلب',
      profileAutoFilled: 'تم استرداد البيانات من ملف تعريف حسابك.',
      loginToUpload: 'يرجى تسجيل الدخول لتحميل المستندات',
      uploadDocs: 'تحميل المستندات الداعمة',
      uploadDocsCompany: 'مستندات شركتك',
      calculating: 'جاري حساب التقدير...',
      enterValueToCalc: 'أدخل قيمة {type} أعلاه لرؤية تقدير ضريبة الاستيراد.',
      enterValueToCalcUndername: 'أدخل قيمة {type} لرؤية تقدير التكلفة التلقائي',
      beaMasuk: 'ضريبة الاستيراد',
      ppnImpor: 'ضريبة القيمة المضافة على الاستيراد',
      pphPasal22Api: 'ضريبة الدخل المادة 22 (مع API)',
      pphPasal22NonApi: 'ضريبة الدخل المادة 22 (بدون API)',
      subTotalPajak: 'إجمالي الضرائب والرسوم',
      serviceDocFee: 'رسوم خدمة مستندات PIB/PEB',
      serviceUndernameFee: 'رسوم خدمة تحت الاسم {direction}',
      freeRate: '0% — معفاة من الرسوم (ASEAN / FTA)',
      laneUnknown: 'غير معروف',
      laneGreen: 'الممر الأخضر — بدون تفتيش فعلي',
      laneRed: 'الممر الأحمر — مع تفتيش فعلي',
      handlingServiceDesc: 'تشمل هذه الخدمة: التنسيق مع السلطات الجمركية، دفع ضريبة الاستيراد والضرائب، تنسيق التفتيش الفعلي (الممر الأحمر)، وإطلاق البضائع إلى مستودعك.',
      pibPebProcessNote: 'سيقوم فريق PPJK لدينا بمعالجة إعداد مستندات PIB/PEB بعد استلام جميع البيانات والمستندات. سيتم تأكيد رسوم الخدمة خلال يوم عمل واحد.',
      underNameServiceNote: 'تشمل رسوم خدمة تحت الاسم: استخدام API/NIK، معالجة المستندات، والتعامل الجمركي. سيتم تأكيدها من قبل فريقنا بناءً على نوع البضائع وقيمة المعاملة.',
      underNameInfoDesc: 'نحن نقدم تسهيلات الاستيراد/التصدير باستخدام API / NIK الرسمي لشركتنا. مثالي للشركات التي لا تملك ترخيص مستورد/مصدر خاص بها.',
      picName: 'اسم الشخص المسؤول',
      companyNameLabel: 'اسم الشركة',
      additionalNotes: 'ملاحظات إضافية',
      additionalNotesPlaceholder: 'معلومات إضافية لفريقنا (اختياري)',
      fullNamePlaceholder: 'الاسم الكامل',
      emailPlaceholder: 'email@company.com',
      phonePlaceholder: '+62 8xx xxxx xxxx',
      companyPlaceholder: 'اسم الشركة',
      svc1Title: 'إعداد مستندات PIB / PEB',
      svc1Desc: 'معالجة كاملة وإعداد مستندات إعلان الاستيراد الجمركي (PIB) أو إعلان التصدير الجمركي (PEB)',
      svc1Badge: '1–2 يوم عمل',
      svc2Title: 'معالجة التخليص الجمركي',
      svc2Desc: 'التعامل الفعلي مع العملية الجمركية في الميناء: تنسيق التفتيش، دفع ضريبة الاستيراد والضرائب، وصولًا إلى إطلاق البضائع من منطقة الجمارك',
      svc2Badge: '1–3 يوم عمل',
      svc3Title: 'خدمات استيراد / تصدير تحت الاسم',
      svc3Desc: 'خدمات الاستيراد أو التصدير باستخدام اسم شركتنا وترخيصها (API/NIK) — حل للشركات التي لا تملك ترخيص استيراد/تصدير خاص بها',
      svc3Badge: 'حسب الحاجة',
      dropHint: 'انقر أو اسحب الملفات إلى هنا',
      dropHere: 'أطلق لتحميل',
      uploadSuccess: 'تم التحميل بنجاح ✓',
      uploadFailed: 'فشل التحميل',
      serverResponseInvalid: 'استجابة خادم غير صالحة',
      connectionFailed: 'فشل الاتصال أثناء التحميل',
      missingService: 'نوع الخدمة',
      serviceSelected: 'الخدمات المختارة',
      goodsInfo: 'PIB/PEB — البضائع',
      fileFormatError: 'تنسيق غير مدعوم (.{ext}). استخدم PDF، JPG، PNG، DOC، أو DOCX.',
      fileSizeError: 'الملف كبير جدًا ({size} ميجابايت). الحد الأقصى 10 ميجابايت.',
    },
    importCalculator: {
      title: 'آلة حساب الرسوم الجمركية',
      subtitle: 'احسب الرسوم الجمركية (BM)، ضريبة القيمة المضافة على الواردات، وضريبة الدخل المادة 22 بناءً على BTKI 2022. متعدد العملات، أسعار JISDOR BI الحية، أسعار FTA، حساب تلقائي.',
      breadcrumbHome: 'الصفحة الرئيسية',
      tabSingle: 'حساب فردي',
      tabMulti: 'مقارنة متعددة رموز HS',
      badgeNew: 'جديد',
      searchHsCode: 'ابحث عن رمز HS',
      hsPlaceholder: 'اكتب رمز HS أو اسم المنتج…',
      hsNotFound: 'غير موجود. حاول كلمة مفتاحية مختلفة.',
      goodsValueSection: 'قيمة البضائع والعملات',
      currencyLabel: 'العملة',
      goodsValueLabel: 'قيمة البضائع (بالـ {currency})',
      convertToIdr: 'تحويل إلى IDR',
      rateUsed: 'السعر المستخدم',
      incotermSection: 'شروط الشحن',
      incotermOptional: '(اختياري، CIF افتراضي)',
      freightLabel: 'تكلفة الشحن (IDR)',
      insuranceLabel: 'التأمين (%)',
      taxOptionsSection: 'خيارات الضرائب والتفضيلات',
      apiImporterLabel: 'مستورد مسجل (API)',
      apiImporterHint: 'تحقق مما إذا كانت شركتك لديها API. يؤثر على معدل ضريبة الدخل المادة 22.',
      preferentialLabel: 'نظام التفضيلات FTA',
      preferentialDesc: 'معدل الرسوم الجمركية بموجب اتفاقية التجارة الحرة',
      availablePreferential: 'أسعار تفضيلية متاحة',
      noPreferential: 'لا توجد أسعار تفضيلية لهذه الاتفاقية',
      resultTitle: 'نتائج الحساب',
      resultNdpbm: 'NDPBM (CIF IDR)',
      resultBM: 'الرسوم الجمركية على الواردات',
      resultPPN: 'ضريبة القيمة المضافة على الواردات',
      resultPPnBM: 'ضريبة السلع الفاخرة',
      resultPPh: 'ضريبة الدخل المادة 22',
      resultTotal: 'إجمالي التحصيل',
      resultDDP: 'إجمالي DDP (تقديري)',
      resultEffective: 'السعر الفعلي',
      lartasTitle: 'LARTAS — السلع المقيدة/المحظورة',
      lartasWarning: 'هذه السلعة تخضع لقيود الاستيراد.',
      noLartas: '✓ خالية من LARTAS',
      btkiLink: 'تفاصيل BTKI',
      inswLink: 'تحقق من INSW',
      exportCSV: 'تصدير CSV',
      exportJSON: 'تصدير JSON',
      loadingRates: 'جاري جلب أحدث الأسعار…',
      rateJisdor: 'JISDOR BI — مباشر',
      rateLive: 'السعر المباشر',
      rateEstimate: 'السعر التقديري',
      updatedAt: 'تم التحديث',
      emptyResult: 'اختر رمز HS وأدخل قيمة البضائع لرؤية نتائج الحساب التلقائي',
      multiAddItem: 'إضافة رمز HS',
      multiCalculate: 'احسب الكل',
      multiCalculating: 'جاري الحساب...',
      multiRemove: 'إزالة',
      multiLabel: 'تسمية',
      multiGoodsValue: 'قيمة البضائع',
      multiError: 'خطأ',
      multiResultTitle: 'نتائج المقارنة',
      multiExportCSV: 'تصدير CSV متعدد',
      incotermFreightNote: 'يتطلب إدخال شحن منفصل',
      incotermInsuranceNote: 'يتطلب إدخال تأمين منفصل',
      incotermFullNote: 'يتطلب إدخال شحن كامل',
      incotermCifNote: 'القيمة تشمل بالفعل الشحن والتأمين',
      contactCta: 'استشارة وطلب',
      contactCtaDesc: 'هل تحتاج مساعدة في التخليص الجمركي، PIB/PEB، أو الاستيراد باسم آخر؟',
    },
    mktCard: {
      statusOnOrder: 'قابل للاستفسار',
      expiresExpired: 'تنتهي اليوم',
      expiresInDays: '{days} يوم متبقي',
      priceOnRequest: 'السعر قابل للتفاوض',
      requestQuotation: 'طلب عرض سعر',
      shareProduct: 'مشاركة المنتج',
      removeFromCompare: 'إزالة من المقارنة',
      maxCompareItems: 'الحد الأقصى 4 عناصر',
      compare: 'مقارنة',
      sellPrice: 'سعر البيع',
      description: 'الوصف',
      specifications: 'المواصفات',
      originLabel: 'المنشأ',
      locationLabel: 'الموقع',
      leadTimeLabel: 'مدة التسليم',
      moqNego: 'الحد الأدنى للطلب: قابل للتفاوض',
      moqOnRequest: 'عند الطلب',
      topSupplier: 'المورد المتميز',
      filterAllOption: 'الكل',
      noPhotoYet: 'لا توجد صور بعد',
      moqLabel: 'الحد الأدنى للطلب:',
      priceOnRequestDialog: 'السعر قابل للتفاوض',
    },
    pabean: {
      headerTitle: 'إدارة الجمارك / PPJK',
      headerSubtitle: 'خدمات الجمارك',
      step1Title: 'اختر خدمة استشارة PPJK',
      step1Subtitle: 'اختر خدمة واحدة أو أكثر تحتاجها',
      step2Title: 'تفاصيل الخدمة المختارة',
      step3Title: 'معلومات المتقدم',
      step4Title: 'ملخص وتقديم',
      selectedLabel: 'مختار:',
      serviceLabel: 'خدمة',
      estimatedCost: 'التكلفة المقدرة',
      confirmedAfterDoc: 'التأكيد بعد مراجعة الوثائق',
      costNote: 'تقديرات التكاليف هي مؤشرات. سيتم تأكيد التكاليف النهائية من قبل فريق PPJK لدينا بعد التحقق من الوثائق. سيتواصل فريقنا معك خلال يوم عمل واحد.',
      submitting: 'جاري التقديم...',
      submitBtn: 'تقديم طلب PPJK',
      successMsg: 'تم تقديم طلب PPJK بنجاح! سيتواصل فريقنا معك في أقرب وقت ممكن.',
      errorMsg: 'فشل في تقديم الطلب',
      profileAutoFilled: 'تم استرداد البيانات من ملف حسابك. يمكن تغيير رقم الهاتف فقط.',
      loginToUpload: 'يرجى تسجيل الدخول ثم رفع الملفات',
      uploadOptional: 'رفع الملفات ذات الصلة (اختياري)',
      consultDetail: 'موضوع الاستشارة *',
      consultConfirm: 'سيتم تأكيد رسوم الاستشارة من قبل فريق PPJK لدينا. سيتواصلون معك بعد التقديم بفترة قصيرة.',
      perijinanConsultDetail: 'نوع الترخيص / موضوع الاستشارة *',
      picName: 'اسم جهة الاتصال',
      companyNameLabel: 'اسم الشركة',
      additionalNotes: 'ملاحظات إضافية',
      additionalNotesPlaceholder: 'معلومات إضافية لفريقنا (اختياري)',
      fullNamePlaceholder: 'الاسم الكامل',
      emailPlaceholder: 'email@company.com',
      phonePlaceholder: '+62 8xx xxxx xxxx',
      companyPlaceholder: 'اسم الشركة',
      svc1Title: 'استشارة قوانين الاستيراد',
      svc1Desc: 'استشارة متعمقة حول اللوائح والمتطلبات الجمركية لأنشطة الاستيراد',
      svc2Title: 'استشارة قوانين التصدير',
      svc2Desc: 'استشارة متعمقة حول اللوائح والمتطلبات الجمركية لأنشطة التصدير',
      svc3Title: 'استشارة تراخيص الاستيراد والتصدير',
      svc3Desc: 'استشارة حول عمليات الترخيص، NIB، API، والمستندات القانونية لأنشطة الاستيراد/التصدير',
      svc4Title: 'استشارة الضرائب على الاستيراد',
      svc4Desc: 'استشارة حول ضريبة القيمة المضافة على الاستيراد، ضريبة الدخل المادة 22، الرسوم الجمركية، والالتزامات الضريبية المتعلقة بالاستيراد',
      svc1ConsultPlaceholder: 'وصف بإيجاز لمشكلة أو سؤال تنظيم الاستيراد الذي ترغب في الاستشارة بشأنه...',
      svc2ConsultPlaceholder: 'وصف بإيجاز لمشكلة أو سؤال تنظيم التصدير الذي ترغب في الاستشارة بشأنه...',
      svc3ConsultPlaceholder: 'على سبيل المثال، عملية ترخيص API-U، NIB للاستيراد، أو متطلبات تصريح التصدير لمنتجات معينة...',
      svc4ConsultPlaceholder: 'على سبيل المثال، حساب ضريبة القيمة المضافة على الاستيراد، معدلات ضريبة الدخل المادة 22، رمز HS والرسوم الجمركية، أو تسهيلات كيت/كاهة المالية...',
      dropHint: 'انقر أو اسحب الملفات إلى هنا',
      dropHere: 'أطلق لتحميل',
      uploadSuccess: 'تم التحميل بنجاح ✓',
      uploadFailed: 'فشل في التحميل',
      serverResponseInvalid: 'استجابة خادم غير صالحة',
      connectionFailed: 'فشل الاتصال أثناء التحميل',
      missingService: 'نوع الخدمة',
      uploadingProgress: 'جاري التحميل...',
      fileFormatError: 'تنسيق غير مدعوم (.{ext}). استخدم PDF، JPG، PNG، DOC، أو DOCX.',
      fileSizeError: 'الملف كبير جداً ({size} ميغابايت). الحد الأقصى 10 ميغابايت.',
    },
  },
  vendor: {
    register: {
      validating: 'Validating invitation…',
      linkInvalid: 'Invalid Link',
      linkInvalidHint: 'If you believe this is an error, contact the CST Logistic team to get a new link.',
      successTitle: 'Registration Successful! 🎉',
      successMsg: 'Your data has been received. The CST Logistic team will contact you shortly for the next steps.',
      successHint: 'Make sure your WhatsApp number or email is active so we can reach you.',
      goHome: 'Go to Home',
      backToHome: 'Back to Home',
      invitationLabel: 'Vendor Partner Invitation',
      serviceTypeLabel: 'Service type:',
      validUntil: 'Link valid until',
      contactFormTitle: 'Complete Contact Details',
      companyName: 'Company Name',
      contactName: 'Contact Name (PIC)',
      whatsapp: 'WhatsApp Number',
      email: 'Email',
      messageLabel: 'Message / Additional Information (optional)',
      productCategory: 'Product Category',
      shortDescription: 'Short Description',
      addMedia: 'Add',
      addMoreProduct: 'Add another product/service',
      supportingDocs: 'Supporting Documents',
      docFormat: 'JPG, PNG, or PDF format, max {max}MB per file.',
      termsTitle: 'Vendor Terms & Conditions',
      disagreeReason: 'Reason for disagreement',
      agree: 'Agree',
      disagree: 'Disagree',
      sending: 'Sending…',
      sendReason: 'Send Reason',
      confirmJoin: 'Confirm Join as Partner',
      takePhoto: 'Take Photo Directly',
      capturePhoto: 'Take Photo',
      chooseFile: 'Choose File',
      uploading: 'Uploading…',
    },
    form: {
      invalidToken: 'Invalid token',
      loading: 'Loading data...',
      linkUnavailable: 'Link unavailable',
      offerSent: 'Offer Submitted!',
      offerSentDesc: 'Thank you for your offer. Our team will review it shortly.',
      rfqLabel: 'Request For Quotation',
      qty: 'Qty',
      vendorUnitPrice: 'Vendor Unit Price',
      vendorSubtotal: 'Vendor Subtotal',
      ppn: 'VAT 11%',
      grandTotalVendor: 'Vendor Grand Total',
      requiredDocs: 'Required documents:',
      expired: 'Deadline Has Passed',
      expiredDesc: 'This RFQ can no longer be responded to. Please contact our team if you have questions.',
      canStillUpdate: 'You can still update your offer below.',
      replyBeforeDeadline: 'Please reply before the specified deadline',
      timeExpired: '⛔ Deadline Passed',
      timeRemaining: '⏰ Response Time Remaining',
      unitPrice: 'Unit Price',
      sending: 'Sending...',
    },
    profil: {
      featured: 'Featured',
      priceNegotiable: 'Price negotiable',
      productLabel: 'Product',
      notFound: 'Vendor not found',
      notFoundDesc: 'This vendor profile is unavailable or no longer active.',
      back: 'Back',
      retry: 'Try Again',
      saved: 'Saved!',
      removed: 'Removed',
      bookmarkSaved: 'Vendor saved to your bookmark list.',
      bookmarkRemoved: 'Vendor removed from bookmarks.',
      bookmarkFailed: 'Failed to update bookmark.',
      loginRequired: 'Login required',
      loginRequiredDesc: 'Please log in to save vendors to your bookmark list.',
      linkCopied: 'Link copied',
      linkCopiedDesc: 'Vendor profile link has been copied to clipboard.',
      networkError: 'Network error',
      companyDescEmpty: 'Company description not yet available.',
      bookmarkSaveLabel: 'Save',
      bookmarkSavedLabel: 'Saved',
    },
    fulfillment: {
      loading: 'Loading fulfillment form...',
      linkInvalid: 'Invalid Link',
      linkInvalidHint: 'If you believe this is incorrect, contact the admin team.',
      readyToShip: 'When is the product ready to ship?',
      leadTime: 'Lead Time',
      leadTimeAuto: 'Automatically calculated from ready-to-ship date',
      warehouseAddressHint: 'Warehouse address for goods pickup',
      dpp: 'DPP (Your input)',
      totalInclPpn: 'Total incl. VAT',
      uploadHint: 'JPG, PNG, WebP, HEIC, or PDF — max 20 MB per file',
      orderDetail: 'Order Detail',
      fillNotesDesc: 'Fill in the notes below to describe the fulfillment details.',
      additionalNotes: 'Additional Notes (optional)',
      sending: 'Sending...',
      successTitle: 'Data Successfully Sent!',
      successDesc: 'Thank you. Our team will process it shortly.',
      reviewTitle: 'Fulfillment Data Has Been Submitted',
      reviewDesc: 'The data below is the submission for this order.',
      qtyFulfilled: 'Qty Fulfilled',
      qtyOrder: 'Order Qty',
      dppBase: 'DPP (Base Price)',
      loadingForm: 'Loading form...',
      successTitle2: 'Fulfillment Data Sent!',
      successDesc2: 'Thank you. We have received your data and our team will process it shortly.',
      vendorConfirmedStatus: 'Vendor Confirmed',
      vendorConfirmedLabel: 'Order status:',
      formTitle: 'Fulfillment Form',
      noOrderLabel: 'Order No.',
      serviceLabel: 'Service',
      routeLabel: 'Route',
      commodityLabel: 'Commodity',
      weightLabel: 'Weight',
      expiresLabel: 'Form valid until',
      fieldRequired: 'Required fields not filled:',
      submitBtn: 'Submit Fulfillment Data',
      submitNote: 'The data you submit will be used for operational processing.',
      vendorLabel: 'Vendor:',
      errorGeneral: 'An error occurred',
    },
  },
  vendorInvoice: {
    loading: 'Loading...',
    linkInvalid: 'Invalid Link',
    linkInvalidHint: 'If you believe this is incorrect, please contact the admin team.',
    successTitle: 'Invoice Sent!',
    successRefLabel: 'PO Ref:',
    successDesc: 'We have received your invoice. The finance team will process payment according to the agreed terms.',
    alreadySubmittedTitle: 'Invoice Already Sent',
    alreadySubmittedDesc: 'An invoice for this PO has already been submitted.',
    statusWaiting: 'PO Status: Awaiting Vendor Invoice',
    poBreakdownTitle: 'PO Base Price Breakdown',
    descCol: 'Description',
    qtyCol: 'Qty',
    unitCol: 'Unit',
    basePriceCol: 'Base Price',
    subtotalCol: 'Subtotal',
    subtotalLabel: 'Subtotal (Base Price, excl. VAT)',
    ppnLabel: 'VAT 11% (nominal)',
    totalLabel: 'Total (incl. VAT 11%)',
    basePriceWarning: '⚠ The price above is the BASE PRICE (excl. margin). Your invoice must match this value.',
    invoiceDataTitle: 'Vendor Invoice Data',
    invoiceNumberLabel: 'Invoice Number',
    invoiceDateLabel: 'Invoice Date',
    invoiceAmountLabel: 'Invoice Amount (incl. VAT)',
    bankInfoTitle: 'Bank Account Information',
    bankNameLabel: 'Bank Name',
    bankAccountLabel: 'Account Number',
    accountHolderLabel: 'Account Holder Name',
    notesLabel: 'Notes',
    notesPh: 'Payment terms, additional notes...',
    accountHolderPh: 'Name as on account',
    bankNamePh: 'e.g. BCA, Mandiri, BNI',
    submitting: 'Sending...',
    submit: 'Send Invoice',
    vendorLabel: 'Vendor:',
    errorInvoiceRef: 'Invoice number is required',
    errorAmount: 'Invoice amount is required',
    errorBankAccount: 'Account number is required',
    tokenNotFound: 'Token not found',
    errorGeneral: 'An error occurred',
    errorFailed: 'Failed to send',
    invoiceTitle: 'Invoice Submission',
  },
  vendorTracking: {
    loading: 'Loading tracking form...',
    linkInvalid: 'Invalid Link',
    linkInvalidDesc: 'Tracking link not found or has expired.',
    successTitle: 'Update Successful!',
    successOrderUpdated: 'Order status has been updated to:',
    completedNote: 'Thank you! The admin team will process the order completion and issue an invoice.',
    notifSent: 'Notification has been sent to admin and customer.',
    headerTitle: 'Update Shipment Progress',
    headerSubtitle: 'B2B Marketplace and Logistic',
    orderNumberLabel: 'Order No.',
    customerLabel: 'Customer',
    serviceLabel: 'Service',
    routeLabel: 'Route',
    commodityLabel: 'Commodity',
    currentStatusTitle: 'Current Status',
    lastUpdated: 'Status last updated',
    historyTitle: 'Update History',
    orderCompleted: 'Order Completed',
    orderCompletedThanks: 'Thank you for completing this shipment.',
    updateFormTitle: 'Update Latest Status',
    currentBadge: 'Current',
    notesLabel: 'Notes (optional)',
    notesPh: 'e.g. Already booked, pickup scheduled for tomorrow morning...',
    podRequired: '📦 Proof of Delivery (POD) required for this status',
    recipientLabel: 'Recipient Name',
    recipientPh: 'Name of the person receiving the goods...',
    completeWarning: 'Selecting Complete will notify admin to close the order and issue an invoice to the customer.',
    saving: 'Saving...',
    submit: 'Send Status Update',
    poweredBy: 'Powered by B2B Marketplace and Logistic',
    errorSelectStatus: 'Please select a status first',
    errorRecipientRequired: 'Recipient name is required for Delivered/Completed status',
    statusDataReceived: 'Data Received',
    statusBookingProcess: 'Booking Process',
    statusScheduleConfirmed: 'Schedule Confirmed',
    statusPickupArranged: 'Pickup Arranged',
    statusDocumentProcess: 'Document Process',
    statusCustomsProcess: 'Customs Process',
    statusInTransit: 'In Transit',
    statusDelivered: 'Delivered',
    statusCompleted: 'Completed',
  },
  orderTask: {
    gpsTitle: '📍 Share GPS Location',
    gpsDesc: 'Share your current position so admin can monitor the journey in real-time.',
    gpsGetting: 'Getting location...',
    gpsSendAgain: 'Resend Location',
    gpsSendNow: 'Send Location Now',
    gpsMapsLink: 'View on Google Maps',
    updateFormTitle: '📝 Send Update',
    cargoCatGeneral: 'عام',
    cargoCatFragile: 'قابل للكسر',
    cargoCatDG: 'بضائع خطرة (DG)',
    cargoCatSpecial: 'يتطلب معالجة خاصة',
    statusLabel: 'تحديث الحالة',
    notesLabel: 'Operational Notes',
    notesPh: 'Example: Goods picked up at 09:00, estimated arrival tomorrow...',
    successMsg: '✅ Update sent successfully!',
    submitting: 'Sending...',
    submit: 'Send Update',
    historyTitle: '📅 Update History',
    attachmentLabel: '📎 View Attachment',
    errorGpsNotSupported: 'Browser does not support GPS',
    errorGpsPermission: 'Location access denied. Please allow GPS in your browser.',
    errorGpsUnavailable: 'Location unavailable.',
    errorGpsTimeout: 'Timeout getting location.',
    errorGpsFailed: 'Failed to get location',
    errorSendLocation: 'Failed to send location',
    errorGeneral: 'An error occurred',
    errorFailed: 'Failed',
    statusOrderConfirmed: 'Order Confirmed',
    statusAssignedToVendor: 'Assigned to Vendor',
    statusWaitingPickup: 'Waiting Pickup',
    statusPickedUp: 'Picked Up',
    statusInProgress: 'In Transit',
    statusDelivered: 'Delivered',
    statusPodUploaded: 'POD Uploaded',
    statusInvoiceCreated: 'Invoice Created',
    statusPaymentPending: 'Awaiting Payment',
    statusPaid: 'Paid',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
  },
  customerApproval: {
    linkInvalid: 'Invalid Link',
    offerNotFound: 'Offer not found',
    alreadyRespondedTitle: 'Already Responded',
    alreadyApproved: 'approved',
    alreadyRejected: 'rejected',
    salesOrderLabel: 'Sales Order',
    approvedTitle: 'Offer Approved!',
    rejectedTitle: 'Offer Rejected',
    approvedSoCreated: 'Sales Order Created',
    approvedDesc: 'Thank you! Our team will process your order and get in touch with you shortly.',
    rejectedDesc: 'We have noted your rejection. Our team will contact you soon to discuss other options.',
    headerTitle: 'Offer Confirmation',
    orderLabel: 'Order:',
    forLabel: 'For:',
    specProductTitle: 'Product Specifications',
    specServiceTitle: 'Service Details',
    requiredDocsTitle: '📋 Required Documents',
    requiredDocsNote: 'Please prepare the documents above before shipment is carried out.',
    checklistTitle: '✅ Checklist',
    priceBreakdownTitle: 'Selling Price Breakdown',
    descCol: 'Description',
    qtyCol: 'Qty',
    unitCol: 'Unit',
    unitPriceCol: 'Unit Price',
    subtotalCol: 'Subtotal',
    subtotalLabel: 'Subtotal (excl. VAT)',
    totalLabel: 'Total (incl. VAT)',
    priceNote: '* The price above is the SELLING PRICE (incl. VAT)',
    totalPriceTitle: 'Total Selling Price',
    offerSummaryTitle: 'Service Summary',
    termsTitle: 'Terms & Conditions',
    rejectReasonLabel: 'Reason for Rejection',
    rejectReasonHint: 'Required — explain the reason for rejection or revision request.',
    rejectReasonPh: 'e.g. Price too high, please revise to Rp X / I no longer need this service because...',
    rejectReasonRequired: '⚠️ Rejection reason must be filled before confirming.',
    cancelBtn: 'Cancel',
    confirmRejectBtn: 'Confirm Reject',
    approveBtn: '✅ I Agree with This Offer',
    rejectBtn: '❌ Reject Offer',
    processing: 'Processing...',
    submitting: 'Sending...',
    agreementNote: 'By clicking "Agree", you accept the offer and the terms stated above.',
    tokenNotFound: 'Token not found',
    alreadyResponded: 'Already responded',
    grandTotalLabel: 'Grand Total (incl. VAT)',
    alreadyRespondedDesc: 'This offer has already been',
    alreadyRespondedSuffix: 'previously.',
  },
  vendorResponse: {
    loading: 'Loading order data...',
    loadFailed: 'Failed to Load',
    loadFailedDesc: 'Please check your internet connection and try again.',
    retry: 'Try Again',
    notFound: 'Order Not Found',
    notFoundHint: 'Please make sure the link is correct, or contact admin.',
    orderNo: 'Order no.:',
    successTitle: 'Response Sent!',
    alreadyRespondedTitle: 'Already Responded',
    successDesc: 'Your response for the following order has been successfully sent to admin.',
    alreadyRespondedDesc: 'A response for this order has already been submitted.',
    responseSummaryTitle: 'Response Summary',
    noOrderLabel: 'Order No.',
    statusLabel: 'الحالة',
    priceLabel: 'Quoted Price',
    driverLabel: 'Driver',
    plateLabel: 'Plate Number',
    pickupLabel: 'Est. Pickup',
    adminContact: 'Admin will contact you shortly. Thank you! 🙏',
    orderDetailTitle: 'Order Details',
    routeLabel: 'Route',
    cargoLabel: 'Cargo Category',
    grossWeightLabel: 'Gross Weight',
    vehicleTypeLabel: 'Vehicle Type',
    vendorPriceRefLabel: 'Vendor Price (Reference)',
    pickupScheduleLabel: 'Pickup Schedule',
    formTitle: 'Vendor Response Form',
    vendorNameLabel: 'Company / Vendor Name',
    vendorNamePh: 'e.g. PT Wangsamas Logistics',
    availabilityLabel: 'Availability Status',
    readyCaption: 'Ready to fulfill order',
    notReadyCaption: 'Not available at this time',
    fleetInfo: 'Fill in the fleet information to be used:',
    pickupTimeLabel: 'Estimated Pickup Time',
    pickupTimePh: 'e.g. 20 May 2026 09:00 WIB',
    driverNameLabel: 'Driver Name',
    driverNamePh: 'Full driver name',
    driverPhoneLabel: 'Driver Phone Number',
    plateNumberLabel: 'Vehicle Plate Number',
    priceOfferLabel: 'Quoted Price',
    vehicleTypeLabel2: 'Vehicle Type',
    vehicleTypePh: 'e.g. CDD Box, Tronton, Fuso',
    notesLabel: 'Notes / Remarks',
    notesPh: 'Add notes if any...',
    photoLabel: 'Vehicle Unit Photo',
    photoOptional: '(optional)',
    photoRemove: 'Remove',
    photoBtn: 'Take / Choose Photo',
    photoHint: 'JPG, PNG, max 10MB',
    submitting: 'Sending...',
    submit: 'Send Response',
    submitNote: 'Your response will be received directly by the admin team.',
    errorSelectStatus: 'Please select READY or NOT READY status first.',
    errorDriverRequired: 'Driver name is required if status is READY.',
    errorPlateRequired: 'Plate number is required if status is READY.',
    errorTimeout: 'Connection timeout (>15 seconds). Check your internet and try again.',
    errorLoadData: 'Failed to load data. Check your internet connection.',
    errorGeneral: 'An error occurred. Please try again.',
    errorConnFailed: 'Connection failed. Check your internet and try again.',
    notFoundDesc: 'not found in the system.',
  },
  vendorQuote: {
    loading: 'Loading RFQ data...',
    notFoundTitle: 'RFQ Not Found',
    notFoundDesc: 'Invalid link or already expired.',
    successTitle: 'Quote Sent!',
    successDesc: 'Admin team will process your quote shortly',
    rfqNoLabel: 'RFQ No.',
    orderNoLabel: 'Order No.',
    vendorLabel: 'Vendor',
    offeredPrice: 'Quoted Price',
    thankYou: 'Thank you for your participation',
    requestDetailTitle: 'Request Details',
    orderNoCol: 'Order No.',
    serviceTypeLabel: 'Service Type',
    orderDateLabel: 'Order Date & Time',
    routeLabel: 'Route',
    vehicleTypeLabel: 'Vehicle Type',
    commodityLabel: 'Commodity',
    cargoDescLabel: 'Cargo Description',
    weightLabel: 'Weight',
    volumeLabel: 'Volume',
    requiredDateLabel: 'Required Date',
    vendorPriceRefLabel: 'Vendor Reference Price',
    vendorPriceRefNote: 'Based on vendor catalog — adjustable',
    productDetailTitle: 'Product Details',
    summaryTitle: 'Summary',
    vendorSubtotalLabel: 'Vendor Subtotal',
    ppnLabel: 'VAT 11%',
    grandTotalLabel: 'Vendor Grand Total',
    basePriceNote: '*Base price excludes margin. VAT calculated from vendor subtotal.',
    qtyLabel: 'Qty',
    sellingUnitPriceLabel: 'Selling Price/Unit',
    totalSellingLabel: 'Total Selling Price',
    vendorBasePriceLabel: 'Vendor Base Price/Unit',
    vendorSubtotalItemLabel: 'Vendor Subtotal',
    formTitleNew: 'Submit New Price',
    formTitleOffer: 'Fill Your Quote',
    newUnitPrice: 'New Unit Price',
    basePriceOffer: 'Base Price Offer',
    currencyLabel: 'Currency',
    previewTitle: 'Calculation Preview',
    previewNewPrice: 'New Unit Price',
    previewQtyLabel: 'Qty',
    previewSubtotal: 'New Subtotal',
    previewPPN: 'VAT 11%',
    previewGrandTotal: 'New Grand Total',
    excVatNote: '(excl. VAT — base price for admin)',
    pickupLabel: 'Est. Pickup',
    arrivalLabel: 'Est. Arrival',
    daysLabel: 'Estimated Delivery Days',
    daysPh: 'e.g. 3',
    notesLabel: 'Additional Notes',
    notesPh: 'Terms & conditions, special notes, etc...',
    submitting: 'Sending...',
    submitNew: 'Send Price Quote',
    submitOffer: 'Send Quote',
    formNote: 'This form is only for vendors who received an RFQ invitation',
    errorLinkInvalid: 'Invalid link. rfq and v parameters are required.',
    errorTokenMissing: 'Invalid link. Token not found.',
    errorLoadFailed: 'Failed to load RFQ data',
    errorInvalidPrice: 'Invalid quote price',
    errorSubmitFailed: 'Failed to send quote',
    formVendorLabel: 'Vendor Quote Form',
  },

  adminAction: {
    errorSelectVendor: 'يرجى تحديد بائع واحد على الأقل.',
    errorSelectVendorFirst: 'يرجى تحديد بائع أولاً.',
    errorFillPrice: 'سعر البيع للعميل مطلوب.',
    successOrderConfirmed: 'تم تأكيد الطلب. تم إرسال رسالة واتساب تلقائياً للعميل.',
    fulfillmentNote: 'الخطوة التالية: افتح رابط تأكيد التنفيذ المرسل عبر واتساب للمسؤول.',
    basePrice: 'السعر الأساسي',
    routeLabel: 'المسار',
    noWa: 'بدون واتساب',
  },
  airFreight: {
    back: 'رجوع',
    backToHome: 'العودة إلى الرئيسية',
    navTitle: 'الشحن الجوي',
    navBrand: 'CST Logistics',
    heroTitle: 'حجز الشحن الجوي',
    heroHint: 'أدخل تفاصيل البضاعة ومسار الرحلة',
    sectionRoute: 'مسار الرحلة',
    originCity: 'مدينة المنشأ',
    originAirport: 'رمز مطار المنشأ',
    destCity: 'مدينة الوجهة',
    destAirport: 'رمز مطار الوجهة',
    cargoTypeLabel: 'نوع البضاعة',
    sectionCargo: 'تفاصيل البضاعة',
    commodityLabel: 'نوع السلعة',
    commodityPlaceholder: 'مثال: إلكترونيات، منسوجات، مواد غذائية...',
    dimensionLabel: 'الأبعاد والوزن (لكل طرد)',
    addKoli: 'إضافة طرد',
    calcEstimate: 'احسب التقدير',
    sectionRate: 'خيارات التعريفة',
    noRateMsg: 'لا تتوفر تعريفات لهذا المسار. سيتصل بك فريقنا بأفضل عرض.',
    routeDirect: 'مباشر',
    routeTransit: 'عبور',
    dayUnit: 'أيام',
    estimateTotal: 'الإجمالي التقديري',
    rateSelected: 'التعريفة المختارة',
    sectionSchedule: 'الجدول الزمني',
    pickupDate: 'تاريخ الاستلام',
    flightDate: 'تاريخ الرحلة المفضل',
    arrivalDate: 'تاريخ الوصول المستهدف',
    sectionAddons: 'خدمات إضافية',
    addonsSelected: 'تم اختيار {count} خدمة',
    sectionContact: 'بيانات المرسل',
    fullName: 'الاسم الكامل',
    companyName: 'اسم الشركة',
    whatsapp: 'واتساب',
    notes: 'ملاحظات',
    notesPh: 'معلومات إضافية لفريقنا...',
    summaryTitle: 'ملخص الحجز',
    summaryRoute: 'المسار',
    summaryService: 'الخدمة',
    summaryIncoterm: 'شرط التسليم',
    summaryChargeable: 'الوزن المحتسب',
    summaryRate: 'شركة الطيران',
    summaryEstimate: 'السعر التقديري',
    summaryAddons: 'الخدمات الإضافية',
    serviceUnit: 'خدمة',
    selectRateHint: 'اختر تعريفة أعلاه لرؤية تقدير السعر النهائي.',
    requestQuote: 'إرسال الطلب',
    requestHint: 'سيتصل بك فريقنا خلال 24 ساعة للتأكيد والتسعير النهائي.',
    successTitle: 'تم إرسال الطلب!',
    successDesc: 'سيتصل بك فريقنا قريباً لتأكيد تفاصيل الشحن.',
    orderNoLabel: 'رقم الطلب',
    trackOrder: 'تتبع الطلب',
    validationAirport: 'رموز مطار المنشأ والوجهة مطلوبة',
    validationWeight: 'يرجى إدخال وزن البضاعة أولاً',
    validationNoRate: 'لا تتوفر تعريفات، لكن يمكنك إرسال الطلب',
    validationEstimateFail: 'فشل في الحصول على تقدير التعريفة',
    validationName: 'الاسم الكامل مطلوب',
    validationPhone: 'رقم واتساب مطلوب',
    validationCommodity: 'نوع السلعة مطلوب',
    validationWeightFill: 'يرجى إدخال وزن البضاعة قبل الإرسال',
    validationSuccess: 'تم إرسال طلب الشحن الجوي بنجاح!',
    validationSubmitFail: 'فشل في إرسال طلب الشحن الجوي',
  },

  airFreightTrack: {
    pageTitle: 'تتبع الشحن الجوي',
    awbNumber: 'رقم بوليصة الشحن الجوي',
    flightInfo: 'معلومات الرحلة',
    origin: 'المصدر',
    destination: 'الوجهة',
    status: 'الحالة',
    noTracking: 'لم يتم العثور على بيانات تتبع',
    trackBtn: 'تتبع',
    searchPlaceholder: 'أدخل رقم بوليصة الشحن...',
  },
  approvePage: {
    pageTitle: 'الموافقة على العرض',
    vendorSelected: 'المورد المختار',
    vendorPrice: 'سعر المورد',
    markup: 'هامش الربح',
    approve: 'موافقة',
    revision: 'مراجعة',
    reject: 'رفض',
    provideResponse: 'قدّم ردك:',
    statusUpdated: 'تم تحديث حالة التوصيل',
    updating: 'جارٍ التحديث...',
    deliveryTimeline: 'جدول التوصيل',
  },
  confirmPage: {
    pageTitle: 'تأكيد الطلب',
    customerName: 'اسم العميل',
    shipmentType: 'نوع الشحنة',
    unitType: 'نوع الوحدة',
    notes: 'ملاحظات',
    confirmBtn: 'تأكيد',
    cancelBtn: 'إلغاء',
    successMsg: 'سيقوم نظامنا بإنشاء أمر مبيعات تلقائياً. سيتصل بك فريقنا قريباً.',
    errorMsg: 'حدث خطأ',
  },
  freightForwarding: {
    directionTitle: 'اختر اتجاه الشحن',
    directionSubtitle: 'حدد نوع الشحن المطلوب',
    modeTitle: 'اختر وسيلة النقل',
    modeSubtitle: 'اختر وسيلة النقل الأنسب',
    variantTitle: 'اختر نوع الخدمة',
    variantSubtitle: 'حدد مسار الشحن من المصدر إلى الوجهة',
    formTitle: 'تفاصيل الشحن والوثائق',
    formSubtitle: 'أكمل تفاصيل الشحن وارفع الوثائق المطلوبة',
    senderData: 'معلومات المُرسِل',
    senderName: 'اسم المُرسِل',
    senderAddress: 'عنوان المُرسِل الكامل',
    receiverData: 'معلومات المستلم',
    receiverName: 'اسم المستلم',
    receiverAddress: 'عنوان المستلم الكامل',
    goodsData: 'معلومات البضائع',
    commodityName: 'اسم البضائع / السلعة',
    goodsCategory: 'فئة البضائع',
    dgWarning: 'يجب أن تتضمن البضائع الخطرة وثائق MSDS/SDS وCOA.',
    cargoDetail: 'تفاصيل عناصر الشحن',
    grossWeight: 'الوزن الإجمالي (كجم)',
    kolliCount: 'عدد الطرود',
    dimensions: 'الأبعاد (سم)',
    totalVolume: 'الحجم الإجمالي',
    totalGrossWeight: 'إجمالي الوزن الإجمالي',
    estimationTitle: 'التقدير الإجمالي',
    backToServices: 'العودة إلى الخدمات',
    back: 'رجوع',
    addItem: 'إضافة عنصر',
    uploadInvoice: 'وثيقة الفاتورة',
    uploadPackingList: 'قائمة التعبئة',
    uploadMsds: 'وثيقة MSDS/SDS',
    uploadCoa: 'وثيقة COA',
    contactInfo: 'معلومات الاتصال (المسؤول)',
    contactName: 'الاسم الكامل للمسؤول',
    contactPhone: 'واتساب / رقم الهاتف',
    contactEmail: 'بريد المسؤول الإلكتروني',
    submitOrder: 'إرسال الطلب',
    orderSuccess: 'تم إنشاء الطلب بنجاح!',
    export: 'تصدير',
    import: 'استيراد',
    domestic: 'محلي',
    air: 'جوي',
    sea: 'بحري',
    road: 'بري',
    selectDirection: 'يرجى اختيار اتجاه الشحن أولاً',
    errorRequired: 'البيانات غير مكتملة، يرجى مراجعة النموذج.',
  },
  logisticTrack: {
    pageTitle: 'تتبع طلب اللوجستيات',
    trackingId: 'معرّف التتبع',
    status: 'الحالة',
    stepPickup: 'الاستلام',
    stepInTransit: 'في الطريق',
    stepDelivered: 'تم التسليم',
    stepPending: 'قيد الانتظار',
    noTracking: 'لم يتم العثور على بيانات تتبع',
    lastUpdate: 'آخر تحديث',
    estimatedArrival: 'الوصول المتوقع',
    contactSupport: 'تواصل مع فريقنا لأي استفسار حول طلبك.',
    labelPickup: 'عملية الاستلام',
    labelInTransit: 'في الطريق',
    labelDelivered: 'تم التسليم',
    labelAtWarehouse: 'في المستودع',
  },
  mktMyRfqs: {
    pageTitle: 'طلبات عروض الأسعار',
    pageDesc: 'تابع جميع طلبات عروض الأسعار الخاصة بك',
    searchPlaceholder: 'ابحث عن طلب، منتج، مورد…',
    allStatus: 'جميع الحالات',
    allDates: 'جميع التواريخ',
    emptyRfq: 'لا توجد طلبات عروض أسعار.',
    noMatchingRfq: 'لا توجد طلبات مطابقة.',
    colRfqNo: 'رقم الطلب',
    colProduct: 'المنتج',
    colVendor: 'المورد',
    colStatus: 'الحالة',
    colDate: 'التاريخ',
    statusOpen: 'مفتوح',
    statusPending: 'قيد الانتظار',
    statusQuoted: 'تم تقديم العرض',
    statusAccepted: 'مقبول',
    statusRejected: 'مرفوض',
    statusExpired: 'منتهي الصلاحية',
    viewDetail: 'عرض التفاصيل',
    createRfq: 'إنشاء طلب جديد',
      fetchError: 'Failed to load RFQ list. Please try again.',
    browseMarketplace: 'Browse Marketplace',
    createdLabel: 'Created:',
    requiredLabel: 'Required by:',
    actionRequired: 'Action required — review vendor offers',
    poCreated: 'Purchase Order has been created',
    rejectionReason: 'Rejection reason:',
    submitBtn: 'Submit',
    cancelBtn: 'Cancel',
    cancelDialogTitle: 'Cancel RFQ?',
    cancelDialogBodyPost: 'will be cancelled. This action cannot be undone.',
    cancelDialogNo: 'No, Go Back',
    cancelDialogYes: 'Yes, Cancel',
    rfqStatusDraft: 'Draft',
    rfqStatusSubmitted: 'Submitted',
    rfqStatusQuoting: 'Seeking Quotes',
    rfqStatusQuoted: 'Quotes Received',
    rfqStatusCustomerReview: 'Awaiting Your Approval',
    rfqStatusAwarded: 'PO Created',
    rfqStatusCancelled: 'Cancelled',
    rfqStatusExpired: 'Expired',
    approvalPending: 'Pending Approval',
    approvalApproved: 'Approved',
    approvalRejected: 'Rejected',
    submitSuccess: 'تم إرسال طلب عرض الأسعار بنجاح',
    cancelSuccess: 'تم إلغاء طلب عرض الأسعار بنجاح',
  
    submitErrorFallback: 'فشل إرسال طلب الاقتباس',
    cancelErrorFallback: 'فشل إلغاء طلب الاقتباس',
  },
  mktPurchaseOrders: {
    pageTitle: 'أوامر الشراء',
    pageDesc: 'تابع حالة جميع أوامر الشراء في السوق',
    viewRfqs: 'عرض طلبات عروض الأسعار',
    searchPlaceholder: 'ابحث عن رقم أمر الشراء، الطلب، المورد…',
    filterLabel: 'تصفية:',
    allStatus: 'جميع الحالات',
    allVendors: 'جميع الموردين',
    allDates: 'جميع التواريخ',
    last7Days: 'آخر 7 أيام',
    last30Days: 'آخر 30 يوماً',
    last90Days: 'آخر 90 يوماً',
    fetchError: 'فشل تحميل أوامر الشراء.',
    retry: 'إعادة المحاولة',
    emptyPo: 'لا توجد أوامر شراء.',
    noMatchingPo: 'لا يوجد أمر شراء يطابق المرشح.',
    resetFilter: 'إعادة تعيين المرشح',
    colPoNumber: 'رقم أمر الشراء',
    colVendor: 'المورد',
    colStatus: 'الحالة',
    colEstCompletion: 'الإتمام المتوقع',
    colCreatedAt: 'تاريخ الإنشاء',
    statusPending: 'قيد الانتظار',
    statusDraft: 'مسودة',
    statusIssued: 'صادر',
    statusVendorAccepted: 'قبله المورد',
    statusVendorRejected: 'رفضه المورد',
    statusProduction: 'قيد الإنتاج',
    statusReadyToShip: 'جاهز للشحن',
    statusInTransit: 'في الطريق',
    statusDelivered: 'تم التسليم',
    statusCompleted: 'مكتمل',
    statusCancelled: 'ملغى',
      showingCount: 'Showing {current} of {total} purchase orders',
    statusRevisionRequested: 'Revision Requested',
    statusClosed: 'Closed',
    statusPartiallyDelivered: 'Partially Delivered',
    statusRejectedGoods: 'Goods Rejected',
  
    rfqPrefix: 'RFQ: ',
  },
  oceanFreight: {
    heroTitle: 'شحن بحري دولي موثوق',
    heroSub: 'FCL وLCL والشحن المبرد وشحن المشاريع إلى أكثر من 150 ميناءً حول العالم.',
    getQuote: 'احصل على عرض سعر',
    trackCargo: 'تتبع الشحنة',
    serviceOptions: 'خيارات الخدمة',
    fclTitle: 'FCL (حاوية كاملة)',
    fclDesc: 'حاوية كاملة للشحنات الكبيرة. أكثر اقتصادية لكل وحدة وآمنة.',
    lclTitle: 'LCL (شحن مجمّع)',
    lclDesc: 'الدفع حسب الحجم. مثالي للشحنات الصغيرة.',
    containerFleet: 'أسطول الحاويات',
    popularRoutes: 'المسارات الشائعة',
    whyChooseUs: 'لماذا تختارنا؟',
    processSteps: 'عملية الشحن',
    ctaTitle: 'هل أنت مستعد لشحن بضاعتك؟',
    originCity: 'مدينة المنشأ',
    destCity: 'مدينة الوجهة',
    shipmentType: 'نوع الشحنة',
    containerQty: 'عدد الحاويات',
    grossWeight: 'الوزن الإجمالي (كجم)',
    commodity: 'السلعة',
    additionalSvc: 'خدمات إضافية',
    customsClearance: 'تخليص جمركي',
    inlandTruck: 'شحن داخلي',
    insurance: 'تأمين الشحن',
    calculateEstimate: 'احسب التقدير',
    inquirySent: 'تم إرسال الاستفسار!',
    orderNo: 'رقم الطلب',
    estimateNotice: 'هذا تقدير أولي. يتم تأكيد السعر النهائي بعد التحقق من قبل المسؤول.',
    bookNow: 'احجز الآن',
    loadingQuotes: 'جارٍ تحميل عروض الأسعار...',
    noVendors: 'لا يوجد موردون متاحون حتى الآن',
    selectVendorFirst: 'يرجى تحديد مورد أولاً',
    submitOrder: 'إرسال الطلب',
    detailShipment: 'تفاصيل الشحنة',
    summaryTitle: 'ملخص الطلب',
    totalEstimate: 'إجمالي التقدير',
    confirmOrder: 'تأكيد الطلب',
    cancelOrder: 'إلغاء',
    successTitle: 'تم الطلب بنجاح!',
    errorSubmit: 'فشل إرسال الطلب',
    heroLine1: 'الشحن البحري',
    heroAccent: 'الدولي',
    heroLine2: 'الموثوق',
    heroSubFull: 'حاويات كاملة ومشتركة وثلاجات وشحن مشاريع إلى أكثر من 150 ميناء حول العالم. احصل على تقديرات فورية للأسعار ودعم توثيقي متكامل.',
    statPorts: 'موانئ الوجهة',
    statPartner: 'شركاء شركات الشحن',
    statCargo: 'جميع أنواع البضائع',
    statSupport: 'الدعم التشغيلي',
    fclOrLcl: 'حاوية كاملة أم مشتركة؟',
    fclLclSubtext: 'نتعامل مع كلا نوعي البضائع بأسعار تنافسية وتناول احترافي.',
    fclDescFull: 'حاوية كاملة للشحنات الكبيرة. أقتصادي للوحدة وآمن لعدم خلط البضائع.',
    fclFeature1: 'مثالي للبضائع ≥10 م³',
    fclFeature2: 'أكثر أماناً — لا خلط للبضائع',
    fclFeature3: 'وقت عبور أسرع',
    fclFeature4: '20 قدم، 40 قدم، 40HC، مبرد، مفتوح القمة',
    fclBtn: 'فحص تقدير الحاوية الكاملة →',
    lclDescFull: 'ادفع حسب الحجم. مناسب للشحنات الصغيرة التي لا تملأ حاوية كاملة.',
    lclFeature1: 'مثالي للبضائع <10 م³',
    lclFeature2: 'دفع حسب م³ / الوزن',
    lclFeature3: 'توحيد مع بضائع أخرى',
    lclFeature4: 'مرن للشركات الصغيرة والناشئة',
    lclBtn: 'فحص تقدير الحاوية المشتركة →',
    containerTitle: 'خيارات الحاويات',
    container20ftDesc: 'حاوية قياسية متعددة الأغراض',
    container40ftDesc: 'سعة كبيرة للحجم العالي',
    container40hcDesc: 'ارتفاع إضافي للبضائع الكبيرة',
    containerRef20Desc: 'مبردة للبضائع الحساسة',
    containerRef40Desc: 'مبردة ذات سعة كبيرة',
    containerOpenDesc: 'للبضائع العالية',
    containerFlatDesc: 'للآلات وبضائع المشاريع',
    routesTitle: 'أبرز مسارات التصدير والاستيراد',
    routesNote: 'وقت العبور تقديري وقد يتغير وفق جدول الناقل.',
    ourAdvantage: 'مزايانا',
    feat1Title: 'شبكة عالمية',
    feat1Desc: 'أكثر من 150 ميناء حول العالم، أكثر من 20 شريك شحن',
    feat2Desc: 'حماية كاملة للبضائع من ميناء المنشأ إلى الوجهة',
    feat3Title: 'توثيق متكامل',
    feat3Desc: 'بوليصة الشحن، قائمة التعبئة، شهادة المنشأ، MSDS وجميع وثائق الاستيراد والتصدير',
    feat4Desc: 'الاستلام والتسليم إلى بابك، بما في ذلك التخليص الجمركي',
    feat5Desc: 'تتبع شحنتك في أي وقت عبر بوابة التتبع',
    feat6Title: 'أسعار تنافسية',
    feat6Desc: 'تفاوض مباشر مع الناقلين للحصول على أفضل الأسعار',
    workflowLabel: 'سير العمل',
    step1Title: 'الاستشارة',
    step1Desc: 'أخبر فريقنا باحتياجات الشحن لديك',
    step2Desc: 'نرسل لك تقدير التكلفة وخيارات الناقلين',
    step3Desc: 'التأكيد ومعالجة الوثائق الكاملة',
    step4Title: 'الشحن',
    step4Desc: 'يُشحن البضاعة ويُتابع حتى وصوله إلى الوجهة',
    ctaSubtitle: 'احصل على تقدير فوري للسعر لمسار وجهتك. فريقنا على استعداد للمساعدة 24/7.',
    ctaBtn: 'اطلب عرض سعر الآن',
    ctaWa: 'التواصل عبر واتساب',
    successDesc: 'تم إرسال طلب عرض أسعار الشحن البحري. سيرسل فريقنا السعر النهائي بعد تأكيد شركة الشحن / الشريك.',
    backToHome: 'العودة إلى الرئيسية',
    yourData: 'بياناتك',
    customerNameLabel: 'الاسم',
    customerNamePlaceholder: 'الاسم الكامل',
    customerPhoneLabel: 'رقم الهاتف / واتساب',
    customerCompanyLabel: 'الشركة',
    customerNotesLabel: 'ملاحظات إضافية',
    customerNotesPlaceholder: 'تعليمات خاصة...',
    goBack: 'رجوع',
    sending: 'جاري الإرسال...',
    koliQty: 'عدد الطرود',
    containerFinalNote: 'التفاصيل النهائية وفقاً لتأكيد الناقل.',
    lclCargo: 'LCL Cargo',
    lclCargoSub: 'Less than Container Load',
    lclRateNote: 'السعر بناءً على CBM المشغول',
    checkEstimate: 'احسب التقدير',
    calculating: 'جاري الحساب...',
    estimateResults: 'نتائج التقدير',
    recalculate: 'إعادة الحساب',
    noRate: 'لا يوجد سعر متاح لهذا المسار',
    noRateHint: 'يرجى تقديم استفسار للحصول على عرض سعر يدوي من فريقنا.',
    requestManual: 'طلب عرض سعر يدوي',
    initialEstimate: 'التقدير الأولي',
    dayUnit: 'يوم',
    validUntil: 'صالح حتى',
    selectEstimate: 'اختر هذا التقدير',
    estimateNoticeShort: 'هذا تقدير أولي. السعر النهائي يُؤكَّد بعد حصول الإدارة/المورد على تأكيد من شركة الشحن/الشريك.',
    estimateNoticeFull: 'هذا تقدير أولي. السعر النهائي يُؤكَّد بعد حصول الإدارة/المورد على تأكيد من شركة الشحن، NVOCC، co-loader، أو الشريك.',
    breakdownTitle: 'تفاصيل التقدير',
    totalBreakdown: 'إجمالي التقدير',
    custNameRequired: 'اسم العميل مطلوب',
    hsCodeOptional: 'HS Code (اختياري)',
    requestFinalQuote: 'طلب عرض السعر النهائي',
  },
  productOrderTrack: {
    pageTitle: 'تتبع طلب المنتج',
    orderNo: 'رقم الطلب',
    status: 'الحالة',
    noTracking: 'لم يتم العثور على بيانات',
    trackBtn: 'تتبع',
    searchPlaceholder: 'أدخل رقم الطلب...',
  },
  truckingPage: {
    pageTitle: 'خدمات النقل بالشاحنات',
    heroSub: 'توصيل بري موثوق ومنتظم إلى جميع المناطق.',
    kembali: 'رجوع',
    armadaTersedia: 'الأسطول متاح',
    lokasi: 'الموقع',
    mulaiDari: 'ابتداءً من',
    profilArmada: 'ملف الأسطول',
    tentangArmada: 'عن {name}',
    jaminanEnterprise: 'ضماناتنا للمؤسسات',
    cekOngkir: 'احسب تكلفة الشحن',
    orderBerhasil: 'تم إنشاء الطلب بنجاح!',
    nomorOrder: 'رقم الطلب',
    dimensiNote: 'الأبعاد متوسطات لفئة المركبة. قد تكون هناك اختلافات بين الوحدات.',
    totalEstimasi: 'إجمالي التقدير',
    shippingCalc: 'حاسبة الشحن',
    availableFleet: 'الأسطول المتاح',
    bestFor: 'الأنسب لـ',
    advantages: 'المزايا',
    pickupSection: 'الاستلام',
    deliverySection: 'التوصيل',
    pickupAddress: 'عنوان الاستلام',
    deliveryAddress: 'عنوان التوصيل',
    pickupSchedule: 'جدول الاستلام',
    now: 'الآن',
    later: 'لاحقاً',
    itemDetail: 'تفاصيل العنصر',
    itemType: 'نوع العنصر',
    weight: 'الوزن (كجم)',
    tripQty: 'عدد الرحلات',
    addons: 'خدمات إضافية',
    loadingService: 'خدمة التحميل',
    unloadingService: 'خدمة التفريغ',
    overnight: 'المبيت',
    helper: 'مساعد',
    flowSection: 'سير التوصيل',
    standardService: 'الخدمة المعيارية',
    estimateCost: 'تقدير التكلفة',
    fillToCalculate: 'أدخل تفاصيل الشحن لحساب تقدير التكلفة',
    vehicleSelect: 'اختر المركبة',
    noVendors: 'لا يوجد موردون متاحون حتى الآن',
    orderSent: 'تم إرسال الطلب!',
    submitOrder: 'اطلب الآن',
    servicePackage: 'حزمة الخدمة',
    techSpec: 'المواصفات الفنية',
    jasaLayanan: 'الخدمات والحلول',
    encrypted: 'مشفّر',
    verified: 'موثّق',
    freeConsult: 'استشارة مجانية',
    chatSalesWa: 'تواصل مع المبيعات عبر واتساب',
    orderVehicle: 'اطلب {name}',
    orderTrucking: 'اطلب خدمة الشحن الآن',
    allVerified: 'شركاء موثّقون 100%',
    encryptedTx: 'معاملات مشفّرة',
    fleetVerified: 'أسطول موثّق',
    strictInspection: 'جميع الوحدات تجتاز الفحص الصارم',
    rating: 'التقييم 4.9/5',
    fleet100: '100% أسطول',
    armadaAktif: 'Active Fleet',
    jasaTrucking: 'Trucking Service',
    perTrip: 'Per Trip',
    sewaHarian: 'Daily Rental',
    perHariTermasuk: '/ day \u00B7 includes driver & fuel',
    sudahTermasuk: 'Included',
    bisniAktif: 'Active Businesses',
    pengirimanStat: 'Deliveries',
    ratingRataRata: 'Avg. Rating',
    onTimeRate: 'On-Time Rate',
    klienAktifStat: 'Active Clients',
    pengirimanStatShort: '50,000+ deliveries',
    cargoInsurance: 'Cargo Insurance Included',
    gpsTracking: 'Real-time GPS Tracking',
    enterpriseSolusi: 'Enterprise Logistics Solution',
    enterpriseTitle: 'Need a Bigger Scale?',
    enterpriseSub: 'Discuss your enterprise shipping needs with our logistics specialists. Volume discounts, dedicated fleet, and custom SLAs available.',
    requestPenawaran: 'Request a Quote',
    chatWhatsApp: 'Chat on WhatsApp',
    perusahaanAktifSub: 'active companies',
    areaPickup: 'Pickup Area',
    picPickup: 'Pickup PIC Name',
    hpPickup: 'Pickup Phone',
    areaDelivery: 'Delivery Area',
    picReceiver: 'Receiver Name',
    hpReceiver: 'Receiver Phone',
    pickupNow: 'Pickup Now',
    pickupLater: 'Schedule Later',
    pickupDate: 'Pickup Date',
    pickupTime: 'Pickup Time',
    beratKg: 'Item Weight (kg)',
    jumlahKoli: 'No. of Packages',
    volumeOpsional: 'Volume (m\u00B3) \u2014 optional',
    catatanKhusus: 'Special Notes',
    minimalTrip: 'Min. 1 trip \u00B7 {name}',
    vendorHargaTermurah: 'vendor \u00B7 best price',
    inclVehicle: 'Vehicle of your choice',
    inclCargo: 'Exclusive cargo space',
    inclDriver: 'Experienced driver',
    inclFuel: 'Fuel included',
    inclWait: 'Free 6-hour waiting',
    inclInsurance: 'Basic cargo insurance',
    tambahanOpsional: 'Optional Add-ons',
    perTripSuffix: '/ رحلة',
    prosesPemesanan: 'عملية الطلب',
    step1Desc: 'اختر المركبة التي تناسب احتياجات الشحن الخاصة بك',
    step2Desc: 'احسب تكلفة الشحن التقديرية باستخدام حاسبة الشحن لدينا',
    step3Desc: 'أكمل نموذج الحجز بتفاصيل الشحن الكاملة',
    step4Desc: 'راقب حالة الشحنة في الوقت الفعلي عبر GPS',
    guarArmadaLabel: 'أسطول مفتش',
    guarArmadaDesc: 'جميع المركبات اجتازت الفحص والصيانة الدورية',
    guarSopirLabel: 'سائق مرخص',
    guarSopirDesc: 'سائقون ذوو خبرة ومرخصون لكل مركبة',
    guarGpsLabel: 'GPS في الوقت الفعلي',
    guarGpsDesc: 'راقب موقع المركبة في الوقت الفعلي عبر نظام GPS',
    guarAsuransiLabel: 'تأمين البضائع',
    guarAsuransiDesc: 'تأمين البضائع القياسي مشمول في كل شحنة',
    guarSupportLabel: 'دعم 24 ساعة',
    guarSupportDesc: 'دعم العملاء متاح خلال ساعات العمل',
    guarResponsLabel: 'استجابة سريعة',
    guarResponsDesc: 'فريقنا على استعداد للرد على الاستفسارات في غضون 24 ساعة',
    phAreaPickup: 'اختر منطقة الأصل',
    phAddrPickup: 'العنوان الكامل لموقع الاستلام',
    phPicPickup: 'اسم جهة الاتصال في موقع الاستلام',
    phAreaDelivery: 'اختر منطقة الوجهة',
    phAddrDelivery: 'العنوان الكامل لوجهة التسليم',
    phPicReceiver: 'اسم جهة اتصال المستلم',
    phItemType: 'مثل: إلكترونيات، مستندات، ملابس',
    phBerat: 'مثل: 100',
    phKoli: 'مثل: 5',
    phVolume: 'مثل: 1.5',
    phCatatan: 'تعليمات خاصة، ملاحظات، إلخ.',
    addonsNote: 'ستؤثر الخدمات الإضافية على إجمالي السعر المقدر.',
    addonBantuanMuatLabel: 'مساعدة الشحن',
    addonBantuanBongkarLabel: 'مساعدة التفريغ',
    addonAsuransiLabel: 'تأمين',
    addonFerryLabel: 'عبارة / معبر',
    addonTolLabel: 'رسوم الطريق (التكلفة الفعلية)',
    addonMultiDropLabel: 'توصيل متعدد',
    addonUrgentLabel: 'توصيل عاجل',
    addonOvernightLabel: 'طوال الليل / يوم كامل',
    menghitungEstimasi: 'جارٍ حساب التقدير...',
    hitungEstimasi: 'حساب التقدير',
    menghitungHarga: 'جارٍ حساب أفضل سعر لك...',
    cobaLagi: 'حاول مجدداً',
    noVendorContact: 'اتصل بفريق مبيعاتنا للحصول على معلومات الموردين',
    rowEstKm: 'المسافة المقدرة',
    noteEstKota: 'المسافة المقدرة بين المدن',
    noteJarakTidak: 'المسافة غير معروفة',
    noteJarakAktual: 'المسافة الفعلية',
    rowTarifPerKm: 'التعرفة / كم',
    rowMinCharge: 'الحد الأدنى للرسوم',
    rowHargaDasar: 'السعر الأساسي',
    rowSurchargeKota: 'رسوم إضافية للمدينة',
    rowSurchargeProvinsi: 'رسوم إضافية للمنطقة',
    rowSurchargePulau: 'رسوم إضافية بين الجزر',
    rowBiayaMuat: 'رسوم الشحن',
    rowBiayaBongkar: 'رسوم التفريغ',
    rowFerry: 'رسوم العبارة',
    rowTol: 'رسوم الطريق',
    tolActualCost: 'التكلفة الفعلية',
    rowMultidrop: 'توصيل متعدد',
    rowOvernight: 'طوال الليل',
    rowAsuransi: 'تأمين',
    rowUrgent: 'عاجل',
    estimasiPpnNote: 'التقدير لا يشمل ضريبة القيمة المضافة 11%',
    estimasiHargaTrucking: 'تقدير سعر الشحن بالشاحنات',
    rowAreaPickup: 'منطقة الأصل',
    rowAreaDelivery: 'منطقة الوجهة',
    rowArmada: 'المركبة',
    mengirimPermintaan: 'جارٍ إرسال الطلب...',
    kirimTanpaEstimasi: 'إرسال بدون تقدير',
    mengirim: 'جارٍ الإرسال...',
    orderInfo: 'سيتواصل فريقنا معك قريباً',
    menungguAdmin: 'في انتظار تأكيد المسؤول',
    notifOperasional: 'تم إرسال الإشعار إلى WhatsApp الخاص بك',
    simpanNomor: 'احفظ رقم طلبك',
    estimasiDays: 'المقدر {days} أيام عمل',
    onTimeBadge: '99.2% في الوقت المحدد',
    onTimeRateBadge: '99.2% في الموعد',
    ratingBadge: 'تقييم',
    ratingValue: '4.9/5',
    step1Title:  'اختيار المركبة',
    step3Title:  'ملء النموذج',
    step4Title:  'تتبع الشحنة',
    adminReview: 'سيراجع المسؤول طلبك ويؤكده',
  },
  vendorDashboard: {
    pageTitle: 'لوحة تحكم المورد',
    catalogTitle: 'كتالوج المنتجات والخدمات',
    catalogDesc: 'أضف وعدّل وأدر منتجاتك/خدماتك في السوق',
    uploadPhotoHint: 'ارفع صوراً لكل منتج/خدمة لتظهر بشكل جذاب في السوق',
    addProduct: 'إضافة منتج',
    addService: 'إضافة خدمة',
    typeProduct: 'منتج',
    typeService: 'خدمة',
    cancelBtn: 'إلغاء',
    backToLogin: 'العودة إلى تسجيل الدخول',
    quotesTitle: 'عروض أسعاري',
    quotesDesc: 'جميع عروض الأسعار التي قدمتها',
    submissionsTitle: 'منتجاتي/خدماتي',
    submissionsDesc: 'المنتجات/الخدمات المقدمة لمراجعة المسؤول',
    notifTitle: 'الإشعارات',
    notifDesc: 'تحديثات متعلقة بحساب المورد والكتالوج',
    promoTitle: 'العروض الترويجية',
    promoDesc: 'اختر منتجات/خدمات وحزم ترويجية مناسبة',
    promoHistory: 'تاريخ وحالة جميع مقدماتك',
    statusDraft: 'مسودة',
    estPickup: 'الاستلام المتوقع',
    estDelivery: 'التوصيل المتوقع',
    maxFileHint: 'JPG وPNG وWebP · الحد الأقصى 20 ميغابايت',
    noItems: 'لا توجد عناصر في الكتالوج',
      etalaseSectionTitle: 'Storefront & Product Photos',
    uploadingShort: 'Uploading…',
    addPhotoBtn: 'Add',
    uploadFirstPhoto: 'Upload first photo',
    uploadingPhoto: 'Uploading photo…',
    primaryPhotoHint: '⭐ = primary photo (shown in marketplace). Manage all media in Catalog tab.',
    allItemsArchived: 'All items are archived',
    fieldNameLabel: 'Product / Service Name',
    fieldTypeLabel: 'Type',
    fieldCategoryLabel: 'Category',
    fieldDescLabel: 'Description',
    fieldPriceLabel: 'Price (IDR)',
    fieldUnitLabel: 'Unit',
    fieldMoqLabel: 'MOQ (Minimum Order)',
    fieldOriginLabel: 'Origin',
    fieldHsCodeLabel: 'HS Code',
    savingText: 'Saving…',
    saveChangesBtn: 'Save Changes',
    newProductLabel: 'New Product',
    manageCatalogTitle: 'Manage Product Catalog',
    noProductCTA: 'No products yet. Click "Add Product" to get started.',
    archiveConfirm: 'Archive "{name}"? The item will not appear in the marketplace.',
    featuredTitle: 'Featured Products',
    featuredSubtitle: 'Promote your products/services to stand out in the Marketplace',
    applyFeaturedTitle: 'Apply for Featured Product',
    noCatalogPublished: 'No published catalog items',
    allItemsInProgress: 'All active products are already submitted or in featured process',
    stepPickProduct: '1. Select Product / Service',
    stepPickPackage: '2. Select Promotion Package',
    noPackageAvailable: 'No packages available at this time',
    confirmSubmitTitle: 'Confirm Submission',
    confirmSubmitWith: 'with package',
    confirmSubmitStart: '— starting today',
    submitOkText: 'Submission sent successfully!',
    sendingText: 'Sending...',
    applyFeaturedBtn: 'Apply for Featured Product',
    featuredStatusTitle: 'Featured Product Submission Status',
    reloadBtn: 'Reload',
    noFeaturedSubmissions: 'No featured product submissions yet',
    packageLabel: 'Package:',
    submittedDateLabel: 'Submitted:',
    priceHeaderLabel: 'Price',
    periodSubmitted: 'Submitted Period',
    periodApproved: 'Approved Period',
    adminNoteLabel: 'Admin note:',
    uploadProofTitle: 'Upload Payment Proof',
    paymentRefPlaceholder: 'Payment reference (optional, e.g. transfer no.)',
    uploadingProgress: 'Uploading...',
    chooseFileUpload: 'Choose File & Upload',
    cancelFeaturedBtn: 'Cancel Submission',
    cancellingText: 'Cancelling...',
    welcomeMsg: 'Welcome, {name}',
    dashboardSubtitle: 'Monitor and send RFQ quotes directly here',
    pendingRfqAlert: '{count} RFQs pending reply',
    statRfqReceived: 'RFQs Received',
    statRfqTenderInvite: 'Total tender invitations',
    statQuotesSent: 'Quotes Sent',
    statQuotesSentDesc: 'Quotes already submitted',
    statFulfillPending: 'Fulfillment Pending',
    statFulfillPendingDesc: 'Order approved, not yet completed',
    statOrdersDone: 'Orders Completed',
    statOrdersDoneDesc: 'Successfully completed',
    supplierLinkedTitle: 'Account linked to vendor data',
    supplierLinkedDesc: 'Connected as: {name}',
    supplierNotLinkedTitle: 'Account not linked to vendor data',
    supplierNotLinkedDesc: 'Contact admin to link your account with email {email}.',
    supplierActiveLabel: 'Active',
    supplierInactiveLabel: 'Inactive',
    miniStatRfqOpen: 'Open RFQs',
    miniStatQuotesSent: 'Quotes Sent',
    miniStatQuotesChosen: 'Quotes Chosen',
    rfqIncomingTitle: 'Incoming RFQs',
    rfqIncomingDesc: 'Click "Send Quote" to submit your price directly',
    noRfqReceived: 'No RFQs received yet',
    repliedBadge: 'Replied',
    notRepliedBadge: 'Not replied',
    commodityLabel: 'Commodity:',
    cancelFormBtn: 'Cancel',
    reviseQuoteBtn: 'Revise',
    sendQuoteBtn: 'Send Quote',
    detailBtn: 'Detail',
    yourQuoteSection: 'Your Quote',
    quoteReviseTitle: 'Revise Quote',
    quoteSendTitle: 'Send Quote',
    quotePriceLabel: 'Quote Price (IDR)',
    etaPickupOptional: 'ETA Pickup (optional)',
    etaDeliveryOptional: 'ETA Delivery (optional)',
    notesOptional: 'Notes (optional)',
    sendingQuote: 'Sending...',
    updateQuoteBtn: 'Update Quote',
    quotesSentTitle: 'Quotes Sent',
    noQuoteYet: 'No quotes yet',
    sendQuoteCTA: 'Click "Send Quote" on an RFQ on the left',
    profileAccountTitle: 'Account Profile',
    howToTitle: 'How to send a quote:',
    howToStep1: '1. Click "Send Quote" on the RFQ you want to reply to',
    howToStep2: '2. Fill in price and details, then submit',
    howToStep3: '3. You can revise while the RFQ is still Open',
    logoutBtn: 'Logout',
    vendorPortalLabel: 'Vendor Portal',
    loadingDashboard: 'Loading vendor dashboard...',
    tabDashboard: 'Dashboard',
    tabProfile: 'Profile',
    tabCatalog: 'Catalog',
    tabNotifications: 'Notifications',
    tabFeatured: 'Featured Products',
    verificationTitle: 'Verification Status:',
    statusVerified: 'Verified',
    statusPendingReview: 'Pending Review',
    approvedOn: 'Approved on {date}',
    catalogLinkTitle: 'Catalog Upload Link',
    validUntilLabel: 'Valid until: {date}',
    profileNotAvailable: 'Vendor profile data not yet available',
    reloadBtnLabel: 'Reload',
    companyInfoSection: 'Company Information',
    picContactSection: 'PIC Contact',
    addressSection: 'Address',
    bankInfoSection: 'Bank Information',
    fieldCompanyName: 'Company Name',
    fieldLegalName: 'Legal Name',
    fieldNpwp: 'Tax ID (NPWP)',
    fieldServiceType: 'Service Type',
    fieldCompanyEmail: 'Company Email',
    fieldPhoneNumber: 'Phone Number',
    fieldPicName: 'PIC Name',
    fieldPicPhone: 'PIC Phone',
    fieldPicEmail: 'PIC Email',
    fieldAddress: 'Address',
    fieldCity: 'City',
    fieldProvince: 'Province',
    fieldPostalCode: 'Postal Code',
    fieldBank: 'Bank',
    fieldBankAccount: 'Account Number',
    fieldBankName: 'Account Name',
    catalogSubmissionTitle: 'Catalog Submission Status',
    noSubmissions: 'No catalog submissions yet',
    openSubmissionFormBtn: 'Open Submission Form',
    submittedDateLabel2: 'Submitted:',
    reviewDateLabel: 'Reviewed:',
    submissionRejectionNote: 'Reason:',
    markAllReadBtn: 'Mark All as Read',
    noNotifications: 'No notifications yet',
    featuredStatusPending: 'قيد الانتظار',
    featuredStatusApproved: 'معتمد',
    featuredStatusActive: 'نشط',
    featuredStatusRejected: 'مرفوض',
    featuredStatusExpired: 'منتهي الصلاحية',
    featuredStatusCancelled: 'ملغى',
    paymentUnpaid: 'غير مدفوع',
    paymentPendingVerif: 'قيد التحقق',
    paymentVerified: 'تم التحقق',
    paymentRejected: 'مرفوض',
    paymentRefunded: 'مسترد',
    quoteDetailStatusLabel: 'الحالة',
    quotePricePlaceholder: 'مثال: 5000000',
    etaPickupPlaceholder: 'مثال: يومان عمل',
    etaDeliveryPlaceholder: 'مثال: 5-7 أيام عمل',
    notesPlaceholder: 'الشروط أو المعلومات الإضافية...',
  
    quoteStatusPending: 'قيد الانتظار',
    quoteStatusApproved: 'محدد',
    quoteStatusRejected: 'مرفوض',
    rfqStatusOpen: 'مفتوح',
    rfqStatusClosed: 'مغلق',
    durationDaysUnit: 'أيام',
    rfqStatusAwarded: 'فائز',
    statusPublished: 'منشور',
    statusArchived: 'مؤرشف',
    publishBtn: 'نشر',
    unpublishBtn: 'إلغاء النشر',
    mediaPhotoLabel: 'صورة',
    mediaVideoLabel: 'فيديو',
    mediaDocumentLabel: 'مستند',
    mediaDocumentPdfLabel: 'مستند (PDF)',
    formNameRequired: 'اسم المنتج مطلوب',
    formAddError: 'فشل إضافة المنتج',
    formEditNameRequired: 'الاسم مطلوب',
    formSaveError: 'فشل الحفظ',
    mediaSaveError: 'فشل حفظ الوسائط',
    quoteFormPriceRequired: 'السعر مطلوب ويجب أن يكون أكبر من 0',
    quoteUpdatedMsg: 'تم تحديث العرض!',
    setPrimaryTitle: 'تعيين كصورة رئيسية',
    deleteTitle: 'حذف',
    quoteSentMsg: 'تم إرسال العرض بنجاح!',
    quoteSendError: 'فشل الإرسال',
  },

  jasaDetail: {
    calcTitle: 'حاسبة تقدير التكاليف',
    calcSubtitle: 'أدخل معاملات الخدمة للحصول على تقدير سعر',
    airAddQty: 'إضافة كمية أخرى',
    airCalcSummary: 'ملخص الحساب ({count} أنواع كمية):',
    truckStep1Label: 'تفاصيل الشحن',
    truckStep2Label: 'الأسطول والتأكيد',
    scheduleLabel: 'جدول الاستلام',
    orderNowLabel: 'اطلب الآن',
    orderNowDesc: 'الاستلام مجدول لليوم',
    activeLabel: 'نشط',
    dateLabel: 'التاريخ',
    timeLabel: 'الوقت',
    scheduleDisplay: 'الجدول: {date} الساعة {time}',
    senderLabel: 'معلومات المرسل',
    senderNameLabel: 'اسم المرسل',
    senderNamePlaceholder: 'الاسم الكامل للمرسل',
    senderPhoneLabel: 'رقم هاتف المرسل',
    routeLabel: 'مسار التوصيل',
    originPlaceholder: 'مدينة المنشأ...',
    stopCityPlaceholder: 'مدينة المحطة {n}...',
    removeStop: 'إزالة المحطة',
    stopReceiverNameLabel: 'اسم المستلم في المحطة {n}',
    stopReceiverPhoneLabel: 'هاتف المستلم في المحطة {n}',
    destPlaceholder: 'مدينة الوجهة...',
    receiverNameLabel: 'اسم المستلم',
    receiverPhoneLabel: 'رقم هاتف المستلم',
    receiverNamePlaceholder: 'اسم المستلم',
    optimizeRouteDesc: 'ترتيب المحطات لجعل الرحلة أكثر كفاءة.',
    distanceEstLabel: 'المسافة المقدرة',
    calculatingLabel: 'جارٍ الحساب...',
    autoLabel: '✓ تلقائي',
    cargoLabel: 'معلومات البضائع',
    cargoCategoryLabel: 'فئة البضائع',
    koliQtyLabel: 'عدد الطرود',
    dimensionsLabel: 'الأبعاد والحجم',
    totalVolumeLabel: 'الحجم الكلي / المكعب',
    addDimension: 'إضافة بُعد',
    notesPlaceholder: 'ملاحظات إضافية حول البضائع أو التعامل أو التعليمات الخاصة...',
    uploadPhotoLabel: 'رفع صور البضائع',
    photoCount: '{n}/5 صور',
    photoPickerHint: 'اختر صوراً (jpg, jpeg, png, webp) · بحد أقصى 5 صور',
    paymentLabel: 'نوع الدفع',
    transferDesc: 'الدفع عبر تحويل بنكي',
    gatewayDesc: 'الدفع عبر بوابة إلكترونية',
    selectTransferLabel: 'اختر نوع التحويل',
    fullPayDesc: 'دفع كامل',
    terminDesc: 'أقساط دورية',
    dpDesc: 'دفعة مقدمة',
    terminPeriodLabel: 'فترة الأقساط',
    nextPaymentLabel: 'التسوية التالية',
    afterDelivery: 'بعد التسليم',
    net30Days: 'صافي 30 يوماً',
    net60Days: 'صافي 60 يوماً',
    installments: 'أقساط متدرجة',
    orderSummaryLabel: 'ملخص الطلب',
    summarySchedule: 'الجدول',
    summaryNow: 'الآن',
    summaryRoute: 'المسار',
    summaryDistance: 'المسافة',
    summaryCategory: 'الفئة',
    summaryCargo: 'البضائع',
    summaryPhoto: 'الصور',
    photoUploaded: '{n} صور مرفوعة',
    summaryPayment: 'الدفع',
    payTransferFull: 'تحويل · دفع كامل',
    payTransferTermin: 'تحويل · قسط {term}',
    payTransferDp: 'تحويل · دفعة مقدمة',
    payTransfer: 'تحويل',
    recommended: 'موصى به',
    notSuitable: 'غير مناسب',
    distanceKmLabel: 'المسافة (km)',
    costBreakdownLabel: 'تفاصيل التكاليف',
    totalEstLabel: 'إجمالي التقدير',
    fillRateHint: 'أدخل السعر/km والمسافة لعرض تقدير التكاليف.',
    addedToCartMsg: 'تمت إضافة {name} إلى الطلب بنجاح!',
    estimatedSubtotal: 'المجموع الفرعي المقدر',
    estimatedSubtotalNote: 'السعر المقدر · مؤكد من فريق CST',
    addToOrderBtn: 'إضافة إلى الطلب',
    addedToCartConfirm: 'تمت إضافة {name} إلى الطلب بنجاح',
    recalcBtn: 'إعادة الحساب',
    proceedBtn: 'المتابعة للحجز',
    sidebarInfoLabel: 'معلومات الخدمة',
    sidebarTruckingNote: 'بناءً على حساب المسافة والأسطول',
    availableLabel: '● متاح',
    vehicleLabel: 'المركبة',
    distanceLabel: 'المسافة',
    viewCartBtn: 'عرض سلة الطلبات',
    whyUsLabel: 'لماذا B2B Marketplace and Logistic؟',
    trustBadge1: 'مرخص ومسجل رسمياً',
    trustBadge2: 'استجابة سريعة واحترافية',
    trustBadge3: 'بضائع آمنة ومحمية',
    trustBadge4: 'دعم WhatsApp 24/7',
    relatedServicesLabel: 'خدمات {category} أخرى',
    viewAllServices: 'عرض جميع الخدمات',
    backBtn: '← رجوع',
    nextBtn: 'التالي',
    pendingOrderTitle: 'تم اختيار هذه الخدمة للتوصيل',
    pendingOrderLabel: 'الطلب:',
    pendingOrderAdded: 'تمت إضافة الخدمة. انقر على تأكيد للمتابعة.',
    pendingOrderHint: 'انقر على "إضافة إلى الطلب" أولاً.',
    confirmOrderBtn: 'تأكيد ومتابعة الطلب',
    cancelBtn: 'إلغاء',
    toastAddServiceFirst: 'أضف الخدمة إلى الطلب أولاً',
    toastAddServiceDesc: 'انقر على زر "إضافة إلى الطلب" قبل المتابعة.',
    toastAutoDistance: 'المسافة التلقائية: {km} km',
    toastDistanceFail: 'فشل حساب المسافة',
    toastDistanceFailDesc: 'أدخل المسافة يدوياً',
    toastNoDate: 'اختر تاريخ الاستلام',
    toastDatePast: 'لا يمكن أن يكون تاريخ الاستلام قبل اليوم',
    toastNoTime: 'اختر وقت الاستلام',
    toastNoSenderName: 'أدخل اسم المرسل',
    toastNoSenderPhone: 'أدخل رقم هاتف المرسل',
    toastNoOrigin: 'أدخل مدينة المنشأ',
    toastNoDest: 'أدخل مدينة الوجهة',
    toastNoReceiverName: 'أدخل اسم المستلم',
    toastNoReceiverPhone: 'أدخل رقم هاتف المستلم',
    toastNoStopReceiverName: 'أدخل اسم المستلم في المحطة {n}',
    toastNoStopReceiverPhone: 'أدخل هاتف المستلم في المحطة {n}',
    toastNoCargo: 'اختر فئة البضائع (مطلوب)',
    toastNoKoli: 'يجب ملء عدد الطرود (> 0)',
    toastNoWeight: 'يجب ملء الوزن الإجمالي (> 0)',
    toastNoPhoto: 'ارفع صورة بضائع واحدة على الأقل (مطلوب)',
    toastNoPayment: 'اختر نوع الدفع (مطلوب)',
    toastNoTransferType: 'اختر نوع التحويل (دفع كامل أو أقساط أو دفعة مقدمة)',
    toastFillCalc: 'أدخل بيانات الحاسبة أولاً',
    toastNoVehicle: 'اختر الأسطول أولاً',
    toastAddedToCart: 'تمت إضافة {name} إلى سلة الطلبات!',
    toastRouteOptimized: 'تم تحسين المسار',
    toastRouteOptimizedDesc: 'تم إعادة ترتيب المحطات تلقائياً.',
  
    destAirport: 'مطار الوجهة',
    grossWeightKg: 'الوزن الإجمالي (كغ)',
    quantityPcs: 'الكمية (قطعة)',
    lengthCm: 'الطول (سم)',
    widthCm: 'العرض (سم)',
    heightCm: 'الارتفاع (سم)',
    volWeight: 'الوزن الحجمي',
    chargeable: 'القابل للشحن',
    ratePerKg: 'السعر/كغ (IDR)',
    totalVolWeight: 'إجمالي الوزن الحجمي',
    totalChargeableWeight: 'إجمالي الوزن القابل',
    originPort: 'ميناء المنشأ',
    destPort: 'ميناء الوجهة',
    containerType: 'نوع الحاوية',
    selectContainer: 'اختر الحاوية',
    freightRate: 'سعر الشحن (IDR)',
    handlingFeeIDR: 'رسوم المناولة (IDR)',
    weightKg: 'الوزن (كغ)',
    ratePerCbm: 'السعر/CBM (IDR)',
    minimumCharge: 'الحد الأدنى (IDR)',
    customsFeeIDR: 'رسوم الجمارك (IDR)',
    documentFeeIDR: 'رسوم الوثائق (IDR)',
    pibPebFee: 'رسوم PIB/PEB (IDR)',
    permitFeeIDR: 'رسوم التصريح (IDR)',
    addStop: 'إضافة توقف',
    optimizeRoute: 'تحسين المسار',
    ratePerKmIDR: 'السعر/كم (IDR)',
    adminVerified: '✓ إدارة',
    loadingFeeIDR: 'رسوم التحميل (IDR)',
    loadingFeeLabel: 'رسوم التحميل',
    numDays: 'عدد الأيام',
    unitLabel: 'الوحدة',
    selectUnit: 'اختر الوحدة',
    ratePerDayIDR: 'السعر/يوم (IDR)',
    documentType: 'نوع الوثيقة',
    feePerDocIDR: 'رسوم لكل وثيقة (IDR)',
    serviceFeeIDR: 'رسوم الخدمة (IDR)',
    adminFeeIDR: 'رسوم الإدارة (IDR)',
    serviceName: 'اسم الخدمة',
    unitPriceIDR: 'سعر الوحدة (IDR)',
    quotation: 'تفاوض / عرض سعر',
  },

  portalDokumen: {
    title: "الوثائق",
    subtitle: "فواتيرك التجارية ووثائق معاملاتك",
    searchPlaceholder: "البحث برقم الوثيقة أو الطلب...",
    viewAllOrders: "عرض جميع الطلبات",
    transactionDocs: "وثائق المعاملات",
    documentsCount: "{n} وثيقة",
    orderRef: "الطلب: {number}",
    dueDateLabel: "تاريخ الاستحقاق",
    noMatchDocs: "لا توجد وثائق مطابقة",
    clearSearch: "مسح البحث",
    emptyTitle: "لا توجد وثائق بعد",
    emptyDesc: "ستظهر وثائق المعاملات هنا بعد تأكيد طلبك.",
    viewMyOrders: "عرض طلباتي",
    logisticDocsTitle: "وثائق من فريق اللوجستيات",
    logisticDocsDesc: "يتم إرسال الوثائق المذكورة أعلاه مباشرةً من الفريق التشغيلي عبر WhatsApp أو البريد الإلكتروني وفقاً لتقدم الشحنة.",
    detailBtn: "تفاصيل",
  },

  portalInvoice: {
    title: "الفاتورة والدفع",
    subtitle: "سجل فوترتك وحالة الدفع",
    totalUnpaid: "إجمالي غير المدفوع",
    invoiceList: "قائمة الفواتير",
    payBtn: "دفع",
    emptyTitle: "لا توجد فواتير بعد",
    emptyDesc: "ستظهر الفواتير هنا بعد تأكيد طلبك وجاهزيته للفوترة.",
    viewShipments: "عرض شحناتي",
    orderRef: "الطلب: {number}",
    dueDateLabel: "تاريخ الاستحقاق",
    paymentLink: "رابط الدفع",
  },


  oceanFreightBooking: {
    optionEconomy: 'اقتصادي',
    optionEconomyDesc: 'أفضل سعر',
    optionStandard: 'قياسي',
    optionStandardDesc: 'توازن بين السعر والوقت',
    optionPriority: 'أولوية',
    optionPriorityDesc: 'أسرع عبور',
    errorFillPorts: 'يرجى ملء ميناء المنشأ والوجهة',
    errorSelectContainer: 'يرجى اختيار نوع الحاوية',
    errorFillCbm: 'يرجى ملء CBM أو الوزن الإجمالي',
    errorNameRequired: 'الاسم مطلوب',
    errorContactRequired: 'الهاتف أو البريد الإلكتروني مطلوب',
    successTitle: 'تم إرسال الاستفسار!',
    successDesc: 'سيؤكد فريقنا العرض النهائي ويتصل بك قريباً.',
    orderNumberLabel: 'رقم الطلب',
    orderAgain: 'طلب جديد',
    backToEstimate: 'العودة إلى التقدير',
    senderTitle: 'تفاصيل المرسل',
    contactInfo: 'معلومات الاتصال',
    fullName: 'الاسم الكامل *',
    phoneWa: 'الهاتف / واتساب *',
    email: 'البريد الإلكتروني',
    company: 'الشركة',
    targetEtd: 'تاريخ الشحن المستهدف',
    commodity: 'السلعة',
    confirmNote: 'سيتصل بك فريقنا لتأكيد السعر النهائي خلال 1×24 ساعة عمل.',
    sending: 'جار الإرسال...',
    submitInquiry: 'إرسال الاستفسار',
    changeSearch: 'تغيير البحث',
    resultsTitle: 'تقدير الشحن البحري',
    noRatesTitle: 'لا توجد أسعار متاحة',
    noRatesDesc: 'ليس لدينا أسعار لهذا المسار حتى الآن. سيجد فريقنا أفضل عرض لك.',
    requestManualQuote: 'طلب عرض يدوي',
    daysTransit: 'يوم عبور',
    estimate: 'تقدير',
    fixedPrice: 'سعر ثابت',
    hideBreakdown: 'إخفاء',
    showBreakdown: 'عرض',
    breakdownTitle: 'تفاصيل التكلفة',
    docCharges: 'رسوم المستندات',
    totalEstimate: 'إجمالي التقدير',
    requestManual: 'طلب يدوي',
    requestFinal: 'طلب عرض نهائي',
    priceNote: 'تقدير أولي — يتم تأكيد السعر النهائي بعد الحصول على الأسعار من شركة الشحن.',
    back: 'رجوع',
    subtitle: 'شحن بحري FCL & LCL',
    shippingRoute: 'مسار الشحن',
    selectPort: 'اختر الميناء...',
    cargoType: 'نوع البضاعة',
    containerQty: 'عدد الحاويات',
    grossWeightKg: 'الوزن الإجمالي (كجم)',
    colliCount: 'عدد الكولي',
    cargoCondition: 'حالة البضاعة',
    additionalServices: 'خدمات إضافية',
    additionalServicesHint: 'اختر الخدمات المطلوبة (اختياري)',
    calculating: 'جار الحساب...',
    checkPrice: 'تحقق من تقدير السعر',
    fclFull: 'FCL — حاوية كاملة',
    lclLess: 'LCL — حاوية جزئية',
  
    tracking: 'التتبع',
    titleOceanFreight: 'الشحن البحري',
    labelOriginPort: 'ميناء الشحن *',
    labelDestPort: 'ميناء الوصول *',
    labelTradeType: 'نوع التجارة',
    labelServiceMode: 'نوع الخدمة',
    labelContainerType: 'نوع الحاوية *',
    labelVolumeCbm: 'الحجم (م³)',
    transshipmentDirect: 'مباشر',
    transshipmentViaTS: 'عبر T/S',
    tradeTypeExport: 'تصدير',
    tradeTypeImport: 'استيراد',
    tradeTypeDomestic: 'محلي',
    tradeTypeCrossBorder: 'عبر الحدود',
    serviceModePortPort: 'ميناء إلى ميناء',
    serviceModeDoorPort: 'من الباب إلى الميناء',
    serviceModePortDoor: 'من الميناء إلى الباب',
    serviceModeDoorDoor: 'من الباب إلى الباب',
    cargoGeneral: 'بضائع عامة',
    cargoDG: 'بضائع خطرة',
    cargoReefer: 'مبرد',
    cargoFragile: 'هش',
    cargoOversize: 'بالغ الحجم',
    cargoHighValue: 'قيمة عالية',
    addonTruckingPickup: 'شحن بالشاحنة (استلام)',
    addonTruckingDelivery: 'شحن بالشاحنة (توصيل)',
    addonCustoms: 'التخليص الجمركي',
    addonInsurance: 'التأمين',
    addonFumigation: 'التبخير',
    addonCOO: 'شهادة المنشأ',
    addonWarehouse: 'معالجة المستودع',

    breakdownTHCOrigin: 'THC Origin',
    breakdownTHCDestination: 'THC Destination',
    breakdownTrucking: 'شحن بالشاحنة',
    breakdownCustomsClearance: 'التخليص الجمركي',
},
  orderStatusLabels: {
    "New Order": "طلب جديد",
    "Awaiting Payment": "في انتظار الدفع",
    "Paid": "مدفوع",
    "In Progress": "قيد التنفيذ",
    "Completed": "مكتمل",
    "Cancelled": "ملغى",
  },

  chooseOption: {
    loading: "جارٍ تحميل خيارات العرض...",
    invalidLink: "رابط غير صالح",
    linkExpired: "انتهت صلاحية الرابط أو لم يتم العثور عليه.",
    choiceMade: "تم قبول الاختيار!",
    youChose: "لقد اخترت",
    contactSoon: "سيتواصل معك فريقنا قريباً للخطوات التالية.",
    orderRef: "طلب",
    offerTitle: "العروض المتاحة لك",
    offerSubtitle: "اختر الخيار الأنسب لاحتياجاتك",
    routeLabel: "مسار الشحن",
    pickupLabel: "موعد الاستلام",
    unitType: "نوع المركبة",
    portAirport: "ميناء / مطار",
    etdEta: "تاريخ المغادرة / الوصول",
    commodity: "البضاعة",
    orderNo: "رقم الطلب",
    optionsCount: "خيارات متاحة",
    includedFees: "شامل جميع الرسوم",
    vehicleYear: "سنة المركبة",
    transitTime: "مدة النقل",
    days: "أيام",
    info: "معلومات",
    notes: "ملاحظات",
    processing: "جارٍ المعالجة...",
    choose: "اختر",
    confirmText: "بعد الاختيار، سيتواصل معك فريقنا للتأكيد النهائي.",
    priceNote: "السعر يشمل الضريبة والرسوم الإدارية.",
    failedChoice: "فشل في اختيار الخيار",
    invalidToken: "رمز غير صالح",
  },

  logisticTrackStatus: {
    statusOrderReceived: "تم استلام الطلب",
    statusAdminReview: "قيد مراجعة المسؤول",
    statusRfqSent: "جارٍ البحث عن مورد",
    statusQuoteReceived: "تم استلام عرض السعر",
    statusCustomerApproval: "في انتظار موافقتك",
    statusVendorConfirmed: "تأكيد المورد",
    statusVendorRejected: "رفض المورد",
    statusInProgress: "قيد التنفيذ",
    statusPickup: "جارٍ الاستلام",
    statusInTransit: "في الطريق",
    statusArrived: "وصل إلى الوجهة",
    statusDelivered: "تم التسليم",
    statusPodUploaded: "تم رفع إثبات التسليم",
    statusInvoiceIssued: "تم إصدار الفاتورة",
    statusPaymentReceived: "تم استلام الدفع",
    statusCompleted: "مكتمل",
    statusDone: "مكتمل",
    statusCancelled: "ملغى",
    statusNewOrder: "طلب جديد",
    statusUnderReview: "قيد المراجعة",
    statusQuotationSent: "تم إرسال عرض السعر",
    statusCustomerApproved: "وافق العميل",
    statusProcessing: "جارٍ المعالجة",
    stepOrderReceived: "استلام\nالطلب",
    stepAdminReview: "مراجعة\nالمسؤول",
    stepVendorConfirmed: "تأكيد\nالمورد",
    stepInProgress: "قيد التنفيذ",
    stepInTransit: "في\nالطريق",
    stepDelivered: "تم التسليم",
    stepPodUploaded: "رفع\nالإثبات",
    stepInvoiceIssued: "الفاتورة",
    stepCompleted: "مكتمل",
    stepLabelOrderReceived: "تم استلام الطلب",
    stepLabelAdminReview: "مراجعة المسؤول",
    stepLabelRfqSent: "إرسال طلب عرض سعر",
    stepLabelQuoteReceived: "استلام عرض السعر",
    stepLabelCustomerApproval: "الموافقة",
    stepLabelVendorConfirmed: "تأكيد المورد",
    stepLabelInProgress: "قيد التنفيذ",
    stepLabelPickup: "الاستلام",
    stepLabelInTransit: "في الطريق",
    stepLabelArrived: "وصل",
    stepLabelDelivered: "تم التسليم",
    stepLabelPodUploaded: "رفع POD",
    stepLabelInvoiceIssued: "الفاتورة",
    stepLabelPaymentReceived: "الدفع",
    stepLabelCompleted: "مكتمل",
    driverAssigned: "تم تعيين السائق",
    driverAccepted: "قبل السائق",
    driverOnWayPickup: "في الطريق للاستلام",
    driverArrivedPickup: "وصل لنقطة الاستلام",
    driverPickedUp: "تم استلام البضاعة",
    driverInTransit: "في الطريق",
    driverArrivedDest: "وصل إلى الوجهة",
    driverDelivered: "تم التسليم",
    driverCompleted: "مكتمل",
    payViaGateway: "الدفع عبر بوابة الدفع",
    preparingLink: "جارٍ إعداد رابط الدفع…",
    linkFailed: "فشل إنشاء رابط الدفع",
    retryBtn: "حاول مجدداً",
    orderNo: "رقم الطلب",
    totalBill: "إجمالي الفاتورة",
    validUntil: "صالح حتى",
    securedByPaylabs: "الدفع مؤمّن بواسطة Paylabs — يدعم التحويل البنكي، QRIS، المحافظ الإلكترونية والبطاقات.",
    payNow: "ادفع الآن",
    linkReused: "رابط الدفع السابق لا يزال نشطاً وتم إعادة استخدامه.",
    linkPending: "جارٍ إعداد رابط الدفع",
    linkPendingDesc: "سيرسل فريقنا رابط الدفع عبر WhatsApp/البريد الإلكتروني بعد تأكيد الطلب.",
    orderCancelled: "تم إلغاء الطلب",
    quoteApproved: "لقد وافقت على هذا العرض",
    quoteProcessingDesc: "سيعالج فريقنا شحنتك. السعر المتفق عليه:",
    quoteYourNotes: "ملاحظاتك:",
    quoteApprovedAt: "تم الموافقة في",
    quoteRejected: "لقد رفضت هذا العرض",
    quoteRejectedAt: "تم الرفض في",
    quoteRevisionRequested: "طلبت مراجعة",
    quoteRevisionAt: "تم الطلب في",
    quoteRevisionNotes: "ملاحظات المراجعة:",
    searchPlaceholder: "أدخل رقم الطلب…",
    trackBtn: "تتبع",
    verifPhoneTitle: "التحقق من الهاتف",
    verifPhoneDesc: "هذا الطلب محمي. أدخل آخر 4 أرقام من رقم هاتفك المسجل.",
    phoneLast4: "آخر 4 أرقام",
    phonePlaceholder: "مثال: 4321",
    verifBtn: "تحقق",
    verifError: "الرقم غير متطابق. حاول مجدداً.",
    notFound: "لم يتم العثور على الطلب",
    notFoundDesc: "يرجى التحقق من رقم الطلب والمحاولة مجدداً.",
    backToHome: "العودة للرئيسية",
    orderInfo: "معلومات الطلب",
    deliveryRoute: "مسار التسليم",
    customer: "العميل",
    orderDate: "تاريخ الطلب",
    totalAmount: "الإجمالي",
    invoiceLinks: "الفاتورة والدفع",
    invoiceNo: "رقم الفاتورة",
    dueDate: "تاريخ الاستحقاق",
    paymentStatus: "حالة الدفع",
    downloadInvoice: "تنزيل الفاتورة",
    progress: "تقدم الشحن",
    driverInfo: "معلومات السائق",
    driverStatus: "حالة السائق",
    podTitle: "إثبات التسليم (POD)",
    podReceiver: "المستلم",
    podNote: "ملاحظة",
    podSubmittedAt: "تم الإرسال في",
    podMap: "عرض على الخريطة",
    podStreetView: "عرض الشارع",
    updateHistory: "سجل التحديثات",
    noUpdates: "لا توجد تحديثات بعد",
    pushNotifEnable: "تفعيل الإشعارات",
    pushNotifDisable: "تعطيل الإشعارات",
    refreshBtn: "تحديث",
  },

  logisticOrderSuccess: {
    pageTitle: "تم إنشاء الطلب بنجاح!",
    heroSubGateway: "أكمل الدفع أدناه لتأكيد طلبك.",
    heroSubDefault: "سيتصل بك فريقنا قريباً للتأكيد والعرض النهائي.",
    orderNumber: "رقم الطلب",
    saveOrderNumber: "احفظ هذا الرقم لتتبع حالة طلبك",
    copyBtn: "نسخ",
    copySuccess: "تم النسخ",
    trackRealtime: "تتبع الطلب في الوقت الفعلي",
    trackDesc: "يتم تحديث الحالة تلقائياً — استخدم رقم الطلب",
    trackNow: "تتبع الآن",
    notifAuto: "إشعارات تلقائية",
    notifWillSend: "سيتم إرسالها إلى",
    notifAndWhatsapp: "وواتساب",
    notifOnChange: "عند تغيير حالة الطلب.",
    estimatedTime: "الوقت التقديري للتسليم",
    basedOnType: "بناءً على نوع الخدمة:",
    etaConfirmedByTeam: "يتم تأكيد التقدير الفعلي من قبل الفريق بعد المراجعة",
    reqDateLabel: "التاريخ المطلوب",
    detailShipment: "تفاصيل الشحن",
    origin: "المنشأ",
    destination: "الوجهة",
    company: "الشركة",
    pic: "المسؤول",
    serviceType: "نوع الخدمة",
    itemCount: "عدد الطرود",
    itemCountUnit: "طرد",
    serviceDetails: "تفاصيل الخدمة",
    commodity: "البضائع / السلع",
    priceFollowUp: "السعر لاحقاً",
    priceNego: "السعر قابل للتفاوض",
    subtotal: "المجموع الفرعي",
    totalEstimate: "الإجمالي التقديري",
    estimateNote: "هذا تقدير للسعر. سيتم تأكيد العرض النهائي من قبل فريقنا.",
    vendorPriceTitle: "سيتم تقديم السعر من قبل المورد",
    vendorPriceDesc: "سيرد المورد على طلبك بعرض سعر. سيتصل بك فريقنا قريباً.",
    uploadTransfer: "رفع إيصال التحويل",
    proofReceived: "تم استلام إثبات الدفع ✓",
    proofReceivedDesc: "سيتحقق فريقنا من دفعتك قريباً.",
    uploadInstruction: "ارفع لقطة شاشة أو صورة لإيصال التحويل لتسريع التحقق من الدفع.",
    uploading: "جارٍ الرفع…",
    chooseFile: "اختر ملفاً (JPG/PNG/PDF، بحد أقصى 10 ميجابايت)",
    trackOrder: "تتبع الطلب",
    seeOtherServices: "عرض خدمات أخرى",
    toDashboard: "إلى لوحة التحكم",
    seeServices: "عرض الخدمات",
    orderNotFound: "لم يتم العثور على بيانات الطلب.",
    orderFlow: "تدفق معالجة الطلب",
    stepReceived: "تم استلام الطلب",
    stepReceivedDesc: "سجّل النظام طلبك",
    stepReview: "مراجعة المشرف",
    stepReviewDesc: "فريقنا يتحقق من التفاصيل",
    stepVendor: "عرض المورد",
    stepVendorDesc: "المورد يُعدّ عرض السعر",
    stepShipping: "في الشحن",
    stepShippingDesc: "البضائع في الطريق",
    stepDone: "مكتمل",
    stepDoneDesc: "تم تنفيذ الطلب",
    stepNow: "الآن",
    etaTruck: "١ – ٣ أيام عمل",
    etaAir: "١ – ٥ أيام عمل",
    etaSea: "٧ – ٢١ يوماً (حسب المسار)",
    etaPpjk: "٢ – ٧ أيام عمل",
    etaDefault: "٣ – ٧ أيام عمل",
    payViaGateway: "الدفع عبر بوابة الدفع",
    preparingLink: "جارٍ تحضير رابط الدفع…",
    linkFailed: "فشل إنشاء رابط الدفع",
    retryBtn: "حاول مجدداً",
    orderNo: "رقم الطلب",
    totalBill: "إجمالي الفاتورة",
    validUntil: "صالح حتى",
    securedByPaylabs: "الدفع مؤمّن بواسطة Paylabs — يدعم التحويل البنكي وQRIS والمحافظ الإلكترونية والبطاقات.",
    payNow: "ادفع الآن",
    linkReused: "رابط الدفع السابق لا يزال نشطاً وتمت إعادة استخدامه.",
    linkPending: "رابط الدفع قيد الإعداد",
    linkPendingDesc: "سيرسل فريقنا رابط الدفع عبر واتساب/البريد الإلكتروني بعد تأكيد الطلب.",
  },


  customerOrder: {
    loading: 'جارٍ تحميل حالة الطلب...',
    notFound: 'الطلب غير موجود',
    priceSummary: 'ملخص السعر',
    origin: 'المنشأ',
    destination: 'الوجهة',
    orderDate: 'تاريخ الطلب',
    estimatedArrival: 'تقدير',
    productService: 'المنتج / الخدمة',
    truck: 'شاحنة',
    internal: 'داخلي',
    external: 'خارجي',
    total: 'الإجمالي',
    journeyHistory: 'سجل الشحن',
    noHistory: 'لا يوجد سجل شحن.',
    viewDocument: 'عرض المستند',
    progressConfirm: 'تأكيد',
    progressPickup: 'استلام',
    progressJourney: 'في الطريق',
    progressDelivered: 'تم التسليم',
    progressCompleted: 'مكتمل',
  },
  ppjkTrack: {
    loading: 'جارٍ تحميل تتبع PPJK…',
    notFound: 'الطلب غير موجود',
    notFoundMsg: 'رقم الطلب غير صالح أو غير متاح بعد',
    backToHome: 'العودة إلى الصفحة الرئيسية',
    statusDraft: 'مسودة / في انتظار التأكيد',
    statusConfirmed: 'تم التأكيد',
    statusProcessing: 'قيد المعالجة',
    statusSubmitted: 'تم تقديم المستندات للجمارك',
    statusExamining: 'قيد الفحص الجمركي',
    statusApproved: 'معتمد / تم إصدار SPPB',
    statusCompleted: 'مكتمل',
    statusCancelled: 'ملغى',
    statusOnHold: 'معلق',
    customsPending: 'قيد الانتظار',
    customsAjuFiled: 'تم تقديم الإقرار الجمركي',
    customsJalurHijau: 'القناة الخضراء',
    customsJalurMerah: 'القناة الحمراء',
    customsJalurKuning: 'القناة الصفراء',
    customsSppbIssued: 'تم إصدار SPPB',
    customsPaid: 'تم سداد الرسوم والضرائب',
    customsReleased: 'تم الإفراج عن البضائع',
    actionCreated: 'تم إنشاء الطلب',
    actionStatusChanged: 'تم تحديث الحالة',
    actionCustomsStatusChanged: 'تم تحديث الحالة الجمركية',
    actionDocumentUploaded: 'تم رفع المستند',
    actionNoteAdded: 'تمت إضافة ملاحظة',
    actionUpdated: 'تم تحديث البيانات',
    cargoInfo: 'معلومات البضائع',
    commodity: 'السلعة',
    route: 'المسار',
    portOfEntry: 'ميناء الدخول/الخروج',
    kantorPabean: 'مكتب الجمارك',
    grossWeight: 'الوزن الإجمالي',
    koli: 'الطرود',
    submissionDate: 'تاريخ التقديم',
    customsDocuments: 'أرقام مستندات الجمارك',
    nomorAju: 'رقم الإقرار',
    tanggalAju: 'تاريخ الإقرار',
    nomorPib: 'رقم PIB',
    nomorPeb: 'رقم PEB',
    nomorSppb: 'رقم SPPB',
    customsStatusLabel: 'الحالة الجمركية',
    timelineTitle: 'سجل التحديثات',
    lastUpdated: 'آخر تحديث',
    autoRefresh: 'يتم تحديث الصفحة تلقائياً كل 30 ثانية',
    progressLabel: 'تقدم التخليص الجمركي',
    cancelledMsg: 'تم إلغاء الطلب — يرجى التواصل مع فريقنا.',
    onHoldMsg: 'الطلب معلق — سيتواصل معك فريقنا قريباً.',
    completedMsg: 'اكتملت إجراءات الجمارك — البضائع جاهزة للاستلام أو التسليم.',
    showMore: 'عرض {count} تحديثات أخرى',
    showLess: 'إخفاء',
    tradeExport: 'تصدير',
    tradeImport: 'استيراد',
  },

};



// Auto-patched missing keys — propagated from en-US/id-ID baseline
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["back"] = "Back";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["pageTitleFull"] = "Logistics Cost Calculator";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["pageSubtitle"] = "Real-time cost estimation for all logistics services. Different formulas per service type.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["badgeTransparent"] = "Transparent";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["badgeFormula"] = "Accurate Formula";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["badgeLiveRates"] = "Live Rates DB";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["fallbackWarning"] = "Rates shown use default estimates because the latest rate data could not be loaded. These figures may not reflect actual rates — contact our team to confirm pricing.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["formTitle"] = "Calculator Form";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["formSubtitleSelected"] = "Fields customized for this service";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["formSubtitleEmpty"] = "Select a service to start calculating";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["stepSelectService"] = "Select Service Type";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["serviceSelectedHint"] = "{service} selected — showing fields for this service";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["emptyHint"] = "Select a service type above to continue";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["stepGeneralInfo"] = "General Information";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["customerName"] = "Customer / Company Name";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["customerNamePlaceholder"] = "PT. Maju Bersama";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["selectIncotermsPlaceholder"] = "Select Incoterms";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["originCity"] = "Origin City";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["destinationCity"] = "Destination City";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["pol"] = "Port of Loading (POL)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["pod"] = "Port of Discharge (POD)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["autoFilled"] = "Auto";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["cargoDescLabel"] = "Cargo Description / Commodity";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["cargoDescPlaceholder"] = "Industrial machinery, electronics, etc.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["addInsurance"] = "Add Insurance";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["addInsuranceSub"] = "+{pct}% of cargo value";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["detailSeaFreight"] = "Sea Freight Details";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["detailAirFreight"] = "Air Freight Details";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["detailCustoms"] = "PPJK / Customs Clearance Details";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["detailTrucking"] = "Trucking / Domestic Details";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["detailWarehousing"] = "Warehousing Details";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["detailProjectCargo"] = "Project Cargo Details";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["shipmentType"] = "Shipment Type";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["perCbm"] = "Per CBM";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["fullContainer"] = "Full Container";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["containerType"] = "Container Type";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["grossWeightKg"] = "Gross Weight (kg)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["grossWeightPlaceholder"] = "Gross weight (kg)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["commodity"] = "Commodity";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["commodityPlaceholder"] = "Cargo commodity";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["readyDate"] = "Ready Date";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["dangerousGoods"] = "Dangerous Goods";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["dgSurcharge"] = "Add DG surcharge";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["inlandTrucking"] = "Inland Trucking";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["originAirport"] = "Origin Airport";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["destAirport"] = "Destination Airport";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["piecesCount"] = "Number of Pieces";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["airline"] = "Airline";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["airlinePlaceholder"] = "Garuda, Lion Air...";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["dimensionsPerPiece"] = "Dimensions Per Piece (cm)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["volWeightNote"] = "Volumetric Weight = (L × W × H) / 6000 | Chargeable Weight = max(Gross, Volumetric)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["temperatureControlled"] = "Temperature Controlled";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["tradeType"] = "Trade Type";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["document"] = "Document";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["hsCode"] = "HS Code";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["customsValue"] = "Customs Value (CIF, IDR)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["customsValueNote"] = "Used to calculate estimated import duty & VAT";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["npwp"] = "Importer NPWP";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["applicationNumber"] = "Application Number (Optional)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["additionalServices"] = "Additional Services";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["pickupAddress"] = "Pickup Address";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["deliveryAddress"] = "Delivery Address";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["vehicleType"] = "Vehicle Type";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["distanceKm"] = "Distance (KM)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["tonnage"] = "Tonnage (ton)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["koli"] = "Pieces (koli)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["helperDays"] = "Helper (days):";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["warehouseLocation"] = "Warehouse Location";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["warehouseLocationPlaceholder"] = "Tangerang, Cikarang, Surabaya...";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["storageType"] = "Storage Type";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["perDay"] = "/day";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["quantity"] = "Quantity";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["duration"] = "Duration (days)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["durationPlaceholder"] = "30 days";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["inboundHandling"] = "Inbound Handling";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["outboundHandling"] = "Outbound Handling";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["inventoryManagement"] = "Inventory Management";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["projectCargoWarning"] = "Project Cargo is custom. This calculation produces an Estimated Budget Range, not a fixed quotation.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["cargoDimensions"] = "Cargo Dimensions (meters)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["weightPerPiece"] = "Weight Per Piece (ton)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["specialRequirements"] = "Special Requirements (select all that apply)";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["heavyLift"] = "Heavy Lift";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["heavyLiftSub"] = "Very heavy cargo";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["oversize"] = "Oversize";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["oversizeSub"] = "Exceeds standard dimensions";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["craneRequired"] = "Crane Required";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["craneSub"] = "Special crane required";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["routeSurvey"] = "Route Survey";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["routeSurveySub"] = "Special route survey";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["escortRequired"] = "Escort Required";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["escortSub"] = "Special escort";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["additionalNotes"] = "Additional Notes";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["notesPlaceholder"] = "Special instructions, additional requirements, deadline, etc.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["calculateButton"] = "Calculate Cost Estimate";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["resultEmpty"] = "Fill in the form on the left, then press Calculate Cost Estimate";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["projectCargoResultTitle"] = "Project Cargo";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["estimatedBudgetRange"] = "Estimated Budget Range";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["cargoVolume"] = "Cargo Volume";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["toRange"] = "to";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["estimateIndicative"] = "This estimate is indicative. An official quotation requires a survey & special calculation.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["discussWa"] = "Discuss via WhatsApp";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["requestQuoteFull"] = "Request Official Quotation";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["cargoMetrics"] = "Cargo Metrics";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["costBreakdown"] = "Cost Breakdown";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["subtotal"] = "Subtotal";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["insuranceLabel"] = "Insurance";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["estimateGrandTotal"] = "Estimated Grand Total";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["grandTotalNote"] = "*Estimate, not including unexpected costs";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["savePdf"] = "Save PDF";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["exportCsv"] = "Export CSV";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["exportJson"] = "Export JSON";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["quoteSentTitle"] = "Request Sent!";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["quoteSentDesc"] = "The B2B Marketplace and Logistic team will contact you within 1×24 business hours.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["quoteModalTitle"] = "Request Official Quotation";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["quoteModalSubtitle"] = "Our team will prepare an official quotation for you";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["fullName"] = "Full Name";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["fullNamePlaceholder"] = "Your name";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["email"] = "Email";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["whatsapp"] = "WhatsApp Number";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["cancel"] = "Cancel";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["sending"] = "Sending...";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["sendRequest"] = "Send Request";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["validationNoService"] = "Please select a service type first.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["validationNoDest"] = "Destination is required.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["validationNoWeight"] = "Cargo weight (Gross Weight) is required.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["validationNoCbm"] = "CBM volume is required for LCL.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["validationNoDist"] = "Distance (KM) is required.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["validationNoWhQty"] = "Quantity and storage duration are required.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["errorSendFail"] = "Failed to send. Please try again.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["validationName"] = "Name is required";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["validationWa"] = "WhatsApp number is required";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
locale["calculator"]["errorServerConnect"] = "Cannot connect to server. Check your connection.";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
if (!locale["calculator"]["services"] || typeof locale["calculator"]["services"] !== 'object') locale["calculator"]["services"] = {};
locale["calculator"]["services"]["seaFreightFull"] = "Sea Freight";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
if (!locale["calculator"]["services"] || typeof locale["calculator"]["services"] !== 'object') locale["calculator"]["services"] = {};
locale["calculator"]["services"]["airFreightFull"] = "Air Freight";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
if (!locale["calculator"]["services"] || typeof locale["calculator"]["services"] !== 'object') locale["calculator"]["services"] = {};
locale["calculator"]["services"]["customsFull"] = "PPJK / Customs Clearance";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
if (!locale["calculator"]["services"] || typeof locale["calculator"]["services"] !== 'object') locale["calculator"]["services"] = {};
locale["calculator"]["services"]["domesticFull"] = "Trucking / Domestic";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
if (!locale["calculator"]["services"] || typeof locale["calculator"]["services"] !== 'object') locale["calculator"]["services"] = {};
locale["calculator"]["services"]["warehousingFull"] = "Warehousing";
if (!locale["calculator"] || typeof locale["calculator"] !== 'object') locale["calculator"] = {};
if (!locale["calculator"]["services"] || typeof locale["calculator"]["services"] !== 'object') locale["calculator"]["services"] = {};
locale["calculator"]["services"]["projectCargoFull"] = "Project Cargo";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecCut"] = "Cut";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecColor"] = "Color";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecSpecies"] = "Species";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecStorage"] = "Storage";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecFreezing"] = "Freezing";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecProcessing"] = "Processing";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecShelfLife"] = "Shelf Life";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecNetWeightCarton"] = "Net Weight/Carton";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecNetWeight"] = "Net Weight";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecGrossWeight"] = "Gross Weight";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecThickness"] = "Thickness";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecLength"] = "Length";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecWidth"] = "Width";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["fieldSpecHeight"] = "Height";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["rfqFieldPhonePlaceholder"] = "628xxxxxxxxx atau 08xxxxxxxxxx";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["rfqFieldEmail"] = "Email";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["rfqFieldEmailPlaceholder"] = "email@contoh.com";
if (!locale["marketplaceDetail"] || typeof locale["marketplaceDetail"] !== 'object') locale["marketplaceDetail"] = {};
locale["marketplaceDetail"]["vendorRespTime"] = "Waktu Respons";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
locale["catalog"]["compare"]["cheapestBadge"] = "badge TERMURAH";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
locale["catalog"]["compare"]["cheapestDescEnd"] = "adalah pilihan harga terbaik.";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
locale["catalog"]["compare"]["cheapestDesc"] = "Vendor dengan";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
if (!locale["catalog"]["compare"]["col"] || typeof locale["catalog"]["compare"]["col"] !== 'object') locale["catalog"]["compare"]["col"] = {};
locale["catalog"]["compare"]["col"]["comparison"] = "Perbandingan";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
if (!locale["catalog"]["compare"]["col"] || typeof locale["catalog"]["compare"]["col"] !== 'object') locale["catalog"]["compare"]["col"] = {};
locale["catalog"]["compare"]["col"]["price"] = "Price";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
if (!locale["catalog"]["compare"]["col"] || typeof locale["catalog"]["compare"]["col"] !== 'object') locale["catalog"]["compare"]["col"] = {};
locale["catalog"]["compare"]["col"]["unit"] = "Satuan";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
if (!locale["catalog"]["compare"]["col"] || typeof locale["catalog"]["compare"]["col"] !== 'object') locale["catalog"]["compare"]["col"] = {};
locale["catalog"]["compare"]["col"]["vendor"] = "Vendor";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
locale["catalog"]["compare"]["itemsAvailable"] = "item tersedia untuk dibandingkan.";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
locale["catalog"]["compare"]["noItems"] = "Belum ada item yang ditawarkan oleh 2 vendor atau lebih";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
locale["catalog"]["compare"]["noItemsDesc"] = "Perbandingan harga tersedia saat minimal 2 vendor menawarkan item yang sama";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
locale["catalog"]["compare"]["noResultsDesc"] = "Coba kata kunci lain";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
locale["catalog"]["compare"]["noResults"] = "Tidak ada item yang cocok dengan pencarian";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
locale["catalog"]["compare"]["savingsPrefix"] = "Hemat s.d.";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
locale["catalog"]["compare"]["startingFrom"] = "Mulai dari";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["compare"] || typeof locale["catalog"]["compare"] !== 'object') locale["catalog"]["compare"] = {};
locale["catalog"]["compare"]["vendorCount"] = "vendor";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["etalase"] || typeof locale["catalog"]["etalase"] !== 'object') locale["catalog"]["etalase"] = {};
locale["catalog"]["etalase"]["allItems"] = "Semua Item";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["etalase"] || typeof locale["catalog"]["etalase"] !== 'object') locale["catalog"]["etalase"] = {};
locale["catalog"]["etalase"]["comparePrice"] = "Bandingkan Harga";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["etalase"] || typeof locale["catalog"]["etalase"] !== 'object') locale["catalog"]["etalase"] = {};
locale["catalog"]["etalase"]["empty"] = "Belum ada item etalase";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["etalase"] || typeof locale["catalog"]["etalase"] !== 'object') locale["catalog"]["etalase"] = {};
locale["catalog"]["etalase"]["emptyDesc"] = "Vendor belum menambahkan produk atau layanan ke katalog";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["etalase"] || typeof locale["catalog"]["etalase"] !== 'object') locale["catalog"]["etalase"] = {};
locale["catalog"]["etalase"]["searchBrowse"] = "Cari nama, vendor, kategori...";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["etalase"] || typeof locale["catalog"]["etalase"] !== 'object') locale["catalog"]["etalase"] = {};
locale["catalog"]["etalase"]["searchCompare"] = "Cari nama item, vendor...";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["etalase"] || typeof locale["catalog"]["etalase"] !== 'object') locale["catalog"]["etalase"] = {};
locale["catalog"]["etalase"]["startingPrice"] = "Harga mulai";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["filter"] || typeof locale["catalog"]["filter"] !== 'object') locale["catalog"]["filter"] = {};
locale["catalog"]["filter"]["all"] = "Semua";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["filter"] || typeof locale["catalog"]["filter"] !== 'object') locale["catalog"]["filter"] = {};
locale["catalog"]["filter"]["product"] = "Product";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["filter"] || typeof locale["catalog"]["filter"] !== 'object') locale["catalog"]["filter"] = {};
locale["catalog"]["filter"]["service"] = "Service";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["hero"] || typeof locale["catalog"]["hero"] !== 'object') locale["catalog"]["hero"] = {};
locale["catalog"]["hero"]["descHighlight"] = "bandingkan harga";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["hero"] || typeof locale["catalog"]["hero"] !== 'object') locale["catalog"]["hero"] = {};
locale["catalog"]["hero"]["descPrefix"] = "Temukan dan";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["hero"] || typeof locale["catalog"]["hero"] !== 'object') locale["catalog"]["hero"] = {};
locale["catalog"]["hero"]["descSuffix"] = "produk & layanan dari vendor terpercaya kami.";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["hero"] || typeof locale["catalog"]["hero"] !== 'object') locale["catalog"]["hero"] = {};
locale["catalog"]["hero"]["eyebrow"] = "Katalog Kami";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["hero"] || typeof locale["catalog"]["hero"] !== 'object') locale["catalog"]["hero"] = {};
locale["catalog"]["hero"]["title"] = "Produk & Layanan Vendor";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["closeBtn"] = "Close";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["email"] = "Email (opsional)";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["fullName"] = "Nama Lengkap *";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["namePlaceholder"] = "Nama Anda";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["nameWhatsappRequired"] = "Nama dan WhatsApp wajib diisi";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["notes"] = "Notes";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["notesPlaceholder"] = "Kebutuhan spesifik, spesifikasi, dll.";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["quantity"] = "Jumlah / Qty";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["quantityPlaceholder"] = "cth: 100 pcs";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["sendError"] = "Gagal mengirim";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["sendFailed"] = "Failed";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["sending"] = "Sending...";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["sentDesc"] = "Tim kami akan menghubungi Anda via WhatsApp segera.";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["sentTitle"] = "Permintaan Terkirim!";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["submitBtn"] = "Send Permintaan";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["title"] = "Minta Penawaran";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["inquiry"] || typeof locale["catalog"]["inquiry"] !== 'object') locale["catalog"]["inquiry"] = {};
locale["catalog"]["inquiry"]["whatsapp"] = "WhatsApp *";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["productTemplate"] || typeof locale["catalog"]["productTemplate"] !== 'object') locale["catalog"]["productTemplate"] = {};
locale["catalog"]["productTemplate"]["empty"] = "Belum ada template produk";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["productTemplate"] || typeof locale["catalog"]["productTemplate"] !== 'object') locale["catalog"]["productTemplate"] = {};
locale["catalog"]["productTemplate"]["emptyDesc"] = "Admin belum menambahkan template produk";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["productTemplate"] || typeof locale["catalog"]["productTemplate"] !== 'object') locale["catalog"]["productTemplate"] = {};
locale["catalog"]["productTemplate"]["fields"] = "field pengisian data";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
locale["catalog"]["requestQuote"] = "Minta Penawaran";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["serviceTemplate"] || typeof locale["catalog"]["serviceTemplate"] !== 'object') locale["catalog"]["serviceTemplate"] = {};
locale["catalog"]["serviceTemplate"]["empty"] = "Belum ada template layanan";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["serviceTemplate"] || typeof locale["catalog"]["serviceTemplate"] !== 'object') locale["catalog"]["serviceTemplate"] = {};
locale["catalog"]["serviceTemplate"]["emptyDesc"] = "Admin belum menambahkan template layanan";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["serviceTemplate"] || typeof locale["catalog"]["serviceTemplate"] !== 'object') locale["catalog"]["serviceTemplate"] = {};
locale["catalog"]["serviceTemplate"]["infoRequired"] = "informasi yang dibutuhkan";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["tabs"] || typeof locale["catalog"]["tabs"] !== 'object') locale["catalog"]["tabs"] = {};
locale["catalog"]["tabs"]["etalase"] = "Etalase Vendor";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["tabs"] || typeof locale["catalog"]["tabs"] !== 'object') locale["catalog"]["tabs"] = {};
locale["catalog"]["tabs"]["productTemplate"] = "Template Produk";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["tabs"] || typeof locale["catalog"]["tabs"] !== 'object') locale["catalog"]["tabs"] = {};
locale["catalog"]["tabs"]["serviceTemplate"] = "Template Layanan";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["template"] || typeof locale["catalog"]["template"] !== 'object') locale["catalog"]["template"] = {};
locale["catalog"]["template"]["checklistPoints"] = "poin checklist";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
if (!locale["catalog"]["template"] || typeof locale["catalog"]["template"] !== 'object') locale["catalog"]["template"] = {};
locale["catalog"]["template"]["docsRequired"] = "dokumen diperlukan";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
locale["catalog"]["typeProduct"] = "Product";
if (!locale["catalog"] || typeof locale["catalog"] !== 'object') locale["catalog"] = {};
locale["catalog"]["typeService"] = "Service";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["accountType"] || typeof locale["onboarding"]["accountType"] !== 'object') locale["onboarding"]["accountType"] = {};
locale["onboarding"]["accountType"]["needsAdminApproval"] = "Perlu persetujuan admin";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["accountType"] || typeof locale["onboarding"]["accountType"] !== 'object') locale["onboarding"]["accountType"] = {};
locale["onboarding"]["accountType"]["title"] = "Select Tipe Akun";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
locale["onboarding"]["back"] = "Back";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["basicInfo"] || typeof locale["onboarding"]["basicInfo"] !== 'object') locale["onboarding"]["basicInfo"] = {};
locale["onboarding"]["basicInfo"]["address"] = "Alamat Lengkap";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["basicInfo"] || typeof locale["onboarding"]["basicInfo"] !== 'object') locale["onboarding"]["basicInfo"] = {};
locale["onboarding"]["basicInfo"]["addressPlaceholder"] = "Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota/Kabupaten";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["basicInfo"] || typeof locale["onboarding"]["basicInfo"] !== 'object') locale["onboarding"]["basicInfo"] = {};
locale["onboarding"]["basicInfo"]["fullName"] = "Nama Lengkap";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["basicInfo"] || typeof locale["onboarding"]["basicInfo"] !== 'object') locale["onboarding"]["basicInfo"] = {};
locale["onboarding"]["basicInfo"]["fullNamePlaceholder"] = "Sesuai KTP";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["basicInfo"] || typeof locale["onboarding"]["basicInfo"] !== 'object') locale["onboarding"]["basicInfo"] = {};
locale["onboarding"]["basicInfo"]["phone"] = "Nomor HP / WhatsApp";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["basicInfo"] || typeof locale["onboarding"]["basicInfo"] !== 'object') locale["onboarding"]["basicInfo"] = {};
locale["onboarding"]["basicInfo"]["title"] = "Informasi Dasar";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["driverDetail"] || typeof locale["onboarding"]["driverDetail"] !== 'object') locale["onboarding"]["driverDetail"] = {};
locale["onboarding"]["driverDetail"]["title"] = "Detail Driver";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["driver"] || typeof locale["onboarding"]["driver"] !== 'object') locale["onboarding"]["driver"] = {};
locale["onboarding"]["driver"]["licenseNumber"] = "Nomor SIM";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["driver"] || typeof locale["onboarding"]["driver"] !== 'object') locale["onboarding"]["driver"] = {};
locale["onboarding"]["driver"]["licenseNumberPlaceholder"] = "Nomor SIM sesuai kartu";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["driver"] || typeof locale["onboarding"]["driver"] !== 'object') locale["onboarding"]["driver"] = {};
locale["onboarding"]["driver"]["plateNumber"] = "Nomor Plat";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["driver"] || typeof locale["onboarding"]["driver"] !== 'object') locale["onboarding"]["driver"] = {};
locale["onboarding"]["driver"]["uploadSimHint"] = "Upload SIM";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["driver"] || typeof locale["onboarding"]["driver"] !== 'object') locale["onboarding"]["driver"] = {};
locale["onboarding"]["driver"]["uploadSim"] = "Upload SIM";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["driver"] || typeof locale["onboarding"]["driver"] !== 'object') locale["onboarding"]["driver"] = {};
locale["onboarding"]["driver"]["uploadStnkHint"] = "Upload STNK";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["driver"] || typeof locale["onboarding"]["driver"] !== 'object') locale["onboarding"]["driver"] = {};
locale["onboarding"]["driver"]["uploadStnk"] = "Upload STNK";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["driver"] || typeof locale["onboarding"]["driver"] !== 'object') locale["onboarding"]["driver"] = {};
locale["onboarding"]["driver"]["vehicleType"] = "Jenis Kendaraan";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["driver"] || typeof locale["onboarding"]["driver"] !== 'object') locale["onboarding"]["driver"] = {};
locale["onboarding"]["driver"]["vehicleTypePlaceholder"] = "Motor / Mobil / Truk / dll.";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["employee"] || typeof locale["onboarding"]["employee"] !== 'object') locale["onboarding"]["employee"] = {};
locale["onboarding"]["employee"]["branch"] = "Cabang (Opsional)";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["employee"] || typeof locale["onboarding"]["employee"] !== 'object') locale["onboarding"]["employee"] = {};
locale["onboarding"]["employee"]["branchPlaceholder"] = "Nama cabang";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["employee"] || typeof locale["onboarding"]["employee"] !== 'object') locale["onboarding"]["employee"] = {};
locale["onboarding"]["employee"]["companyName"] = "Nama Perusahaan";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["employee"] || typeof locale["onboarding"]["employee"] !== 'object') locale["onboarding"]["employee"] = {};
locale["onboarding"]["employee"]["companyNamePlaceholder"] = "Nama perusahaan tempat bekerja";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["employee"] || typeof locale["onboarding"]["employee"] !== 'object') locale["onboarding"]["employee"] = {};
locale["onboarding"]["employee"]["department"] = "Departemen (Opsional)";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["employee"] || typeof locale["onboarding"]["employee"] !== 'object') locale["onboarding"]["employee"] = {};
locale["onboarding"]["employee"]["departmentPlaceholder"] = "Nama departemen";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["employee"] || typeof locale["onboarding"]["employee"] !== 'object') locale["onboarding"]["employee"] = {};
locale["onboarding"]["employee"]["division"] = "Divisi (Opsional)";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["employee"] || typeof locale["onboarding"]["employee"] !== 'object') locale["onboarding"]["employee"] = {};
locale["onboarding"]["employee"]["divisionPlaceholder"] = "Nama divisi";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["employee"] || typeof locale["onboarding"]["employee"] !== 'object') locale["onboarding"]["employee"] = {};
locale["onboarding"]["employee"]["position"] = "Jabatan";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["employee"] || typeof locale["onboarding"]["employee"] !== 'object') locale["onboarding"]["employee"] = {};
locale["onboarding"]["employee"]["positionPlaceholder"] = "Jabatan / Posisi";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["employeeDetail"] || typeof locale["onboarding"]["employeeDetail"] !== 'object') locale["onboarding"]["employeeDetail"] = {};
locale["onboarding"]["employeeDetail"]["title"] = "Detail Karyawan";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["header"] || typeof locale["onboarding"]["header"] !== 'object') locale["onboarding"]["header"] = {};
locale["onboarding"]["header"]["subtitle"] = "Isi data berikut untuk mengaktifkan akun Anda";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["header"] || typeof locale["onboarding"]["header"] !== 'object') locale["onboarding"]["header"] = {};
locale["onboarding"]["header"]["title"] = "Lengkapi Profil Anda";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["ktp"] || typeof locale["onboarding"]["ktp"] !== 'object') locale["onboarding"]["ktp"] = {};
locale["onboarding"]["ktp"]["clickToUpload"] = "Klik untuk upload foto KTP";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["ktp"] || typeof locale["onboarding"]["ktp"] !== 'object') locale["onboarding"]["ktp"] = {};
locale["onboarding"]["ktp"]["fileHint"] = "JPG, PNG, maks. 10MB";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["ktp"] || typeof locale["onboarding"]["ktp"] !== 'object') locale["onboarding"]["ktp"] = {};
locale["onboarding"]["ktp"]["uploadLabel"] = "Upload KTP (Opsional, untuk OCR otomatis)";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
locale["onboarding"]["next"] = "Continue";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["ocr"] || typeof locale["onboarding"]["ocr"] !== 'object') locale["onboarding"]["ocr"] = {};
locale["onboarding"]["ocr"]["autoFillNote"] = "Data di atas otomatis mengisi form. Anda bisa edit secara manual.";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["ocr"] || typeof locale["onboarding"]["ocr"] !== 'object') locale["onboarding"]["ocr"] = {};
locale["onboarding"]["ocr"]["birthDate"] = "Tgl Lahir";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["ocr"] || typeof locale["onboarding"]["ocr"] !== 'object') locale["onboarding"]["ocr"] = {};
locale["onboarding"]["ocr"]["failed"] = "OCR gagal. Coba upload ulang.";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["ocr"] || typeof locale["onboarding"]["ocr"] !== 'object') locale["onboarding"]["ocr"] = {};
locale["onboarding"]["ocr"]["gender"] = "JK";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["ocr"] || typeof locale["onboarding"]["ocr"] !== 'object') locale["onboarding"]["ocr"] = {};
locale["onboarding"]["ocr"]["ktpAddress"] = "Alamat KTP";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["ocr"] || typeof locale["onboarding"]["ocr"] !== 'object') locale["onboarding"]["ocr"] = {};
locale["onboarding"]["ocr"]["name"] = "Name";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["ocr"] || typeof locale["onboarding"]["ocr"] !== 'object') locale["onboarding"]["ocr"] = {};
locale["onboarding"]["ocr"]["reading"] = "Sedang membaca data KTP...";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["ocr"] || typeof locale["onboarding"]["ocr"] !== 'object') locale["onboarding"]["ocr"] = {};
locale["onboarding"]["ocr"]["serverError"] = "Gagal menghubungi server OCR.";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["ocr"] || typeof locale["onboarding"]["ocr"] !== 'object') locale["onboarding"]["ocr"] = {};
locale["onboarding"]["ocr"]["success"] = "Data KTP berhasil dibaca — silakan periksa dan edit jika perlu";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["accountType"] = "Tipe Akun";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["address"] = "Address";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["basicInfo"] = "Informasi Dasar";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["branch"] = "Cabang";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["company"] = "Company";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["department"] = "Departemen";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["division"] = "Divisi";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["driverData"] = "Data Driver";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["employeeData"] = "Data Karyawan";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["fullName"] = "Nama Lengkap";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["ktp"] = "KTP";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["legalityDoc"] = "Dok. Legalitas";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["licenseNumber"] = "No. SIM";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["logout"] = "Keluar dari akun ini";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["nikOcr"] = "NIK (OCR)";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["notUploaded"] = "Tidak diupload";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
if (!locale["onboarding"]["review"]["pendingNotice"] || typeof locale["onboarding"]["review"]["pendingNotice"] !== 'object') locale["onboarding"]["review"]["pendingNotice"] = {};
locale["onboarding"]["review"]["pendingNotice"]["detail"] = "dan perlu persetujuan admin sebelum bisa digunakan.";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
if (!locale["onboarding"]["review"]["pendingNotice"] || typeof locale["onboarding"]["review"]["pendingNotice"] !== 'object') locale["onboarding"]["review"]["pendingNotice"] = {};
locale["onboarding"]["review"]["pendingNotice"]["prefix"] = "Akun";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
if (!locale["onboarding"]["review"]["pendingNotice"] || typeof locale["onboarding"]["review"]["pendingNotice"] !== 'object') locale["onboarding"]["review"]["pendingNotice"] = {};
locale["onboarding"]["review"]["pendingNotice"]["suffix"] = "akan masuk status";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["pendingReview"] = "Pending Review";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["phone"] = "Nomor HP";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["plate"] = "Plat";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["position"] = "Jabatan";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["saveAndContinue"] = "Save & Lanjut";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["saving"] = "Saving...";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["serviceType"] = "Jenis Layanan";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["title"] = "Confirm Data";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["type"] = "Tipe";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["vehicle"] = "Kendaraan";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["review"] || typeof locale["onboarding"]["review"] !== 'object') locale["onboarding"]["review"] = {};
locale["onboarding"]["review"]["vendorData"] = "Data Vendor";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["step"] || typeof locale["onboarding"]["step"] !== 'object') locale["onboarding"]["step"] = {};
locale["onboarding"]["step"]["accountType"] = "Tipe Akun";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["step"] || typeof locale["onboarding"]["step"] !== 'object') locale["onboarding"]["step"] = {};
locale["onboarding"]["step"]["basicInfo"] = "Info Dasar";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["step"] || typeof locale["onboarding"]["step"] !== 'object') locale["onboarding"]["step"] = {};
locale["onboarding"]["step"]["confirm"] = "Confirm";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["step"] || typeof locale["onboarding"]["step"] !== 'object') locale["onboarding"]["step"] = {};
locale["onboarding"]["step"]["detail"] = "Detail";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["submit"] || typeof locale["onboarding"]["submit"] !== 'object') locale["onboarding"]["submit"] = {};
locale["onboarding"]["submit"]["saveFailed"] = "Gagal menyimpan profil.";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["submit"] || typeof locale["onboarding"]["submit"] !== 'object') locale["onboarding"]["submit"] = {};
locale["onboarding"]["submit"]["serverError"] = "Gagal menghubungi server.";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["vendor"] || typeof locale["onboarding"]["vendor"] !== 'object') locale["onboarding"]["vendor"] = {};
locale["onboarding"]["vendor"]["companyName"] = "Nama Perusahaan";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["vendor"] || typeof locale["onboarding"]["vendor"] !== 'object') locale["onboarding"]["vendor"] = {};
locale["onboarding"]["vendor"]["companyNamePlaceholder"] = "PT / CV / UD ...";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["vendor"] || typeof locale["onboarding"]["vendor"] !== 'object') locale["onboarding"]["vendor"] = {};
locale["onboarding"]["vendor"]["legalityDocHint"] = "NIB, Akta Perusahaan, dll.";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["vendor"] || typeof locale["onboarding"]["vendor"] !== 'object') locale["onboarding"]["vendor"] = {};
locale["onboarding"]["vendor"]["legalityDoc"] = "Upload Dokumen Legalitas (Opsional)";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["vendor"] || typeof locale["onboarding"]["vendor"] !== 'object') locale["onboarding"]["vendor"] = {};
locale["onboarding"]["vendor"]["nib"] = "NIB (Opsional)";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["vendor"] || typeof locale["onboarding"]["vendor"] !== 'object') locale["onboarding"]["vendor"] = {};
locale["onboarding"]["vendor"]["nibPlaceholder"] = "Nomor Induk Berusaha";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["vendor"] || typeof locale["onboarding"]["vendor"] !== 'object') locale["onboarding"]["vendor"] = {};
locale["onboarding"]["vendor"]["npwp"] = "NPWP (Opsional)";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["vendor"] || typeof locale["onboarding"]["vendor"] !== 'object') locale["onboarding"]["vendor"] = {};
locale["onboarding"]["vendor"]["serviceType"] = "Jenis Layanan Vendor";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["vendor"] || typeof locale["onboarding"]["vendor"] !== 'object') locale["onboarding"]["vendor"] = {};
locale["onboarding"]["vendor"]["serviceTypePlaceholder"] = "contoh: Trucking, Forwarding, Warehouse, dll.";
if (!locale["onboarding"] || typeof locale["onboarding"] !== 'object') locale["onboarding"] = {};
if (!locale["onboarding"]["vendorDetail"] || typeof locale["onboarding"]["vendorDetail"] !== 'object') locale["onboarding"]["vendorDetail"] = {};
locale["onboarding"]["vendorDetail"]["title"] = "Detail Vendor";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["acceptBasePrice"] = "Terima Harga Dasar";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["agreeWithPriceListed"] = "Saya setuju dengan harga yang tertera";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["agreeWithPrice"] = "Setuju dengan harga";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["agreeWithTotal"] = "Setuju dengan total";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["alreadySubmittedTitle"] = "Anda sudah mengirim penawaran";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["attachmentOptional"] = "Lampiran (opsional)";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["back"] = "Back";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["basePrice"] = "HARGA DASAR";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["cannotServeDesc"] = "Saya tidak dapat memproses permintaan ini";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["cannotServe"] = "Tidak Bisa Melayani";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["cannotServeTitle"] = "Tidak Dapat Melayani";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["canStillUpdate"] = "Anda masih bisa memperbarui penawaran.";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["cargoDescription"] = "Description";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["cargoDetail"] = "Detail Muatan";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["chooseAction"] = "Select Tindakan";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["commodity"] = "Komoditi";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["confirmRejection"] = "Confirm Penolakan";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["currency"] = "Mata Uang";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["deadline"] = "Deadline:";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["description"] = "Description";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["enterAtLeastOneItemPrice"] = "Masukkan harga minimal untuk satu item";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["estimatedTimeOptional"] = "Estimasi Waktu (opsional)";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["etaLabel"] = "Estimasi Waktu / ETA";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["etaLabelPlaceholder"] = "Contoh: 3-5 hari";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["etaPlaceholder"] = "Contoh: 2-3 hari";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["etaRequired"] = "Estimasi waktu harus diisi";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["excludingVat"] = "belum PPN";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["expiredDesc"] = "Batas waktu untuk merespons RFQ ini sudah habis.";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["expired"] = "Waktu Penawaran Berakhir";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["failLoadData"] = "Gagal memuat data";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["failSubmit"] = "Gagal mengirim";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["failUploadFile"] = "Gagal upload file";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["fileUploadSuccess"] = "File berhasil diupload";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["grandTotalVendor"] = "Grand Total Vendor";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["greetingPrefix"] = "Kepada Yth.";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["includingVat"] = "termasuk PPN";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["invalidToken"] = "Token tidak valid";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["linkInvalid"] = "Link tidak valid";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["linkUnavailable"] = "Link tidak tersedia";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["loading"] = "Memuat data...";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["notesForAdmin"] = "Catatan untuk admin...";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["notesOptional"] = "Catatan (opsional)";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["notesPlaceholder"] = "Catatan tambahan...";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["offerCalculation"] = "Kalkulasi Penawaran";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["offerGrandTotal"] = "Grand Total Penawaran";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["offerPrice"] = "Harga Penawaran";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["offerPriceMustBePositive"] = "Harga penawaran harus lebih dari Rp 0";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["offerPricePlaceholder"] = "Contoh: 5000000";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["offerPriceRequired"] = "Harga penawaran harus diisi";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["offerSentDesc"] = "Penawaran Anda telah berhasil dikirim. Tim kami akan segera menindaklanjuti.";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["offerSent"] = "Penawaran Terkirim";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["ppn"] = "PPN 11%";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["price"] = "Harga:";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["pricePerItem"] = "Harga Per Item";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["priceReferenceNote"] = "Harga referensi dari etalase vendor. Belum termasuk margin & markup.";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["priceReferenceNotePpn"] = "Harga referensi dari etalase vendor. Belum termasuk margin & PPN.";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["productDetail"] = "Detail Produk";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["product"] = "Product";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["productTemplate"] = "Template Produk";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["qty"] = "Qty";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["reasonOptional"] = "Alasan (opsional)";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["reasonPlaceholder"] = "Contoh: Rute tidak tersedia, kapasitas penuh...";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["replyBeforeDeadline"] = "Harap balas sebelum batas waktu yang ditentukan.";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["requestLogisticQuote"] = "Mohon bantu isi penawaran harga untuk kebutuhan layanan logistik di bawah ini.";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["requestProductQuote"] = "Mohon bantu isi penawaran harga untuk kebutuhan pembelian produk di bawah ini.";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["requestServiceQuote"] = "Mohon bantu isi penawaran harga untuk kebutuhan layanan di bawah ini.";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["requiredDateShort"] = "Tgl Butuh";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["requiredDate"] = "Tgl Dibutuhkan";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["requiredDocs"] = "Dokumen wajib:";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["rfqLabel"] = "Permintaan Penawaran Harga";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["route"] = "Rute";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["sendConfirmation"] = "Send Konfirmasi";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["sending"] = "Sending...";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["sendOffer"] = "Send Penawaran";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["serviceDetail"] = "Detail Layanan";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["service"] = "Service";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["status"] = "Status:";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["submitNewPrice"] = "Ajukan Harga Baru";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["submitNewPriceDesc"] = "Saya ingin memberikan penawaran harga berbeda";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["termsOptional"] = "Syarat & Ketentuan (opsional)";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["termsPlaceholder"] = "Contoh: DP 50%, sisa sebelum pengiriman";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["timeExpired"] = "Waktu sudah habis";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["timeRemaining"] = "Sisa Waktu";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["unitPriceCurrency"] = "Harga satuan";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["unitPrice"] = "Harga Satuan";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["unitPricePlaceholder"] = "Contoh: 4800000";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["uploading"] = "Uploading...";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["validUntilOptional"] = "Berlaku Sampai (opsional)";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["validUntilPlaceholder"] = "Contoh: 2025-12-31";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["vendorSubtotal"] = "Subtotal Vendor";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["vendorUnitPrice"] = "Harga Satuan Vendor";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["volume"] = "Volume";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["weight"] = "Weight";
if (!locale["vendorForm"] || typeof locale["vendorForm"] !== 'object') locale["vendorForm"] = {};
locale["vendorForm"]["youAgreePrice"] = "Anda menyetujui harga";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["invalidLink"] = "Invalid Link";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["offerSent"] = "Offer Sent!";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["orderRef"] = "Order Ref:";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["offerSentDesc"] = "Thank you! We have received your offer and it will be processed by our team shortly. We will contact you if there are any further questions.";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["alreadySubmitted"] = "Offer Already Submitted";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["alreadySubmittedDesc"] = "An offer for this order has already been submitted through this link. Our team is currently processing your offer.";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["selectDriver"] = "Select Driver";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["changeDriver"] = "Change";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["searchDriverPlaceholder"] = "Search driver name or plate...";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["noDriverRegistered"] = "No drivers registered yet";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["notFound"] = "not found";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["addNewDriver"] = "Add new driver";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["addNewDriverTitle"] = "Add New Driver";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["driverName"] = "Driver Name";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["driverNamePlaceholder"] = "Full name of driver";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["driverNameRequired"] = "Driver name is required";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["driverPhone"] = "Phone No.";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["driverPhonePlaceholder"] = "08xxxxxxxxxx";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["plateNumber"] = "Plate Number";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["plateNumberPlaceholder"] = "B 1234 XYZ";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["vehicleType"] = "Vehicle Type";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["vehicleTypePlaceholder"] = "Engkel, CDD, etc.";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["vehicleTypePlaceholder2"] = "Engkel, Tronton, CDD, etc.";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["saving"] = "Saving...";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["saveAndSelect"] = "Save & Select";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["cancel"] = "Cancel";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["driverPhoneLabel"] = "Driver Phone No.";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["vehiclePlateLabel"] = "Vehicle Plate Number";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["vehicleTypeLabel"] = "Vehicle Type";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["templateMissing"] = "Product template not found";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["templateMissingDesc"] = "Specifications for this category are not yet available. Contact admin to update the template.";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["formTitleDefault"] = "Quotation Form";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["forVendor"] = "For:";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["orderRefBadge"] = "Order Ref:";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["orderRelated"] = "This form is related to a specific customer order";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["specLabel"] = "Specification:";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["templateActive"] = "Template Active";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["orderDetailTitle"] = "Customer Order Details";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["orderNumber"] = "Order No.";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["customer"] = "Customer";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["serviceType"] = "Service Type";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["route"] = "Route";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["targetDelivery"] = "Target Delivery";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["itemDetail"] = "Item Details";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["itemNameSku"] = "Name / SKU";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["itemQty"] = "Qty";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["itemUnit"] = "Unit";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["itemBasePrice"] = "Base Price";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["itemSubtotal"] = "Subtotal";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["adminNotes"] = "Admin Notes";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["vendorIdentity"] = "Vendor Identity";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["companyName"] = "Company Name / Vendor";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["companyNamePlaceholder"] = "Your company name";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["picName"] = "PIC / Contact Person Name";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["picNamePlaceholder"] = "Contact person name";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["whatsappPhone"] = "WhatsApp / Phone Number";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["phonePlaceholder"] = "Example: 0812xxxx";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["basePriceSection"] = "Base Price Breakdown";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["basePriceNote"] = "Enter your Base Price — excluding margin & VAT. Selling price to customer is determined by admin.";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["serviceDescription"] = "Service / Product Description";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["serviceDescPlaceholder"] = "Example: FCL sea freight Jakarta–Singapore";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["qty"] = "Qty";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["unit"] = "Unit";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["unitPlaceholder"] = "Ls / kg / CBM / unit";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["basePricePerUnit"] = "Base Unit Price (excl. VAT)";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["basePricePh"] = "Example: 5000000";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["etaLabel"] = "Estimated Delivery / Lead Time";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["etaPh"] = "Example: D+2, 3 working days, 15 Jan 2026";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["validUntil"] = "Price Valid Until";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["detailLabel"] = "Detail";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["templateActiveLabel"] = "Template Active";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["selectPlaceholder"] = "— Select —";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["chooseFile"] = "Choose File";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["fileUploaded"] = "File uploaded";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["noFileChosen"] = "No file selected";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["vendorOffer"] = "Vendor Offer";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["vendorOfferNote"] = "Enter your Base Price and offer details. Selling price to customer is determined by admin.";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["basePriceRp"] = "Base Price (Rp, excl. VAT)";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["basePriceRequired"] = "Base price is required and must be greater than 0";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["stockStatus"] = "Stock Status";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["leadTime"] = "Lead Time / Estimated Delivery";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["leadTimePh"] = "Example: 7 working days, D+3";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["moq"] = "Minimum Order (MOQ)";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["moqPh"] = "Example: 100 MT, 1 truck";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["validUntilLabel"] = "Price Valid Until";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["additionalNotes"] = "Additional Notes";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["additionalNotesPh"] = "Notes on conditions, terms, or additional info...";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["attachmentSection"] = "Document Attachment";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["attachmentDesc"] = "Optional — attach supporting documents (PDF, image, or spreadsheet, max. 10 MB).";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["chooseFilePdf"] = "Choose File";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["removeAttachment"] = "Remove attachment";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["mediaSection"] = "Product/Service Media";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["mediaDesc"] = "Optional — upload photos, video, or brochure to strengthen your offer.";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["coverImage"] = "Cover Image";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["coverImageNote"] = "(1 photo, max. 10 MB)";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["chooseCoverPhoto"] = "Choose Cover Photo";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["uploading"] = "Uploading...";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["uploaded"] = "Uploaded";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["gallery"] = "Photo Gallery";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["galleryNote"] = "(multiple photos, max. 10 MB/file)";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["videoProfile"] = "Profile Video";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["videoNote"] = "(1 video MP4/MOV/WebM, max. 50 MB)";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["chooseVideo"] = "Choose Video";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["brochure"] = "Brochure / PDF Catalog";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["brochureNote"] = "(1 PDF, max. 10 MB)";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["choosePdf"] = "Choose PDF";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["remove"] = "Remove";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["certificates"] = "Certificates / Supporting Documents";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["certificatesNote"] = "(PDF or photo, max. 10 MB/file)";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["addCertificate"] = "Add Certificate";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["mediaReadySuffix"] = "media files ready to send with offer";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["submitOffer"] = "Send Offer";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["submitData"] = "Send Data";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["uploadingFile"] = "Uploading file...";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["sending"] = "Sending...";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["privacyNote"] = "Your data is secure and only used for procurement purposes.";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["fieldRequired"] = "Required fields not filled:";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["basePriceRequiredSimple"] = "Base price is required";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["unitPriceRequired"] = "Base unit price is required";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["uploadFailed"] = "File upload failed";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["saveFailed"] = "Failed to save driver";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["tokenNotFound"] = "Token not found";
if (!locale["vendorMiniForm"] || typeof locale["vendorMiniForm"] !== 'object') locale["vendorMiniForm"] = {};
locale["vendorMiniForm"]["formUnavailable"] = "Form not available for this link.";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["photoOfPOD"] = "POD Photo";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["prevPhoto"] = "Previous photo";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["nextPhoto"] = "Next photo";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["close"] = "Close";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["loadingJob"] = "Loading job order...";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["invalidLink"] = "Invalid Link";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["contactUs"] = "Contact our team if you have any issues.";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["jobOrderTitle"] = "Vendor Job Order";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["vendorLabel"] = "Vendor:";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["orderNumber"] = "Order No.";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["serviceLabel"] = "Service";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["route"] = "Route";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["commodity"] = "Commodity";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["weight"] = "Weight";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["requiredDate"] = "Required Date";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["notes"] = "Notes";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["acceptJob"] = "Are you willing to accept this job?";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["acceptBtn"] = "Accept Job";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["rejectBtn"] = "Reject Job";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["rejectFormTitle"] = "Confirm Job Rejection";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["rejectReason"] = "Rejection Reason (optional)";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["rejectReasonPh"] = "Explain why you cannot accept this job...";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["cancelBtn"] = "Cancel";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["confirmReject"] = "Confirm Rejection";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["sending"] = "Sending...";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["operationalDetails"] = "Operational Details";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["operationalDetailsDesc"] = "Fill in the details below to confirm job acceptance.";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["driverName"] = "Driver Name";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["driverNamePh"] = "Full driver name";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["driverPhone"] = "Driver Phone No.";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["driverPhonePh"] = "0812xxxx";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["vehiclePlate"] = "Vehicle Plate Number";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["vehiclePlatePh"] = "B 1234 XYZ";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["vehicleType"] = "Vehicle Type";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["vehicleTypePh"] = "CDE / Fuso / Engkel";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["pickupTime"] = "Pickup Time";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["carrier"] = "Carrier / Airline";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["carrierPh"] = "Garuda Cargo, Salam Pacific, etc.";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["schedule"] = "Departure Schedule";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["schedulePh"] = "Flight/voyage number, schedule";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["etd"] = "ETD (Estimated Departure)";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["eta"] = "ETA (Estimated Arrival)";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["awbBl"] = "AWB / BL Number";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["awbBlPh"] = "Shipping document number";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["stockConfirmed"] = "Stock Confirmation";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["stockConfirmedPh"] = "Stock available / quantity";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["deliverySchedule"] = "Delivery Schedule";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["deliverySchedulePh"] = "Estimated delivery date";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["documentStatus"] = "Document Status";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["documentStatusPh"] = "PIB submitted, awaiting inspection...";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["additionalNotes"] = "Additional Notes";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["additionalNotesPh"] = "Special instructions, issues, etc.";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["processing"] = "Processing...";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["confirmAccept"] = "Confirm Accept Job";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["rejectedState"] = "This job has been rejected.";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["rejectReasonLabel"] = "Reason:";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["adminWillFollowUp"] = "Admin will follow up shortly.";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["contactTeam"] = "Contact our team if you have any issues.";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["driverLabel"] = "Driver";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["driverPhoneLabel"] = "Driver Phone";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["vehiclePlateLabel"] = "Vehicle Plate";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["vehicleTypeLabel"] = "Vehicle Type";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["pickupTimeLabel"] = "Pickup Time";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["carrierLabel"] = "Carrier";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["scheduleLabel"] = "Schedule";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["etdLabel"] = "ETD";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["etaLabel"] = "ETA";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["awbBlLabel"] = "AWB / BL";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["stockLabel"] = "Stock";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["deliveryScheduleLabel"] = "Delivery Schedule";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["documentStatusLabel"] = "Document Status";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["notesLabel"] = "Notes";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["updateProgress"] = "Update Progress";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["addUpdate"] = "+ Update";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["latestStatus"] = "Latest Status";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["selectStatus"] = "Select status...";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["description"] = "Description";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["descriptionPh"] = "Additional information...";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["photoOptional"] = "Photo (optional)";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["saving"] = "Saving...";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["sendUpdate"] = "Send Update";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["uploadPod"] = "Upload POD / Documents";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["uploadBtn"] = "Upload";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["podUploaded"] = "Documents uploaded successfully. Awaiting admin confirmation.";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["podFileLabel"] = "File (POD, Invoice, Photo)";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["completionNotes"] = "Completion Notes";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["completionNotesPh"] = "Final notes, issues, etc.";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["uploading"] = "Uploading...";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["uploadDoc"] = "Upload Document";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["progressHistory"] = "Progress History";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["photoProgress"] = "Progress photo";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["adminLabel"] = "Admin";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["vendorLabelShort"] = "Vendor";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["footer"] = "Vendor Job Order";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["statusPending"] = "⏳ Awaiting Response";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["statusAccepted"] = "✅ Accepted";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["statusRejected"] = "❌ Rejected";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["statusInProgress"] = "🚛 In Progress";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["statusPickupScheduled"] = "📅 Pickup Scheduled";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["statusCompleted"] = "🎉 Completed";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["statusProblem"] = "⚠️ Problem";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["progressPickupScheduled"] = "📅 Pickup Scheduled";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["progressInProgress"] = "🚛 In Progress / En Route";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["progressCompleted"] = "✅ Completed";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["progressProblem"] = "⚠️ Problem / Needs Attention";
if (!locale["vendorJob"] || typeof locale["vendorJob"] !== 'object') locale["vendorJob"] = {};
locale["vendorJob"]["fieldRequired"] = "Required fields:";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["loadingData"] = "Loading data...";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["invalidLink"] = "Invalid Link";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["thankYou"] = "Thank You!";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["acceptedOrder"] = "You have accepted order";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["teamWillFollowUp"] = "Our team will follow up shortly.";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["orderRejected"] = "Order Rejected";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["rejectedOrder"] = "You have rejected order";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["willFindOther"] = "We will find another fleet.";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["confirmTrucking"] = "Trucking Confirmation Request";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["orderLabel"] = "Order:";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["shipmentDetails"] = "Shipment Details";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["route"] = "Route";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["pickupSchedule"] = "Pickup Schedule";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["at"] = "At";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["wib"] = "WIB";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["truckType"] = "Unit Type";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["commodity"] = "Commodity";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["yourBidPrice"] = "Your Bid Price";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["priceChanged"] = "Price changed";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["reset"] = "reset";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["tapToEdit"] = "Tap ✏️ to change price";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["finishEditingFirst"] = "Please finish editing the price first ✓";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["canYouServe"] = "Can you handle this order?";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["acceptBtn"] = "ACCEPT";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["acceptSchedulePrice"] = "SCHEDULE & PRICE";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["rejectBtn"] = "REJECT";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["confirmationDeadline"] = "Confirmation deadline: 24 hours from WA message.";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["loadFailed"] = "Failed to load data. Check your internet connection.";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["sendFailed"] = "Failed to send confirmation. Check your internet connection.";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["invalidLinkError"] = "Invalid confirmation link.";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["errorOccurred"] = "An error occurred";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["doneEditing"] = "Done editing";
if (!locale["vendorConfirm"] || typeof locale["vendorConfirm"] !== 'object') locale["vendorConfirm"] = {};
locale["vendorConfirm"]["editPrice"] = "Edit price";
if (!locale["combobox"] || typeof locale["combobox"] !== 'object') locale["combobox"] = {};
locale["combobox"]["searchCity"] = "Type city name...";
if (!locale["combobox"] || typeof locale["combobox"] !== 'object') locale["combobox"] = {};
locale["combobox"]["searching"] = "Searching location...";
if (!locale["combobox"] || typeof locale["combobox"] !== 'object') locale["combobox"] = {};
locale["combobox"]["airport"] = "IATA Code or City";
if (!locale["langSelector"] || typeof locale["langSelector"] !== 'object') locale["langSelector"] = {};
locale["langSelector"]["ariaLabel"] = "Select language";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["title"] = "Order Cart";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["empty"] = "Cart is empty";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["noItems"] = "No items yet";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["pricePending"] = "Price to follow";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["priceNego"] = "Negotiable";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["vendorMarketplace"] = "Vendor Marketplace";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["pickService"] = "Choose Service";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["pickServiceSub"] = "Choose your logistics service";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["truckingTitle"] = "Trucking Service";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["truckingSub"] = "Fill in details or calculate estimate";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["freightSub"] = "Fill details & calculate cost estimate";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["toastDeliveryRequired"] = "Delivery address is required";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["toastDestRequired"] = "Please fill in Destination Country first";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["toastAirportRequired"] = "Please fill in Destination Airport first";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["toastDestCountryRequired"] = "Destination Country is required";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["toastDestAirportRequired"] = "Destination Airport is required";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["toastUpdated"] = "updated in cart";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["optional"] = "(optional)";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["sesuaiRute"] = "As per route";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["pickupLocation"] = "Pickup Location";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["teamDecides"] = "Our team will determine the pickup location";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["logisticServices"] = "Logistics Services";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["pickupDelivery"] = "Pickup & Delivery";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["estimateCalc"] = "Estimate Calculator";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["auto"] = "Auto";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["deliveryAddress"] = "Delivery Address";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["deliveryAddressPh"] = "Street..., City, Province — delivery destination address";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["deliveryAddressError"] = "Delivery address is required.";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["contactName"] = "Contact Name";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["contactNamePh"] = "PIC Name";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["contactPhone"] = "Phone Number";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["contactPhonePh"] = "08xxxxxxxxxx";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["notesOpt"] = "Notes (optional)";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["notesPh"] = "Special instructions for delivery team...";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["estimateNote"] = "💡 Cost estimate confirmed by team after order is placed.";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["autoFilled"] = "Auto-filled from order products";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["autoFilledNote"] = "Weight & dimensions calculated from cart items. Enter destination city then click Calculate Estimate.";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["originCity"] = "Origin City";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["destCity"] = "Destination City";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["destCityPh"] = "Surabaya, Medan, Makassar...";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["weightKg"] = "Weight (kg)";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["vehicleType"] = "Vehicle Type";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["addToOrder"] = "Add to Order";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["addPricePending"] = "Add (Price to Follow)";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["destCountry"] = "Destination Country";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["destAirport"] = "Destination Airport";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["destCountryError"] = "Destination country is required.";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["shipType"] = "Shipment Type";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["dimensions"] = "Dimensions (cm) — L × W × H";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["goodsType"] = "Goods Type";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["length"] = "Length";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["width"] = "Width";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["height"] = "Height";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["selectOption"] = "Select";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["truckingService"] = "Trucking — Pickup & Delivery";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["truckingCargo"] = "Trucking — Cargo";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["cargoSea"] = "Sea Cargo";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["cargoAir"] = "Air Cargo";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["customClearance"] = "Custom Clearance";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["insuranceEtc"] = "Insurance & Others";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["produk"] = "Product";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["pabean"] = "Customs";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["storage"] = "Storage";
if (!locale["cartDrawer"] || typeof locale["cartDrawer"] !== 'object') locale["cartDrawer"] = {};
locale["cartDrawer"]["ppn"] = "VAT";
if (!locale["contactSupplier"] || typeof locale["contactSupplier"] !== 'object') locale["contactSupplier"] = {};
locale["contactSupplier"]["errorNameRequired"] = "Name is required";
if (!locale["contactSupplier"] || typeof locale["contactSupplier"] !== 'object') locale["contactSupplier"] = {};
locale["contactSupplier"]["errorPhoneRequired"] = "Phone number is required";
if (!locale["contactSupplier"] || typeof locale["contactSupplier"] !== 'object') locale["contactSupplier"] = {};
locale["contactSupplier"]["errorNetwork"] = "Network error occurred. Please try again.";
if (!locale["contactSupplier"] || typeof locale["contactSupplier"] !== 'object') locale["contactSupplier"] = {};
locale["contactSupplier"]["errorGeneral"] = "Failed to send inquiry. Please try again.";
if (!locale["contactSupplier"] || typeof locale["contactSupplier"] !== 'object') locale["contactSupplier"] = {};
locale["contactSupplier"]["cancelBtn"] = "Cancel";
if (!locale["contactSupplier"] || typeof locale["contactSupplier"] !== 'object') locale["contactSupplier"] = {};
locale["contactSupplier"]["sendBtn"] = "Send Inquiry";
if (!locale["contactSupplier"] || typeof locale["contactSupplier"] !== 'object') locale["contactSupplier"] = {};
locale["contactSupplier"]["sending"] = "Sending...";
if (!locale["contactSupplier"] || typeof locale["contactSupplier"] !== 'object') locale["contactSupplier"] = {};
locale["contactSupplier"]["messagePh"] = "Briefly describe your needs...";
if (!locale["waButton"] || typeof locale["waButton"] !== 'object') locale["waButton"] = {};
locale["waButton"]["ariaLabel"] = "Chat via WhatsApp";
if (!locale["waButton"] || typeof locale["waButton"] !== 'object') locale["waButton"] = {};
locale["waButton"]["message"] = "Hello, I would like to inquire about B2B Marketplace and Logistic services.";
if (!locale["editableImage"] || typeof locale["editableImage"] !== 'object') locale["editableImage"] = {};
locale["editableImage"]["uploadFailed"] = "Failed to upload image";
if (!locale["editableImage"] || typeof locale["editableImage"] !== 'object') locale["editableImage"] = {};
locale["editableImage"]["changeImage"] = "Change Image";
if (!locale["gallery"] || typeof locale["gallery"] !== 'object') locale["gallery"] = {};
locale["gallery"]["zoomOut"] = "Zoom Out (−)";
if (!locale["gallery"] || typeof locale["gallery"] !== 'object') locale["gallery"] = {};
locale["gallery"]["zoomIn"] = "Zoom In (+)";
if (!locale["gallery"] || typeof locale["gallery"] !== 'object') locale["gallery"] = {};
locale["gallery"]["close"] = "Close (Esc)";
if (!locale["gallery"] || typeof locale["gallery"] !== 'object') locale["gallery"] = {};
locale["gallery"]["prev"] = "Previous (←)";
if (!locale["gallery"] || typeof locale["gallery"] !== 'object') locale["gallery"] = {};
locale["gallery"]["next"] = "Next (→)";
if (!locale["gallery"] || typeof locale["gallery"] !== 'object') locale["gallery"] = {};
locale["gallery"]["imageUnavailable"] = "Image unavailable";
if (!locale["gallery"] || typeof locale["gallery"] !== 'object') locale["gallery"] = {};
locale["gallery"]["photoAlt"] = "Vendor photo";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["uploadFailed"] = "Upload failed";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["docUploaded"] = "Document uploaded successfully";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["fileUploaded"] = "File uploaded successfully";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["saveFailed"] = "Failed to save media assets";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["saved"] = "✅ Media assets saved";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["saveError"] = "Failed to save";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["dialogTitle"] = "Manage Media Assets —";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["uploadPhoto"] = "Upload Photo / Video";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["uploadDoc"] = "Upload Document (PDF)";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["maxSize"] = "Max 50 MB/file";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["standardDocs"] = "Standard Documents";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["public"] = "🌐 Public";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["private"] = "🔒 Private";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["internal"] = "🏢 Internal";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["visiblePublic"] = "Visible to public";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["notVisiblePublic"] = "Not visible to public";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["notUploaded"] = "Not uploaded";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["preview"] = "Preview";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["download"] = "Download";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["replace"] = "Replace";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["upload"] = "Upload";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["delete"] = "Delete";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["photosVideos"] = "Photos & Videos";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["coverMain"] = "● Main Cover";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["video"] = "Video";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["image"] = "Image";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["setCover"] = "Set as cover";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["coverActive"] = "Cover active";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["moveUp"] = "Move Up";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["moveDown"] = "Move Down";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["documents"] = "Documents";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["noAssets"] = "No media assets yet";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["noAssetsHint"] = "Upload photos/videos or documents using the buttons above";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["uploading"] = "Uploading file…";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["cancel"] = "Cancel";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["saveBtn"] = "Save Media Assets";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["openDoc"] = "Open Document";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["closeBtn"] = "Close";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["visibleOnPublic"] = "Visible on public product page";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["openDocBtn"] = "Open document";
if (!locale["mediaAssets"] || typeof locale["mediaAssets"] !== 'object') locale["mediaAssets"] = {};
locale["mediaAssets"]["docPhotoLabel"] = "Photo title";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["checklist"] = "✅ Preparation Checklist";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["checkAllDone"] = "Check all items that are ready.";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["requiredDocs"] = "📄 Required Documents";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["requiredDocsHint"] = "Enter document number/reference. Original documents submitted on delivery.";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["notFilled"] = "Not filled";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["docRefPh"] = "Doc. No. / Reference...";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["packaging"] = "📦 Handling & Packaging Instructions";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["packagingNotes"] = "Packaging Notes (optional)";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["packagingNotesPh"] = "Custom packaging instructions...";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["packagingLabel"] = "Notes:";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["selectOption"] = "— Select —";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["priceBase"] = "💰 Base Price Summary";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["priceDetail"] = "💰 Price Breakdown";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["priceAnalysis"] = "💰 Price Analysis";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["totalWithPPN"] = "Total (with VAT)";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["totalInclPPN"] = "Total (incl. VAT)";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["vendorBaseNote"] = "* Your base price. Selling price to customer is set by admin.";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["vendorBasePrice"] = "Base Price (Vendor)";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["baseTotal"] = "Base Total";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["customerSellPrice"] = "Selling Price (Customer)";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["sellTotal"] = "Sell Total";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["margin"] = "Margin";
if (!locale["tmpl"] || typeof locale["tmpl"] !== 'object') locale["tmpl"] = {};
locale["tmpl"]["specLabel"] = "Specifications";
if (!locale["companyProfilePage"] || typeof locale["companyProfilePage"] !== 'object') locale["companyProfilePage"] = {};
locale["companyProfilePage"]["changePhoto"] = "Change photo";
if (!locale["companyProfilePage"] || typeof locale["companyProfilePage"] !== 'object') locale["companyProfilePage"] = {};
locale["companyProfilePage"]["addressPh"] = "Company address...";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["sfxOff"] = "Turn off sound effects";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["sfxOn"] = "Turn on sound effects";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["voiceStop"] = "Stop speaking";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["voiceOff"] = "Turn off AI voice";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["voiceOn"] = "Turn on AI voice";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["resetConversation"] = "Reset conversation";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["uploadMedia"] = "Upload image or PDF";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["recordVoice"] = "Hold to record voice, release to send";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["sendMessage"] = "Send message";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["openChat"] = "Chat with AI assistant";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["senderNamePh"] = "Your Name";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["senderPhonePh"] = "Phone Number";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["senderEmailPh"] = "email@...";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["senderCompanyPh"] = "Company / individual";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["destCityPh"] = "Destination City";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["originCityPh"] = "Origin City";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["commodityPh"] = "Electronics, Textiles, etc.";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["weightPh"] = "500";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["cbmPh"] = "2.5";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["additionalInfoPh"] = "Additional info...";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["deliveryAddressPh"] = "Delivery address, special notes...";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["waitingReply"] = "Waiting for reply…";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["speakNow"] = "Speak now…";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["typeOrSpeak"] = "Type or speak…";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["speaking"] = "Speaking…";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["typing"] = "Typing…";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["online"] = "Online";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["openOrderForm"] = "Open order form directly";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["quickOrderTitle"] = "Quick Order Form";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["fullName"] = "Full Name *";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["whatsapp"] = "WhatsApp No. *";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["email"] = "Email";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["companyName"] = "Company Name";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["shipmentType"] = "Shipment Type *";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["originCity"] = "Origin City *";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["destCity"] = "Destination City *";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["commodity"] = "Commodity / Goods Type";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["weightKg"] = "Weight (kg)";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["volumeCbm"] = "Volume (CBM)";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["shippingDate"] = "Shipping Date";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["notesLabel"] = "Notes";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["closeForm"] = "Close";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["submit"] = "Create Order →";
if (!locale["chatWidget"] || typeof locale["chatWidget"] !== 'object') locale["chatWidget"] = {};
locale["chatWidget"]["submitting"] = "Sending…";
if (!locale["freightFwding"] || typeof locale["freightFwding"] !== 'object') locale["freightFwding"] = {};
locale["freightFwding"]["uploadLogo"] = "Upload logo";
if (!locale["freightFwding"] || typeof locale["freightFwding"] !== 'object') locale["freightFwding"] = {};
locale["freightFwding"]["removeLogo"] = "Remove logo";
if (!locale["freightFwding"] || typeof locale["freightFwding"] !== 'object') locale["freightFwding"] = {};
locale["freightFwding"]["senderNamePh"] = "Company / individual name";
if (!locale["freightFwding"] || typeof locale["freightFwding"] !== 'object') locale["freightFwding"] = {};
locale["freightFwding"]["senderAddressPh"] = "Street..., City, Country, Postal Code";
if (!locale["freightFwding"] || typeof locale["freightFwding"] !== 'object') locale["freightFwding"] = {};
locale["freightFwding"]["commodityPh"] = "Electronics, Chemicals, Textiles, etc.";
if (!locale["freightFwding"] || typeof locale["freightFwding"] !== 'object') locale["freightFwding"] = {};
locale["freightFwding"]["fullNamePh"] = "Full name";
if (!locale["freightFwding"] || typeof locale["freightFwding"] !== 'object') locale["freightFwding"] = {};
locale["freightFwding"]["companyPh"] = "Company name...";
if (!locale["freightFwding"] || typeof locale["freightFwding"] !== 'object') locale["freightFwding"] = {};
locale["freightFwding"]["emailPh"] = "email@company.com";
if (!locale["freightFwding"] || typeof locale["freightFwding"] !== 'object') locale["freightFwding"] = {};
locale["freightFwding"]["instructionsPh"] = "Special instructions, additional information, etc.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erpEvent"] || typeof locale["adminPage"]["erpEvent"] !== 'object') locale["adminPage"]["erpEvent"] = {};
locale["adminPage"]["erpEvent"]["freightUpdated"] = "Statistik freight diperbarui otomatis.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erpEvent"] || typeof locale["adminPage"]["erpEvent"] !== 'object') locale["adminPage"]["erpEvent"] = {};
locale["adminPage"]["erpEvent"]["latestLoaded"] = "Data ERP terbaru telah dimuat.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erpEvent"] || typeof locale["adminPage"]["erpEvent"] !== 'object') locale["adminPage"]["erpEvent"] = {};
locale["adminPage"]["erpEvent"]["newOrder"] = "Order baru masuk";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erpEvent"] || typeof locale["adminPage"]["erpEvent"] !== 'object') locale["adminPage"]["erpEvent"] = {};
locale["adminPage"]["erpEvent"]["quoteReceived"] = "Quote vendor diterima";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erpEvent"] || typeof locale["adminPage"]["erpEvent"] !== 'object') locale["adminPage"]["erpEvent"] = {};
locale["adminPage"]["erpEvent"]["rfqUpdated"] = "Data RFQ diperbarui otomatis.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erpEvent"] || typeof locale["adminPage"]["erpEvent"] !== 'object') locale["adminPage"]["erpEvent"] = {};
locale["adminPage"]["erpEvent"]["statsRefreshed"] = "Statistik diperbarui";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erpEvent"] || typeof locale["adminPage"]["erpEvent"] !== 'object') locale["adminPage"]["erpEvent"] = {};
locale["adminPage"]["erpEvent"]["statsUpdated"] = "Statistik portal diperbarui otomatis.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erpEvent"] || typeof locale["adminPage"]["erpEvent"] !== 'object') locale["adminPage"]["erpEvent"] = {};
locale["adminPage"]["erpEvent"]["statusChanged"] = "Status order berubah";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
locale["adminPage"]["erp"]["openBizPortal"] = "Buka BizPortal";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
locale["adminPage"]["erp"]["portalCustomers"] = "Pelanggan Portal";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
locale["adminPage"]["erp"]["purchaseReport"] = "Laporan Purchase";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
locale["adminPage"]["erp"]["realtimeStats"] = "Statistik Real-time";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
locale["adminPage"]["erp"]["refresh"] = "Refresh";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
locale["adminPage"]["erp"]["salesReport"] = "Laporan Sales";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["section"] || typeof locale["adminPage"]["erp"]["section"] !== 'object') locale["adminPage"]["erp"]["section"] = {};
locale["adminPage"]["erp"]["section"]["accounting"] = "Accounting";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["section"] || typeof locale["adminPage"]["erp"]["section"] !== 'object') locale["adminPage"]["erp"]["section"] = {};
locale["adminPage"]["erp"]["section"]["dashboard"] = "Dashboard & Utama";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["section"] || typeof locale["adminPage"]["erp"]["section"] !== 'object') locale["adminPage"]["erp"]["section"] = {};
locale["adminPage"]["erp"]["section"]["expensesReports"] = "Expenses & Reports";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["section"] || typeof locale["adminPage"]["erp"]["section"] !== 'object') locale["adminPage"]["erp"]["section"] = {};
locale["adminPage"]["erp"]["section"]["logistics"] = "Logistik";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["section"] || typeof locale["adminPage"]["erp"]["section"] !== 'object') locale["adminPage"]["erp"]["section"] = {};
locale["adminPage"]["erp"]["section"]["others"] = "Lainnya";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["section"] || typeof locale["adminPage"]["erp"]["section"] !== 'object') locale["adminPage"]["erp"]["section"] = {};
locale["adminPage"]["erp"]["section"]["purchase"] = "Purchase";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["section"] || typeof locale["adminPage"]["erp"]["section"] !== 'object') locale["adminPage"]["erp"]["section"] = {};
locale["adminPage"]["erp"]["section"]["sales"] = "Sales";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["stat"] || typeof locale["adminPage"]["erp"]["stat"] !== 'object') locale["adminPage"]["erp"]["stat"] = {};
locale["adminPage"]["erp"]["stat"]["activeFreight"] = "Freight Aktif";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["stat"] || typeof locale["adminPage"]["erp"]["stat"] !== 'object') locale["adminPage"]["erp"]["stat"] = {};
locale["adminPage"]["erp"]["stat"]["inTransit"] = "Dalam Pengiriman";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["stat"] || typeof locale["adminPage"]["erp"]["stat"] !== 'object') locale["adminPage"]["erp"]["stat"] = {};
locale["adminPage"]["erp"]["stat"]["monthlyRevenue"] = "Revenue Bulan Ini";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["stat"] || typeof locale["adminPage"]["erp"]["stat"] !== 'object') locale["adminPage"]["erp"]["stat"] = {};
locale["adminPage"]["erp"]["stat"]["pendingRfq"] = "RFQ Pending";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["stat"] || typeof locale["adminPage"]["erp"]["stat"] !== 'object') locale["adminPage"]["erp"]["stat"] = {};
locale["adminPage"]["erp"]["stat"]["portalCustomers"] = "Pelanggan Portal";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
if (!locale["adminPage"]["erp"]["stat"] || typeof locale["adminPage"]["erp"]["stat"] !== 'object') locale["adminPage"]["erp"]["stat"] = {};
locale["adminPage"]["erp"]["stat"]["portalOrders"] = "Order Portal (bulan ini)";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
locale["adminPage"]["erp"]["subtitle"] = "Akses cepat ke semua modul ERP internal. Klik modul untuk membuka BizPortal.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
locale["adminPage"]["erp"]["title"] = "BizPortal ERP";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
locale["adminPage"]["erp"]["unifiedCatalog"] = "Katalog Terpadu";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["erp"] || typeof locale["adminPage"]["erp"] !== 'object') locale["adminPage"]["erp"] = {};
locale["adminPage"]["erp"]["updatedAt"] = "Diperbarui";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["header"] || typeof locale["adminPage"]["header"] !== 'object') locale["adminPage"]["header"] = {};
locale["adminPage"]["header"]["title"] = "Admin Panel";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["adminActivation"] = "Aktivasi Admin";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["approvals"] = "Approvals";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["bizportalErp"] = "BizPortal ERP";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["commandCenter"] = "Command Center";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["couriers"] = "Kurir";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["customers"] = "Pelanggan";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["featuredProducts"] = "Produk Unggulan";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["inviteVendor"] = "Undang Vendor";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["managePricing"] = "Kelola Harga";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["manageProducts"] = "Kelola Produk";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["manageServices"] = "Kelola Layanan";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["masterPrice"] = "Master Price";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["menuAriaLabel"] = "Menu navigasi admin";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["miniForms"] = "Mini Form";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["openMenu"] = "Buka menu navigasi";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["paylabsSetting"] = "Paylabs Setting";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["productTemplates"] = "Product Templates";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["sectionMarketplace"] = "Marketplace";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["sectionSystem"] = "Sistem";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["sectionVendorUsers"] = "Vendor & Pengguna";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["sectionWebsite"] = "Website & Konten";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["truckingFleet"] = "Armada Trucking";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["utilities"] = "Utilitas";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["vendorCatalog"] = "Katalog Vendor";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["vendorMarketplace"] = "Vendor Marketplace";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["websiteContent"] = "Konten Website";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["nav"] || typeof locale["adminPage"]["nav"] !== 'object') locale["adminPage"]["nav"] = {};
locale["adminPage"]["nav"]["whatsapp"] = "WhatsApp";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["approvals"] || typeof locale["adminPage"]["tab"]["approvals"] !== 'object') locale["adminPage"]["tab"]["approvals"] = {};
locale["adminPage"]["tab"]["approvals"]["desc"] = "Tinjau dan setujui atau tolak permohonan akun vendor, driver, dan employee yang mendaftar melalui portal.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["approvals"] || typeof locale["adminPage"]["tab"]["approvals"] !== 'object') locale["adminPage"]["tab"]["approvals"] = {};
locale["adminPage"]["tab"]["approvals"]["title"] = "Approval Vendor & Pelanggan";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["claim"] || typeof locale["adminPage"]["tab"]["claim"] !== 'object') locale["adminPage"]["tab"]["claim"] = {};
locale["adminPage"]["tab"]["claim"]["desc"] = "Aktifkan hak akses admin menggunakan kunci rahasia.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["claim"] || typeof locale["adminPage"]["tab"]["claim"] !== 'object') locale["adminPage"]["tab"]["claim"] = {};
locale["adminPage"]["tab"]["claim"]["title"] = "Aktivasi Admin";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["couriers"] || typeof locale["adminPage"]["tab"]["couriers"] !== 'object') locale["adminPage"]["tab"]["couriers"] = {};
locale["adminPage"]["tab"]["couriers"]["desc"] = "Kelola daftar kurir yang ditampilkan ke pelanggan saat memilih pengiriman produk.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["couriers"] || typeof locale["adminPage"]["tab"]["couriers"] !== 'object') locale["adminPage"]["tab"]["couriers"] = {};
locale["adminPage"]["tab"]["couriers"]["title"] = "Vendor Kurir & Pengiriman";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["customers"] || typeof locale["adminPage"]["tab"]["customers"] !== 'object') locale["adminPage"]["tab"]["customers"] = {};
locale["adminPage"]["tab"]["customers"]["desc"] = "List semua akun yang terdaftar di portal — customer, vendor, driver, dan admin.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["customers"] || typeof locale["adminPage"]["tab"]["customers"] !== 'object') locale["adminPage"]["tab"]["customers"] = {};
locale["adminPage"]["tab"]["customers"]["title"] = "Data Pelanggan Portal";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["featuredProducts"] || typeof locale["adminPage"]["tab"]["featuredProducts"] !== 'object') locale["adminPage"]["tab"]["featuredProducts"] = {};
locale["adminPage"]["tab"]["featuredProducts"]["desc"] = "Kelola pengajuan, produk aktif, paket promosi, riwayat, dan verifikasi pembayaran produk unggulan vendor di marketplace.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["featuredProducts"] || typeof locale["adminPage"]["tab"]["featuredProducts"] !== 'object') locale["adminPage"]["tab"]["featuredProducts"] = {};
locale["adminPage"]["tab"]["featuredProducts"]["title"] = "Produk Unggulan";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["masterPrice"] || typeof locale["adminPage"]["tab"]["masterPrice"] !== 'object') locale["adminPage"]["tab"]["masterPrice"] = {};
locale["adminPage"]["tab"]["masterPrice"]["desc"] = "Kelola harga produk marketplace secara terpusat — update satu-satu, bulk, import Excel/CSV, riwayat perubahan, dan approval harga.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["masterPrice"] || typeof locale["adminPage"]["tab"]["masterPrice"] !== 'object') locale["adminPage"]["tab"]["masterPrice"] = {};
locale["adminPage"]["tab"]["masterPrice"]["title"] = "Master Price Management";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["miniForms"] || typeof locale["adminPage"]["tab"]["miniForms"] !== 'object') locale["adminPage"]["tab"]["miniForms"] = {};
locale["adminPage"]["tab"]["miniForms"]["customer"] = "Customer";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["miniForms"] || typeof locale["adminPage"]["tab"]["miniForms"] !== 'object') locale["adminPage"]["tab"]["miniForms"] = {};
locale["adminPage"]["tab"]["miniForms"]["desc"] = "Create dan kelola link form dinamis. Bagikan ke penerima — mereka cukup membuka link dan mengisi form tanpa perlu login.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["miniForms"] || typeof locale["adminPage"]["tab"]["miniForms"] !== 'object') locale["adminPage"]["tab"]["miniForms"] = {};
locale["adminPage"]["tab"]["miniForms"]["internal"] = "Internal";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["miniForms"] || typeof locale["adminPage"]["tab"]["miniForms"] !== 'object') locale["adminPage"]["tab"]["miniForms"] = {};
locale["adminPage"]["tab"]["miniForms"]["title"] = "Mini Form";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["miniForms"] || typeof locale["adminPage"]["tab"]["miniForms"] !== 'object') locale["adminPage"]["tab"]["miniForms"] = {};
locale["adminPage"]["tab"]["miniForms"]["vendor"] = "Vendor";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["pricing"] || typeof locale["adminPage"]["tab"]["pricing"] !== 'object') locale["adminPage"]["tab"]["pricing"] = {};
locale["adminPage"]["tab"]["pricing"]["desc"] = "Atur tarif trucking dan tarif freight internasional.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["pricing"] || typeof locale["adminPage"]["tab"]["pricing"] !== 'object') locale["adminPage"]["tab"]["pricing"] = {};
locale["adminPage"]["tab"]["pricing"]["title"] = "Kelola Harga Trucking & Freight";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["products"] || typeof locale["adminPage"]["tab"]["products"] !== 'object') locale["adminPage"]["tab"]["products"] = {};
locale["adminPage"]["tab"]["products"]["desc"] = "Edit nama, deskripsi, harga, dan gambar untuk setiap produk.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["products"] || typeof locale["adminPage"]["tab"]["products"] !== 'object') locale["adminPage"]["tab"]["products"] = {};
locale["adminPage"]["tab"]["products"]["title"] = "Kelola Produk";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["productTemplates"] || typeof locale["adminPage"]["tab"]["productTemplates"] !== 'object') locale["adminPage"]["tab"]["productTemplates"] = {};
locale["adminPage"]["tab"]["productTemplates"]["desc"] = "Referensi template komoditas multi-jenis — custom fields, dokumen wajib, checklist operasional, dan instruksi pengemasan per kategori barang.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["productTemplates"] || typeof locale["adminPage"]["tab"]["productTemplates"] !== 'object') locale["adminPage"]["tab"]["productTemplates"] = {};
locale["adminPage"]["tab"]["productTemplates"]["title"] = "Product Template Engine";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["services"] || typeof locale["adminPage"]["tab"]["services"] !== 'object') locale["adminPage"]["tab"]["services"] = {};
locale["adminPage"]["tab"]["services"]["desc"] = "Edit nama, deskripsi, harga, dan gambar untuk setiap layanan.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["services"] || typeof locale["adminPage"]["tab"]["services"] !== 'object') locale["adminPage"]["tab"]["services"] = {};
locale["adminPage"]["tab"]["services"]["title"] = "Kelola Layanan";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["truckingFleet"] || typeof locale["adminPage"]["tab"]["truckingFleet"] !== 'object') locale["adminPage"]["tab"]["truckingFleet"] = {};
locale["adminPage"]["tab"]["truckingFleet"]["desc"] = "Upload gambar dan atur urutan tampil kendaraan di halaman Trucking.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["truckingFleet"] || typeof locale["adminPage"]["tab"]["truckingFleet"] !== 'object') locale["adminPage"]["tab"]["truckingFleet"] = {};
locale["adminPage"]["tab"]["truckingFleet"]["title"] = "Gambar & Urutan Armada Trucking";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["utilities"] || typeof locale["adminPage"]["tab"]["utilities"] !== 'object') locale["adminPage"]["tab"]["utilities"] = {};
locale["adminPage"]["tab"]["utilities"]["desc"] = "Alat pembersihan dan perbaikan data — jalankan hanya jika diperlukan.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["utilities"] || typeof locale["adminPage"]["tab"]["utilities"] !== 'object') locale["adminPage"]["tab"]["utilities"] = {};
locale["adminPage"]["tab"]["utilities"]["fixJasaNames"] = "Perbaiki Nama Produk \\";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["utilities"] || typeof locale["adminPage"]["tab"]["utilities"] !== 'object') locale["adminPage"]["tab"]["utilities"] = {};
locale["adminPage"]["tab"]["utilities"]["title"] = "Utilitas Admin";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["waLogs"] || typeof locale["adminPage"]["tab"]["waLogs"] !== 'object') locale["adminPage"]["tab"]["waLogs"] = {};
locale["adminPage"]["tab"]["waLogs"]["desc"] = "Pantau status pengiriman notifikasi WhatsApp — terkirim, gagal, atau deduplikasi — dan kirim ulang pesan yang gagal secara manual.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["waLogs"] || typeof locale["adminPage"]["tab"]["waLogs"] !== 'object') locale["adminPage"]["tab"]["waLogs"] = {};
locale["adminPage"]["tab"]["waLogs"]["title"] = "Log Notifikasi WhatsApp";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["websiteContent"] || typeof locale["adminPage"]["tab"]["websiteContent"] !== 'object') locale["adminPage"]["tab"]["websiteContent"] = {};
locale["adminPage"]["tab"]["websiteContent"]["desc"] = "Edit teks yang tampil di berbagai bagian website publik.";
if (!locale["adminPage"] || typeof locale["adminPage"] !== 'object') locale["adminPage"] = {};
if (!locale["adminPage"]["tab"] || typeof locale["adminPage"]["tab"] !== 'object') locale["adminPage"]["tab"] = {};
if (!locale["adminPage"]["tab"]["websiteContent"] || typeof locale["adminPage"]["tab"]["websiteContent"] !== 'object') locale["adminPage"]["tab"]["websiteContent"] = {};
locale["adminPage"]["tab"]["websiteContent"]["title"] = "Konten Website";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["adminPanel"] = "Admin Panel";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["agreeOriginalPrice"] = "Setuju harga asal";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["alreadyConfirmed"] = "Sudah Dikonfirmasi";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["awbBlNo"] = "AWB/BL No.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["backToReview"] = "Kembali ke halaman review";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["basePrice"] = "Harga Dasar";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["blastBtn"] = "Blast ke";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["bookingNo"] = "Booking No.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["carrier"] = "Carrier";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["cheapestFirst"] = "Termurah di atas";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["cheapest"] = "Termurah";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["comeBackLater"] = "Kembali ke halaman ini setelah vendor mengisi penawaran.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["commodityBadge"] = "Komoditi";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["commodityLabel"] = "Komoditi";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["compareAfterBlast"] = "Setelah vendor mengisi penawaran, bandingkan dan pilih vendor terbaik:";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["compareTitle"] = "Bandingkan Penawaran";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["compareVendorBtn"] = "Bandingkan Penawaran Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["compareVendorTitle"] = "Bandingkan Penawaran Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["confirmFulfillmentTitle"] = "Confirm Fulfillment";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["confirmFulfillmentVendorTitle"] = "Confirm Fulfillment Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["confirming"] = "Mengkonfirmasi…";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["confirmStartShipment"] = "Confirm & Mulai Pengiriman";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["connectionTimeout"] = "Koneksi timeout. Server lambat merespons, silakan coba lagi.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["continueBlastNote"] = "Melanjutkan blast akan menambah vendor ke RFQ yang sudah ada.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["customerWillGetWAAfterConfirm"] = "Customer akan mendapat notifikasi WhatsApp setelah dikonfirmasi";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["customerWillGetWA"] = "Customer akan mendapat notifikasi WhatsApp.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["customsDocs"] = "Dokumen Customs";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["customsPic"] = "PIC Customs";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["dataFillDeadline"] = "Batas Waktu Pengisian Data";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["deadlineLabel2"] = "Batas Waktu";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["deadlineLabel"] = "batas waktu";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["documentsLabel"] = "Document";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["dppBasePrice"] = "DPP (Harga Dasar)";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["driverLabel"] = "Driver";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["driverPhone"] = "HP Driver";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["estPickup"] = "Est. Pickup";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["etaCustoms"] = "ETA Customs";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["eta"] = "ETA";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["etd"] = "ETD";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["failed"] = "gagal";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["failedShort"] = "Failed";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["fillPriceFirst"] = "Isi harga jual terlebih dahulu sebelum mengirim ke customer.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["forwardAfterApproval"] = "Forward ke vendor akan tersedia setelah customer menyetujui penawaran.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["forwardTaskToVendor"] = "Forward Tugas ke Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["forwardToVendor"] = "Forward ke Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["fulfillLinkSentViaWA"] = "Link fulfillment berhasil dikirim ke WA";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["fulfillmentDataFromVendor"] = "Data Fulfillment dari Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["fulfillmentTaskSent"] = "Tugas fulfillment sudah dikirim ke vendor pada";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["goBackToSelectVendor"] = "Kembali ke langkah sebelumnya untuk memilih vendor dari penawaran yang masuk.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["grandTotal"] = "Grand Total";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["hide"] = "Sembunyikan";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["hoursUnit"] = "jam";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["instrConfirmEta"] = "Confirm estimasi waktu siap kirim";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["instrConfirmPrice"] = "Confirm harga penawaran";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["instrConfirmStock"] = "Confirm ketersediaan stok";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["instrUploadInvoice"] = "Upload invoice / dokumen pendukung jika ada";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["invalidLink"] = "Link Tidak Valid";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["invoice"] = "Invoice";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["itemDetail"] = "Detail Barang";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["leadTime"] = "Lead Time";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["linkAlreadyUsed"] = "Link Sudah Digunakan";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["loadingData"] = "Memuat data…";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["loadingWait"] = "Harap tunggu sebentar…";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["matchesCommodity"] = "Sesuai Komoditi";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["matchesService"] = "Sesuai Layanan";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["moreVendors"] = "vendor lainnya";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["newOrderLabel"] = "Order Baru";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["nextStep"] = "Langkah Selanjutnya";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["noActiveVendors"] = "Tidak ada vendor aktif dengan nomor HP yang tersimpan.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["noFulfillmentData"] = "Belum ada data fulfillment dari vendor.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["notes"] = "Notes";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["notesOptional"] = "Catatan (opsional)";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["notesPlaceholder"] = "Syarat & kondisi, catatan untuk customer…";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["notMatchingService"] = "tidak sesuai tipe layanan";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["notYetResponded"] = "Belum Respon";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["noVendorResponded"] = "Belum ada vendor yang merespon.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["nowInProgress"] = "sekarang berstatus";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["offerPrice"] = "Harga Penawaran";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["openBizPortal"] = "Buka BizPortal untuk detail RFQ";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["orderConfirmedAt"] = "Order ini sudah dikonfirmasi pada";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["orderConfirmed"] = "Order Dikonfirmasi!";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["orderLabel"] = "Order";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["orderNoLabel"] = "No. Order";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["orderTypeLabel"] = "Tipe Order";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["orderValue"] = "Nilai Order";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["otherService"] = "Lainnya…";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["otherVendors"] = "Vendor Lain";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["plateNumber"] = "Plat Nomor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["ppn11"] = "PPN 11%";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["priceLabel"] = "Price";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["pricePerUnit"] = "Harga/Unit";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["productDetail"] = "Detail Produk";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["productFulfillment"] = "Pemenuhan Produk / Product Fulfillment";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["productLabel"] = "Product";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["productName"] = "Nama Produk";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["qtyConfirmed"] = "Qty Konfirmasi";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["qty"] = "Qty";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["quoteSentToCustomer"] = "Penawaran Terkirim ke Customer";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["readyToShip"] = "Siap Kirim";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["reset"] = "Reset";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["responded"] = "Sudah Respon";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["retryBtn"] = "Coba Lagi";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["revisedPrice"] = "Revisi";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["rfqAlreadyCreated"] = "RFQ sudah pernah dibuat";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["rfqNoLabel"] = "No. RFQ";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["rfqSent"] = "RFQ Terkirim!";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["routeLabel"] = "Rute";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["saving"] = "Menyimpan…";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["selectAll"] = "Select Semua";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["selectedVendorBadge"] = "Vendor Terpilih";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["selectedVendorPrice"] = "Harga vendor dipilih";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["selectVendorBtn"] = "Select Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["selectVendorNote"] = "Memilih vendor akan menandai RFQ sebagai selesai · Vendor lain ditandai tidak dipilih";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["sellingPriceLabel"] = "Harga Jual ke Customer";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["sellingPricePlaceholder"] = "Contoh: 5000000";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["sellingPriceRp"] = "Harga Jual (Rp)";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["sellingPriceTitle"] = "Harga Jual ke Customer";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["sending"] = "Mengirim…";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["sendProductTaskBtn"] = "Send Tugas Produk ke";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["sendProductTaskToVendor"] = "Send Tugas Produk ke Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["sendQuoteDesc"] = "Customer akan menerima link untuk menyetujui / menolak harga";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["sendQuoteViaWA"] = "Send penawaran ke customer via WA";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["sendTaskBtn"] = "Send Tugas ke";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["sent"] = "Terkirim";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["serviceBadge"] = "Service";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["serviceLabel"] = "Service";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["serviceTypeDesc"] = "Layanan yang harus dieksekusi vendor untuk order ini";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["serviceTypeTitle"] = "Jenis Layanan";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["shipFlight"] = "Kapal/Flight";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["showLess"] = "Tampilkan lebih sedikit";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["showMoreVendors"] = "Tampilkan";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["show"] = "Tampilkan";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["statusLabel"] = "Status";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["stockLabel"] = "Stok";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["stockPhoto"] = "Foto Stok";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["submittedAt"] = "Masuk";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["subtotal"] = "Subtotal";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["supportingDoc"] = "Dok. Pendukung";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["taskSent"] = "Tugas Terkirim!";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["taskType"] = "Jenis Tugas";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["totalActive"] = "total aktif";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["total"] = "Total";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["totalVendors"] = "Total Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["typeServicePlaceholder"] = "Ketik jenis layanan…";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["unit"] = "Satuan";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["useThisPrice"] = "Pakai harga ini";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vehicleType"] = "Kendaraan";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorAlreadySelected"] = "Vendor sudah dipilih sebelumnya pada";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorContacted"] = "vendor berhasil dihubungi";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorFillDataViaLink"] = "Vendor akan mengisi data pengiriman, BL, dan dokumen melalui link tersebut.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorGotLinkViaWA"] = "Vendor Sudah Dapat Link via WA";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorInstructions"] = "Instruksi untuk Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorLabel"] = "Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorNotes"] = "Catatan Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorNotSelected"] = "Vendor Belum Dipilih";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorQuotes"] = "Penawaran Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorReceiveWAFulfill"] = "Vendor akan menerima WA dengan link form pengisian data fulfillment";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorReceiveWAProduct"] = "Vendor akan menerima WA dengan link form konfirmasi produk";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorSelectedBadge"] = "Vendor Dipilih";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorSelectedCount"] = "vendor dipilih";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorSelectedDesc"] = "dipilih sebagai vendor untuk order ini.";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorSelected"] = "Vendor Dipilih!";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["vendorUnit"] = "Vendor";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["waitingCustomerApproval"] = "Menunggu Persetujuan Customer";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["waiting"] = "Menunggu";
if (!locale["adminReview"] || typeof locale["adminReview"] !== 'object') locale["adminReview"] = {};
locale["adminReview"]["warehouseLocation"] = "Lokasi Gudang";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["addedBtn"] = "Ditambahkan!";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["addToCartBtn"] = "Tambahkan ke Pesanan";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["airFreight"] || typeof locale["jasaVendorDetail"]["airFreight"] !== 'object') locale["jasaVendorDetail"]["airFreight"] = {};
locale["jasaVendorDetail"]["airFreight"]["destAirport"] = "Bandara Tujuan";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["airFreight"] || typeof locale["jasaVendorDetail"]["airFreight"] !== 'object') locale["jasaVendorDetail"]["airFreight"] = {};
locale["jasaVendorDetail"]["airFreight"]["dimensionLabel"] = "Dimensi per Koli (cm, untuk volume weight)";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["airFreight"] || typeof locale["jasaVendorDetail"]["airFreight"] !== 'object') locale["jasaVendorDetail"]["airFreight"] = {};
locale["jasaVendorDetail"]["airFreight"]["grossWeight"] = "Berat Kotor (kg)";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["airFreight"] || typeof locale["jasaVendorDetail"]["airFreight"] !== 'object') locale["jasaVendorDetail"]["airFreight"] = {};
locale["jasaVendorDetail"]["airFreight"]["koli"] = "koli";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["airFreight"] || typeof locale["jasaVendorDetail"]["airFreight"] !== 'object') locale["jasaVendorDetail"]["airFreight"] = {};
locale["jasaVendorDetail"]["airFreight"]["originAirport"] = "Bandara Asal";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["airFreight"] || typeof locale["jasaVendorDetail"]["airFreight"] !== 'object') locale["jasaVendorDetail"]["airFreight"] = {};
locale["jasaVendorDetail"]["airFreight"]["packageQty"] = "Jumlah Koli";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["airFreight"] || typeof locale["jasaVendorDetail"]["airFreight"] !== 'object') locale["jasaVendorDetail"]["airFreight"] = {};
locale["jasaVendorDetail"]["airFreight"]["volumeWeightInfo"] = "Volume weight:";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["available"] = "Tersedia";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["back"] = "Back";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["backToMarketplace"] = "Kembali ke Marketplace";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["calculator"] || typeof locale["jasaVendorDetail"]["calculator"] !== 'object') locale["jasaVendorDetail"]["calculator"] = {};
locale["jasaVendorDetail"]["calculator"]["subtitle"] = "Isi detail pengiriman untuk estimasi biaya";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["calculator"] || typeof locale["jasaVendorDetail"]["calculator"] !== 'object') locale["jasaVendorDetail"]["calculator"] = {};
locale["jasaVendorDetail"]["calculator"]["title"] = "Kalkulator Estimasi";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["calculator"] || typeof locale["jasaVendorDetail"]["calculator"] !== 'object') locale["jasaVendorDetail"]["calculator"] = {};
locale["jasaVendorDetail"]["calculator"]["typeLabel"] = "Tipe:";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["categoryLabelFallback"] = "Service";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["description"] = "Description";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["document"] || typeof locale["jasaVendorDetail"]["document"] !== 'object') locale["jasaVendorDetail"]["document"] = {};
locale["jasaVendorDetail"]["document"]["documentName"] = "Nama / Jenis Dokumen";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["document"] || typeof locale["jasaVendorDetail"]["document"] !== 'object') locale["jasaVendorDetail"]["document"] = {};
locale["jasaVendorDetail"]["document"]["documentNamePlaceholder"] = "Contoh: Surat Jalan, SKA, COO…";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["document"] || typeof locale["jasaVendorDetail"]["document"] !== 'object') locale["jasaVendorDetail"]["document"] = {};
locale["jasaVendorDetail"]["document"]["documentQty"] = "Jumlah Dokumen";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["general"] || typeof locale["jasaVendorDetail"]["general"] !== 'object') locale["jasaVendorDetail"]["general"] = {};
locale["jasaVendorDetail"]["general"]["quantity"] = "Kuantitas";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["handling"] || typeof locale["jasaVendorDetail"]["handling"] !== 'object') locale["jasaVendorDetail"]["handling"] = {};
locale["jasaVendorDetail"]["handling"]["handlingType"] = "Jenis Handling";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["handling"] || typeof locale["jasaVendorDetail"]["handling"] !== 'object') locale["jasaVendorDetail"]["handling"] = {};
locale["jasaVendorDetail"]["handling"]["other"] = "Lainnya";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["handling"] || typeof locale["jasaVendorDetail"]["handling"] !== 'object') locale["jasaVendorDetail"]["handling"] = {};
locale["jasaVendorDetail"]["handling"]["quantity"] = "Kuantitas";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["loading"] = "Memuat detail layanan…";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["meta"] || typeof locale["jasaVendorDetail"]["meta"] !== 'object') locale["jasaVendorDetail"]["meta"] = {};
locale["jasaVendorDetail"]["meta"]["currency"] = "Mata Uang";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["meta"] || typeof locale["jasaVendorDetail"]["meta"] !== 'object') locale["jasaVendorDetail"]["meta"] = {};
locale["jasaVendorDetail"]["meta"]["location"] = "Lokasi";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["meta"] || typeof locale["jasaVendorDetail"]["meta"] !== 'object') locale["jasaVendorDetail"]["meta"] = {};
locale["jasaVendorDetail"]["meta"]["minOrder"] = "Min. Order";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["meta"] || typeof locale["jasaVendorDetail"]["meta"] !== 'object') locale["jasaVendorDetail"]["meta"] = {};
locale["jasaVendorDetail"]["meta"]["origin"] = "Origin";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["meta"] || typeof locale["jasaVendorDetail"]["meta"] !== 'object') locale["jasaVendorDetail"]["meta"] = {};
locale["jasaVendorDetail"]["meta"]["serviceType"] = "Tipe Layanan";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["meta"] || typeof locale["jasaVendorDetail"]["meta"] !== 'object') locale["jasaVendorDetail"]["meta"] = {};
locale["jasaVendorDetail"]["meta"]["subcategory"] = "Sub-kategori";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["minOrder"] = "Min. order:";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["noPriceHint"] = "Hubungi vendor untuk penawaran.";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["noPriceMessage"] = "Harga belum tersedia.";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["notFound"] || typeof locale["jasaVendorDetail"]["notFound"] !== 'object') locale["jasaVendorDetail"]["notFound"] = {};
locale["jasaVendorDetail"]["notFound"]["desc"] = "Item ini tidak tersedia atau belum dipublikasikan.";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["notFound"] || typeof locale["jasaVendorDetail"]["notFound"] !== 'object') locale["jasaVendorDetail"]["notFound"] = {};
locale["jasaVendorDetail"]["notFound"]["title"] = "Layanan tidak ditemukan";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["ppjk"] || typeof locale["jasaVendorDetail"]["ppjk"] !== 'object') locale["jasaVendorDetail"]["ppjk"] = {};
locale["jasaVendorDetail"]["ppjk"]["documentQty"] = "Jumlah Dokumen";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["ppjk"] || typeof locale["jasaVendorDetail"]["ppjk"] !== 'object') locale["jasaVendorDetail"]["ppjk"] = {};
locale["jasaVendorDetail"]["ppjk"]["documentType"] = "Jenis Dokumen";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["ppjk"] || typeof locale["jasaVendorDetail"]["ppjk"] !== 'object') locale["jasaVendorDetail"]["ppjk"] = {};
locale["jasaVendorDetail"]["ppjk"]["other"] = "Lainnya";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["ppjk"] || typeof locale["jasaVendorDetail"]["ppjk"] !== 'object') locale["jasaVendorDetail"]["ppjk"] = {};
locale["jasaVendorDetail"]["ppjk"]["shipmentType"] = "Jenis Shipment";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["seaFreight"] || typeof locale["jasaVendorDetail"]["seaFreight"] !== 'object') locale["jasaVendorDetail"]["seaFreight"] = {};
locale["jasaVendorDetail"]["seaFreight"]["containerQty"] = "Jumlah Kontainer";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["seaFreight"] || typeof locale["jasaVendorDetail"]["seaFreight"] !== 'object') locale["jasaVendorDetail"]["seaFreight"] = {};
locale["jasaVendorDetail"]["seaFreight"]["containerType"] = "Tipe Kontainer";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["seaFreight"] || typeof locale["jasaVendorDetail"]["seaFreight"] !== 'object') locale["jasaVendorDetail"]["seaFreight"] = {};
locale["jasaVendorDetail"]["seaFreight"]["destPort"] = "Pelabuhan Tujuan";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["seaFreight"] || typeof locale["jasaVendorDetail"]["seaFreight"] !== 'object') locale["jasaVendorDetail"]["seaFreight"] = {};
locale["jasaVendorDetail"]["seaFreight"]["destPortPlaceholder"] = "Tanjung Perak";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["seaFreight"] || typeof locale["jasaVendorDetail"]["seaFreight"] !== 'object') locale["jasaVendorDetail"]["seaFreight"] = {};
locale["jasaVendorDetail"]["seaFreight"]["originPort"] = "Pelabuhan Asal";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["seaFreight"] || typeof locale["jasaVendorDetail"]["seaFreight"] !== 'object') locale["jasaVendorDetail"]["seaFreight"] = {};
locale["jasaVendorDetail"]["seaFreight"]["originPortPlaceholder"] = "Tanjung Priok";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["seaFreight"] || typeof locale["jasaVendorDetail"]["seaFreight"] !== 'object') locale["jasaVendorDetail"]["seaFreight"] = {};
locale["jasaVendorDetail"]["seaFreight"]["shipmentMode"] = "Mode Pengiriman";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["seaFreight"] || typeof locale["jasaVendorDetail"]["seaFreight"] !== 'object') locale["jasaVendorDetail"]["seaFreight"] = {};
locale["jasaVendorDetail"]["seaFreight"]["volumeCbm"] = "Volume (CBM)";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["sellingPrice"] = "Harga Jual";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["serviceInfo"] = "Informasi Layanan";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["specGrid"] || typeof locale["jasaVendorDetail"]["specGrid"] !== 'object') locale["jasaVendorDetail"]["specGrid"] = {};
locale["jasaVendorDetail"]["specGrid"]["title"] = "Spesifikasi Layanan";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["summary"] || typeof locale["jasaVendorDetail"]["summary"] !== 'object') locale["jasaVendorDetail"]["summary"] = {};
locale["jasaVendorDetail"]["summary"]["disclaimer"] = "* Estimasi awal. Harga final dikonfirmasi vendor.";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["summary"] || typeof locale["jasaVendorDetail"]["summary"] !== 'object') locale["jasaVendorDetail"]["summary"] = {};
locale["jasaVendorDetail"]["summary"]["ppn"] = "PPN 11%";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["summary"] || typeof locale["jasaVendorDetail"]["summary"] !== 'object') locale["jasaVendorDetail"]["summary"] = {};
locale["jasaVendorDetail"]["summary"]["title"] = "Ringkasan Estimasi";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["summary"] || typeof locale["jasaVendorDetail"]["summary"] !== 'object') locale["jasaVendorDetail"]["summary"] = {};
locale["jasaVendorDetail"]["summary"]["totalEstimate"] = "Total Estimasi";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["summary"] || typeof locale["jasaVendorDetail"]["summary"] !== 'object') locale["jasaVendorDetail"]["summary"] = {};
locale["jasaVendorDetail"]["summary"]["unitPrice"] = "Harga Satuan";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["toast"] || typeof locale["jasaVendorDetail"]["toast"] !== 'object') locale["jasaVendorDetail"]["toast"] = {};
locale["jasaVendorDetail"]["toast"]["addedTitle"] = "Ditambahkan ke pesanan";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["toast"] || typeof locale["jasaVendorDetail"]["toast"] !== 'object') locale["jasaVendorDetail"]["toast"] = {};
locale["jasaVendorDetail"]["toast"]["continueAction"] = "Lanjut →";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["toast"] || typeof locale["jasaVendorDetail"]["toast"] !== 'object') locale["jasaVendorDetail"]["toast"] = {};
locale["jasaVendorDetail"]["toast"]["continueAlt"] = "Lanjut ke Pesanan";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["trucking"] || typeof locale["jasaVendorDetail"]["trucking"] !== 'object') locale["jasaVendorDetail"]["trucking"] = {};
locale["jasaVendorDetail"]["trucking"]["destCity"] = "Kota Tujuan";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["trucking"] || typeof locale["jasaVendorDetail"]["trucking"] !== 'object') locale["jasaVendorDetail"]["trucking"] = {};
locale["jasaVendorDetail"]["trucking"]["destCityPlaceholder"] = "Surabaya";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["trucking"] || typeof locale["jasaVendorDetail"]["trucking"] !== 'object') locale["jasaVendorDetail"]["trucking"] = {};
locale["jasaVendorDetail"]["trucking"]["loadingFee"] = "Biaya Muat (opsional)";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["trucking"] || typeof locale["jasaVendorDetail"]["trucking"] !== 'object') locale["jasaVendorDetail"]["trucking"] = {};
locale["jasaVendorDetail"]["trucking"]["originCity"] = "Kota Asal";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["trucking"] || typeof locale["jasaVendorDetail"]["trucking"] !== 'object') locale["jasaVendorDetail"]["trucking"] = {};
locale["jasaVendorDetail"]["trucking"]["originCityPlaceholder"] = "Jakarta";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["trucking"] || typeof locale["jasaVendorDetail"]["trucking"] !== 'object') locale["jasaVendorDetail"]["trucking"] = {};
locale["jasaVendorDetail"]["trucking"]["tripQty"] = "Jumlah Trip";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["trucking"] || typeof locale["jasaVendorDetail"]["trucking"] !== 'object') locale["jasaVendorDetail"]["trucking"] = {};
locale["jasaVendorDetail"]["trucking"]["truckType"] = "Jenis Truk";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["trucking"] || typeof locale["jasaVendorDetail"]["trucking"] !== 'object') locale["jasaVendorDetail"]["trucking"] = {};
locale["jasaVendorDetail"]["trucking"]["truckTypePlaceholder"] = "Select jenis truk…";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["trucking"] || typeof locale["jasaVendorDetail"]["trucking"] !== 'object') locale["jasaVendorDetail"]["trucking"] = {};
locale["jasaVendorDetail"]["trucking"]["unloadingFee"] = "Biaya Bongkar (opsional)";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["unavailable"] || typeof locale["jasaVendorDetail"]["unavailable"] !== 'object') locale["jasaVendorDetail"]["unavailable"] = {};
locale["jasaVendorDetail"]["unavailable"]["desc"] = "Layanan ini telah dihapus atau tidak lagi dipublikasikan oleh vendor.";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
if (!locale["jasaVendorDetail"]["unavailable"] || typeof locale["jasaVendorDetail"]["unavailable"] !== 'object') locale["jasaVendorDetail"]["unavailable"] = {};
locale["jasaVendorDetail"]["unavailable"]["title"] = "Layanan Tidak Tersedia";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["vendorCatalogTitle"] = "View semua katalog";
if (!locale["jasaVendorDetail"] || typeof locale["jasaVendorDetail"] !== 'object') locale["jasaVendorDetail"] = {};
locale["jasaVendorDetail"]["whatsappBtn"] = "Tanya via WhatsApp";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
locale["logisticAdmin"]["cancel"] = "Cancel";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
locale["logisticAdmin"]["checkingSession"] = "Memeriksa sesi...";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["col"] || typeof locale["logisticAdmin"]["col"] !== 'object') locale["logisticAdmin"]["col"] = {};
locale["logisticAdmin"]["col"]["category"] = "Kategori";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["col"] || typeof locale["logisticAdmin"]["col"] !== 'object') locale["logisticAdmin"]["col"] = {};
locale["logisticAdmin"]["col"]["company"] = "Company";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["col"] || typeof locale["logisticAdmin"]["col"] !== 'object') locale["logisticAdmin"]["col"] = {};
locale["logisticAdmin"]["col"]["date"] = "Date";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["col"] || typeof locale["logisticAdmin"]["col"] !== 'object') locale["logisticAdmin"]["col"] = {};
locale["logisticAdmin"]["col"]["price"] = "Price";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["col"] || typeof locale["logisticAdmin"]["col"] !== 'object') locale["logisticAdmin"]["col"] = {};
locale["logisticAdmin"]["col"]["serviceName"] = "Nama Jasa";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["col"] || typeof locale["logisticAdmin"]["col"] !== 'object') locale["logisticAdmin"]["col"] = {};
locale["logisticAdmin"]["col"]["status"] = "Status";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["col"] || typeof locale["logisticAdmin"]["col"] !== 'object') locale["logisticAdmin"]["col"] = {};
locale["logisticAdmin"]["col"]["total"] = "Total";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["col"] || typeof locale["logisticAdmin"]["col"] !== 'object') locale["logisticAdmin"]["col"] = {};
locale["logisticAdmin"]["col"]["type"] = "Tipe";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["col"] || typeof locale["logisticAdmin"]["col"] !== 'object') locale["logisticAdmin"]["col"] = {};
locale["logisticAdmin"]["col"]["unit"] = "Satuan";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["activated"] = "Jasa diaktifkan";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["active"] = "Aktif";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["addBtn"] = "Add Jasa";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["added"] = "Jasa ditambahkan";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["addTitle"] = "Add Jasa Baru";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["confirmDelete"] = "Ya, Hapus";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["deactivated"] = "Jasa dinonaktifkan";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["deleteDesc1"] = "Jasa";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["deleteDesc2"] = "akan dihapus permanen dan tidak akan muncul lagi di pilihan pengiriman. Tindakan ini tidak bisa dibatalkan.";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["deleted"] = "Jasa dihapus";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["deleteError"] = "Gagal menghapus";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["deleteTitle"] = "Delete Jasa?";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["editTitle"] = "Edit Jasa";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["empty"] = "Belum ada jasa";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["emptyHint"] = "Klik \\";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
if (!locale["logisticAdmin"]["jasa"]["form"] || typeof locale["logisticAdmin"]["jasa"]["form"] !== 'object') locale["logisticAdmin"]["jasa"]["form"] = {};
locale["logisticAdmin"]["jasa"]["form"]["categoryHint"] = "(bebas ketik atau pilih)";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
if (!locale["logisticAdmin"]["jasa"]["form"] || typeof locale["logisticAdmin"]["jasa"]["form"] !== 'object') locale["logisticAdmin"]["jasa"]["form"] = {};
locale["logisticAdmin"]["jasa"]["form"]["categoryLabel"] = "Jenis / Kategori";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
if (!locale["logisticAdmin"]["jasa"]["form"] || typeof locale["logisticAdmin"]["jasa"]["form"] !== 'object') locale["logisticAdmin"]["jasa"]["form"] = {};
locale["logisticAdmin"]["jasa"]["form"]["categoryPlaceholder"] = "cth: Trucking, Udara, Pabean…";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
if (!locale["logisticAdmin"]["jasa"]["form"] || typeof locale["logisticAdmin"]["jasa"]["form"] !== 'object') locale["logisticAdmin"]["jasa"]["form"] = {};
locale["logisticAdmin"]["jasa"]["form"]["descLabel"] = "Description";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
if (!locale["logisticAdmin"]["jasa"]["form"] || typeof locale["logisticAdmin"]["jasa"]["form"] !== 'object') locale["logisticAdmin"]["jasa"]["form"] = {};
locale["logisticAdmin"]["jasa"]["form"]["descPlaceholder"] = "Deskripsi singkat jasa (opsional)";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
if (!locale["logisticAdmin"]["jasa"]["form"] || typeof locale["logisticAdmin"]["jasa"]["form"] !== 'object') locale["logisticAdmin"]["jasa"]["form"] = {};
locale["logisticAdmin"]["jasa"]["form"]["nameLabel"] = "Nama Jasa *";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
if (!locale["logisticAdmin"]["jasa"]["form"] || typeof locale["logisticAdmin"]["jasa"]["form"] !== 'object') locale["logisticAdmin"]["jasa"]["form"] = {};
locale["logisticAdmin"]["jasa"]["form"]["namePlaceholder"] = "cth: Jasa Trucking";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
if (!locale["logisticAdmin"]["jasa"]["form"] || typeof locale["logisticAdmin"]["jasa"]["form"] !== 'object') locale["logisticAdmin"]["jasa"]["form"] = {};
locale["logisticAdmin"]["jasa"]["form"]["priceLabel"] = "Harga (0 = Nego)";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
if (!locale["logisticAdmin"]["jasa"]["form"] || typeof locale["logisticAdmin"]["jasa"]["form"] !== 'object') locale["logisticAdmin"]["jasa"]["form"] = {};
locale["logisticAdmin"]["jasa"]["form"]["skuLabel"] = "SKU / Kode *";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
if (!locale["logisticAdmin"]["jasa"]["form"] || typeof locale["logisticAdmin"]["jasa"]["form"] !== 'object') locale["logisticAdmin"]["jasa"]["form"] = {};
locale["logisticAdmin"]["jasa"]["form"]["unitLabel"] = "Satuan";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["inactive"] = "Nonaktif";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["listSubtitle"] = "Jasa yang tampil di selector produk customer portal";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["listTitle"] = "List Jasa";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["loadError"] = "Gagal memuat data jasa";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["nameRequired"] = "Nama wajib diisi";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["nego"] = "Nego";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["saveChanges"] = "Save Perubahan";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["saveError"] = "Gagal menyimpan";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["skuRequired"] = "SKU wajib diisi";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["statusError"] = "Gagal mengubah status";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["jasa"] || typeof locale["logisticAdmin"]["jasa"] !== 'object') locale["logisticAdmin"]["jasa"] = {};
locale["logisticAdmin"]["jasa"]["updated"] = "Jasa diperbarui";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
locale["logisticAdmin"]["loading"] = "Memuat data...";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
locale["logisticAdmin"]["logout"] = "Logout";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["nav"] || typeof locale["logisticAdmin"]["nav"] !== 'object') locale["logisticAdmin"]["nav"] = {};
locale["logisticAdmin"]["nav"]["manageServices"] = "Kelola Jasa";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["nav"] || typeof locale["logisticAdmin"]["nav"] !== 'object') locale["logisticAdmin"]["nav"] = {};
locale["logisticAdmin"]["nav"]["orders"] = "Order";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["nav"] || typeof locale["logisticAdmin"]["nav"] !== 'object') locale["logisticAdmin"]["nav"] = {};
locale["logisticAdmin"]["nav"]["title"] = "Admin Dashboard";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
locale["logisticAdmin"]["newOrder"] = "Order baru masuk";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["orders"] || typeof locale["logisticAdmin"]["orders"] !== 'object') locale["logisticAdmin"]["orders"] = {};
locale["logisticAdmin"]["orders"]["allStatuses"] = "Semua Status";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["orders"] || typeof locale["logisticAdmin"]["orders"] !== 'object') locale["logisticAdmin"]["orders"] = {};
locale["logisticAdmin"]["orders"]["allTypes"] = "Semua Tipe";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["orders"] || typeof locale["logisticAdmin"]["orders"] !== 'object') locale["logisticAdmin"]["orders"] = {};
locale["logisticAdmin"]["orders"]["emptyHint"] = "Belum ada pesanan masuk";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["orders"] || typeof locale["logisticAdmin"]["orders"] !== 'object') locale["logisticAdmin"]["orders"] = {};
locale["logisticAdmin"]["orders"]["empty"] = "Tidak ada pesanan";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["orders"] || typeof locale["logisticAdmin"]["orders"] !== 'object') locale["logisticAdmin"]["orders"] = {};
locale["logisticAdmin"]["orders"]["listTitle"] = "List Pesanan";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["orders"] || typeof locale["logisticAdmin"]["orders"] !== 'object') locale["logisticAdmin"]["orders"] = {};
locale["logisticAdmin"]["orders"]["searchPlaceholder"] = "Cari nama perusahaan, PIC, atau nomor order...";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
locale["logisticAdmin"]["saving"] = "Menyimpan…";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
locale["logisticAdmin"]["statusUpdated"] = "Status diperbarui";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
locale["logisticAdmin"]["statusUpdateError"] = "Gagal memperbarui status";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["summary"] || typeof locale["logisticAdmin"]["summary"] !== 'object') locale["logisticAdmin"]["summary"] = {};
locale["logisticAdmin"]["summary"]["estimatedRevenue"] = "Estimasi Revenue";
if (!locale["logisticAdmin"] || typeof locale["logisticAdmin"] !== 'object') locale["logisticAdmin"] = {};
if (!locale["logisticAdmin"]["summary"] || typeof locale["logisticAdmin"]["summary"] !== 'object') locale["logisticAdmin"]["summary"] = {};
locale["logisticAdmin"]["summary"]["totalOrders"] = "Total Pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["autoFillDesc"] = "Berat & dimensi dihitung dari item di keranjang. Lengkapi detail lainnya lalu klik Hitung Estimasi.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["autoFillTitle"] = "Diisi otomatis dari produk pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["auto"] = "Auto";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["banner"] || typeof locale["logisticBook"]["banner"] !== 'object') locale["logisticBook"]["banner"] = {};
locale["logisticBook"]["banner"]["orderedProduct"] = "Produk yang dipesan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["btn"] || typeof locale["logisticBook"]["btn"] !== 'object') locale["logisticBook"]["btn"] = {};
locale["logisticBook"]["btn"]["addPriceTBD"] = "Tambahkan (Harga Menyusul)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["btn"] || typeof locale["logisticBook"]["btn"] !== 'object') locale["logisticBook"]["btn"] = {};
locale["logisticBook"]["btn"]["addService"] = "Add Layanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["btn"] || typeof locale["logisticBook"]["btn"] !== 'object') locale["logisticBook"]["btn"] = {};
locale["logisticBook"]["btn"]["addToOrder2"] = "Tambahkan ke Pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["btn"] || typeof locale["logisticBook"]["btn"] !== 'object') locale["logisticBook"]["btn"] = {};
locale["logisticBook"]["btn"]["addToOrder"] = "Add to Order";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["btn"] || typeof locale["logisticBook"]["btn"] !== 'object') locale["logisticBook"]["btn"] = {};
locale["logisticBook"]["btn"]["back"] = "Back";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["btn"] || typeof locale["logisticBook"]["btn"] !== 'object') locale["logisticBook"]["btn"] = {};
locale["logisticBook"]["btn"]["confirmSubmit"] = "Confirm & Submit";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["btn"] || typeof locale["logisticBook"]["btn"] !== 'object') locale["logisticBook"]["btn"] = {};
locale["logisticBook"]["btn"]["continue"] = "Lanjutkan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["btn"] || typeof locale["logisticBook"]["btn"] !== 'object') locale["logisticBook"]["btn"] = {};
locale["logisticBook"]["btn"]["deleteDraft"] = "Delete Draft";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["btn"] || typeof locale["logisticBook"]["btn"] !== 'object') locale["logisticBook"]["btn"] = {};
locale["logisticBook"]["btn"]["reviewOrder"] = "Review Pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["btn"] || typeof locale["logisticBook"]["btn"] !== 'object') locale["logisticBook"]["btn"] = {};
locale["logisticBook"]["btn"]["saving"] = "Saving...";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["btn"] || typeof locale["logisticBook"]["btn"] !== 'object') locale["logisticBook"]["btn"] = {};
locale["logisticBook"]["btn"]["selectPayment"] = "Select Pembayaran";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["calculator"] = "Calculator";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["cbm"] = "CBM";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["chargeableWeight"] = "Chargeable Weight";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["container"] = "Kontainer";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["containerType"] = "Container Type";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["days"] = "Days";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["destinationAirport"] = "Destination Airport";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["destinationCity"] = "Destination City";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["destinationPort"] = "Destination Port";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["destination"] = "Destination";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["distance"] = "Distance";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["grossWeight"] = "Gross Weight";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["grossWeightKg"] = "Berat Kotor";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["notSpecified"] = "Not specified";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["originAirport"] = "Origin Airport";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["origin"] = "Origin";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["originPort"] = "Origin Port";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["pickupCity"] = "Pickup City";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["qty"] = "Qty";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["qtyVolume"] = "Qty / Volume";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["quantity"] = "Quantity";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["serviceType"] = "Tipe Layanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["shipmentType"] = "Shipment Type";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["unit"] = "Unit";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["vehicleType"] = "Vehicle Type";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["detail"] || typeof locale["logisticBook"]["detail"] !== 'object') locale["logisticBook"]["detail"] = {};
locale["logisticBook"]["detail"]["weight"] = "Weight";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["estimateDisclaimer"] = "Ini adalah estimasi harga. Penawaran final akan dikonfirmasi oleh tim kami.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["estimate"] = "Estimasi";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["additionalDetails"] = "Additional details";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["additionalPermitFee"] = "Additional Permit Fee (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["adminFee"] = "Admin Fee (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["calculating"] = "menghitung…";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["cbm"] = "CBM";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["chargeableWeight"] = "Chargeable Weight";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["containerType"] = "Container Type";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["customsServiceFee"] = "Customs Service Fee (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["destinationAirport"] = "Bandara Tujuan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["destinationCity"] = "Kota Tujuan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["destinationPort"] = "Pelabuhan Tujuan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["dimensionsCm"] = "Dimensi (cm) — P × L × T";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["distanceKm"] = "Distance (km)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["documentFee"] = "Document Fee (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["documentType"] = "Document Type";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["feePerDocument"] = "Fee per Document (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["freightRate"] = "Freight Rate (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["goodsType"] = "Jenis Barang";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["grossWeightKg"] = "Gross Weight (kg)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["handlingFee"] = "Handling Fee (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["heightCmEn"] = "Height (cm)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["heightCm"] = "Tinggi (cm)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["importExport"] = "Import / Export";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["incoterms"] = "Incoterms";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["lebar"] = "Lebar";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["lengthCmEn"] = "Length (cm)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["lengthCm"] = "Panjang (cm)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["minimumCharge"] = "Minimum Charge (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["notesOptional"] = "Notes (optional)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["numberOfDays"] = "Number of Days";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["originAirport"] = "Bandara";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["originCity"] = "Kota Asal";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["originPort"] = "Pelabuhan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["panjang"] = "Panjang";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["pibPebFee"] = "PIB/PEB Fee (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["quantityPcs"] = "Quantity (pcs)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["quantity"] = "Quantity";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["ratePerCbm"] = "Rate per CBM (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["ratePerDay"] = "Rate per Day (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["ratePerKg"] = "Rate per Kg (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["searchDestAirport"] = "Cari bandara tujuan...";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["searchDestCity"] = "Cari kota tujuan...";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["searchDestPort"] = "Cari pelabuhan tujuan...";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["searchOriginCity"] = "Cari kota asal...";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["selectContainer"] = "Select container";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["selectGoodsType"] = "Select jenis";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["selectUnit"] = "Select unit";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["selectVehicleId"] = "Select kendaraan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["selectVehicle"] = "Select vehicle";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["serviceFee"] = "Service Fee (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["serviceName"] = "Service Name";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["serviceType"] = "Service Type";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["shipmentType"] = "Shipment Type";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["tinggi"] = "Tinggi";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["truckingRate"] = "Trucking Rate (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["unitPrice"] = "Unit Price (IDR)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["unit"] = "Unit";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["vehicleTypeId"] = "Jenis Kendaraan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["vehicleType"] = "Vehicle Type";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["volumeWeight"] = "Volume Weight";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["weightKg"] = "Berat (kg)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["weightKgEn"] = "Weight (kg)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["widthCmEn"] = "Width (cm)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["form"] || typeof locale["logisticBook"]["form"] !== 'object') locale["logisticBook"]["form"] = {};
locale["logisticBook"]["form"]["widthCm"] = "Lebar (cm)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["inclTax"] = "incl. PPN";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["nav"] || typeof locale["logisticBook"]["nav"] !== 'object') locale["logisticBook"]["nav"] = {};
locale["logisticBook"]["nav"]["booking"] = "Booking";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["orderType"] || typeof locale["logisticBook"]["orderType"] !== 'object') locale["logisticBook"]["orderType"] = {};
if (!locale["logisticBook"]["orderType"]["product"] || typeof locale["logisticBook"]["orderType"]["product"] !== 'object') locale["logisticBook"]["orderType"]["product"] = {};
locale["logisticBook"]["orderType"]["product"]["badge"] = "Tanpa logistik";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["orderType"] || typeof locale["logisticBook"]["orderType"] !== 'object') locale["logisticBook"]["orderType"] = {};
if (!locale["logisticBook"]["orderType"]["product"] || typeof locale["logisticBook"]["orderType"]["product"] !== 'object') locale["logisticBook"]["orderType"]["product"] = {};
locale["logisticBook"]["orderType"]["product"]["desc"] = "Pesan produk dari katalog. Shipment opsional, bisa pickup sendiri.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["orderType"] || typeof locale["logisticBook"]["orderType"] !== 'object') locale["logisticBook"]["orderType"] = {};
if (!locale["logisticBook"]["orderType"]["product"] || typeof locale["logisticBook"]["orderType"]["product"] !== 'object') locale["logisticBook"]["orderType"]["product"] = {};
locale["logisticBook"]["orderType"]["product"]["title"] = "Product";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["orderType"] || typeof locale["logisticBook"]["orderType"] !== 'object') locale["logisticBook"]["orderType"] = {};
if (!locale["logisticBook"]["orderType"]["service"] || typeof locale["logisticBook"]["orderType"]["service"] !== 'object') locale["logisticBook"]["orderType"]["service"] = {};
locale["logisticBook"]["orderType"]["service"]["badge"] = "Non-shipment";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["orderType"] || typeof locale["logisticBook"]["orderType"] !== 'object') locale["logisticBook"]["orderType"] = {};
if (!locale["logisticBook"]["orderType"]["service"] || typeof locale["logisticBook"]["orderType"]["service"] !== 'object') locale["logisticBook"]["orderType"]["service"] = {};
locale["logisticBook"]["orderType"]["service"]["desc"] = "Customs, handling, storage, konsultasi, maintenance, dan lainnya.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["orderType"] || typeof locale["logisticBook"]["orderType"] !== 'object') locale["logisticBook"]["orderType"] = {};
if (!locale["logisticBook"]["orderType"]["service"] || typeof locale["logisticBook"]["orderType"]["service"] !== 'object') locale["logisticBook"]["orderType"]["service"] = {};
locale["logisticBook"]["orderType"]["service"]["title"] = "Layanan Jasa";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["orderType"] || typeof locale["logisticBook"]["orderType"] !== 'object') locale["logisticBook"]["orderType"] = {};
if (!locale["logisticBook"]["orderType"]["shipment"] || typeof locale["logisticBook"]["orderType"]["shipment"] !== 'object') locale["logisticBook"]["orderType"]["shipment"] = {};
locale["logisticBook"]["orderType"]["shipment"]["badge"] = "Butuh detail rute";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["orderType"] || typeof locale["logisticBook"]["orderType"] !== 'object') locale["logisticBook"]["orderType"] = {};
if (!locale["logisticBook"]["orderType"]["shipment"] || typeof locale["logisticBook"]["orderType"]["shipment"] !== 'object') locale["logisticBook"]["orderType"]["shipment"] = {};
locale["logisticBook"]["orderType"]["shipment"]["desc"] = "Trucking, air freight, sea freight, export/import.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["orderType"] || typeof locale["logisticBook"]["orderType"] !== 'object') locale["logisticBook"]["orderType"] = {};
if (!locale["logisticBook"]["orderType"]["shipment"] || typeof locale["logisticBook"]["orderType"]["shipment"] !== 'object') locale["logisticBook"]["orderType"]["shipment"] = {};
locale["logisticBook"]["orderType"]["shipment"]["title"] = "Pengiriman Logistik";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["accountName"] = "Atas Nama";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["accountNumber"] = "No. Rekening";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["bank"] = "Bank";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["bankInfo"] = "Informasi Rekening Tujuan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["branch"] = "Cabang";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["changeProof"] = "Ganti";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["cod"] || typeof locale["logisticBook"]["payment"]["cod"] !== 'object') locale["logisticBook"]["payment"]["cod"] = {};
locale["logisticBook"]["payment"]["cod"]["desc"] = "Bayar saat pengiriman";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["cod"] || typeof locale["logisticBook"]["payment"]["cod"] !== 'object') locale["logisticBook"]["payment"]["cod"] = {};
locale["logisticBook"]["payment"]["cod"]["label"] = "COD / Tunai";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["codDesc"] = "Siapkan pembayaran tunai atau transfer instan saat kurir tiba. Nominal final dikonfirmasi tim kami setelah pesanan diproses.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["codTitle"] = "Bayar Saat Pengiriman";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["dpTerms"] || typeof locale["logisticBook"]["payment"]["dpTerms"] !== 'object') locale["logisticBook"]["payment"]["dpTerms"] = {};
locale["logisticBook"]["payment"]["dpTerms"]["cicil"] = "Cicilan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["dpTerms"] || typeof locale["logisticBook"]["payment"]["dpTerms"] !== 'object') locale["logisticBook"]["payment"]["dpTerms"] = {};
locale["logisticBook"]["payment"]["dpTerms"]["lunasDelivery"] = "Lunas saat pengiriman";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["dpTerms"] || typeof locale["logisticBook"]["payment"]["dpTerms"] !== 'object') locale["logisticBook"]["payment"]["dpTerms"] = {};
locale["logisticBook"]["payment"]["dpTerms"]["lunasNet30"] = "Lunas Net 30 hari";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["dpTerms"] || typeof locale["logisticBook"]["payment"]["dpTerms"] !== 'object') locale["logisticBook"]["payment"]["dpTerms"] = {};
locale["logisticBook"]["payment"]["dpTerms"]["lunasNet60"] = "Lunas Net 60 hari";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["gateway"] || typeof locale["logisticBook"]["payment"]["gateway"] !== 'object') locale["logisticBook"]["payment"]["gateway"] = {};
locale["logisticBook"]["payment"]["gateway"]["badge"] = "Cepat & Aman";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["gateway"] || typeof locale["logisticBook"]["payment"]["gateway"] !== 'object') locale["logisticBook"]["payment"]["gateway"] = {};
locale["logisticBook"]["payment"]["gateway"]["desc"] = "Bayar online sekarang";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["gateway"] || typeof locale["logisticBook"]["payment"]["gateway"] !== 'object') locale["logisticBook"]["payment"]["gateway"] = {};
locale["logisticBook"]["payment"]["gateway"]["label"] = "Payment Gateway";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["invoice"] || typeof locale["logisticBook"]["payment"]["invoice"] !== 'object') locale["logisticBook"]["payment"]["invoice"] = {};
locale["logisticBook"]["payment"]["invoice"]["desc"] = "Tagihan setelah selesai";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["invoice"] || typeof locale["logisticBook"]["payment"]["invoice"] !== 'object') locale["logisticBook"]["payment"]["invoice"] = {};
locale["logisticBook"]["payment"]["invoice"]["label"] = "Invoice / Net Terms";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["invoiceNote"] = "Tagihan dikirim ke email setelah pekerjaan selesai. Tersedia untuk pelanggan dengan credit terms yang disetujui.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["loadingBank"] = "Memuat info rekening…";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["netTerms"] || typeof locale["logisticBook"]["payment"]["netTerms"] !== 'object') locale["logisticBook"]["payment"]["netTerms"] = {};
locale["logisticBook"]["payment"]["netTerms"]["net14"] = "Net 14 hari";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["netTerms"] || typeof locale["logisticBook"]["payment"]["netTerms"] !== 'object') locale["logisticBook"]["payment"]["netTerms"] = {};
locale["logisticBook"]["payment"]["netTerms"]["net30"] = "Net 30 hari";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["netTerms"] || typeof locale["logisticBook"]["payment"]["netTerms"] !== 'object') locale["logisticBook"]["payment"]["netTerms"] = {};
locale["logisticBook"]["payment"]["netTerms"]["net60"] = "Net 60 hari";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["netTerms"] || typeof locale["logisticBook"]["payment"]["netTerms"] !== 'object') locale["logisticBook"]["payment"]["netTerms"] = {};
locale["logisticBook"]["payment"]["netTerms"]["net7"] = "Net 7 hari";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["repaymentSchedule"] = "Jadwal Pelunasan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["selectInvoiceTerm"] = "Select Jangka Waktu Invoice";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["selectTransferScheme"] = "Select Skema Transfer";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["transfer"] || typeof locale["logisticBook"]["payment"]["transfer"] !== 'object') locale["logisticBook"]["payment"]["transfer"] = {};
locale["logisticBook"]["payment"]["transfer"]["desc"] = "Transfer ke rekening kami";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["transfer"] || typeof locale["logisticBook"]["payment"]["transfer"] !== 'object') locale["logisticBook"]["payment"]["transfer"] = {};
locale["logisticBook"]["payment"]["transfer"]["label"] = "Transfer Bank";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["transferTerms"] || typeof locale["logisticBook"]["payment"]["transferTerms"] !== 'object') locale["logisticBook"]["payment"]["transferTerms"] = {};
if (!locale["logisticBook"]["payment"]["transferTerms"]["dp"] || typeof locale["logisticBook"]["payment"]["transferTerms"]["dp"] !== 'object') locale["logisticBook"]["payment"]["transferTerms"]["dp"] = {};
locale["logisticBook"]["payment"]["transferTerms"]["dp"]["desc"] = "Down payment, sisa dibayar kemudian";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["transferTerms"] || typeof locale["logisticBook"]["payment"]["transferTerms"] !== 'object') locale["logisticBook"]["payment"]["transferTerms"] = {};
if (!locale["logisticBook"]["payment"]["transferTerms"]["dp"] || typeof locale["logisticBook"]["payment"]["transferTerms"]["dp"] !== 'object') locale["logisticBook"]["payment"]["transferTerms"]["dp"] = {};
locale["logisticBook"]["payment"]["transferTerms"]["dp"]["label"] = "DP + Pelunasan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["transferTerms"] || typeof locale["logisticBook"]["payment"]["transferTerms"] !== 'object') locale["logisticBook"]["payment"]["transferTerms"] = {};
if (!locale["logisticBook"]["payment"]["transferTerms"]["full"] || typeof locale["logisticBook"]["payment"]["transferTerms"]["full"] !== 'object') locale["logisticBook"]["payment"]["transferTerms"]["full"] = {};
locale["logisticBook"]["payment"]["transferTerms"]["full"]["desc"] = "Bayar seluruh tagihan di muka";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["transferTerms"] || typeof locale["logisticBook"]["payment"]["transferTerms"] !== 'object') locale["logisticBook"]["payment"]["transferTerms"] = {};
if (!locale["logisticBook"]["payment"]["transferTerms"]["full"] || typeof locale["logisticBook"]["payment"]["transferTerms"]["full"] !== 'object') locale["logisticBook"]["payment"]["transferTerms"]["full"] = {};
locale["logisticBook"]["payment"]["transferTerms"]["full"]["label"] = "Pembayaran Penuh";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["transferTerms"] || typeof locale["logisticBook"]["payment"]["transferTerms"] !== 'object') locale["logisticBook"]["payment"]["transferTerms"] = {};
if (!locale["logisticBook"]["payment"]["transferTerms"]["termin"] || typeof locale["logisticBook"]["payment"]["transferTerms"]["termin"] !== 'object') locale["logisticBook"]["payment"]["transferTerms"]["termin"] = {};
locale["logisticBook"]["payment"]["transferTerms"]["termin"]["desc"] = "Bayar dalam beberapa tahap";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
if (!locale["logisticBook"]["payment"]["transferTerms"] || typeof locale["logisticBook"]["payment"]["transferTerms"] !== 'object') locale["logisticBook"]["payment"]["transferTerms"] = {};
if (!locale["logisticBook"]["payment"]["transferTerms"]["termin"] || typeof locale["logisticBook"]["payment"]["transferTerms"]["termin"] !== 'object') locale["logisticBook"]["payment"]["transferTerms"]["termin"] = {};
locale["logisticBook"]["payment"]["transferTerms"]["termin"]["label"] = "Termin / Cicilan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["uploadHint"] = "Klik untuk pilih file (JPG, PNG, PDF, maks. 10 MB)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["uploading"] = "Mengunggah…";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["uploadProofOptional"] = "opsional, bisa dilakukan setelah konfirmasi";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["payment"] || typeof locale["logisticBook"]["payment"] !== 'object') locale["logisticBook"]["payment"] = {};
locale["logisticBook"]["payment"]["uploadProof"] = "Upload Bukti Transfer";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["priceNego"] = "Harga nego";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["priceTBD"] = "Harga menyusul";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["quickServices"] || typeof locale["logisticBook"]["quickServices"] !== 'object') locale["logisticBook"]["quickServices"] = {};
if (!locale["logisticBook"]["quickServices"]["customs"] || typeof locale["logisticBook"]["quickServices"]["customs"] !== 'object') locale["logisticBook"]["quickServices"]["customs"] = {};
locale["logisticBook"]["quickServices"]["customs"]["desc"] = "Import/export customs clearance";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["quickServices"] || typeof locale["logisticBook"]["quickServices"] !== 'object') locale["logisticBook"]["quickServices"] = {};
if (!locale["logisticBook"]["quickServices"]["customs"] || typeof locale["logisticBook"]["quickServices"]["customs"] !== 'object') locale["logisticBook"]["quickServices"]["customs"] = {};
locale["logisticBook"]["quickServices"]["customs"]["name"] = "Customs";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["quickServices"] || typeof locale["logisticBook"]["quickServices"] !== 'object') locale["logisticBook"]["quickServices"] = {};
if (!locale["logisticBook"]["quickServices"]["freight"] || typeof locale["logisticBook"]["quickServices"]["freight"] !== 'object') locale["logisticBook"]["quickServices"]["freight"] = {};
locale["logisticBook"]["quickServices"]["freight"]["desc"] = "Air & sea forwarding, domestic delivery";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["quickServices"] || typeof locale["logisticBook"]["quickServices"] !== 'object') locale["logisticBook"]["quickServices"] = {};
if (!locale["logisticBook"]["quickServices"]["freight"] || typeof locale["logisticBook"]["quickServices"]["freight"] !== 'object') locale["logisticBook"]["quickServices"]["freight"] = {};
locale["logisticBook"]["quickServices"]["freight"]["name"] = "Freight";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["quickServices"] || typeof locale["logisticBook"]["quickServices"] !== 'object') locale["logisticBook"]["quickServices"] = {};
if (!locale["logisticBook"]["quickServices"]["storage"] || typeof locale["logisticBook"]["quickServices"]["storage"] !== 'object') locale["logisticBook"]["quickServices"]["storage"] = {};
locale["logisticBook"]["quickServices"]["storage"]["desc"] = "Warehouse & bonded storage";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["quickServices"] || typeof locale["logisticBook"]["quickServices"] !== 'object') locale["logisticBook"]["quickServices"] = {};
if (!locale["logisticBook"]["quickServices"]["storage"] || typeof locale["logisticBook"]["quickServices"]["storage"] !== 'object') locale["logisticBook"]["quickServices"]["storage"] = {};
locale["logisticBook"]["quickServices"]["storage"]["name"] = "Storage";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["quickServices"] || typeof locale["logisticBook"]["quickServices"] !== 'object') locale["logisticBook"]["quickServices"] = {};
if (!locale["logisticBook"]["quickServices"]["trucking"] || typeof locale["logisticBook"]["quickServices"]["trucking"] !== 'object') locale["logisticBook"]["quickServices"]["trucking"] = {};
locale["logisticBook"]["quickServices"]["trucking"]["desc"] = "Pickup, delivery & container transport";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["quickServices"] || typeof locale["logisticBook"]["quickServices"] !== 'object') locale["logisticBook"]["quickServices"] = {};
if (!locale["logisticBook"]["quickServices"]["trucking"] || typeof locale["logisticBook"]["quickServices"]["trucking"] !== 'object') locale["logisticBook"]["quickServices"]["trucking"] = {};
locale["logisticBook"]["quickServices"]["trucking"]["name"] = "Trucking";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["shipping"] || typeof locale["logisticBook"]["shipping"] !== 'object') locale["logisticBook"]["shipping"] = {};
locale["logisticBook"]["shipping"]["daratLabel"] = "Darat";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["shipping"] || typeof locale["logisticBook"]["shipping"] !== 'object') locale["logisticBook"]["shipping"] = {};
locale["logisticBook"]["shipping"]["darat"] = "Pengiriman Darat (Trucking)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["shipping"] || typeof locale["logisticBook"]["shipping"] !== 'object') locale["logisticBook"]["shipping"] = {};
locale["logisticBook"]["shipping"]["daratShort"] = "Darat (Trucking)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["shipping"] || typeof locale["logisticBook"]["shipping"] !== 'object') locale["logisticBook"]["shipping"] = {};
locale["logisticBook"]["shipping"]["lautLabel"] = "Laut";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["shipping"] || typeof locale["logisticBook"]["shipping"] !== 'object') locale["logisticBook"]["shipping"] = {};
locale["logisticBook"]["shipping"]["laut"] = "Pengiriman Laut (Sea Freight)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["shipping"] || typeof locale["logisticBook"]["shipping"] !== 'object') locale["logisticBook"]["shipping"] = {};
locale["logisticBook"]["shipping"]["lautShort"] = "Laut (Sea Freight)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["shipping"] || typeof locale["logisticBook"]["shipping"] !== 'object') locale["logisticBook"]["shipping"] = {};
locale["logisticBook"]["shipping"]["udaraLabel"] = "Udara";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["shipping"] || typeof locale["logisticBook"]["shipping"] !== 'object') locale["logisticBook"]["shipping"] = {};
locale["logisticBook"]["shipping"]["udara"] = "Pengiriman Udara (Air Freight)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["shipping"] || typeof locale["logisticBook"]["shipping"] !== 'object') locale["logisticBook"]["shipping"] = {};
locale["logisticBook"]["shipping"]["udaraShort"] = "Udara (Air Freight)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step0"] || typeof locale["logisticBook"]["step0"] !== 'object') locale["logisticBook"]["step0"] = {};
locale["logisticBook"]["step0"]["selectShipmentType"] = "Select Tipe Pengiriman:";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step0"] || typeof locale["logisticBook"]["step0"] !== 'object') locale["logisticBook"]["step0"] = {};
locale["logisticBook"]["step0"]["subtitle"] = "Select jenis pesanan untuk melanjutkan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step0"] || typeof locale["logisticBook"]["step0"] !== 'object') locale["logisticBook"]["step0"] = {};
locale["logisticBook"]["step0"]["title"] = "Jenis Pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step1"] || typeof locale["logisticBook"]["step1"] !== 'object') locale["logisticBook"]["step1"] = {};
locale["logisticBook"]["step1"]["allCategories"] = "Semua Kategori";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step1"] || typeof locale["logisticBook"]["step1"] !== 'object') locale["logisticBook"]["step1"] = {};
locale["logisticBook"]["step1"]["allServices"] = "Semua Layanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step1"] || typeof locale["logisticBook"]["step1"] !== 'object') locale["logisticBook"]["step1"] = {};
locale["logisticBook"]["step1"]["calculatorAvailable"] = "Kalkulator tersedia";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step1"] || typeof locale["logisticBook"]["step1"] !== 'object') locale["logisticBook"]["step1"] = {};
locale["logisticBook"]["step1"]["selectItemDesc"] = "Select item layanan untuk kalkulasi estimasi biaya";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step1"] || typeof locale["logisticBook"]["step1"] !== 'object') locale["logisticBook"]["step1"] = {};
locale["logisticBook"]["step1"]["selectServiceDesc"] = "Select layanan logistik untuk Anda";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step1"] || typeof locale["logisticBook"]["step1"] !== 'object') locale["logisticBook"]["step1"] = {};
locale["logisticBook"]["step1"]["selectService"] = "Select Layanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step2"] || typeof locale["logisticBook"]["step2"] !== 'object') locale["logisticBook"]["step2"] = {};
locale["logisticBook"]["step2"]["emptyCartDesc"] = "Tambahkan layanan dari step sebelumnya";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step2"] || typeof locale["logisticBook"]["step2"] !== 'object') locale["logisticBook"]["step2"] = {};
locale["logisticBook"]["step2"]["emptyCart"] = "Keranjang kosong";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step2"] || typeof locale["logisticBook"]["step2"] !== 'object') locale["logisticBook"]["step2"] = {};
locale["logisticBook"]["step2"]["oneOrder"] = "1 Pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step2"] || typeof locale["logisticBook"]["step2"] !== 'object') locale["logisticBook"]["step2"] = {};
locale["logisticBook"]["step2"]["oneOrderDesc"] = "semua layanan di bawah diproses dalam satu paket";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step2"] || typeof locale["logisticBook"]["step2"] !== 'object') locale["logisticBook"]["step2"] = {};
locale["logisticBook"]["step2"]["orderDetails"] = "Rincian Pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step2"] || typeof locale["logisticBook"]["step2"] !== 'object') locale["logisticBook"]["step2"] = {};
locale["logisticBook"]["step2"]["servicesSelected"] = "layanan dipilih";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step2"] || typeof locale["logisticBook"]["step2"] !== 'object') locale["logisticBook"]["step2"] = {};
locale["logisticBook"]["step2"]["title"] = "Ringkasan Pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["additionalNotes"] = "Catatan Tambahan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["additionalNotesPlaceholder"] = "Informasi tambahan untuk tim kami...";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["calculatingEstimate"] = "Menghitung estimasi harga...";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["cargoWeight"] = "Berat Kargo (kg)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["companyData"] = "Data Perusahaan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["companyName"] = "Nama Perusahaan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["destCityDistrict"] = "Kota Tujuan (Kecamatan)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["destShipping"] = "Tujuan Pengiriman";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["dest"] = "Destination";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["email"] = "Email";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["estimateNotAvailable"] = "Estimasi tidak tersedia — harga akan dikonfirmasi admin";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["eta"] = "ETA (Tiba Tujuan)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["etd"] = "ETD (Keberangkatan)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["incoterm"] = "Incoterm";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["jumlahKoliAutoFill"] = "Terisi otomatis dari data layanan shipment.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["jumlahKoliDesc"] = "Total jumlah koli / kotak / karton";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["jumlahKoli"] = "Jumlah Koli";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["jumlahKoliPlaceholder"] = "Contoh: 10";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["orderDetail"] = "Detail Pemesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["origin"] = "Origin";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["originCityDistrict"] = "Kota Asal (Kecamatan)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["originShipping"] = "Asal Pengiriman";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["perRoute"] = "Sesuai rute";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["phone"] = "Telepon / WhatsApp";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["picName"] = "Nama PIC";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["picNamePlaceholder"] = "Nama lengkap";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["priceEstimate"] = "Estimasi Harga";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["selectModeOptional"] = "Select Mode (opsional)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["select"] = "Select";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["selectType"] = "Select Tipe";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["senderName"] = "Nama Pengirim";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["senderNamePlaceholder"] = "Nama pengirim barang (opsional)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["shippingAddress"] = "Alamat Tujuan Pengiriman";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["shippingAddressHint"] = "Masukkan alamat tujuan pengiriman, atau kosongkan jika barang akan diambil sendiri.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["shippingAddressOptional"] = "opsional — kosongkan jika ambil sendiri";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["shippingAddressPlaceholder"] = "Jl. ..., Kota, Provinsi — kosongkan jika ambil sendiri di gudang";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["shippingMethod"] = "Metode Pengiriman";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["subtitle"] = "Lengkapi data untuk konfirmasi pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["title"] = "Data Pemesan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["transportMode"] = "Mode Pengiriman";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step3"] || typeof locale["logisticBook"]["step3"] !== 'object') locale["logisticBook"]["step3"] = {};
locale["logisticBook"]["step3"]["truckUnit"] = "Tipe Unit / Armada";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step4"] || typeof locale["logisticBook"]["step4"] !== 'object') locale["logisticBook"]["step4"] = {};
locale["logisticBook"]["step4"]["subtitle"] = "Select cara pembayaran yang Anda inginkan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step4"] || typeof locale["logisticBook"]["step4"] !== 'object') locale["logisticBook"]["step4"] = {};
locale["logisticBook"]["step4"]["title"] = "Metode Pembayaran";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["cancel"] = "Cancel";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["changePayment"] = "Change";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["change"] = "Change";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["chooseNow"] = "Select sekarang";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["company"] = "Company";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["confirmedAfterOrder"] = "Dikonfirmasi setelah order";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["destAddress"] = "Alamat Tujuan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["dueDate"] = "Jatuh tempo";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["edit"] = "Edit";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["email"] = "Email";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["finalPriceNote"] = "Harga final dikonfirmasi oleh tim kami setelah pesanan diterima.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["notes"] = "Notes";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["notYetChosen"] = "Belum dipilih.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["ordererData"] = "Data Pemesan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["paymentMethod"] = "Metode Pembayaran";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["phone"] = "Phone";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["picName"] = "Nama PIC";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["pricePerRoute"] = "Harga sesuai rute";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["productsAndServices"] = "Produk & Layanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["removeItem"] = "Delete item";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["senderName"] = "Nama Pengirim";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["sender"] = "Pengirim";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["shippingEstimate"] = "Estimasi Ongkos Kirim";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["shippingMethod"] = "Metode Pengiriman";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["subtitle"] = "Periksa kembali sebelum submit";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["subtotalProductsServices"] = "Subtotal Produk & Layanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["step5"] || typeof locale["logisticBook"]["step5"] !== 'object') locale["logisticBook"]["step5"] = {};
locale["logisticBook"]["step5"]["title"] = "Confirm Pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["subtotal"] = "Subtotal";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["addedToOrder"] = "ditambahkan ke pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["addMinOneItem"] = "Tambahkan minimal 1 item ke pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["deliveryAddressRequired"] = "Alamat Pengiriman wajib diisi";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["draftDeletedDesc"] = "Mulai pemesanan baru dari awal.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["draftDeleted"] = "Draft dihapus";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["fillCalculator"] = "Isi data kalkulator terlebih dahulu";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["fillTruckingFields"] = "Isi kota asal, kota tujuan, dan tipe kendaraan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["invalidEmail"] = "Format email tidak valid";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["phoneRequired"] = "Nomor telepon / WhatsApp wajib diisi";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["picRequired"] = "Nama PIC wajib diisi";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["proofUploaded"] = "Bukti pembayaran berhasil diunggah ✓";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["saveFailed"] = "Gagal menyimpan pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["truckingAdded"] = "Trucking ditambahkan ke pesanan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["truckingDestRequired"] = "Alamat Pengiriman wajib diisi pada item Trucking";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["uploadError"] = "Gagal mengunggah bukti";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["toast"] || typeof locale["logisticBook"]["toast"] !== 'object') locale["logisticBook"]["toast"] = {};
locale["logisticBook"]["toast"]["uploadFailed"] = "Upload gagal";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["totalEstimate"] = "Total Estimasi";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["calculateEstimate"] = "Hitung Estimasi";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["calculating"] = "Menghitung...";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["contactName"] = "Nama Kontak";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["contactNamePlaceholder"] = "Nama PIC";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["contactPhone"] = "No. Telepon";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["deliveryAddress"] = "Alamat Pengiriman";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["deliveryAddressPlaceholder"] = "Jl. ..., Kota, Provinsi";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["deliveryAddressRequired"] = "Alamat pengiriman wajib diisi.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["estimateCost"] = "Estimasi Biaya Trucking";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["estimateDisclaimer"] = "*Estimasi indikatif. Biaya final dikonfirmasi tim logistik.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["estimateNote"] = "Estimasi biaya akan dikonfirmasi oleh tim setelah pesanan masuk.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["notesOptional"] = "Catatan (opsional)";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["notesPlaceholder"] = "Instruksi khusus untuk tim pengiriman...";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["pickupAddress"] = "Alamat Pickup";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["pickupAddressPlaceholder"] = "Jl. ..., Kota, Provinsi";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["subtitle"] = "Isi detail atau hitung estimasi biaya";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["tabCalc"] = "Kalkulator Estimasi";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["tabDetail"] = "Form Pickup & Delivery";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
if (!locale["logisticBook"]["trucking"] || typeof locale["logisticBook"]["trucking"] !== 'object') locale["logisticBook"]["trucking"] = {};
locale["logisticBook"]["trucking"]["title"] = "Layanan Trucking";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["truckingPriceConfirmDesc"] = "Harga trucking akan diberikan setelah vendor menerima dan mengkonfirmasi pesanan Anda.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["truckingPriceConfirmTitle"] = "Harga Akan Dikonfirmasi oleh Vendor";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["unitPrice"] = "Harga satuan";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["vendorMarketplace"] = "Vendor Marketplace";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["vendorPriceDesc"] = "Setelah pesanan diterima, vendor akan membalas dengan penawaran harga untuk Anda.";
if (!locale["logisticBook"] || typeof locale["logisticBook"] !== 'object') locale["logisticBook"] = {};
locale["logisticBook"]["vendorPriceTitle"] = "Harga Akan Diberikan oleh Vendor";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["acceptBtn"] = "Terima";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["acceptConfirm"] = "Ya, Terima PO";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["acceptDialogDesc"] = "Dengan menerima PO ini, Anda menyetujui seluruh syarat dan kondisi yang tercantum dalam";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["acceptDialogTitle"] = "Terima Purchase Order";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["acceptedNotice"] = "Confirm Anda telah diterima. Tim pengadaan sedang memproses PO ini.";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["actualCompletionDate"] = "Tanggal Selesai Aktual";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["cancel"] = "Cancel";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["contactProcurement"] = "Hubungi tim pengadaan Anda untuk bantuan lebih lanjut.";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["currency"] = "Mata Uang";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["days"] = "hari";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["errorExpiredDesc"] = "Link konfirmasi PO ini telah habis masa berlakunya. Hubungi tim pengadaan untuk mendapatkan link baru.";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["errorLinkExpired"] = "Link Kadaluarsa";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["errorLinkInvalid"] = "Link Tidak Valid";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["errorMalformedDesc"] = "Format link tidak valid. Pastikan Anda menggunakan link yang dikirimkan melalui WhatsApp.";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["errorPoNotFound"] = "PO Tidak Ditemukan";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["failed"] = "Failed";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["genericError"] = "Terjadi kesalahan. Silakan coba lagi.";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["grandTotal"] = "Grand Total";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["incoterm"] = "Incoterm";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["issuedDate"] = "Diterbitkan";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["itemsTitle"] = "Item Purchase Order";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["leadTime"] = "Lead Time";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["linkValidUntil"] = "Link berlaku hingga";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["noItems"] = "Tidak ada item";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["optional"] = "(opsional)";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["paymentTerms"] = "Syarat Pembayaran";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["poInfoTitle"] = "Informasi Purchase Order";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["poNumber"] = "Nomor PO";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["processing"] = "Memproses…";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["qty"] = "Qty";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["quotationDate"] = "Tanggal Quotation";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["quotationNumber"] = "No. Quotation";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["rejectBtn"] = "Tolak";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["rejectConfirm"] = "Ya, Tolak PO";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["rejectDialogDesc"] = "Masukkan alasan penolakan untuk";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["rejectDialogTitle"] = "Tolak Purchase Order";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["rejectReason"] = "Alasan Penolakan";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["rejectReasonPlaceholder"] = "Contoh: Harga tidak sesuai, kapasitas tidak tersedia…";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["reviewBeforeAction"] = "Harap tinjau PO di atas sebelum mengambil tindakan";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["revisionBtn"] = "Revisi";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["revisionDialogDesc"] = "Jelaskan perubahan yang Anda butuhkan untuk";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["revisionDialogTitle"] = "Minta Revisi PO";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["revisionNoteFromBuyer"] = "Catatan Revisi dari Buyer";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["revisionNotes"] = "Catatan Revisi";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["revisionNotesPlaceholder"] = "Contoh: Mohon ubah harga satuan item A menjadi Rp 50.000, lead time perlu diperpanjang…";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["revisionRequired"] = "Catatan wajib diisi";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["revisionRequiredDesc"] = "Mohon jelaskan perubahan yang dibutuhkan.";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["revisionSubmit"] = "Send Permintaan Revisi";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["shipmentInfoDesc"] = "Detail pengiriman dan timeline dikelola oleh tim pengadaan. Hubungi buyer Anda untuk informasi status pengiriman terbaru.";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["shipmentInfo"] = "Informasi Pengiriman";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["status"] = "Status";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["statusUpdated"] = "Status PO diperbarui";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["subtotalLabel"] = "Subtotal";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["subtotal"] = "Subtotal";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["success"] = "Success";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["targetCompletion"] = "Target Selesai";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["tax"] = "Pajak (PPN)";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["terminalNotice"] = "PO ini sudah dalam status final dan tidak dapat diubah.";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["unitPrice"] = "Harga Satuan";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["vendorAddress"] = "Alamat Vendor";
if (!locale["mktVendorPo"] || typeof locale["mktVendorPo"] !== 'object') locale["mktVendorPo"] = {};
locale["mktVendorPo"]["vendor"] = "Vendor";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["buyer"] = "Buyer";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["buyerNotes"] = "Catatan Buyer";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["cancel"] = "Cancel";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["confirmSendBtn"] = "Ya, Kirim";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["confirmSendDesc"] = "Send penawaran untuk RFQ ini? Anda tidak bisa mengubah setelah terkirim.";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["confirmSendRevisionDesc"] = "Send revisi penawaran untuk RFQ ini? Anda tidak bisa mengubah setelah terkirim.";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["confirmSendTitle"] = "Confirm Kirim Penawaran";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["days"] = "hari";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["deadline"] = "Deadline";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["deliveryAddress"] = "Alamat Pengiriman";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["draftSaved"] = "Draft tersimpan";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["fillQuote"] = "Isi Penawaran";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["formTitle"] = "Form Penawaran Harga";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["invalidLinkDesc"] = "Link penawaran tidak ditemukan atau sudah kadaluarsa. Hubungi tim pengadaan untuk mendapatkan link baru.";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["invalidLink"] = "Link Tidak Valid";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["invitationFrom"] = "Undangan dari";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["itemList"] = "List Item";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["itemNotes"] = "Catatan Item";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["leadTimeDays"] = "Lead Time (hari)";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["leadTime"] = "Lead Time";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["linkValidUntil"] = "Link berlaku hingga";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["loadError"] = "Gagal memuat penawaran";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["neededBefore"] = "Butuh Sebelum";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["notes"] = "Notes";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["notYetFilled"] = "Belum diisi";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["offeredQty"] = "Qty Penawaran";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["optionalNotes"] = "Catatan opsional";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["paymentTermsPlaceholder"] = "Contoh: 30 hari net";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["paymentTerms"] = "Syarat Pembayaran";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["qty"] = "Qty";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["quoteAlreadySent"] = "Penawaran Sudah Dikirim";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["quoteNotes"] = "Catatan Penawaran";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["quoteNotesPlaceholder"] = "Catatan umum untuk penawaran ini (opsional)";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["requestedQty"] = "Qty Diminta";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["requoteRequested"] = "Revisi Penawaran Diminta";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["reviseQuote"] = "Revisi Penawaran";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["rfqDetail"] = "Detail RFQ";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["rfqNumber"] = "Nomor RFQ";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["saveDraft"] = "Save Draft";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["saveError"] = "Gagal menyimpan";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["saving"] = "Menyimpan…";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["sending"] = "Mengirim…";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["sendQuote"] = "Send Penawaran";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["sendRevision"] = "Send Revisi";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["sentAt"] = "Terkirim";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["submitError"] = "Gagal submit penawaran";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["submitSuccess"] = "Penawaran berhasil dikirim!";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["subtotal"] = "Subtotal";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["totalEstimate"] = "Total Estimasi";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["totalQuote"] = "Total Penawaran";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["unitPrice"] = "Harga Satuan";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["unitPriceIdr"] = "Harga Satuan (IDR) *";
if (!locale["mktVendorQuote"] || typeof locale["mktVendorQuote"] !== 'object') locale["mktVendorQuote"] = {};
locale["mktVendorQuote"]["vendorLabel"] = "Vendor";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["fee"] || typeof locale["oceanFreightVendorForm"]["fee"] !== 'object') locale["oceanFreightVendorForm"]["fee"] = {};
locale["oceanFreightVendorForm"]["fee"]["blFee"] = "B/L Fee";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["fee"] || typeof locale["oceanFreightVendorForm"]["fee"] !== 'object') locale["oceanFreightVendorForm"]["fee"] = {};
locale["oceanFreightVendorForm"]["fee"]["customsClearance"] = "Customs Clearance";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["fee"] || typeof locale["oceanFreightVendorForm"]["fee"] !== 'object') locale["oceanFreightVendorForm"]["fee"] = {};
locale["oceanFreightVendorForm"]["fee"]["docFee"] = "Doc Fee";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["fee"] || typeof locale["oceanFreightVendorForm"]["fee"] !== 'object') locale["oceanFreightVendorForm"]["fee"] = {};
locale["oceanFreightVendorForm"]["fee"]["doFee"] = "D/O Fee";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["fee"] || typeof locale["oceanFreightVendorForm"]["fee"] !== 'object') locale["oceanFreightVendorForm"]["fee"] = {};
locale["oceanFreightVendorForm"]["fee"]["handlingFee"] = "Handling Fee";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["fee"] || typeof locale["oceanFreightVendorForm"]["fee"] !== 'object') locale["oceanFreightVendorForm"]["fee"] = {};
locale["oceanFreightVendorForm"]["fee"]["surcharge"] = "Surcharge";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["fee"] || typeof locale["oceanFreightVendorForm"]["fee"] !== 'object') locale["oceanFreightVendorForm"]["fee"] = {};
locale["oceanFreightVendorForm"]["fee"]["thcDest"] = "THC Destination";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["fee"] || typeof locale["oceanFreightVendorForm"]["fee"] !== 'object') locale["oceanFreightVendorForm"]["fee"] = {};
locale["oceanFreightVendorForm"]["fee"]["thcOrigin"] = "THC Origin";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["fee"] || typeof locale["oceanFreightVendorForm"]["fee"] !== 'object') locale["oceanFreightVendorForm"]["fee"] = {};
locale["oceanFreightVendorForm"]["fee"]["truckingDelivery"] = "Trucking Delivery";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["fee"] || typeof locale["oceanFreightVendorForm"]["fee"] !== 'object') locale["oceanFreightVendorForm"]["fee"] = {};
locale["oceanFreightVendorForm"]["fee"]["truckingPickup"] = "Trucking Pickup";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["additionalFees"] = "Biaya Tambahan";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["carrier"] = "Carrier / Shipping Line";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["carrierPlaceholder"] = "Maersk / CMA CGM / MSC";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["currency"] = "Currency";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["directOrTs"] = "Direct / Transshipment";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["eta"] = "ETA (Perkiraan)";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["etd"] = "ETD (Perkiraan)";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["notes"] = "Notes";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["notesPlaceholder"] = "Catatan atau syarat khusus...";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["oceanFreight"] = "Ocean Freight *";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["rateDetail"] = "Detail Rate";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["rateIdr"] = "Rate IDR";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["rateSourceName"] = "Nama Perusahaan / Sumber Rate";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["rateSourceNamePlaceholder"] = "NVOCC / Forwarder / Agen";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["transitDays"] = "Transit Days";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["uploadQuotation"] = "Upload Quotation (PDF/JPG, opsional)";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["validityDate"] = "Validity Date";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["vessel"] = "Vessel (opsional)";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["form"] || typeof locale["oceanFreightVendorForm"]["form"] !== 'object') locale["oceanFreightVendorForm"]["form"] = {};
locale["oceanFreightVendorForm"]["form"]["voyage"] = "Voyage (opsional)";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
locale["oceanFreightVendorForm"]["invalidLink"] = "Link Tidak Valid";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
locale["oceanFreightVendorForm"]["loadError"] = "Gagal memuat form";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
locale["oceanFreightVendorForm"]["orderNo"] = "No. Order";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
locale["oceanFreightVendorForm"]["submitBtn"] = "Submit Rate";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
locale["oceanFreightVendorForm"]["submitError"] = "Gagal submit";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["submitted"] || typeof locale["oceanFreightVendorForm"]["submitted"] !== 'object') locale["oceanFreightVendorForm"]["submitted"] = {};
locale["oceanFreightVendorForm"]["submitted"]["desc"] = "Terima kasih. Rate Anda telah diterima dan akan segera diproses oleh tim kami.";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["submitted"] || typeof locale["oceanFreightVendorForm"]["submitted"] !== 'object') locale["oceanFreightVendorForm"]["submitted"] = {};
locale["oceanFreightVendorForm"]["submitted"]["title"] = "Rate Berhasil Disubmit";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
locale["oceanFreightVendorForm"]["submitting"] = "Sending...";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["summary"] || typeof locale["oceanFreightVendorForm"]["summary"] !== 'object') locale["oceanFreightVendorForm"]["summary"] = {};
locale["oceanFreightVendorForm"]["summary"]["commodity"] = "Komoditi";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["summary"] || typeof locale["oceanFreightVendorForm"]["summary"] !== 'object') locale["oceanFreightVendorForm"]["summary"] = {};
locale["oceanFreightVendorForm"]["summary"]["qty"] = "Qty";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["summary"] || typeof locale["oceanFreightVendorForm"]["summary"] !== 'object') locale["oceanFreightVendorForm"]["summary"] = {};
locale["oceanFreightVendorForm"]["summary"]["route"] = "Rute";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["summary"] || typeof locale["oceanFreightVendorForm"]["summary"] !== 'object') locale["oceanFreightVendorForm"]["summary"] = {};
locale["oceanFreightVendorForm"]["summary"]["tradeType"] = "Trade Type";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["summary"] || typeof locale["oceanFreightVendorForm"]["summary"] !== 'object') locale["oceanFreightVendorForm"]["summary"] = {};
locale["oceanFreightVendorForm"]["summary"]["type"] = "Jenis";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["summary"] || typeof locale["oceanFreightVendorForm"]["summary"] !== 'object') locale["oceanFreightVendorForm"]["summary"] = {};
locale["oceanFreightVendorForm"]["summary"]["unit"] = "unit";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
locale["oceanFreightVendorForm"]["title"] = "Submit Rate Ocean Freight";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
locale["oceanFreightVendorForm"]["totalEstimate"] = "Total Estimasi";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["validation"] || typeof locale["oceanFreightVendorForm"]["validation"] !== 'object') locale["oceanFreightVendorForm"]["validation"] = {};
locale["oceanFreightVendorForm"]["validation"]["exchangeRateRequired"] = "Exchange Rate wajib diisi";
if (!locale["oceanFreightVendorForm"] || typeof locale["oceanFreightVendorForm"] !== 'object') locale["oceanFreightVendorForm"] = {};
if (!locale["oceanFreightVendorForm"]["validation"] || typeof locale["oceanFreightVendorForm"]["validation"] !== 'object') locale["oceanFreightVendorForm"]["validation"] = {};
locale["oceanFreightVendorForm"]["validation"]["oceanFreightRequired"] = "Ocean Freight Amount wajib diisi";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["cart"] || typeof locale["productOrder"]["cart"] !== 'object') locale["productOrder"]["cart"] = {};
locale["productOrder"]["cart"]["changeService"] = "Ganti Layanan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["cart"] || typeof locale["productOrder"]["cart"] !== 'object') locale["productOrder"]["cart"] = {};
locale["productOrder"]["cart"]["continueCheckout"] = "Lanjut Checkout";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["cart"] || typeof locale["productOrder"]["cart"] !== 'object') locale["productOrder"]["cart"] = {};
locale["productOrder"]["cart"]["continueToCheckout"] = "Lanjut ke Checkout";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["cart"] || typeof locale["productOrder"]["cart"] !== 'object') locale["productOrder"]["cart"] = {};
locale["productOrder"]["cart"]["productFirstModeActive"] = "✅ Mode: Produk Dulu (pilih pengiriman nanti) — klik untuk batal";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["cart"] || typeof locale["productOrder"]["cart"] !== 'object') locale["productOrder"]["cart"] = {};
locale["productOrder"]["cart"]["productFirstModeOff"] = "⚡ Pesan produk dulu, pilih pengiriman setelah dikonfirmasi";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["cart"] || typeof locale["productOrder"]["cart"] !== 'object') locale["productOrder"]["cart"] = {};
locale["productOrder"]["cart"]["selectService"] = "Select Layanan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["additionalNotes"] = "Catatan Tambahan (opsional)";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["addShippingService"] = "Add Layanan Pengiriman";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["changeService"] = "Ganti layanan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["commodityCategoryHint"] = "Select kategori untuk menampilkan field dokumen yang relevan.";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["commodityCategory"] = "Kategori Komoditas";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["deliveryAddressRequiredWithService"] = "Alamat Pengiriman wajib diisi jika menggunakan layanan pengiriman";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["email"] = "Email";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["estimatedTotal"] = "Total Estimasi";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["fillAllFields"] = "Isi semua kolom data pemesan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["fullName"] = "Nama Lengkap";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["fullNamePlaceholder"] = "Nama lengkap";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["loadingCategories"] = "Memuat kategori...";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["notesPlaceholder"] = "Catatan tambahan...";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["ordererData"] = "Data Pemesan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["orderSummary"] = "Ringkasan Pesanan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["productFirstModeDesc"] = "Pilihan pengiriman ditentukan setelah produk dikonfirmasi vendor.";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["productFirstMode"] = "Mode: Produk Dulu";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["productSubtotal"] = "Subtotal produk";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["selfPickupNote"] = "Pesanan akan disiapkan untuk diambil di gudang kami";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["selfPickupPlaceholder"] = "Kosongkan jika ambil sendiri di gudang kami";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["sending"] = "Sending...";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["shippingAddress"] = "Alamat Pengiriman";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["shippingAddressOptional"] = "opsional — kosongkan jika ambil sendiri";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["shippingAddressRequiredError"] = "Alamat pengiriman wajib diisi jika menggunakan layanan pengiriman.";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["shippingService"] = "Layanan pengiriman";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["submitOrder"] = "Send Pesanan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["subtitle"] = "Isi informasi produk dan data pengiriman";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["title"] = "Detail Pesanan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["vat"] = "PPN 11%";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["checkout"] || typeof locale["productOrder"]["checkout"] !== 'object') locale["productOrder"]["checkout"] = {};
locale["productOrder"]["checkout"]["whatsapp"] = "No. WhatsApp";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["error"] || typeof locale["productOrder"]["error"] !== 'object') locale["productOrder"]["error"] = {};
locale["productOrder"]["error"]["loadProducts"] = "Gagal memuat produk";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["products"] || typeof locale["productOrder"]["products"] !== 'object') locale["productOrder"]["products"] = {};
locale["productOrder"]["products"]["addToCart"] = "Add";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["products"] || typeof locale["productOrder"]["products"] !== 'object') locale["productOrder"]["products"] = {};
locale["productOrder"]["products"]["noProducts"] = "Tidak ada produk ditemukan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["products"] || typeof locale["productOrder"]["products"] !== 'object') locale["productOrder"]["products"] = {};
locale["productOrder"]["products"]["searchPlaceholder"] = "Cari produk...";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["products"] || typeof locale["productOrder"]["products"] !== 'object') locale["productOrder"]["products"] = {};
locale["productOrder"]["products"]["subtitle"] = "Select produk dan tambahkan ke keranjang";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["products"] || typeof locale["productOrder"]["products"] !== 'object') locale["productOrder"]["products"] = {};
locale["productOrder"]["products"]["title"] = "Pesan Produk";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["serviceCatalog"] || typeof locale["productOrder"]["serviceCatalog"] !== 'object') locale["productOrder"]["serviceCatalog"] = {};
locale["productOrder"]["serviceCatalog"]["costCalculatorAvailable"] = "Tersedia kalkulator biaya";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["serviceCatalog"] || typeof locale["productOrder"]["serviceCatalog"] !== 'object') locale["productOrder"]["serviceCatalog"] = {};
locale["productOrder"]["serviceCatalog"]["skipService"] = "Lanjut tanpa layanan pengiriman";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["serviceCatalog"] || typeof locale["productOrder"]["serviceCatalog"] !== 'object') locale["productOrder"]["serviceCatalog"] = {};
locale["productOrder"]["serviceCatalog"]["subtitle"] = "Tambahkan layanan logistik ke pesanan Anda";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["serviceCatalog"] || typeof locale["productOrder"]["serviceCatalog"] !== 'object') locale["productOrder"]["serviceCatalog"] = {};
locale["productOrder"]["serviceCatalog"]["title"] = "Select Layanan Pengiriman";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["service"] || typeof locale["productOrder"]["service"] !== 'object') locale["productOrder"]["service"] = {};
locale["productOrder"]["service"]["pricePending"] = "Harga menyusul — tim akan konfirmasi";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["service"] || typeof locale["productOrder"]["service"] !== 'object') locale["productOrder"]["service"] = {};
locale["productOrder"]["service"]["pricePendingShort"] = "Harga menyusul";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["success"] || typeof locale["productOrder"]["success"] !== 'object') locale["productOrder"]["success"] = {};
locale["productOrder"]["success"]["contactNote"] = "Tim kami akan menghubungi Anda via WhatsApp atau email untuk konfirmasi dan pembayaran.";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["success"] || typeof locale["productOrder"]["success"] !== 'object') locale["productOrder"]["success"] = {};
locale["productOrder"]["success"]["nextSteps"] = "Langkah selanjutnya:";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["success"] || typeof locale["productOrder"]["success"] !== 'object') locale["productOrder"]["success"] = {};
locale["productOrder"]["success"]["orderAgain"] = "Pesan Lagi";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["success"] || typeof locale["productOrder"]["success"] !== 'object') locale["productOrder"]["success"] = {};
locale["productOrder"]["success"]["orderNumber"] = "No. Pesanan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["success"] || typeof locale["productOrder"]["success"] !== 'object') locale["productOrder"]["success"] = {};
locale["productOrder"]["success"]["productFirstTitle"] = "Pesanan Produk Diterima!";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["success"] || typeof locale["productOrder"]["success"] !== 'object') locale["productOrder"]["success"] = {};
locale["productOrder"]["success"]["service"] = "Service";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["success"] || typeof locale["productOrder"]["success"] !== 'object') locale["productOrder"]["success"] = {};
locale["productOrder"]["success"]["step1"] = "Admin akan mencari vendor produk terbaik";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["success"] || typeof locale["productOrder"]["success"] !== 'object') locale["productOrder"]["success"] = {};
locale["productOrder"]["success"]["step2"] = "Anda akan menerima penawaran produk via WhatsApp";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["success"] || typeof locale["productOrder"]["success"] !== 'object') locale["productOrder"]["success"] = {};
locale["productOrder"]["success"]["step3"] = "Setujui atau tolak penawaran produk";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["success"] || typeof locale["productOrder"]["success"] !== 'object') locale["productOrder"]["success"] = {};
locale["productOrder"]["success"]["step4"] = "Select mode pengiriman yang Anda inginkan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["success"] || typeof locale["productOrder"]["success"] !== 'object') locale["productOrder"]["success"] = {};
locale["productOrder"]["success"]["title"] = "Pesanan Berhasil!";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["success"] || typeof locale["productOrder"]["success"] !== 'object') locale["productOrder"]["success"] = {};
locale["productOrder"]["success"]["viewOtherProducts"] = "View Produk Lain";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["addPricePending"] = "Tambahkan (Harga Menyusul)";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["addToOrder"] = "Tambahkan ke Pesanan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["auto"] = "Auto";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["autoSpec"] = "Spesifikasi dihitung otomatis dari pesanan Anda";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["calculating"] = "Menghitung...";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["compareVehicles"] = "Bandingkan Semua Kendaraan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["comparisonNote"] = "Klik kendaraan untuk memilih. Biaya final dikonfirmasi tim logistik.";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["confirmNote"] = "Estimasi biaya akan dikonfirmasi oleh tim setelah pesanan masuk.";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["contactName"] = "Nama Kontak";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["contactNamePlaceholder"] = "Nama PIC";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["contactPhone"] = "No. Telepon Kontak";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["deliveryAddress"] = "Alamat Pengiriman";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["deliveryAddressError"] = "Alamat pengiriman wajib diisi.";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["deliveryAddressRequired"] = "Alamat Pengiriman wajib diisi";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["destinationHint"] = "Isi kota atau alamat tujuan pengiriman Anda";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["destinationLabel"] = "Kota / Alamat Tujuan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["destinationPlaceholder"] = "Contoh: Surabaya, Bandung, Medan...";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["destination"] = "Destination";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["detailTitle"] = "Detail Pickup & Delivery";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["dimensions"] = "Dimensi";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["estimate"] = "estimasi";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["estimateTitle"] = "Estimasi Biaya Trucking";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["goodsType"] = "Jenis Barang";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["modeCalculator"] = "Kalkulator Estimasi";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["modeDetail"] = "Form Pickup & Delivery";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["notes"] = "Catatan (opsional)";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["notesPlaceholder"] = "Instruksi khusus, info tambahan untuk tim pengiriman...";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["origin"] = "Origin";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["originCity"] = "Kota Asal";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["overCapacity"] = "Melebihi kapasitas";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["pickupAddress"] = "Alamat Pickup";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["pickupNote"] = "Tim kami yang akan menjemput barang dari lokasi ini.";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["subtitle"] = "Isi detail atau hitung estimasi biaya";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["suggested"] = "Disarankan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["suggestedVehicle"] = "Kendaraan Disarankan";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["title"] = "Layanan Trucking";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["totalWeight"] = "Total Berat";
if (!locale["productOrder"] || typeof locale["productOrder"] !== 'object') locale["productOrder"] = {};
if (!locale["productOrder"]["trucking"] || typeof locale["productOrder"]["trucking"] !== 'object') locale["productOrder"]["trucking"] = {};
locale["productOrder"]["trucking"]["vehicleComparison"] = "Perbandingan Kendaraan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["alamatPerusahaan"] = "Alamat Perusahaan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["alamatPerusahaanPh"] = "Alamat lengkap perusahaan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["alamatPickup"] = "Alamat Pickup";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["alamatTujuan"] = "Alamat Tujuan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["arah"] = "Arah";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["arahPerdagangan"] = "Arah Perdagangan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["atauGunakanItemMandiri"] = "Atau gunakan Item Mandiri →";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["batal"] = "Cancel";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["belumAdaItemLayanan"] = "Belum ada item layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["beratKg"] = "Berat (kg)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["buatPermintaanLayanan"] = "Create Permintaan Layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["catatanTambahan"] = "Catatan Tambahan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["catatanTambahanOpsional"] = "Catatan Tambahan (opsional)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["catatanTambahanPh"] = "Informasi tambahan yang perlu diketahui tim CST...";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["catatanTambahanReviewPh"] = "Instruksi khusus, preferensi vendor, timeline, dll...";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["chargeable"] = "Chargeable";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["commodity"] = "Komoditi";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["customsNote"] = "Customs Note / Catatan Kepabeanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["customsNotePh"] = "Instruksi khusus, preferensi jalur, dll...";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["dashboardSaya"] = "Dashboard Saya";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["dataDiri"] = "Data Diri";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["dataLegalPerusahaan"] = "Data Legal Perusahaan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["deskripsiKargo"] = "Deskripsi Kargo";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["destAirport"] = "Bandara Tujuan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["detailLayanan"] = "Detail Layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["dgCheck"] = "Barang Berbahaya / DG";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["dimensiPerKoli"] = "Dimensi per Koli (cm)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["dokumen"] = "Dokumen:";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["dokumenPendukung"] = "Dokumen Pendukung";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["dokumenPerluDisiapkan"] = "Dokumen yang perlu disiapkan:";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["dokumenTersedia"] = "Dokumen Tersedia:";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["domesticDesc"] = "Pengiriman dalam negeri";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["draft"] = "Draft";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["edit"] = "Edit";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["editItem"] = "Edit Item";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["editItemLayanan"] = "Edit Item Layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["emailPic"] = "Email PIC";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["estimasiDurasi"] = "Estimasi Durasi";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["exportDesc"] = "Barang keluar dari Indonesia";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["fotoBarangUrl"] = "Foto Barang (URL)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["fotoKargoUrl"] = "Foto Kargo (URL)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["gantiLayanan"] = "Ganti layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["gross"] = "Gross";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["grossWeightKg"] = "Gross Weight (kg)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["gunakanItemMandiri"] = "Gunakan Item Mandiri";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["hp"] = "HP";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["importDesc"] = "Barang masuk ke Indonesia";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["informasiPemohon"] = "Informasi Pemohon";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["informasiPic"] = "Informasi PIC (Person In Charge)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["invoiceTersedia"] = "Invoice tersedia";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["itemDalamPaket"] = "Item dalam paket:";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["itemLayanan"] = "Item Layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["itemMandiriDesc"] = "Select & tambahkan layanan satu per satu sesuai kebutuhan spesifik Anda";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["itemMandiri"] = "Item Mandiri";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["itemWajibDariPaket"] = "Item wajib dari paket";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["jenisBarang"] = "Jenis barang";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["jenisDokumen"] = "Jenis Dokumen";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["jenisHandling"] = "Jenis Handling";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["jenis"] = "Jenis";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["jenisKendaraan"] = "Jenis Kendaraan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["jenisMuatan"] = "Jenis Muatan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["jenisPerdagangan"] = "Jenis Perdagangan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["jenisSurvey"] = "Jenis Survey";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["judulItem"] = "Judul Item";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["jumlahBarang"] = "Jumlah Barang";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["jumlahKoli"] = "Jumlah Koli";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["jumlahKoliUnit"] = "Jumlah Koli / Unit";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["jumlahUnit"] = "Jumlah Unit";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["kebutuhanKhusus"] = "Kebutuhan Khusus";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["kembaliKeItem"] = "Kembali ke Item";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["kembali"] = "Back";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["kirimPermintaan"] = "Send Permintaan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["klikTombolTambahLayanan"] = "Klik tombol di bawah untuk menambahkan layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["konfirmasiDikirimKe"] = "Confirm dikirim ke";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["lanjut"] = "Continue";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["lartasCheck"] = "Lartas (Larangan / Pembatasan)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["lartasPermitRequired"] = "Dokumen Lartas / Izin diperlukan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["layanan"] = "layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["lebar"] = "Lebar";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["lebarM"] = "Lebar (m)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["logistikCstSubtitle"] = "Logistik CST — isi data awal untuk melanjutkan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["lokasiAsal"] = "Lokasi Asal";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["lokasiGudang"] = "Lokasi Gudang Preferensi";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["lokasi"] = "Lokasi";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["lokasiSurvey"] = "Lokasi Survey";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["lokasiTujuan"] = "Lokasi Tujuan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["mataUang"] = "Mata Uang";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["memeriksaProfil"] = "Memeriksa profil perusahaan...";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["modaTransportasi"] = "Moda Transportasi";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["mode"] = "Mode";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["namaAnda"] = "Nama Anda";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["namaLengkap"] = "Nama Lengkap";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["nama"] = "Name";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["namaPerusahaan"] = "Nama Perusahaan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["namaPerusahaanPtCvUd"] = "Nama Perusahaan (PT/CV/UD)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["namaPic"] = "Nama PIC";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["namaPicPh"] = "Nama lengkap PIC";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["negaraAsal"] = "Negara Asal";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["negaraTujuan"] = "Negara Tujuan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["nilaiCif"] = "Nilai CIF (IDR)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["nilaiInvoice"] = "Nilai Invoice";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["nilaiKargo"] = "Nilai Kargo";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["nomorHpWa"] = "Nomor HP / WhatsApp";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["nomorIndukBerusaha"] = "Nomor Induk Berusaha";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["nomorReferensiAnda"] = "Nomor referensi Anda:";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["npwpNib"] = "NPWP / NIB Perusahaan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["npwpNibPh"] = "NPWP atau NIB";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["opsionalNanti"] = "Opsional — dapat dilengkapi nanti";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["originAirport"] = "Bandara Asal";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["packingListTersedia"] = "Packing List tersedia";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["paketBoronganDesc"] = "Select paket lengkap yang sudah mencakup semua layanan dalam satu bundel";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["paketBorongan"] = "Paket Borongan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["paket"] = "Paket";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["paketUntuk"] = "Paket untuk";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["panjangM"] = "Panjang (m)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["panjang"] = "Panjang";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["perdagangan"] = "Perdagangan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["permintaanTerkirim"] = "Permintaan Terkirim!";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["persyaratanPenyimpanan"] = "Persyaratan Penyimpanan Khusus";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["persyaratanPenyimpananPh"] = "e.g. suhu tertentu, rak khusus, forklift...";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["perusahaan"] = "Company";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["picPickup"] = "PIC Pickup (Nama & HP)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["picTujuan"] = "PIC Tujuan (Nama & HP)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["pilihModePemesanan"] = "Select Mode Pemesanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["pilihPaketBorongan"] = "Select Paket Borongan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["pilihPaket"] = "Select Paket";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["plusLainnya"] = "+6 lainnya";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["plusPaket"] = "+2 paket";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["profilPerusahaan"] = "Profil Perusahaan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["profilPerusahaanSubtitle"] = "Data legal & informasi PIC untuk memproses permintaan layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["profilTerverifikasi"] = "Profil Terverifikasi";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["readyDate"] = "Ready Date";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["reviewKirim"] = "Review & Kirim";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["reviewPermintaan"] = "Review Permintaan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["ringkasan"] = "Summary";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["selectPlaceholder"] = "Pilih...";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["serviceMode"] = "Mode Layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["setelahDikirimDesc"] = "Tim B2B Marketplace and Logistic menghubungi Anda dalam 1×24 jam dengan penawaran harga untuk setiap item layanan.";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["setelahDikirim"] = "Setelah dikirim:";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["simpanLanjut"] = "Save & Lanjut";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["simpanPerubahan"] = "Save Perubahan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["skuKodeProduk"] = "SKU / Kode Produk";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["stepDataDiri"] = "Data Diri";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["stepDetailLayanan"] = "Detail Layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["stepModePemesanan"] = "Mode Pemesanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["stepProfilPerusahaan"] = "Profil Perusahaan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["stepReviewKirim"] = "Review & Kirim";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tambahItemLagi"] = "Add Item Lagi";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tambahItemLayanan"] = "Add Item Layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tambahItem"] = "Add Item";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tambahLayanan"] = "Add Layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tambahRequestLain"] = "Add Request Lain";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tanggalInbound"] = "Tanggal Inbound";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tanggalPickup"] = "Tanggal Pickup";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tanggalSurvey"] = "Tanggal Survey";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tidakAdaPaket"] = "Tidak ada paket tersedia untuk";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tidakAda"] = "Tidak Ada";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["timMenghubungi"] = "Tim kami menghubungi dalam 1×24 jam.";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tinggiM"] = "Tinggi (m)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tinggi"] = "Tinggi";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tipeContainer"] = "Tipe Container";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tipeCoverage"] = "Tipe Coverage";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["tipePenyimpanan"] = "Tipe Penyimpanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastAddMinOne"] = "Tambahkan minimal 1 item layanan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastApplyFailed"] = "Gagal menerapkan paket";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastCreateRequestFailed"] = "Gagal membuat request";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastError"] = "Terjadi kesalahan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastFillDataFirst"] = "Isi data diri terlebih dahulu";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastFillDataStep1"] = "Isi data diri di langkah pertama";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastItemAdded2"] = "ditambahkan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastItemAdded"] = "item ditambahkan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastItemDeleted"] = "dihapus";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastItemUpdated"] = "diperbarui";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastPaketApplied"] = "diterapkan";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastPaket"] = "Paket";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastPickServiceAndTitle"] = "Select jenis layanan dan isi judul";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastRequiredItemCannotDelete"] = "Item wajib tidak bisa dihapus dari paket";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastSaveItemFailed"] = "Gagal menyimpan item";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastSubmitError"] = "Terjadi kesalahan saat submit";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["toastSubmitFailed"] = "Gagal submit";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["totalBeratKg"] = "Total Berat (kg)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["totalBeratTon"] = "Total Berat (ton)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["totalItem"] = "Total Item";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["urlApiNikIzin"] = "URL API / NIK Izin Impor-Ekspor";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["urlDokumenLegal"] = "URL Dokumen Legal (Akta, NIB, dll.)";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["urlKtpPic"] = "URL KTP PIC";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["urlSuratKuasa"] = "URL Surat Kuasa";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["volumetric"] = "Volumetric";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["waPic"] = "WA PIC";
if (!locale["serviceCart"] || typeof locale["serviceCart"] !== 'object') locale["serviceCart"] = {};
locale["serviceCart"]["whatsappPic"] = "WhatsApp PIC";
if (!locale["step"] || typeof locale["step"] !== 'object') locale["step"] = {};
locale["step"]["0"] = "2";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["additionalNotes"] = "Catatan Tambahan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["additionalNotesPlaceholder"] = "Catatan operasional, kendala, atau informasi lain yang relevan...";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["addNewDriver"] = "Add driver baru";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["addNewDriverTitle"] = "Add Driver Baru";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["agreedPrice"] = "✅ Setuju harga asal";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["agreePriceDesc"] = "Harga sesuai";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["agreePrice"] = "Setuju Harga Asal";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["awbBl"] = "No. AWB / BL";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["awbBlNumber"] = "No. AWB / BL";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["bookingNumberField"] = "No. Booking";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["bookingNumber"] = "No. Booking";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["bookingNumberPlaceholder"] = "Nomor booking jika ada";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["cancel"] = "Cancel";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["carrier"] = "Carrier / Maskapai";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["carrierExpedisi"] = "Nama Carrier / Ekspedisi";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["carrierExpedisiPlaceholder"] = "JNE, J&T, Sicepat, dll";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["carrierName"] = "Nama Carrier / Maskapai";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["carrierPlaceholder"] = "Garuda Cargo, Evergreen, dll";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["changeDriver"] = "Ganti";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["chooseFile"] = "📎 Pilih File";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["commodity"] = "Komoditi";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["confirmProductFulfillment"] = "✓ Konfirmasi Pemenuhan Produk";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customer"] = "Customer";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customerPickup"] = "🏭 Customer Pickup";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customerPickupDesc"] = "Customer mengambil sendiri dari gudang vendor";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customsDocuments"] = "Dokumen Dibutuhkan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customsDocumentsField"] = "Dokumen Dibutuhkan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customsDocumentsPlaceholder"] = "PIB, BC 2.3, Invoice, Packing List, dll";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customsPic"] = "Nama PIC Kepabeanan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customsPicName"] = "Nama PIC Kepabeanan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customsPicPlaceholder"] = "Nama PIC / PPJK";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customsPicShort"] = "PIC Kepabeanan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customsProcessEta"] = "Est. Selesai Bea Cukai";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customsProcessEtaField"] = "Estimasi Selesai Proses Bea Cukai";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["customsProcessEtaPlaceholder"] = "dd/mm/yyyy atau rentang waktu";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["dataNotFound"] = "Data tidak ditemukan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["days"] = "hari";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["deliveryMethodHint"] = "Bagaimana barang akan dikirim ke customer?";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["deliveryMethod"] = "Metode Pengiriman";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["deliveryMethodTitle"] = "Metode Pengiriman";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["dppBase"] = "DPP (Harga Dasar)";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["dpp"] = "DPP";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["driverNameLabel"] = "Nama Driver";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["driverName"] = "Nama Driver";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["driverNamePlaceholder"] = "Nama lengkap driver";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["driverNameRequired"] = "Nama driver wajib diisi";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["driverPhoneField"] = "No. HP Driver";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["driverPhoneLabel"] = "No. HP";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["driverPhone"] = "No. HP Driver";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["driverShort"] = "Driver";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["enterRevisedPrice"] = "Masukkan harga revisi.";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["estPickup"] = "Est. Pickup";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["estPickupPlaceholder"] = "Contoh: 14 Jun 2026, 09:00 WIB";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["estPickupTime"] = "Estimasi Waktu Pickup";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["etaField"] = "ETA (Tanggal Kedatangan)";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["etdField"] = "ETD (Tanggal Keberangkatan)";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["fillNotesDesc"] = "Isi catatan di bawah untuk menjelaskan progres fulfillment Anda.";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["flightVessel"] = "No. Penerbangan/Vessel";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["flightVesselNumber"] = "No. Penerbangan / Vessel";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["flightVesselPlaceholder"] = "GA-123, MSC Elbe, dll";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["fulfillmentData"] = "Data Fulfillment";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["fulfillmentForm"] = "Form Fulfillment";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["fulfillmentScheduleTitle"] = "Jadwal Pemenuhan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["fulfillmentSummaryTitle"] = "Ringkasan Fulfillment";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["genericError"] = "Terjadi kesalahan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["grandTotalOrder"] = "Grand Total Order";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["includingPpn"] = "(sudah termasuk PPN)";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["invoiceLabel"] = "Invoice / Faktur";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["leadTimeAuto"] = "Otomatis dihitung dari tanggal siap";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["leadTime"] = "Lead Time";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["leadTimePlaceholder"] = "Contoh: 3 hari kerja";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["linkInvalidHint"] = "Pastikan link yang Anda buka sudah benar.";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["linkInvalid"] = "Link tidak valid";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["loading"] = "Memuat…";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["noDriversRegistered"] = "Belum ada driver terdaftar";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["notFound"] = "tidak ditemukan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["orderDetail"] = "Detail Order";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["orderNumber"] = "No. Order";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["orderPrice"] = "Harga order:";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["packingListLabel"] = "Packing List";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["plateNumberField"] = "Nomor Plat Kendaraan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["plateNumber"] = "Nomor Plat";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["platNumberLabel"] = "Plat Nomor";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["platShort"] = "No. Plat";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["podLabel"] = "POD (Proof of Delivery)";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["priceConfirm"] = "Confirm Harga";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["priceConfirmTitle"] = "Confirm Harga";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["pricePerUnit"] = "Harga/Unit";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["pricePerUnitShort"] = "Harga/Unit";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["productDetail"] = "Detail Produk";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["productFormDesc"] = "Lengkapi data konfirmasi produk, stok, harga, dan jadwal pengiriman.";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["productFulfillmentConfirm"] = "Confirm Pemenuhan Produk";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["productName"] = "Nama Produk";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["product"] = "Product";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["productSubmitNote"] = "Data Anda akan langsung diproses oleh tim kami";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["productTemplate"] = "Template Produk";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["progressOrder"] = "Progress Order";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["qtyFulfilledField"] = "Jumlah yang Dapat Dipenuhi";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["qtyFulfilledPlaceholder"] = "Contoh: 50 karton atau 200 kg";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["qtyFulfilled"] = "Qty Terpenuhi";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["qtyOrder"] = "Qty Order";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["readOnly"] = "Read-only — tidak dapat diubah.";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["readyDateLabel"] = "Tanggal Siap Kirim";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["readyDateRequired"] = "Tanggal siap kirim wajib diisi.";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["readyDate"] = "Tanggal Siap Kirim";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["readyToShip"] = "Kapan barang siap dikirim?";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["requiredDate"] = "Tgl Butuh";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["reviewDesc"] = "Berikut ringkasan data yang telah dikirim.";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["reviewTitle"] = "Data Fulfillment";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["revisedPriceDpp"] = "Harga Revisi (DPP)";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["revisedPriceField"] = "Harga Total Penawaran (sebelum PPN, Rp)";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["revisedPricePlaceholder"] = "Contoh: 5000000";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["revisedPriceSubmitted"] = "✏️ Revisi harga diajukan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["revisePrice"] = "Ajukan Revisi Harga";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["revisePriceDesc"] = "Input harga baru yang Anda tawarkan (sebelum PPN)";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["route"] = "Rute";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["saveAndSelect"] = "Save & Pilih";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["saveDriverFailed"] = "Gagal menyimpan driver";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["saving"] = "Saving...";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["searchDriver"] = "Cari nama driver atau plat...";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["selectDriver"] = "Select Driver";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["selectPlaceholder"] = "— Pilih —";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["selectPriceFirst"] = "Select konfirmasi harga terlebih dahulu.";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["selectStockFirst"] = "Select status konfirmasi stok terlebih dahulu.";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["sendFailed"] = "Gagal mengirim";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["sending"] = "Sending...";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["serviceFormDesc"] = "Lengkapi data di bawah ini untuk mengkonfirmasi penugasan order Anda.";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["service"] = "Service";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["serviceSubmitNote"] = "Data tidak dapat diubah setelah dikirim";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockAllDesc"] = "Semua qty dapat dipenuhi";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockAll"] = "✅ Tersedia Semua";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockConfirmHint"] = "Select ketersediaan stok untuk order ini";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockConfirmTitle"] = "Confirm Stok";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockNoneDesc"] = "Stok kosong saat ini";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockNone"] = "❌ Tidak Tersedia";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockPartialDesc"] = "Hanya sebagian qty tersedia";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockPartial"] = "⚠️ Tersedia Sebagian";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockPhotoAlt"] = "Foto stok";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockPhoto"] = "Foto Barang / Stok";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockPhotoLabel"] = "Foto Barang / Stok";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockShort"] = "Stok";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockStatusLabel"] = "Status Stok";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["stockStatus"] = "Status Stok";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["submitFulfillmentData"] = "Send Data Fulfillment";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["submittedFulfillmentData"] = "Data Fulfillment yang Dikirim";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["successDesc"] = "Data fulfillment Anda telah berhasil dikirim.";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["successTitle"] = "Data Berhasil Dikirim!";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["supportingDocLabel"] = "Dokumen Pendukung Lainnya";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["thirdPartyDesc"] = "Dikirim via jasa pengiriman pihak ketiga";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["thirdParty"] = "📦 Third Party Carrier";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["today"] = "Hari ini";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["totalInclPpn"] = "Total inkl. PPN";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["unit"] = "Satuan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["unitShort"] = "Satuan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["uploadDocTitle"] = "Upload Dokumen";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["uploadedChange"] = "✅ Terupload — Ganti";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["uploadFailed"] = "Upload gagal";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["uploadHint"] = "Lampirkan foto produk, packing list, invoice, dan dokumen lainnya";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["uploading"] = "Mengupload...";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["vehicleServicePlaceholder"] = "Reguler, Express, Cargo, dll";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["vehicleService"] = "Tipe Kendaraan / Layanan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["vehicleTypeField"] = "Tipe Kendaraan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["vehicleTypeLabel"] = "Jenis Kendaraan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["vehicleTypeOrder"] = "Tipe Kendaraan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["vehicleTypePlaceholder2"] = "Engkel, Tronton, CDD, dll";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["vehicleTypePlaceholder"] = "Engkel, CDD, dll";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["vehicleType"] = "Tipe Kendaraan";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["vendorDeliveryDesc"] = "Vendor mengirim langsung ke lokasi customer";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["vendorDelivery"] = "🚛 Vendor Delivery";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["vendor"] = "Vendor";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["viewDocument"] = "View dokumen";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["viewInvoice"] = "View Invoice";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["viewPackingList"] = "View Packing List";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["viewPhoto"] = "View foto";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["viewPod"] = "View POD (Proof of Delivery)";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["viewStockPhoto"] = "View file foto stok";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["viewSupportingDoc"] = "View Dokumen Pendukung";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["warehouseAddressHint"] = "Alamat lengkap gudang/lokasi pickup barang";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["warehouseAddressLabel"] = "Alamat Gudang";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["warehouseAddressPlaceholder"] = "Jl. Industri No. 10, Kawasan Pabrik, Jakarta Utara";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["warehouseLocation"] = "Lokasi Gudang";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["warehouseTitle"] = "Lokasi Gudang / Pickup";
if (!locale["vendorFulfillment"] || typeof locale["vendorFulfillment"] !== 'object') locale["vendorFulfillment"] = {};
locale["vendorFulfillment"]["weight"] = "Weight";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["adminWillContact"] = "Admin akan menghubungi Anda segera. Terima kasih! 🙏";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["canFulfill"] = "Bisa memenuhi order";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["cannotFulfill"] = "Tidak bisa memenuhi";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["checkLink"] = "Pastikan link yang digunakan benar, atau hubungi admin.";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["confirmOrder"] = "Confirm Order";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["confirmOrderTitle"] = "Confirm Order Produk";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["connectionError"] = "Koneksi gagal. Periksa internet Anda dan coba lagi.";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["customerNotes"] = "Catatan Customer";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["customer"] = "Pelanggan";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["loadFailed"] = "Gagal Memuat";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["loadingOrder"] = "Memuat data order...";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["networkError"] = "Gagal memuat data. Periksa koneksi internet Anda.";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["notes"] = "Notes";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["notesPlaceholder"] = "Tambahkan catatan jika ada...";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["optional"] = "opsional";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["orderDetail"] = "Detail Order";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["orderNo"] = "No. Order";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["orderNotFoundDesc"] = "No. order";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["orderNotFound"] = "Order Tidak Ditemukan";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["orderNotFoundSuffix"] = "tidak ditemukan atau link tidak valid.";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["productList"] = "List Produk";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["quotedPrice"] = "Harga Penawaran";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["responseFormTitle"] = "Form Response Vendor";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["responseNote"] = "Response Anda akan langsung diterima oleh tim admin.";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["responseSentDesc"] = "Response Anda untuk order";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["responseSent"] = "Response Terkirim!";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["responseSentSuffix"] = "telah dikirim ke admin.";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["selectStatusError"] = "Select SETUJU atau TOLAK terlebih dahulu.";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["sending"] = "Sending...";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["shippingAddress"] = "Alamat Pengiriman";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["statusLabel"] = "Status";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["submitError"] = "Terjadi kesalahan. Coba lagi.";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["submitResponse"] = "Send Response";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["summary"] = "Summary";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["total"] = "Total";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["vendorName"] = "Nama Perusahaan / Vendor";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["vendorNamePlaceholder"] = "Contoh: PT Wangsamas Logistics";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["vendorPhoneHint"] = "Digunakan untuk mengirim konfirmasi WA ke Anda";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["vendorPhone"] = "No. HP / WhatsApp Vendor";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["vendorPhonePlaceholder"] = "Contoh: 08123456789";
if (!locale["vendorProductApproval"] || typeof locale["vendorProductApproval"] !== 'object') locale["vendorProductApproval"] = {};
locale["vendorProductApproval"]["vendorResponse"] = "Vendor Response";

export default locale;
