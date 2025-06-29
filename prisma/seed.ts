import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.upsert({
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

  console.log("Seeded user:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
