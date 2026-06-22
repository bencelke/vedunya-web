import { DailyGuidanceLoadingSkeleton } from "@/features/daily-guidance/components/daily-guidance-loading";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";

export default function TodayLoading() {
  return (
    <AppShell>
      <MobilePage>
        <DailyGuidanceLoadingSkeleton />
      </MobilePage>
    </AppShell>
  );
}
