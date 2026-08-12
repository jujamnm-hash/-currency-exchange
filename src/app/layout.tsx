import type { Metadata, Viewport } from "next";
import { Amiri, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const display = Amiri({
  subsets: ["arabic", "latin"],
  variable: "--font-display",
  weight: ["400", "700"],
});

const body = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "نیشانە | Nishana — تێبینی AR لەڕێی کامێرا",
  description:
    "کامێرای مۆبایلەکەت بخە سەر هەر شتێک، تێبینی بنووسە، و کاتێ دووبارە دەیبینیتەوە تێبینییەکەت پیشان دەدات.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "نیشانە",
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
  themeColor: "#0B1220",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ku" dir="rtl">
      <body
        className={`${display.variable} ${body.variable} font-sans antialiased text-mist-100`}
      >
        {children}
      </body>
    </html>
  );
}
