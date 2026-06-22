import type { SupportedProfileLocale } from "@/features/profile/constants";

export type MysticPublicProfile = {
  uid: string;
  displayName: string;
  photoUrl?: string;
  language?: SupportedProfileLocale;
  profileComplete?: boolean;
  role?: string;
  accountType?: string;
  accountState?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  premiumOverride?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
};

export type MysticPrivateProfile = {
  uid: string;
  email?: string;
  dob?: Date;
  profileComplete?: boolean;
};

export type ProfileSnapshot = {
  uid: string;
  displayName: string | null;
  email: string | null;
  dateOfBirth: Date | null;
  language: SupportedProfileLocale | null;
  profileComplete: boolean;
  authProviders: string[];
  publicProfile: MysticPublicProfile | null;
  privateProfile: MysticPrivateProfile | null;
};

export type ProfileUpdateInput = {
  displayName: string;
  dateOfBirth: Date;
  language: SupportedProfileLocale;
};
