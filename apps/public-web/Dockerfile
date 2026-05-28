FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/public-web/package.json apps/public-web/package.json
COPY apps/inventory-admin/package.json apps/inventory-admin/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/public-web/node_modules ./apps/public-web/node_modules
COPY --from=deps /app/apps/inventory-admin/node_modules ./apps/inventory-admin/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
RUN corepack enable && pnpm --filter public-web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

COPY --from=builder /app/apps/public-web/.next/standalone ./
COPY --from=builder /app/apps/public-web/.next/static ./apps/public-web/.next/static
COPY --from=builder /app/apps/public-web/public ./apps/public-web/public
COPY --from=builder /app/apps/public-web/content ./apps/public-web/content

EXPOSE 8080
CMD ["node", "apps/public-web/server.js"]
