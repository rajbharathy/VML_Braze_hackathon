FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY server/ ./server/
COPY public/ ./public/
COPY knowledge/ ./knowledge/
EXPOSE 8080

CMD ["node", "server/proxy.js"]
