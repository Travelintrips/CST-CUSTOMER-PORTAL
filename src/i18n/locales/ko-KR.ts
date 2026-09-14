// @refresh reset
// @ts-nocheck
import type { DeepRecord } from "./types";

const locale: DeepRecord = {
  nav: {
    home: '홈',
    products: '제품',
    services: '서비스',
    about: '회사 소개',
    contact: '문의하기',
    trackOrder: '주문 추적',
    calculator: '운임 계산',
    orderProduct: '제품 주문',
    login: '로그인',
    register: '지금 가입',
    dashboard: '대시보드',
    logout: '로그아웃',
    admin: '관리자',
    cart: '장바구니',
    more: '더 보기',
    marketplace: '마켓플레이스',
    hsCode: 'HS 코드 계산기',
    createRequest: '요청 작성',
    request: '요청',
    myShipments: '내 배송',
    documents: '문서',
    invoicePayment: '청구서 & 결제',
    invoice: '청구서',
    companyProfile: '회사 프로필',
    profile: '프로필',
    importTariffCalc: '수입 관세 계산기',
    logisticCostCalc: '물류 비용 계산기',
    myRfqs: '내 RFQ',
    myPurchaseOrders: '내 구매 주문',
    pendingApprovals: '승인 대기',
  },
  navbar: {
    searchPlaceholder: '서비스, 제품 검색…',
    searchBtn: '검색',
    searchSuggestions: '검색 제안',
    searchPopular: '인기',
    searchEnterHint: 'Enter를 눈러 전체 검색',
    searchNoSuggestions: '제안 없음',
    searchPressEnter: '"{query}" 검색하려면 Enter를 누르세요',
    uploadLogoFailed: '로고 업로드 실패',
    kindService: '서비스',
    kindProduct: '제품',
    globalLogisticsPartner: '글로벌 물류 파트너',
    track: '추적',
    order: '주문',
    tariffAndCost: '관세 원 비용',
    navLabel: '내비게이션',
  },
  hero: {
    badge: '기술 기반 통합 물류 솔루션',
    title: '글로벌 물류, 타협 없는 정밀함.',
    description: '신뢰할 수 있는 수출입 및 통관 솔루션 — 안전하고 정시에 귀사 비즈니스를 전 세계와 연결합니다.',
    primaryCta: '서비스 보기',
    secondaryCta: '파트너 되기',
    trusted: '· 500개 이상의 기업이 신뢰합니다',
    scrollDown: '스크롤',
  },
  quickActions: {
    track: '주문 추적',
    calculate: '비용 계산',
    order: '지금 주문',
  },
  stats: {
    countries: '목적지 국가',
    security: '화물 안전',
    shipments: '월별 출하량',
    support: '고객 지원',
  },
  about: {
    label: '회사 소개',
    title: '타의 추종을 불허하는 인프라와 전문성',
    description: '은 인도네시아 기업 및 중소기업의 수출입 수요를 담당하는 신뢰할 수 있는 국제 화물 운송 및 관세사 회사입니다. 공인된 팀과 150개국 이상의 글로벌 대리점 네트워크를 보유하고 있습니다.',
    cta: '합류하기',
    point1: '실시간 엔드투엔드 공급망 가시성',
    point2: '신속한 서류 처리를 위한 면허 보유 통관 전문가',
    point3: '주요 항구 근처의 전략적 창고 시설',
    point4: '기업 고객 전담 어카운트 매니저',
    point5: '클라우드 기반 화물 추적 기술',
  },
  why: {
    label: '우리의 강점',
    title: '왜 물류를 저희에게 맡겨야 하나요?',
    description: '단순히 화물을 운반하는 것을 넘어 — 서류 작성부터 배송까지 전체 화물 여정이 원활하게 진행되도록 보장합니다.',
    card1Title: '신속 통관',
    card1Desc: '전문가가 통관 서류를 신속하게 처리하여 화물이 항구에서 지연되지 않도록 합니다.',
    card2Title: '글로벌 네트워크',
    card2Desc: '150개국 이상의 대리점이 전 세계 어디든 도어 투 도어 배송을 보장합니다.',
    card3Title: '투명한 기술',
    card3Desc: '클라우드 플랫폼으로 언제 어디서나 화물 상태를 완전히 파악할 수 있습니다.',
    card4Title: '화물 보험',
    card4Desc: '모든 출하에 포괄적인 보장을 제공하여 예상치 못한 위험으로부터 사업 투자를 보호합니다.',
    card5Title: '경쟁력 있는 가격',
    card5Desc: '글로벌 항공사 및 선사와 최저 운임을 협상하여 물류 비용을 효율적으로 관리합니다.',
    card6Title: '24/7 지원',
    card6Desc: '고객 서비스팀이 정보 제공이나 긴급 처리가 필요할 때 언제든 도움을 드립니다.',
  },
  cta: {
    title: '글로벌 물류를 가속할 준비가 되셨나요?',
    titleHighlight: '글로벌 물류',
    description: '화물을 맡긴',
    suffix: '저희와 함께하여 차이를 경험하세요.',
    prefix: '수천 개의 기업이',
    primaryBtn: '무료 계정 만들기',
    secondaryBtn: '영업팀 연락',
  },
  contact: {
    label: '문의하기',
    title: '어떻게 도와드릴까요?',
    description: '수출입 서비스, 통관, 창고보관 및 기타 물류 솔루션에 관한 질문에 팀이 답변해 드립니다.',
    sendMessage: '메시지 보내기',
    fullName: '이름',
    email: '이메일',
    company: '회사명',
    serviceNeed: '필요한 서비스',
    message: '메시지',
    submit: '메시지 전송',
    successAlert: '메시지가 전송되었습니다. 담당자가 곧 연락드리겠습니다.',
    addressLabel: '사무소 주소',
    emailLabel: '이메일',
    phoneLabel: '전화번호',
    selectPlaceholder: '서비스 선택...',
    namePlaceholder: '홍길동',
    messagePlaceholder: '물류 요구사항을 알려주세요...',
    companyPlaceholder: '㈜한국물류',
    optExport: '수출',
    optImport: '수입',
    optCustoms: '통관',
    optWarehouse: '창고보관',
    optInternational: '국제운송',
    optOther: '기타',
  },
  footer: {
    quickLinks: '빠른 링크',
    services: '서비스',
    servicesTitle: '당사 서비스',
    contactUs: '문의하기',
    home: '홈',
    portal: '고객 포털',
    customerPortal: '고객 포털',
    seaFreight: '국제 해상 운송',
    airFreight: '항공 화물 대리',
    customsBrokerage: '관세사 서비스',
    domesticDistribution: '국내 배송',
    customs: '관세사',
    domestic: '국내 배송',
    allRights: '모든 권리 보유.',
    tagline: '글로벌 비즈니스를 위한 통합 물류 솔루션.',
    description: '수출입 및 상업 유통을 위한 통합형·기술 기반 물류 솔루션.',
    location: '위치',
    phone: '전화',
    email: '이메일',
    copyright: '모든 권리 보유.',
    waMessage: '안녕하세요, 귀사의 서비스에 대해 문의드리고 싶습니다.',
    track: '주문 추적',
    calculator: '운임 계산',
    about: '회사 소개',
    backToTop: '맨 위로',
  },
  testimonials: {
    label: '고객 후기',
    title: '수백 개 기업의 신뢰',
    desc: '저희 물류 서비스를 경험한 고객들의 실제 후기를 확인하세요.',
    t1Name: 'Budi Santoso',
    t1Role: '운영 이사 · PT. Karya Maju Bersama',
    t1Text: 'B2B Marketplace and Logistic 덕분에 가구 제품을 12개국에 아무 문제 없이 수출할 수 있었습니다. 신속한 통관 처리가 글로벌 비즈니스 방식을 완전히 바꿔 놓았습니다.',
    t2Name: 'Sari Dewi',
    t2Role: '공급망 관리자 · Retailindo Group',
    t2Text: '실시간 추적 플랫폼이 정말 유용합니다. 출발 창고에서 해외 고객에게 도달할 때까지 언제든 화물을 모니터링할 수 있습니다.',
    t3Name: 'Ahmad Fauzi',
    t3Role: '대표이사 · PT. Nusantara Trading Co.',
    t3Text: '팀이 24시간 신속하게 대응합니다. 수입 규정이 갑자기 변경되었을 때도 사업이 원활히 지속될 수 있도록 즉시 최선의 해결책을 마련해 주었습니다.',
  },
  partners: {
    label: '글로벌 운송사 파트너',
    title: '세계 수준의 운송 네트워크',
    desc: '주요 항공사 및 선사와 제휴하여 최저 운임과 최적의 선복을 확보합니다.',
  },
  login: {
    welcomeBack: '다시 오셨군요',
    subtitle: '포털에 접근하려면 자격 증명을 입력하세요',
    sideTitle: '글로벌 화물을 손쉽게 관리하세요.',
    sideDesc: '대시보드에서 주문 추적, 서류 관리, 새 견적 요청을 하세요.',
    sideTrust: '전 세계 1,000개 이상의 기업이 신뢰',
    email: '이메일',
    password: '비밀번호',
    forgotPassword: '비밀번호 찾기',
    signIn: '로그인',
    signingIn: '로그인 중...',
    noAccount: '계정이 없으신가요?',
    createAccount: '계정 만들기',
    loginRequired: '결제를 계속하려면 로그인하세요.',
    devLoginFailed: '개발자 로그인에 실패했습니다.',
    invalidEmail: '이메일 형식이 올바르지 않습니다.',
    otpSendFailed: '코드 전송에 실패했습니다.',
    otpSent: 'OTP 코드가 전송되었습니다.',
    serverError: '서버 연결에 실패했습니다.',
    enterOtp: 'OTP 코드를 입력하세요.',
    otpInvalid: 'OTP 코드가 올바르지 않습니다.',
    enterPhone: '전화번호 / WhatsApp을 입력하세요.',
    otpSentWa: 'OTP가 WhatsApp으로 전송되었습니다.',
    otpSentToWaPrefix: '코드가 WhatsApp으로 전송되었습니다',
    otpLabel: 'OTP 코드 (6자리)',
    authUnavailable: '인증 서비스를 사용할 수 없습니다. 관리자에게 문의하세요.',
    sending: '전송 중...',
    devLoginAs: '{role}로 로그인',
    devLoginBanner: '개발자 로그인 — 개발 모드에서만 표시',
    useOtherPhone: '다른 번호 사용',
    notRegistered: '전화번호가 등록되지 않았습니다.',
    registerNow: '지금 등록',
    phoneFormat: '형식: 081234… 또는 628… 또는 8…',
    emailOrPasswordWrong: '이메일 또는 비밀번호가 올바르지 않습니다.',
    enterEmailFirst: '먼저 이메일을 입력하세요.',
    sendEmailFailed: '비밀번호 재설정 이메일 전송에 실패했습니다.',
    resetEmailSent: '등록된 이메일이라면 재설정 링크가 전송되었습니다.',
    serverErrorRetry: '서버 연결에 실패했습니다. 다시 시도해 주세요.',
    tabEmailOtp: '이메일 OTP',
    tabPhone: '전화번호 / WA',
  },
  register: {
    title: '계정 만들기',
    subtitle: '플랫폼에 가입하여 물류를 손쉽게 관리하세요',
    stepOf: '단계',
    of: '/',
    continueToServices: '서비스 선택으로 계속',
    fullName: '이름',
    emailAddress: '이메일 주소',
    company: '회사명',
    phone: '전화번호',
    password: '비밀번호',
    servicesTitle: '어떤 서비스에 관심이 있으신가요?',
    servicesDesc: '경험을 맞춤화할 수 있도록 해당하는 모든 항목을 선택해 주세요.',
    selected: '선택됨',
    back: '뒤로',
    createAccount: '계정 만들기',
    creatingAccount: '계정 생성 중...',
    alreadyHaveAccount: '이미 계정이 있으신가요?',
    signIn: '로그인',
    redirectToCheckout: '물류 서비스 주문을 계속하려면 계정을 만드세요. 등록 후 결제 페이지로 바로 이동합니다.',
  },
  products: {
    catalogLabel: '제품 카탈로그',
    title: '당사 제품',
    description: '비즈니스 요구에 맞는 다양한 고품질 제품을 찾아보세요.',
    search: '제품 또는 카테고리 검색...',
    all: '전체',
    negotiable: '가격 협의',
    descriptionLabel: '설명',
    quantityLabel: '수량',
    shippingLabel: '배송 / 서비스 선택',
    serviceTab: '서비스',
    courierTab: '택배',
    noShipping: '선택 가능한 옵션 없음',
    subtotal: '소계',
    freight: '운임',
    serviceNote: '+ 서비스 요금은 서비스 페이지에서 계산됩니다',
    proceedOrder: '주문 계속',
    proceedTo: '이동',
    selectShipping: '배송 / 서비스 선택',
    redirectNote: '서비스 상세 페이지로 이동합니다',
    noProducts: '제품 없음',
    noMatches: '검색과 일치하는 제품 없음',
    sold: '100개 이상 판매',
    viewOrder: '보기 및 주문',
    tryOtherKeyword: '다른 키워드를 사용해 보세요.',
    noProductsYet: '아직 제품이 없습니다.',
  },
  jasa: {
    catalogLabel: '서비스 카탈로그',
    title: '서비스',
    search: '서비스 또는 카테고리 검색...',
    all: '전체',
    createOrder: '주문 생성',
    submitService: '신청 제출',
    viewDetail: '상세 보기',
    noMatches: '일치하는 서비스 없음',
    calcCost: '비용 계산기',
    calcButton: '비용 계산',
    customsTitle: '통관 관리 / PPJK',
    importLabel: '수입',
    exportLabel: '수출',
    domesticLabel: '국내',
    backBtn: '뒤로',
    heroTitle1: '물류 솔루션',
    heroTitleAccent: '신뢰받는',
    heroTitle2: '귀사의 비즈니스를 위한',
    heroSubtitle: '수출, 수입, 통관, 국내 배송 — 하나의 통합 플랫폼에서 모두.',
    statActiveClients: '활성 고객',
    statDestinations: '목적지 국가',
    statExperience: '년의 경험',
    modeIndividual: '개별 항목',
    modeIndividualSub: '서비스별 선택',
    modeBulk: '대량 패키지',
    modeBulkSub: '계약 솔루션',
    badgePPJK: '공식 PPJK 라이선스',
    badgePPJKSub: '세관 등록',
    badgeRating: 'Rating 4.9 / 5.0',
    badgeRatingSub: 'From 1,200+ reviews',
    badgeDelivery: 'On-Time Delivery',
    badgeDeliverySub: '98.5% on-time rate',
    badgePPJKMobile: 'PPJK 인가',
    badgeRatingMobile: 'Rating 4.9/5.0',
    badgeDeliveryMobile: 'On-Time 98.5%',
    badgeTimeMobile: 'On-time',
    searchPlaceholder: 'Search services, e.g.: air freight, trucking, customs...',
    searchResultCount: 'vendor services found for',
    breadcrumbServices: '서비스',
    bulkConsultBtn: '무료 상담',
    bulkCtaFreeConsult: '무료 상담, 약정 없음.',
    bulkCtaTeamWill: '저희 팀이 귀사의 물류 요구에 맞는 솔루션 패키지를 제안합니다.',
    bulkDesc: '대규모 수출, 수입 및 유통을 위한 엔드투엔드 계약 물류.',
    bulkFullForwardingDesc: '화물 픽업부터 최종 목적지까지 전체 처리.',
    bulkSeaFreightBundleDesc: '경쟁력 있는 계약 요금의 FCL/LCL 패키지.',
    bulkSubLabel: '계약 솔루션',
    bulkSubmitBtn: '일괄 패키지 신청',
    bulkTitle: '일괄 패키지',
    bulkWarehouseDesc: '고객 요구에 맞춘 창고 보관 및 재포장 서비스.',
    bulkWarehouseTitle: '창고 보관 및 취급',
    categoryNotFound: '서비스 카테고리를 찾을 수 없습니다.',
    categoryServicesCount: '개 서비스',
    categoryVendorCount: '개 공급업체 제안',
    contactUsOffer: '견적을 위해 문의해 주세요.',
    detail: '상세 보기',
    filterAndSort: '필터 및 정렬',
    mulairequest: '요청 시작',
    noVendorOffers: '이 서비스에 대한 공급업체 제안이 아직 없습니다.',
    pickService: '서비스 선택',
    registerAndRequest: '등록 및 요청 제출',
    resetAllFilter: '모든 필터 초기화',
    searchResultsTitle: '검색 결과',
    searchVendorPlaceholder: '공급업체 검색...',
    sortPrice: '가격순 정렬',
    tryChangeFilter: '필터나 검색 키워드를 변경해 보세요.',
    vendorOffers: '공급업체 제안',
    vendorOffersAvailable: '개 공급업체 제안 이용 가능',
    vendorOffersDesc: '이 서비스를 제공하는 등록된 공급업체.',
    allServices: '전체 서비스',
    backToServices: '서비스로 돌아가기',
    breadcrumbHome: '홈',
    noResults: '결과를 찾을 수 없습니다',
    notFoundDesc: '저희 팀이 도움을 드릴 준비가 되어 있습니다. 직접 상담해 주세요.',
    notFoundTitle: '원하는 것을 찾지 못하셨나요?',
    priceNego: '가격 협의 가능',
    vendorBadge: '벤더',
    internalBadge: '내부',
    bulkFullForwardingTitle: 'Full Forwarding',
    bulkSeaFreightBundleTitle: 'Sea Freight Bundle',
    resetFilter: '필터 초기화',
    serviceType: '서비스 유형',
    sortCheapest: '최저가',
    sortDefault: '기본',
    sortMostExpensive: '최고가',
    viewAll: '전체 보기',
  },
  services: {
    catalogLabel: '서비스 카탈로그',
    title: '당사 서비스',
    description: '비즈니스 요구에 맞게 설계된 물류, 통관 및 국제 운송 서비스를 확인하세요.',
    search: '서비스 또는 카테고리 검색...',
    price: '가격',
    negotiable: '가격 협의',
    addToCart: '지금 주문',
    inCart: '다시 추가',
    noServices: '서비스를 찾을 수 없음',
    noResults: '현재 이용 가능한 서비스가 없습니다.',
    tryOther: '다른 키워드를 사용해 보세요.',
    back: '뒤로',
    serviceUnit: '서비스',
    realtimeUpdated: '업데이트됨',
    realtimeLive: '라이브',
    truckingBannerTitle: '트럭킹 차량 직접 예약',
    truckingBannerDesc: '12가지 차량 유형 중 선택하고, 즉시 운임을 확인하고, 필요에 따라 서비스를 추가하세요. 쉽고 투명합니다.',
    truckingBannerCta: '비용 확인 & 예약',
    folderViewContents: '내용 보기',
    folderMore: '더 보기',
    truckingBannerBadge: '트럭킹 예약',
    folderCardDesc: '로컬 및 도시 간 배송을 위한 육상 운송 및 컨테이너 임대 서비스.',
    folderViewAll: '모든 서비스 보기',
    sellingPrice: '판매 가격',
    dialogSub: '필요에 맞는 서비스를 선택하세요',
  },
  dashboard: {
    welcomeBack: '다시 오셨군요',
    overview: '물류 활동 개요입니다.',
    totalOrders: '총 주문',
    activeShipments: '진행 중 출하',
    recentOrders: '최근 주문',
    viewAll: '모두 보기',
    activities: '최근 물류 요청',
    newOrder: '새 주문',
    profileDetails: '프로필 상세',
    company: '회사',
    email: '이메일',
    phone: '전화',
    editProfile: '프로필 편집',
    notProvided: '미제공',
    logisticOrdering: '물류 주문',
    bookDescription: '수출, 수입 및 화물 서비스 예약',
    createOrder: '주문 생성',
    trackOrder: '주문 추적',
    noOrders: '아직 주문 없음',
    noOrdersDesc: '아직 주문을 생성하지 않았습니다.',
    noStatusOrders: '주문 없음',
    noStatusDesc: '다른 상태 필터를 시도해 보세요.',
    showingOrders: '표시 중',
    orders: '건의 주문',
    clearFilter: '필터 초기화',
    selectIcon: '아이콘 선택',
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
    badgeBayar: '결제',
  },
  orders: {
    title: '주문 내역',
    description: '모든 물류 주문 및 출하를 조회하고 추적합니다.',
    search: '주문 번호로 검색...',
    orderDetails: '주문 상세',
    date: '날짜',
    status: '상태',
    amount: '금액',
    allFilter: '전체',
    activeFilter: '진행 중',
    noOrders: '아직 주문 없음',
    noOrdersDesc: '아직 주문을 생성하지 않았습니다.',
    noResults: '결과 없음',
    noResultsDesc: '다른 키워드를 사용해 보세요.',
    cancelOrder: '주문 취소',
    cancelConfirmPrefix: '주문 취소',
    cancelFailed: '주문 취소에 실패했습니다. 다시 시도하세요.',
    activeFilterLabel: '활성 필터:',
    hapusFilter: '필터 초기화',
    type: '유형',
    total: '합계',
    emptyStateMsg: '주문이 여기에 표시됩니다.',
    typeLogistic: '물류',
    typeCrm: '판매 주문',
    typeProduct: '제품',
    myOrders: '내 주문',
    myOrdersDesc: '모든 물류, 제품 및 판매 주문을 한 곳에서.',
  },
  tracking: {
    title: '주문 상태 추적',
    description: '주문 번호를 입력하여 최신 상태를 확인하세요',
    placeholder: '예: LOG-250429-12345',
    search: '검색',
    searching: '검색 중...',
    back: '뒤로',
    notFound: '주문을 찾을 수 없음',
    notFoundDesc: '주문 번호를 다시 확인해 주세요',
    orderNumber: '주문 번호',
    company: '회사',
    pic: '담당자',
    shipmentType: '운송 유형',
    ItemCategory: '품목 카테고리',
    origin: '출발지',
    destination: '목적지',
    createdAt: '생성 날짜',
    subtotal: '소계',
    total: '예상 합계',
    services: '서비스',
    infoTitle: '안내',
    infoDesc: '담당자가 확인 및 최종 가격 제공을 위해 연락드릴 것입니다. 문의 사항은 고객 서비스에 연락하세요.',
    newOrder: '새 주문 생성',
    trackOrder: '주문 추적',
  },
  notFound: {
    title: '404 페이지를 찾을 수 없음',
    description: '찾고 있는 페이지를 사용할 수 없습니다.',
  },
  common: {
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    retry: '재시도',
    close: '닫기',
    draftBannerPre: '미완료 서비스 주문이',
    draftBannerUnit: '건',
    draftBannerPost: '있습니다.',
    draftBannerResume: '주문 재개',
    cancel: '취소',
    save: '저장',
    confirm: '확인',
    back: '뒤로',
    search: '검색',
  },
  servicesMenu: {
    tagline: '귀사 비즈니스에 최적화된 통합 물류 서비스',
    viewAll: '전체 서비스 보기',
    freight: {
      title: '국제 화물 운송',
      desc: '전 세계를 연결하는 국제 항공 및 해상 화물 서비스',
    },
    airFreight: {
      title: '항공 화물 예약',
      desc: '직접 예약 — 과금 중량 계산 및 운임 선택',
    },
    ocean: {
      title: '국제 해상 운송',
      desc: '국제 FCL/LCL 해상 화물 운송 서비스',
    },
    customs: {
      title: '통관 관리 / PPJK',
      desc: '세관 통관, 관세 업무 및 수출입 서류 처리',
    },
    domestic: {
      title: '국내 배송',
      desc: '인도네시아 전역 국내 화물 배송',
    },
    trucking: {
      title: '육상 운송',
      desc: '시내 및 도시 간 전문 육상 운송 서비스',
    },
    tracking: {
      title: '화물 추적',
      desc: '실시간으로 화물 운송 현황 확인',
    },
    groupForwarding: '포워딩',
    groupPpjk: '통관 / 세관 컨설턴트',
    consultant: {
      title: '세관 컨설턴트',
      desc: '통관 절차 상담 및 지원 서비스',
      sub1: '수출입 절차',
      sub2: '수출입 허가',
      sub3: '수입세 계산（관세、부가세 및 소득세）',
    },
    groupForwardingSubtitle: '국제 및 국내 화물 운송',
    groupPpjkSubtitle: '통관 및 수출입 절차 상담',
    seaFreightCard: {
      title: '해상 화물',
      desc: '국제 FCL 및 LCL 해상 운송',
    },
    airFreightCard: {
      title: '항공 화물',
      desc: '전 세계 항공 특급 배송',
    },
    domesticCard: {
      title: '국내 운송',
      desc: '인도네시아 도시 간 및 섬 간 화물 배송',
    },
    customsClearanceCard: {
      title: '통관 서비스',
      desc: '항만 수출입 통관 전 과정 처리',
    },
  },
  homePromo: {
    products: {
      label: '추천 제품',
      title: '귀사 비즈니스를 위한 최고의 제품',
      desc: '물류 운영을 지원하도록 설계된 다양한 고품질 제품을 만나보세요.',
      cta: '전체 제품 보기',
    },
    services: {
      label: '인기 서비스',
      title: '신뢰할 수 있는 물류 서비스',
      desc: '해상 운송부터 관세사 서비스까지 — 수출입 업무를 위한 완전한 솔루션.',
      cta: '전체 서비스 보기',
      item1Title: '화물 운송',
      item1Desc: '150개국 이상을 연결하는 국제 항공 및 해상 운송.',
      item2Title: '통관 관리 / PPJK',
      item2Desc: '세관 통관, 관세 업무 및 수출입 서류 처리.',
      item3Title: '육상 운송',
      item3Desc: '시내 및 도시 간 전문 육상 운송 서비스.',
      item4Title: '국내 배송',
      item4Desc: '인도네시아 전역 국내 화물 배송.',
    },
    promo: {
      label: '프로모션 및 혜택',
      title: '이달의 특별 혜택',
      desc: '물류 수요에 맞는 최저가와 전용 할인 혜택을 받아보세요.',
      cta: '견적 받기',
      item1Title: '해상 운임 15% 할인',
      item1Desc: '동남아시아 해상 항로 특별 할인 적용.',
      item1Badge: '프로모',
      item1Valid: '이달 말까지 유효',
      item2Title: '무료 통관 컨설팅',
      item2Desc: '신규 고객을 위한 무료 세관 서류 컨설팅 제공.',
      item2Badge: '특별',
      item2Valid: '신규 고객 전용',
      item3Title: '번들 할인 패키지',
      item3Desc: '화물 운송＋통관 서비스 결합 시 최대 20% 절감.',
      item3Badge: '할인',
      item3Valid: '최대 20% 절감',
    },
    contact: {
      title: '문의하기',
      desc: '도움이 필요하시거나 상담을 원하시나요? 저희 팀이 물류 업무를 지원해 드립니다.',
      name: '이름',
      email: '이메일 주소',
      phone: '전화번호 / WhatsApp',
      message: '메시지',
      namePlaceholder: '홍길동',
      emailPlaceholder: 'email@company.com',
      phonePlaceholder: '+62 812 3456 7890',
      messagePlaceholder: '물류 요구사항을 알려주세요...',
      submit: '메시지 전송',
      whatsapp: 'WhatsApp 상담',
      call: '지금 전화하기',
      successMsg: '메시지가 전송되었습니다! 담당자가 곧 연락드리겠습니다.',
      info: '연락처 정보',
      infoDesc: '모든 영업일에 서비스를 제공합니다',
    },
  },
  calculator: {
    title: '운임 견적 계산기',
    label: '운임 계산',
    desc: '화물 운임 견적을 즉시 계산하세요',
    disclaimer: '이 견적은 참고용입니다. 최종 가격은 B2B Marketplace and Logistic 팀이 확인합니다.',
    serviceType: '서비스 유형',
    selectService: '서비스 선택...',
    origin: '출발국',
    destination: '목적지국',
    originPlaceholder: '예: 인도네시아',
    destinationPlaceholder: '예: 싱가포르',
    weight: '중량 (kg)',
    weightPlaceholder: '예: 100',
    length: '길이',
    width: '너비',
    height: '높이',
    volume: '부피 (CBM)',
    cargoType: '화물 종류',
    cargoPlaceholder: '예: 전자제품, 섬유류',
    cargoValue: '화물 가치 (인도네시아 루피아)',
    valuePlaceholder: '예: 50000000',
    incoterms: '인코텀즈',
    selectIncoterms: '인코텀즈 선택...',
    insurance: '화물 보험 추가 (+화물 가치의 0.5%)',
    express: '특급 / 우선 처리 (+소계의 20%)',
    calculate: '견적 계산',
    reset: '초기화',
    result: '견적 결과',
    baseCost: '기본 운임',
    weightCost: '중량/부피 운임',
    handlingFee: '취급 수수료',
    customsFee: '통관 수수료',
    insuranceFee: '보험료',
    expressFee: '특급 할증료',
    total: '견적 합계',
    chargeableWeight: '과금 중량',
    cbm: '부피',
    ctaQuote: '공식 견적 요청',
    ctaContact: '관리자 문의',
    ctaSend: '화물 정보 전송',
    projectNote: '프로젝트 화물의 경우, 프로젝트 요구사항에 맞춘 맞춤 견적을 제공해 드리오니 팀으로 문의해 주세요.',
    services: {
      seaFreight: '해상 운송',
      airFreight: '항공 운송',
      customs: '관세사 서비스',
      domestic: '국내 운송',
      warehousing: '창고보관',
      projectCargo: '프로젝트 화물',
    },
    validation: {
      selectService: '먼저 서비스 유형을 선택해 주세요',
      enterWeight: '화물 중량을 입력해 주세요',
      enterDimensions: '화물 치수를 입력해 주세요',
      enterOrigin: '출발국을 입력해 주세요',
      enterDestination: '목적지국을 입력해 주세요',
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
    stepProfileDesc: '프로필 작성',
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
    vendorBadge: '벤더 마켓플레이스',
    vendorPrefix: '인증된',
    vendorHighlight: '벤더',
    vendorSuffix: '쇼케이스',
    vendorDesc: '인증된 벤더의 상품을 탐색하세요. 사양을 비교하고, 재고를 확인하며, 견적 요청을 바로 제출하세요.',
    searchPlaceholder: 'Search products or services...',
    filterAll: 'All Products',
    statusAvailable: 'Available',
    statusLimited: 'Limited',
    statusOutOfStock: 'Out of Stock',
    statusPreOrder: 'Pre-Order',
    noPhoto: 'No photo yet',
    videoBadge: 'Video',
    priceStarts: '가격부터',
    contactUs: '문의하기',
    resetFilter: '모든 필터 초기화',
    serviceCategory: '서비스 카테고리',
    allServices: '모든 서비스',
    filterHint: '항목이 늘어나면 필터가 활성화됩니다',
    requestQuoteBtn: '견적 요청 / 주문',
    statsUnavailable: '통계를 사용할 수 없습니다',
    comparePrices: '가격 비교',
    priceHighToLow: '판매 가격 (높은 순)',
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
    topSupplier: '추천 공급업체',
    expiresNow: '오늘 종료',
    expiresInDays: '{n}일 남음',
    registerAsVendor: '공급업체로 등록',
    viewLogistic: '물류 서비스 보기',
    areYouVendor: '공급업체이신가요?',
    vendorCtaDesc: '비즈니스를 등록하고 오늘부터 B2B 구매자에게 판매하세요.',
    prevPage: '← 이전',
    nextPage: '다음 →',
    pageOf: '{current}/{total} 페이지',
    comingSoon: '곧 출시',
    comingSoonTitle: 'B2B 원자재 마켓플레이스 개발 중',
    comingSoonDesc: '엄선된 공급업체를 연결하여 고품질 수출입 상품을 제공합니다.',
    comingSoonCategories: '곧 출시될 카테고리',
    loadingMobile: '로딩 중...',
    loadingProducts: '상품 로딩 중...',
    resetFiltersCount: '초기화 ({n})',
    noProductsMatch: '일치하는 상품이 없습니다.',
    tryChangeFilters: '필터를 변경하거나 제거하여 더 많은 상품을 확인하세요.',
    comingSoonHeader: '곧 출시 예정',
    comingSoonTitleLine1: 'B2B 원자재 마켓플레이스',
    comingSoonTitleLine2: '개발 중',
    filterLabelStockStatus: '재고 상태',
    filterLabelOrigin: '원산지',
    filterLabelProvince: '주/성',
    filterLabelPrice: '판매 가격',
    filterBtn: '필터',
    clearAllFilters: '모든 필터 초기화',
    replaceCategoryPhoto: '{label} 사진 변경',
    catSub_coffee: '아라비카 & 로부스타',
    catSub_coal: '발전탄 & 점결탄',
    catSub_iron_steel: 'HRC, CRC, 빌릿',
    catSub_palm_oil: 'CPO & PKO',
    catSub_nickel: '광석 & 페로니켈',
    catSub_copper: '전기동 & 동정광',
    catSub_rice: '미디엄 & 프리미엄',
    catSub_sugar: '원당 & 정제당',
    catSub_seafood: '신선 & 냉동',
    catSub_rubber: 'SIR & RSS',
    catSub_live_fish: '그루퍼 & 도미',
    catSub_bird_nest: 'A등급 & 슈퍼',
    catSub_frozen_food: '가공품 & 신선',
    catSub_furniture: '티크 & 마호가니',
    catSub_chemical: '산업용 & 실험실',
    catSub_textile: '원사 & 직물',
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
    fieldServiceType: '서비스 유형',
    fieldRoute: '노선',
    fieldCapacity: '용량',
    fieldTransitTime: '운송 시간',
    fieldMaxLoad: '최대 하중',
    fieldVesselType: '운송 수단',
    fieldCommodity: '상품',
    fieldGrade: '등급 / 품질',
    fieldOrigin: '원산지',
    fieldSize: '크기',
    fieldMoisture: '수분 함량',
    fieldCalorie: '발열량',
    fieldAsh: '회분 함량',
    fieldPackaging: '포장',
    fieldCertification: '인증',
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
    headerTitle: '프로필 작성 완료',
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
    successDesc: '프로필이 저장되었습니다. 환영합니다!',
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
    pageSeoTitle: '수입 관세 계산기 — BM, PPN 및 PPh 제22조 | B2B 물류',
    freightLabel: '운임 (IDR)',
    freightPlaceholder: '예: 5,000,000',
    insuranceLabel: '보험 (%)',
    importerTypeLabel: '수입업자 유형 (제22조 세금)',
    ftaRateLabel: '우대 관세율 (FTA) — 선택',
    calcSpinner: '계산 중…',
    lartasNotes: '비고:',
    lartasRegulator: '규제 기관:',
    lartasPermits: '필요 허가:',
    hsSectionTitle: 'HS Code — BTKI 2022',
    exportCsv: 'CSV 내보내기',
    exportJson: 'JSON 내보내기',
    inputGoodsValueLabel: '물품 가격',
    inputRateUsedLabel: '적용 환율',
    inputDutyScheme: '관세 체계',
    inputNdpbm: 'NDPBM (IDR 기준 CIF 가격)',
    ndpbmLabel: '물품 가격 (NDPBM/CIF)',
    taxDetailTitle: '세금 및 수입 관세 내역',
    tableColComponent: '구성 요소',
    tableColRate: '세율',
    tableColAmount: '금액 (IDR)',
    ftaRateResult: 'FTA 우대 관세율',
    importHelpTitle: '수입 통관 지원이 필요하신가요?',
    cooCertNote: '✓ 수출자의 원산지 증명서 (COO/양식) 필요',
    multiSharedSettings: '공통 설정',
    lartasWarningText: '수입 전 특별 수입 허가가 필요합니다. 저희 PPJK 팀에 문의하세요.',
    prefHideBtn: '숨기기',
    prefShowAllBtn: '모두 보기',
    ftaCooNote: '유효한 원산지 증명서(COO)가 있으면 수입 관세율이 낮아질 수 있습니다:',
    prefMoreItems: '+{n} 더보기',
    importHelpDesc: 'PPJK 팀이 통관, 서류 처리, 정확한 수입 비용 계산을 도와드립니다.',
    importHelpCtaPabean: '세관 상담',
    importerTypeLabelShort: '수입업체 유형',
    ftaSchemeLabelShort: 'FTA 방식',
    multiFreightLabel: '공동 운임 (IDR)',
    multiHsListTitle: 'HS 코드 목록',
    multiAddHsText: 'HS 코드 추가',
    multiTableTitle: '수입세 비교표',
    multiColHs: 'HS 코드 / 레이블',
    multiColValue: '가치 ({currency})',
    multiColTotal: '합계',
  },
  pabean: {
    headerTitle: '통관 관리 / PPJK',
    headerSubtitle: '통관 서비스',
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
    submitting: 'Submitting...',
    submitBtn: 'Submit PPJK Request',
    successMsg: 'PPJK request submitted successfully! Our team will contact you shortly.',
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
    svc1Title: '수입 규정 컸설팅',
    svc1Desc: 'In-depth consultation on customs regulations and requirements for import activities',
    svc2Title: '수출 규정 컸설팅',
    svc2Desc: 'In-depth consultation on customs regulations and requirements for export activities',
    svc3Title: '수출입 허가 컸설팅',
    svc3Desc: 'Consultation on licensing processes, NIB, API, and legal documents for import/export activities',
    svc4Title: '수입 세무 컸설팅',
    svc4Desc: 'Consultation on import VAT, income tax Article 22, import duties, and tax obligations related to importation',
    svc1ConsultPlaceholder: 'Briefly describe the import regulation issue or question you want to consult about...',
    svc2ConsultPlaceholder: 'Briefly describe the export regulation issue or question you want to consult about...',
    svc3ConsultPlaceholder: 'E.g., API-U licensing process, NIB for import, or export permit requirements for specific products...',
    svc4ConsultPlaceholder: 'E.g., import VAT calculation, income tax Article 22 rates, HS Code and import duties, or KITE/KAHA fiscal facilities...',
    dropHint: '클릭하거나 파일을 여기에 드롭',
    dropHere: '놓아 업로드',
    uploadSuccess: '업로드 성공 ✓',
    uploadFailed: '업로드 실패',
    serverResponseInvalid: 'Invalid server response',
    connectionFailed: 'Connection failed during upload',
    missingService: 'Service type',
    uploadingProgress: 'Uploading...',
    fileFormatError: 'Unsupported format (.{ext}). Use PDF, JPG, PNG, DOC, or DOCX.',
    fileSizeError: 'File too large ({size} MB). Max 10 MB.',
    pageTitle: '세관 관리 / PPJK',
    sectionTitle: '세관 서비스',
    consultTitle: 'PPJK 상담 유형 선택',
    uploadDocTitle: '지원 문서 업로드(선택 사항)',
    submittingBtn: '제출 중...',
    costTbd: '1×24 근무 시간 내에 확인됩니다',
    toastSuccess: '신청이 제출되었습니다! 저희 팀이 최대한 빨리 연락드리겠습니다.',
    toastError: '신청 제출 실패',
    dataFromProfile: '데이터는 귀하의 계정 프로필에서 가져왔습니다.',
    notesPlaceholder: '기타 정보(선택 사항)',
    namePic: '연락처 이름',
    companyName: '회사 이름',
    email: '이메일',
    phone: '전화 / WhatsApp',
    serviceSummary: '선택한 서비스',
    emailLabel: '이메일',
    phoneLabel: '전화 / WhatsApp',
    uploadLogoTitle: '로고 업로드',
    removeLogoTitle: '로고 삭제',
    hoverUploadHint: '아이콘 위에 마우스를 올리세요 → 로고 업로드',
  },
  customClearance: {
    headerTitle: '통관 프로세스',
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
    svc1Title: 'PIB/PEB 서류 준비',
    svc1Desc: 'Complete processing and preparation of Customs Import Declaration (PIB) or Customs Export Declaration (PEB) documents',
    svc1Badge: '1–2 business days',
    svc2Title: '통관 핸들링',
    svc2Desc: 'Physical handling of customs process at the port: inspection coordination, import duty & tax payment, through to goods release from customs area',
    svc2Badge: '1–3 business days',
    svc3Title: '수출입 언더네임',
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
    pageTitle: '통관 절차',
    pageSubtitle: '공식 세관 관리 — 인증 PPJK',
    submittingBtn: '제출 중...',
    costTbd: '1×24 근무 시간 내에 확인됩니다',
    toastSuccess: '통관 신청이 제출되었습니다! 저희 팀이 최대한 빨리 연락드리겠습니다.',
    toastError: '신청 제출 실패',
    dataFromProfile: '데이터는 귀하의 계정 프로필에서 가져왔습니다.',
    notesPlaceholder: '기타 정보(선택 사항)',
    namePic: '연락처 이름',
    companyName: '회사 이름',
    email: '이메일',
    phone: '전화 / WhatsApp',
    emailLabel: '이메일',
    phoneLabel: '전화 / WhatsApp',
    labelExchangeRate: '환율 {currency} → IDR',
    labelValue: '가치',
    valueCifLabel: '{type} 가치(동등 IDR)',
    handlingLaneLabel: '통관 — 통로',
    undernamCountryLabel: '대리 수입 — 국가',
    phGoods1: '예: 생산 기계, 의류, 전자 제품...',
    phHsCode: '예: 8477.80.00',
    phValueNumber: '예: 15000',
    phExchangeRate: '예: 15900',
    phWeight: '예: 500',
    phCountry1: '예: 중국, 미국, 일본...',
    phSpecialNotesPib: '예: 특별 수입 면허 필요, 세금 감면, 민감한 상품 등',
    phGoods2: '예: 부품, 섬유, 화학 제품...',
    phPibPebDocNum: 'PIB/PEB 문서 번호',
    phSpecialNotesHc: '예: 상품에 특별 제한이 있으며, 창고 조정 필요...',
    phGoods3: '예: 기계, 원자재, 소비재...',
    phValueNumber2: '예: 20000',
    phWeight2: '예: 1000',
    phCountry2: '예: 중국, 독일, 미국...',
    phSpecialNotesUn: '예: 회사가 아직 API 면허를 취득하지 않았으며, NIB 등록 진행 중 등',
  },
  importCalculator: {
    title: '수입 관세 계산기',
    subtitle: 'Calculate Import Duty (BM), Import VAT, and Income Tax Art. 22 based on BTKI 2022. Multi-currency, live JISDOR BI rates, FTA rates, auto-calculation.',
    breadcrumbHome: '홈',
    tabSingle: '단일 계산',
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
    resultTitle: '계산 결과',
    resultNdpbm: 'NDPBM (CIF IDR)',
    resultBM: '수입관세',
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
    hcArahImpor: '수입',
    hcArahEkspor: '수출',
    jasaHandlingLabel: '통관 처리 서비스',
    hcLaneLabel: '통관 구분',
    hcFeeNote: '* 수입 관세 및 세금 미포함. 최종 가격은 담당 팀이 확인합니다.',
    docPibPeb: 'PIB/PEB 서류',
    docAwbBl: 'AWB / 선하증권',
    docCommercialInvoice: '상업 송장',
    docPackingList: '포장 명세서',
    docCoo: 'COO / 원산지 증명서',
    docLsLartas: 'LS / 수입 허가서',
    docInvoicePackingList: '송장 및 포장 명세서',
    docLsJikaAda: 'LS / 수입 허가서 (있는 경우)',
    docNpwp: '법인 세금번호 (NPWP)',
    docNib: 'NIB / 법인 정관',
    docLainnya: '기타 서류',
    contactCtaDesc: 'Need help with customs clearance, PIB/PEB, or import undername?',
  },
  mktCard: {
    statusOnOrder: 'Available on Inquiry',
    expiresExpired: 'Expires today',
    expiresInDays: '{days}d left',
    priceOnRequest: 'Price on Request',
    requestQuotation: 'Request Quotation',
    shareProduct: 'Share product',
    removeFromCompare: 'Remove from comparison',
    maxCompareItems: 'Max 4 items',
    compare: 'Compare',
    sellPrice: '판매가격',
    description: '설명',
    specifications: '사양',
    originLabel: 'Origin',
    locationLabel: 'Location',
    leadTimeLabel: 'Lead Time',
    moqNego: 'MOQ: Negotiable',
    moqOnRequest: 'Upon Request',
    topSupplier: 'Top Supplier',
    filterAllOption: '전체',
    noPhotoYet: '사진 없음',
    moqLabel: 'MOQ:',
    priceOnRequestDialog: '가격 문의',
    customClearance: {
      headerTitle: '통관 절차',
      headerSubtitle: '공식 통관 — 인증된 PPJK',
      infoBannerTitle: '공식 PPJK의 완벽한 통관 서비스',
      infoBannerDesc: 'PIB/PEB 문서 준비, 항구에서의 물리적 처리, 수출입 라이센스가 없는 회사에 대한 대명 서비스 등 전체 통관 프로세스를 처리합니다.',
      step1Title: '서비스 유형 선택',
      step1Subtitle: '필요한 서비스를 하나 이상 선택하세요',
      step2Title: '선택한 서비스 세부정보',
      step3Title: '요청자 / PIC 정보',
      step4Title: '요약 및 요청 제출',
      selectedLabel: '선택됨:',
      activityType: '활동 유형',
      importActivity: '수입 (PIB)',
      exportActivity: '수출 (PEB)',
      clearanceImport: '수입 통관',
      clearanceExport: '수출 통관',
      underNameImport: '대명 수입',
      underNameExport: '대명 수출',
      goodsType: '상품 유형 / 이름',
      hsCode: 'HS 코드 (알려진 경우)',
      cifValue: 'CIF 가치',
      fobValue: 'FOB 가치',
      exchangeRate: '{currency} → IDR 환율',
      importDutyRate: '수입 관세율 (%)',
      goodsWeight: '상품 무게 (kg)',
      destinationPort: '목적지 항구',
      loadingPort: '적재 항구',
      originCountry: '원산지 국가',
      destinationCountry: '목적지 국가',
      pibPebDocNum: 'PIB / PEB 번호 (사용 가능한 경우)',
      customsLane: '세관 통로',
      portAirport: '항구 / 공항',
      specialInstructions: '비고 / 특별 지침',
      underNameType: '대명 유형',
      underNameReason: '대명 사용 사유',
      estimatedCost: '예상 비용',
      estimatedLabel: '총 예상',
      indicativeNote: '*지표',
      confirmedWithinHours: '1 영업일 이내에 확인됨',
      costNote: '서비스 요금은 지표이며, 문서 및 상품 유형 확인 후 PPJK 팀에서 확인합니다. 팀이 1 영업일 이내에 연락드릴 것입니다.',
      submitting: '신청 제출 중...',
      submitBtn: '통관 신청 제출',
      successMsg: '통관 신청이 성공적으로 제출되었습니다! 저희 팀이 최대한 빨리 연락드리겠습니다.',
      errorMsg: '요청 제출 실패',
      profileAutoFilled: '귀하의 계정 프로필에서 데이터가 검색되었습니다.',
      loginToUpload: '문서를 업로드하려면 로그인하세요',
      uploadDocs: '지원 문서 업로드',
      uploadDocsCompany: '귀하의 회사 문서',
      calculating: '예상 계산 중...',
      enterValueToCalc: '수입 관세 추정을 보려면 위에 {type} 값을 입력하세요.',
      enterValueToCalcUndername: '자동 비용 추정을 보려면 {type} 값을 입력하세요',
      beaMasuk: '수입 관세',
      ppnImpor: '수입 부가세',
      pphPasal22Api: '소득세 제22조 (API 포함)',
      pphPasal22NonApi: '소득세 제22조 (API 미포함)',
      subTotalPajak: '세금 및 관세 소계',
      serviceDocFee: 'PIB/PEB 문서 서비스 요금',
      serviceUndernameFee: '대명 {direction} 서비스 요금',
      freeRate: '0% — 면세 (ASEAN / FTA)',
      laneUnknown: '미확인',
      laneGreen: '그린 레인 — 물리적 검사 없음',
      laneRed: '레드 레인 — 물리적 검사 포함',
      handlingServiceDesc: '이 서비스에는 세관 당국과의 조정, 수입 관세 및 세금 납부, 물리적 검사 조정 (레드 레인), 그리고 귀하의 창고로의 상품 인도가 포함됩니다.',
      pibPebProcessNote: '모든 데이터와 문서가 수신된 후 PPJK 팀이 PIB/PEB 문서 준비를 처리합니다. 서비스 요금은 1 영업일 이내에 확인됩니다.',
      underNameServiceNote: '대명 서비스 요금에는 API/NIK 사용, 문서 처리 및 세관 처리 비용이 포함됩니다. 상품 유형 및 거래 가치를 기준으로 팀에서 확인합니다.',
      underNameInfoDesc: '저희 회사의 공식 API / NIK를 사용하여 수출입 시설을 제공합니다. 자체 수출입 라이센스가 없는 회사에 적합합니다.',
      picName: 'PIC 이름',
      companyNameLabel: '회사 이름',
      additionalNotes: '추가 비고',
      additionalNotesPlaceholder: '팀을 위한 추가 정보 (선택 사항)',
      fullNamePlaceholder: '전체 이름',
      emailPlaceholder: 'email@company.com',
      phonePlaceholder: '+62 8xx xxxx xxxx',
      companyPlaceholder: '회사 이름',
      svc1Title: 'PIB / PEB 문서 준비',
      svc1Desc: '통관 수입 신고서 (PIB) 또는 통관 수출 신고서 (PEB) 문서의 완전한 처리 및 준비',
      svc1Badge: '1–2 영업일',
      svc2Title: '통관 처리',
      svc2Desc: '항구에서의 통관 프로세스의 물리적 처리: 검사 조정, 수입 관세 및 세금 납부, 세관 구역에서의 상품 인도',
      svc2Badge: '1–3 영업일',
      svc3Title: '수입 / 수출 대명',
      svc3Desc: '저희 회사 이름 및 라이센스 (API/NIK)를 사용한 수입 또는 수출 서비스 — 자체 수출입 라이센스가 없는 회사에 대한 솔루션',
      svc3Badge: '필요에 따라',
      dropHint: '파일을 여기에 클릭하거나 드래그하세요',
      dropHere: '위에 놓아 업로드하세요',
      uploadSuccess: '업로드 성공 ✓',
      uploadFailed: '업로드 실패',
      serverResponseInvalid: '잘못된 서버 응답',
      connectionFailed: '업로드 중 연결 실패',
      missingService: '서비스 유형',
      serviceSelected: '선택된 서비스',
      goodsInfo: 'PIB/PEB — 상품',
      fileFormatError: '지원되지 않는 형식 (.{ext}). PDF, JPG, PNG, DOC 또는 DOCX를 사용하세요.',
      fileSizeError: '파일이 너무 큽니다 ({size} MB). 최대 10 MB.',
    },
    importCalculator: {
      title: '수입 관세 계산기',
      subtitle: 'BTKI 2022를 기반으로 수입 관세(BM), 수입 부가세 및 소득세 제22조를 계산합니다. 다중 통화, 실시간 JISDOR BI 환율, FTA 환율, 자동 계산.',
      breadcrumbHome: '홈',
      tabSingle: '단일 계산',
      tabMulti: '다중 HS 코드 비교',
      badgeNew: '새로움',
      searchHsCode: 'HS 코드 또는 제품 이름 검색…',
      hsPlaceholder: 'HS 코드 또는 제품 이름 입력…',
      hsNotFound: '찾을 수 없습니다. 다른 키워드를 시도하세요.',
      goodsValueSection: '상품 가치 및 통화',
      currencyLabel: '통화',
      goodsValueLabel: '상품 가치 ({currency} 기준)',
      convertToIdr: 'IDR로 변환',
      rateUsed: '사용된 환율',
      incotermSection: '인코텀',
      incotermOptional: '(선택 사항, 기본 CIF)',
      freightLabel: '운송 비용 (IDR)',
      insuranceLabel: '보험 (%)',
      taxOptionsSection: '세금 및 우대 옵션',
      apiImporterLabel: '등록된 수입업체 (API)',
      apiImporterHint: '귀사의 회사가 API를 보유하고 있는지 확인하세요. 소득세 제22조 세율에 영향을 미칩니다.',
      preferentialLabel: 'FTA 우대 제도',
      preferentialDesc: '자유무역협정에 따른 수입 관세율',
      availablePreferential: '사용 가능한 우대 세율',
      noPreferential: '이 FTA에 대한 우대 세율이 없습니다',
      resultTitle: '계산 결과',
      resultNdpbm: 'NDPBM (CIF IDR)',
      resultBM: '수입 관세',
      resultPPN: '수입 부가세',
      resultPPnBM: '사치품세',
      resultPPh: '소득세 제22조',
      resultTotal: '총 징수',
      resultDDP: '총 DDP (예상)',
      resultEffective: '유효 세율',
      lartasTitle: 'LARTAS — 제한/금지 품목',
      lartasWarning: '이 품목은 수입 제한 대상입니다.',
      noLartas: '✓ LARTAS 무료',
      btkiLink: 'BTKI 세부정보',
      inswLink: 'INSW 확인',
      exportCSV: 'CSV 내보내기',
      exportJSON: 'JSON 내보내기',
      loadingRates: '최신 환율을 가져오는 중…',
      rateJisdor: 'JISDOR BI — 실시간',
      rateLive: '실시간 환율',
      rateEstimate: '예상 환율',
      updatedAt: '업데이트됨',
      emptyResult: 'HS 코드를 선택하고 상품 가치를 입력하여 자동 계산 결과를 확인하세요',
      multiAddItem: 'HS 코드 추가',
      multiCalculate: '모두 계산',
      multiCalculating: '계산 중…',
      multiRemove: '제거',
      multiLabel: '라벨',
      multiGoodsValue: '상품 가치',
      multiError: '오류',
      multiResultTitle: '비교 결과',
      multiExportCSV: '다중 CSV 내보내기',
      incotermFreightNote: '별도의 운송 입력이 필요합니다',
      incotermInsuranceNote: '별도의 보험 입력이 필요합니다',
      incotermFullNote: '전체 운송 입력이 필요합니다',
      incotermCifNote: '가치는 이미 운송 및 보험을 포함합니다',
      contactCta: '상담 및 주문',
      contactCtaDesc: '통관, PIB/PEB 또는 수입 대행에 도움이 필요하신가요?',
    },
    mktCard: {
      statusOnOrder: '견적 요청 가능',
      expiresExpired: '오늘 만료',
      expiresInDays: '{days}일 남음',
      priceOnRequest: '가격 면담',
      requestQuotation: '견적 요청',
      shareProduct: '제품 공유',
      removeFromCompare: '비교에서 제거',
      maxCompareItems: '최대 4개 항목',
      compare: '비교',
      sellPrice: '판매가',
      description: '설명',
      specifications: '사양',
      originLabel: '원산지',
      locationLabel: '위치',
      leadTimeLabel: '리드 타임',
      moqNego: 'MOQ: 협상 가능',
      moqOnRequest: '요청 시',
      topSupplier: '최고 공급업체',
      filterAllOption: '전체',
      noPhotoYet: '사진 없음',
      moqLabel: 'MOQ:',
      priceOnRequestDialog: '가격 면담',
    },
    pabean: {
      headerTitle: '통관 관리 / PPJK',
      headerSubtitle: '세관 서비스',
      step1Title: 'PPJK 상담 서비스 선택',
      step1Subtitle: '필요한 서비스 중 하나 이상 선택',
      step2Title: '선택한 서비스 상세',
      step3Title: '신청인 정보',
      step4Title: '요약 및 제출',
      selectedLabel: '선택됨：',
      serviceLabel: '서비스',
      estimatedCost: '예상 비용',
      confirmedAfterDoc: '문서 검토 후 확인',
      costNote: '비용 추정치는 참고용입니다. 최종 비용은 문서 검증 후 저희 PPJK 팀이 확인합니다. 저희 팀이 1영업일 이내에 연락드릴 것입니다.',
      submitting: '제출 중...',
      submitBtn: 'PPJK 신청 제출',
      successMsg: 'PPJK 신청이 성공적으로 제출되었습니다! 저희 팀이 최대한 빨리 연락드리겠습니다.',
      errorMsg: '신청 제출 실패',
      profileAutoFilled: '귀하의 계정 프로필에서 데이터가 가져와졌습니다. 전화번호만 변경할 수 있습니다.',
      loginToUpload: '로그인 후 파일을 업로드해 주세요',
      uploadOptional: '관련 파일 업로드 (선택 사항)',
      consultDetail: '상담 주제 *',
      consultConfirm: '상담 비용은 저희 PPJK 팀이 확인합니다. 제출 후 곧 연락드릴 것입니다.',
      perijinanConsultDetail: '허가 유형 / 상담 주제 *',
      picName: '연락처 이름',
      companyNameLabel: '회사 이름',
      additionalNotes: '추가 설명',
      additionalNotesPlaceholder: '저희 팀을 위한 추가 정보 (선택 사항)',
      fullNamePlaceholder: '전체 이름',
      emailPlaceholder: 'email@company.com',
      phonePlaceholder: '+62 8xx xxxx xxxx',
      companyPlaceholder: '회사 이름',
      svc1Title: '수입 규정 상담',
      svc1Desc: '수입 활동에 대한 세관 규정 및 요건에 대한 심층 상담',
      svc2Title: '수출 규정 상담',
      svc2Desc: '수출 활동에 대한 세관 규정 및 요건에 대한 심층 상담',
      svc3Title: '수출입 면허 상담',
      svc3Desc: '수출입 활동을 위한 면허 절차, NIB, API 및 법적 문서에 대한 상담',
      svc4Title: '수입 세무 상담',
      svc4Desc: '수입 VAT, 소득세 제22조, 수입세 및 수입 관련 세무 의무에 대한 상담',
      svc1ConsultPlaceholder: '상담하고 싶은 수입 규정 문제 또는 질문을 간단히 설명해 주세요...',
      svc2ConsultPlaceholder: '상담하고 싶은 수출 규정 문제 또는 질문을 간단히 설명해 주세요...',
      svc3ConsultPlaceholder: '예: API-U 면허 절차, 수입을 위한 NIB, 특정 제품의 수출 허가 요건...',
      svc4ConsultPlaceholder: '예: 수입 VAT 계산, 소득세 제22조 세율, HS 코드 및 수입세, 또는 KITE/KAHA 세제 혜택...',
      dropHint: '여기에 파일을 클릭하거나 드래그하세요',
      dropHere: '위에 놓아 업로드',
      uploadSuccess: '업로드 성공 ✓',
      uploadFailed: '업로드 실패',
      serverResponseInvalid: '잘못된 서버 응답',
      connectionFailed: '업로드 중 연결 실패',
      missingService: '서비스 유형',
      uploadingProgress: '업로드 중...',
      fileFormatError: '지원되지 않는 형식 (.{ext}). PDF, JPG, PNG, DOC 또는 DOCX를 사용하세요.',
      fileSizeError: '파일이 너무 큽니다 ({size} MB). 최대 10 MB.',
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
    cargoCatGeneral: '일반화물',
    cargoCatFragile: '파손주의',
    cargoCatDG: '위험물 (DG)',
    cargoCatSpecial: '특별 취급 필요',
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
    errorSelectVendor: '최소 하나의 공급업체를 선택해 주세요.',
    errorSelectVendorFirst: '먼저 공급업체를 선택해 주세요.',
    errorFillPrice: '고객 판매 가격을 입력해야 합니다.',
    successOrderConfirmed: '주문이 확인되었습니다. WhatsApp이 고객에게 자동으로 전송되었습니다.',
    fulfillmentNote: '다음 단계: 관리자에게 WhatsApp으로 전송된 이행 확인 링크를 여세요.',
    basePrice: '기본 가격',
    routeLabel: '경로',
    noWa: 'WhatsApp 없음',
  },
  airFreight: {
    back: '뒤로',
    backToHome: '홈으로 돌아가기',
    navTitle: '항공 화물',
    navBrand: 'CST Logistics',
    heroTitle: '항공 화물 예약',
    heroHint: '화물 세부 정보와 항공 경로를 입력하세요',
    sectionRoute: '항공 경로',
    originCity: '출발 도시',
    originAirport: '출발 공항 코드',
    destCity: '도착 도시',
    destAirport: '도착 공항 코드',
    cargoTypeLabel: '화물 유형',
    sectionCargo: '화물 세부 정보',
    commodityLabel: '품목',
    commodityPlaceholder: '예: 전자제품, 섬유, 식품...',
    dimensionLabel: '크기 및 무게 (상자당)',
    addKoli: '상자 추가',
    calcEstimate: '견적 계산',
    sectionRate: '요금 옵션',
    noRateMsg: '이 경로에 사용 가능한 요금이 없습니다. 담당자가 최상의 제안으로 연락드리겠습니다.',
    routeDirect: '직항',
    routeTransit: '경유',
    dayUnit: '일',
    estimateTotal: '예상 합계',
    rateSelected: '요금 선택됨',
    sectionSchedule: '일정',
    pickupDate: '픽업 날짜',
    flightDate: '희망 비행 날짜',
    arrivalDate: '목표 도착 날짜',
    sectionAddons: '추가 서비스',
    addonsSelected: '{count}개의 서비스 선택됨',
    sectionContact: '연락처 정보',
    fullName: '성명',
    companyName: '회사명',
    whatsapp: 'WhatsApp',
    notes: '메모',
    notesPh: '팀을 위한 추가 정보...',
    summaryTitle: '예약 요약',
    summaryRoute: '경로',
    summaryService: '서비스',
    summaryIncoterm: '인코텀즈',
    summaryChargeable: '청구 중량',
    summaryRate: '항공사',
    summaryEstimate: '예상 가격',
    summaryAddons: '추가 서비스',
    serviceUnit: '개',
    selectRateHint: '최종 가격 예상을 보려면 위에서 요금을 선택하세요.',
    requestQuote: '견적 요청 보내기',
    requestHint: '담당자가 24시간 이내에 확인 및 최종 견적을 위해 연락드리겠습니다.',
    successTitle: '요청이 전송되었습니다!',
    successDesc: '담당자가 곧 배송 세부 정보 확인을 위해 연락드리겠습니다.',
    orderNoLabel: '주문 번호',
    trackOrder: '주문 추적',
    validationAirport: '출발 및 도착 공항 코드가 필요합니다',
    validationWeight: '먼저 화물 무게를 입력해 주세요',
    validationNoRate: '사용 가능한 요금이 없지만 요청을 보낼 수 있습니다',
    validationEstimateFail: '요금 견적을 가져오지 못했습니다',
    validationName: '성명은 필수입니다',
    validationPhone: 'WhatsApp 번호는 필수입니다',
    validationCommodity: '품목은 필수입니다',
    validationWeightFill: '제출 전에 화물 무게를 입력해 주세요',
    validationSuccess: '항공 화물 요청이 성공적으로 전송되었습니다!',
    validationSubmitFail: '항공 화물 요청을 전송하지 못했습니다',
  },

  airFreightTrack: {
    pageTitle: '항공 화물 추적',
    awbNumber: 'AWB 번호',
    flightInfo: '항공편 정보',
    origin: '출발지',
    destination: '목적지',
    status: '상태',
    noTracking: '추적 데이터를 찾을 수 없습니다',
    trackBtn: '추적',
    searchPlaceholder: 'AWB 번호 입력...',
  },
  approvePage: {
    pageTitle: '견적 승인',
    vendorSelected: '선택된 공급업체',
    vendorPrice: '공급업체 가격',
    markup: '마크업',
    approve: '승인',
    revision: '수정',
    reject: '거절',
    provideResponse: '답변을 입력해 주세요:',
    statusUpdated: '배송 상태가 업데이트되었습니다',
    updating: '업데이트 중...',
    deliveryTimeline: '배송 일정',
  },
  confirmPage: {
    pageTitle: '주문 확인',
    customerName: '고객명',
    shipmentType: '배송 유형',
    unitType: '단위 유형',
    notes: '비고',
    confirmBtn: '확인',
    cancelBtn: '취소',
    successMsg: '판매 주문이 시스템에 의해 자동으로 생성됩니다. 담당자가 곧 연락드릴 것입니다.',
    errorMsg: '오류가 발생했습니다',
  },
  freightForwarding: {
    directionTitle: '배송 방향 선택',
    directionSubtitle: '필요한 배송 유형을 지정해 주세요',
    modeTitle: '배송 수단 선택',
    modeSubtitle: '가장 적합한 운송 수단을 선택해 주세요',
    variantTitle: '서비스 유형 선택',
    variantSubtitle: '출발지에서 목적지까지 배송 경로를 지정해 주세요',
    formTitle: '배송 및 서류 세부정보',
    formSubtitle: '배송 세부정보를 입력하고 필요한 서류를 업로드해 주세요',
    senderData: '발송인 정보',
    senderName: '발송인 이름',
    senderAddress: '발송인 전체 주소',
    receiverData: '수취인 정보',
    receiverName: '수취인 이름',
    receiverAddress: '수취인 전체 주소',
    goodsData: '화물 정보',
    commodityName: '화물/상품명',
    goodsCategory: '화물 분류',
    dgWarning: '위험물은 MSDS/SDS 및 COA 서류를 첨부해야 합니다.',
    cargoDetail: '화물 품목 세부정보',
    grossWeight: '총중량 (kg)',
    kolliCount: '수량',
    dimensions: '치수 (cm)',
    totalVolume: '총 부피',
    totalGrossWeight: '총 총중량',
    estimationTitle: '총 견적',
    backToServices: '서비스로 돌아가기',
    back: '뒤로',
    addItem: '품목 추가',
    uploadInvoice: '인보이스 서류',
    uploadPackingList: '패킹 리스트 서류',
    uploadMsds: 'MSDS/SDS 서류',
    uploadCoa: 'COA 서류',
    contactInfo: '연락처 정보 (담당자)',
    contactName: '담당자 전체 이름',
    contactPhone: 'WhatsApp / 전화번호',
    contactEmail: '담당자 이메일',
    submitOrder: '주문 제출',
    orderSuccess: '주문이 성공적으로 생성되었습니다!',
    export: '수출',
    import: '수입',
    domestic: '국내',
    air: '항공',
    sea: '해상',
    road: '육상',
    selectDirection: '먼저 배송 방향을 선택해 주세요',
    errorRequired: '데이터가 불완전합니다. 양식을 다시 확인해 주세요.',
  },
  logisticTrack: {
    pageTitle: '물류 주문 추적',
    trackingId: '추적 ID',
    status: '상태',
    stepPickup: '픽업',
    stepInTransit: '운송 중',
    stepDelivered: '배달 완료',
    stepPending: '대기 중',
    noTracking: '추적 데이터를 찾을 수 없습니다',
    lastUpdate: '마지막 업데이트',
    estimatedArrival: '예상 도착',
    contactSupport: '주문에 관한 문의 사항이 있으시면 팀에 연락해 주세요.',
    labelPickup: '픽업 프로세스',
    labelInTransit: '운송 중',
    labelDelivered: '배달 완료',
    labelAtWarehouse: '창고에 있음',
  },
  mktMyRfqs: {
    pageTitle: '나의 RFQ',
    pageDesc: '모든 견적 요청 모니터링',
    searchPlaceholder: 'RFQ, 제품, 공급업체 검색…',
    allStatus: '모든 상태',
    allDates: '모든 날짜',
    emptyRfq: 'RFQ가 없습니다.',
    noMatchingRfq: '일치하는 RFQ가 없습니다.',
    colRfqNo: 'RFQ 번호',
    colProduct: '제품',
    colVendor: '공급업체',
    colStatus: '상태',
    colDate: '날짜',
    statusOpen: '열림',
    statusPending: '대기 중',
    statusQuoted: '견적 완료',
    statusAccepted: '수락됨',
    statusRejected: '거절됨',
    statusExpired: '만료됨',
    viewDetail: '상세 보기',
    createRfq: '새 RFQ 만들기',
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
    submitSuccess: 'RFQ가 제출되었습니다',
    cancelSuccess: 'RFQ가 취소되었습니다',
  
    submitErrorFallback: 'RFQ 제출에 실패했습니다',
    cancelErrorFallback: 'RFQ 취소에 실패했습니다',
  },
  mktPurchaseOrders: {
    pageTitle: '나의 구매 주문',
    pageDesc: '마켓플레이스 PO 상태 모니터링',
    viewRfqs: '나의 RFQ 보기',
    searchPlaceholder: 'PO 번호, RFQ, 공급업체 검색…',
    filterLabel: '필터:',
    allStatus: '모든 상태',
    allVendors: '모든 공급업체',
    allDates: '모든 날짜',
    last7Days: '최근 7일',
    last30Days: '최근 30일',
    last90Days: '최근 90일',
    fetchError: '구매 주문 로드 실패.',
    retry: '다시 시도',
    emptyPo: '구매 주문이 없습니다.',
    noMatchingPo: '필터에 일치하는 PO가 없습니다.',
    resetFilter: '필터 초기화',
    colPoNumber: 'PO 번호',
    colVendor: '공급업체',
    colStatus: '상태',
    colEstCompletion: '예상 완료',
    colCreatedAt: '생성일',
    statusPending: '대기 중',
    statusDraft: '초안',
    statusIssued: '발행됨',
    statusVendorAccepted: '공급업체 수락',
    statusVendorRejected: '공급업체 거절',
    statusProduction: '생산 중',
    statusReadyToShip: '배송 준비 완료',
    statusInTransit: '운송 중',
    statusDelivered: '배달 완료',
    statusCompleted: '완료',
    statusCancelled: '취소됨',
      showingCount: 'Showing {current} of {total} purchase orders',
    statusRevisionRequested: 'Revision Requested',
    statusClosed: 'Closed',
    statusPartiallyDelivered: 'Partially Delivered',
    statusRejectedGoods: 'Goods Rejected',
  
    rfqPrefix: 'RFQ: ',
  },
  oceanFreight: {
    heroTitle: '신뢰할 수 있는 국제 해상 운송',
    heroSub: 'FCL, LCL, 냉장, 프로젝트 화물을 전 세계 150개 이상의 항구로.',
    getQuote: '견적 받기',
    trackCargo: '화물 추적',
    serviceOptions: '서비스 옵션',
    fclTitle: 'FCL (풀 컨테이너)',
    fclDesc: '대량 화물을 위한 풀 컨테이너. 단위당 더 경제적이고 안전합니다.',
    lclTitle: 'LCL (혼재 화물)',
    lclDesc: '부피에 따라 지불. 소량 화물에 적합합니다.',
    containerFleet: '컨테이너 선단',
    popularRoutes: '인기 노선',
    whyChooseUs: '우리를 선택하는 이유',
    processSteps: '배송 프로세스',
    ctaTitle: '화물 발송 준비가 되셨나요?',
    originCity: '출발 도시',
    destCity: '목적 도시',
    shipmentType: '화물 유형',
    containerQty: '컨테이너 수량',
    grossWeight: '총중량 (kg)',
    commodity: '상품',
    additionalSvc: '추가 서비스',
    customsClearance: '통관 서비스',
    inlandTruck: '내륙 운송',
    insurance: '화물 보험',
    calculateEstimate: '견적 계산',
    inquirySent: '문의가 전송되었습니다!',
    orderNo: '주문 번호',
    estimateNotice: '이것은 초기 견적입니다. 최종 가격은 관리자 확인 후 확정됩니다.',
    bookNow: '지금 예약',
    loadingQuotes: '견적 로딩 중...',
    noVendors: '아직 공급업체가 없습니다',
    selectVendorFirst: '먼저 공급업체를 선택해 주세요',
    submitOrder: '주문 제출',
    detailShipment: '화물 세부정보',
    summaryTitle: '주문 요약',
    totalEstimate: '총 견적',
    confirmOrder: '주문 확인',
    cancelOrder: '취소',
    successTitle: '주문 완료!',
    errorSubmit: '주문 제출 실패',
    heroLine1: '해상 운송',
    heroAccent: '국제',
    heroLine2: '신뢰할 수 있는',
    heroSubFull: 'FCL, LCL, 냉장 화물 및 프로젝트 화물을 전 세계 150개 이상의 항구로. 즉시 가격 견적 및 완전한 서류 지원을 받으세요.',
    statPorts: '목적지 항구',
    statPartner: '선사 파트너',
    statCargo: '모든 화물 유형',
    statSupport: '운영 지원',
    fclOrLcl: 'FCL 아니면 LCL?',
    fclLclSubtext: '경쟁력 있는 요금과 전문적인 처리로 두 가지 화물 유형을 모두 처리합니다.',
    fclDescFull: '대형 화물을 위한 전용 컨테이너. 단위당 더 경제적이고 화물이 혼합되지 않아 안전합니다.',
    fclFeature1: '≥10 CBM 화물에 이상적',
    fclFeature2: '더 안전 — 화물 비혼합',
    fclFeature3: '더 빠른 운송 시간',
    fclFeature4: '20ft, 40ft, 40HC, 냉장, 오픈 탑',
    fclBtn: 'FCL 견적 확인 →',
    lclDescFull: '볼륨에 따라 지불. 전체 컨테이너를 채우지 않는 소량 화물에 적합.',
    lclFeature1: '<10 CBM 화물에 이상적',
    lclFeature2: 'CBM / 중량에 따라 지불',
    lclFeature3: '다른 화물과 통합',
    lclFeature4: '중소기업 및 스타트업에 유연',
    lclBtn: 'LCL 견적 확인 →',
    containerTitle: '컨테이너 옵션',
    container20ftDesc: '표준 범용 컨테이너',
    container40ftDesc: '대용량 고볼륨',
    container40hcDesc: '대형 화물을 위한 추가 높이',
    containerRef20Desc: '민감한 화물용 냉장',
    containerRef40Desc: '대용량 냉장 컨테이너',
    containerOpenDesc: '초고 화물용',
    containerFlatDesc: '기계 및 프로젝트 화물용',
    routesTitle: '주요 수출입 항로',
    routesNote: '운송 시간은 추정이며 운반업체 일정에 따라 달라질 수 있습니다.',
    ourAdvantage: '우리의 장점',
    feat1Title: '글로벌 네트워크',
    feat1Desc: '전 세계 150개 이상의 항구, 20개 이상의 선사 파트너',
    feat2Desc: '출발 항구부터 목적지 항구까지 완전한 화물 보호',
    feat3Title: '완전한 서류',
    feat3Desc: 'B/L, 포장 목록, COO, MSDS 및 모든 수출입 서류',
    feat4Desc: '통관 포함 문앞까지 픽업 및 배송',
    feat5Desc: '추적 포털을 통해 언제든지 화물 추적',
    feat6Title: '경쟁력 있는 가격',
    feat6Desc: '최상의 요금을 위한 운반업체와의 직접 협상',
    workflowLabel: '워크플로',
    step1Title: '상담',
    step1Desc: '운송 요구사항을 팀에 알려주세요',
    step2Desc: '비용 견적 및 운반업체 옵션을 보내드립니다',
    step3Desc: '확인 및 완전한 서류 처리',
    step4Title: '발송',
    step4Desc: '화물이 발송되고 목적지 도착까지 추적됩니다',
    ctaSubtitle: '목적지 항로의 즉시 가격 견적을 받아보세요. 팀이 24/7 도움을 드릴 준비가 되어 있습니다.',
    ctaBtn: '지금 견적 요청',
    ctaWa: 'WhatsApp으로 연락',
    successDesc: 'Ocean Freight 견적 요청이 전송되었습니다. 당사 팀이 선사/파트너 확인 후 최종 가격을 보내드립니다.',
    backToHome: '홈으로 돌아가기',
    yourData: '고객 정보',
    customerNameLabel: '이름',
    customerNamePlaceholder: '전체 이름',
    customerPhoneLabel: '전화번호 / WhatsApp',
    customerCompanyLabel: '회사',
    customerNotesLabel: '추가 메모',
    customerNotesPlaceholder: '특별 지시사항...',
    goBack: '뒤로',
    sending: '전송 중...',
    koliQty: '포장 수량',
    containerFinalNote: '최종 세부 사항은 운송사 확인에 따릅니다.',
    lclCargo: 'LCL Cargo',
    lclCargoSub: 'Less than Container Load',
    lclRateNote: '요금은 사용된 CBM 기준',
    checkEstimate: '견적 계산',
    calculating: '계산 중...',
    estimateResults: '견적 결과',
    recalculate: '재계산',
    noRate: '이 노선에 사용 가능한 요금 없음',
    noRateHint: '당사 팀으로부터 수동 견적을 받으려면 문의를 제출하세요.',
    requestManual: '수동 견적 요청',
    initialEstimate: '초기 견적',
    dayUnit: '일',
    validUntil: '유효 기간',
    selectEstimate: '이 견적 선택',
    estimateNoticeShort: '이는 초기 견적입니다. 최종 가격은 admin/공급업체가 선사/파트너로부터 확인을 받은 후 확정됩니다.',
    estimateNoticeFull: '이는 초기 견적입니다. 최종 가격은 선사, NVOCC, co-loader 또는 파트너로부터 확인 후 확정됩니다.',
    breakdownTitle: '견적 내역',
    totalBreakdown: '견적 합계',
    custNameRequired: '고객 이름은 필수입니다',
    hsCodeOptional: 'HS Code (선택사항)',
    requestFinalQuote: '최종 견적 요청',
  },
  productOrderTrack: {
    pageTitle: '제품 주문 추적',
    orderNo: '주문 번호',
    status: '상태',
    noTracking: '데이터를 찾을 수 없습니다',
    trackBtn: '추적',
    searchPlaceholder: '주문 번호 입력...',
  },
  truckingPage: {
    pageTitle: '트럭킹 서비스',
    heroSub: '모든 지역에 걸친 신뢰할 수 있는 정기 육상 배송.',
    kembali: '뒤로',
    armadaTersedia: '차량 이용 가능',
    lokasi: '위치',
    mulaiDari: '부터',
    profilArmada: '차량 프로필',
    tentangArmada: '{name} 정보',
    jaminanEnterprise: '엔터프라이즈 보증',
    cekOngkir: '배송비 확인',
    orderBerhasil: '주문이 생성되었습니다!',
    nomorOrder: '주문 번호',
    dimensiNote: '치수는 해당 차량 등급의 평균입니다. 단위 간 차이가 있을 수 있습니다.',
    totalEstimasi: '총 예상 금액',
    shippingCalc: '배송비 계산기',
    availableFleet: '이용 가능한 차량',
    bestFor: '적합 용도',
    advantages: '장점',
    pickupSection: '픽업',
    deliverySection: '배달',
    pickupAddress: '픽업 주소',
    deliveryAddress: '배달 주소',
    pickupSchedule: '픽업 일정',
    now: '지금',
    later: '나중에',
    itemDetail: '화물 세부정보',
    itemType: '화물 유형',
    weight: '무게 (kg)',
    tripQty: '운송 횟수',
    addons: '추가 서비스',
    loadingService: '상차 서비스',
    unloadingService: '하차 서비스',
    overnight: '숙박',
    helper: '도우미',
    flowSection: '배송 흐름',
    standardService: '기본 서비스',
    estimateCost: '비용 견적',
    fillToCalculate: '배송 세부정보를 입력하여 비용 견적 계산',
    vehicleSelect: '차량 선택',
    noVendors: '아직 공급업체가 없습니다',
    orderSent: '주문이 전송되었습니다!',
    submitOrder: '지금 주문',
    servicePackage: '서비스 패키지',
    techSpec: '기술 사양',
    jasaLayanan: '서비스 & 솔루션',
    encrypted: '암호화됨',
    verified: '인증됨',
    freeConsult: '무료 상담',
    chatSalesWa: 'WhatsApp으로 영업팀 채팅',
    orderVehicle: '{name} 주문',
    orderTrucking: '지금 트럭 운송 주문',
    allVerified: '100% 인증 파트너',
    encryptedTx: '암호화된 거래',
    fleetVerified: '인증된 차량',
    strictInspection: '모든 차량이 엄격한 검사 통과',
    rating: '평점 4.9/5',
    fleet100: '100% 차량',
    armadaAktif: '활성 차량',
    jasaTrucking: '트럭 운송 서비스',
    perTrip: '1회당',
    sewaHarian: '일일 렌탈',
    perHariTermasuk: '/ 일 · 기사 및 연료 포함',
    sudahTermasuk: '포함',
    bisniAktif: '활성 기업',
    pengirimanStat: '배송 건수',
    ratingRataRata: '평균 평점',
    onTimeRate: '정시 배송률',
    klienAktifStat: '활성 고객',
    pengirimanStatShort: '50,000건 이상 배송',
    cargoInsurance: '화물 보험 포함',
    gpsTracking: '실시간 GPS 추적',
    enterpriseSolusi: '기업 물류 솔루션',
    enterpriseTitle: '더 큰 규모가 필요하신가요?',
    enterpriseSub: '물류 전문가와 기업 배송 니즈를 상담하세요. 대량 할인, 전용 차량, 맞춤형 SLA를 제공합니다.',
    requestPenawaran: '견적 요청',
    chatWhatsApp: 'WhatsApp으로 연락',
    perusahaanAktifSub: '활성 기업',
    areaPickup: '픽업 지역',
    picPickup: '픽업 담당자명',
    hpPickup: '픽업 전화번호',
    areaDelivery: '배달 지역',
    picReceiver: '수취인명',
    hpReceiver: '수취인 전화번호',
    pickupNow: '지금 픽업',
    pickupLater: '나중에 예약',
    pickupDate: '픽업 날짜',
    pickupTime: '픽업 시간',
    beratKg: '화물 중량 (kg)',
    jumlahKoli: '포장 수량',
    volumeOpsional: '용적 (m³) — 선택사항',
    catatanKhusus: '특별 메모',
    minimalTrip: '최소 1회 · {name}',
    vendorHargaTermurah: '벤더 · 최저가',
    inclVehicle: '선택한 차량',
    inclCargo: '전용 화물 공간',
    inclDriver: '숙련된 기사',
    inclFuel: '연료 포함',
    inclWait: '무료 6시간 대기',
    inclInsurance: '기본 화물 보험',
    tambahanOpsional: '선택 부가 서비스',
    perTripSuffix: '/ 회',
    prosesPemesanan: '주문 프로세스',
    step1Desc: '배송 요구에 맞는 차량을 선택하세요',
    step2Desc: '운임 계산기로 배송 비용 견적을 계산하세요',
    step3Desc: '완전한 배송 세부 정보를 포함한 예약 양식을 작성하세요',
    step4Desc: 'GPS로 배송 상태를 실시간 모니터링하세요',
    guarArmadaLabel: '검사된 차량',
    guarArmadaDesc: '모든 차량은 정기 검사 및 유지 보수를 통과했습니다',
    guarSopirLabel: '면허 기사',
    guarSopirDesc: '각 차량에 경험 많고 면허 있는 기사가 배치됩니다',
    guarGpsLabel: '실시간 GPS',
    guarGpsDesc: 'GPS 시스템으로 차량 위치를 실시간 모니터링합니다',
    guarAsuransiLabel: '화물 보험',
    guarAsuransiDesc: '모든 배송에 표준 화물 보험이 포함됩니다',
    guarSupportLabel: '24시간 지원',
    guarSupportDesc: '영업 시간 동안 고객 지원 이용 가능',
    guarResponsLabel: '빠른 응답',
    guarResponsDesc: '팀이 24시간 내에 문의에 응답합니다',
    phAreaPickup: '출발 지역 선택',
    phAddrPickup: '픽업 위치의 전체 주소',
    phPicPickup: '픽업 위치의 담당자 이름',
    phAreaDelivery: '목적지 지역 선택',
    phAddrDelivery: '배달 목적지의 전체 주소',
    phPicReceiver: '수취인 담당자 이름',
    phItemType: '예: 전자제품, 서류, 의류',
    phBerat: '예: 100',
    phKoli: '예: 5',
    phVolume: '예: 1.5',
    phCatatan: '특별 지시 사항, 메모 등',
    addonsNote: '추가 서비스는 총 예상 가격에 영향을 미칩니다.',
    addonBantuanMuatLabel: '적재 보조',
    addonBantuanBongkarLabel: '하역 보조',
    addonAsuransiLabel: '보험',
    addonFerryLabel: '페리 / 도항',
    addonTolLabel: '통행료 (실비)',
    addonMultiDropLabel: '다중 배송지',
    addonUrgentLabel: '긴급 배송',
    addonOvernightLabel: '야간 / 종일',
    menghitungEstimasi: '견적 계산 중...',
    hitungEstimasi: '견적 계산',
    menghitungHarga: '최적 가격을 계산하고 있습니다...',
    cobaLagi: '다시 시도',
    noVendorContact: '공급업체 정보는 영업 팀에 문의하세요',
    rowEstKm: '예상 거리',
    noteEstKota: '도시 간 예상 거리',
    noteJarakTidak: '거리 불명',
    noteJarakAktual: '실제 거리',
    rowTarifPerKm: 'km당 요금',
    rowMinCharge: '최소 요금',
    rowHargaDasar: '기본 가격',
    rowSurchargeKota: '도시 할증',
    rowSurchargeProvinsi: '도간 할증',
    rowSurchargePulau: '도서 간 할증',
    rowBiayaMuat: '적재 비용',
    rowBiayaBongkar: '하역 비용',
    rowFerry: '페리 비용',
    rowTol: '통행료',
    tolActualCost: '실비',
    rowMultidrop: '다중 배송지',
    rowOvernight: '야간',
    rowAsuransi: '보험',
    rowUrgent: '긴급',
    estimasiPpnNote: '견적에는 11% 부가세가 포함되지 않습니다',
    estimasiHargaTrucking: '트럭 운송 가격 견적',
    rowAreaPickup: '출발 지역',
    rowAreaDelivery: '목적지 지역',
    rowArmada: '차량',
    mengirimPermintaan: '요청 전송 중...',
    kirimTanpaEstimasi: '견적 없이 전송',
    mengirim: '전송 중...',
    orderInfo: '팀이 곧 연락드리겠습니다',
    menungguAdmin: '관리자 확인 대기 중',
    notifOperasional: '알림이 WhatsApp으로 전송되었습니다',
    simpanNomor: '주문 번호를 저장하세요',
    estimasiDays: '예상 {days} 영업일',
    onTimeBadge: '99.2% 정시',
    onTimeRateBadge: '99.2% 정시율',
    ratingBadge: '평점',
    ratingValue: '4.9/5',
    step1Title:  '차량 선택',
    step3Title:  '양식 작성',
    step4Title:  '배송 추적',
    adminReview: '관리자가 주문을 검토하고 확인합니다',
  },
  vendorDashboard: {
    pageTitle: '공급업체 대시보드',
    catalogTitle: '제품 및 서비스 카탈로그',
    catalogDesc: '마켓플레이스에서 제품/서비스 추가, 편집 및 관리',
    uploadPhotoHint: '마켓플레이스에 매력적으로 표시하려면 각 제품/서비스의 사진을 업로드하세요',
    addProduct: '제품 추가',
    addService: '서비스 추가',
    typeProduct: '제품',
    typeService: '서비스',
    cancelBtn: '취소',
    backToLogin: '로그인으로 돌아가기',
    quotesTitle: '내 견적',
    quotesDesc: '제출한 모든 견적',
    submissionsTitle: '내 제품/서비스',
    submissionsDesc: '관리자 검토를 위해 제출한 제품/서비스',
    notifTitle: '알림',
    notifDesc: '공급업체 계정 및 카탈로그 관련 업데이트',
    promoTitle: '프로모션',
    promoDesc: '제품/서비스 및 적합한 프로모션 패키지 선택',
    promoHistory: '모든 제출의 이력 및 상태',
    statusDraft: '초안',
    estPickup: '픽업 예상',
    estDelivery: '배달 예상',
    maxFileHint: 'JPG, PNG, WebP · 최대 20MB',
    noItems: '카탈로그 항목이 없습니다',
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
    featuredStatusPending: '대기 중',
    featuredStatusApproved: '승인됨',
    featuredStatusActive: '활성',
    featuredStatusRejected: '거부됨',
    featuredStatusExpired: '만료됨',
    featuredStatusCancelled: '취소됨',
    paymentUnpaid: '미지불',
    paymentPendingVerif: '검증 대기',
    paymentVerified: '검증 완료',
    paymentRejected: '거부됨',
    paymentRefunded: '환불됨',
    quoteDetailStatusLabel: '상태',
    quotePricePlaceholder: '예: 5000000',
    etaPickupPlaceholder: '예: 2 영업일',
    etaDeliveryPlaceholder: '예: 5–7 영업일',
    notesPlaceholder: '조건, 약관 또는 추가 정보...',
  
    quoteStatusPending: '대기 중',
    quoteStatusApproved: '선택됨',
    quoteStatusRejected: '거절됨',
    rfqStatusOpen: '진행 중',
    rfqStatusClosed: '마감',
    durationDaysUnit: '일',
    rfqStatusAwarded: '선정됨',
    statusPublished: '게시됨',
    statusArchived: '보관됨',
    publishBtn: '게시',
    unpublishBtn: '게시 취소',
    mediaPhotoLabel: '사진',
    mediaVideoLabel: '동영상',
    mediaDocumentLabel: '문서',
    mediaDocumentPdfLabel: '문서 (PDF)',
    formNameRequired: '제품 이름은 필수입니다',
    formAddError: '제품 추가에 실패했습니다',
    formEditNameRequired: '이름은 필수입니다',
    formSaveError: '저장에 실패했습니다',
    mediaSaveError: '미디어 저장에 실패했습니다',
    quoteFormPriceRequired: '가격은 필수이며 0보다 커야 합니다',
    quoteUpdatedMsg: '견적이 업데이트되었습니다!',
    setPrimaryTitle: '기본으로 설정',
    deleteTitle: '삭제',
    quoteSentMsg: '견적이 성공적으로 전송되었습니다!',
    quoteSendError: '전송에 실패했습니다',
  },

  jasaDetail: {
    calcTitle: '비용 견적 계산기',
    calcSubtitle: '가격 견적을 받으려면 서비스 매개변수를 입력하세요',
    airAddQty: '다른 수량 추가',
    airCalcSummary: '계산 요약 ({count}가지 수량 유형):',
    truckStep1Label: '배송 세부 정보',
    truckStep2Label: '차량 및 확인',
    scheduleLabel: '픽업 일정',
    orderNowLabel: '지금 주문',
    orderNowDesc: '오늘 픽업 예정',
    activeLabel: '활성',
    dateLabel: '날짜',
    timeLabel: '시간',
    scheduleDisplay: '일정: {date} {time}',
    senderLabel: '발송인 정보',
    senderNameLabel: '발송인 이름',
    senderNamePlaceholder: '발송인 전체 이름',
    senderPhoneLabel: '발송인 전화번호',
    routeLabel: '배송 경로',
    originPlaceholder: '출발 도시...',
    stopCityPlaceholder: '정류장 {n} 도시...',
    removeStop: '정류장 제거',
    stopReceiverNameLabel: '정류장 {n} 수신인 이름',
    stopReceiverPhoneLabel: '정류장 {n} 수신인 전화',
    destPlaceholder: '목적지 도시...',
    receiverNameLabel: '수신인 이름',
    receiverPhoneLabel: '수신인 전화번호',
    receiverNamePlaceholder: '수신인 이름',
    optimizeRouteDesc: '정류장을 정렬하여 여정을 더 효율적으로 만듭니다.',
    distanceEstLabel: '예상 거리',
    calculatingLabel: '계산 중...',
    autoLabel: '✓ 자동',
    cargoLabel: '화물 정보',
    cargoCategoryLabel: '화물 카테고리',
    koliQtyLabel: '패키지 수',
    dimensionsLabel: '치수 및 부피',
    totalVolumeLabel: '총 부피 / 입방',
    addDimension: '치수 추가',
    notesPlaceholder: '화물, 취급 또는 특별 지침에 대한 추가 메모...',
    uploadPhotoLabel: '화물 사진 업로드',
    photoCount: '{n}/5 장 사진',
    photoPickerHint: '사진 선택 (jpg, jpeg, png, webp) · 최대 5장',
    paymentLabel: '결제 유형',
    transferDesc: '은행 이체로 결제',
    gatewayDesc: '온라인 게이트웨이로 결제',
    selectTransferLabel: '이체 유형 선택',
    fullPayDesc: '전액 결제',
    terminDesc: '정기 할부',
    dpDesc: '선불금',
    terminPeriodLabel: '할부 기간',
    nextPaymentLabel: '다음 결제',
    afterDelivery: '배달 후',
    net30Days: '순 30일',
    net60Days: '순 60일',
    installments: '단계적 할부',
    orderSummaryLabel: '주문 요약',
    summarySchedule: '일정',
    summaryNow: '지금',
    summaryRoute: '경로',
    summaryDistance: '거리',
    summaryCategory: '카테고리',
    summaryCargo: '화물',
    summaryPhoto: '사진',
    photoUploaded: '{n}장 사진 업로드됨',
    summaryPayment: '결제',
    payTransferFull: '이체 · 전액 결제',
    payTransferTermin: '이체 · 할부 {term}',
    payTransferDp: '이체 · 선불금',
    payTransfer: '이체',
    recommended: '추천',
    notSuitable: '적합하지 않음',
    distanceKmLabel: '거리 (km)',
    costBreakdownLabel: '비용 내역',
    totalEstLabel: '총 견적',
    fillRateHint: '비용 견적을 보려면 요율/km 및 거리를 입력하세요.',
    addedToCartMsg: '{name}이(가) 주문에 성공적으로 추가되었습니다!',
    estimatedSubtotal: '예상 소계',
    estimatedSubtotalNote: '예상 가격 · CST 팀 확인',
    addToOrderBtn: '주문에 추가',
    addedToCartConfirm: '{name}이(가) 주문에 성공적으로 추가되었습니다',
    recalcBtn: '재계산',
    proceedBtn: '예약 진행',
    sidebarInfoLabel: '서비스 정보',
    sidebarTruckingNote: '거리 및 차량 계산 기반',
    availableLabel: '● 이용 가능',
    vehicleLabel: '차량',
    distanceLabel: '거리',
    viewCartBtn: '주문 장바구니 보기',
    whyUsLabel: '왜 B2B Marketplace and Logistic인가요?',
    trustBadge1: '라이선스 취득 & 공식 등록',
    trustBadge2: '빠른 응답 & 전문적',
    trustBadge3: '화물 안전 & 보호',
    trustBadge4: 'WhatsApp 지원 24/7',
    relatedServicesLabel: '기타 {category} 서비스',
    viewAllServices: '모든 서비스 보기',
    backBtn: '← 뒤로',
    nextBtn: '다음',
    pendingOrderTitle: '이 서비스는 배달로 선택되었습니다',
    pendingOrderLabel: '주문:',
    pendingOrderAdded: '서비스가 추가되었습니다. 확인을 클릭하여 계속하세요.',
    pendingOrderHint: '먼저 "주문에 추가"를 클릭하세요.',
    confirmOrderBtn: '확인 및 주문 계속',
    cancelBtn: '취소',
    toastAddServiceFirst: '먼저 주문에 서비스를 추가하세요',
    toastAddServiceDesc: '계속하기 전에 "주문에 추가" 버튼을 클릭하세요.',
    toastAutoDistance: '자동 거리: {km} km',
    toastDistanceFail: '거리 계산 실패',
    toastDistanceFailDesc: '거리를 수동으로 입력하세요',
    toastNoDate: '픽업 날짜 선택',
    toastDatePast: '픽업 날짜는 오늘 이전일 수 없습니다',
    toastNoTime: '픽업 시간 선택',
    toastNoSenderName: '발송인 이름 입력',
    toastNoSenderPhone: '발송인 전화번호 입력',
    toastNoOrigin: '출발 도시 입력',
    toastNoDest: '목적지 도시 입력',
    toastNoReceiverName: '수신인 이름 입력',
    toastNoReceiverPhone: '수신인 전화번호 입력',
    toastNoStopReceiverName: '정류장 {n} 수신인 이름 입력',
    toastNoStopReceiverPhone: '정류장 {n} 수신인 전화 입력',
    toastNoCargo: '화물 카테고리 선택 (필수)',
    toastNoKoli: '패키지 수를 입력해야 합니다 (> 0)',
    toastNoWeight: '총중량을 입력해야 합니다 (> 0)',
    toastNoPhoto: '화물 사진을 최소 1장 업로드하세요 (필수)',
    toastNoPayment: '결제 유형 선택 (필수)',
    toastNoTransferType: '이체 유형 선택 (전액 결제, 할부 또는 선불금)',
    toastFillCalc: '먼저 계산기 데이터를 입력하세요',
    toastNoVehicle: '먼저 차량을 선택하세요',
    toastAddedToCart: '{name}이(가) 주문 장바구니에 추가되었습니다!',
    toastRouteOptimized: '경로 최적화됨',
    toastRouteOptimizedDesc: '정류장 순서가 자동으로 재정렬되었습니다.',
  
    destAirport: '도착 공항',
    grossWeightKg: '총중량 (kg)',
    quantityPcs: '수량 (개)',
    lengthCm: '길이 (cm)',
    widthCm: '너비 (cm)',
    heightCm: '높이 (cm)',
    volWeight: '체적 중량',
    chargeable: '과금 중량',
    ratePerKg: '요율/kg (IDR)',
    totalVolWeight: '총 체적 중량',
    totalChargeableWeight: '총 과금 중량',
    originPort: '출발 항구',
    destPort: '도착 항구',
    containerType: '컨테이너 유형',
    selectContainer: '컨테이너 선택',
    freightRate: '운임 (IDR)',
    handlingFeeIDR: '취급 수수료 (IDR)',
    weightKg: '무게 (kg)',
    ratePerCbm: '요율/CBM (IDR)',
    minimumCharge: '최소 요금 (IDR)',
    customsFeeIDR: '통관 수수료 (IDR)',
    documentFeeIDR: '서류 수수료 (IDR)',
    pibPebFee: 'PIB/PEB 수수료',
    permitFeeIDR: '허가 수수료 (IDR)',
    addStop: '경유지 추가',
    optimizeRoute: '경로 최적화',
    ratePerKmIDR: '요율/km (IDR)',
    adminVerified: '✓ 관리자',
    loadingFeeIDR: '상차료 (IDR)',
    loadingFeeLabel: '상차료',
    numDays: '일수',
    unitLabel: '단위',
    selectUnit: '단위 선택',
    ratePerDayIDR: '요율/일 (IDR)',
    documentType: '문서 유형',
    feePerDocIDR: '서류당 수수료 (IDR)',
    serviceFeeIDR: '서비스 수수료 (IDR)',
    adminFeeIDR: '관리 수수료 (IDR)',
    serviceName: '서비스 명',
    unitPriceIDR: '단가 (IDR)',
    quotation: '협상 / 견적',
  },

  portalDokumen: {
    title: "문서",
    subtitle: "상업 청구서 및 거래 문서",
    searchPlaceholder: "문서 또는 주문번호 검색...",
    viewAllOrders: "모든 주문 보기",
    transactionDocs: "거래 문서",
    documentsCount: "{n}개 문서",
    orderRef: "주문: {number}",
    dueDateLabel: "만기일",
    noMatchDocs: "일치하는 문서 없음",
    clearSearch: "검색 지우기",
    emptyTitle: "아직 문서 없음",
    emptyDesc: "주문이 확인된 후 거래 문서가 여기에 표시됩니다.",
    viewMyOrders: "내 주문 보기",
    logisticDocsTitle: "물류팀 문서",
    logisticDocsDesc: "위 문서는 운영팀이 배송 진행 상황에 따라 WhatsApp 또는 이메일로 직접 발송합니다.",
    detailBtn: "상세",
  },
  portalInvoice: {
    title: "청구서 및 결제",
    subtitle: "청구 내역 및 결제 상태",
    totalUnpaid: "미결제 합계",
    invoiceList: "청구서 목록",
    payBtn: "결제",
    emptyTitle: "아직 청구서 없음",
    emptyDesc: "주문이 확인되고 청구 준비가 완료된 후 청구서가 여기에 표시됩니다.",
    viewShipments: "내 배송 보기",
    orderRef: "주문: {number}",
    dueDateLabel: "만기일",
    paymentLink: "결제 링크",
  },

  oceanFreightBooking: {
    optionEconomy: '이코노미',
    optionEconomyDesc: '가장 저렴한 가격',
    optionStandard: '스탠다드',
    optionStandardDesc: '가격과 시간의 균형',
    optionPriority: '프리미엄',
    optionPriorityDesc: '가장 빠른 운송',
    errorFillPorts: '출발항과 도착항을 입력해주세요',
    errorSelectContainer: '컨테이너 유형을 선택해주세요',
    errorFillCbm: 'CBM 또는 총 중량을 입력해주세요',
    errorNameRequired: '이름은 필수입니다',
    errorContactRequired: '전화 또는 이메일은 필수입니다',
    successTitle: '문의가 전송되었습니다!',
    successDesc: '담당자가 최종 견적을 확인 후 곧 연락드리겠습니다.',
    orderNumberLabel: '주문 번호',
    orderAgain: '새 주문',
    backToEstimate: '견적으로 돌아가기',
    senderTitle: '발송인 정보',
    contactInfo: '연락처 정보',
    fullName: '성함 *',
    phoneWa: '전화 / WhatsApp *',
    email: '이메일',
    company: '회사명',
    targetEtd: '목표 ETD',
    commodity: '화물 품목',
    confirmNote: '담당자가 1×24시간 이내에 최종 가격 확인을 위해 연락드립니다.',
    sending: '전송 중...',
    submitInquiry: '문의 전송',
    changeSearch: '검색 변경',
    resultsTitle: '해상 운임 견적',
    noRatesTitle: '운임 없음',
    noRatesDesc: '이 구간의 운임이 아직 없습니다. 담당자가 최적의 제안을 찾겠습니다.',
    requestManualQuote: '수동 견적 요청',
    daysTransit: '일 운송',
    estimate: '견적',
    fixedPrice: '고정 가격',
    hideBreakdown: '숨기기',
    showBreakdown: '보기',
    breakdownTitle: '비용 내역',
    docCharges: '서류 비용',
    totalEstimate: '총 견적',
    requestManual: '수동 요청',
    requestFinal: '최종 견적 요청',
    priceNote: '초기 견적 — 선사로부터 운임 수령 후 최종 가격 확인.',
    back: '뒤로',
    subtitle: '해상 운송 FCL & LCL',
    shippingRoute: '운송 경로',
    selectPort: '항구 선택...',
    cargoType: '화물 유형',
    containerQty: '컨테이너 수량',
    grossWeightKg: '총 중량 (kg)',
    colliCount: '박스 수',
    cargoCondition: '화물 상태',
    additionalServices: '추가 서비스',
    additionalServicesHint: '필요한 서비스 선택 (선택사항)',
    calculating: '견적 계산 중...',
    checkPrice: '가격 견적 확인',
    fclFull: 'FCL — 풀 컨테이너',
    lclLess: 'LCL — 혼재',
  
    tracking: '추적',
    titleOceanFreight: '해상 화물',
    labelOriginPort: '출발 항구 *',
    labelDestPort: '도착 항구 *',
    labelTradeType: '무역 유형',
    labelServiceMode: '서비스 모드',
    labelContainerType: '컨테이너 종류 *',
    labelVolumeCbm: '부피 (CBM)',
    transshipmentDirect: '직항',
    transshipmentViaTS: 'T/S 경유',
    tradeTypeExport: '수출',
    tradeTypeImport: '수입',
    tradeTypeDomestic: '국내',
    tradeTypeCrossBorder: '국경 간',
    serviceModePortPort: '항구 간',
    serviceModeDoorPort: '도어 → 항구',
    serviceModePortDoor: '항구 → 도어',
    serviceModeDoorDoor: '도어 투 도어',
    cargoGeneral: '일반 화물',
    cargoDG: '위험 화물',
    cargoReefer: '냉동 화물',
    cargoFragile: '깨지기 쉬운',
    cargoOversize: '과대 화물',
    cargoHighValue: '고가 화물',
    addonTruckingPickup: '트럭 픽업',
    addonTruckingDelivery: '트럭 배송',
    addonCustoms: '세관 통관',
    addonInsurance: '보험',
    addonFumigation: '훈증',
    addonCOO: '원산지 증명서',
    addonWarehouse: '창고 처리',

    breakdownTHCOrigin: 'THC 출발지',
    breakdownTHCDestination: 'THC 목적지',
    breakdownTrucking: '트럭 운송',
    breakdownCustomsClearance: '세관 통관',
},
  orderStatusLabels: {
    "New Order": "신규 주문",
    "Awaiting Payment": "결제 대기",
    "Paid": "결제 완료",
    "In Progress": "진행 중",
    "Completed": "완료",
    "Cancelled": "취소",
  },

  customerOrder: {
    loading: '주문 상태 불러오는 중...',
    notFound: '주문을 찾을 수 없습니다',
    priceSummary: '가격 요약',
    origin: '출발지',
    destination: '목적지',
    orderDate: '주문 날짜',
    estimatedArrival: '예상',
    productService: '제품 / 서비스',
    truck: '트럭',
    internal: '내부',
    external: '외부',
    total: '합계',
    journeyHistory: '운송 이력',
    noHistory: '운송 이력이 없습니다.',
    viewDocument: '문서 보기',
    progressConfirm: '확인',
    progressPickup: '픽업',
    progressJourney: '이동 중',
    progressDelivered: '배달됨',
    progressCompleted: '완료',
  },
  ppjkTrack: {
    loading: 'PPJK 추적 로딩 중…',
    notFound: '주문을 찾을 수 없습니다',
    notFoundMsg: '잘못된 주문 번호이거나 아직 사용할 수 없습니다',
    backToHome: '홈으로 돌아가기',
    statusDraft: '초안 / 확인 대기',
    statusConfirmed: '확인됨',
    statusProcessing: '처리 중',
    statusSubmitted: '세관에 서류 제출됨',
    statusExamining: '세관 심사 중',
    statusApproved: '승인됨 / SPPB 발급',
    statusCompleted: '완료',
    statusCancelled: '취소됨',
    statusOnHold: '보류 중',
    customsPending: '대기 중',
    customsAjuFiled: '세관 신고서 제출됨',
    customsJalurHijau: '그린 채널',
    customsJalurMerah: '레드 채널',
    customsJalurKuning: '옐로우 채널',
    customsSppbIssued: 'SPPB 발급됨',
    customsPaid: '관세 및 세금 납부됨',
    customsReleased: '화물 반출됨',
    actionCreated: '주문 생성됨',
    actionStatusChanged: '상태 업데이트됨',
    actionCustomsStatusChanged: '세관 상태 업데이트됨',
    actionDocumentUploaded: '서류 업로드됨',
    actionNoteAdded: '메모 추가됨',
    actionUpdated: '데이터 업데이트됨',
    cargoInfo: '화물 정보',
    commodity: '상품',
    route: '경로',
    portOfEntry: '입/출항',
    kantorPabean: '세관 사무소',
    grossWeight: '총 중량',
    koli: '패키지 수',
    submissionDate: '제출 날짜',
    customsDocuments: '세관 서류 번호',
    nomorAju: '신고 번호',
    tanggalAju: '신고 날짜',
    nomorPib: 'PIB 번호',
    nomorPeb: 'PEB 번호',
    nomorSppb: 'SPPB 번호',
    customsStatusLabel: '세관 상태',
    timelineTitle: '업데이트 이력',
    lastUpdated: '마지막 업데이트',
    autoRefresh: '페이지가 30초마다 자동 새로 고침',
    progressLabel: '세관 진행상황',
    cancelledMsg: '주문이 취소되었습니다 — 팀에 문의하세요.',
    onHoldMsg: '주문이 보류 중입니다 — 팀이 곧 연락드리겠습니다.',
    completedMsg: '세관 절차가 완료되었습니다 — 화물을 수령하거나 배송할 준비가 되었습니다.',
    showMore: '{count}개 업데이트 더 보기',
    showLess: '접기',
    tradeExport: '수출',
    tradeImport: '수입',
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
