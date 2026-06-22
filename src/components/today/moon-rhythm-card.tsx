import {
  Card,
  CardBody,
  CardLabel,
  CardTitle,
} from "@/components/ui/card";
import type { DailyGuidance } from "@/types/daily-guidance";

type MoonRhythmCardProps = {
  guidance: DailyGuidance;
  label: string;
};

export function MoonRhythmCard({ guidance, label }: MoonRhythmCardProps) {
  return (
    <Card>
      <CardLabel>{label}</CardLabel>
      <CardTitle>{guidance.moonPhase}</CardTitle>
      <CardBody>{guidance.moonGuidance}</CardBody>
    </Card>
  );
}
