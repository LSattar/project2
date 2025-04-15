FROM node:20-alpine AS builder
WORKDIR /app
COPY tax-tracker-frontend/package*.json ./ 
RUN npm install
COPY tax-tracker-frontend ./ 
RUN npm run build

COPY tax-tracker-frontend/.env .env

FROM nginx:1.27-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
