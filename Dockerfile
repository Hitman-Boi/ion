FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm cache clean --force
RUN npm install
RUN apk add --no-cache --allow-untrusted python3 make g++
RUN npm install -g next
RUN npm run build

COPY . .
RUN npm run build

RUN npm install --production

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/next.config.js .
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env.production .
COPY --from=builder /app/package*.json .
COPY --from=builder /app/next.config.js .
COPY --from=builder /app/.next ./app

RUN addgroup -g 1001 -S node && adduser -u 1001 -S node -G node
USER node

EXPOSE 3000
CMD ["node", "./.next/standalone/server.js"]