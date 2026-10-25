FROM node:20-alpine AS builder

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY backend-api/package*.json backend-api/tsconfig.json ./
COPY backend-api/prisma ./prisma/

RUN npm install

COPY backend-api/src ./src
RUN npx prisma generate && npx tsc

FROM node:20-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
ENV NODE_ENV=production

COPY backend-api/package*.json ./
COPY backend-api/prisma ./prisma/
RUN npm install --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/server.js"]
