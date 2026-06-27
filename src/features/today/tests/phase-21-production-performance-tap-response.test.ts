import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 21 — production tap response and performance", () => {
  it("login submit keeps disabled state until redirect on success", () => {
    const form = readSource("src/features/auth/components/login-form.tsx");

    expect(form).toContain("setSubmitting(true)");
    expect(form).toContain("succeeded = true");
    expect(form).toContain("if (!succeeded)");
    expect(form).toContain("setSubmitting(false)");
  });

  it("Google button enters pending state immediately and stays pending on success", () => {
    const button = readSource("src/features/auth/components/social-auth-button.tsx");

    expect(button).toContain("setSubmitting(true)");
    expect(button).toContain("disabled={submitting}");
    expect(button).toContain("submitting ? t(\"submitting\")");
    expect(button).toContain("succeeded = true");
    expect(button).toContain("if (!succeeded)");
  });

  it("onboarding finish prevents double click while saving", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");

    expect(flow).toContain("setSubmitting(true)");
    expect(flow).toContain("disabled={submitting");
    expect(flow).toContain("submitting ? t(\"saving\")");
  });

  it("universe request save prevents duplicate submit", () => {
    const form = readSource(
      "src/features/universe-request/components/universe-request-form.tsx",
    );

    expect(form).toContain("const [submitting, setSubmitting] = useState(false)");
    expect(form).toContain("disabled={submitting}");
  });

  it("bottom nav links prefetch=false and show immediate pending feedback", () => {
    const nav = readSource("src/components/layout/bottom-navigation.tsx");

    expect(nav).toContain("prefetch={false}");
    expect(nav).toContain("setPendingHref(item.href)");
    expect(nav).toContain("touch-manipulation");
    expect(nav).toContain("active:scale-[0.97]");
  });

  it("dedupes profile-status calls through a shared cache", () => {
    const cache = readSource("src/features/auth/services/profile-status-cache.ts");
    const authScreen = readSource("src/features/auth/components/auth-screen.tsx");
    const onboardingRoute = readSource(
      "src/features/onboarding/components/onboarding-route.tsx",
    );

    expect(cache).toContain("inflightPromise");
    expect(cache).toContain("PROFILE_STATUS_CACHE_MS");
    expect(authScreen).toContain("fetchProfileStatusCached");
    expect(onboardingRoute).toContain("fetchProfileStatusCached");
    expect(authScreen).not.toContain('fetch("/api/auth/profile-status"');
    expect(onboardingRoute).not.toContain('fetch("/api/auth/profile-status"');
  });

  it("session service dedupes duplicate session posts for the same token", () => {
    const session = readSource("src/features/auth/services/session-service.ts");

    expect(session).toContain("lastSyncedToken");
    expect(session).toContain("syncPromise");
    expect(session).toContain("if (lastSyncedToken === idToken)");
  });

  it("removes unnecessary router.refresh from auth and onboarding redirect paths", () => {
    const authScreen = readSource("src/features/auth/components/auth-screen.tsx");
    const onboardingFlow = readSource(
      "src/features/onboarding/components/onboarding-flow.tsx",
    );
    const onboardingRoute = readSource(
      "src/features/onboarding/components/onboarding-route.tsx",
    );
    const todayPage = readSource("src/app/[locale]/today/page.tsx");

    expect(authScreen).not.toContain("router.refresh");
    expect(onboardingFlow).not.toContain("router.refresh");
    expect(onboardingRoute).not.toContain("router.refresh");
    expect(todayPage).not.toContain("router.refresh");
  });

  it("adds route-level loading UI for profile and plus", () => {
    const profileLoading = readSource("src/app/[locale]/profile/loading.tsx");
    const plusLoading = readSource("src/app/[locale]/plus/loading.tsx");
    const skeleton = readSource("src/components/loading/mystic-route-loading.tsx");

    expect(profileLoading).toContain("MysticRouteLoadingSkeleton");
    expect(plusLoading).toContain("MysticRouteLoadingSkeleton");
    expect(skeleton).toContain("mystic-route-loading");
    expect(profileLoading).toContain('variant="profile"');
    expect(plusLoading).toContain('variant="plus"');
  });

  it("disables accidental prefetch on heavy plus paywall links", () => {
    const link = readSource("src/features/premium/components/mystic-plus-paywall-link.tsx");

    expect(link).toContain("prefetch={false}");
  });

  it("uses touch-manipulation and faster active states on primary buttons", () => {
    const button = readSource("src/components/ui/button.tsx");
    const globals = readSource("src/app/globals.css");

    expect(button).toContain("touch-manipulation");
    expect(button).toContain("active:scale-[0.98]");
    expect(button).toContain("duration-100");
    expect(globals).toContain("touch-action: manipulation");
  });

  it("reduces mobile backdrop-filter cost in mystic chrome", () => {
    const theme = readSource("src/styles/mystic-theme.css");

    expect(theme).toContain("@media (max-width: 768px)");
    expect(theme).toContain(".mystic-chrome-nav-inner");
    expect(theme).toContain("backdrop-filter: none");
    expect(theme).toContain(".mystic-app-page::before");
    expect(theme).toContain("position: absolute");
  });
});
