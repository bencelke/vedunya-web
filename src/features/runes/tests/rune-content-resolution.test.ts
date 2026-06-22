import { describe, expect, it, vi, beforeEach } from "vitest";

import { buildLocalDeepFallback } from "@/features/runes/content/rune-detail-fallback";
import { loadRuneDeepContent } from "@/features/runes/repositories/rune-content-repository";

vi.mock("@/lib/firebase-admin/firestore", () => ({
  getFirebaseAdminFirestore: vi.fn(),
}));

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin/firestore";

const mockGet = vi.fn();
const mockDoc = vi.fn(() => ({ get: mockGet }));
const mockCollection = vi.fn(() => ({ doc: mockDoc }));

describe("rune content resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFirebaseAdminFirestore).mockReturnValue({
      collection: mockCollection,
    } as never);
  });

  it("loads valid Firestore English content for raido", async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        translations: {
          en: {
            title: "Raido",
            short: "Movement",
            deep: "Deep movement",
            action: "Take one step",
          },
        },
      }),
    });

    const result = await loadRuneDeepContent("raido", "en");
    expect(result?.source).toBe("firestore");
    expect(result?.content.runeId).toBe("raido");
    expect(mockDoc).toHaveBeenCalledWith("raido");
  });

  it("resolves raidho alias before Firestore lookup", async () => {
    mockGet.mockResolvedValueOnce({ exists: false });
    const result = await loadRuneDeepContent("raidho", "en");
    expect(mockDoc).toHaveBeenCalledWith("raido");
    expect(result?.source).toBe("fallback");
  });

  it("falls back when Firestore locale is missing", async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        translations: {
          en: { title: "Fehu", short: "Wealth" },
        },
      }),
    });
    const result = await loadRuneDeepContent("fehu", "ru");
    expect(result?.content.short).toBeTruthy();
  });

  it("uses local fallback when document is missing", async () => {
    mockGet.mockResolvedValueOnce({ exists: false });
    const result = await loadRuneDeepContent("kenaz", "en");
    expect(result?.source).toBe("fallback");
    expect(result?.content.title).toBe("Kenaz");
  });

  it("uses local fallback when Firebase is unavailable", async () => {
    vi.mocked(getFirebaseAdminFirestore).mockReturnValue(null);
    const result = await loadRuneDeepContent("gebo", "en");
    expect(result?.source).toBe("fallback");
  });

  it("handles malformed Firestore documents safely", async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ translations: { en: { short: 123 } } }),
    });
    const result = await loadRuneDeepContent("wunjo", "en");
    expect(result?.source).toBe("fallback");
  });

  it("normalizes array fields from Firestore", async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        translations: {
          en: {
            title: "Isa",
            short: ["First", "Second"],
            deep: "Deep",
          },
        },
      }),
    });
    const result = await loadRuneDeepContent("isa", "en");
    expect(result?.content.short).toBeTruthy();
  });

  it("does not perform writes", async () => {
    mockGet.mockResolvedValueOnce({ exists: false });
    await loadRuneDeepContent("jera", "en");
    expect(mockCollection).toHaveBeenCalledWith("runes");
  });

  it("builds local deep fallback for all canonical runes", () => {
    const fehu = buildLocalDeepFallback("fehu", "en");
    expect(fehu?.short).toBeTruthy();
    expect(fehu?.deep).toBeTruthy();
  });
});
