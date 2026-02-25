import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/hash";

const prisma = new PrismaClient();

const SEED_USERNAME = "andre";
const SEED_EMAIL = "andre@local";
const SEED_PASSWORD = "Admin@123" as const;

async function main() {
  const passwordHash = await hashPassword(SEED_PASSWORD);

  const SEED_PERSON_ID = "00000000-0000-0000-0000-000000000001";

  const person = await prisma.people.upsert({
    where: { id: SEED_PERSON_ID },
    create: {
      id: SEED_PERSON_ID,
      fullName: "André Admin",
      email: SEED_EMAIL,
      type: "worker",
      status: "active",
    },
    update: {},
  });

  await prisma.worker.upsert({
    where: { personId: person.id },
    create: {
      personId: person.id,
      function: "Administrador",
      role: "super_admin",
    },
    update: {},
  });

  await prisma.authUser.upsert({
    where: { username: SEED_USERNAME },
    create: {
      username: SEED_USERNAME,
      email: SEED_EMAIL,
      passwordHash,
      personId: person.id,
      isActive: true,
    },
    update: {
      email: SEED_EMAIL,
      passwordHash,
      personId: person.id,
      isActive: true,
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
