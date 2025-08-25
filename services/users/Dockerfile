FROM node:18

WORKDIR /app

# Copy package files first
COPY services/users/package*.json ./
RUN npm install

# Copy the service files
COPY services/users/ ./

# Copy shared files to the correct location
COPY shared/ ./shared/

EXPOSE 4000

CMD ["node", "app.js"]

