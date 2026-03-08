import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/hash";
import { getDatabaseUrl } from "../src/config/env";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
});

const SEED_USERNAME = "andre";
const SEED_EMAIL = "andre@local";
const SEED_PASSWORD = "Admin@123" as const;

async function main() {
  const passwordHash = await hashPassword(SEED_PASSWORD);

  await prisma.user.upsert({
    where: { username: SEED_USERNAME },
    create: {
      name: "André Admin",
      email: SEED_EMAIL,
      username: SEED_USERNAME,
      passwordHash,
      role: "SUPER_ADMIN",
      status: "active",
    },
    update: {
      email: SEED_EMAIL,
      passwordHash,
      name: "André Admin",
      role: "SUPER_ADMIN",
      status: "active",
    },
  });

  console.log("Seed concluído: usuário", SEED_USERNAME, "criado/atualizado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
