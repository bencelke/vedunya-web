import type { SupportedLocale } from "@/config/app-config";

const REFLECTION_PROMPTS: Record<SupportedLocale, readonly string[]> = {
  en: [
    "Return to this request for one quiet minute today.",
    "What is one small step that supports this request?",
    "Keep this request clear. Do not force the outcome.",
    "Pause before you act. Let this request guide one choice today.",
    "Name what you can control today — and release the rest.",
    "Return to what matters. One honest step is enough.",
    "Hold this request lightly. Steady effort beats urgency.",
  ],
  ru: [
    "Вернитесь к этой просьбе на одну спокойную минуту.",
    "Какой один маленький шаг сегодня поддержит эту просьбу?",
    "Держите просьбу ясно. Не пытайтесь силой ускорить результат.",
    "Сделайте паузу перед действием. Пусть просьба направит один выбор сегодня.",
    "Назовите то, что вы можете контролировать сегодня — остальное отпустите.",
    "Вернитесь к главному. Одного честного шага достаточно.",
    "Держите просьбу легко. Спокойное усилие важнее спешки.",
  ],
};

function hashDateKey(dateKey: string): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pickReflectionPrompt(
  dateKey: string,
  locale: SupportedLocale,
): string {
  const prompts = REFLECTION_PROMPTS[locale];
  const index = hashDateKey(dateKey) % prompts.length;
  return prompts[index] ?? prompts[0];
}
