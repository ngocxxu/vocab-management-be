# Use an official Node.js runtime as the base image
FROM node:19
# Set the working directory in the container
WORKDIR /src
# Copy the package.json and package-lock.json files to the container
COPY ./package.json .
# Install the app's dependencies
RUN npm install
# Copy the rest of the application's files to the container
COPY . .

# # Set up access Mongo Atlas
# ENV NODE_ENV=development

ENV DATABASE_URL=${DATABASE_URL}
ENV REDIS_URL=${REDIS_URL}
ENV LOCAL_PORT=${LOCAL_PORT}
ENV EMAIL_USER=${EMAIL_USER}
ENV EMAIL_PASSWORD=${EMAIL_PASSWORD}
ENV ACCESS_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}

# Start the app
CMD ["npm", "run", "start"]