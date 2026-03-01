import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const MAX_ATTEMPTS = 10;
const DELAY_MS = 3000;

async function waitForDb(): Promise<void> {
  const prisma = new PrismaClient();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[waitForDb] Tentativa ${attempt}/${MAX_ATTEMPTS} - conectando ao banco...`);
      await prisma.$connect();
      console.log(`[waitForDb] Conexão estabelecida com sucesso na tentativa ${attempt}`);
      await prisma.$disconnect();
      process.exit(0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`[waitForDb] Tentativa ${attempt}/${MAX_ATTEMPTS} falhou: ${msg}`);
      if (attempt < MAX_ATTEMPTS) {
        console.log(`[waitForDb] Aguardando ${DELAY_MS}ms antes da próxima tentativa...`);
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      } else {
        console.error(`[waitForDb] Não foi possível conectar após ${MAX_ATTEMPTS} tentativas`);
        await prisma.$disconnect().catch(() => {});
        process.exit(1);
      }
    }
  }
}

waitForDb();
