import { useLocale } from "next-intl";
import { isRtlLang } from "rtl-detect";

export const useIsRTL = (locale?: string | undefined) => {
  const defaultLocale = useLocale();
  return isRtlLang(locale ?? defaultLocale);
};
