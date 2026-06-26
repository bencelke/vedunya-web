# German translation backlog

German (`de`) is enabled as a UI locale with **English fallback copy** in `src/messages/de.json`. No machine-generated German spiritual copy was added. Boris will supply manual translations screen by screen.

**Strategy:** Replace English strings in `de.json` section by section. Spiritual content (numerology, runes, moon) continues to use English via `resolveSpiritualContentLocale()` until dedicated DE content exists.

---

## 1. Onboarding

| Key namespace | English source (translate manually) |
|---------------|-------------------------------------|
| `onboarding.*` | Full onboarding flow: intro steps, name, birth date, language selection, completion |
| `onboarding.intro.*` | Welcome and value proposition copy |
| `onboarding.steps.*` | Step labels and helper text |
| `onboarding.validation.*` | Form validation messages |

---

## 2. Auth

| Key namespace | English source (translate manually) |
|---------------|-------------------------------------|
| `auth.*` | Login, register, password reset, social sign-in labels |
| `auth.today.*` | Greeting templates on auth screens |
| `auth.errors.*` | Firebase/auth error messages |
| `auth.social.*` | Provider button labels (Google, Apple, Facebook) |

---

## 3. Today

| Key namespace | English source (translate manually) |
|---------------|-------------------------------------|
| `today.*` | Page meta, greeting, date labels |
| `dailyGuidance.*` | Hero eyebrow, action label, rhythm labels, profile setup messages |
| `dailyGuidance.rhythmStrip.*` | Number / Rune / Moon compact card labels |
| `universeRequest.*` | Collapsed CTA, form labels, save/cancel, active state |

---

## 4. Moon

| Key namespace | English source (translate manually) |
|---------------|-------------------------------------|
| `moon.*` | Moon screen headings, phase labels, premium lock copy |
| Moon content JSON | `content/moon/` phase and lunar day records (separate from UI messages) |

---

## 5. Runes

| Key namespace | English source (translate manually) |
|---------------|-------------------------------------|
| `runes.*` | Rune screen labels, action labels, detail headings |
| Rune content JSON | `content/runes/` daily and deep rune copy (separate from UI messages) |

---

## 6. Courses

| Key namespace | English source (translate manually) |
|---------------|-------------------------------------|
| `courses.*` | Course list, lesson reader, progress, error states |
| Course content | Firestore / static course lesson bodies per locale |

---

## 7. Profile

| Key namespace | English source (translate manually) |
|---------------|-------------------------------------|
| `profile.*` | Profile sections, edit labels, premium status, language preference |
| `premium.*` | Mystic+ lock cards and upgrade copy |

### Mystic Plus paywall pricing (`premium.paywall`)

These structural keys currently use **English fallback placeholders** in `de.json` (awaiting manual German translation):

- `plansHeading`, `monthlyTitle`, `monthlyInterval`, `monthlyDescription`
- `yearlyTitle`, `yearlyInterval`, `yearlyDescription`, `yearlyBadge`
- `paymentComingLater`, `paymentNotWiredNote`

Runtime also merges `en.json` under non-English locales, so `/de/plus` stays free of `MISSING_MESSAGE` errors even if a key is omitted later.

---

## 8. Legal / support

| Key namespace | English source (translate manually) |
|---------------|-------------------------------------|
| `legal.*` | Privacy, terms, imprint pages |
| `support.*` | Support contact and FAQ copy |
| `trust.*` | Trust section on marketing/support pages |
| `landing.*` | Public landing page (if `/de` landing is exposed) |

---

## Files to update when translating

1. `src/messages/de.json` — primary UI strings (currently English copy)
2. `content/numerology/` — personal day content (future `de` locale)
3. `content/runes/` — rune daily/deep content
4. `content/moon/` — moon phase and lunar day content
5. `src/config/locale-labels.ts` — already has `Deutsch` label (no change needed)

## Notes

- Do **not** use auto-translation for spiritual/guidance copy.
- After UI messages are translated, consider extending `SupportedNumerologyLocale`, `SupportedRuneLocale`, and `SupportedMoonLocale` to include `"de"`.
- Profile language picker (`profile-language-section.tsx`) still offers EN/RU only — extend when DE profile preference is required.
