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
