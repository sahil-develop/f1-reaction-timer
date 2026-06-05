import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "F1 Reaction Timer — Race Start Simulator",
    template: "%s | F1 Reaction Timer",
  },
  description:
    "Test your reflexes with F1 race start simulations. Features a starting lights simulator, red/green reaction test, and alarm timer. Built for speed enthusiasts.",
  keywords: [
    "F1 reaction timer",
    "Formula 1",
    "reaction time test",
    "race start simulator",
    "reflex test",
    "F1 game",
    "starting lights",
    "speed test",
  ],
  authors: [{ name: "Sahil", url: "https://www.linkedin.com/in/sahil02824/" }],
  creator: "Sahil",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "F1 Reaction Timer",
    title: "F1 Reaction Timer — Race Start Simulator",
    description:
      "Test your reflexes with F1 race start simulations. Three reaction games — starting lights, red/green light, and alarm timer.",
  },
  twitter: {
    card: "summary_large_image",
    title: "F1 Reaction Timer — Race Start Simulator",
    description:
      "Test your reflexes with F1 race start simulations. Three reaction games built for speed.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3299592186926809"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
