"use client";

import { useRouter } from "@/i18n/navigation";
import type { UniverseRequestViewModel } from "@/features/universe-request/types";
import { UniverseRequestActiveCard } from "@/features/universe-request/components/universe-request-active-card";
import { UniverseRequestEmptyState } from "@/features/universe-request/components/universe-request-empty-state";

type UniverseRequestSectionProps = {
  model: UniverseRequestViewModel;
};

export function UniverseRequestSection({ model }: UniverseRequestSectionProps) {
  const router = useRouter();

  function refresh() {
    router.refresh();
  }

  if (!model.request) {
    return <UniverseRequestEmptyState onCreated={refresh} />;
  }

  return (
    <UniverseRequestActiveCard
      request={model.request}
      reflectionPrompt={model.reflectionPrompt}
      reminderStatus={model.reminderStatus!}
      onUpdated={refresh}
      onPaused={refresh}
    />
  );
}
