"use client";

import { createTheme } from "@mui/material/styles";

import { local, roboto } from "./fonts";

export const ltrTheme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    MuiTableCell: {
      defaultProps: {
        size: "small",
      },
    },
  },
});

export const rtlTheme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: local.style.fontFamily,
  },
  components: {
    MuiTableCell: {
      defaultProps: {
        size: "small",
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paperAnchorRight: ({ ownerState }) => ({
          transform: ownerState.open
            ? "none !important"
            : "translateX(100%) !important",
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        deleteIcon: {
          margin: "0 -6px 0 5px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& label": {
            transformOrigin: "right !important",
            left: "inherit !important",
            right: "1.75rem !important",
            fontSize: "small",
            color: "#807D7B",
            fontWeight: 400,
            overflow: "unset",
          },
          "& legend": {
            textAlign: "start",
          },
        },
      },
    },
  },
});
