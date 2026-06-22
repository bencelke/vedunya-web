import {
  Card,
  CardBody,
  CardLabel,
  CardTitle,
} from "@/components/ui/card";
import type { DailyGuidance } from "@/types/daily-guidance";

type PracticalActionCardProps = {
  guidance: DailyGuidance;
  label: string;
  title: string;
};

export function PracticalActionCard({
  guidance,
  label,
  title,
}: PracticalActionCardProps) {
  return (
    <Card>
      <CardLabel>{label}</CardLabel>
      <CardTitle>{title}</CardTitle>
      <CardBody>{guidance.action}</CardBody>
    </Card>
  );
}
