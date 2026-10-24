FROM node:20-alpine AS builder

# Install OpenSSL required by Prisma Client on Alpine Linux
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package descriptors and Prisma schema first
COPY package*.json tsconfig.json ./
COPY prisma ./prisma/

# Use npm install (does not require package-lock.json)
RUN npm install

# Copy source code and build
COPY src ./src
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner

# Install OpenSSL required by Prisma Client
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --only=production && npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/server.js"]
