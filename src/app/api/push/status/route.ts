import { NextResponse } from "next/server";

import { getPushStatusSummary } from "@/features/notifications/server/push-status";
import type { SupportedLocale } from "@/config/app-config";
import { requireApiUser } from "@/lib/auth/require-api-user";

export async function GET(request: Request): Promise<Response> {
  const auth = await requireApiUser();
  if ("response" in auth) {
    return auth.response;
  }

  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale: SupportedLocale = localeParam === "ru" ? "ru" : "en";

  const summary = await getPushStatusSummary(auth.user.uid, locale);
  return NextResponse.json(summary);
}
