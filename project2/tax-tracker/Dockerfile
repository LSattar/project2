FROM node:18-alpine

RUN npm install -g node-jq

WORKDIR /app

# COPY package*.json ./

# RUN npm install 

RUN ls -R /app

# COPY certs/global-bundle.pem /certs/
COPY . . 

# RUN ls -R /certs

EXPOSE 8080

CMD ["node", "index.js"]