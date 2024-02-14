import { Container } from "@mui/material";
import { Link } from "~/utils/navigation";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();

  return (
    <Container className="my-4">
      <h1>{t("Index.title")}</h1>
      <Link href="/with-modal">With Modal</Link>
      <Link href="/with-tab">With Tab</Link>
    </Container>
  );
}
