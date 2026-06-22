# Mystic Data Contracts

Firestore paths, field contracts, and TypeScript interfaces derived from the Flutter app (`C:\Users\1\development\mystic_app`). No secrets or real user data included.

Rules reference: `C:\Users\1\development\mystic_app\firestore.rules`

---

## User profile

### Public document: `users/{uid}`

**Readers:** any signed-in user  
**Writers:** owner (safe fields) or admin/moderator (moderation keys)

```typescript
interface PublicUserProfile {
  uid: string;
  displayName: string;
  username?: string;
  usernameNormalized?: string;
  photoUrl?: string;
  bio?: string;
  language?: "en" | "ru";
  role?: "user" | "owner" | "admin" | "editor" | "viewer" | string;
  accountType?: "standard" | "god" | string;
  accountState?: "active" | "blocked" | "banned" | "suspended";
  isVerified?: boolean;
  isPremium?: boolean; // server/admin flag
  premiumOverride?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  badge?: string;
  badgeLabel?: string;
  badgeType?: string;
  badgeTitle?: { en?: string; ru?: string };
  postsCount?: number;
  commentsCount?: number;
  createdAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
  lastSeenAt?: FirebaseTimestamp;
  lastLoginAt?: FirebaseTimestamp;
  primaryInstallationId?: string;
  recentInstallationIds?: string[];
  profileComplete?: boolean;
  authProviders?: string[]; // e.g. "password", "google.com", "apple.com"
  notificationsEnabled?: boolean;
  morningNotificationTime?: string; // "HH:mm"
  eveningNotificationEnabled?: boolean;
  eveningNotificationTime?: string;
  mirrorMomentsEnabled?: boolean;
  moderation?: UserModeration;
}
```

**Sources:** `lib/features/user_management/domain/public_member_profile.dart`, `lib/features/auth/application/user_bootstrap_service.dart`

**DOB is NOT stored on public profile in the canonical path** — it lives in `user_private`. Legacy reads may check `users.dob` Timestamp as fallback in `UserProfileSnapshotService`.

### Private document: `user_private/{uid}`

**Readers/writers:** owner only

```typescript
interface PrivateUserProfile {
  uid: string;
  email?: string;
  dob?: FirebaseTimestamp; // date-only semantics after read
  profileComplete?: boolean;
  createdAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
  lastLoginAt?: FirebaseTimestamp;
}
```

**DOB storage format:** Firestore `Timestamp` written via `Timestamp.fromDate(dob)` in `UserProfileService.completeProfile`. Read back as local date-only: `DateTime(t.year, t.month, t.day)`.

**Profile completion sequence:**

1. Firebase Auth account created
2. `AuthOrchestrator` → `UserBootstrapService` merge `users` + `user_private`
3. `ProfileSetupScreen` or onboarding → `UserProfileService.completeProfile` sets `profileComplete: true`, `dob`, `language`
4. `AuthGate` blocks app until `profileComplete === true`

**When DOB absent:**

- `DailyGuidanceLoader` returns fallback message key `guidance_fallback_no_dob`
- Unsigned users: `profileComplete = onboardingComplete && dob != null` from local prefs
- Local DOB cached in SharedPreferences via `user_profile_local.dart`

### Username reservation: `user_usernames/{handle}`

```typescript
interface UsernameReservation {
  uid: string;
  username?: string;
  updatedAt?: FirebaseTimestamp;
}
```

---

## Course progress: `users/{uid}/courseProgress/{courseId}`

**Readers/writers:** owner only

```typescript
interface CourseProgress {
  courseId: string;
  isEnrolled?: boolean;
  isCompleted?: boolean;
  startedAt?: FirebaseTimestamp;
  lastOpenedAt?: FirebaseTimestamp;
  completedAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
  progressPercent?: number; // 0–100
  completedLessonIds?: string[];
  lastLessonId?: string;
  bookmarkedLessonIds?: string[];
}
```

**Local fallback:** SharedPreferences via `CourseLocalProgressService` (keys `course_progress_*_v1_{courseId}`).

**Known course IDs:**

