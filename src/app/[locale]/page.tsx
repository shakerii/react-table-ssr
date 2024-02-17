import { Container } from "@mui/material";

import { Link } from "~/utils/navigation";

export default function Home() {
  return (
    <Container className="my-4">
      <Link href="/dashboard">Dashboard</Link>
    </Container>
  );
}
