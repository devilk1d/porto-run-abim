import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Barlow_Condensed } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScroll } from "./components/scroll";
import Backdrop from "./components/Backdrop";
import { PageTransitionProvider } from "./components/PageTransition";
import { ContactProvider } from "./components/ContactDialog";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const cond = Barlow_Condensed({ subsets: ["latin"], weight: "600", variable: "--font-cond" });

export const metadata: Metadata = {
  title: "abim.run",
  description: "Abim — full-stack developer working across web, mobile and machine learning. Based in Kuala Lumpur.",
};

// Applies a stored theme override before first paint (no flash of the wrong scheme).
const themeScript = `try{document.querySelector('meta[name="color-scheme"]').content=localStorage.getItem("color-scheme")??"light dark"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${cond.variable}`} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Backdrop />
        <SmoothScroll />
        <PageTransitionProvider><ContactProvider>{children}</ContactProvider></PageTransitionProvider>
      </body>
    </html>
  );
}