| courseId | Slug | Product ID |
|----------|------|------------|
| `runes-first-steps` | `runes-first-steps` | free |
| `runes_24_inner_strength` | `living-the-runes` | `course_runes_24_inner_strength` |
| `lunar_path_30_days` | `lunar-path-30-days` | `course_lunar_path_30_days` |

---

## Numerology contracts

### Today pipeline (Sujok) — **authoritative for Today screen**

```typescript
function computeSujokPersonalDay(dob: DateParts, forDate: DateParts): number {
  const raw =
    forDate.day +
    forDate.month +
    forDate.year +
    dob.day +
    dob.month;
  return reduceToDigit1to9(raw); // always 1–9, masters folded
}
```

**Source:** `lib/services/daily_guidance/personal_day_numerology_service.dart`

**Copy lookup:** local `PersonalDayGuidanceDataset.forDigit(digit, locale)` — not Firestore in Today path.

```typescript
interface NumerologyDailyData {
  personalDayNumber: number; // 1–9
  title: string;
  summary: string;
  doAdvice: string;
  avoidAdvice: string;
}
```

### Classical numerology (profile / legacy Today reading)

```typescript
function sumDigits(n: number): number;
function reduceNumber(n: number, allowMaster?: boolean): number; // preserves 11, 22, 33
function reduceToDigit1to9(value: number): number; // folds masters

function lifePath(dob: DateParts): number;
function personalYear(dob: DateParts, forDate: DateParts): number;
function personalMonth(dob: DateParts, forDate: DateParts): number;
function personalDay1to9(dob: DateParts, forDate: DateParts): number;
```

**Source:** `lib/core/utils/numerology_service.dart`

### Firestore numerology CMS (legacy path)

| Collection | Doc ID | Fields |
|------------|--------|--------|
| `numerology_base/{n}` | `"1"`–`"9"` (+ masters) | `number`, `name`, `nameRu`, `archetype`, `guidanceShort`, … |
| `numerology_profiles/{n}` | digit | `title`, `summary`, `advice`, `warning` (nested `{en}`) |
| `daily_mappings/{YYYY-MM-DD}` | date | `numbers`: `{ personalDayDigit: cardId }` |

### Personal day → card cluster (classical path only)

```typescript
const dayToCardCluster: Record<number, "action" | "reflection" | "stability"> = {
  1: "action", 2: "reflection", 3: "action", 4: "stability",
  5: "action", 6: "stability", 7: "reflection", 8: "action", 9: "reflection",
};
```

---

## Moon contracts

### Engine output (`MoonEngineService`)

Synodic approximation (UTC-normalized):

```typescript
const SYNODIC_MONTH = 29.53058867;
const REFERENCE_NEW_MOON_JD = 2451550.1; // 2000-01-06 18:14 UTC

interface MoonEngineResult {
  phase8Id: MoonPhase8Id;
  phase4Id: MoonPhase4Id;
  moonAgeDays: number;
  illuminationPercent: number;
  cycleProgress: number; // 0..1
  nextMajorPhaseId: string;
  daysUntilNextMajorPhase: number;
  phaseAngle: number;
  isWaxing: boolean;
}
```

**Phase8 IDs:** `new_moon`, `waxing_crescent`, `first_quarter`, `waxing_gibbous`, `full_moon`, `waning_gibbous`, `last_quarter`, `waning_crescent`

**Phase4 IDs:** `new_moon`, `waxing`, `full_moon`, `waning`

**Lunar day:** `floor(moonAgeDays) + 1`, clamped 1–30, `accuracyMode: 'approximate'`

**Timezone:** collected via `MoonInputBuilderService` but **not applied** to core math today.

### Firestore: `moon_phases/{phase4Id}`

Merged over local fallback. Fields include localized `titleRu/En`, `shortRu/En`, `deepRu/En`, `actionRu/En`, `warningRu/En`.

### Firestore: `lunar_days/{dayNumber}`

Doc ID: `"1"` … `"30"`

