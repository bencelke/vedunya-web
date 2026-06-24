export const UNIVERSE_REQUEST_CATEGORIES = [
  "love",
  "family",
  "money",
  "protection",
  "health",
  "path",
  "work",
  "other",
] as const;

export type UniverseRequestCategory = (typeof UNIVERSE_REQUEST_CATEGORIES)[number];

export type UniverseRequestRecord = {
  text: string;
  category: UniverseRequestCategory | null;
  isActive: boolean;
  reminderEnabled: boolean;
  reminderTime: string | null;
  createdAt: string;
  updatedAt: string;
  pausedAt: string | null;
};

export type UniverseRequestReminderStatus = {
  globalRemindersEnabled: boolean;
  slotEnabled: boolean;
  time: string;
};

export type UniverseRequestViewModel = {
  request: UniverseRequestRecord | null;
  reflectionPrompt: string;
  dateKey: string;
  reminderStatus: UniverseRequestReminderStatus | null;
};
