ARG NODE_VERSION=20

# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine AS base

# Navigate to the app directory.
WORKDIR /src/app

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install app dependencies.
RUN npm ci

# Copy the rest of the files into the docker container.
COPY . .

# Build the app.
RUN npm run build

# Set the port environment variable the app will run on.
ENV PORT=3000

# Bind to all interfaces so the container is accessible externally.
ENV HOSTNAME=0.0.0.0

# Expose the port so our computer can access it.
EXPOSE 3000

# Runs the app.
CMD ["npm", "start"]
