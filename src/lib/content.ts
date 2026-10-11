/**
 * Every word on the page, in one file, in Arabic.
 *
 * Rules this copy follows (see docs/copy-review.md):
 *  - Modern Standard Arabic, warm and plain, for readers from Iraq, the Gulf
 *    and the Levant.
 *  - Arabic letters only: Arabic kaf U+0643 and Arabic yeh U+064A. The Persian
 *    forms (U+06A9, U+06CC) and U+067E/U+0686/U+0698/U+06AF never appear, in the
 *    copy or anywhere else in this repository — npm run check:markup enforces it.
 *  - Arabic punctuation (، ؟) and no invented claims: no verification codes,
 *    no approval dates, no security promises, no prices, no guarantees.
 *  - The one universal QR code is *not* proof of a venue's identity, and no
 *    sentence here says it is.
 */

export const appBar = {
  /** Latin wordmark — always rendered LTR */
  wordmark: "SHAREA",
  /** Arabic name */
  name: "شارع",
}

export const hero = {
  badge: "معتمد",
  headline: "هذا المكان معتمد من بوت شارع",
  supporting:
    "وجود رمز شارع الرسمي في هذا المكان يعني أنه من الأماكن المعتمدة لدينا",
  reassurance: "استفد من خدمات هذا المكان براحة بال وثقة",
  chip: "معتمد من شارع",
  slogan: "كُلُّ احتياجاتِكَ في مكانٍ واحد",
  sloganSupporting: "خدمات متكاملة للزوار العرب في قم",
  primaryCta: "ادخل إلى بوت شارع",
}

export const howTo = {
  title: "كيف تعرف أن المكان معتمد؟",
  points: [
    "الرمز المطبوع على الحامل في هذا المكان هو رمز شارع الرسمي.",
    "الرمز نفسه يُستخدم في جميع الأماكن المعتمدة لدى شارع، ولا يخصّ مكانًا بعينه.",
    "إذا واجهت أي مشكلة في هذا المكان، تواصل معنا مباشرة عبر البوت.",
  ],
}

export const ribbon = [
  "خدمات الطلاب",
  "الهدايا والتذكارات",
  "خدمات السيارات",
  "الصرافة",
  "السياحة العلاجية",
  "الخدمات داخل المدينة",
  "الدعم المباشر",
]

export const services = {
  title: "خدمات شارع",
  supporting: "سبع خدمات يقدّمها البوت للزوار العرب في قم.",
  items: [
    {
      icon: "school",
      title: "خدمات الطلاب",
      body: "متابعة للطلاب العرب: التسجيل والسكن والاحتياجات الدراسية في قم.",
    },
    {
      icon: "redeem",
      title: "الهدايا والتذكارات",
      body: "هدايا وتذكارات من قم، مع إمكانية التوصيل إلى من تحب.",
    },
    {
      icon: "directions_car",
      title: "خدمات السيارات",
      body: "توصيل وتأجير سيارات للتنقل داخل قم وبين المدن.",
    },
    {
      icon: "currency_exchange",
      title: "الصرافة",
      body: "صرافة وتغيير العملات مع متابعة مباشرة من البوت.",
    },
    {
      icon: "medical_services",
      title: "السياحة العلاجية",
      body: "ترتيب المواعيد والمرافقة في المراكز الطبية.",
    },
    {
      icon: "location_city",
      title: "الخدمات داخل المدينة",
      body: "احتياجاتك اليومية والتنقل داخل المدينة.",
    },
    {
      icon: "support_agent",
      title: "الدعم المباشر",
      body: "فريق يرد على استفساراتك بالعربية خطوة بخطوة.",
    },
  ],
}

export const trust = {
  /** brand values, not legal or technical guarantees */
  caption: "قيم نعمل بها في خدمة زوار قم.",
  items: [
    { icon: "verified", label: "موثوق" },
    { icon: "chair", label: "مريح" },
    { icon: "bolt", label: "سريع" },
    { icon: "shield", label: "آمن" },
  ],
}

export const likes = {
  title: "ادعم شارع بضغطة",
  body: "اضغط القلب لتُخبرنا أن الصفحة أفادتك، ويمكنك مشاركتها مع من تعرف.",
  /** aria-label of the toggle */
  action: "إضافة إعجاب",
  countLabel: "إعجاب",
  loading: "جارٍ التحميل…",
  unavailable: "الإعجابات غير متاحة الآن. يمكنك دعمنا بمشاركة الصفحة.",
  error: "تعذّر تسجيل الإعجاب الآن. حاول مرة أخرى بعد قليل.",
  thanks: "شكرًا لدعمك.",
}

export const callsToAction = {
  title: "ابدأ الآن من بوت شارع",
  body: "كل الخدمات في محادثة واحدة، والرد بالعربية.",
  primary: "ادخل إلى بوت شارع",
  secondary: "انضم إلى مجموعة الواتساب",
  /** shown instead of a link while WHATSAPP_GROUP_URL is empty */
  secondaryPending: "قيد التفعيل",
  pendingNote: "رابط مجموعة الواتساب قيد الإعداد.",
  share: "شارك الصفحة",
  copy: "انسخ الرابط",
  copied: "تم نسخ الرابط.",
  copyFailed: "تعذّر نسخ الرابط. انسخه من شريط العنوان.",
}

export const sticky = {
  primary: "ادخل إلى بوت شارع",
  secondary: "مجموعة الواتساب",
}

export const footer = {
  line: "جميع الخدمات في قم — شارع",
  about: "شارع بوت تيليجرام لخدمة الزوار العرب في قم.",
}

export const meta = {
  title: "شارع | هذا المكان معتمد",
  description:
    "المكان الذي وجدت فيه رمز شارع الرسمي من الأماكن المعتمدة لدى شارع. خدمات الطلاب والهدايا والسيارات والصرافة والسياحة العلاجية والخدمات داخل قم والدعم المباشر، من بوت شارع على تيليجرام.",
  ogAlt: "بطاقة شارع: هذا المكان معتمد من بوت شارع.",
}
