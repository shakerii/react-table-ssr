"use client";

import { createTheme } from "@mui/material/styles";
import { Amiri, Roboto } from "next/font/google";

export const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
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
    MuiTable: {
      styleOverrides: {
        root: {
          borderBottom: "none",
        },
      },
    },
  },
});

export const rtlTheme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: amiri.style.fontFamily,
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        deleteIcon: {
          margin: "0 -6px 0 5px",
        },
      },
    },
  },
});