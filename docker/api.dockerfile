FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY server/package.json ./server/

RUN npm ci --workspace=server
COPY server ./server

FROM node:20-alpine AS runner
WORKDIR /app
ENV NOD_ENV=development
COPY --from=builder /app ./
WORKDIR /app/server
EXPOSE 3000

CMD ["npm", "run", "dev"]
