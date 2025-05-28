FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./

# Expose ports
EXPOSE 3000 3005

# Command to run
CMD ["npm", "run", "dev"]
