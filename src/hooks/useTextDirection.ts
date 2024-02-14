import { getLangDir } from "rtl-detect";
import { useLocale } from "next-intl";

export const useTextDirection = (locale?: string | undefined) => {
  const defaultLocale = useLocale();
  return getLangDir(locale ?? defaultLocale);
};
