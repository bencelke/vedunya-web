import { describe, expect, it } from "vitest";

import { calculateLunarDayClamped } from "@/features/moon/engine/calculate-lunar-day";

describe("lunar day parity", () => {
  it.each([
    { age: 0, day: 1 },
    { age: 0.9, day: 1 },
    { age: 1.0, day: 2 },
    { age: 13.5, day: 14 },
    { age: 14.2, day: 15 },
    { age: 15.0, day: 16 },
    { age: 28.4, day: 29 },
    { age: 29.5, day: 30 },
  ])("maps moon age $age to lunar day $day", ({ age, day }) => {
    expect(calculateLunarDayClamped(age)).toBe(day);
  });

  it("never returns lunar day 0", () => {
    expect(calculateLunarDayClamped(-2)).toBe(1);
  });

  it("never returns lunar day above 30", () => {
    expect(calculateLunarDayClamped(40)).toBe(30);
  });
});
