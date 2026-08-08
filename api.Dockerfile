# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY server/package.json ./server/

RUN npm ci --workspace=server

COPY server ./server

# --- Runner Stage ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=development

COPY --from=builder /app ./

WORKDIR /app/server

EXPOSE 3000

CMD ["npm", "run", "dev"]
