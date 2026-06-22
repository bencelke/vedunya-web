import type { MoonPhaseContentRecord } from "@/features/moon/types/moon";

export const moonPhaseFallbackEn: MoonPhaseContentRecord[] = [
  {
    id: "new_moon",
    titleRu: "Новолуние",
    titleEn: "New Moon",
    shortRu: "Мягкая пауза для обновления фокуса и внутренних приоритетов.",
    shortEn: "A quiet pause to refresh your focus and inner priorities.",
    deepRu:
      "Сейчас полезно упростить планы и оставить только то, что действительно поддерживает вас. Маленькие осознанные шаги создадут устойчивый старт.",
    deepEn:
      "This is a good moment to simplify plans and keep only what truly supports you. Small conscious steps create a stable beginning.",
    actionRu: "Выберите одно намерение на ближайшие дни и запишите его.",
    actionEn: "Choose one intention for the next few days and write it down.",
    warningRu: "Не перегружайте себя новыми обязательствами.",
    warningEn: "Avoid overloading yourself with new commitments.",
  },
  {
    id: "waxing",
    titleRu: "Растущая Луна",
    titleEn: "Waxing Moon",
    shortRu: "Период спокойного наращивания энергии и закрепления привычек.",
    shortEn: "A phase for steady momentum and reinforcing useful habits.",
    deepRu:
      "Подходит для последовательных действий: не рывок, а ритм. Доверяйте накопительному эффекту маленьких шагов.",
    deepEn:
      "This phase supports consistency over intensity. Trust the cumulative effect of small steps.",
    actionRu: "Сделайте один практический шаг к текущей цели.",
    actionEn: "Take one practical step toward your current goal.",
    warningRu: "Не распыляйте внимание на слишком много задач одновременно.",
    warningEn: "Do not scatter your attention across too many tasks at once.",
  },
  {
    id: "full_moon",
    titleRu: "Полнолуние",
    titleEn: "Full Moon",
    shortRu:
      "Момент ясности: лучше видно, что работает, а что пора отпустить.",
    shortEn:
      "A clarity moment: what works and what needs release becomes easier to see.",
    deepRu:
      "Полезно завершать начатое и подводить спокойные итоги. Честный обзор без самокритики помогает выбрать зрелое следующее действие.",
    deepEn:
      "This phase is good for completion and calm review. Honest reflection without self-judgment helps you choose the next mature step.",
    actionRu: "Завершите один открытый цикл и отметьте результат.",
    actionEn: "Close one open loop and acknowledge the result.",
    warningRu:
      "Избегайте импульсивных выводов в эмоционально насыщенные моменты.",
    warningEn: "Avoid impulsive conclusions during emotionally charged moments.",
  },
  {
    id: "waning",
    titleRu: "Убывающая Луна",
    titleEn: "Waning Moon",
    shortRu: "Фаза бережного очищения пространства, графика и мыслей.",
    shortEn: "A phase for gentle clearing of space, schedule, and mental load.",
    deepRu:
      "Сейчас особенно полезно уменьшать лишнее и возвращать себе ресурс. Освобождение от второстепенного повышает качество решений.",
    deepEn:
      "This is a strong time to reduce excess and recover energy. Releasing the non-essential improves decision quality.",
    actionRu: "Уберите одну лишнюю задачу из недели.",
    actionEn: "Remove one non-essential task from your week.",
    warningRu: "Не требуйте от себя максимальной скорости.",
    warningEn: "Do not demand maximum speed from yourself.",
  },
];

export const moonPhaseFallbackById = Object.fromEntries(
  moonPhaseFallbackEn.map((phase) => [phase.id, phase]),
) as Record<MoonPhaseContentRecord["id"], MoonPhaseContentRecord>;

export function fallbackMoonPhaseById(id: string): MoonPhaseContentRecord {
  const normalized = id.trim().toLowerCase();
  return (
    moonPhaseFallbackById[normalized as MoonPhaseContentRecord["id"]] ??
    moonPhaseFallbackEn[0]
  );
}
