"use client";

import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  IconButton,
  MenuItem,
  Select,
  SwipeableDrawer,
  Toolbar,
  Typography,
} from "@mui/material";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { useIsRTL } from "~/hooks/useIsRTL";
import {
  localeNames,
  locales,
  usePathname,
  useRouter,
} from "~/utils/navigation";

import { Sidebar } from "./Sidebar";

export const Header = () => {
  const t = useTranslations("dashboard.main");
  const isRTL = useIsRTL();
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setOpen((open) => !open);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            sx={{ mr: 2, display: { xs: "block", sm: "none" } }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {t("header")}
          </Typography>
        </Box>
        <Box display="flex" gap={3}>
          <Select
            value={locale}
            variant="standard"
            disableUnderline
            sx={{
              color: "white",
              "& > svg": {
                color: "white",
              },
            }}
            onChange={(e) =>
              router.replace(pathname, { locale: e.target.value })
            }
          >
            {locales.map((locale) => (
              <MenuItem key={locale} value={locale} color="inherit">
                {localeNames[locale]}
              </MenuItem>
            ))}
          </Select>
          <IconButton size="large" color="inherit">
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
      <SwipeableDrawer
        anchor={isRTL ? "right" : "left"}
        open={open}
        onOpen={toggleDrawer}
        onClose={toggleDrawer}
      >
        <Box minWidth="250px">
          <Sidebar />
        </Box>
      </SwipeableDrawer>
    </AppBar>
  );
};
