import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { MysticRouteLoadingSkeleton } from "@/components/loading/mystic-route-loading";

export default function PlusLoading() {
  return (
    <>
      <AppHeader showLogin={false} showProfile />
      <AppShell>
        <MobilePage>
          <MysticRouteLoadingSkeleton variant="plus" loadingLabel="Loading Mystic Plus" />
        </MobilePage>
      </AppShell>
    </>
  );
}
