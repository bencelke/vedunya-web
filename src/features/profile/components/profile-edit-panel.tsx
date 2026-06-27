"use client";

import { ProfileLanguageSection } from "@/features/profile/components/profile-language-section";
import { ProfilePersonalDetailsSection } from "@/features/profile/components/profile-personal-details-section";
import type { SupportedLocale } from "@/config/app-config";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

type ProfileEditPanelProps = {
  profile: ProfileSnapshot;
  routeLocale: SupportedLocale;
  onSavePersonalDetails: (input: {
    displayName: string;
    dateOfBirth: string;
  }) => Promise<void>;
  onSaveLanguage: (language: SupportedLocale) => Promise<void>;
};

export function ProfileEditPanel({
  profile,
  routeLocale,
  onSavePersonalDetails,
  onSaveLanguage,
}: ProfileEditPanelProps) {
  return (
    <div className="space-y-4 pt-2">
      <ProfilePersonalDetailsSection profile={profile} onSave={onSavePersonalDetails} />
      <ProfileLanguageSection
        profile={profile}
        routeLocale={routeLocale}
        onSave={onSaveLanguage}
      />
    </div>
  );
}
