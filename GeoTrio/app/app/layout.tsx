import type { Metadata } from "next";
import { Inter, Manrope, Syne } from "next/font/google";

import AppToaster from "@/components/AppToaster";

import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const headlineFont = Manrope({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["400", "600", "700", "800"],
});

const displayFont = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "Stride",
  description: "A Toronto explorer experience rendered with the ArcGIS Maps SDK for JavaScript.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
      </head>
      <body className={`${bodyFont.variable} ${headlineFont.variable} ${displayFont.variable}`}>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
