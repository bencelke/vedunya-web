import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MysticRouteLoadingSkeleton } from "@/components/loading/mystic-route-loading";

export default function ProfileLoading() {
  return (
    <>
      <AppHeader showLogin={false} showProfile />
      <AppShell>
        <MysticRouteLoadingSkeleton variant="profile" loadingLabel="Loading profile" />
      </AppShell>
    </>
  );
}
