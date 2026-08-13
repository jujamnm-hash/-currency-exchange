"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-bootstrap";
import { nextNumber } from "@/lib/sequences";
import { postJournal } from "@/lib/journal";
import { toNumber } from "@/lib/money";

async function ready() {
  await ensureSchema();
}

function str(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function num(form: FormData, key: string) {
  return toNumber(String(form.get(key) ?? "0"));
}

export async function saveSettings(formData: FormData) {
  await ready();
  await prisma.companySettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      name: str(formData, "name") || "کۆمپانیاکەم",
      phone: str(formData, "phone"),
      address: str(formData, "address"),
      currency: str(formData, "currency") || "IQD",
      currencyLabel: str(formData, "currencyLabel") || "دینار",
    },
    update: {
      name: str(formData, "name") || "کۆمپانیاکەم",
      phone: str(formData, "phone"),
      address: str(formData, "address"),
      currency: str(formData, "currency") || "IQD",
      currencyLabel: str(formData, "currencyLabel") || "دینار",
    },
  });
  revalidatePath("/");
  revalidatePath("/settings");
}

export async function saveCategory(formData: FormData) {
  await ready();
  const name = str(formData, "name");
  if (!name) throw new Error("ناوی پۆل پێویستە");
  const id = str(formData, "id");
  if (id) {
    await prisma.category.update({ where: { id }, data: { name } });
  } else {
    await prisma.category.create({ data: { name } });
  }
  revalidatePath("/categories");
  revalidatePath("/products");
}

export async function deleteCategory(formData: FormData) {
  await ready();
  const id = str(formData, "id");
  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
}

export async function saveProduct(formData: FormData) {
  await ready();
  const id = str(formData, "id");
  const data = {
    sku: str(formData, "sku"),
    name: str(formData, "name"),
    description: str(formData, "description"),
    unit: str(formData, "unit") || "دانە",
    costPrice: num(formData, "costPrice"),
    sellPrice: num(formData, "sellPrice"),
    minQuantity: num(formData, "minQuantity"),
    categoryId: str(formData, "categoryId") || null,
    isActive: str(formData, "isActive") !== "false",
  };
  if (!data.sku || !data.name) throw new Error("کۆد و ناوی کاڵا پێویستن");

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    await prisma.product.create({
      data: { ...data, quantity: num(formData, "quantity") },
    });
  }
  revalidatePath("/products");
  revalidatePath("/dashboard");
  revalidatePath("/stock");
}

export async function deleteProduct(formData: FormData) {
  await ready();
  await prisma.product.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/products");
}

export async function saveParty(formData: FormData) {
  await ready();
  const id = str(formData, "id");
  const data = {
    type: str(formData, "type") || "CUSTOMER",
    name: str(formData, "name"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    address: str(formData, "address"),
    notes: str(formData, "notes"),
  };
  if (!data.name) throw new Error("ناو پێویستە");
  if (id) await prisma.party.update({ where: { id }, data });
  else await prisma.party.create({ data });
  revalidatePath("/customers");
  revalidatePath("/suppliers");
}

export async function deleteParty(formData: FormData) {
  await ready();
  await prisma.party.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/customers");
  revalidatePath("/suppliers");
}

type LineInput = { productId: string; quantity: number; unitPrice: number };

function parseLines(formData: FormData): LineInput[] {
  const raw = str(formData, "linesJson");
  const parsed = JSON.parse(raw || "[]") as LineInput[];
  return parsed.filter((l) => l.productId && l.quantity > 0);
}

export async function createSale(formData: FormData) {
  await ready();
  const lines = parseLines(formData);
  if (lines.length === 0) throw new Error("لانیکەم یەک کاڵا هەڵبژێرە");

  const discount = num(formData, "discount");
  const tax = num(formData, "tax");
  const paidAmount = num(formData, "paidAmount");
  const partyId = str(formData, "partyId") || null;
  const notes = str(formData, "notes");
  const date = str(formData, "date") ? new Date(str(formData, "date")) : new Date();

  const enriched = [];
  let subtotal = 0;
  let cogs = 0;

  for (const line of lines) {
    const product = await prisma.product.findUnique({ where: { id: line.productId } });
    if (!product) throw new Error("کاڵا نەدۆزرایەوە");
    if (toNumber(product.quantity) < line.quantity) {
      throw new Error(`کۆگای «${product.name}» بەس نییە`);
    }
    const lineTotal = line.quantity * line.unitPrice;
    subtotal += lineTotal;
    cogs += line.quantity * toNumber(product.costPrice);
    enriched.push({ ...line, lineTotal, product });
  }

  const total = subtotal - discount + tax;
  const number = await nextNumber("INV", "sale");

  const sale = await prisma.sale.create({
    data: {
      number,
      partyId,
      date,
      status: "COMPLETED",
      subtotal,
      discount,
      tax,
      total,
      paidAmount,
      notes,
      items: {
        create: enriched.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
        })),
      },
    },
  });

  for (const l of enriched) {
    await prisma.product.update({
      where: { id: l.productId },
      data: { quantity: { decrement: l.quantity } },
    });
    await prisma.stockMovement.create({
      data: {
        productId: l.productId,
        type: "OUT",
        quantity: l.quantity,
        reason: `فرۆشتن ${number}`,
        refType: "SALE",
        refId: sale.id,
      },
    });
  }

  const unpaid = total - paidAmount;
  if (partyId && unpaid > 0) {
    await prisma.party.update({
      where: { id: partyId },
      data: { balance: { increment: unpaid } },
    });
  }

  await postJournal({
    description: `فرۆشتن ${number}`,
    refType: "SALE",
    refId: sale.id,
    date,
    lines: [
      { code: "1000", debit: paidAmount },
      { code: "1200", debit: Math.max(0, unpaid) },
      { code: "4000", credit: total },
      { code: "5000", debit: cogs },
      { code: "1300", credit: cogs },
    ],
  });

  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/stock");
  revalidatePath("/reports");
  return { id: sale.id, number };
}

