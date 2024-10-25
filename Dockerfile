# Use an official Node.js runtime as the base image
FROM node:19 AS builder

# Set the working directory in the container
WORKDIR /src

# Copy the package.json and package-lock.json files to the container
COPY ./package*.json ./

# Install the app's dependencies
RUN npm install

# Copy the rest of the application's files to the container
COPY . .

# Run the build command
RUN npm run build

# Final stage
FROM node:19-slim

# Set the working directory in the final container
WORKDIR /src

# Copy the built files from the builder stage
COPY --from=builder /src/dist ./dist

# Copy package.json và package-lock.json nếu cần (nếu bạn có phụ thuộc cần thiết cho môi trường chạy)
COPY --from=builder /src/package*.json ./

# Cài đặt các phụ thuộc cần thiết cho môi trường sản xuất
RUN npm install --production

# Thiết lập biến môi trường
ENV DATABASE_URL=${DATABASE_URL}
ENV REDIS_URL=${REDIS_URL}
ENV LOCAL_PORT=${LOCAL_PORT}
ENV EMAIL_USER=${EMAIL_USER}
ENV EMAIL_PASSWORD=${EMAIL_PASSWORD}
ENV ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}

# Start the app
CMD ["node", "dist/main.js"]
