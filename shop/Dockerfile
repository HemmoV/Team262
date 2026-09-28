# Stage 1: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

# Publieke instellingen worden tijdens de build in de site gezet
ARG NEXT_PUBLIC_MAIN_SITE_URL=https://team262.nl
ARG NEXT_PUBLIC_CONTACT_EMAIL=info@team262.nl
ARG NEXT_PUBLIC_CONTACT_PHONE=
ARG NEXT_PUBLIC_SHIPPING_COST=6.95
ARG NEXT_PUBLIC_FREE_SHIPPING_FROM=75
ENV NEXT_PUBLIC_MAIN_SITE_URL=$NEXT_PUBLIC_MAIN_SITE_URL \
    NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL \
    NEXT_PUBLIC_CONTACT_PHONE=$NEXT_PUBLIC_CONTACT_PHONE \
    NEXT_PUBLIC_SHIPPING_COST=$NEXT_PUBLIC_SHIPPING_COST \
    NEXT_PUBLIC_FREE_SHIPPING_FROM=$NEXT_PUBLIC_FREE_SHIPPING_FROM

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate && npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma voor migraties bij het opstarten
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

RUN mkdir -p /app/public/uploads/products && chown -R nextjs:nodejs /app/public/uploads

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Database migraties uitvoeren en daarna de server starten
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
