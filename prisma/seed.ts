import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const passwordHash = await bcryptjs.hash("admin123", 12);
  await prisma.admin.upsert({
    where: { email: "admin@wb-incode.pl" },
    update: {},
    create: {
      email: "admin@wb-incode.pl",
      passwordHash,
      name: "Admin",
      role: "SUPER_ADMIN",
    },
  });
  console.log("Admin user created: admin@wb-incode.pl / admin123");

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
