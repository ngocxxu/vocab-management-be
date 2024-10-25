# Giai đoạn 1: Dependency Stage
FROM node:19 AS dependencies
WORKDIR /src
COPY ./package*.json ./
RUN npm install

# Giai đoạn 2: Build Stage
FROM node:19 AS builder
WORKDIR /src
COPY --from=dependencies /src/node_modules ./node_modules
COPY . .
RUN npm run build

# Giai đoạn 3: Final Stage
FROM node:19-slim
WORKDIR /src
COPY --from=builder /src/dist ./dist
COPY --from=builder /src/package*.json ./
RUN npm install --production

# Setup ENV
ENV DATABASE_URL=${DATABASE_URL}
ENV REDIS_URL=${REDIS_URL}
ENV LOCAL_PORT=${LOCAL_PORT}
ENV EMAIL_USER=${EMAIL_USER}
ENV EMAIL_PASSWORD=${EMAIL_PASSWORD}
ENV ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}

# Start app
CMD ["node", "dist/main.js"]
