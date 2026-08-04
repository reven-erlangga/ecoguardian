# ─── Stage 1: Full build (all deps) ──────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── Stage 2: Production deps only ──────────────────────
FROM node:20-alpine AS prod
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ─── Stage 3: Final image ────────────────────────────────
FROM alpine:3.20
RUN apk add --no-cache nodejs
WORKDIR /app
COPY --from=prod /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
