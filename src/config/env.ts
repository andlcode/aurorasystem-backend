import "dotenv/config";

function isDirectPostgresUrl(value: string) {
  return /^postgres(?:ql)?:\/\//i.test(value);
}

function isAccelerateUrl(value: string) {
  return value.startsWith("prisma://") || value.startsWith("prisma+postgres://");
}

export function getDatabaseUrl() {
  const value = process.env.DATABASE_URL?.trim();

  if (!value) {
    throw new Error(
      "DATABASE_URL não está configurada. Use uma conexão PostgreSQL direta no formato postgresql://USER:PASSWORD@HOST:PORT/DATABASE."
    );
  }

  if (isAccelerateUrl(value)) {
    throw new Error(
      "DATABASE_URL está usando prisma:// ou prisma+postgres://, mas este projeto está configurado para PostgreSQL direto. Use uma URL começando com postgresql:// ou postgres://."
    );
  }

  if (!isDirectPostgresUrl(value)) {
    throw new Error(
      "DATABASE_URL inválida. Use uma conexão PostgreSQL direta começando com postgresql:// ou postgres://."
    );
  }

  return value;
}

export function assertRuntimeEnv() {
  getDatabaseUrl();
}

export function getPort() {
  const value = process.env.PORT?.trim() || "3000";
  const port = Number.parseInt(value, 10);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`PORT inválida: "${value}".`);
  }

  return port;
}
