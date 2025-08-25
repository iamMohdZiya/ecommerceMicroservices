# services/auth/Dockerfile
FROM node:18

WORKDIR /app

# Copy package files first
COPY services/auth/package*.json ./
RUN npm install

# Copy the service files
COPY services/auth/ ./

# Copy shared files to the correct location
COPY shared/ ./shared/

EXPOSE 4000

CMD ["node", "app.js"]


