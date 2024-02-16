import { isRtlLang } from "rtl-detect";
import { useLocale } from "next-intl";

export const useIsRTL = (locale?: string | undefined) => {
  const defaultLocale = useLocale();
  return isRtlLang(locale ?? defaultLocale);
};
