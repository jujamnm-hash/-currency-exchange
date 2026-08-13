import { prisma } from "./prisma";
import { nextNumber } from "./sequences";
import { toNumber, type MoneyLike } from "./money";

async function accountByCode(code: string) {
  const acc = await prisma.account.findUnique({ where: { code } });
  if (!acc) throw new Error(`حیسابی ${code} نەدۆزرایەوە`);
  return acc;
}

export async function postJournal(params: {
  description: string;
  refType: string;
  refId: string;
  date?: Date;
  lines: { code: string; debit?: MoneyLike; credit?: MoneyLike }[];
}) {
  const resolved = [];
  for (const line of params.lines) {
    const debit = toNumber(line.debit);
    const credit = toNumber(line.credit);
    if (debit === 0 && credit === 0) continue;
    const account = await accountByCode(line.code);
    resolved.push({ accountId: account.id, code: line.code, debit, credit });
  }

  const totalDebit = resolved.reduce((s, l) => s + l.debit, 0);
  const totalCredit = resolved.reduce((s, l) => s + l.credit, 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error("ژمێرکاری ناهاوسەنگە (debit ≠ credit)");
  }

  const number = await nextNumber("JE", "journal");
  const entry = await prisma.journalEntry.create({
    data: {
      number,
      date: params.date ?? new Date(),
      description: params.description,
      refType: params.refType,
      refId: params.refId,
      lines: {
        create: resolved.map((l) => ({
          accountId: l.accountId,
          debit: l.debit,
          credit: l.credit,
        })),
      },
    },
  });

  for (const line of resolved) {
    const delta = line.debit - line.credit;
    // ASSET/EXPENSE increase with debit; LIABILITY/EQUITY/REVENUE increase with credit
    await prisma.account.update({
      where: { id: line.accountId },
      data: { balance: { increment: delta } },
    });
  }

  return entry;
}
