import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_PRODUCT_ID,
  resolveCourseIdFromSlug,
} from "@/features/courses/constants/course-ids";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import type { CourseAccessState } from "@/features/courses/types/course";

/** Web stage: checkout is not implemented. */
export const COURSE_PURCHASE_FLOW_WIRED = false;

const SUPER_ADMIN_EMAILS = new Set([
  "boris.prigozin@gmail.com",
  "simonov.maria@gmail.com",
]);

function isSuperAdminEmail(email: string | null | undefined): boolean {
  const normalized = email?.trim().toLowerCase();
  return normalized ? SUPER_ADMIN_EMAILS.has(normalized) : false;
}

function hasDevelopmentCourseOverride(profile: ProfileSnapshot | null): boolean {
  if (!profile) return false;
  if (profile.publicProfile?.isOwner === true) return true;
  return isSuperAdminEmail(profile.email);
}

export function resolveCourseAccess(input: {
  accessType: "free" | "paid" | "premium";
  status: "available" | "coming-soon";
  productId?: string;
  profile: ProfileSnapshot | null;
  isPremiumUser: boolean;
}): CourseAccessState {
  if (input.status === "coming-soon") {
    return {
      canOpenLessons: false,
      isPurchased: false,
      isPremiumLocked: false,
      isPaidLocked: false,
      showComingSoon: true,
      showPurchaseUnavailable: false,
    };
  }

  if (input.accessType === "free") {
    return {
      canOpenLessons: true,
      isPurchased: false,
      isPremiumLocked: false,
      isPaidLocked: false,
      showComingSoon: false,
      showPurchaseUnavailable: false,
    };
  }

  if (input.accessType === "premium") {
    const unlocked = input.isPremiumUser;
    return {
      canOpenLessons: unlocked,
      isPurchased: false,
      isPremiumLocked: !unlocked,
      isPaidLocked: false,
      showComingSoon: false,
      showPurchaseUnavailable: false,
    };
  }

  const purchased = hasDevelopmentCourseOverride(input.profile);

  if (purchased) {
    return {
      canOpenLessons: true,
      isPurchased: true,
      isPremiumLocked: false,
      isPaidLocked: false,
      showComingSoon: false,
      showPurchaseUnavailable: false,
    };
  }

  return {
    canOpenLessons: false,
    isPurchased: false,
    isPremiumLocked: false,
    isPaidLocked: true,
    showComingSoon: !COURSE_PURCHASE_FLOW_WIRED,
    showPurchaseUnavailable: !COURSE_PURCHASE_FLOW_WIRED,
  };
}

export function resolveLivingTheRunesAccess(
  profile: ProfileSnapshot | null,
  isPremiumUser: boolean,
): CourseAccessState {
  return resolveCourseAccess({
    accessType: "paid",
    status: "available",
    productId: LIVING_THE_RUNES_PRODUCT_ID,
    profile,
    isPremiumUser,
  });
}

export function isPremiumUser(profile: ProfileSnapshot | null): boolean {
  if (!profile) return false;
  return (
    profile.publicProfile?.isPremium === true ||
    profile.publicProfile?.premiumOverride === true
  );
}

export function getCourseIdForSlug(slug: string): string | null {
  return resolveCourseIdFromSlug(slug);
}

export { LIVING_THE_RUNES_COURSE_ID };
