# services/orders/Dockerfile
FROM node:18

WORKDIR /app

# Copy package files first
COPY services/orders/package*.json ./
RUN npm install

# Copy the service files
COPY services/orders/ ./

# Copy shared files to the correct location
COPY shared/ ./shared/

EXPOSE 4000

CMD ["node", "app.js"]
