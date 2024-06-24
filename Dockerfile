FROM node:22
WORKDIR /app
COPY package*.json ./
COPY . .
EXPOSE 3005
CMD node index.js