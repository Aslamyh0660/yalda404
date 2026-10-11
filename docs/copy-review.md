# Arabic copy review — شارع

Every string the page renders, and the rules the copy follows. The source of
truth is [`src/lib/content.ts`](../src/lib/content.ts); this file records the
decisions so the wording can be changed deliberately.

## How this was checked

| Check | How | Result |
| --- | --- | --- |
| Every string renders with correct joining, ligatures and diacritics | `npm run check:arabic` renders all 57 strings with the exact WOFF2 the site serves → `docs/copy-sheet-body.png`, `docs/copy-sheet-heading.png` | reviewed on the sheets: initial/medial/final forms, the lam-alef ligature in «الطلاب / الأماكن / الإعجابات», taa marbuta (خدمة، صرافة) and the kasra/shadda in «كُلُّ احتياجاتِكَ في مكانٍ واحد» all correct |
| No Persian-only letters | `npm run check:markup` scans every source, doc and HTML file for U+067E, U+0686, U+0698, U+06AF, U+06A9, U+06CC | passes |
| Verbatim strings | the same audit asserts the hero headline, supporting line, reassurance, slogan, the seven services and the four trust values character by character | passes |
| The handle is `@Sharea_qombot` | the audit fails on `gombot` anywhere in the repository, and asserts the exact Telegram URL | passes |
| No invented claims | the audit fails if a year, a verification code or a guarantee appears in the rendered copy | passes |
| Punctuation | Arabic ، ؛ ؟ and guillemets; the audit fails if a Latin comma follows Arabic text | passes |

## Rules the copy follows

- Modern Standard Arabic, warm and plain, written for visitors from Iraq, the
  Gulf and the Levant.
- Arabic letters only: Arabic kaf (U+0643) and Arabic yeh (U+064A), never the
  Persian keheh (U+06A9) or farsi yeh (U+06CC), nor U+067E, U+0686, U+0698,
  U+06AF.
- Selective diacritics, only where they help reading: `كُلُّ احتياجاتِكَ في مكانٍ
  واحد`, and `جارٍ التحميل…` (the tanween kasra that keeps «جارٍ» from reading as
  «جار»).
- Latin fragments (the handle, `SHAREA`, URLs) are isolated with `<bdi dir="ltr">`
  so they cannot reorder the Arabic around them.
- Short sentences, one idea each. A visitor is standing at a reception desk
  reading this on a phone.
- No claims the page cannot support: no verification IDs, no approval dates, no
  prices, no discounts, no "guaranteed" or "tamper-proof" statements about a
  venue, and no implication that a universal QR code identifies a specific place.

## Key strings

| Where | Arabic | Note |
| --- | --- | --- |
| Hero headline | هذا المكان معتمد من بوت شارع | the one thing the page must say |
| Supporting | وجود رمز شارع الرسمي في هذا المكان يعني أنه من الأماكن المعتمدة لدينا | states *why*, without over-claiming |
| Reassurance | استفد من خدمات هذا المكان براحة بال وثقة | warmth, no guarantee |
| Chip | معتمد من شارع | assist chip, flat, `verified` icon |
| Slogan | كُلُّ احتياجاتِكَ في مكانٍ واحد | used once, as the brief asks |
| Slogan note | خدمات متكاملة للزوار العرب في قم | — |
| Badge | معتمد | on the approval badge, beside SHAREA |
| Primary CTA | ادخل إلى بوت شارع | gold, points at the bot |
| Secondary CTA | انضم إلى مجموعة الواتساب | **disabled** until the link is configured, labelled «قيد التفعيل» |
| Pending note | رابط مجموعة الواتساب قيد الإعداد | explains the disabled state |
| How-to title | كيف تعرف أن المكان معتمد؟ | — |
| How-to 2 | الرمز نفسه يُستخدم في جميع الأماكن المعتمدة لدى شارع، ولا يخصّ مكانًا بعينه | the honest statement about a universal code |
| Likes | ادعم شارع بضغطة / إضافة إعجاب / إعجاب | «إعجاب» is a like, no vote/rating claim |
| Likes unavailable | الإعجابات غير متاحة الآن. يمكنك دعمنا بمشاركة الصفحة. | shown instead of a fake count |
| Footer | جميع الخدمات في قم — شارع | — |

## Service descriptions

| Service | Description |
| --- | --- |
| خدمات الطلاب | متابعة للطلاب العرب: التسجيل والسكن والاحتياجات الدراسية في قم. |
| الهدايا والتذكارات | هدايا وتذكارات من قم، مع إمكانية التوصيل إلى من تحب. |
| خدمات السيارات | توصيل وتأجير سيارات للتنقل داخل قم وبين المدن. |
| الصرافة | صرافة وتغيير العملات مع متابعة مباشرة من البوت. |
| السياحة العلاجية | ترتيب المواعيد والمرافقة في المراكز الطبية. |
| الخدمات داخل المدينة | احتياجاتك اليومية والتنقل داخل المدينة. |
| الدعم المباشر | فريق يرد على استفساراتك بالعربية خطوة بخطوة. |

No prices, no durations, no "best in Qom" claims — a card describes the service
and stops.

## Trust strip

موثوق · مريح · سريع · آمن, with the caption «قيم نعمل بها في خدمة زوار قم.» — the
caption is what keeps four strong words reading as brand values rather than as a
legal or technical guarantee. The icons are `verified`, `chair`, `bolt`, `shield`.

## English text (metadata, README, alt text)

Checked as well: `README.md`, `docs/*`, `index.html` metadata, `alt` text and the
JSON-LD block. The brand is `Sharea`, the handle is `@Sharea_qombot` (q, never g),
and the page description is «…» per the table above.

## What is still open

- `WHATSAPP_GROUP_URL` in [`src/lib/site.config.ts`](../src/lib/site.config.ts) is
  empty on purpose. Until it is filled in, the WhatsApp button stays disabled and
  labelled «قيد التفعيل» — the page never shows a button that looks live but goes
  nowhere. Nothing else in the copy is provisional.
