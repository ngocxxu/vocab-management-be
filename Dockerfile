# Use an official Node.js runtime as the base image
FROM node:19
# Set the working directory in the container
WORKDIR /app
# Copy the package.json and package-lock.json files to the container
COPY ./package.json .
# Install the app's dependencies
RUN npm install
# Copy the rest of the application's files to the container
COPY . .

# Expose the app's port
# EXPOSE 3000
ARG LOCAL_PORT
EXPOSE ${LOCAL_PORT}

# Set up access Mongo Atlas
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Start the app
CMD npm run dev