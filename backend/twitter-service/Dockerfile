FROM node:20-alpine

WORKDIR /app

# Copy package + install deps
COPY backend/twitter-service/package*.json ./
RUN npm install --omit=dev

# Copy source
COPY backend/twitter-service/src ./src

# Copy shared protobuf (dibutuhkan gRPC server)
COPY protobuf ./proto

EXPOSE 8000 50052

CMD ["node", "src/server.js"]
