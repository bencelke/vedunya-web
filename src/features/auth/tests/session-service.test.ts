import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearServerSession,
  createServerSession,
  resetSessionSyncState,
} from "@/features/auth/services/session-service";

describe("session-service deduplication", () => {
  beforeEach(() => {
    resetSessionSyncState();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        const url = typeof input === "string" ? input : input.url;

        if (url.endsWith("/api/auth/session")) {
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        if (url.endsWith("/api/auth/logout")) {
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        return new Response(null, { status: 404 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not repeat session POST for the same id token after success", async () => {
    const fetchMock = vi.mocked(globalThis.fetch);

    await createServerSession("token-a");
    await createServerSession("token-a");

    const sessionCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).endsWith("/api/auth/session"),
    );

    expect(sessionCalls).toHaveLength(1);
  });

  it("retries session POST when the same token previously failed", async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await expect(createServerSession("token-a")).resolves.toBe(false);
    await expect(createServerSession("token-a")).resolves.toBe(true);

    const sessionCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).endsWith("/api/auth/session"),
    );

    expect(sessionCalls).toHaveLength(2);
  });

  it("does not repeat logout POST when session is already cleared", async () => {
    const fetchMock = vi.mocked(globalThis.fetch);

    await clearServerSession();
    await clearServerSession();

    const logoutCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).endsWith("/api/auth/logout"),
    );

    expect(logoutCalls).toHaveLength(1);
  });

  it("allows logout again after a new session sync", async () => {
    const fetchMock = vi.mocked(globalThis.fetch);

    await clearServerSession();
    await createServerSession("token-b");
    await clearServerSession();

    const logoutCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).endsWith("/api/auth/logout"),
    );

    expect(logoutCalls).toHaveLength(2);
  });
});