export async function createPurchase(formData: FormData) {
  await ready();
  const lines = parseLines(formData);
  if (lines.length === 0) throw new Error("لانیکەم یەک کاڵا هەڵبژێرە");

  const discount = num(formData, "discount");
  const tax = num(formData, "tax");
  const paidAmount = num(formData, "paidAmount");
  const partyId = str(formData, "partyId") || null;
  const notes = str(formData, "notes");
  const date = str(formData, "date") ? new Date(str(formData, "date")) : new Date();

  let subtotal = 0;
  const enriched = lines.map((l) => {
    const lineTotal = l.quantity * l.unitPrice;
    subtotal += lineTotal;
    return { ...l, lineTotal };
  });
  const total = subtotal - discount + tax;
  const number = await nextNumber("PO", "purchase");

  const purchase = await prisma.purchase.create({
    data: {
      number,
      partyId,
      date,
      status: "COMPLETED",
      subtotal,
      discount,
      tax,
      total,
      paidAmount,
      notes,
      items: {
        create: enriched.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitCost: l.unitPrice,
          lineTotal: l.lineTotal,
        })),
      },
    },
  });

  for (const l of enriched) {
    await prisma.product.update({
      where: { id: l.productId },
      data: {
        quantity: { increment: l.quantity },
        costPrice: l.unitPrice,
      },
    });
    await prisma.stockMovement.create({
      data: {
        productId: l.productId,
        type: "IN",
        quantity: l.quantity,
        reason: `کڕین ${number}`,
        refType: "PURCHASE",
        refId: purchase.id,
      },
    });
  }

  const unpaid = total - paidAmount;
  if (partyId && unpaid > 0) {
    await prisma.party.update({
      where: { id: partyId },
      data: { balance: { increment: unpaid } },
    });
  }

  await postJournal({
    description: `کڕین ${number}`,
    refType: "PURCHASE",
    refId: purchase.id,
    date,
    lines: [
      { code: "1300", debit: total },
      { code: "1000", credit: paidAmount },
      { code: "2000", credit: Math.max(0, unpaid) },
    ],
  });

  revalidatePath("/purchases");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/stock");
  revalidatePath("/reports");
  return { id: purchase.id, number };
}

export async function adjustStock(formData: FormData) {
  await ready();
  const productId = str(formData, "productId");
  const quantity = num(formData, "quantity");
  const reason = str(formData, "reason") || "ڕێکخستنی کۆگا";
  const type = str(formData, "type") || "ADJUST";
  if (!productId || quantity <= 0) throw new Error("کاڵا و بڕ پێویستن");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("کاڵا نەدۆزرایەوە");

  if (type === "OUT") {
    if (toNumber(product.quantity) < quantity) throw new Error("کۆگا بەس نییە");
    await prisma.product.update({
      where: { id: productId },
      data: { quantity: { decrement: quantity } },
    });
  } else if (type === "IN") {
    await prisma.product.update({
      where: { id: productId },
      data: { quantity: { increment: quantity } },
    });
  } else {
    await prisma.product.update({
      where: { id: productId },
      data: { quantity },
    });
  }

  await prisma.stockMovement.create({
    data: {
      productId,
      type,
      quantity,
      reason,
      refType: "MANUAL",
      refId: "",
    },
  });

  revalidatePath("/stock");
  revalidatePath("/products");
  revalidatePath("/dashboard");
}

export async function createExpense(formData: FormData) {
  await ready();
  const accountId = str(formData, "accountId");
  const amount = num(formData, "amount");
  const description = str(formData, "description");
  const partyId = str(formData, "partyId") || null;
  const date = str(formData, "date") ? new Date(str(formData, "date")) : new Date();
  if (!accountId || amount <= 0) throw new Error("حیساب و بڕ پێویستن");

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) throw new Error("حیساب نەدۆزرایەوە");

  const number = await nextNumber("EXP", "expense");
  const expense = await prisma.expense.create({
    data: { number, accountId, amount, description, partyId, date },
  });

  await postJournal({
    description: description || `خەرجی ${number}`,
    refType: "EXPENSE",
    refId: expense.id,
    date,
    lines: [
      { code: account.code, debit: amount },
      { code: "1000", credit: amount },
    ],
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/accounts");
}
