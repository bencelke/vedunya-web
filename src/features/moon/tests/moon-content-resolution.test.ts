import { describe, expect, it, vi, beforeEach } from "vitest";

import { fallbackMoonPhaseById } from "@/features/moon/content/moon-phase-fallback.en";
import {
  loadLunarDayContent,
  loadMoonPhaseContent,
} from "@/features/moon/repositories/moon-content-repository";
import {
  localizeLunarDayContent,
  localizeMoonPhaseContent,
} from "@/features/moon/services/moon-content-service";

vi.mock("@/lib/firebase-admin/firestore", () => ({
  getFirebaseAdminFirestore: vi.fn(),
}));

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin/firestore";

const mockGet = vi.fn();
const mockDoc = vi.fn(() => ({ get: mockGet }));
const mockCollection = vi.fn(() => ({ doc: mockDoc }));

describe("moon content resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFirebaseAdminFirestore).mockReturnValue({
      collection: mockCollection,
    } as never);
  });

  it("returns valid Firestore phase content merged over fallback", async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      id: "waxing",
      data: () => ({
        titleEn: "Custom Waxing",
        shortEn: "Custom short",
      }),
    });

    const result = await loadMoonPhaseContent("waxing");
    expect(result.source).toBe("firestore");
    expect(result.record.titleEn).toBe("Custom Waxing");
    expect(result.record.shortEn).toBe("Custom short");
    expect(result.record.actionEn).toBeTruthy();
  });

  it("uses fallback when phase document is missing", async () => {
    mockGet.mockResolvedValueOnce({ exists: false });
    const result = await loadMoonPhaseContent("full_moon");
    expect(result.source).toBe("fallback");
    expect(result.record.id).toBe("full_moon");
  });

  it("uses fallback fields when phase content is malformed", async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ titleEn: 123 }),
    });
    const result = await loadMoonPhaseContent("waning");
    expect(result.source).toBe("firestore");
    expect(result.record.titleEn).toBe(fallbackMoonPhaseById("waning").titleEn);
  });

  it("localizes requested locale", () => {
    const localized = localizeMoonPhaseContent(
      fallbackMoonPhaseById("new_moon"),
      "ru",
      true,
    );
    expect(localized.title).toBe("Новолуние");
  });

  it("falls back to EN lunar-day strings when RU is missing", () => {
    const localized = localizeLunarDayContent(
      {
        day: 1,
        energyLevel: "low",
        focusKey: "start",
        ru: {
          title: "",
          short: "",
          deep: "",
          focus: "",
          action: "",
          warning: "",
          ritual: "",
          reflection: "",
        },
        en: {
          title: "Day One",
          short: "Short EN",
          deep: "",
          focus: "",
          action: "",
          warning: "",
          ritual: "",
          reflection: "",
        },
      },
      "ru",
      false,
    );
    expect(localized.short).toBe("Short EN");
  });

  it("loads valid lunar-day document", async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        day: 14,
        translations: {
          en: { title: "Day 14", short: "Short copy" },
          ru: { title: "День 14", short: "Кратко" },
        },
      }),
    });

    const result = await loadLunarDayContent(14);
    expect(result.source).toBe("firestore");
    expect(result.record?.day).toBe(14);
  });

  it("returns missing when lunar-day document is absent", async () => {
    mockGet.mockResolvedValueOnce({ exists: false });
    const result = await loadLunarDayContent(15);
    expect(result.source).toBe("missing");
    expect(result.record).toBeNull();
  });

  it("returns missing when lunar-day content is malformed", async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ translations: { en: {}, ru: {} } }),
    });
    const result = await loadLunarDayContent(16);
    expect(result.record).toBeNull();
  });

  it("uses fallback when Firebase admin is unavailable", async () => {
    vi.mocked(getFirebaseAdminFirestore).mockReturnValue(null);
    const phase = await loadMoonPhaseContent("new_moon");
    const lunar = await loadLunarDayContent(1);
    expect(phase.source).toBe("fallback");
    expect(lunar.source).toBe("missing");
  });

  it("does not perform writes", async () => {
    mockGet.mockResolvedValueOnce({ exists: false });
    await loadMoonPhaseContent("new_moon");
    expect(mockCollection).toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalled();
  });
});
