# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the app's dependencies
RUN bun install

# Copy the rest of the application's files to the container
COPY . .

# Expose the app's port
EXPOSE 4030

# Start the app
CMD [ "bun", "start" ]