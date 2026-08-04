# ─── Build ───────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache git
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run docs:build

# ─── Serve ───────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html
EXPOSE 80
