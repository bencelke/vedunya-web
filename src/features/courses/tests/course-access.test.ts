import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

  it("unlocks paid course when ownedCourses entitlement is active", () => {
    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      courseId: "runes_24_inner_strength",
      profile: null,
      isPremiumUser: false,
      ownedCourseIds: new Set(["runes_24_inner_strength"]),
    });

    expect(access.canOpenLessons).toBe(true);
    expect(access.isPurchased).toBe(true);
  });

  it("wires course purchase flow for Shopify integration", () => {
    expect(COURSE_PURCHASE_FLOW_WIRED).toBe(true);
    const hero = readFileSync(
      resolve(process.cwd(), "src/features/courses/components/course-detail-hero.tsx"),
      "utf8",
    );
    expect(hero).toContain("CourseShopifyPurchaseSection");
  });

  it("shows purchase surface instead of coming soon when locked", () => {
    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      profile: null,
      isPremiumUser: false,
    });

    expect(access.showPurchaseUnavailable).toBe(false);
    expect(access.isPaidLocked).toBe(true);
  });
});
