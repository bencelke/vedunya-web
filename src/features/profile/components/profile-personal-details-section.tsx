"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileSectionCard } from "@/features/profile/components/profile-section-card";
import {
  formatDateOfBirth,
  profilePersonalDetailsSchema,
} from "@/features/profile/schemas/onboarding-schema";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

type ProfilePersonalDetailsSectionProps = {
  profile: ProfileSnapshot;
  onSave: (input: { displayName: string; dateOfBirth: string }) => Promise<void>;
};

export function ProfilePersonalDetailsSection({
  profile,
  onSave,
}: ProfilePersonalDetailsSectionProps) {
  const t = useTranslations("profile.personalDetails");
  const tProfile = useTranslations("profile");
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(
    profile.dateOfBirth ? formatDateOfBirth(profile.dateOfBirth) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const parsed = profilePersonalDetailsSchema.safeParse({
      displayName,
      dateOfBirth,
    });

    if (!parsed.success) {
      setError(tProfile("messageValidationError"));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(parsed.data);
      setEditing(false);
    } catch {
      setError(tProfile("messageSaveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProfileSectionCard
      label={t("label")}
      title={t("title")}
      description={t("description")}
    >
      {!editing ? (
        <div className="space-y-4">
          <DetailRow label={t("name")} value={profile.displayName ?? "—"} />
          <DetailRow
            label={t("birthDate")}
            value={
              profile.dateOfBirth
                ? formatDateOfBirth(profile.dateOfBirth)
                : "—"
            }
          />
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setEditing(true)}
          >
            {t("edit")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">{t("name")}</Label>
            <Input
              id="profile-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-dob">{t("birthDate")}</Label>
            <Input
              id="profile-dob"
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-accent-gold">{error}</p> : null}
          <div className="flex flex-col gap-3">
            <Button className="w-full" disabled={saving} onClick={() => void handleSave()}>
              {saving ? t("saving") : t("save")}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setDisplayName(profile.displayName ?? "");
                setDateOfBirth(
                  profile.dateOfBirth ? formatDateOfBirth(profile.dateOfBirth) : "",
                );
                setError(null);
              }}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}
    </ProfileSectionCard>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 border-b border-border-subtle/60 pb-4 last:border-b-0 last:pb-0">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-text-subtle">
        {label}
      </p>
      <p className="text-sm text-text-primary">{value}</p>
    </div>
  );
}
