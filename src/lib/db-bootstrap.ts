import { prisma } from "./prisma";
import { DEFAULT_ACCOUNTS } from "./accounts";

let ready: Promise<void> | null = null;

async function exec(sql: string) {
  await prisma.$executeRawUnsafe(sql);
}

/** دروستکردنی خشتەکان ئەگەر نەبن — بۆ Vercel بێ migrate */
export async function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await exec(`
        CREATE TABLE IF NOT EXISTS "CompanySettings" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL DEFAULT 'کۆمپانیاکەم',
          "phone" TEXT NOT NULL DEFAULT '',
          "address" TEXT NOT NULL DEFAULT '',
          "currency" TEXT NOT NULL DEFAULT 'IQD',
          "currencyLabel" TEXT NOT NULL DEFAULT 'دینار',
          "fiscalYearStart" INTEGER NOT NULL DEFAULT 1,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
        )`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "Category" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
        )`);
      await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name")`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "Product" (
          "id" TEXT NOT NULL,
          "sku" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT NOT NULL DEFAULT '',
          "unit" TEXT NOT NULL DEFAULT 'دانە',
          "costPrice" DECIMAL(18,2) NOT NULL,
          "sellPrice" DECIMAL(18,2) NOT NULL,
          "quantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
          "minQuantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
          "categoryId" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
        )`);
      await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku")`);
      await exec(`CREATE INDEX IF NOT EXISTS "Product_name_idx" ON "Product"("name")`);
      await exec(`CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId")`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "Party" (
          "id" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "phone" TEXT NOT NULL DEFAULT '',
          "email" TEXT NOT NULL DEFAULT '',
          "address" TEXT NOT NULL DEFAULT '',
          "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
          "notes" TEXT NOT NULL DEFAULT '',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
        )`);
      await exec(`CREATE INDEX IF NOT EXISTS "Party_type_idx" ON "Party"("type")`);
      await exec(`CREATE INDEX IF NOT EXISTS "Party_name_idx" ON "Party"("name")`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "Sale" (
          "id" TEXT NOT NULL,
          "number" TEXT NOT NULL,
          "partyId" TEXT,
          "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "status" TEXT NOT NULL DEFAULT 'COMPLETED',
          "subtotal" DECIMAL(18,2) NOT NULL,
          "discount" DECIMAL(18,2) NOT NULL DEFAULT 0,
          "tax" DECIMAL(18,2) NOT NULL DEFAULT 0,
          "total" DECIMAL(18,2) NOT NULL,
          "paidAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
          "notes" TEXT NOT NULL DEFAULT '',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
        )`);
      await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "Sale_number_key" ON "Sale"("number")`);
      await exec(`CREATE INDEX IF NOT EXISTS "Sale_date_idx" ON "Sale"("date")`);
      await exec(`CREATE INDEX IF NOT EXISTS "Sale_partyId_idx" ON "Sale"("partyId")`);
      await exec(`CREATE INDEX IF NOT EXISTS "Sale_status_idx" ON "Sale"("status")`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "SaleItem" (
          "id" TEXT NOT NULL,
          "saleId" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "quantity" DECIMAL(18,3) NOT NULL,
          "unitPrice" DECIMAL(18,2) NOT NULL,
          "lineTotal" DECIMAL(18,2) NOT NULL,
          CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
        )`);
      await exec(`CREATE INDEX IF NOT EXISTS "SaleItem_saleId_idx" ON "SaleItem"("saleId")`);
      await exec(`CREATE INDEX IF NOT EXISTS "SaleItem_productId_idx" ON "SaleItem"("productId")`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "Purchase" (
          "id" TEXT NOT NULL,
          "number" TEXT NOT NULL,
          "partyId" TEXT,
          "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "status" TEXT NOT NULL DEFAULT 'COMPLETED',
          "subtotal" DECIMAL(18,2) NOT NULL,
          "discount" DECIMAL(18,2) NOT NULL DEFAULT 0,
          "tax" DECIMAL(18,2) NOT NULL DEFAULT 0,
          "total" DECIMAL(18,2) NOT NULL,
          "paidAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
          "notes" TEXT NOT NULL DEFAULT '',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
        )`);
      await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_number_key" ON "Purchase"("number")`);
      await exec(`CREATE INDEX IF NOT EXISTS "Purchase_date_idx" ON "Purchase"("date")`);
      await exec(`CREATE INDEX IF NOT EXISTS "Purchase_partyId_idx" ON "Purchase"("partyId")`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "PurchaseItem" (
          "id" TEXT NOT NULL,
          "purchaseId" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "quantity" DECIMAL(18,3) NOT NULL,
          "unitCost" DECIMAL(18,2) NOT NULL,
          "lineTotal" DECIMAL(18,2) NOT NULL,
          CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
        )`);
      await exec(`CREATE INDEX IF NOT EXISTS "PurchaseItem_purchaseId_idx" ON "PurchaseItem"("purchaseId")`);
      await exec(`CREATE INDEX IF NOT EXISTS "PurchaseItem_productId_idx" ON "PurchaseItem"("productId")`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "StockMovement" (
          "id" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "quantity" DECIMAL(18,3) NOT NULL,
          "reason" TEXT NOT NULL DEFAULT '',
          "refType" TEXT NOT NULL DEFAULT '',
          "refId" TEXT NOT NULL DEFAULT '',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
        )`);
      await exec(`CREATE INDEX IF NOT EXISTS "StockMovement_productId_idx" ON "StockMovement"("productId")`);
      await exec(`CREATE INDEX IF NOT EXISTS "StockMovement_createdAt_idx" ON "StockMovement"("createdAt")`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "Account" (
          "id" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "isSystem" BOOLEAN NOT NULL DEFAULT false,
          "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
        )`);
      await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "Account_code_key" ON "Account"("code")`);
      await exec(`CREATE INDEX IF NOT EXISTS "Account_type_idx" ON "Account"("type")`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "JournalEntry" (
          "id" TEXT NOT NULL,
          "number" TEXT NOT NULL,
          "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "description" TEXT NOT NULL DEFAULT '',
          "refType" TEXT NOT NULL DEFAULT '',
          "refId" TEXT NOT NULL DEFAULT '',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
        )`);
      await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "JournalEntry_number_key" ON "JournalEntry"("number")`);
      await exec(`CREATE INDEX IF NOT EXISTS "JournalEntry_date_idx" ON "JournalEntry"("date")`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "JournalLine" (
          "id" TEXT NOT NULL,
          "entryId" TEXT NOT NULL,
          "accountId" TEXT NOT NULL,
          "debit" DECIMAL(18,2) NOT NULL DEFAULT 0,
          "credit" DECIMAL(18,2) NOT NULL DEFAULT 0,
          CONSTRAINT "JournalLine_pkey" PRIMARY KEY ("id")
        )`);
      await exec(`CREATE INDEX IF NOT EXISTS "JournalLine_entryId_idx" ON "JournalLine"("entryId")`);
      await exec(`CREATE INDEX IF NOT EXISTS "JournalLine_accountId_idx" ON "JournalLine"("accountId")`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "Expense" (
          "id" TEXT NOT NULL,
          "number" TEXT NOT NULL,
          "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "accountId" TEXT NOT NULL,
          "partyId" TEXT,
          "amount" DECIMAL(18,2) NOT NULL,
          "description" TEXT NOT NULL DEFAULT '',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
        )`);
      await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "Expense_number_key" ON "Expense"("number")`);
      await exec(`CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"("date")`);
      await exec(`CREATE INDEX IF NOT EXISTS "Expense_accountId_idx" ON "Expense"("accountId")`);

      await exec(`
        CREATE TABLE IF NOT EXISTS "Sequence" (
          "id" TEXT NOT NULL,
          "value" INTEGER NOT NULL DEFAULT 0,
          CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
        )`);

      // Seed company + chart of accounts
      const settings = await prisma.companySettings.findUnique({ where: { id: "default" } });
      if (!settings) {
        await prisma.companySettings.create({
          data: { id: "default", name: "کۆمپانیاکەم", currency: "IQD", currencyLabel: "دینار" },
        });
      }

      const accountCount = await prisma.account.count();
      if (accountCount === 0) {
        await prisma.account.createMany({
          data: DEFAULT_ACCOUNTS.map((a) => ({
            code: a.code,
            name: a.name,
            type: a.type,
            isSystem: true,
            balance: 0,
          })),
        });
      }
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  await ready;
}
