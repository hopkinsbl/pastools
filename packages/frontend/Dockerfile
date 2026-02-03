FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/

RUN npm install

COPY packages/frontend ./packages/frontend

WORKDIR /app/packages/frontend

EXPOSE 5173

CMD ["npm", "run", "dev"]
