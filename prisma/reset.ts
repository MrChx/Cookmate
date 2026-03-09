import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("Tambahkan ADMIN_EMAIL dan ADMIN_PASSWORD ");
  }

  console.log("🗑️  Menghapus semua data...");
  await prisma.review.deleteMany();
  await prisma.instruction.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Semua data berhasil dihapus.\n");

  const hashed = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin CookMate",
      email: adminEmail,
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin berhasil dibuat:");
  console.log(`   Email   : ${admin.email}`);
  console.log("   Password: (dari env ADMIN_PASSWORD)\n");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
