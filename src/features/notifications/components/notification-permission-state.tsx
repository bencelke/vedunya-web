"use client";

import { useTranslations } from "next-intl";

import { isPwaEnabled } from "@/config/pwa";

type NotificationPermissionStateProps = {
  permission: NotificationPermission | "unsupported";
  pushSupported: boolean;
  configured: boolean;
  subscribed: boolean;
};

export function NotificationPermissionState({
  permission,
  pushSupported,
  configured,
  subscribed,
}: NotificationPermissionStateProps) {
  const t = useTranslations("notifications");

  let message = t("statusUnsupported");
  if (!isPwaEnabled) {
    message = t("statusDevUnavailable");
  } else if (!configured) {
    message = t("statusNotConfigured");
  } else if (!pushSupported) {
    message = t("statusUnsupported");
  } else if (permission === "denied") {
    message = t("statusDenied");
  } else if (permission === "default") {
    message = t("statusDefault");
  } else if (subscribed) {
    message = t("statusEnabled");
  } else if (permission === "granted") {
    message = t("statusGrantedNotSubscribed");
  }

  return (
    <p className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/70 px-4 py-3 text-sm leading-relaxed text-text-muted">
      {message}
    </p>
  );
}
