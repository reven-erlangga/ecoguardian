FROM node:20-alpine AS builder
WORKDIR /app
COPY infra/gateway/package.json ./
RUN npm install

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY infra/gateway/package.json infra/gateway/.meshrc.yaml infra/gateway/subscription.js ./
COPY protobuf ./proto
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npx", "graphql-mesh", "dev"]
