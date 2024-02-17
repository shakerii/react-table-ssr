import { Box } from "@mui/material";
import { getTranslations } from "next-intl/server";

import { Header } from "./_components/Header";
import { Sidebar } from "./_components/Sidebar";

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
}: {
  children: React.ReactNode;
}) {
  return (
    <Box height="100svh" display="flex" flexDirection="column">
      <Header />
      <Box
        component="main"
        height="100%"
        display="flex"
        mt={1}
        overflow="hidden"
      >
        <Box minWidth="250px" sx={{ display: { xs: "none", sm: "block" } }}>
          <Sidebar />
        </Box>
        <Box flex={1} px={{ xs: 2, md: 4 }} overflow="auto">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
