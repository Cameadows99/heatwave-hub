import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "chadbuck@heatwave.com" },
    update: {},
    create: {
      name: "Chad Buck",
      email: "chadbuck@heatwave.com",
      password: hashedPassword,
      role: "ADMIN",
      team: "Management",
    },
  });

  const employee = await prisma.user.create({
    data: {
      name: "Slimenem",
      email: "slim@heatwave.com",
      password: await bcrypt.hash("slimm123", 10),
      role: "EMPLOYEE",
      team: "Construction",
    },
  });

  await prisma.event.createMany({
    data: [
      {
        title: "Team BBQ",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        location: "Warehouse Lot",
        description: "Grill and chill with the whole crew.",
      },
      {
        title: "Pool Maintenance Workshop",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        location: "Conference Room A",
        description: "Best practices for spring maintenance season.",
      },
    ],
  });

  await prisma.timeOffRequest.createMany({
    data: [
      {
        userId: admin.id,
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        reason: "Family Trip",
        status: "APPROVED",
      },
      {
        userId: employee.id,
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        reason: "Dentist Appointment",
        status: "PENDING",
      },
    ],
  });

  await prisma.timeEntry.create({
    data: {
      userId: admin.id,
      clockIn: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      clockOut: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
  });

  await prisma.orderRequest.create({
    data: {
      requesterId: admin.id,
      items: ["Pool Net", "Shock Treatment"],
      details: "High-priority restock needed",
      reason: "Upcoming heavy usage weekend",
      ordered: false,
    },
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
