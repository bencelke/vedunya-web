import { describe, expect, it } from "vitest";

import {
  COURSE_PURCHASE_FLOW_WIRED,
  resolveCourseAccess,
} from "@/features/courses/services/resolve-course-access";

describe("course access", () => {
  it("does not unlock paid courses with Premium alone", () => {
    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      profile: null,
      isPremiumUser: true,
    });

    expect(access.canOpenLessons).toBe(false);
    expect(access.isPaidLocked).toBe(true);
  });

  it("unlocks paid course for owner development access", () => {
    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      profile: {
        uid: "x",
        displayName: "Owner",
        email: "owner@example.com",
        dateOfBirth: null,
        language: "en",
        profileComplete: true,
        authProviders: [],
        publicProfile: {
          uid: "x",
          displayName: "Owner",
          isOwner: true,
        },
        privateProfile: null,
      },
      isPremiumUser: false,
    });

    expect(access.canOpenLessons).toBe(true);
    expect(access.isPurchased).toBe(true);
  });

  it("does not wire fake checkout on web", () => {
    expect(COURSE_PURCHASE_FLOW_WIRED).toBe(false);
  });

  it("shows purchase unavailable instead of buy CTA when locked", () => {
    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      profile: null,
      isPremiumUser: false,
    });

    expect(access.showPurchaseUnavailable).toBe(true);
  });
});