```typescript
interface LunarDayDocument {
  day: number;
  energyLevel: string;
  focusKey: string;
  ru: LunarDayLocaleBlock;
  en: LunarDayLocaleBlock;
}

interface LunarDayLocaleBlock {
  title: string;
  short: string;
  deep: string;
  focus: string;
  action: string;
  warning: string;
  ritual: string;
  reflection: string;
}
```

**Free vs premium (UI):** free shows `short`; premium adds `deep`, `action`, `warning`, `ritual`, `reflection`.

### Moon climate (structured tags)

```typescript
interface MoonClimate {
  phaseId: string;
  lunarDayNumber: number;
  climateTags: string[];
  pacingStyle: "steady" | "building" | "crest" | "releasing" | "still";
  sensitivityLevel: "low" | "medium" | "high";
  permeabilityLevel: "contained" | "moderate" | "porous";
  cautionBias: "light" | "normal" | "elevated";
}
```

---

## Rune contracts

### Canonical 24 Elder Futhark IDs (insertion order for `seed % 24`)

| Index | Canonical ID | Legacy aliases |
|-------|--------------|----------------|
| 0 | `fehu` | |
| 1 | `uruz` | |
| 2 | `thurisaz` | `turisaz` |
| 3 | `ansuz` | |
| 4 | **`raido`** | **`raidho`** |
| 5 | `kenaz` | `kano` |
| 6 | `gebo` | |
| 7 | `wunjo` | |
| 8 | `hagalaz` | |
| 9 | `nauthiz` | `nautiz` |
| 10 | `isa` | |
| 11 | `jera` | |
| 12 | `eihwaz` | `eiwaz` |
| 13 | `perthro` | `pertha` |
| 14 | `algiz` | |
| 15 | `sowilo` | `sowulo` |
| 16 | `tiwaz` | |
| 17 | `berkano` | `berkana` |
| 18 | `ehwaz` | |
| 19 | `mannaz` | |
| 20 | `laguz` | |
| 21 | `ingwaz` | |
| 22 | `dagaz` | |
| 23 | `othala` | |

**Normalization:** `normalizeRuneKey()` in `lib/constants/rune_asset_map.dart`

### Daily rune selection (Today)

```typescript
function selectDailyRune(
  personalDayNumber: number,
  forDate: DateParts,
): { runeKey: string; seed: number } {
  const dayOfYear = daysSinceJan1(forDate); // local calendar
  const seed = personalDayNumber * 1009 + dayOfYear + forDate.month * 31;
  const runeKey = ELDER_FUTHARK_ORDER[seed % 24];
  return { runeKey, seed };
}
```

**Note:** `dateOfBirth` is passed but **not used** in seed. Message/action indices use `forDate.day % list.length`.

### Firestore: `runes/{canonicalId}`

```typescript
interface RuneFirestoreDocument {
  id: string;
  tags: string[];
  sortOrder: number;
  isActive: boolean;
  translations: {
    en: RuneTranslation;
    ru: RuneTranslation;
    [locale: string]: RuneTranslation;
  };
  insights?: RuneInsightsContent; // Insights tab topics
}

interface RuneTranslation {
  title: string;
  short: string;
  deep: string;
  action: string;
  warning: string;
  affirmation: string;
  reflection: string;
}
```

Fields may be `string | string[]`; arrays pick variant via FNV hash keyed by date.

**Today output (modular path):**

```typescript
interface RuneDailyData {
  runeKey: string;
  runeName: string;
  summary: string;
  actionAdvice: string;
  // deep, warning, affirmation, reflection: not populated on Today
}
```

---

## Daily guidance contract

### Loader gates

```typescript
type DailyGuidanceLoadResult =
  | { status: "ok"; data: DailyGuidanceData }
  | { status: "fallback"; messageKey: "guidance_fallback_incomplete" | "guidance_fallback_no_dob" }
  | { status: "error" };
```

### Composed model

```typescript
interface DailyGuidanceData {
  date: Date;
  personalDayNumber: number;
  guidanceHeadline: string;
  guidanceBody: string;
  guidanceCaution: string;
  guidanceReflection: string;
  guidanceAction: string;
  dailyStateId: string;
  energyLevel: "low" | "medium" | "high";
  moonPhaseId: string; // 4-phase
  moonPhase8Id: string; // 8-phase art key
  moonPhase: MoonPhaseData;
  lunarDayContent?: LunarDayContentData;
  oracle: DailyOracleBundle;
}
```

