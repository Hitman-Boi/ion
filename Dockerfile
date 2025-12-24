FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN apk add --no-cache --allow-untrusted python3 make g++
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

RUN addgroup -g 1001 -S node && adduser -u 1001 -S node -G node
USER node

EXPOSE 3000
CMD ["node", "server.js"]