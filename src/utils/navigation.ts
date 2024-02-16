import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const localeNames = {
  en: "EN",
  fa: "فا",
};
export const locales = ["en", "fa"] as const;
export const localePrefix = "always";

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix });
