import type { Metadata } from "next";
import Script from "next/script";
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
  description: "Abim — full-stack developer working across web, mobile and machine learning.",
};

// Applies a stored theme override before first paint (no flash of the wrong scheme).
const themeScript = `try{document.querySelector('meta[name="color-scheme"]').content=localStorage.getItem("color-scheme")??"light dark"}catch(e){}`;
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : null;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${cond.variable}`} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        {supabaseOrigin && <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />}
        {supabaseOrigin && <link rel="dns-prefetch" href={supabaseOrigin} />}
      </head>
      <body>
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Backdrop />
        <SmoothScroll />
        <PageTransitionProvider><ContactProvider>{children}</ContactProvider></PageTransitionProvider>
      </body>
    </html>
  );
}
