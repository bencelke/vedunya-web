import { describe, expect, it, vi } from "vitest";

import {
  getTodayDateKeyInTimeZone,
  resolveTimeZone,
} from "@/features/numerology/engine/date-only";
import { resolveMoonDateKey } from "@/features/moon/engine/date-time";

describe("moon timezone behavior", () => {
  it("validates IANA timezone names", () => {
    expect(resolveTimeZone("Europe/Berlin", "UTC")).toBe("Europe/Berlin");
    expect(resolveTimeZone("America/New_York", "UTC")).toBe("America/New_York");
    expect(resolveTimeZone("Asia/Tokyo", "UTC")).toBe("Asia/Tokyo");
    expect(resolveTimeZone("Invalid/Zone", "UTC")).toBe("UTC");
  });

  it("resolves date keys across timezones at a fixed instant", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2026, 0, 1, 2, 30, 0));

    try {
      expect(getTodayDateKeyInTimeZone("UTC")).toBe("2026-01-01");
      expect(getTodayDateKeyInTimeZone("Europe/Berlin")).toBe("2026-01-01");
      expect(getTodayDateKeyInTimeZone("America/New_York")).toBe("2025-12-31");
      expect(getTodayDateKeyInTimeZone("Asia/Tokyo")).toBe("2026-01-01");
    } finally {
      vi.useRealTimers();
    }
  });

  it("handles year boundary in resolveMoonDateKey", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2025, 11, 31, 23, 30, 0));

    try {
      expect(resolveMoonDateKey("Pacific/Kiritimati")).toBe("2026-01-01");
      expect(resolveMoonDateKey("UTC")).toBe("2025-12-31");
    } finally {
      vi.useRealTimers();
    }
  });

  it("defaults to UTC when timezone cookie is absent", () => {
    expect(resolveTimeZone(undefined, "UTC")).toBe("UTC");
  });
});
