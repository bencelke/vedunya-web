export const USERS_COLLECTION = "users";
export const USER_PRIVATE_COLLECTION = "user_private";

export const DEFAULT_DISPLAY_NAME = "Vedunya Maria member";
export const SHELL_DISPLAY_NAME = "Mystic member";

/** Fields an owner may update on `users/{uid}` per Firestore rules. */
export const OWNER_SAFE_PUBLIC_FIELDS = [
  "uid",
  "displayName",
  "username",
  "usernameNormalized",
  "bio",
  "photoUrl",
  "language",
  "updatedAt",
  "lastSeenAt",
  "primaryInstallationId",
  "recentInstallationIds",
  "profileComplete",
  "notificationsEnabled",
  "morningNotificationTime",
  "eveningNotificationEnabled",
  "eveningNotificationTime",
  "mirrorMomentsEnabled",
] as const;

/** Fields that must never be written from the web client bootstrap or profile flows. */
export const PROTECTED_PUBLIC_FIELDS = [
  "role",
  "accountType",
  "accountState",
  "moderation",
  "isVerified",
  "badge",
  "badgeLabel",
  "badgeType",
  "badgeTitle",
  "isAdmin",
  "isOwner",
  "premiumOverride",
  "isPremium",
  "postsCount",
  "commentsCount",
] as const;

export type SupportedProfileLocale = "en" | "ru";
