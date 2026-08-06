import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.employee.deleteMany();
  await prisma.position.deleteMany();
  await prisma.department.deleteMany();
  await prisma.market.deleteMany();
  await prisma.settings.deleteMany();

  await prisma.settings.createMany({
    data: [
      { id: "s1", key: "org_name", value: "هەیکەلی ئیداری" },
      { id: "s2", key: "org_subtitle", value: "سیستەمی ڕێکخستنی کارمەندان" },
    ],
  });

  const markets = await Promise.all([
    prisma.market.create({ data: { name: "مارکێتی ناوەندی", code: "M01", location: "هەولێر", sortOrder: 1 } }),
    prisma.market.create({ data: { name: "مارکێتی ١٠٠ مەتر", code: "M02", location: "هەولێر", sortOrder: 2 } }),
    prisma.market.create({ data: { name: "مارکێتی ئانکاوا", code: "M03", location: "هەولێر", sortOrder: 3 } }),
  ]);

  const management = await prisma.department.create({
    data: { name: "بەڕێوەبەرایەتی گشتی", code: "D01", sortOrder: 1 },
  });
  const hr = await prisma.department.create({
    data: { name: "سەرچاوە مرۆییەکان", code: "D02", parentId: management.id, sortOrder: 2 },
  });
  const sales = await prisma.department.create({
    data: { name: "فرۆشتن", code: "D03", parentId: management.id, sortOrder: 3 },
  });
  const ops = await prisma.department.create({
    data: { name: "کارگێڕی", code: "D04", parentId: management.id, sortOrder: 4 },
  });

  const positions = await Promise.all([
    prisma.position.create({ data: { name: "بەڕێوەبەری گشتی", code: "P01", departmentId: management.id, level: 5, sortOrder: 1 } }),
    prisma.position.create({ data: { name: "بەڕێوەبەری مارکێت", code: "P02", departmentId: sales.id, level: 4, sortOrder: 2 } }),
    prisma.position.create({ data: { name: "سەرپەرشتیاری فرۆشتن", code: "P03", departmentId: sales.id, level: 3, sortOrder: 3 } }),
    prisma.position.create({ data: { name: "کارمەندی فرۆشتن", code: "P04", departmentId: sales.id, level: 2, sortOrder: 4 } }),
    prisma.position.create({ data: { name: "کارمەندی کۆگا", code: "P05", departmentId: ops.id, level: 2, sortOrder: 5 } }),
    prisma.position.create({ data: { name: "کارمەندی سەرچاوە مرۆییەکان", code: "P06", departmentId: hr.id, level: 2, sortOrder: 6 } }),
  ]);

  const ceo = await prisma.employee.create({
    data: {
      name: "ئارام محەمەد",
      phone: "07501234567",
      employeeCode: "E001",
      departmentId: management.id,
      positionId: positions[0].id,
      marketId: markets[0].id,
    },
  });

  const mgr1 = await prisma.employee.create({
    data: {
      name: "سارا ئەحمەد",
      phone: "07501234568",
      employeeCode: "E002",
      departmentId: sales.id,
      positionId: positions[1].id,
      marketId: markets[0].id,
      managerId: ceo.id,
    },
  });

  await prisma.employee.createMany({
    data: [
      {
        name: "هیوا عەلی",
        phone: "07501234569",
        employeeCode: "E003",
        departmentId: sales.id,
        positionId: positions[2].id,
        marketId: markets[0].id,
        managerId: mgr1.id,
      },
      {
        name: "لانا کەریم",
        phone: "07501234570",
        employeeCode: "E004",
        departmentId: sales.id,
        positionId: positions[3].id,
        marketId: markets[1].id,
        managerId: mgr1.id,
      },
      {
        name: "دیلان حسن",
        phone: "07501234571",
        employeeCode: "E005",
        departmentId: ops.id,
        positionId: positions[4].id,
        marketId: markets[2].id,
        managerId: ceo.id,
      },
      {
        name: "نۆر خان",
        phone: "07501234572",
        employeeCode: "E006",
        departmentId: hr.id,
        positionId: positions[5].id,
        marketId: markets[0].id,
        managerId: ceo.id,
      },
    ],
  });

  console.log("Seed completed: markets, departments, positions, employees");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
