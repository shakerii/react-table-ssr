import { NextIntlClientProvider, useMessages } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Tajawal } from "next/font/google";

import { useTextDirection } from "~/hooks/useTextDirection";
import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";

const tajawal = Tajawal({
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
});

export const generateMetadata = async ({
  params: { locale },
}: {
  params: { locale: string };
}) => {
  const t = await getTranslations({ locale });
  return {
    title: {
      default: t("dashboard.head.title.default"),
      template: t("dashboard.head.title.template"),
    },
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
      <body className={`font-sans ${tajawal.variable}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
