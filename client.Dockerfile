FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
COPY client/package.json ./client/

RUN npm ci --workspace=client

COPY client ./client

WORKDIR /app/client

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
