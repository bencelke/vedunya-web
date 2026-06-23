import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { MoonErrorState } from "@/features/moon/components/moon-error-state";
import { MoonGuidanceSection } from "@/features/moon/components/moon-guidance-section";
import { TimezoneCookieSync } from "@/features/numerology/components/timezone-cookie-sync";
import type { MoonGuidanceLoadResult } from "@/features/moon/types/moon";

type MoonScreenProps = {
  moon: MoonGuidanceLoadResult;
};

export function MoonScreen({ moon }: MoonScreenProps) {
  return (
    <>
      <TimezoneCookieSync />
      <AppHeader showLogin={false} />
      <AppShell>
        <MobilePage className="mystic-today-column py-6 pt-safe-top">
          {moon.status === "ready" ? (
            <MoonGuidanceSection guidance={moon.guidance} />
          ) : (
            <MoonErrorState />
          )}
        </MobilePage>
      </AppShell>
    </>
  );
}
