import { Typography, Breadcrumbs as _Breadcrumbs } from "@mui/material";
import Link from "next/link";

type Props = {
  links: {
    title: string;
    href: string;
  }[];
  current: string;
};

export const Breadcrumbs = ({ links, current }: Props) => {
  return (
    <_Breadcrumbs aria-label="breadcrumb">
      {links.map((link) => (
        <Link
          key={link.href}
          className="hover:underline"
          color="inherit"
          href={link.href}
        >
          {link.title}
        </Link>
      ))}
      <Typography color="text.primary">{current}</Typography>
    </_Breadcrumbs>
  );
};
