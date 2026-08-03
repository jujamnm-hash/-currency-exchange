import type { Metadata, Viewport } from "next";
import { Noto_Sans_Arabic, Amiri } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { InstallBanner } from "@/components/InstallBanner";
import { RegisterSW } from "@/components/RegisterSW";

const body = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const display = Amiri({
  subsets: ["arabic"],
  variable: "--font-display",
  weight: ["400", "700"],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "قەرزنامە | سیستەمی تۆمارکردنی قەرز",
  description: "سیستەمی تۆمارکردنی قەرز بۆ ئایپاد — کەسەکان، قەرز، پارەدان",
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "قەرزنامە",
  },
  icons: {
    icon: [
      { url: `${basePath}/icon.svg`, type: "image/svg+xml" },
      { url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: `${basePath}/apple-touch-icon.png`, sizes: "180x180" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0B2420",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ku" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href={`${basePath}/apple-touch-icon.png`} />
      </head>
      <body className={`${body.variable} ${display.variable} antialiased`}>
        <AppShell>{children}</AppShell>
        <InstallBanner />
        <RegisterSW />
      </body>
    </html>
  );
}
