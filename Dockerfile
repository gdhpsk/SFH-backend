FROM node:22
WORKDIR /app
ARG certificate
COPY package*.json ./
ADD ${certificate} ./
COPY . .
EXPOSE 3005
EXPOSE 3005/udp
CMD node index.js