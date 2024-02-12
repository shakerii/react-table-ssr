import { Container, List, ListItem } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
    <Container sx={{ my: 4 }}>
      <List>
        <ListItem>
          <Link href="/with-modal">With Modal</Link>
        </ListItem>
        <ListItem>
          <Link href="/with-tab">With Tab</Link>
        </ListItem>
      </List>
    </Container>
  );
}
