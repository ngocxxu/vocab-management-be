# Dependency stage
FROM node:19 AS builder
WORKDIR /app
COPY ./package*.json .
RUN npm install

# Build stage
COPY . .
RUN npm run build  

# Final stage
FROM node:19-slim
WORKDIR /root
COPY --from=builder /app/dist ./
ENV DATABASE_URL=${DATABASE_URL}
ENV REDIS_URL=${REDIS_URL}
ENV LOCAL_PORT=${LOCAL_PORT}
ENV EMAIL_USER=${EMAIL_USER}
ENV EMAIL_PASSWORD=${EMAIL_PASSWORD}
ENV ACCESS_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}
CMD ["npm", "run", "start"]


