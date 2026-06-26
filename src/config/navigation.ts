export type BottomNavKey = "today" | "moon" | "courses" | "profile";

export type BottomNavItem = {
  key: BottomNavKey;
  href: string;
  icon: "sun" | "moon" | "book-open" | "user";
  labelKey: `navigation.${BottomNavKey}`;
};

export const bottomNavItems: BottomNavItem[] = [
  {
    key: "today",
    href: "/today",
    icon: "sun",
    labelKey: "navigation.today",
  },
  {
    key: "moon",
    href: "/moon",
    icon: "moon",
    labelKey: "navigation.moon",
  },
  {
    key: "courses",
    href: "/courses",
    icon: "book-open",
    labelKey: "navigation.courses",
  },
  {
    key: "profile",
    href: "/profile",
    icon: "user",
    labelKey: "navigation.profile",
  },
];

export function shouldShowBottomNav(pathname: string): boolean {
  const normalized =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

  if (normalized === "/plus" || normalized.endsWith("/plus")) {
    return true;
  }

  return bottomNavItems.some(
    (item) =>
      normalized === item.href || normalized.startsWith(`${item.href}/`),
  );
}
