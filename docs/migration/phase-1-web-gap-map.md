# Phase 1 — Web Gap Map

| Screen | Gap | User impact | Risk | Fix phase |
|--------|-----|-------------|------|-----------|
| Auth | No separate welcome screen; login/register on one page | Less premium first impression vs Flutter welcome | Medium | Phase 3 |
| Auth | Apple Sign-In disabled placeholder | iOS users cannot use Apple on web | Medium | Phase 3 / later |
| Auth | Light theme tokens not fully aligned to `AppColors` | Subtle visual drift from Flutter gold/ivory | Low | Phase 2 |
| Onboarding | Post-auth only; no pre-auth onboarding | New users must register before name/DOB | High | Phase 4 |
| Onboarding | No daily guidance preview step | Missing “aha” moment before account | Medium | Phase 4 |
| Onboarding | No account-creation step in wizard | Flow differs from Flutter 5-page model | Medium | Phase 4 |
| Today | Premium paywall gates on locked sections | ✅ Phase 5 — `resolvePremiumAccess`, lock card | Done | — |
| Today | Rune sigil hero scale (~168–216px) | Closer to Flutter 272px anchor | Medium | Phase 6 optional |
| Today | No cinematic top nav with avatar | Profile access pattern differs | Medium | Future shell |
| Today | No Ask Mystic CTA | Missing engagement path | Low | Post-V1 |
| Insights | Entire tab missing | No dedicated deep guidance surface | High | Phase 5+ |
| Moon | Premium extended fields gated | ✅ Phase 6 — load + lock card | Done | — |
| Moon | No manual location preferences | Location accuracy UX missing | Low | Phase 6 |
| Rune detail | Mystic visual + premium gating | ✅ Phase 6 — hero + gated deep fields | Done | — |
| Courses | Purchase flow not wired (honest coming soon) | ✅ Phase 7 — locked preview, no fake checkout | Done | Payments |
| Courses | Single local V1 course in catalog | Expected for V1 fallback | Low | Future catalog |
| Courses | “24 Steps” vs 28 lessons mismatch | Confusing marketing | Low | Phase 7 |
| Profile | Bottom-nav tab vs pushed route | IA mismatch with Flutter | Low | Phase 2 (accept or change) |
| Profile | No notification settings screen | Cannot manage notification prefs | Medium | Phase 7+ |
| Profile | Subscription UI is placeholder only | No Mystic Plus management | Medium | PayPal phase |
| Profile | No admin hub entry | Staff cannot manage content on web | Low | Admin phase |
| Shell | Bottom nav uses Lucide not Mystic icons | Visual polish gap | Low | Phase 2 |
| Shell | No launch splash | Cold start less branded | Low | PWA phase |
| Shell | Insights + Feed tabs absent | Intentional V1 scope | — | Product decision |
| Paywall | Not implemented | No subscription revenue on web | High | PayPal phase |
| PWA | No install prompt / manifest polish | No add-to-home-screen | Medium | Phase 8 |
