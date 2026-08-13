import type { Metadata, Viewport } from "next";
import { Noto_Naskh_Arabic, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const display = Noto_Naskh_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const body = Noto_Sans_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "هەژمار | سیستەمی ژمێریاری و کۆگا",
  description:
    "سیستەمی تەواوی ژمێریاری، کۆگا، فرۆشتن، کڕین، خەرجی و ڕاپۆرت — بە کوردی سۆرانی.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "هەژمار",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f6b6a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ku" dir="rtl">
      <body className={`${display.variable} ${body.variable} font-sans antialiased text-ink`}>
        {children}
      </body>
    </html>
  );
}
