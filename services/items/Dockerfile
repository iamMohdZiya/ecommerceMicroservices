# services/items/Dockerfile
FROM node:18

WORKDIR /app

# Copy package files first
COPY services/items/package*.json ./
RUN npm install

# Copy the service files
COPY services/items/ ./

# Copy shared files to the correct location
COPY shared/ ./shared/

EXPOSE 4002

CMD ["node", "app.js"]
