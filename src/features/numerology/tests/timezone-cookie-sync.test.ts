import { describe, expect, it } from "vitest";

import { TIMEZONE_COOKIE } from "@/features/numerology/constants";
import {
  formatTimezoneCookieAssignment,
  getCookieValue,
  safeDecodeCookieValue,
  shouldWriteTimezoneCookie,
} from "@/features/numerology/utils/timezone-cookie";

describe("timezone cookie sync", () => {
  it("does not rewrite when existing cookie is decoded Europe/Moscow", () => {
    const cookieHeader = `${TIMEZONE_COOKIE}=Europe/Moscow`;
    const existing = getCookieValue(TIMEZONE_COOKIE, cookieHeader);

    expect(shouldWriteTimezoneCookie("Europe/Moscow", existing)).toBe(false);
  });

  it("does not rewrite when existing cookie is encoded Europe%2FMoscow", () => {
    const cookieHeader = `${TIMEZONE_COOKIE}=Europe%2FMoscow`;
    const existing = getCookieValue(TIMEZONE_COOKIE, cookieHeader);

    expect(safeDecodeCookieValue(existing!)).toBe("Europe/Moscow");
    expect(shouldWriteTimezoneCookie("Europe/Moscow", existing)).toBe(false);
  });

  it("writes encoded timezone once when cookie is missing", () => {
    expect(shouldWriteTimezoneCookie("Europe/Moscow", null)).toBe(true);
    expect(
      formatTimezoneCookieAssignment(TIMEZONE_COOKIE, "Europe/Moscow", 3600),
    ).toBe(
      `${TIMEZONE_COOKIE}=Europe%2FMoscow; path=/; max-age=3600; SameSite=Lax`,
    );
  });

  it("writes encoded timezone once when cookie value differs", () => {
    const cookieHeader = `${TIMEZONE_COOKIE}=America/New_York`;
    const existing = getCookieValue(TIMEZONE_COOKIE, cookieHeader);

    expect(shouldWriteTimezoneCookie("Europe/Moscow", existing)).toBe(true);
    expect(
      formatTimezoneCookieAssignment(TIMEZONE_COOKIE, "Europe/Moscow", 3600),
    ).toContain("Europe%2FMoscow");
  });

  it("treats empty timezone cookie values as missing", () => {
    expect(shouldWriteTimezoneCookie("Europe/Moscow", "")).toBe(true);
    expect(shouldWriteTimezoneCookie("Europe/Moscow", "   ")).toBe(true);
    expect(shouldWriteTimezoneCookie("Europe/Moscow", null)).toBe(true);
  });

  it("reads timezone cookie when it is not the first cookie in document.cookie", () => {
    const cookieHeader = `NEXT_LOCALE=ru;${TIMEZONE_COOKIE}=Europe%2FBerlin`;
    const existing = getCookieValue(TIMEZONE_COOKIE, cookieHeader);

    expect(existing).toBe("Europe%2FBerlin");
    expect(shouldWriteTimezoneCookie("Europe/Berlin", existing)).toBe(false);
  });

  it("reads timezone cookie when cookies are separated by semicolon and space", () => {
    const cookieHeader = `NEXT_LOCALE=ru; ${TIMEZONE_COOKIE}=Europe%2FBerlin`;
    const existing = getCookieValue(TIMEZONE_COOKIE, cookieHeader);

    expect(existing).toBe("Europe%2FBerlin");
    expect(shouldWriteTimezoneCookie("Europe/Berlin", existing)).toBe(false);
  });
});
