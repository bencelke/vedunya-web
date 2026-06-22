import {
  Card,
  CardBody,
  CardLabel,
  CardTitle,
} from "@/components/ui/card";
import type { DailyGuidance } from "@/types/daily-guidance";

type DailyGuidanceCardProps = {
  guidance: DailyGuidance;
  label: string;
};

export function DailyGuidanceCard({ guidance, label }: DailyGuidanceCardProps) {
  return (
    <Card elevated>
      <CardLabel>{label}</CardLabel>
      <CardTitle>{guidance.title}</CardTitle>
      <CardBody>{guidance.guidance}</CardBody>
    </Card>
  );
}
