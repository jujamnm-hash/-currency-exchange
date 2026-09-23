import type { Metadata } from "next";
import MjCommercial from "@/components/MjCommercial";

export const metadata: Metadata = {
  title: "MJ System | ڤیدیۆی ریکلامی ژمێریاری و کاشێری",
  description:
    "ریکلامی بازرگانی MJ System — سیستەمی ژمێریاری و کاشێری بۆ فرۆشگا و کاروبار.",
};

export default function PromoPage() {
  return <MjCommercial />;
}
