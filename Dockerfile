# ---- Base ----
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- Dependencias (incluye dev: prisma CLI, ts-node para migraciones/seed) ----
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---- Build de Next.js ----
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
# URL ficticia solo para que Prisma (driver adapter) instancie durante el build.
# No se conecta: las paginas con BD son force-dynamic y no consultan en build.
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Runner ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
COPY --from=builder /app ./
EXPOSE 3000
# Sincroniza el esquema con la BD (las migraciones del repo estan desfasadas;
# el flujo del proyecto usa db push), siembra el catalogo (idempotente) y arranca.
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && npm run start"]
