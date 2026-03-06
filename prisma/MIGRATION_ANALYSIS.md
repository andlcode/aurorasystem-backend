# Análise da Migration restructure_classes e Estratégia de Correção

## 1. Estrutura esperada pelo schema Prisma atual (Class)

```prisma
model Class {
  id                String   @id @default(uuid())
  name              String
  day               Int
  time              String
  responsibleUserId String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  ...
}
```

**Colunas esperadas:** `id`, `name`, `day`, `time`, `responsibleUserId`, `createdAt`, `updatedAt`

---

## 2. Estrutura criada pela migration init (20250225000000)

```sql
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "ownerWorkerId" TEXT NOT NULL,
    "status" "ClassStatus" NOT NULL DEFAULT 'active',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    ...
);
```

**Colunas iniciais:** `id`, `name`, `description`, `dayOfWeek`, `startTime`, `endTime`, `ownerWorkerId`, `status`, `createdBy`, `createdAt`, `updatedAt`

---

## 3. O que a migration restructure_classes (20250301000000) faz

| Ação | Comando |
|------|---------|
| Cria ClassParticipant | CREATE TABLE |
| Migra dados | INSERT FROM ClassMembership (participants) |
| Dropa ClassMembership | DROP TABLE |
| Dropa FKs | Class_createdBy_fkey, Class_ownerWorkerId_fkey |
| Dropa colunas | createdBy, description, endTime, status |
| Renomeia | dayOfWeek→day, startTime→time, ownerWorkerId→responsibleUserId |
| Adiciona FK | responsibleUserId → People |
| Cria índices | ClassParticipant, Class_responsibleUserId_idx |
| Dropa | Class_ownerWorkerId_idx, ClassStatus enum |

---

## 4. Possíveis causas de falha em produção

### A) ClassMembership não existe
- Se o banco foi criado com schema diferente ou `db push` anterior
- **Erro:** `relation "ClassMembership" does not exist`

### B) Colunas já renomeadas/removidas (execução parcial)
- Se a migration falhou no meio e foi marcada como falha
- **Erro:** `column "dayOfWeek" does not exist` (se já foi renomeada para day)

### C) Constraint com nome diferente
- PostgreSQL pode ter constraints com nomes diferentes
- **Erro:** `constraint "Class_ownerWorkerId_fkey" does not exist` (IF EXISTS mitiga)

### D) ClassStatus em uso
- DROP TYPE falha se alguma coluna ainda usar
- **Erro:** `cannot drop type "ClassStatus" because column "Class"."status" uses it`

### E) Ordem das operações
- DROP COLUMN status antes de DROP TYPE ClassStatus pode causar conflito
- A migration atual dropa colunas antes do tipo; o DROP TYPE no final pode falhar se a coluna status não foi dropada

---

## 5. Script para inspecionar o banco de produção

Execute no PostgreSQL de produção para ver o estado atual:

```sql
-- Colunas da tabela Class
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Class'
ORDER BY ordinal_position;

-- Tabelas existentes
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- ClassMembership existe?
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'ClassMembership'
);

-- Migrations aplicadas (tabela _prisma_migrations)
SELECT migration_name, finished_at, rolled_back_at
FROM _prisma_migrations
ORDER BY started_at;
```

---

## 6. Estratégia recomendada

### Opção 1: migrate resolve (quando a migration falhou no meio)

Use **apenas** se a migration foi parcialmente aplicada e está marcada como falha:

```bash
# Marca a migration como revertida (rolled back)
npx prisma migrate resolve --rolled-back 20250301000000_restructure_classes

# Depois aplique a migration corretiva (ver seção 7)
```

### Opção 2: Nova migration corretiva (recomendado)

Criar uma migration que:
1. Funciona tanto se restructure_classes **nunca rodou** quanto se **rodou parcialmente**
2. Usa `IF EXISTS` / `IF NOT EXISTS` para ser idempotente
3. Preserva dados

### Opção 3: db push (último recurso)

- **Não recomendado** em produção: pode gerar perda de dados e não mantém histórico
- Use só se o banco estiver corrompido e não houver dados críticos

---

## 7. Migration corretiva (20250306000000_fix_class_structure)

A migration corretiva está em `prisma/migrations/20250306000000_fix_class_structure/migration.sql`.

Ela é **idempotente** e cobre:
- Criação de ClassParticipant (se não existir)
- Migração de ClassMembership → ClassParticipant (se ClassMembership existir)
- Drop de ClassMembership
- Renomeação de colunas em Class (dayOfWeek→day, startTime→time, ownerWorkerId→responsibleUserId)
- Remoção de colunas obsoletas e constraints antigas
- Garantia de FK e índices em responsibleUserId
- Remoção do enum ClassStatus

---

## 8. Fluxo exato para produção

### Passo 1: Inspecionar o banco (antes de qualquer alteração)

Execute no PostgreSQL de produção:

```sql
-- Colunas da tabela Class
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'Class'
ORDER BY ordinal_position;

-- Tabelas existentes
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- ClassMembership existe?
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'ClassMembership'
) AS class_membership_exists;

-- ClassParticipant existe?
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'ClassParticipant'
) AS class_participant_exists;

-- Migrations aplicadas
SELECT migration_name, finished_at, rolled_back_at, applied_steps_count
FROM _prisma_migrations
ORDER BY started_at;
```

Guarde o resultado para validar o estado antes/depois.

### Passo 2: Marcar a migration restructure como revertida

**Use `migrate resolve --rolled-back`** se a migration restructure_classes falhou e está registrada em `_prisma_migrations` com `finished_at` NULL ou erro:

```bash
# Substitua pelo nome exato da migration em produção (verifique em _prisma_migrations)
npx prisma migrate resolve --rolled-back 20250301000000_restructure_classes
```

Ou, se o nome for diferente (ex.: 20250303100000):

```bash
npx prisma migrate resolve --rolled-back 20250303100000_restructure_classes
```

### Passo 3: Aplicar a migration corretiva

```bash
npx prisma migrate deploy
```

Isso aplicará a migration `20250306000000_fix_class_structure`.

### Passo 4: Validar

```bash
npx prisma migrate status
npx prisma db pull  # opcional: confere se o schema gerado bate com o esperado
```

---

## 9. Respostas diretas

| Pergunta | Resposta |
|----------|----------|
| **Usar `migrate resolve`?** | **Sim.** Use `prisma migrate resolve --rolled-back <nome_restructure>` para marcar a migration falhada como revertida antes de rodar `migrate deploy`. |
| **Criar nova migration corretiva?** | **Sim.** A migration `20250306000000_fix_class_structure` já existe e é a abordagem recomendada. |
| **Usar `db push`?** | **Não.** Use apenas como último recurso se o banco estiver corrompido e sem dados críticos. Prefira sempre `migrate resolve` + `migrate deploy`. |
