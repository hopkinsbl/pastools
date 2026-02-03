FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

RUN npm install

COPY packages/backend ./packages/backend

WORKDIR /app/packages/backend

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
