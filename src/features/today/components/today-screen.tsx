import { DailyGuidanceAuthenticated } from "@/features/daily-guidance/components/daily-guidance-authenticated";
import type { DailyGuidanceViewModel } from "@/features/daily-guidance/types/daily-guidance-view-model";

type TodayScreenProps = {
  guidance: DailyGuidanceViewModel;
};

export function TodayScreen({ guidance }: TodayScreenProps) {
  return <DailyGuidanceAuthenticated guidance={guidance} />;
}
