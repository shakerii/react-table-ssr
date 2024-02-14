import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

import { Header } from "./_components/Header";
import { useTextDirection } from "~/hooks/useTextDirection";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: { default: "Dashboard", template: "%s | Dashboard" },
  description: "React table with ssr",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const direction = useTextDirection(locale);

  return (
    <html lang={locale} dir={direction}>
      <body className={`font-sans ${inter.variable}`}>
        <Header />
        <main>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </main>
      </body>
    </html>
  );
}
