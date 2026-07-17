import type { Metadata, Viewport } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";

const noto = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "غەسلی هەولێر | سیستەمی بەڕێوەبردنی غەسلی سەیارە",
  description: "سیستەمی تەواوی بەڕێوەبردنی غەسلی سەیارە - غەسلی هەولێر",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "غەسلی هەولێر",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ku" dir="rtl">
      <body className={`${noto.variable} font-sans bg-gray-50 text-gray-900 antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 pb-20 md:pb-6">{children}</main>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