**Premium state ID:** resolved by `PremiumDailyStateMapper` from personal day + rune family + lunar day + energy level → string like `patience_before_action`.

**Remote override:** `daily_editorial_states/{dailyStateId}` when `status === "published"`.

**Oracle card mirror:** Firestore `cards/{cardId}` or local fallbacks `flame`, `mirror`, `path`.

---

## Notification contract

### Runtime collection: `notification_copy/{stateId}`

**Not** `app_content/notification_templates` (seed-only, unused by Flutter).

```typescript
interface NotificationCopyDocument {
  morning?: { en?: string[]; ru?: string[] };
  midday?: { en?: string[]; ru?: string[] };
  evening?: { en?: string[]; ru?: string[] };
}
```

**Selection index:**

- If `variantSalt` provided: `variantSalt % list.length`
- Else: `(day + month) % list.length`

**Schedule:**

| Slot | Time | Premium required |
|------|------|------------------|
| Morning | user pref (default 08:00) | no |
| Midday | 13:00 fixed | yes |
| Evening | user pref (default 21:00) | if enabled |
| Mirror moments | 11:11, 22:22, 00:00 | yes + toggle |

**Tap navigation:** currently none (empty handler).

---

## Entitlement contract

### RevenueCat (mobile)

```typescript
const REVENUECAT_ENTITLEMENT_ID = "premium";
const REVENUECAT_OFFERING_ID = "default";

const ONE_TIME_PRODUCT_IDS = [
  "course_runes_24_inner_strength",
  "course_lunar_path_30_days",
] as const;
```

### Effective premium resolution

```typescript
function hasPremiumAccess(
  profile: PublicUserProfile,
  storeEntitlementActive: boolean,
  superAdminEmail: boolean,
): boolean {
  return (
    superAdminEmail ||
    profile.isOwner === true ||
    profile.premiumOverride === true ||
    storeEntitlementActive
  );
}
```

**Source:** `lib/core/access/user_access_resolver.dart`

**Web replacement:** PayPal subscriptions + one-time purchases must write compatible flags:

- Subscription → treat like RevenueCat `premium` entitlement OR set `isPremium` server-side
- Course purchase → product ownership map equivalent to `PremiumService.ownsProduct(productId)`
- Preserve `premiumOverride`, `isOwner` for staff

**Paid course access:** subscription does **not** unlock paid courses — separate IAP check.

---

## Admin contract (recommended for web)

Current Flutter admin uses Firestore fields `isOwner`, `isAdmin`, `role` + super-admin email allowlist (`lib/core/access/super_admin_access.dart`).

**Recommended web contract:**

```typescript
interface AdminClaims {
  admin?: boolean;
  role?: "owner" | "admin" | "editor" | "viewer";
}

// Verify on server for every admin API route:
// 1. Firebase ID token custom claims
// 2. Cross-check Firestore users/{uid}.role for moderation actions
// 3. Never rely on client-side route hiding alone
```

---

## Universe request: `users/{uid}/universe_requests/{requestId}`

```typescript
interface UniverseRequest {
  userId: string;
  text: string; // 8–240 chars
  category?: string;
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
  isActive: boolean;
  reminderEnabled?: boolean;
  morningEnabled?: boolean;
  eveningEnabled?: boolean;
  mirror1111Enabled?: boolean;
  mirror2222Enabled?: boolean;
  mirror0000Enabled?: boolean;
  customTimeEnabled?: boolean;
  customTimeHour?: number;
  customTimeMinute?: number;
}
```

---

## Sanity CMS (library)

| Setting | Value |
|---------|-------|
| Project ID | `nw880jmc` |
| Dataset | `production` |
| Schemas | `mystic/schemaTypes/` (`libraryItem`, `course`, `courseLesson`, …) |

No private tokens in app — public GROQ HTTP only.
