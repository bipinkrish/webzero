# Use Node.js 18 on Alpine Linux
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json .npmrc ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Ensure directories for file writing exist and have correct permissions
RUN mkdir -p /usr/src/app/src/components/generated && \
    chmod -R 755 /usr/src/app

# Create a non-root user and switch to it
RUN adduser -D appuser && \
    chown -R appuser:appuser /usr/src/app
USER appuser

# Expose the application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development

# Run the application in development mode
CMD ["npm", "run", "dev"]
