import { Container } from "@mui/material";
import { Link } from "~/utils/navigation";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();

  return (
    <Container className="my-4">
      <Link href="/dashboard">Dashboard</Link>
    </Container>
  );
}
