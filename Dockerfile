# Dependency stage
FROM node:19 AS builder
WORKDIR /app

# Sao chép package.json và package-lock.json (nếu có)
COPY ./package*.json ./
RUN npm install

# Build stage
COPY . .
RUN npm run build
RUN ls -l dist

# Final stage
FROM node:19-slim
WORKDIR /root

# Sao chép các file từ giai đoạn builder
COPY --from=builder /app/dist ./
COPY --from=builder /app/package*.json ./

# Thiết lập biến môi trường
ENV DATABASE_URL=${DATABASE_URL}
ENV REDIS_URL=${REDIS_URL}
ENV LOCAL_PORT=${LOCAL_PORT}
ENV EMAIL_USER=${EMAIL_USER}
ENV EMAIL_PASSWORD=${EMAIL_PASSWORD}
ENV ACCESS_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}

# Chạy ứng dụng
CMD ["node", "/root/dist/main.js"]
