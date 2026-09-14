// @refresh reset
// @ts-nocheck
import type { DeepRecord } from "./types";

const locale: DeepRecord = {
  nav: {
    home: 'Inicio',
    products: 'Productos',
    services: 'Servicios',
    about: 'Acerca de',
    contact: 'Contacto',
    trackOrder: 'Rastrear pedido',
    calculator: 'Calculadora',
    orderProduct: 'Pedir productos',
    login: 'Iniciar sesión',
    register: 'Registrarse ahora',
    dashboard: 'Panel',
    logout: 'Cerrar sesión',
    admin: 'Admin',
    cart: 'Carrito',
    more: 'Más',
    marketplace: 'Mercado en línea',
    hsCode: 'Calculadora Código HS',
    createRequest: 'Crear solicitud',
    request: 'Solicitud',
    myShipments: 'Mis envíos',
    documents: 'Documentos',
    invoicePayment: 'Factura & Pago',
    invoice: 'Factura',
    companyProfile: 'Perfil de empresa',
    profile: 'Perfil',
    importTariffCalc: 'Calculadora de aranceles de importación',
    logisticCostCalc: 'Calculadora de costes logísticos',
    myRfqs: 'Mis RFQs',
    myPurchaseOrders: 'Mis Pedidos',
    pendingApprovals: 'Aprobaciones pendientes',
  },
  navbar: {
    searchPlaceholder: 'Buscar servicios, productos…',
    searchBtn: 'Buscar',
    searchSuggestions: 'Sugerencias de búsqueda',
    searchPopular: 'Popular',
    searchEnterHint: 'Presionar Enter para buscar todo',
    searchNoSuggestions: 'Sin sugerencias',
    searchPressEnter: 'Presionar Enter para buscar "{query}"',
    uploadLogoFailed: 'Error al subir el logo',
    kindService: 'Servicio',
    kindProduct: 'Producto',
    globalLogisticsPartner: 'Socio logístico global',
    track: 'Rastrear',
    order: 'Pedido',
    tariffAndCost: 'Tarifas & Costes',
    navLabel: 'Navegación',
  },
  hero: {
    badge: 'Soluciones logísticas integradas impulsadas por tecnología',
    title: 'Logística global, precisión sin compromiso.',
    description: 'Soluciones confiables de exportación, importación y aduanas que conectan su negocio con el mundo de forma segura y puntual.',
    primaryCta: 'Ver servicios',
    secondaryCta: 'Convertirse en socio',
    trusted: '· Confiado por 500+ empresas',
    scrollDown: 'Desplazarse',
  },
  quickActions: {
    track: 'Rastrear pedido',
    calculate: 'Calcular costo',
    order: 'Pedir ahora',
  },
  stats: {
    countries: 'Países de destino',
    security: 'Seguridad de carga',
    shipments: 'Envíos por mes',
    support: 'Atención al cliente',
  },
  about: {
    label: 'Acerca de nosotros',
    title: 'Infraestructura y experiencia sin igual',
    description: 'es una empresa de carga y correduría aduanera de confianza que atiende las necesidades de exportación e importación de empresas y pymes en Indonesia. Contamos con un equipo certificado y una red de agentes globales en más de 150 países.',
    cta: 'Únase a nosotros',
    point1: 'Visibilidad de la cadena de suministro de extremo a extremo en tiempo real',
    point2: 'Especialistas en aduanas con licencia para el procesamiento rápido de documentos',
    point3: 'Instalaciones de almacenamiento estratégicas cerca de los principales puertos',
    point4: 'Gestores de cuentas dedicados para clientes corporativos',
    point5: 'Tecnología de seguimiento de envíos basada en la nube',
  },
  why: {
    label: 'Nuestras ventajas',
    title: '¿Por qué confiar su logística a nosotros?',
    description: 'No solo movemos mercancías — nos aseguramos de que todo el viaje de la carga transcurra sin problemas desde la documentación hasta la entrega.',
    card1Title: 'Aduana exprés',
    card1Desc: 'Nuestros especialistas procesan los documentos aduaneros rápidamente para que la carga nunca se retenga en el puerto.',
    card2Title: 'Red global',
    card2Desc: 'Agentes en más de 150 países garantizan la entrega puerta a puerta a cualquier destino del mundo.',
    card3Title: 'Tecnología transparente',
    card3Desc: 'Nuestra plataforma en la nube le ofrece visibilidad completa del estado de su envío en cualquier momento y lugar.',
    card4Title: 'Seguro de carga',
    card4Desc: 'Cobertura integral para cada envío, que protege su inversión empresarial de riesgos inesperados.',
    card5Title: 'Precios competitivos',
    card5Desc: 'Negociamos las mejores tarifas con aerolíneas y navieras globales para mantener eficientes sus costos logísticos.',
    card6Title: 'Soporte 24/7',
    card6Desc: 'Nuestro equipo de atención al cliente siempre está disponible para ayudarle cuando necesite información o asistencia urgente.',
  },
  cta: {
    title: '¿Listo para acelerar su logística global?',
    titleHighlight: 'logística global',
    description: 'han confiado su carga a',
    suffix: 'Únase a nosotros y experimente la diferencia.',
    prefix: 'Miles de empresas',
    primaryBtn: 'Crear cuenta gratuita',
    secondaryBtn: 'Contactar con ventas',
  },
  contact: {
    label: 'Contacto',
    title: '¿Cómo podemos ayudarle?',
    description: 'Nuestro equipo está listo para responder sus preguntas sobre servicios de exportación-importación, despacho de aduanas, almacenamiento y otras soluciones logísticas.',
    sendMessage: 'Enviar un mensaje',
    fullName: 'Nombre completo',
    email: 'Correo electrónico',
    company: 'Nombre de la empresa',
    serviceNeed: 'Servicio necesario',
    message: 'Mensaje',
    submit: 'Enviar mensaje',
    successAlert: 'Su mensaje ha sido enviado. Nuestro equipo se pondrá en contacto con usted en breve.',
    addressLabel: 'Dirección de la oficina',
    emailLabel: 'Correo electrónico',
    phoneLabel: 'Teléfono',
    selectPlaceholder: 'Seleccionar un servicio...',
    namePlaceholder: 'Juan García',
    messagePlaceholder: 'Cuéntenos sobre sus necesidades logísticas...',
    companyPlaceholder: 'Acme Logística S.L.',
    optExport: 'Exportación',
    optImport: 'Importación',
    optCustoms: 'Despacho de aduanas',
    optWarehouse: 'Almacenamiento',
    optInternational: 'Envío internacional',
    optOther: 'Otro',
  },
  footer: {
    quickLinks: 'Enlaces rápidos',
    services: 'Servicios',
    servicesTitle: 'Nuestros servicios',
    contactUs: 'Contacto',
    home: 'Inicio',
    portal: 'Portal del cliente',
    customerPortal: 'Portal del cliente',
    seaFreight: 'Flete marítimo internacional',
    airFreight: 'Agente de carga aérea',
    customsBrokerage: 'Agente de aduanas',
    domesticDistribution: 'Distribución nacional',
    customs: 'Agente de aduanas',
    domestic: 'Distribución nacional',
    allRights: 'Todos los derechos reservados.',
    tagline: 'Soluciones logísticas integradas para su negocio global.',
    description: 'Soluciones logísticas integradas y basadas en tecnología para sus necesidades de exportación, importación y distribución.',
    location: 'Ubicación',
    phone: 'Teléfono',
    email: 'Correo electrónico',
    copyright: 'Todos los derechos reservados.',
    waMessage: 'Hola, me gustaría consultar sobre sus servicios.',
    track: 'Rastrear pedido',
    calculator: 'Calculadora de costos',
    about: 'Acerca de nosotros',
    backToTop: 'Volver arriba',
  },
  testimonials: {
    label: 'Testimonios de clientes',
    title: 'La confianza de cientos de empresas',
    desc: 'Escuche directamente a los clientes que han experimentado nuestros servicios logísticos.',
    t1Name: 'Budi Santoso',
    t1Role: 'Director de Operaciones · PT. Karya Maju Bersama',
    t1Text: 'B2B Marketplace and Logistic nos ayudó a exportar productos de mobiliario a 12 países sin ningún obstáculo. Su rápido despacho aduanero cambió verdaderamente nuestra forma de hacer negocios a nivel global.',
    t2Name: 'Sari Dewi',
    t2Role: 'Gerente de Cadena de Suministro · Retailindo Group',
    t2Text: 'Su plataforma de seguimiento en tiempo real es de gran ayuda. Podemos monitorear la carga desde el almacén de origen hasta nuestros clientes en el extranjero en cualquier momento.',
    t3Name: 'Ahmad Fauzi',
    t3Role: 'CEO · PT. Nusantara Trading Co.',
    t3Text: 'Su equipo está disponible las 24 horas, los 7 días de la semana. Cuando surgieron cambios repentinos en la regulación de importaciones, encontraron de inmediato la mejor solución para mantener nuestra operación en marcha.',
  },
  partners: {
    label: 'Socios transportistas globales',
    title: 'Red de transporte de clase mundial',
    desc: 'Colaboramos con las principales aerolíneas y navieras para obtener las mejores tarifas y la mejor disponibilidad de espacio de carga.',
  },
  login: {
    welcomeBack: 'Bienvenido de nuevo',
    subtitle: 'Ingrese sus credenciales para acceder a su portal',
    sideTitle: 'Gestione sus envíos globales con facilidad.',
    sideDesc: 'Acceda a su panel para rastrear pedidos, gestionar documentos y solicitar nuevas cotizaciones.',
    sideTrust: 'Con la confianza de más de 1.000 empresas en todo el mundo',
    email: 'Correo electrónico',
    password: 'Contraseña',
    forgotPassword: '¿Olvidó su contraseña?',
    signIn: 'Iniciar sesión',
    signingIn: 'Iniciando sesión...',
    noAccount: '¿No tiene una cuenta?',
    createAccount: 'Crear una cuenta',
    loginRequired: 'Inicie sesión para continuar al pago.',
    devLoginFailed: 'Error de inicio de sesión dev.',
    invalidEmail: 'Formato de correo electrónico inválido.',
    otpSendFailed: 'Error al enviar el código.',
    otpSent: 'Código OTP enviado.',
    serverError: 'No se pudo contactar al servidor.',
    enterOtp: 'Ingrese el código OTP.',
    otpInvalid: 'Código OTP incorrecto.',
    enterPhone: 'Ingrese su número de teléfono / WA.',
    otpSentWa: 'OTP enviado a su WhatsApp.',
    otpSentToWaPrefix: 'Código enviado a WhatsApp',
    otpLabel: 'Código OTP (6 dígitos)',
    authUnavailable: 'Servicio de autenticación no disponible. Por favor contacte al administrador.',
    sending: 'Enviando...',
    devLoginAs: 'Iniciar sesión como {role}',
    devLoginBanner: 'Dev Login — solo visible en modo de desarrollo',
    useOtherPhone: 'Usar otro número',
    notRegistered: 'Número de teléfono no registrado.',
    registerNow: 'Registrarse ahora',
    phoneFormat: 'Formato: 081234… o 628… o 8…',
    emailOrPasswordWrong: 'Correo electrónico o contraseña incorrectos.',
    enterEmailFirst: 'Por favor ingrese su correo electrónico primero.',
    sendEmailFailed: 'Error al enviar el correo de restablecimiento de contraseña.',
    resetEmailSent: 'Si el correo está registrado, se ha enviado un enlace de restablecimiento.',
    serverErrorRetry: 'No se pudo contactar al servidor. Por favor intente de nuevo.',
    tabEmailOtp: 'Correo OTP',
    tabPhone: 'Teléfono / WA',
  },
  register: {
    title: 'Cree su cuenta',
    subtitle: 'Únase a nuestra plataforma para gestionar su logística fácilmente',
    stepOf: 'Paso',
    of: 'de',
    continueToServices: 'Continuar a servicios',
    fullName: 'Nombre completo',
    emailAddress: 'Dirección de correo electrónico',
    company: 'Nombre de la empresa',
    phone: 'Número de teléfono',
    password: 'Contraseña',
    servicesTitle: '¿En qué servicios está interesado?',
    servicesDesc: 'Seleccione todos los que correspondan para que podamos personalizar su experiencia.',
    selected: 'seleccionado(s)',
    back: 'Atrás',
    createAccount: 'Crear cuenta',
    creatingAccount: 'Creando cuenta...',
    alreadyHaveAccount: '¿Ya tiene una cuenta?',
    signIn: 'Iniciar sesión',
    redirectToCheckout: 'Cree una cuenta para continuar con el pedido de servicios logísticos. Tras el registro, será redirigido al pago.',
  },
  products: {
    catalogLabel: 'Catálogo de productos',
    title: 'Nuestros productos',
    description: 'Descubra productos de calidad para las necesidades de su negocio.',
    search: 'Buscar productos o categorías...',
    all: 'Todos',
    negotiable: 'Precio negociable',
    descriptionLabel: 'Descripción',
    quantityLabel: 'Cantidad',
    shippingLabel: 'Seleccionar envío / servicio',
    serviceTab: 'Servicio',
    courierTab: 'Mensajería',
    noShipping: 'No hay opciones disponibles',
    subtotal: 'Subtotal',
    freight: 'Flete',
    serviceNote: '+ Tarifa de servicio calculada en la página de servicio',
    proceedOrder: 'Continuar con el pedido',
    proceedTo: 'Continuar a',
    selectShipping: 'Seleccionar envío / servicio',
    redirectNote: 'Será redirigido a la página de detalles del servicio',
    noProducts: 'No se encontraron productos',
    noMatches: 'Ningún producto coincide con su búsqueda',
    sold: '100+ vendidos',
    viewOrder: 'Ver y pedir',
    tryOtherKeyword: 'Pruebe con otra palabra clave.',
    noProductsYet: 'Aún no hay productos disponibles.',
  },
  jasa: {
    catalogLabel: 'Catálogo de servicios',
    title: 'Servicios',
    search: 'Buscar servicios o categorías...',
    all: 'Todos',
    createOrder: 'Crear pedido',
    submitService: 'Enviar solicitud',
    viewDetail: 'Ver detalles',
    noMatches: 'No hay servicios coincidentes',
    calcCost: 'Calculadora de costos',
    calcButton: 'Calcular costo',
    customsTitle: 'Gestión aduanera / PPJK',
    importLabel: 'Importación',
    exportLabel: 'Exportación',
    domesticLabel: 'Nacional',
    backBtn: 'Atrás',
    heroTitle1: 'Soluciones Logísticas',
    heroTitleAccent: 'De confianza',
    heroTitle2: 'para tu Negocio',
    heroSubtitle: 'Exportación, importación, aduanas y envío nacional — todo en una plataforma integrada.',
    statActiveClients: 'Clientes activos',
    statDestinations: 'Países de destino',
    statExperience: 'Años de experiencia',
    modeIndividual: 'Artículos individuales',
    modeIndividualSub: 'Elegir por servicio',
    modeBulk: 'Paquete a granel',
    modeBulkSub: 'Soluciones por contrato',
    badgePPJK: 'Licencia PPJK oficial',
    badgePPJKSub: 'Registrado en Aduanas',
    badgeRating: 'Rating 4.9 / 5.0',
    badgeRatingSub: 'From 1,200+ reviews',
    badgeDelivery: 'On-Time Delivery',
    badgeDeliverySub: '98.5% on-time rate',
    badgePPJKMobile: 'PPJK Autorizado',
    badgeRatingMobile: 'Rating 4.9/5.0',
    badgeDeliveryMobile: 'On-Time 98.5%',
    badgeTimeMobile: 'On-time',
    searchPlaceholder: 'Search services, e.g.: air freight, trucking, customs...',
    searchResultCount: 'vendor services found for',
    breadcrumbServices: 'Servicios',
    bulkConsultBtn: 'Consulta gratuita',
    bulkCtaFreeConsult: 'Consulta gratuita, sin compromiso.',
    bulkCtaTeamWill: 'Nuestro equipo diseñará el paquete de soluciones adecuado para sus necesidades logísticas.',
    bulkDesc: 'Logística contractual de extremo a extremo para necesidades de exportación, importación y distribución a gran escala.',
    bulkFullForwardingDesc: 'Gestión completa desde la recogida de la carga hasta la entrega en el destino final.',
    bulkSeaFreightBundleDesc: 'Paquetes FCL/LCL con tarifas contractuales competitivas y horarios fijos.',
    bulkSubLabel: 'Soluciones contractuales',
    bulkSubmitBtn: 'Enviar paquete global',
    bulkTitle: 'Paquete global',
    bulkWarehouseDesc: 'Servicios de almacenamiento, clasificación y reembalaje adaptados a las necesidades del cliente.',
    bulkWarehouseTitle: 'Almacenaje y manipulación',
    categoryNotFound: 'Categoría de servicio no encontrada.',
    categoryServicesCount: 'servicios',
    categoryVendorCount: 'ofertas de proveedor',
    contactUsOffer: 'Contáctenos para obtener una cotización.',
    detail: 'Ver detalle',
    filterAndSort: 'Filtrar y ordenar',
    mulairequest: 'Iniciar solicitud',
    noVendorOffers: 'Aún no hay ofertas de proveedores para este servicio.',
    pickService: 'Seleccionar servicio',
    registerAndRequest: 'Registrarse y enviar solicitud',
    resetAllFilter: 'Restablecer todos los filtros',
    searchResultsTitle: 'Resultados de búsqueda',
    searchVendorPlaceholder: 'Buscar proveedores...',
    sortPrice: 'Ordenar por precio',
    tryChangeFilter: 'Intente cambiar el filtro o la palabra clave de búsqueda.',
    vendorOffers: 'Ofertas de proveedores',
    vendorOffersAvailable: 'ofertas de proveedores disponibles',
    vendorOffersDesc: 'Proveedores registrados que ofrecen este servicio.',
    allServices: 'Todos los servicios',
    backToServices: 'Volver a los servicios',
    breadcrumbHome: 'Inicio',
    noResults: 'No se encontraron resultados',
    notFoundDesc: 'Nuestro equipo está listo para ayudar. Consulte sus necesidades de envío directamente.',
    notFoundTitle: '¿No encontraste lo que buscas?',
    priceNego: 'Precio negociable',
    vendorBadge: 'Vendor',
    internalBadge: 'Internal',
    bulkFullForwardingTitle: 'Full Forwarding',
    bulkSeaFreightBundleTitle: 'Sea Freight Bundle',
    resetFilter: 'Restablecer filtro',
    serviceType: 'Tipo de servicio',
    sortCheapest: 'Más barato',
    sortDefault: 'Por defecto',
    sortMostExpensive: 'Más caro',
    viewAll: 'Ver todo',
  },
  services: {
    catalogLabel: 'Catálogo de servicios',
    title: 'Nuestros servicios',
    description: 'Descubra nuestros servicios de logística, aduanas y envío internacional diseñados para las necesidades de su negocio.',
    search: 'Buscar servicios o categorías...',
    price: 'Precio',
    negotiable: 'Precio negociable',
    addToCart: 'Pedir ahora',
    inCart: 'Añadir de nuevo',
    noServices: 'No se encontraron servicios',
    noResults: 'Actualmente no hay servicios disponibles.',
    tryOther: 'Pruebe con otra palabra clave.',
    back: 'Volver',
    serviceUnit: 'servicio',
    realtimeUpdated: 'Actualizado',
    realtimeLive: 'En vivo',
    truckingBannerTitle: 'Reserva Flota de Camiones Directamente',
    truckingBannerDesc: 'Elige entre 12 tipos de flota, consulta el costo de envío al instante y agrega servicios según tu necesidad. Fácil y transparente.',
    truckingBannerCta: 'Ver Costo & Reservar',
    folderViewContents: 'Ver Contenidos',
    folderMore: 'más',
    truckingBannerBadge: 'Reserva de Camiones',
    folderCardDesc: 'Servicios de transporte terrestre y alquiler de contenedores para entregas locales e interurbanas.',
    folderViewAll: 'Ver Todos los Servicios',
    sellingPrice: 'Precio de Venta',
    dialogSub: 'Elige el servicio que se adapta a tus necesidades',
  },
  dashboard: {
    welcomeBack: 'Bienvenido de nuevo',
    overview: 'Aquí tiene un resumen de sus actividades logísticas.',
    totalOrders: 'Total de pedidos',
    activeShipments: 'Envíos activos',
    recentOrders: 'Pedidos recientes',
    viewAll: 'Ver todo',
    activities: 'Sus solicitudes logísticas más recientes',
    newOrder: 'Nuevo pedido',
    profileDetails: 'Detalles del perfil',
    company: 'Empresa',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    editProfile: 'Editar perfil',
    notProvided: 'No proporcionado',
    logisticOrdering: 'Pedido logístico',
    bookDescription: 'Reserve servicios de exportación, importación y flete',
    createOrder: 'Crear pedido',
    trackOrder: 'Rastrear pedido',
    noOrders: 'Aún no hay pedidos',
    noOrdersDesc: 'Aún no ha creado ningún pedido.',
    noStatusOrders: 'Sin pedidos',
    noStatusDesc: 'Pruebe otro filtro de estado.',
    showingOrders: 'Mostrando',
    orders: 'pedidos',
    clearFilter: 'Borrar filtro',
    selectIcon: 'Seleccionar icono',
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
    badgeBayar: 'Pagar',
  },
  orders: {
    title: 'Historial de pedidos',
    description: 'Vea y rastree todos sus pedidos y envíos logísticos.',
    search: 'Buscar por número de pedido...',
    orderDetails: 'Detalles del pedido',
    date: 'Fecha',
    status: 'Estado',
    amount: 'Importe',
    allFilter: 'Todos',
    activeFilter: 'Activo',
    noOrders: 'Aún no hay pedidos',
    noOrdersDesc: 'Aún no ha creado ningún pedido.',
    noResults: 'No se encontraron resultados',
    noResultsDesc: 'Pruebe con otra palabra clave.',
    cancelOrder: 'Cancelar pedido',
    cancelConfirmPrefix: 'Cancelar pedido',
    cancelFailed: 'Error al cancelar el pedido. Por favor, inténtelo de nuevo.',
    activeFilterLabel: 'Filtro activo:',
    hapusFilter: 'Borrar filtro',
    type: 'Tipo',
    total: 'Total',
    emptyStateMsg: 'Sus pedidos aparecerán aquí.',
    typeLogistic: 'Logística',
    typeCrm: 'Pedido de Venta',
    typeProduct: 'Producto',
    myOrders: 'Mis Pedidos',
    myOrdersDesc: 'Todos sus pedidos de logística, productos y ventas en un solo lugar.',
  },
  tracking: {
    title: 'Rastrear estado del pedido',
    description: 'Ingrese su número de pedido para ver el estado más reciente',
    placeholder: 'ej. LOG-250429-12345',
    search: 'Buscar',
    searching: 'Buscando...',
    back: 'Atrás',
    notFound: 'Pedido no encontrado',
    notFoundDesc: 'Por favor, verifique su número de pedido nuevamente',
    orderNumber: 'Número de pedido',
    company: 'Empresa',
    pic: 'Responsable',
    shipmentType: 'Tipo de envío',
    ItemCategory: 'Categoría de mercancía',
    origin: 'Origen',
    destination: 'Destino',
    createdAt: 'Fecha de creación',
    subtotal: 'Subtotal',
    total: 'Total estimado',
    services: 'Servicios',
    infoTitle: 'Información',
    infoDesc: 'Nuestro equipo se pondrá en contacto con usted para confirmar y proporcionar el precio final. Para cualquier consulta, comuníquese con nuestro servicio de atención al cliente.',
    newOrder: 'Crear nuevo pedido',
    trackOrder: 'Rastrear pedido',
  },
  notFound: {
    title: '404 Página no encontrada',
    description: 'La página que busca no está disponible.',
  },
  common: {
    loading: 'Cargando...',
    error: 'Se produjo un error',
    retry: 'Reintentar',
    close: 'Cerrar',
    draftBannerPre: 'Tienes',
    draftBannerUnit: 'servicio',
    draftBannerPost: 'pedido(s) pendiente(s).',
    draftBannerResume: 'Retomar pedido',
    cancel: 'Cancelar',
    save: 'Guardar',
    confirm: 'Confirmar',
    back: 'Atrás',
    search: 'Buscar',
  },
  servicesMenu: {
    tagline: 'Servicios logísticos integrados para las necesidades de su empresa',
    viewAll: 'Ver todos los servicios',
    freight: {
      title: 'Transitario de carga',
      desc: 'Transporte aéreo y marítimo internacional hacia y desde cualquier lugar del mundo',
    },
    airFreight: {
      title: 'Reserva de carga aérea',
      desc: 'Reserva aérea directa — calcule el peso tasable y elija la tarifa',
    },
    ocean: {
      title: 'Flete marítimo',
      desc: 'Envío marítimo internacional FCL/LCL',
    },
    customs: {
      title: 'Gestión aduanera / PPJK',
      desc: 'Despacho de aduanas, correduría y documentación de importación/exportación',
    },
    domestic: {
      title: 'Distribución nacional',
      desc: 'Distribución de carga doméstica en todo Indonesia',
    },
    trucking: {
      title: 'Transporte por carretera',
      desc: 'Transporte terrestre profesional, urbano e interurbano',
    },
    tracking: {
      title: 'Seguimiento de envíos',
      desc: 'Rastree el estado de su envío en tiempo real',
    },
    groupForwarding: 'Transitaria',
    groupPpjk: 'Aduanas / Correduría',
    consultant: {
      title: 'Asesor aduanero',
      desc: 'Consultoría y asistencia en procedimientos aduaneros',
      sub1: 'Procedimientos de importación / exportación',
      sub2: 'Permisos de importación / exportación',
      sub3: 'Cálculo de impuestos de importación (aranceles, IVA e impuesto)',
    },
    groupForwardingSubtitle: 'Envío de carga internacional y doméstica',
    groupPpjkSubtitle: 'Despacho aduanero & consultoría en procedimientos de importación/exportación',
    seaFreightCard: {
      title: 'Flete marítimo',
      desc: 'Flete marítimo FCL & LCL internacional',
    },
    airFreightCard: {
      title: 'Flete aéreo',
      desc: 'Carga aérea exprés a todo el mundo',
    },
    domesticCard: {
      title: 'Transporte nacional',
      desc: 'Distribución de carga entre ciudades e islas de Indonesia',
    },
    customsClearanceCard: {
      title: 'Despacho aduanero',
      desc: 'Gestión completa de aduanas de importación y exportación en el puerto',
    },
  },
  homePromo: {
    products: {
      label: 'Productos destacados',
      title: 'Los mejores productos para su empresa',
      desc: 'Descubra productos de calidad diseñados para respaldar sus operaciones logísticas.',
      cta: 'Ver todos los productos',
    },
    services: {
      label: 'Servicios populares',
      title: 'Servicios logísticos de confianza',
      desc: 'Desde el flete marítimo hasta el despacho de aduanas — soluciones completas para sus necesidades de importación y exportación.',
      cta: 'Ver todos los servicios',
      item1Title: 'Transporte de carga',
      item1Desc: 'Transporte aéreo y marítimo internacional a más de 150 países.',
      item2Title: 'Gestión aduanera / PPJK',
      item2Desc: 'Despacho de aduanas, correduría y documentación de importación/exportación.',
      item3Title: 'Transporte por carretera',
      item3Desc: 'Transporte terrestre profesional, urbano e interurbano.',
      item4Title: 'Distribución nacional',
      item4Desc: 'Distribución de carga doméstica en todo Indonesia.',
    },
    promo: {
      label: 'Promociones y ofertas',
      title: 'Ofertas especiales este mes',
      desc: 'Consiga los mejores precios y ofertas exclusivas para sus necesidades logísticas.',
      cta: 'Solicitar cotización',
      item1Title: '15% de descuento en flete marítimo',
      item1Desc: 'Descuento especial en rutas marítimas del Sudeste Asiático.',
      item1Badge: 'Promo',
      item1Valid: 'Válido hasta fin de mes',
      item2Title: 'Consultoría aduanera gratuita',
      item2Desc: 'Asesoría gratuita sobre documentación aduanera para nuevos clientes.',
      item2Badge: 'Especial',
      item2Valid: 'Para nuevos clientes',
      item3Title: 'Paquete combinado con descuento',
      item3Desc: 'Combine flete + aduanas y ahorre hasta un 20%.',
      item3Badge: 'Descuento',
      item3Valid: 'Ahorre hasta un 20%',
    },
    contact: {
      title: 'Contáctenos',
      desc: '¿Necesita ayuda o quiere asesorarse? Nuestro equipo está listo para atender sus necesidades logísticas.',
      name: 'Nombre completo',
      email: 'Dirección de correo electrónico',
      phone: 'Teléfono / WhatsApp',
      message: 'Mensaje',
      namePlaceholder: 'Juan García',
      emailPlaceholder: 'email@empresa.es',
      phonePlaceholder: '+34 91 123 4567',
      messagePlaceholder: 'Cuéntenos sobre sus necesidades logísticas...',
      submit: 'Enviar mensaje',
      whatsapp: 'Chat de WhatsApp',
      call: 'Llamar ahora',
      successMsg: '¡Su mensaje ha sido enviado! Nuestro equipo se pondrá en contacto con usted en breve.',
      info: 'Información de contacto',
      infoDesc: 'Estamos disponibles todos los días laborables',
    },
  },
  calculator: {
    title: 'Calculadora de estimación de costos',
    label: 'Calculadora',
    desc: 'Calcule al instante el costo estimado de su envío',
    disclaimer: 'Esta estimación es indicativa. El precio final será confirmado por el equipo de B2B Marketplace and Logistic.',
    serviceType: 'Tipo de servicio',
    selectService: 'Seleccionar un servicio...',
    origin: 'País de origen',
    destination: 'País de destino',
    originPlaceholder: 'ej. Indonesia',
    destinationPlaceholder: 'ej. España',
    weight: 'Peso (kg)',
    weightPlaceholder: 'ej. 100',
    length: 'Longitud',
    width: 'Ancho',
    height: 'Alto',
    volume: 'Volumen (CBM)',
    cargoType: 'Tipo de mercancía',
    cargoPlaceholder: 'ej. Electrónica, Textiles',
    cargoValue: 'Valor de la mercancía (IDR)',
    valuePlaceholder: 'ej. 50000000',
    incoterms: 'Incoterms',
    selectIncoterms: 'Seleccionar Incoterms...',
    insurance: 'Agregar seguro de carga (+0,5% del valor de la mercancía)',
    express: 'Express / Prioritario (+20% sobre el subtotal)',
    calculate: 'Calcular estimación',
    reset: 'Restablecer',
    result: 'Resultado de la estimación',
    baseCost: 'Costo base',
    weightCost: 'Costo por peso/volumen',
    handlingFee: 'Cargo de manipulación',
    customsFee: 'Tasas aduaneras',
    insuranceFee: 'Prima de seguro',
    expressFee: 'Recargo express',
    total: 'Total estimado',
    chargeableWeight: 'Peso facturable',
    cbm: 'Volumen',
    ctaQuote: 'Solicitar cotización oficial',
    ctaContact: 'Contactar administración',
    ctaSend: 'Enviar detalles del envío',
    projectNote: 'Para carga de proyecto, contacte con nuestro equipo para recibir una cotización personalizada adaptada a los requisitos de su proyecto.',
    services: {
      seaFreight: 'Flete marítimo',
      airFreight: 'Flete aéreo',
      customs: 'Agente de aduanas',
      domestic: 'Nacional',
      warehousing: 'Almacenamiento',
      projectCargo: 'Carga de proyecto',
    },
    validation: {
      selectService: 'Por favor, seleccione primero un tipo de servicio',
      enterWeight: 'Por favor, ingrese el peso de la mercancía',
      enterDimensions: 'Por favor, ingrese las dimensiones de la mercancía',
      enterOrigin: 'Por favor, ingrese el país de origen',
      enterDestination: 'Por favor, ingrese el país de destino',
    },
  },
  accountSecurity: {
    backToDashboard: 'Dashboard',
    title: 'Account Security',
    description: 'Manage saved devices for login without OTP',
    trustedDevices: 'Trusted Devices',
    loading: 'Loading...',
    noDevices: 'No saved devices',
    deviceCount: '{count} saved devices',
    revokeAll: 'Revoke All',
    revoking: 'Revoking...',
    noDevicesStored: 'No devices stored yet.',
    rememberDeviceHint: 'Check "Remember this device" when logging in via WA to save the device.',
    deviceLabel: 'Device #{index}',
    thisDevice: 'This device',
    addedAt: 'Added on {date}',
    expiresToday: 'Expires today',
    expiresInDays: 'Valid for {days} more days',
    revoke: 'Revoke',
    securityInfoTitle: 'Security information',
    securityInfoDesc: 'Trusted devices allow login without OTP for 30 days. If you lose access to a device or notice suspicious activity, revoke all devices immediately.',
    errorLoadFailed: 'Failed to load device list.',
    errorRevokeFailed: 'Failed to revoke device.',
    errorRevokeAllFailed: 'Failed to revoke all devices.',
    errorServerError: 'Failed to contact server.',
    successRevoked: 'Device successfully revoked.',
    successAllRevoked: 'All devices successfully revoked.',
  },
  registerPage: {
    backToLogin: 'Login',
    stepProgress: 'Step {current} of 3',
    title: 'Register via WhatsApp',
    stepPhoneDesc: 'Enter your WhatsApp number',
    stepOtpDesc: 'Verify OTP code',
    stepProfileDesc: 'Completa tu perfil',
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
    vendorBadge: 'Mercado de Proveedores',
    vendorPrefix: 'Vitrina de',
    vendorHighlight: 'Proveedores',
    vendorSuffix: 'Verificados',
    vendorDesc: 'Explore productos de proveedores verificados. Compare especificaciones, verifique disponibilidad y envíe solicitudes de cotización directamente.',
    searchPlaceholder: 'Search products or services...',
    filterAll: 'All Products',
    statusAvailable: 'Available',
    statusLimited: 'Limited',
    statusOutOfStock: 'Out of Stock',
    statusPreOrder: 'Pre-Order',
    noPhoto: 'No photo yet',
    videoBadge: 'Video',
    priceStarts: 'Desde',
    contactUs: 'Contáctenos',
    resetFilter: 'Restablecer todos los filtros',
    serviceCategory: 'Categoría de servicio',
    allServices: 'Todos los servicios',
    filterHint: 'El filtro se activa con más elementos',
    requestQuoteBtn: 'Solicitar cotización / Pedir',
    statsUnavailable: 'Estadísticas no disponibles',
    comparePrices: 'Comparar precios',
    priceHighToLow: 'Precio de venta (mayor a menor)',
    highest: 'Tertinggi',
    medium: 'Menengah',
    lowest: 'Terendah',
    statsCategories: 'Kategori Produk',
    statsVendors: 'Vendor Aktif',
    statsItems: 'Item Tersedia',
    statsB2BPlatform: 'Platform Khusus',
    openFilter: 'Buka filter',
    closeFilter: 'Tutup filter',
    close: 'Tutup',
    priceChartItemCount: '{n} item dengan harga',
    priceChartClickHint: 'klik bar untuk detail item',
    priceChartTitle: 'Perbandingan Harga Vendor',
    priceHighest: 'Tertinggi',
    priceMid: 'Menengah',
    priceLowest: 'Terendah',
    topSupplier: 'Mejor proveedor',
    expiresNow: 'Vence hoy',
    expiresInDays: 'Quedan {n} día(s)',
    registerAsVendor: 'Registrarse como vendedor',
    viewLogistic: 'Ver servicios logísticos',
    areYouVendor: '¿Es usted proveedor?',
    vendorCtaDesc: 'Registre su empresa y comience a vender a compradores B2B hoy.',
    prevPage: '← Anterior',
    nextPage: 'Siguiente →',
    pageOf: 'Página {current} de {total}',
    comingSoon: 'Próximamente',
    comingSoonTitle: 'Mercado B2B — En Desarrollo',
    comingSoonDesc: 'Estamos conectando proveedores seleccionados para traer mercancías de calidad.',
    comingSoonCategories: 'Categorías próximas',
    loadingMobile: 'Cargando...',
    loadingProducts: 'Cargando productos...',
    resetFiltersCount: 'Restablecer ({n})',
    noProductsMatch: 'No se encontraron productos que coincidan.',
    tryChangeFilters: 'Intente cambiar o eliminar filtros para ver más artículos.',
    comingSoonHeader: 'Próximamente',
    comingSoonTitleLine1: 'Mercado de Materias Primas B2B',
    comingSoonTitleLine2: 'En Desarrollo',
    filterLabelStockStatus: 'Estado de stock',
    filterLabelOrigin: 'Origen',
    filterLabelProvince: 'Provincia',
    filterLabelPrice: 'Precio de venta',
    filterBtn: 'Filtrar',
    clearAllFilters: 'Borrar todos los filtros',
    replaceCategoryPhoto: 'Cambiar foto {label}',
    catSub_coffee: 'Arábica & Robusta',
    catSub_coal: 'Térmico & Coquizable',
    catSub_iron_steel: 'HRC, CRC, Palanquilla',
    catSub_palm_oil: 'CPO & PKO',
    catSub_nickel: 'Mineral & Ferroníquel',
    catSub_copper: 'Cátodo & Concentrado',
    catSub_rice: 'Medio & Premium',
    catSub_sugar: 'Crudo & Refinado',
    catSub_seafood: 'Fresco & Congelado',
    catSub_rubber: 'SIR & RSS',
    catSub_live_fish: 'Mero & Pargo',
    catSub_bird_nest: 'Grado A & Super',
    catSub_frozen_food: 'Procesado & Fresco',
    catSub_furniture: 'Teca & Caoba',
    catSub_chemical: 'Industrial & Lab',
    catSub_textile: 'Hilo & Tela',
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
    fieldServiceType: 'Tipo de Servicio',
    fieldRoute: 'Ruta',
    fieldCapacity: 'Capacidad',
    fieldTransitTime: 'Tiempo de Tránsito',
    fieldMaxLoad: 'Carga Máx.',
    fieldVesselType: 'Modo de Transporte',
    fieldCommodity: 'Mercancía',
    fieldGrade: 'Grado / Calidad',
    fieldOrigin: 'Origen',
    fieldSize: 'Tamaño',
    fieldMoisture: 'Contenido de Humedad',
    fieldCalorie: 'Valor Calorífico',
    fieldAsh: 'Contenido de Ceniza',
    fieldPackaging: 'Embalaje',
    fieldCertification: 'Certificación',
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
    headerTitle: 'Completa tu perfil',
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
    successDesc: 'Tu perfil ha sido guardado. ¡Bienvenido!',
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
    pageSeoTitle: 'Calculadora de aranceles de importación — BM, PPN & PPh Art. 22 | B2B Logística',
    freightLabel: 'Costo de flete (IDR)',
    freightPlaceholder: 'ej. 5.000.000',
    insuranceLabel: 'Seguro (%)',
    importerTypeLabel: 'Tipo de importador (Art. 22 impuesto)',
    ftaRateLabel: 'Tasa preferencial (FTA) — opcional',
    calcSpinner: 'Calculando…',
    lartasNotes: 'Notas:',
    lartasRegulator: 'Regulador:',
    lartasPermits: 'Permisos requeridos:',
    hsSectionTitle: 'HS Code — BTKI 2022',
    exportCsv: 'Exportar CSV',
    exportJson: 'Exportar JSON',
    inputGoodsValueLabel: 'Valor de la mercancía',
    inputRateUsedLabel: 'Tasa utilizada',
    inputDutyScheme: 'Esquema arancelario',
    inputNdpbm: 'NDPBM (Valor CIF en IDR)',
    ndpbmLabel: 'Valor mercancía (NDPBM/CIF)',
    taxDetailTitle: 'Desglose de impuestos y aranceles',
    tableColComponent: 'Componente',
    tableColRate: 'Tasa',
    tableColAmount: 'Monto (IDR)',
    ftaRateResult: 'Tasa preferencial FTA',
    importHelpTitle: '¿Necesita ayuda con el procesamiento de importación?',
    cooCertNote: '✓ Requiere Certificado de Origen (COO/Formulario) del exportador',
    multiSharedSettings: 'Configuración compartida',
    lartasWarningText: 'Se requiere permiso especial de importación. Contacte a nuestro equipo PPJK.',
    prefHideBtn: 'Ocultar',
    prefShowAllBtn: 'Mostrar todo',
    ftaCooNote: 'Con un Certificado de Origen (COO) válido, las tasas arancelarias pueden ser más bajas:',
    prefMoreItems: '+{n} más',
    importHelpDesc: 'Nuestro equipo PPJK está listo para ayudar con despacho aduanero, gestión de documentos y cálculo preciso de costos de importación.',
    importHelpCtaPabean: 'Consulta Aduanera',
    importerTypeLabelShort: 'Tipo de Importador',
    ftaSchemeLabelShort: 'Esquema FTA',
    multiFreightLabel: 'Flete Compartido (IDR)',
    multiHsListTitle: 'Lista de Códigos SA',
    multiAddHsText: 'Agregar Código SA',
    multiTableTitle: 'Tabla Comparativa de Impuestos de Importación',
    multiColHs: 'Código SA / Etiqueta',
    multiColValue: 'Valor ({currency})',
    multiColTotal: 'Total',
  },
  pabean: {
    headerTitle: 'Gestión Aduanera / PPJK',
    headerSubtitle: 'Servicios Aduaneros',
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
    submitting: 'Enviando...',
    submitBtn: 'Enviar solicitud PPJK',
    successMsg: '¡Solicitud PPJK enviada con éxito! Nuestro equipo se pondrá en contacto pronto.',
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
    svc1Title: 'Consultoría Regulación Import',
    svc1Desc: 'In-depth consultation on customs regulations and requirements for import activities',
    svc2Title: 'Consultoría Regulación Export',
    svc2Desc: 'In-depth consultation on customs regulations and requirements for export activities',
    svc3Title: 'Consultoría Licencias Import/Export',
    svc3Desc: 'Consultation on licensing processes, NIB, API, and legal documents for import/export activities',
    svc4Title: 'Consultoría Fiscal Import',
    svc4Desc: 'Consultation on import VAT, income tax Article 22, import duties, and tax obligations related to importation',
    svc1ConsultPlaceholder: 'Briefly describe the import regulation issue or question you want to consult about...',
    svc2ConsultPlaceholder: 'Briefly describe the export regulation issue or question you want to consult about...',
    svc3ConsultPlaceholder: 'E.g., API-U licensing process, NIB for import, or export permit requirements for specific products...',
    svc4ConsultPlaceholder: 'E.g., import VAT calculation, income tax Article 22 rates, HS Code and import duties, or KITE/KAHA fiscal facilities...',
    dropHint: 'Haga clic o suelte el archivo aquí',
    dropHere: 'Soltar para subir',
    uploadSuccess: 'Subida exitosa ✓',
    uploadFailed: 'Error al subir',
    serverResponseInvalid: 'Invalid server response',
    connectionFailed: 'Connection failed during upload',
    missingService: 'Service type',
    uploadingProgress: 'Uploading...',
    fileFormatError: 'Unsupported format (.{ext}). Use PDF, JPG, PNG, DOC, or DOCX.',
    fileSizeError: 'File too large ({size} MB). Max 10 MB.',
    pageTitle: 'Gestión de aduanas / PPJK',
    sectionTitle: 'Servicios de aduanas',
    consultTitle: 'Seleccionar tipo de consulta PPJK',
    uploadDocTitle: 'Subir documentos de soporte (opcional)',
    submittingBtn: 'Enviando...',
    costTbd: 'Se confirmará dentro de 1×24 horas laborales',
    toastSuccess: '¡Solicitud enviada! Nuestro equipo se pondrá en contacto con usted lo antes posible.',
    toastError: 'Error al enviar la solicitud',
    dataFromProfile: 'Los datos provienen de su perfil de cuenta.',
    notesPlaceholder: 'Otra información (opcional)',
    namePic: 'Nombre del contacto',
    companyName: 'Nombre de la empresa',
    email: 'Correo electrónico',
    phone: 'Teléfono / WhatsApp',
    serviceSummary: 'Servicios seleccionados',
    emailLabel: 'Correo electrónico',
    phoneLabel: 'Teléfono / WhatsApp',
    uploadLogoTitle: 'Subir Logo',
    removeLogoTitle: 'Eliminar Logo',
    hoverUploadHint: 'Sostener el ícono → Subir Logo',
  },
  customClearance: {
    headerTitle: 'Proceso de Despacho Aduanero',
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
    svc1Title: 'Preparación Documentos PIB/PEB',
    svc1Desc: 'Complete processing and preparation of Customs Import Declaration (PIB) or Customs Export Declaration (PEB) documents',
    svc1Badge: '1–2 días laborables',
    svc2Title: 'Gestión de Despacho',
    svc2Desc: 'Physical handling of customs process at the port: inspection coordination, import duty & tax payment, through to goods release from customs area',
    svc2Badge: '1–3 días laborables',
    svc3Title: 'Import/Export Undername',
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
    pageTitle: 'Proceso de despacho aduanero',
    pageSubtitle: 'Gestión aduanera oficial — Certificación PPJK',
    submittingBtn: 'Enviando...',
    costTbd: 'Se confirmará dentro de 1×24 horas laborales',
    toastSuccess: '¡La solicitud de despacho aduanero ha sido enviada! Nuestro equipo se pondrá en contacto con usted lo antes posible.',
    toastError: 'Error al enviar la solicitud',
    dataFromProfile: 'Los datos provienen de su perfil de cuenta.',
    notesPlaceholder: 'Otra información (opcional)',
    namePic: 'Nombre del contacto',
    companyName: 'Nombre de la empresa',
    email: 'Correo electrónico',
    phone: 'Teléfono / WhatsApp',
    emailLabel: 'Correo electrónico',
    phoneLabel: 'Teléfono / WhatsApp',
    labelExchangeRate: 'Tasa de cambio {currency} → IDR',
    labelValue: 'Valor',
    valueCifLabel: 'Valor {type} (equivalente en IDR)',
    handlingLaneLabel: 'Despacho aduanero — Carril',
    undernamCountryLabel: 'Importación por代理 — País',
    phGoods1: 'Por ejemplo: maquinaria, ropa, productos electrónicos...',
    phHsCode: 'Ej: 8477.80.00',
    phValueNumber: 'Ej: 15000',
    phExchangeRate: 'Ej: 15900',
    phWeight: 'Ej: 500',
    phCountry1: 'Por ejemplo: China, Estados Unidos, Japón...',
    phSpecialNotesPib: 'Por ejemplo: se necesita un permiso de importación especial, tasa impositiva preferencial, productos sensibles, etc.',
    phGoods2: 'Por ejemplo: piezas, textiles, productos químicos...',
    phPibPebDocNum: 'Número de documento PIB/PEB',
    phSpecialNotesHc: 'Por ejemplo: los productos tienen restricciones especiales, se necesita coordinación de almacén...',
    phGoods3: 'Por ejemplo: maquinaria, materias primas, bienes de consumo...',
    phValueNumber2: 'Ej: 20000',
    phWeight2: 'Ej: 1000',
    phCountry2: 'Por ejemplo: China, Alemania, Estados Unidos...',
    phSpecialNotesUn: 'Por ejemplo: la empresa aún no ha obtenido la licencia API, el registro NIB está en proceso.',
  },
  importCalculator: {
    title: 'Calculadora de Aranceles de Importación',
    subtitle: 'Calculate Import Duty (BM), Import VAT, and Income Tax Art. 22 based on BTKI 2022. Multi-currency, live JISDOR BI rates, FTA rates, auto-calculation.',
    breadcrumbHome: 'Inicio',
    tabSingle: 'Cálculo único',
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
    resultTitle: 'Resultados del cálculo',
    resultNdpbm: 'NDPBM (CIF IDR)',
    resultBM: 'Arancel de importación',
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
    exportCSV: 'Exportar CSV',
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
    hcArahImpor: 'Importación',
    hcArahEkspor: 'Exportación',
    jasaHandlingLabel: 'Servicio de gestión aduanera',
    hcLaneLabel: 'Canal',
    hcFeeNote: '* No incluye aranceles e impuestos de importación. Precio final confirmado por nuestro equipo.',
    docPibPeb: 'Documento PIB / PEB',
    docAwbBl: 'AWB / Conocimiento de embarque',
    docCommercialInvoice: 'Factura comercial',
    docPackingList: 'Lista de empaque',
    docCoo: 'COO / Certificado de origen',
    docLsLartas: 'LS / Permiso de importación',
    docInvoicePackingList: 'Factura y lista de empaque',
    docLsJikaAda: 'LS / Permiso de importación (si aplica)',
    docNpwp: 'ID fiscal de la empresa (NPWP)',
    docNib: 'NIB / Escritura de constitución',
    docLainnya: 'Otros documentos',
    contactCtaDesc: 'Need help with customs clearance, PIB/PEB, or import undername?',
  },
  mktCard: {
    statusOnOrder: 'Disponible bajo consulta',
    expiresExpired: 'Expires today',
    expiresInDays: '{days}d left',
    priceOnRequest: 'Precio a consultar',
    requestQuotation: 'Request Quotation',
    shareProduct: 'Share product',
    removeFromCompare: 'Remove from comparison',
    maxCompareItems: 'Max 4 items',
    compare: 'Compare',
    sellPrice: 'Precio de venta',
    description: 'Descripción',
    specifications: 'Especificaciones',
    originLabel: 'Origin',
    locationLabel: 'Location',
    leadTimeLabel: 'Lead Time',
    moqNego: 'MOQ: Negotiable',
    moqOnRequest: 'Upon Request',
    topSupplier: 'Top Supplier',
    filterAllOption: 'Todos',
    noPhotoYet: 'Sin foto aún',
    moqLabel: 'MOQ:',
    priceOnRequestDialog: 'Precio a consultar',
    customClearance: {
      headerTitle: 'Proceso de Despacho Aduanero',
      headerSubtitle: 'Despacho Aduanero Oficial — PPJK Certificado',
      infoBannerTitle: 'Servicios Aduaneros Completos por PPJK Oficial',
      infoBannerDesc: 'Nos encargamos de todo el proceso aduanero: preparación de documentos PIB/PEB, manejo físico en el puerto y servicios bajo nombre para empresas sin licencias de importación/exportación.',
      step1Title: 'Seleccionar Tipo de Servicio',
      step1Subtitle: 'Seleccione uno o más servicios que necesita',
      step2Title: 'Detalles del Servicio Seleccionado',
      step3Title: 'Información del Solicitante / PIC',
      step4Title: 'Resumen y Enviar Solicitud',
      selectedLabel: 'Seleccionado:',
      activityType: 'Tipo de Actividad',
      importActivity: 'Importación (PIB)',
      exportActivity: 'Exportación (PEB)',
      clearanceImport: 'Despacho de Importación',
      clearanceExport: 'Despacho de Exportación',
      underNameImport: 'Importación Bajo Nombre',
      underNameExport: 'Exportación Bajo Nombre',
      goodsType: 'Tipo / Nombre de Mercancías',
      hsCode: 'Código HS (si se conoce)',
      cifValue: 'Valor CIF',
      fobValue: 'Valor FOB',
      exchangeRate: 'Tasa {currency} → IDR',
      importDutyRate: 'Tasa de Derecho de Importación (%)',
      goodsWeight: 'Peso de Mercancías (kg)',
      destinationPort: 'Puerto de Destino',
      loadingPort: 'Puerto de Carga',
      originCountry: 'País de Origen',
      destinationCountry: 'País de Destino',
      pibPebDocNum: 'Número PIB / PEB (si está disponible)',
      customsLane: 'Carril Aduanero',
      portAirport: 'Puerto / Aeropuerto',
      specialInstructions: 'Notas / Instrucciones Especiales',
      underNameType: 'Tipo de Bajo Nombre',
      underNameReason: 'Razón para Usar Bajo Nombre',
      estimatedCost: 'Costo Estimado',
      estimatedLabel: 'Estimación Total',
      indicativeNote: '*indicativo',
      confirmedWithinHours: 'Confirmado dentro de 1 día hábil',
      costNote: 'Las tarifas de servicio son indicativas y serán confirmadas por nuestro equipo de PPJK después de la verificación de documentos y tipo de mercancías. Nuestro equipo se pondrá en contacto con usted dentro de 1 día hábil.',
      submitting: 'Enviando solicitud...',
      submitBtn: 'Enviar Solicitud de Despacho Aduanero',
      successMsg: '¡Solicitud de Despacho Aduanero enviada con éxito! Nuestro equipo se pondrá en contacto con usted lo antes posible.',
      errorMsg: 'Falló al enviar la solicitud',
      profileAutoFilled: 'Datos recuperados de su perfil de cuenta.',
      loginToUpload: 'Por favor inicie sesión para subir documentos',
      uploadDocs: 'Subir Documentos de Soporte',
      uploadDocsCompany: 'Documentos de Su Empresa',
      calculating: 'Calculando estimación...',
      enterValueToCalc: 'Ingrese el valor {type} arriba para ver la estimación de derecho de importación.',
      enterValueToCalcUndername: 'Ingrese el valor {type} para ver la estimación automática de costos',
      beaMasuk: 'Derecho de Importación',
      ppnImpor: 'IVA de Importación',
      pphPasal22Api: 'Impuesto sobre la Renta Art. 22 (con API)',
      pphPasal22NonApi: 'Impuesto sobre la Renta Art. 22 (sin API)',
      subTotalPajak: 'Subtotal de Impuestos y Derechos',
      serviceDocFee: 'Tarifa de Servicio de Documentos PIB/PEB',
      serviceUndernameFee: 'Tarifa de Servicio Bajo Nombre {direction}',
      freeRate: '0% — Libre de Derechos (ASEAN / FTA)',
      laneUnknown: 'Desconocido',
      laneGreen: 'Carril Verde — sin inspección física',
      laneRed: 'Carril Rojo — con inspección física',
      handlingServiceDesc: 'Este servicio incluye: coordinación con autoridades aduaneras, pago de derechos e impuestos de importación, coordinación de inspección física (carril rojo) y liberación de mercancías a su almacén.',
      pibPebProcessNote: 'Nuestro equipo de PPJK procesará la preparación de documentos PIB/PEB después de recibir todos los datos y documentos. Las tarifas de servicio se confirmarán dentro de 1 día hábil.',
      underNameServiceNote: 'Las tarifas de servicio bajo nombre incluyen: uso de API/NIK, procesamiento de documentos y manejo aduanero. Serán confirmadas por nuestro equipo según el tipo de mercancías y el valor de la transacción.',
      underNameInfoDesc: 'Proporcionamos facilidades de importación/exportación utilizando el API / NIK oficial de nuestra empresa. Ideal para empresas sin su propia licencia de importador/exportador.',
      picName: 'Nombre del PIC',
      companyNameLabel: 'Nombre de la Empresa',
      additionalNotes: 'Notas Adicionales',
      additionalNotesPlaceholder: 'Información adicional para nuestro equipo (opcional)',
      fullNamePlaceholder: 'Nombre completo',
      emailPlaceholder: 'email@empresa.com',
      phonePlaceholder: '+62 8xx xxxx xxxx',
      companyPlaceholder: 'Nombre de la Empresa',
      svc1Title: 'Preparación de Documentos PIB / PEB',
      svc1Desc: 'Procesamiento y preparación completos de la Declaración de Importación Aduanera (PIB) o Declaración de Exportación Aduanera (PEB)',
      svc1Badge: '1–2 días hábiles',
      svc2Title: 'Manejo Aduanero',
      svc2Desc: 'Manejo físico del proceso aduanero en el puerto: coordinación de inspección, pago de derechos e impuestos de importación, hasta la liberación de mercancías del área aduanera',
      svc2Badge: '1–3 días hábiles',
      svc3Title: 'Importación / Exportación Bajo Nombre',
      svc3Desc: 'Servicios de importación o exportación utilizando el nombre y la licencia de nuestra empresa (API/NIK) — solución para empresas sin su propia licencia de importador/exportador',
      svc3Badge: 'Según sea necesario',
      dropHint: 'Haga clic o arrastre archivos aquí',
      dropHere: 'Suelte para subir',
      uploadSuccess: 'Subida exitosa ✓',
      uploadFailed: 'Falló la subida',
      serverResponseInvalid: 'Respuesta del servidor no válida',
      connectionFailed: 'Falló la conexión durante la subida',
      missingService: 'Tipo de servicio',
      serviceSelected: 'Servicios seleccionados',
      goodsInfo: 'PIB/PEB — Mercancías',
      fileFormatError: 'Formato no soportado (.{ext}). Use PDF, JPG, PNG, DOC o DOCX.',
      fileSizeError: 'Archivo demasiado grande ({size} MB). Máx 10 MB.',
    },
    importCalculator: {
      title: 'Calculadora de Derechos de Importación',
      subtitle: 'Calcule el Derecho de Importación (BM), el IVA de Importación y el Impuesto sobre la Renta Art. 22 basado en BTKI 2022. Multimoneda, tasas JISDOR BI en vivo, tasas de FTA, cálculo automático.',
      breadcrumbHome: 'Inicio',
      tabSingle: 'Cálculo Único',
      tabMulti: 'Comparación de Múltiples Códigos HS',
      badgeNew: 'Nuevo',
      searchHsCode: 'Buscar Código HS',
      hsPlaceholder: 'Escriba el Código HS o el nombre del producto…',
      hsNotFound: 'No encontrado. Intente con otra palabra clave.',
      goodsValueSection: 'Valor de la Mercancía y Moneda',
      currencyLabel: 'Moneda',
      goodsValueLabel: 'Valor de la Mercancía (en {currency})',
      convertToIdr: 'Convertir a IDR',
      rateUsed: 'Tasa utilizada',
      incotermSection: 'Incoterm',
      incotermOptional: '(opcional, CIF por defecto)',
      freightLabel: 'Costo de Flete (IDR)',
      insuranceLabel: 'Seguro (%)',
      taxOptionsSection: 'Opciones de Impuestos y Preferenciales',
      apiImporterLabel: 'Importador Registrado (API)',
      apiImporterHint: 'Verifique si su empresa tiene un API. Afecta la tasa del impuesto sobre la renta del Artículo 22.',
      preferentialLabel: 'Esquema Preferencial de FTA',
      preferentialDesc: 'Tasa de derecho de importación bajo el acuerdo de libre comercio',
      availablePreferential: 'Tasas Preferenciales Disponibles',
      noPreferential: 'No hay tasas preferenciales para este FTA',
      resultTitle: 'Resultados del Cálculo',
      resultNdpbm: 'NDPBM (CIF IDR)',
      resultBM: 'Derecho de Importación',
      resultPPN: 'IVA de Importación',
      resultPPnBM: 'Impuesto sobre Bienes de Lujo',
      resultPPh: 'Impuesto sobre la Renta Artículo 22',
      resultTotal: 'Total Recaudado',
      resultDDP: 'Total DDP (Est.)',
      resultEffective: 'Tasa Efectiva',
      lartasTitle: 'LARTAS — Bienes Restringidos/Prohibidos',
      lartasWarning: 'Este artículo está sujeto a restricciones de importación.',
      noLartas: '✓ Libre de LARTAS',
      btkiLink: 'Detalles de BTKI',
      inswLink: 'Verificar INSW',
      exportCSV: 'Exportar CSV',
      exportJSON: 'Exportar JSON',
      loadingRates: 'Obteniendo las últimas tasas…',
      rateJisdor: 'JISDOR BI — En Vivo',
      rateLive: 'Tasa en Vivo',
      rateEstimate: 'Tasa Estimada',
      updatedAt: 'Actualizado',
      emptyResult: 'Seleccione un código HS e ingrese el valor de la mercancía para ver el resultado del cálculo automático',
      multiAddItem: 'Agregar Código HS',
      multiCalculate: 'Calcular Todo',
      multiCalculating: 'Calculando...',
      multiRemove: 'Eliminar',
      multiLabel: 'Etiqueta',
      multiGoodsValue: 'Valor de la Mercancía',
      multiError: 'Error',
      multiResultTitle: 'Resultados de Comparación',
      multiExportCSV: 'Exportar Múltiples CSV',
      incotermFreightNote: 'Se requiere entrada de flete separada',
      incotermInsuranceNote: 'Se requiere entrada de seguro separada',
      incotermFullNote: 'Se requiere entrada completa de flete',
      incotermCifNote: 'El valor ya incluye flete y seguro',
      contactCta: 'Consulta y Pedido',
      contactCtaDesc: '¿Necesita ayuda con el despacho de aduanas, PIB/PEB o importación a nombre?',
    },
    mktCard: {
      statusOnOrder: 'Precio a consultar',
      expiresExpired: 'Vence hoy',
      expiresInDays: '{days}d restantes',
      priceOnRequest: 'Precio a consultar',
      requestQuotation: 'Solicitar cotización',
      shareProduct: 'Compartir producto',
      removeFromCompare: 'Eliminar de la comparación',
      maxCompareItems: 'Máx 4 artículos',
      compare: 'Comparar',
      sellPrice: 'Precio de venta',
      description: 'Descripción',
      specifications: 'Especificaciones',
      originLabel: 'Origen',
      locationLabel: 'Ubicación',
      leadTimeLabel: 'Tiempo de entrega',
      moqNego: 'MOQ: Negociable',
      moqOnRequest: 'A solicitud',
      topSupplier: 'Proveedor destacado',
      filterAllOption: 'Todos',
      noPhotoYet: 'Sin fotos aún',
      moqLabel: 'MOQ:',
      priceOnRequestDialog: 'Precio a consultar',
    },
    pabean: {
      headerTitle: 'Gestión de aduanas / PPJK',
      headerSubtitle: 'Servicios de aduanas',
      step1Title: 'Seleccionar servicio de consulta PPJK',
      step1Subtitle: 'Seleccione uno o más servicios requeridos',
      step2Title: 'Detalles del servicio seleccionado',
      step3Title: 'Información del solicitante',
      step4Title: 'Resumen y envío',
      selectedLabel: 'Seleccionado:',
      serviceLabel: 'Servicio',
      estimatedCost: 'Costo estimado',
      confirmedAfterDoc: 'Confirmación tras revisión de documentos',
      costNote: 'Las estimaciones de costos son indicativas. Los costos finales serán confirmados por nuestro equipo de PPJK tras la verificación de documentos. Nuestro equipo se pondrá en contacto con usted dentro de 1 día hábil.',
      submitting: 'Enviando...',
      submitBtn: 'Enviar solicitud PPJK',
      successMsg: '¡Solicitud PPJK enviada con éxito! Nuestro equipo se pondrá en contacto con usted lo antes posible.',
      errorMsg: 'Fallo en el envío de la solicitud',
      profileAutoFilled: 'Datos recuperados de su perfil de cuenta. Solo se puede cambiar el número de teléfono.',
      loginToUpload: 'Por favor inicie sesión para subir documentos',
      uploadOptional: 'Subir documentos relevantes (opcional)',
      consultDetail: 'Tema de consulta *',
      consultConfirm: 'Las tarifas de consulta serán confirmadas por nuestro equipo de PPJK. Se pondrán en contacto con usted poco después de la presentación.',
      perijinanConsultDetail: 'Tipo de permiso / tema de consulta *',
      picName: 'Nombre del contacto',
      companyNameLabel: 'Nombre de la empresa',
      additionalNotes: 'Notas adicionales',
      additionalNotesPlaceholder: 'Información adicional para nuestro equipo (opcional)',
      fullNamePlaceholder: 'Nombre completo',
      emailPlaceholder: 'email@empresa.com',
      phonePlaceholder: '+62 8xx xxxx xxxx',
      companyPlaceholder: 'Nombre de la empresa',
      svc1Title: 'Consulta sobre regulaciones de importación',
      svc1Desc: 'Consulta en profundidad sobre regulaciones y requisitos aduaneros para actividades de importación',
      svc2Title: 'Consulta sobre regulaciones de exportación',
      svc2Desc: 'Consulta en profundidad sobre regulaciones y requisitos aduaneros para actividades de exportación',
      svc3Title: 'Consulta sobre licencias de importación y exportación',
      svc3Desc: 'Consulta sobre procesos de licenciamiento, NIB, API y documentos legales para actividades de importación/exportación',
      svc4Title: 'Consulta sobre impuestos de importación',
      svc4Desc: 'Consulta sobre IVA de importación, impuesto sobre la renta Artículo 22, aranceles de importación y obligaciones fiscales relacionadas con la importación',
      svc1ConsultPlaceholder: 'Describa brevemente el problema o pregunta sobre la regulación de importación que desea consultar...',
      svc2ConsultPlaceholder: 'Describa brevemente el problema o pregunta sobre la regulación de exportación que desea consultar...',
      svc3ConsultPlaceholder: 'Ej., proceso de licenciamiento API-U, NIB para importación, o requisitos de permisos de exportación para productos específicos...',
      svc4ConsultPlaceholder: 'Ej., cálculo de IVA de importación, tasas de impuesto sobre la renta Artículo 22, código HS y aranceles de importación, o facilidades fiscales KITE/KAHA...',
      dropHint: 'Haga clic o arrastre el archivo aquí',
      dropHere: 'Suelte para subir',
      uploadSuccess: 'Subida exitosa ✓',
      uploadFailed: 'Fallo en la subida',
      serverResponseInvalid: 'Respuesta del servidor no válida',
      connectionFailed: 'Fallo de conexión durante la subida',
      missingService: 'Tipo de servicio',
      uploadingProgress: 'Subiendo...',
      fileFormatError: 'Formato no soportado (.{ext}). Use PDF, JPG, PNG, DOC o DOCX.',
      fileSizeError: 'Archivo demasiado grande ({size} MB). Máx 10 MB.',
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
    cargoCatGeneral: 'General',
    cargoCatFragile: 'Frágil',
    cargoCatDG: 'Mercancías Peligrosas (DG)',
    cargoCatSpecial: 'Manipulación Especial Requerida',
    statusLabel: 'Update Status',
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
    statusLabel: 'Status',
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
    errorSelectVendor: 'Por favor, seleccione al menos un proveedor.',
    errorSelectVendorFirst: 'Por favor, seleccione primero un proveedor.',
    errorFillPrice: 'El precio de venta al cliente es obligatorio.',
    successOrderConfirmed: 'Pedido confirmado. WhatsApp enviado automáticamente al cliente.',
    fulfillmentNote: 'Siguiente paso: abra el enlace de Confirmación de Cumplimiento enviado por WhatsApp al administrador.',
    basePrice: 'Precio base',
    routeLabel: 'Ruta',
    noWa: 'Sin WhatsApp',
  },
  airFreight: {
    back: 'Volver',
    backToHome: 'Volver al inicio',
    navTitle: 'Carga aérea',
    navBrand: 'CST Logistics',
    heroTitle: 'Reserva de carga aérea',
    heroHint: 'Complete los detalles de la carga y la ruta de vuelo',
    sectionRoute: 'Ruta de vuelo',
    originCity: 'Ciudad de origen',
    originAirport: 'Código del aeropuerto de origen',
    destCity: 'Ciudad de destino',
    destAirport: 'Código del aeropuerto de destino',
    cargoTypeLabel: 'Tipo de carga',
    sectionCargo: 'Detalles de la carga',
    commodityLabel: 'Mercancía',
    commodityPlaceholder: 'p.ej. Electrónica, Textiles, Alimentos...',
    dimensionLabel: 'Dimensiones y peso (por bulto)',
    addKoli: 'Agregar bulto',
    calcEstimate: 'Calcular estimación',
    sectionRate: 'Opciones de tarifa',
    noRateMsg: 'No hay tarifas disponibles para esta ruta. Nuestro equipo se pondrá en contacto con la mejor oferta.',
    routeDirect: 'Directo',
    routeTransit: 'Tránsito',
    dayUnit: 'días',
    estimateTotal: 'Total estimado',
    rateSelected: 'Tarifa seleccionada',
    sectionSchedule: 'Horario',
    pickupDate: 'Fecha de recogida',
    flightDate: 'Fecha de vuelo preferida',
    arrivalDate: 'Fecha de llegada objetivo',
    sectionAddons: 'Servicios adicionales',
    addonsSelected: '{count} servicio(s) seleccionado(s)',
    sectionContact: 'Datos de contacto',
    fullName: 'Nombre completo',
    companyName: 'Nombre de la empresa',
    whatsapp: 'WhatsApp',
    notes: 'Notas',
    notesPh: 'Información adicional para nuestro equipo...',
    summaryTitle: 'Resumen de reserva',
    summaryRoute: 'Ruta',
    summaryService: 'Servicio',
    summaryIncoterm: 'Incoterm',
    summaryChargeable: 'Peso facturable',
    summaryRate: 'Aerolínea',
    summaryEstimate: 'Precio estimado',
    summaryAddons: 'Servicios adicionales',
    serviceUnit: 'servicio(s)',
    selectRateHint: 'Seleccione una tarifa arriba para ver la estimación del precio final.',
    requestQuote: 'Enviar solicitud',
    requestHint: 'Nuestro equipo se pondrá en contacto en 24 horas para confirmación y precio final.',
    successTitle: '¡Solicitud enviada!',
    successDesc: 'Nuestro equipo se pondrá en contacto para confirmar los detalles del envío.',
    orderNoLabel: 'Número de pedido',
    trackOrder: 'Rastrear pedido',
    validationAirport: 'Los códigos de aeropuerto de origen y destino son obligatorios',
    validationWeight: 'Por favor ingrese el peso de la carga primero',
    validationNoRate: 'No hay tarifas disponibles, pero puede enviar la solicitud',
    validationEstimateFail: 'Error al obtener la estimación de tarifa',
    validationName: 'El nombre completo es obligatorio',
    validationPhone: 'El número de WhatsApp es obligatorio',
    validationCommodity: 'La mercancía es obligatoria',
    validationWeightFill: 'Por favor ingrese el peso de la carga antes de enviar',
    validationSuccess: '¡Solicitud de carga aérea enviada con éxito!',
    validationSubmitFail: 'Error al enviar la solicitud de carga aérea',
  },

  airFreightTrack: {
    pageTitle: 'Rastrear envío aéreo',
    awbNumber: 'N.º AWB',
    flightInfo: 'Información del vuelo',
    origin: 'Origen',
    destination: 'Destino',
    status: 'Estado',
    noTracking: 'No se encontraron datos de seguimiento',
    trackBtn: 'Rastrear',
    searchPlaceholder: 'Ingrese el N.º AWB...',
  },
  approvePage: {
    pageTitle: 'Aprobación de cotización',
    vendorSelected: 'Proveedor seleccionado',
    vendorPrice: 'Precio del proveedor',
    markup: 'Margen',
    approve: 'Aprobar',
    revision: 'Revisar',
    reject: 'Rechazar',
    provideResponse: 'Proporcione su respuesta:',
    statusUpdated: 'Estado de entrega actualizado',
    updating: 'Actualizando...',
    deliveryTimeline: 'Cronograma de entrega',
  },
  confirmPage: {
    pageTitle: 'Confirmación de pedido',
    customerName: 'Nombre del cliente',
    shipmentType: 'Tipo de envío',
    unitType: 'Tipo de unidad',
    notes: 'Notas',
    confirmBtn: 'Confirmar',
    cancelBtn: 'Cancelar',
    successMsg: 'Nuestro sistema creará automáticamente un pedido de venta. Nuestro equipo se pondrá en contacto con usted en breve.',
    errorMsg: 'Se produjo un error',
  },
  freightForwarding: {
    directionTitle: 'Seleccionar dirección de envío',
    directionSubtitle: 'Especifique el tipo de envío que necesita',
    modeTitle: 'Seleccionar modo de transporte',
    modeSubtitle: 'Elija el modo de transporte más adecuado',
    variantTitle: 'Seleccionar tipo de servicio',
    variantSubtitle: 'Especifique la ruta de envío desde el origen hasta el destino',
    formTitle: 'Detalles de envío y documentos',
    formSubtitle: 'Complete los detalles de envío y cargue los documentos requeridos',
    senderData: 'Información del remitente',
    senderName: 'Nombre del remitente',
    senderAddress: 'Dirección completa del remitente',
    receiverData: 'Información del destinatario',
    receiverName: 'Nombre del destinatario',
    receiverAddress: 'Dirección completa del destinatario',
    goodsData: 'Información de la mercancía',
    commodityName: 'Nombre de la mercancía / producto',
    goodsCategory: 'Categoría de mercancía',
    dgWarning: 'Las mercancías peligrosas deben incluir documentos MSDS/SDS y COA.',
    cargoDetail: 'Detalles de artículos de carga',
    grossWeight: 'Peso bruto (kg)',
    kolliCount: 'Número de bultos',
    dimensions: 'Dimensiones (cm)',
    totalVolume: 'Volumen total',
    totalGrossWeight: 'Peso bruto total',
    estimationTitle: 'Estimación total',
    backToServices: 'Volver a servicios',
    back: 'Atrás',
    addItem: 'Agregar artículo',
    uploadInvoice: 'Documento de factura',
    uploadPackingList: 'Lista de empaque',
    uploadMsds: 'Documento MSDS/SDS',
    uploadCoa: 'Documento COA',
    contactInfo: 'Información de contacto (Responsable)',
    contactName: 'Nombre completo del responsable',
    contactPhone: 'WhatsApp / Teléfono',
    contactEmail: 'Email del responsable',
    submitOrder: 'Enviar pedido',
    orderSuccess: '¡Pedido creado exitosamente!',
    export: 'Exportación',
    import: 'Importación',
    domestic: 'Nacional',
    air: 'Aéreo',
    sea: 'Marítimo',
    road: 'Terrestre',
    selectDirection: 'Por favor, seleccione primero una dirección de envío',
    errorRequired: 'Datos incompletos, por favor verifique su formulario.',
  },
  logisticTrack: {
    pageTitle: 'Rastrear pedido logístico',
    trackingId: 'ID de seguimiento',
    status: 'Estado',
    stepPickup: 'Recogida',
    stepInTransit: 'En tránsito',
    stepDelivered: 'Entregado',
    stepPending: 'Pendiente',
    noTracking: 'No se encontraron datos de seguimiento',
    lastUpdate: 'Última actualización',
    estimatedArrival: 'Llegada estimada',
    contactSupport: 'Contacte a nuestro equipo si tiene alguna pregunta sobre su pedido.',
    labelPickup: 'Proceso de recogida',
    labelInTransit: 'En tránsito',
    labelDelivered: 'Entregado',
    labelAtWarehouse: 'En almacén',
  },
  mktMyRfqs: {
    pageTitle: 'Mis solicitudes de cotización',
    pageDesc: 'Supervise todas sus solicitudes de cotización',
    searchPlaceholder: 'Buscar solicitud, producto, proveedor…',
    allStatus: 'Todos los estados',
    allDates: 'Todas las fechas',
    emptyRfq: 'Sin solicitudes de cotización.',
    noMatchingRfq: 'No se encontraron solicitudes coincidentes.',
    colRfqNo: 'N.º solicitud',
    colProduct: 'Producto',
    colVendor: 'Proveedor',
    colStatus: 'Estado',
    colDate: 'Fecha',
    statusOpen: 'Abierto',
    statusPending: 'Pendiente',
    statusQuoted: 'Cotizado',
    statusAccepted: 'Aceptado',
    statusRejected: 'Rechazado',
    statusExpired: 'Expirado',
    viewDetail: 'Ver detalle',
    createRfq: 'Crear nueva solicitud',
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
    submitSuccess: 'RFQ enviado con éxito',
    cancelSuccess: 'RFQ cancelado con éxito',
  
    submitErrorFallback: 'Error al enviar la RFQ',
    cancelErrorFallback: 'Error al cancelar la RFQ',
  },
  mktPurchaseOrders: {
    pageTitle: 'Mis órdenes de compra',
    pageDesc: 'Supervise el estado de todas sus órdenes de compra del Marketplace',
    viewRfqs: 'Ver mis solicitudes de cotización',
    searchPlaceholder: 'Buscar N.º OC, solicitud, proveedor…',
    filterLabel: 'Filtrar:',
    allStatus: 'Todos los estados',
    allVendors: 'Todos los proveedores',
    allDates: 'Todas las fechas',
    last7Days: 'Últimos 7 días',
    last30Days: 'Últimos 30 días',
    last90Days: 'Últimos 90 días',
    fetchError: 'Error al cargar órdenes de compra.',
    retry: 'Reintentar',
    emptyPo: 'Sin órdenes de compra.',
    noMatchingPo: 'Ninguna orden de compra coincide con el filtro.',
    resetFilter: 'Restablecer filtro',
    colPoNumber: 'N.º OC',
    colVendor: 'Proveedor',
    colStatus: 'Estado',
    colEstCompletion: 'Finalización estimada',
    colCreatedAt: 'Creado',
    statusPending: 'Pendiente',
    statusDraft: 'Borrador',
    statusIssued: 'Emitido',
    statusVendorAccepted: 'Aceptado por proveedor',
    statusVendorRejected: 'Rechazado por proveedor',
    statusProduction: 'En producción',
    statusReadyToShip: 'Listo para enviar',
    statusInTransit: 'En tránsito',
    statusDelivered: 'Entregado',
    statusCompleted: 'Completado',
    statusCancelled: 'Cancelado',
      showingCount: 'Showing {current} of {total} purchase orders',
    statusRevisionRequested: 'Revision Requested',
    statusClosed: 'Closed',
    statusPartiallyDelivered: 'Partially Delivered',
    statusRejectedGoods: 'Goods Rejected',
  
    rfqPrefix: 'RFQ: ',
  },
  oceanFreight: {
    heroTitle: 'Flete marítimo internacional de confianza',
    heroSub: 'FCL, LCL, frigorífico y carga de proyectos a 150+ puertos mundiales.',
    getQuote: 'Solicitar cotización',
    trackCargo: 'Rastrear carga',
    serviceOptions: 'Opciones de servicio',
    fclTitle: 'FCL (contenedor completo)',
    fclDesc: 'Contenedor completo para grandes envíos. Más económico por unidad y seguro.',
    lclTitle: 'LCL (carga consolidada)',
    lclDesc: 'Pago por volumen. Ideal para envíos pequeños.',
    containerFleet: 'Flota de contenedores',
    popularRoutes: 'Rutas populares',
    whyChooseUs: '¿Por qué elegirnos?',
    processSteps: 'Proceso de envío',
    ctaTitle: '¿Listo para enviar su carga?',
    originCity: 'Ciudad de origen',
    destCity: 'Ciudad de destino',
    shipmentType: 'Tipo de envío',
    containerQty: 'Número de contenedores',
    grossWeight: 'Peso bruto (kg)',
    commodity: 'Mercancía',
    additionalSvc: 'Servicios adicionales',
    customsClearance: 'Despacho aduanero',
    inlandTruck: 'Transporte terrestre interno',
    insurance: 'Seguro de carga',
    calculateEstimate: 'Calcular estimación',
    inquirySent: '¡Consulta enviada!',
    orderNo: 'N.º pedido',
    estimateNotice: 'Esta es una estimación inicial. El precio final se confirma tras la verificación del administrador.',
    bookNow: 'Reservar ahora',
    loadingQuotes: 'Cargando cotizaciones...',
    noVendors: 'No hay proveedores disponibles',
    selectVendorFirst: 'Por favor, seleccione primero un proveedor',
    submitOrder: 'Enviar pedido',
    detailShipment: 'Detalles del envío',
    summaryTitle: 'Resumen del pedido',
    totalEstimate: 'Estimación total',
    confirmOrder: 'Confirmar pedido',
    cancelOrder: 'Cancelar',
    successTitle: '¡Pedido exitoso!',
    errorSubmit: 'Error al enviar el pedido',
    heroLine1: 'Flete Marítimo',
    heroAccent: 'Internacional',
    heroLine2: 'de Confianza',
    heroSubFull: 'FCL, LCL, Reefer y carga de proyecto a 150+ puertos en todo el mundo. Obtenga estimaciones de precios instantáneas y soporte documental completo.',
    statPorts: 'Puertos de Destino',
    statPartner: 'Socios Navieros',
    statCargo: 'Todos los Tipos de Carga',
    statSupport: 'Soporte Operacional',
    fclOrLcl: '¿FCL o LCL?',
    fclLclSubtext: 'Gestionamos ambos tipos de carga con tarifas competitivas y manejo profesional.',
    fclDescFull: 'Contenedor completo para grandes envíos. Más económico por unidad y seguro ya que la carga no se mezcla.',
    fclFeature1: 'Ideal para carga ≥10 CBM',
    fclFeature2: 'Más seguro — carga no mezclada',
    fclFeature3: 'Tiempo de tránsito más rápido',
    fclFeature4: '20ft, 40ft, 40HC, Reefer, Open Top',
    fclBtn: 'Verificar Estimación FCL →',
    lclDescFull: 'Pague por volumen. Adecuado para envíos pequeños que no llenan un contenedor completo.',
    lclFeature1: 'Ideal para carga <10 CBM',
    lclFeature2: 'Pago por CBM / W/M',
    lclFeature3: 'Consolidación con otra carga',
    lclFeature4: 'Flexible para PYMEs y startups',
    lclBtn: 'Verificar Estimación LCL →',
    containerTitle: 'Opciones de Contenedores',
    container20ftDesc: 'Contenedor estándar de uso general',
    container40ftDesc: 'Gran capacidad para alto volumen',
    container40hcDesc: 'Altura extra para carga grande',
    containerRef20Desc: 'Refrigerado para carga sensible',
    containerRef40Desc: 'Refrigerado de gran capacidad',
    containerOpenDesc: 'Para carga sobredimensionada en altura',
    containerFlatDesc: 'Para maquinaria y carga de proyecto',
    routesTitle: 'Principales Rutas de Exportación e Importación',
    routesNote: 'El tiempo de tránsito es una estimación y puede variar según el horario del transportista.',
    ourAdvantage: 'Nuestras Ventajas',
    feat1Title: 'Red Global',
    feat1Desc: '150+ puertos en todo el mundo, 20+ socios navieros',
    feat2Desc: 'Protección total de la carga desde el puerto de origen hasta el destino',
    feat3Title: 'Documentación Completa',
    feat3Desc: 'B/L, lista de empaque, COO, MSDS y todos los documentos de exportación-importación',
    feat4Desc: 'Recogida y entrega a su puerta, incluido el despacho de aduana',
    feat5Desc: 'Rastree su carga en cualquier momento a través del portal de seguimiento',
    feat6Title: 'Precios Competitivos',
    feat6Desc: 'Negociación directa con transportistas para obtener las mejores tarifas',
    workflowLabel: 'Flujo de Trabajo',
    step1Title: 'Consulta',
    step1Desc: 'Cuéntele a nuestro equipo sus necesidades de envío',
    step2Desc: 'Le enviamos una estimación de costos y opciones de transportista',
    step3Desc: 'Confirmación y procesamiento completo de documentos',
    step4Title: 'Envío',
    step4Desc: 'La carga se envía y se rastrea hasta que llega al destino',
    ctaSubtitle: 'Obtenga una estimación de precio instantánea para su ruta de destino. Nuestro equipo está listo 24/7.',
    ctaBtn: 'Solicitar Cotización Ahora',
    ctaWa: 'Contactar vía WhatsApp',
    successDesc: 'Tu solicitud de cotización de Ocean Freight ha sido enviada. Nuestro equipo enviará el precio final tras la confirmación de la naviera / socio.',
    backToHome: 'Volver al Inicio',
    yourData: 'Tus Datos',
    customerNameLabel: 'Nombre',
    customerNamePlaceholder: 'Nombre completo',
    customerPhoneLabel: 'Teléfono / WhatsApp',
    customerCompanyLabel: 'Empresa',
    customerNotesLabel: 'Notas Adicionales',
    customerNotesPlaceholder: 'Instrucciones especiales...',
    goBack: 'Volver',
    sending: 'Enviando...',
    koliQty: 'Cantidad de Bultos',
    containerFinalNote: 'Detalles finales según confirmación del transportista.',
    lclCargo: 'LCL Cargo',
    lclCargoSub: 'Less than Container Load',
    lclRateNote: 'Tarifa basada en CBM utilizado',
    checkEstimate: 'Calcular Estimación',
    calculating: 'Calculando...',
    estimateResults: 'Resultados de Estimación',
    recalculate: 'Recalcular',
    noRate: 'No hay tarifa disponible para esta ruta',
    noRateHint: 'Envíe una consulta para recibir una cotización manual de nuestro equipo.',
    requestManual: 'Solicitar Cotización Manual',
    initialEstimate: 'Estimación Inicial',
    dayUnit: 'días',
    validUntil: 'Válido hasta',
    selectEstimate: 'Seleccionar Esta Estimación',
    estimateNoticeShort: 'Esta es una estimación inicial. El precio final se confirma cuando admin/proveedor recibe confirmación de la naviera/socio.',
    estimateNoticeFull: 'Esta es una estimación inicial. El precio final se confirma cuando admin/proveedor recibe confirmación de la naviera, NVOCC, co-loader o socio.',
    breakdownTitle: 'Desglose de Estimación',
    totalBreakdown: 'Total Estimado',
    custNameRequired: 'El nombre del cliente es obligatorio',
    hsCodeOptional: 'HS Code (opcional)',
    requestFinalQuote: 'Solicitar Cotización Final',
  },
  productOrderTrack: {
    pageTitle: 'Rastrear pedido de producto',
    orderNo: 'N.º pedido',
    status: 'Estado',
    noTracking: 'No se encontraron datos',
    trackBtn: 'Rastrear',
    searchPlaceholder: 'Ingrese el N.º pedido...',
  },
  truckingPage: {
    pageTitle: 'Servicios de transporte',
    heroSub: 'Transporte terrestre confiable y programado en todas las regiones.',
    kembali: 'Volver',
    armadaTersedia: 'Flota disponible',
    lokasi: 'Ubicación',
    mulaiDari: 'Desde',
    profilArmada: 'Perfil de la flota',
    tentangArmada: 'Acerca de {name}',
    jaminanEnterprise: 'Nuestras garantías empresariales',
    cekOngkir: 'Verificar costo de envío',
    orderBerhasil: '¡Pedido creado!',
    nomorOrder: 'Número de pedido',
    dimensiNote: 'Las dimensiones son promedios para esta clase de vehículo. Puede haber variaciones.',
    totalEstimasi: 'Estimación total',
    shippingCalc: 'Calculadora de envío',
    availableFleet: 'Flota disponible',
    bestFor: 'Ideal para',
    advantages: 'Ventajas',
    pickupSection: 'Recogida',
    deliverySection: 'Entrega',
    pickupAddress: 'Dirección de recogida',
    deliveryAddress: 'Dirección de entrega',
    pickupSchedule: 'Horario de recogida',
    now: 'Ahora',
    later: 'Después',
    itemDetail: 'Detalles del artículo',
    itemType: 'Tipo de artículo',
    weight: 'Peso (kg)',
    tripQty: 'Número de viajes',
    addons: 'Servicios adicionales',
    loadingService: 'Servicio de carga',
    unloadingService: 'Servicio de descarga',
    overnight: 'Noche',
    helper: 'Asistente',
    flowSection: 'Flujo de entrega',
    standardService: 'Servicio estándar',
    estimateCost: 'Estimación de costos',
    fillToCalculate: 'Complete los detalles para calcular la estimación de costos',
    vehicleSelect: 'Seleccionar vehículo',
    noVendors: 'No hay proveedores disponibles',
    orderSent: '¡Pedido enviado!',
    submitOrder: 'Pedir ahora',
    servicePackage: 'Paquete de servicio',
    techSpec: 'Especificaciones técnicas',
    jasaLayanan: 'Servicios & Soluciones',
    encrypted: 'Cifrado',
    verified: 'Verificado',
    freeConsult: 'Consulta gratuita',
    chatSalesWa: 'Contactar ventas via WhatsApp',
    orderVehicle: 'Pedir {name}',
    orderTrucking: 'Pedir camionaje ahora',
    allVerified: 'Socios 100% verificados',
    encryptedTx: 'Transacciones cifradas',
    fleetVerified: 'Flota verificada',
    strictInspection: 'Todas las unidades pasan inspección estricta',
    rating: 'Calificación 4.9/5',
    fleet100: '100% flota',
    armadaAktif: 'Flota activa',
    jasaTrucking: 'Servicio de transporte',
    perTrip: 'Por viaje',
    sewaHarian: 'Alquiler diario',
    perHariTermasuk: '/ día · conductor y combustible incluidos',
    sudahTermasuk: 'Incluido',
    bisniAktif: 'Empresas activas',
    pengirimanStat: 'Envíos',
    ratingRataRata: 'Valoración media',
    onTimeRate: 'Tasa puntualidad',
    klienAktifStat: 'Clientes activos',
    pengirimanStatShort: '50.000+ envíos',
    cargoInsurance: 'Seguro de carga incluido',
    gpsTracking: 'Seguimiento GPS en tiempo real',
    enterpriseSolusi: 'Solución logística empresarial',
    enterpriseTitle: '¿Necesita mayor escala?',
    enterpriseSub: 'Consulte sus necesidades de envío empresarial con nuestros especialistas logísticos. Descuentos por volumen, flota dedicada y SLA personalizados disponibles.',
    requestPenawaran: 'Solicitar cotización',
    chatWhatsApp: 'Chat por WhatsApp',
    perusahaanAktifSub: 'empresas activas',
    areaPickup: 'Zona de recogida',
    picPickup: 'Contacto recogida',
    hpPickup: 'Tel. recogida',
    areaDelivery: 'Zona de entrega',
    picReceiver: 'Nombre del destinatario',
    hpReceiver: 'Tel. destinatario',
    pickupNow: 'Recoger ahora',
    pickupLater: 'Programar después',
    pickupDate: 'Fecha de recogida',
    pickupTime: 'Hora de recogida',
    beratKg: 'Peso (kg)',
    jumlahKoli: 'Número de paquetes',
    volumeOpsional: 'Volumen (m³) — opcional',
    catatanKhusus: 'Notas especiales',
    minimalTrip: 'Mín. 1 viaje · {name}',
    vendorHargaTermurah: 'proveedor · mejor precio',
    inclVehicle: 'Vehículo elegido',
    inclCargo: 'Espacio de carga exclusivo',
    inclDriver: 'Conductor experimentado',
    inclFuel: 'Combustible incluido',
    inclWait: 'Espera gratuita 6h',
    inclInsurance: 'Seguro de carga básico',
    tambahanOpsional: 'Servicios opcionales',
    perTripSuffix: '/ viaje',
    prosesPemesanan: 'Proceso de pedido',
    step1Desc: 'Seleccione el vehículo adecuado para sus necesidades de envío',
    step2Desc: 'Calcule el costo de envío estimado con nuestra calculadora de flete',
    step3Desc: 'Complete el formulario de reserva con todos los detalles del envío',
    step4Desc: 'Monitoree el estado del envío en tiempo real vía GPS',
    guarArmadaLabel: 'Vehículo inspeccionado',
    guarArmadaDesc: 'Todos los vehículos han pasado la inspección y mantenimiento regular',
    guarSopirLabel: 'Conductor licenciado',
    guarSopirDesc: 'Conductores experimentados y licenciados para cada vehículo',
    guarGpsLabel: 'GPS en tiempo real',
    guarGpsDesc: 'Monitoree la posición del vehículo en tiempo real vía sistema GPS',
    guarAsuransiLabel: 'Seguro de carga',
    guarAsuransiDesc: 'El seguro de carga estándar está incluido en cada envío',
    guarSupportLabel: 'Soporte 24h',
    guarSupportDesc: 'Soporte al cliente disponible durante horario operativo',
    guarResponsLabel: 'Respuesta rápida',
    guarResponsDesc: 'Nuestro equipo responde consultas en 24 horas',
    phAreaPickup: 'Seleccionar zona de origen',
    phAddrPickup: 'Dirección completa del lugar de recogida',
    phPicPickup: 'Nombre del contacto en el lugar de recogida',
    phAreaDelivery: 'Seleccionar zona de destino',
    phAddrDelivery: 'Dirección completa del destino de entrega',
    phPicReceiver: 'Nombre del contacto receptor',
    phItemType: 'ej: electrónica, documentos, ropa',
    phBerat: 'ej: 100',
    phKoli: 'ej: 5',
    phVolume: 'ej: 1.5',
    phCatatan: 'Instrucciones especiales, notas, etc.',
    addonsNote: 'Los servicios adicionales afectarán el precio total estimado.',
    addonBantuanMuatLabel: 'Ayuda de carga',
    addonBantuanBongkarLabel: 'Ayuda de descarga',
    addonAsuransiLabel: 'Seguro',
    addonFerryLabel: 'Ferry / Cruce',
    addonTolLabel: 'Peaje (costo real)',
    addonMultiDropLabel: 'Multi-entrega',
    addonUrgentLabel: 'Entrega urgente',
    addonOvernightLabel: 'Nocturno / Día completo',
    menghitungEstimasi: 'Calculando estimación...',
    hitungEstimasi: 'Calcular estimación',
    menghitungHarga: 'Calculando el mejor precio para usted...',
    cobaLagi: 'Intentar de nuevo',
    noVendorContact: 'Contacte a nuestro equipo de ventas para información de proveedores',
    rowEstKm: 'Distancia estimada',
    noteEstKota: 'Distancia estimada entre ciudades',
    noteJarakTidak: 'Distancia desconocida',
    noteJarakAktual: 'Distancia real',
    rowTarifPerKm: 'Tarifa / km',
    rowMinCharge: 'Cargo mínimo',
    rowHargaDasar: 'Precio base',
    rowSurchargeKota: 'Recargo ciudad',
    rowSurchargeProvinsi: 'Recargo provincial',
    rowSurchargePulau: 'Recargo inter-islas',
    rowBiayaMuat: 'Costo de carga',
    rowBiayaBongkar: 'Costo de descarga',
    rowFerry: 'Costo de ferry',
    rowTol: 'Peaje',
    tolActualCost: 'Costo real',
    rowMultidrop: 'Multi-entrega',
    rowOvernight: 'Nocturno',
    rowAsuransi: 'Seguro',
    rowUrgent: 'Urgente',
    estimasiPpnNote: 'Estimación excluye IVA 11%',
    estimasiHargaTrucking: 'Estimación del precio de transporte',
    rowAreaPickup: 'Zona de origen',
    rowAreaDelivery: 'Zona de destino',
    rowArmada: 'Vehículo',
    mengirimPermintaan: 'Enviando solicitud...',
    kirimTanpaEstimasi: 'Enviar sin estimación',
    mengirim: 'Enviando...',
    orderInfo: 'Nuestro equipo se pondrá en contacto pronto',
    menungguAdmin: 'Esperando confirmación del admin',
    notifOperasional: 'Notificación enviada a su WhatsApp',
    simpanNomor: 'Guarde su número de pedido',
    estimasiDays: 'Estimado {days} días hábiles',
    onTimeBadge: '99,2% puntual',
    onTimeRateBadge: '99,2% puntualidad',
    ratingBadge: 'Valoración',
    ratingValue: '4.9/5',
    step1Title:  'Elegir vehículo',
    step3Title:  'Rellenar formulario',
    step4Title:  'Rastrear envío',
    adminReview: 'El admin revisará y confirmará su pedido',
  },
  vendorDashboard: {
    pageTitle: 'Panel del proveedor',
    catalogTitle: 'Catálogo de productos y servicios',
    catalogDesc: 'Agregue, edite y gestione sus productos/servicios en el marketplace',
    uploadPhotoHint: 'Suba fotos de cada producto/servicio para aparecer atractivamente en el Marketplace',
    addProduct: 'Agregar producto',
    addService: 'Agregar servicio',
    typeProduct: 'Producto',
    typeService: 'Servicio',
    cancelBtn: 'Cancelar',
    backToLogin: 'Volver al inicio de sesión',
    quotesTitle: 'Mis cotizaciones',
    quotesDesc: 'Todas las cotizaciones que ha enviado',
    submissionsTitle: 'Mis productos/servicios',
    submissionsDesc: 'Productos/servicios enviados para revisión del administrador',
    notifTitle: 'Notificaciones',
    notifDesc: 'Actualizaciones relacionadas con su cuenta de proveedor y catálogo',
    promoTitle: 'Promociones',
    promoDesc: 'Seleccione productos/servicios y paquetes de promoción adecuados',
    promoHistory: 'Historial y estado de todas sus presentaciones',
    statusDraft: 'Borrador',
    estPickup: 'Recogida estimada',
    estDelivery: 'Entrega estimada',
    maxFileHint: 'JPG, PNG, WebP · Máx 20 MB',
    noItems: 'Sin artículos en el catálogo',
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
    featuredStatusPending: 'Pendiente',
    featuredStatusApproved: 'Aprobado',
    featuredStatusActive: 'Activo',
    featuredStatusRejected: 'Rechazado',
    featuredStatusExpired: 'Expirado',
    featuredStatusCancelled: 'Cancelado',
    paymentUnpaid: 'Sin pagar',
    paymentPendingVerif: 'Verificación pendiente',
    paymentVerified: 'Verificado',
    paymentRejected: 'Rechazado',
    paymentRefunded: 'Reembolsado',
    quoteDetailStatusLabel: 'Estado',
    quotePricePlaceholder: 'Ej. 5000000',
    etaPickupPlaceholder: 'Ej. 2 días hábiles',
    etaDeliveryPlaceholder: 'Ej. 5–7 días hábiles',
    notesPlaceholder: 'Condiciones o información adicional...',
  
    quoteStatusPending: 'Pendiente',
    quoteStatusApproved: 'Seleccionado',
    quoteStatusRejected: 'Rechazado',
    rfqStatusOpen: 'Abierto',
    rfqStatusClosed: 'Cerrado',
    durationDaysUnit: 'días',
    rfqStatusAwarded: 'Adjudicado',
    statusPublished: 'Publicado',
    statusArchived: 'Archivado',
    publishBtn: 'Publicar',
    unpublishBtn: 'Despublicar',
    mediaPhotoLabel: 'Foto',
    mediaVideoLabel: 'Vídeo',
    mediaDocumentLabel: 'Documento',
    mediaDocumentPdfLabel: 'Documento (PDF)',
    formNameRequired: 'El nombre del producto es obligatorio',
    formAddError: 'Error al agregar producto',
    formEditNameRequired: 'El nombre es obligatorio',
    formSaveError: 'Error al guardar',
    mediaSaveError: 'Error al guardar el medio',
    quoteFormPriceRequired: 'El precio es obligatorio y debe ser mayor que 0',
    quoteUpdatedMsg: '¡Cotización actualizada!',
    setPrimaryTitle: 'Establecer como principal',
    deleteTitle: 'Eliminar',
    quoteSentMsg: '¡Cotización enviada con éxito!',
    quoteSendError: 'Error al enviar',
  },

  jasaDetail: {
    calcTitle: 'Calculadora de estimación de costes',
    calcSubtitle: 'Complete los parámetros del servicio para obtener una estimación de precio',
    airAddQty: 'Añadir otra cantidad',
    airCalcSummary: 'Resumen del cálculo ({count} tipos de cantidad):',
    truckStep1Label: 'Detalles del envío',
    truckStep2Label: 'Flota y confirmación',
    scheduleLabel: 'Horario de recogida',
    orderNowLabel: 'Pedir ahora',
    orderNowDesc: 'Recogida programada para hoy',
    activeLabel: 'Activo',
    dateLabel: 'Fecha',
    timeLabel: 'Hora',
    scheduleDisplay: 'Horario: {date} a las {time}',
    senderLabel: 'Información del remitente',
    senderNameLabel: 'Nombre del remitente',
    senderNamePlaceholder: 'Nombre completo del remitente',
    senderPhoneLabel: 'Teléfono del remitente',
    routeLabel: 'Ruta de entrega',
    originPlaceholder: 'Ciudad de origen...',
    stopCityPlaceholder: 'Ciudad de parada {n}...',
    removeStop: 'Eliminar parada',
    stopReceiverNameLabel: 'Nombre del receptor en parada {n}',
    stopReceiverPhoneLabel: 'Teléfono del receptor en parada {n}',
    destPlaceholder: 'Ciudad de destino...',
    receiverNameLabel: 'Nombre del receptor',
    receiverPhoneLabel: 'Teléfono del receptor',
    receiverNamePlaceholder: 'Nombre del receptor',
    optimizeRouteDesc: 'Ordenar paradas para hacer el viaje más eficiente.',
    distanceEstLabel: 'Distancia estimada',
    calculatingLabel: 'Calculando...',
    autoLabel: '✓ Automático',
    cargoLabel: 'Información de la carga',
    cargoCategoryLabel: 'Categoría de carga',
    koliQtyLabel: 'Número de paquetes',
    dimensionsLabel: 'Dimensiones y volumen',
    totalVolumeLabel: 'Volumen total / cúbico',
    addDimension: 'Añadir dimensión',
    notesPlaceholder: 'Notas adicionales sobre mercancías, manejo o instrucciones especiales...',
    uploadPhotoLabel: 'Subir fotos de carga',
    photoCount: '{n}/5 fotos',
    photoPickerHint: 'Seleccionar fotos (jpg, jpeg, png, webp) · máx. 5 fotos',
    paymentLabel: 'Tipo de pago',
    transferDesc: 'Pagar por transferencia bancaria',
    gatewayDesc: 'Pagar por pasarela online',
    selectTransferLabel: 'Seleccionar tipo de transferencia',
    fullPayDesc: 'Pago completo',
    terminDesc: 'Cuotas periódicas',
    dpDesc: 'Pago inicial',
    terminPeriodLabel: 'Período de cuotas',
    nextPaymentLabel: 'Próximo pago',
    afterDelivery: 'Tras la entrega',
    net30Days: 'Neto 30 días',
    net60Days: 'Neto 60 días',
    installments: 'Cuotas escalonadas',
    orderSummaryLabel: 'Resumen del pedido',
    summarySchedule: 'Horario',
    summaryNow: 'Ahora',
    summaryRoute: 'Ruta',
    summaryDistance: 'Distancia',
    summaryCategory: 'Categoría',
    summaryCargo: 'Carga',
    summaryPhoto: 'Fotos',
    photoUploaded: '{n} fotos subidas',
    summaryPayment: 'Pago',
    payTransferFull: 'Transferencia · Pago completo',
    payTransferTermin: 'Transferencia · Cuota {term}',
    payTransferDp: 'Transferencia · Pago inicial',
    payTransfer: 'Transferencia',
    recommended: 'Recomendado',
    notSuitable: 'No adecuado',
    distanceKmLabel: 'Distancia (km)',
    costBreakdownLabel: 'Desglose de costes',
    totalEstLabel: 'Estimación total',
    fillRateHint: 'Complete la tarifa/km y la distancia para ver la estimación.',
    addedToCartMsg: '¡{name} añadido al pedido con éxito!',
    estimatedSubtotal: 'Subtotal estimado',
    estimatedSubtotalNote: 'Precio estimado · confirmado por el equipo CST',
    addToOrderBtn: 'Añadir al pedido',
    addedToCartConfirm: '{name} añadido al pedido con éxito',
    recalcBtn: 'Recalcular',
    proceedBtn: 'Proceder a reservar',
    sidebarInfoLabel: 'Información del servicio',
    sidebarTruckingNote: 'Basado en cálculo de distancia y flota',
    availableLabel: '● Disponible',
    vehicleLabel: 'Vehículo',
    distanceLabel: 'Distancia',
    viewCartBtn: 'Ver carrito de pedidos',
    whyUsLabel: '¿Por qué B2B Marketplace and Logistic?',
    trustBadge1: 'Con licencia y registro oficial',
    trustBadge2: 'Respuesta rápida y profesional',
    trustBadge3: 'Carga segura y protegida',
    trustBadge4: 'Soporte por WhatsApp 24/7',
    relatedServicesLabel: 'Otros servicios de {category}',
    viewAllServices: 'Ver todos los servicios',
    backBtn: '← Atrás',
    nextBtn: 'Siguiente',
    pendingOrderTitle: 'Este servicio está seleccionado como entrega',
    pendingOrderLabel: 'Pedido:',
    pendingOrderAdded: 'Servicio ya añadido. Haga clic en Confirmar para continuar.',
    pendingOrderHint: 'Haga clic en "Añadir al pedido" primero.',
    confirmOrderBtn: 'Confirmar y continuar pedido',
    cancelBtn: 'Cancelar',
    toastAddServiceFirst: 'Añada primero el servicio al pedido',
    toastAddServiceDesc: 'Haga clic en el botón "Añadir al pedido" antes de continuar.',
    toastAutoDistance: 'Distancia automática: {km} km',
    toastDistanceFail: 'Error al calcular la distancia',
    toastDistanceFailDesc: 'Introduzca la distancia manualmente',
    toastNoDate: 'Seleccione la fecha de recogida',
    toastDatePast: 'La fecha de recogida no puede ser anterior a hoy',
    toastNoTime: 'Seleccione la hora de recogida',
    toastNoSenderName: 'Introduzca el nombre del remitente',
    toastNoSenderPhone: 'Introduzca el teléfono del remitente',
    toastNoOrigin: 'Introduzca la ciudad de origen',
    toastNoDest: 'Introduzca la ciudad de destino',
    toastNoReceiverName: 'Introduzca el nombre del receptor',
    toastNoReceiverPhone: 'Introduzca el teléfono del receptor',
    toastNoStopReceiverName: 'Introduzca el nombre del receptor en parada {n}',
    toastNoStopReceiverPhone: 'Introduzca el teléfono del receptor en parada {n}',
    toastNoCargo: 'Seleccione la categoría de carga (obligatorio)',
    toastNoKoli: 'El número de paquetes debe ser mayor que 0',
    toastNoWeight: 'El peso bruto debe ser mayor que 0',
    toastNoPhoto: 'Suba al menos 1 foto de carga (obligatorio)',
    toastNoPayment: 'Seleccione el tipo de pago (obligatorio)',
    toastNoTransferType: 'Seleccione el tipo de transferencia (Pago completo, Cuotas o Pago inicial)',
    toastFillCalc: 'Complete primero los datos de la calculadora',
    toastNoVehicle: 'Seleccione primero la flota de vehículos',
    toastAddedToCart: '¡{name} añadido al carrito de pedidos!',
    toastRouteOptimized: 'Ruta optimizada',
    toastRouteOptimizedDesc: 'Orden de paradas reordenado automáticamente.',
  
    destAirport: 'Aeropuerto de Destino',
    grossWeightKg: 'Peso Bruto (kg)',
    quantityPcs: 'Cantidad (pzas)',
    lengthCm: 'Largo (cm)',
    widthCm: 'Ancho (cm)',
    heightCm: 'Alto (cm)',
    volWeight: 'Peso Vol.',
    chargeable: 'Cobrable',
    ratePerKg: 'Tarifa/kg (IDR)',
    totalVolWeight: 'Peso Vol. Total',
    totalChargeableWeight: 'Peso Cobrable Total',
    originPort: 'Puerto de Origen',
    destPort: 'Puerto de Destino',
    containerType: 'Tipo de Contenedor',
    selectContainer: 'Seleccionar contenedor',
    freightRate: 'Tarifa de Flete (IDR)',
    handlingFeeIDR: 'Cargo por Manejo (IDR)',
    weightKg: 'Peso (kg)',
    ratePerCbm: 'Tarifa/CBM (IDR)',
    minimumCharge: 'Cargo Mínimo (IDR)',
    customsFeeIDR: 'Tarifa Aduanera (IDR)',
    documentFeeIDR: 'Tarifa de Documentos (IDR)',
    pibPebFee: 'Tarifa PIB/PEB (IDR)',
    permitFeeIDR: 'Tarifa de Permiso (IDR)',
    addStop: 'Agregar Parada',
    optimizeRoute: 'Optimizar Ruta',
    ratePerKmIDR: 'Tarifa/km (IDR)',
    adminVerified: '✓ admin',
    loadingFeeIDR: 'Cargo por Carga (IDR)',
    loadingFeeLabel: 'Cargo por Carga',
    numDays: 'Número de Días',
    unitLabel: 'Unidad',
    selectUnit: 'Seleccionar unidad',
    ratePerDayIDR: 'Tarifa/día (IDR)',
    documentType: 'Tipo de Documento',
    feePerDocIDR: 'Tarifa por Documento (IDR)',
    serviceFeeIDR: 'Tarifa de Servicio (IDR)',
    adminFeeIDR: 'Tarifa de Admin (IDR)',
    serviceName: 'Nombre del Servicio',
    unitPriceIDR: 'Precio Unitario (IDR)',
    quotation: 'Negociación / Cotización',
  },

  portalDokumen: {
    title: "Documentos",
    subtitle: "Sus facturas comerciales y documentos de transacción",
    searchPlaceholder: "Buscar número de documento o pedido...",
    viewAllOrders: "Ver todos los pedidos",
    transactionDocs: "Documentos de transacción",
    documentsCount: "{n} documento(s)",
    orderRef: "Pedido: {number}",
    dueDateLabel: "Fecha de vencimiento",
    noMatchDocs: "No hay documentos coincidentes",
    clearSearch: "Borrar búsqueda",
    emptyTitle: "Aún no hay documentos",
    emptyDesc: "Los documentos de transacción aparecerán aquí después de confirmar su pedido.",
    viewMyOrders: "Ver mis pedidos",
    logisticDocsTitle: "Documentos del equipo logístico",
    logisticDocsDesc: "Los documentos anteriores son enviados directamente por el equipo de operaciones vía WhatsApp o correo electrónico según el progreso del envío.",
    detailBtn: "Detalle",
  },
  portalInvoice: {
    title: "Factura y Pago",
    subtitle: "Su historial de facturación y estado de pago",
    totalUnpaid: "Total no pagado",
    invoiceList: "Lista de facturas",
    payBtn: "Pagar",
    emptyTitle: "Aún no hay facturas",
    emptyDesc: "Las facturas aparecerán aquí después de confirmar su pedido y estar listas para facturar.",
    viewShipments: "Ver mis envíos",
    orderRef: "Pedido: {number}",
    dueDateLabel: "Fecha de vencimiento",
    paymentLink: "Enlace de pago",
  },

  oceanFreightBooking: {
    optionEconomy: 'Económico',
    optionEconomyDesc: 'Precio más asequible',
    optionStandard: 'Estándar',
    optionStandardDesc: 'Equilibrio precio & tiempo',
    optionPriority: 'Prioritario',
    optionPriorityDesc: 'Tránsito más rápido',
    errorFillPorts: 'Por favor, rellene el puerto de origen y destino',
    errorSelectContainer: 'Por favor, seleccione el tipo de contenedor',
    errorFillCbm: 'Por favor, rellene CBM o peso bruto',
    errorNameRequired: 'El nombre es obligatorio',
    errorContactRequired: 'El teléfono o correo electrónico es obligatorio',
    successTitle: '¡Consulta enviada!',
    successDesc: 'Nuestro equipo confirmará la cotización final y se pondrá en contacto pronto.',
    orderNumberLabel: 'Número de pedido',
    orderAgain: 'Nuevo pedido',
    backToEstimate: 'Volver a la estimación',
    senderTitle: 'Datos del remitente',
    contactInfo: 'Información de contacto',
    fullName: 'Nombre completo *',
    phoneWa: 'Teléfono / WhatsApp *',
    email: 'Correo electrónico',
    company: 'Empresa',
    targetEtd: 'ETD objetivo',
    commodity: 'Mercancía',
    confirmNote: 'Nuestro equipo le contactará para confirmar el precio final en 1×24 horas.',
    sending: 'Enviando...',
    submitInquiry: 'Enviar consulta',
    changeSearch: 'Cambiar búsqueda',
    resultsTitle: 'Estimación de flete marítimo',
    noRatesTitle: 'Tarifas no disponibles',
    noRatesDesc: 'No tenemos tarifas para esta ruta aún. Nuestro equipo encontrará la mejor oferta.',
    requestManualQuote: 'Solicitar cotización manual',
    daysTransit: 'días de tránsito',
    estimate: 'Estimación',
    fixedPrice: 'Precio fijo',
    hideBreakdown: 'Ocultar',
    showBreakdown: 'Ver',
    breakdownTitle: 'Desglose de costes',
    docCharges: 'Cargos documentales',
    totalEstimate: 'Estimación total',
    requestManual: 'Solicitar manual',
    requestFinal: 'Solicitar cotización final',
    priceNote: 'Estimación inicial — precio final confirmado tras recibir tarifa de la naviera.',
    back: 'Volver',
    subtitle: 'Flete marítimo FCL & LCL',
    shippingRoute: 'Ruta de envío',
    selectPort: 'Seleccionar puerto...',
    cargoType: 'Tipo de carga',
    containerQty: 'Cantidad de contenedores',
    grossWeightKg: 'Peso bruto (kg)',
    colliCount: 'Número de bultos',
    cargoCondition: 'Condición de la carga',
    additionalServices: 'Servicios adicionales',
    additionalServicesHint: 'Seleccione los servicios necesarios (opcional)',
    calculating: 'Calculando estimación...',
    checkPrice: 'Comprobar estimación de precio',
    fclFull: 'FCL — Contenedor completo',
    lclLess: 'LCL — Carga suelta',
  
    tracking: 'Seguimiento',
    titleOceanFreight: 'Flete Marítimo',
    labelOriginPort: 'Puerto de Origen *',
    labelDestPort: 'Puerto de Destino *',
    labelTradeType: 'Tipo de Comercio',
    labelServiceMode: 'Modo de Servicio',
    labelContainerType: 'Tipo de Contenedor *',
    labelVolumeCbm: 'Volumen (CBM)',
    transshipmentDirect: 'Directo',
    transshipmentViaTS: 'Vía T/S',
    tradeTypeExport: 'Exportación',
    tradeTypeImport: 'Importación',
    tradeTypeDomestic: 'Doméstico',
    tradeTypeCrossBorder: 'Transfronterizo',
    serviceModePortPort: 'Puerto a Puerto',
    serviceModeDoorPort: 'Puerta a Puerto',
    serviceModePortDoor: 'Puerto a Puerta',
    serviceModeDoorDoor: 'Puerta a Puerta',
    cargoGeneral: 'Carga General',
    cargoDG: 'Mercancía Peligrosa',
    cargoReefer: 'Refrigerado',
    cargoFragile: 'Frágil',
    cargoOversize: 'Sobredimensionado',
    cargoHighValue: 'Alto Valor',
    addonTruckingPickup: 'Recogida en Camión',
    addonTruckingDelivery: 'Entrega en Camión',
    addonCustoms: 'Despacho Aduanero',
    addonInsurance: 'Seguro',
    addonFumigation: 'Fumigación',
    addonCOO: 'COO / Certificado',
    addonWarehouse: 'Manejo en Almacén',

    breakdownTHCOrigin: 'THC Origen',
    breakdownTHCDestination: 'THC Destino',
    breakdownTrucking: 'Transporte Terrestre',
    breakdownCustomsClearance: 'Despacho Aduanero',
},
  orderStatusLabels: {
    "New Order": "Nuevo pedido",
    "Awaiting Payment": "Esperando pago",
    "Paid": "Pagado",
    "In Progress": "En progreso",
    "Completed": "Completado",
    "Cancelled": "Cancelado",
  },

  customerOrder: {
    loading: 'Cargando estado del pedido...',
    notFound: 'Pedido no encontrado',
    priceSummary: 'Resumen de precios',
    origin: 'Origen',
    destination: 'Destino',
    orderDate: 'Fecha del pedido',
    estimatedArrival: 'Estimado',
    productService: 'Producto / Servicio',
    truck: 'Camión',
    internal: 'Interno',
    external: 'Externo',
    total: 'Total',
    journeyHistory: 'Historial del trayecto',
    noHistory: 'Sin historial de trayecto.',
    viewDocument: 'Ver documento',
    progressConfirm: 'Confirmación',
    progressPickup: 'Recogida',
    progressJourney: 'En tránsito',
    progressDelivered: 'Entregado',
    progressCompleted: 'Completado',
  },
  ppjkTrack: {
    loading: 'Cargando seguimiento PPJK…',
    notFound: 'Pedido no encontrado',
    notFoundMsg: 'Número de pedido inválido o aún no disponible',
    backToHome: 'Volver al inicio',
    statusDraft: 'Borrador / En espera de confirmación',
    statusConfirmed: 'Confirmado',
    statusProcessing: 'En proceso',
    statusSubmitted: 'Documentos enviados a aduanas',
    statusExamining: 'En examen aduanero',
    statusApproved: 'Aprobado / SPPB emitido',
    statusCompleted: 'Completado',
    statusCancelled: 'Cancelado',
    statusOnHold: 'En espera',
    customsPending: 'Pendiente',
    customsAjuFiled: 'Declaración aduanera presentada',
    customsJalurHijau: 'Canal verde',
    customsJalurMerah: 'Canal rojo',
    customsJalurKuning: 'Canal amarillo',
    customsSppbIssued: 'SPPB emitido',
    customsPaid: 'Derechos e impuestos pagados',
    customsReleased: 'Mercancías liberadas',
    actionCreated: 'Pedido creado',
    actionStatusChanged: 'Estado actualizado',
    actionCustomsStatusChanged: 'Estado aduanero actualizado',
    actionDocumentUploaded: 'Documento subido',
    actionNoteAdded: 'Nota añadida',
    actionUpdated: 'Datos actualizados',
    cargoInfo: 'Información del cargamento',
    commodity: 'Mercancía',
    route: 'Ruta',
    portOfEntry: 'Puerto de entrada/salida',
    kantorPabean: 'Oficina de aduanas',
    grossWeight: 'Peso bruto',
    koli: 'Paquetes',
    submissionDate: 'Fecha de presentación',
    customsDocuments: 'Números de documentos aduaneros',
    nomorAju: 'N.º de declaración',
    tanggalAju: 'Fecha de declaración',
    nomorPib: 'N.º PIB',
    nomorPeb: 'N.º PEB',
    nomorSppb: 'N.º SPPB',
    customsStatusLabel: 'Estado aduanero',
    timelineTitle: 'Historial de actualizaciones',
    lastUpdated: 'Última actualización',
    autoRefresh: 'La página se actualiza automáticamente cada 30 segundos',
    progressLabel: 'Progreso aduanero',
    cancelledMsg: 'Pedido cancelado — por favor contacte a nuestro equipo.',
    onHoldMsg: 'Pedido en espera — nuestro equipo se pondrá en contacto con usted en breve.',
    completedMsg: 'Proceso aduanero completado — mercancías listas para recogida o entrega.',
    showMore: 'Ver {count} actualizaciones más',
    showLess: 'Mostrar menos',
    tradeExport: 'Exportación',
    tradeImport: 'Importación',
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
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["loading"] = "Loading offer options...";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["invalidLink"] = "Invalid Link";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["linkExpired"] = "Link has expired or could not be found.";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["choiceMade"] = "Choice Accepted!";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["youChose"] = "You chose";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["contactSoon"] = "Our team will contact you shortly for the next steps.";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["orderRef"] = "Order";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["offerTitle"] = "Offers for You";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["offerSubtitle"] = "Select the best option that suits your needs";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["routeLabel"] = "Shipping Route";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["pickupLabel"] = "Pickup Schedule";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["unitType"] = "Unit Type";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["portAirport"] = "Port / Airport";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["etdEta"] = "ETD / ETA";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["commodity"] = "Commodity";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["orderNo"] = "Order No.";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["optionsCount"] = "Options Available";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["includedFees"] = "all fees included";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["vehicleYear"] = "Vehicle Year";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["transitTime"] = "Transit Time";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["days"] = "days";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["info"] = "Info";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["notes"] = "Notes";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["processing"] = "Processing...";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["choose"] = "Choose";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["confirmText"] = "After selecting, our team will contact you for final confirmation.";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["priceNote"] = "Price includes tax & administrative fees.";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["failedChoice"] = "Failed to select option";
if (!locale["chooseOption"] || typeof locale["chooseOption"] !== 'object') locale["chooseOption"] = {};
locale["chooseOption"]["invalidToken"] = "Invalid token";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusOrderReceived"] = "Order Received";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusAdminReview"] = "Under Admin Review";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusRfqSent"] = "Finding Vendor";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusQuoteReceived"] = "Quote Received";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusCustomerApproval"] = "Awaiting Your Approval";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusVendorConfirmed"] = "Vendor Confirmed";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusVendorRejected"] = "Vendor Rejected";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusInProgress"] = "In Progress";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusPickup"] = "Pickup in Progress";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusInTransit"] = "In Transit";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusArrived"] = "Arrived at Destination";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusDelivered"] = "Delivered";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusPodUploaded"] = "Proof of Delivery Uploaded";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusInvoiceIssued"] = "Invoice Issued";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusPaymentReceived"] = "Payment Received";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusCompleted"] = "Completed";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusDone"] = "Completed";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusCancelled"] = "Cancelled";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusNewOrder"] = "New Order";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusUnderReview"] = "Under Review";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusQuotationSent"] = "Quotation Sent";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusCustomerApproved"] = "Customer Approved";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["statusProcessing"] = "Processing";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepOrderReceived"] = "Order\nReceived";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepAdminReview"] = "Admin\nReview";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepVendorConfirmed"] = "Vendor\nConfirmed";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepInProgress"] = "Processing";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepInTransit"] = "In\nTransit";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepDelivered"] = "Delivered";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepPodUploaded"] = "Proof\nUploaded";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepInvoiceIssued"] = "Invoice";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepCompleted"] = "Completed";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelOrderReceived"] = "Order Received";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelAdminReview"] = "Admin Review";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelRfqSent"] = "RFQ Sent";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelQuoteReceived"] = "Quote Received";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelCustomerApproval"] = "Approval";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelVendorConfirmed"] = "Vendor Confirmed";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelInProgress"] = "Processing";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelPickup"] = "Pickup";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelInTransit"] = "In Transit";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelArrived"] = "Arrived";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelDelivered"] = "Delivered";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelPodUploaded"] = "POD Uploaded";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelInvoiceIssued"] = "Invoice";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelPaymentReceived"] = "Payment";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["stepLabelCompleted"] = "Completed";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["driverAssigned"] = "Driver Assigned";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["driverAccepted"] = "Driver Accepted";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["driverOnWayPickup"] = "En Route to Pickup";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["driverArrivedPickup"] = "Arrived at Pickup";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["driverPickedUp"] = "Cargo Picked Up";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["driverInTransit"] = "In Transit";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["driverArrivedDest"] = "Arrived at Destination";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["driverDelivered"] = "Delivered";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["driverCompleted"] = "Completed";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["payViaGateway"] = "Pay via Payment Gateway";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["preparingLink"] = "Preparing payment link…";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["linkFailed"] = "Failed to Create Payment Link";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["retryBtn"] = "Try Again";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["orderNo"] = "Order Number";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["totalBill"] = "Total Bill";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["validUntil"] = "Valid until";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["securedByPaylabs"] = "Payment secured by Paylabs — supports bank transfer, QRIS, e-wallet, and cards.";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["payNow"] = "Pay Now";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["linkReused"] = "Previous payment link is still active and has been reused.";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["linkPending"] = "Payment Link Being Prepared";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["linkPendingDesc"] = "Our team will send a payment link via WhatsApp/Email after the order is confirmed.";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["orderCancelled"] = "Order Cancelled";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["quoteApproved"] = "You have approved this quote";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["quoteProcessingDesc"] = "Our team will process your shipment. Agreed price:";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["quoteYourNotes"] = "Your notes:";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["quoteApprovedAt"] = "Approved at";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["quoteRejected"] = "You rejected this quote";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["quoteRejectedAt"] = "Rejected at";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["quoteRevisionRequested"] = "You requested a revision";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["quoteRevisionAt"] = "Requested at";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["quoteRevisionNotes"] = "Revision notes:";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["searchPlaceholder"] = "Enter order number…";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["trackBtn"] = "Track";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["verifPhoneTitle"] = "Phone Verification";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["verifPhoneDesc"] = "This order is protected. Enter the last 4 digits of your registered phone number.";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["phoneLast4"] = "Last 4 Digits";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["phonePlaceholder"] = "e.g. 4321";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["verifBtn"] = "Verify";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["verifError"] = "Number does not match. Try again.";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["notFound"] = "Order not found";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["notFoundDesc"] = "Please check the order number and try again.";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["backToHome"] = "Back to Home";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["orderInfo"] = "Order Information";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["deliveryRoute"] = "Delivery Route";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["customer"] = "Customer";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["orderDate"] = "Order Date";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["totalAmount"] = "Total";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["invoiceLinks"] = "Invoice & Payment";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["invoiceNo"] = "Invoice No.";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["dueDate"] = "Due Date";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["paymentStatus"] = "Payment Status";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["downloadInvoice"] = "Download Invoice";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["progress"] = "Shipment Progress";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["driverInfo"] = "Driver Info";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["driverStatus"] = "Driver Status";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["podTitle"] = "Proof of Delivery (POD)";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["podReceiver"] = "Receiver";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["podNote"] = "Note";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["podSubmittedAt"] = "Submitted at";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["podMap"] = "View on Map";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["podStreetView"] = "Street View";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["updateHistory"] = "Update History";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["noUpdates"] = "No updates yet";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["pushNotifEnable"] = "Enable Notifications";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["pushNotifDisable"] = "Disable Notifications";
if (!locale["logisticTrackStatus"] || typeof locale["logisticTrackStatus"] !== 'object') locale["logisticTrackStatus"] = {};
locale["logisticTrackStatus"]["refreshBtn"] = "Refresh";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["pageTitle"] = "Order Successfully Created!";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["heroSubGateway"] = "Complete the payment below to confirm your order.";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["heroSubDefault"] = "Our team will contact you shortly for confirmation and final quote.";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["orderNumber"] = "Order Number";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["saveOrderNumber"] = "Save this number to track your order status";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["copyBtn"] = "Copy";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["copySuccess"] = "Copied";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["trackRealtime"] = "Track Order Real-time";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["trackDesc"] = "Status updated automatically — use order number";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["trackNow"] = "Track Now";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["notifAuto"] = "Automatic notifications";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["notifWillSend"] = "will be sent to";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["notifAndWhatsapp"] = "and WhatsApp";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["notifOnChange"] = "when order status changes.";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["estimatedTime"] = "Estimated Delivery Time";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["basedOnType"] = "Based on service type:";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["etaConfirmedByTeam"] = "Actual estimate confirmed by team after review";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["reqDateLabel"] = "Required Date";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["detailShipment"] = "Shipment Details";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["origin"] = "Origin";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["destination"] = "Destination";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["company"] = "Company";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["pic"] = "PIC";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["serviceType"] = "Service Type";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["itemCount"] = "Number of Packages";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["itemCountUnit"] = "packages";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["serviceDetails"] = "Service Details";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["commodity"] = "Goods / Commodity";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["priceFollowUp"] = "Price to follow";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["priceNego"] = "Negotiable price";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["subtotal"] = "Subtotal";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["totalEstimate"] = "Total Estimate";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["estimateNote"] = "This is a price estimate. The final quote will be confirmed by our team.";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["vendorPriceTitle"] = "Price Will Be Provided by Vendor";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["vendorPriceDesc"] = "The vendor will reply to your order with a price quote. Our team will contact you shortly.";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["uploadTransfer"] = "Upload Transfer Proof";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["proofReceived"] = "Payment proof received ✓";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["proofReceivedDesc"] = "Our team will verify your payment shortly.";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["uploadInstruction"] = "Upload a screenshot or photo of your transfer receipt to speed up payment verification.";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["uploading"] = "Uploading…";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["chooseFile"] = "Choose File (JPG/PNG/PDF, max. 10 MB)";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["trackOrder"] = "Track Order";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["seeOtherServices"] = "See Other Services";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["toDashboard"] = "To Dashboard";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["seeServices"] = "See Services";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["orderNotFound"] = "Order data not found.";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["orderFlow"] = "Order Processing Flow";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["stepReceived"] = "Order Received";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["stepReceivedDesc"] = "The system has recorded your order";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["stepReview"] = "Admin Review";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["stepReviewDesc"] = "Our team is verifying the details";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["stepVendor"] = "Vendor Quote";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["stepVendorDesc"] = "Vendor is preparing a price quote";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["stepShipping"] = "In Transit";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["stepShippingDesc"] = "Goods are on their way";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["stepDone"] = "Completed";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["stepDoneDesc"] = "Order fulfilled";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["stepNow"] = "Now";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["etaTruck"] = "1 – 3 working days";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["etaAir"] = "1 – 5 working days";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["etaSea"] = "7 – 21 days (depending on route)";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["etaPpjk"] = "2 – 7 working days";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["etaDefault"] = "3 – 7 working days";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["payViaGateway"] = "Pay via Payment Gateway";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["preparingLink"] = "Preparing payment link…";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["linkFailed"] = "Failed to Create Payment Link";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["retryBtn"] = "Try Again";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["orderNo"] = "Order Number";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["totalBill"] = "Total Bill";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["validUntil"] = "Valid until";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["securedByPaylabs"] = "Payment secured by Paylabs — supports bank transfer, QRIS, e-wallet, and card.";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["payNow"] = "Pay Now";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["linkReused"] = "The previous payment link is still active and has been reused.";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["linkPending"] = "Payment Link Being Prepared";
if (!locale["logisticOrderSuccess"] || typeof locale["logisticOrderSuccess"] !== 'object') locale["logisticOrderSuccess"] = {};
locale["logisticOrderSuccess"]["linkPendingDesc"] = "Our team will send the payment link via WhatsApp/Email after the order is confirmed.";
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
