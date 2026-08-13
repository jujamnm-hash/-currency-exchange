export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export const DEFAULT_ACCOUNTS: { code: string; name: string; type: AccountType }[] = [
  { code: "1000", name: "سندوق / نەقد", type: "ASSET" },
  { code: "1100", name: "بانک", type: "ASSET" },
  { code: "1200", name: "قەرزی کڕیاران", type: "ASSET" },
  { code: "1300", name: "کۆگا / کەلوپەل", type: "ASSET" },
  { code: "2000", name: "قەرزی دابینکەران", type: "LIABILITY" },
  { code: "3000", name: "سەرمایە", type: "EQUITY" },
  { code: "3100", name: "قازانج / زیان", type: "EQUITY" },
  { code: "4000", name: "فرۆشتن", type: "REVENUE" },
  { code: "4100", name: "گەڕانەوەی فرۆشتن", type: "REVENUE" },
  { code: "5000", name: "تێچووی کاڵای فرۆشراو", type: "EXPENSE" },
  { code: "5100", name: "کرێی دوکان", type: "EXPENSE" },
  { code: "5200", name: "مووچە", type: "EXPENSE" },
  { code: "5300", name: "کارەبا و ئاو", type: "EXPENSE" },
  { code: "5400", name: "گواستنەوە", type: "EXPENSE" },
  { code: "5500", name: "خەرجی گشتی", type: "EXPENSE" },
];

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  ASSET: "سامان",
  LIABILITY: "قەرز",
  EQUITY: "سەرمایە",
  REVENUE: "داهات",
  EXPENSE: "خەرجی",
};
