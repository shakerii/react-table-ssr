import createMiddleware from "next-intl/middleware";
import { locales, localePrefix } from "./utils/navigation";

export default createMiddleware({
  defaultLocale: "en",
  localePrefix,
  locales,
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(en|fa)/:path*"],
};
