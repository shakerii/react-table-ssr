import { Container } from "@mui/material";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("dashboard.main");

  return <p>Sample index page</p>;
}
