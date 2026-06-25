import type { SupportedLocale } from "@/config/app-config";

type GlimpseNote = {
  note: string;
};

const EN_NOTES: GlimpseNote[] = [
  {
    note: "Do not grab everything at once today. Choose one important action and finish it.",
  },
  {
    note: "Before you respond to pressure, take one quiet minute. Clarity often arrives when the pace slows.",
  },
  {
    note: "Let one small task be enough for now. Completion matters more than starting many things.",
  },
  {
    note: "Notice what already feels settled. You do not need every answer before your next step.",
  },
  {
    note: "Keep your attention on one conversation or decision that truly matters today.",
  },
  {
    note: "Release one obligation that no longer needs your energy. Simplify before you push forward.",
  },
  {
    note: "Write down one intention for today, then return to it once before the day ends.",
  },
];

const RU_NOTES: GlimpseNote[] = [
  {
    note: "Сегодня не хватайтесь за всё сразу. Выберите одно важное действие и доведите его до конца.",
  },
  {
    note: "Прежде чем реагировать на давление, найдите минуту тишины. Ясность часто приходит, когда темп замедляется.",
  },
  {
    note: "Пусть одной небольшой задачи будет достаточно. Завершение важнее, чем начать много дел сразу.",
  },
  {
    note: "Отметьте, что уже кажется ясным. Не нужно знать всё перед следующим шагом.",
  },
  {
    note: "Держите внимание на одном разговоре или решении, которое действительно важно сегодня.",
  },
  {
    note: "Отпустите одну обязанность, которая больше не требует вашей энергии. Упростите, прежде чем ускоряться.",
  },
  {
    note: "Запишите одно намерение на сегодня и вернитесь к нему хотя бы один раз до конца дня.",
  },
];

function dayIndexFromDate(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfYear = Math.floor((current - start) / 86_400_000);
  return dayOfYear;
}

export function getFirstGlimpseNote(
  locale: SupportedLocale,
  forDate: Date = new Date(),
): string {
  const pool = locale === "ru" ? RU_NOTES : EN_NOTES;
  const index = dayIndexFromDate(forDate) % pool.length;
  return pool[index]?.note ?? pool[0].note;
}

export function getFirstGlimpsePoolSize(locale: SupportedLocale): number {
  return locale === "ru" ? RU_NOTES.length : EN_NOTES.length;
}
