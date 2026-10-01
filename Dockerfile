FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

# Copiamos todo el código (incluyendo prisma/schema.prisma)
COPY . .

# Generamos el cliente de Prisma explícitamente antes de compilar
RUN npx prisma generate

# Compilamos el proyecto
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

# Copiamos el cliente de Prisma generado y las migraciones necesarias
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main"]
