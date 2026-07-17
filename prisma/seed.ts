import { PrismaClient, VehicleType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 دەستپێکردنی داتابەیس - غەسلی هەولێر...");

  const vehicleMultipliers = [
    { vehicleType: VehicleType.SEDAN, multiplier: 1.0, labelKu: "سەدان" },
    { vehicleType: VehicleType.SUV, multiplier: 1.3, labelKu: "SUV" },
    { vehicleType: VehicleType.TRUCK, multiplier: 1.5, labelKu: "بارهەڵگر" },
    { vehicleType: VehicleType.VAN, multiplier: 1.4, labelKu: "ڤان" },
    { vehicleType: VehicleType.MOTORCYCLE, multiplier: 0.6, labelKu: "ماتۆرسکیل" },
    { vehicleType: VehicleType.LUXURY, multiplier: 1.8, labelKu: "لوکس" },
  ];

  for (const v of vehicleMultipliers) {
    await prisma.vehiclePriceMultiplier.upsert({
      where: { vehicleType: v.vehicleType },
      update: v,
      create: v,
    });
  }

  const services = [
    { nameKu: "غەسڵی سادە", nameEn: "Basic Wash", basePrice: 10000, duration: 15, category: "exterior", icon: "droplets", sortOrder: 1 },
    { nameKu: "غەسڵی تەواو", nameEn: "Full Wash", basePrice: 15000, duration: 25, category: "exterior", icon: "sparkles", sortOrder: 2 },
    { nameKu: "غەسڵی پڕیمیەم", nameEn: "Premium Wash", basePrice: 25000, duration: 40, category: "premium", icon: "star", sortOrder: 3 },
    { nameKu: "پاککردنەوەی ناوەوە", nameEn: "Interior Cleaning", basePrice: 20000, duration: 45, category: "interior", icon: "armchair", sortOrder: 4 },
    { nameKu: "واکس و پۆڵیش", nameEn: "Wax & Polish", basePrice: 30000, duration: 60, category: "premium", icon: "gem", sortOrder: 5 },
    { nameKu: "پاککردنەوەی ئەنجام", nameEn: "Engine Cleaning", basePrice: 35000, duration: 50, category: "special", icon: "cog", sortOrder: 6 },
    { nameKu: "غەسڵی ژێرەوە", nameEn: "Undercarriage Wash", basePrice: 12000, duration: 20, category: "exterior", icon: "arrow-down", sortOrder: 7 },
    { nameKu: "پاککردنەوەی پەنجەرە", nameEn: "Window Cleaning", basePrice: 8000, duration: 15, category: "interior", icon: "square", sortOrder: 8 },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { nameKu: s.nameKu } });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }

  const addons = [
    { nameKu: "بۆنخۆش", nameEn: "Air Freshener", price: 3000 },
    { nameKu: "پاککردنەوەی تایەر", nameEn: "Tire Shine", price: 5000 },
    { nameKu: "پاککردنەوەی داشبۆرد", nameEn: "Dashboard Polish", price: 7000 },
    { nameKu: "ئارۆما", nameEn: "Aroma Treatment", price: 10000 },
    { nameKu: "پاککردنەوەی قاپەکان", nameEn: "Seat Cleaning", price: 15000 },
  ];

  for (const a of addons) {
    const existing = await prisma.serviceAddon.findFirst({ where: { nameKu: a.nameKu } });
    if (!existing) {
      await prisma.serviceAddon.create({ data: a });
    }
  }

  const employees = [
    { name: "کارمەند ١", phone: "07501234567", role: "washer" },
    { name: "کارمەند ٢", phone: "07507654321", role: "washer" },
    { name: "بەڕێوەبەر", phone: "07501111111", role: "manager" },
  ];

  for (const e of employees) {
    const existing = await prisma.employee.findFirst({ where: { name: e.name } });
    if (!existing) {
      await prisma.employee.create({ data: e });
    }
  }

  const inventory = [
    { nameKu: "شامپۆی غەسڵ", nameEn: "Car Shampoo", quantity: 50, unit: "liter", minQuantity: 10 },
    { nameKu: "واکس", nameEn: "Wax", quantity: 20, unit: "liter", minQuantity: 5 },
    { nameKu: "پاککەرەوەی ناوەوە", nameEn: "Interior Cleaner", quantity: 30, unit: "liter", minQuantity: 8 },
    { nameKu: "میکرۆفایبر", nameEn: "Microfiber Cloths", quantity: 100, unit: "piece", minQuantity: 20 },
    { nameKu: "بۆنخۆش", nameEn: "Air Freshener", quantity: 40, unit: "piece", minQuantity: 10 },
  ];

  for (const i of inventory) {
    const existing = await prisma.inventoryItem.findFirst({ where: { nameKu: i.nameKu } });
    if (!existing) {
      await prisma.inventoryItem.create({ data: i });
    }
  }

  const settings = [
    { key: "shop_name", value: "غەسلی هەولێر" },
    { key: "shop_name_en", value: "Ghassle Hawler Car Wash" },
    { key: "currency", value: "IQD" },
    { key: "tax_rate", value: "0" },
    { key: "opening_time", value: "08:00" },
    { key: "closing_time", value: "22:00" },
    { key: "phone", value: "07501234567" },
    { key: "address", value: "هەولێر، کوردستان" },
  ];

  for (const s of settings) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  const fullWash = await prisma.service.findFirst({ where: { nameKu: "غەسڵی تەواو" } });
  if (fullWash) {
    const existing = await prisma.membershipPlan.findFirst({ where: { nameKu: "پلانی مانگانە" } });
    if (!existing) {
      await prisma.membershipPlan.create({
        data: {
          nameKu: "پلانی مانگانە",
          nameEn: "Monthly Plan",
          serviceId: fullWash.id,
          washesCount: 8,
          price: 100000,
          validityDays: 30,
        },
      });
    }
  }

  console.log("✅ داتابەیس ئامادەیە!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
