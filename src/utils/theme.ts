"use client";

import { createTheme } from "@mui/material/styles";
import { Roboto } from "next/font/google";
import localFont from "next/font/local";

export const local = localFont({
  src: "../../public/fonts/Traffic.ttf",
});

export const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

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
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: "5px 10px",
        },
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
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: "5px 10px",
        },
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
