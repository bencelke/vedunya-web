import type { DailyGuidance } from "@/types/daily-guidance";

export const mockDailyGuidanceEn: DailyGuidance = {
  date: "2026-06-13",
  title: "Make space before you decide",
  guidance:
    "Today favors clarity over speed. Before responding to pressure, take one quiet minute to notice what you already know. A calmer read of the situation will serve you better than a quick answer.",
  action:
    "Write down one decision you are carrying. Note what feels settled and what still needs time.",
  moonPhase: "Waning gibbous",
  moonGuidance:
    "A waning moon supports release and refinement. Let go of one small obligation that no longer needs your attention today.",
};

export const mockDailyGuidanceRu: DailyGuidance = {
  date: "2026-06-13",
  title: "Сначала пространство, потом решение",
  guidance:
    "Сегодня важнее ясность, чем скорость. Прежде чем реагировать на давление, найдите минуту тишины и отметьте, что вы уже понимаете. Спокойный взгляд на ситуацию принесёт больше пользы, чем поспешный ответ.",
  action:
    "Запишите одно решение, которое сейчас на вас давит. Отметьте, что уже ясно, а что ещё требует времени.",
  moonPhase: "Убывающая луна",
  moonGuidance:
    "Убывающая луна поддерживает отпускание и упрощение. Сегодня можно отложить одну мелкую обязанность, которая больше не требует вашего внимания.",
};

export function getMockDailyGuidance(locale: string): DailyGuidance {
  return locale === "ru" ? mockDailyGuidanceRu : mockDailyGuidanceEn;
}
