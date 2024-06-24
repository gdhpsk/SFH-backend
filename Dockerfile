FROM node:22
WORKDIR /app
COPY package*.json ./
COPY . .
EXPOSE 3005
EXPOSE 3005/udp
CMD node index.js