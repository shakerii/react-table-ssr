"use client";

import {
  Box,
  SvgIconProps,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import HomeIcon from "@mui/icons-material/Home";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "~/utils/navigation";
import { type FC, useMemo, Fragment } from "react";

type SidebarListItem =
  | { text: string; href: string; icon: FC<SvgIconProps> }
  | { subheader: string; items: SidebarListItem[] };

const SidebarList = ({ list }: { list: SidebarListItem[] }) => {
  const pathname = usePathname();

  return (
    <List>
      {list.map((item) => {
        if ("text" in item) {
          return (
            <Link key={item.text} href={item.href}>
              <ListItem disablePadding>
                <ListItemButton selected={pathname === item.href}>
                  <ListItemIcon>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText
                    sx={{ textAlign: "start" }}
                    primary={item.text}
                  />
                </ListItemButton>
              </ListItem>
            </Link>
          );
        }
        return (
          <Fragment key={item.subheader}>
            <ListSubheader>{item.subheader}</ListSubheader>
            <SidebarList list={item.items} />
          </Fragment>
        );
      })}
    </List>
  );
};

export const Sidebar = () => {
  const t = useTranslations("dashboard.main.sidebar");

  const list = useMemo(() => {
    return [
      {
        text: t("dashboard"),
        icon: HomeIcon,
        href: "/dashboard",
      },
      {
        subheader: t("table.subheader"),
        items: [
          {
            text: t("table.items.with-modal"),
            icon: ListAltIcon,
            href: "/dashboard/with-modal",
          },
          {
            text: t("table.items.with-tab"),
            icon: BackupTableIcon,
            href: "/dashboard/with-tab",
          },
        ],
      },
    ] satisfies SidebarListItem[];
  }, []);

  return (
    <Box role="presentation" minWidth="max-content" height="100%">
      <SidebarList list={list} />
    </Box>
  );
};
