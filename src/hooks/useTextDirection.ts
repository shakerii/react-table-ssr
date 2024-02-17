import { useLocale } from "next-intl";
import { getLangDir } from "rtl-detect";

export const useTextDirection = (locale?: string | undefined) => {
  const defaultLocale = useLocale();
  return getLangDir(locale ?? defaultLocale);
};
