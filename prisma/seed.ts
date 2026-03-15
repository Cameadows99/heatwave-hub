import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "adminlogin@heatwave.com";
  const employeeEmail = "slim@heatwave.com";

  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedEmployeePassword = await bcrypt.hash("slimm123", 10);

  // Clean dependent demo data first so reseeding doesn't duplicate records
  await prisma.orderRequest.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.timeOffRequest.deleteMany();
  await prisma.rsvp.deleteMany();
  await prisma.event.deleteMany();

  // Delete demo users if they already exist with any old/case-variant data
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [adminEmail, employeeEmail],
        mode: "insensitive",
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Chad Buck",
      email: adminEmail,
      password: hashedAdminPassword,
      role: "ADMIN",
      team: "Management",
    },
  });

  const employee = await prisma.user.create({
    data: {
      name: "Slimenem",
      email: employeeEmail,
      password: hashedEmployeePassword,
      role: "EMPLOYEE",
      team: "Construction",
    },
  });

  await prisma.event.createMany({
    data: [
      {
        title: "Team BBQ",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Warehouse Lot",
        description: "Grill and chill with the whole crew.",
      },
      {
        title: "Pool Maintenance Workshop",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
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
      clockIn: new Date(Date.now() - 3 * 60 * 60 * 1000),
      clockOut: new Date(Date.now() - 1 * 60 * 60 * 1000),
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
