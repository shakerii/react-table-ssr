import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { getTranslations } from "next-intl/server";

import { useTextDirection } from "~/hooks/useTextDirection";
import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";
import { ltrTheme, rtlTheme } from "~/utils/theme";

export const generateMetadata = async ({
  params: { locale },
}: {
  params: { locale: string };
}) => {
  const t = await getTranslations({ locale });
  return {
    title: { default: t("dashboard.head.title.default") },
    description: t("dashboard.head.description"),
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  };
};

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const direction = useTextDirection(locale);
  const messages = useMessages();

  return (
    <html lang={locale} dir={direction}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TRPCReactProvider>
            <AppRouterCacheProvider>
              <ThemeProvider theme={direction === "rtl" ? rtlTheme : ltrTheme}>
                {children}
              </ThemeProvider>
            </AppRouterCacheProvider>
          </TRPCReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
