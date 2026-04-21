FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/public-web/package.json apps/public-web/package.json
COPY apps/inventory-admin/package.json apps/inventory-admin/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=apps/inventory-admin

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

COPY --from=builder /app/apps/inventory-admin/.next/standalone ./
COPY --from=builder /app/apps/inventory-admin/.next/static ./apps/inventory-admin/.next/static
COPY --from=builder /app/apps/public-web/content ./apps/public-web/content

EXPOSE 8080
CMD ["node", "apps/inventory-admin/server.js"]
