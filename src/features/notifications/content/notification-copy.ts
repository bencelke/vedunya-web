import type { SupportedLocale } from "@/config/app-config";
import type { ReminderType } from "@/features/notifications/types/push";

export type NotificationCopySlot = Exclude<ReminderType, "test">;

export type NotificationCopyEntry = {
  title: string;
  body: string;
};

const NOTIFICATION_COPY = {
  en: {
    morning: {
      title: "Mystic",
      body: "A quiet start for your day is ready.",
    },
    midday: {
      title: "Mystic",
      body: "Pause for a minute. Choose your next clear step.",
    },
    evening: {
      title: "Mystic",
      body: "Return to the day gently. Notice what mattered.",
    },
    universeRequest: {
      title: "Mystic",
      body: "Return to your request for one quiet minute.",
    },
    test: {
      title: "Mystic",
      body: "Mystic reminders are working on this device.",
    },
  },
  ru: {
    morning: {
      title: "Mystic",
      body: "Спокойное начало дня уже готово.",
    },
    midday: {
      title: "Mystic",
      body: "Сделайте паузу на минуту. Выберите следующий точный шаг.",
    },
    evening: {
      title: "Mystic",
      body: "Вернитесь к дню спокойно. Заметьте, что было главным.",
    },
    universeRequest: {
      title: "Mystic",
      body: "Вернитесь к своей просьбе на одну спокойную минуту.",
    },
    test: {
      title: "Mystic",
      body: "Напоминания Mystic работают на этом устройстве.",
    },
  },
} as const satisfies Record<
  "en" | "ru",
  Record<ReminderType, NotificationCopyEntry>
>;

const FAKE_GUARANTEE_PHRASES = [
  "The universe has answered.",
  "Your wish is being granted.",
  "Вселенная исполняет вашу просьбу.",
] as const;

export function getNotificationCopy(
  locale: SupportedLocale,
  reminderType: ReminderType,
): NotificationCopyEntry {
  const resolvedLocale = locale === "de" ? "en" : locale;
  return NOTIFICATION_COPY[resolvedLocale][reminderType];
}

export function listNotificationCopyBodies(): string[] {
  return (["en", "ru"] as const).flatMap((locale) =>
    (Object.keys(NOTIFICATION_COPY[locale]) as ReminderType[]).map(
      (type) => NOTIFICATION_COPY[locale][type].body,
    ),
  );
}

export function notificationCopyAvoidsFakeGuarantees(): boolean {
  const bodies = listNotificationCopyBodies();
  return FAKE_GUARANTEE_PHRASES.every((phrase) =>
    bodies.every((body) => !body.includes(phrase)),
  );
}
