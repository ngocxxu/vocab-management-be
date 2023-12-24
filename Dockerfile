# Use an official Node.js runtime as the base image
FROM oven/bun:latest
# Set the working directory in the container
WORKDIR /home/bun/app
# Copy the package.json and package-lock.json files to the container
COPY ./package.json .
# Install the app's dependencies
RUN bun install
# Copy the rest of the application's files to the container
COPY . .

# Expose the app's port
# EXPOSE 3000
ARG PORT
EXPOSE ${PORT:-3000}

# Start the app
CMD ["bun", "run" "start"]