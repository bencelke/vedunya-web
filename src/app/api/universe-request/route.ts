import { NextRequest, NextResponse } from "next/server";

import {
  pauseUniverseRequest,
  patchUniverseRequest,
  readUniverseRequestRaw,
  upsertUniverseRequest,
} from "@/features/universe-request/server/universe-request-repository";
import {
  universeRequestPatchSchema,
  universeRequestUpsertSchema,
} from "@/features/universe-request/schema";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { jsonError } from "@/lib/auth/request-guards";

export async function GET(): Promise<Response> {
  const auth = await requireApiUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const request = await readUniverseRequestRaw(auth.user.uid);
    const active = request?.isActive ? request : null;
    return NextResponse.json({ ok: true, request: active });
  } catch {
    return jsonError("Unable to load request.", 503);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const auth = await requireApiUser();
  if ("response" in auth) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = universeRequestUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request.", 400);
  }

  try {
    const saved = await upsertUniverseRequest({
      uid: auth.user.uid,
      text: parsed.data.text,
      category: parsed.data.category ?? null,
      reminderEnabled: parsed.data.reminderEnabled,
      reminderTime: parsed.data.reminderTime ?? null,
    });

    return NextResponse.json({ ok: true, request: saved });
  } catch {
    return jsonError("Unable to save request.", 503);
  }
}

export async function PATCH(request: NextRequest): Promise<Response> {
  const auth = await requireApiUser();
  if ("response" in auth) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = universeRequestPatchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request.", 400);
  }

  try {
    const saved = await patchUniverseRequest({
      uid: auth.user.uid,
      ...parsed.data,
    });

    if (!saved) {
      return jsonError("Request not found.", 404);
    }

    const active = saved.isActive ? saved : null;
    return NextResponse.json({ ok: true, request: active });
  } catch {
    return jsonError("Unable to update request.", 503);
  }
}

export async function DELETE(): Promise<Response> {
  const auth = await requireApiUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const paused = await pauseUniverseRequest(auth.user.uid);
    if (!paused) {
      return jsonError("Request not found.", 404);
    }

    return NextResponse.json({ ok: true, request: null });
  } catch {
    return jsonError("Unable to pause request.", 503);
  }
}
