import { NextRequest, NextResponse } from "next/server";

import {
  isScheduledRemindersAuthConfigured,
  verifyScheduledRemindersAuthorization,
} from "@/features/notifications/server/cron-auth";
import { dispatchScheduledReminders } from "@/features/notifications/server/scheduled-reminder-dispatcher";

export const runtime = "nodejs";

function unauthorized(): Response {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function GET(request: NextRequest): Promise<Response> {
  if (!isScheduledRemindersAuthConfigured()) {
    return unauthorized();
  }

  const authorization = request.headers.get("authorization");
  if (!verifyScheduledRemindersAuthorization(authorization)) {
    return unauthorized();
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";
  const typeFilter = request.nextUrl.searchParams.get("type");

  const summary = await dispatchScheduledReminders({
    dryRun,
    typeFilter,
  });

  if (!summary.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: summary.error ?? "dispatch_unavailable",
        checkedUsers: summary.checkedUsers,
        sent: summary.sent,
        skipped: summary.skipped,
        failed: summary.failed,
        expiredRemoved: summary.expiredRemoved,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    checkedUsers: summary.checkedUsers,
    sent: summary.sent,
    skipped: summary.skipped,
    failed: summary.failed,
    expiredRemoved: summary.expiredRemoved,
    dryRun: summary.dryRun,
  });
}
