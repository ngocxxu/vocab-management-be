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

# Expose the app's database
ARG DATABASE_URL
EXPOSE ${DATABASE_URL}

# Expose the app's redis
ARG REDIS_URL
EXPOSE ${REDIS_URL}


# Expose the app's port
# EXPOSE 4030
ARG LOCAL_PORT
EXPOSE ${LOCAL_PORT}

# Config remind email
ARG EMAIL_USER
EXPOSE ${EMAIL_USER}
ARG EMAIL_PASSWORD
EXPOSE ${EMAIL_PASSWORD}

ARG ACCESS_TOKEN_SECRET
EXPOSE ${REFRESH_TOKEN_SECRET}

# Start the app
CMD ["npm", "run", "start"]

# # Giai đoạn 1: Dependency Stage
# FROM node:19 AS dependencies
# WORKDIR /src
# COPY ./package*.json ./
# RUN npm install

# # Giai đoạn 2: Build Stage
# FROM node:19 AS builder
# WORKDIR /src
# COPY --from=dependencies /src/node_modules ./node_modules
# COPY . .
# RUN npm run build

# # Giai đoạn 3: Final Stage
# FROM node:19-slim
# WORKDIR /src
# COPY --from=builder /src/dist ./dist
# COPY --from=builder /src/package*.json ./
# RUN npm install --production

# # Setup ENV
# ENV DATABASE_URL=${DATABASE_URL}
# ENV REDIS_URL=${REDIS_URL}
# ENV LOCAL_PORT=${LOCAL_PORT}
# ENV EMAIL_USER=${EMAIL_USER}
# ENV EMAIL_PASSWORD=${EMAIL_PASSWORD}
# ENV ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}

# # Start app
# CMD ["node", "dist/main.js"]

