# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY shared/utils ./shared/utils
COPY services/notification-service ./services/notification-service

RUN npm install
RUN npm run build --workspace=shared/utils
RUN npm run build --workspace=services/notification-service

# ---- Production stage ----
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY shared/utils/package.json ./shared/utils/
COPY services/notification-service/package.json ./services/notification-service/

RUN npm install --omit=dev

COPY --from=build /app/shared/utils/dist ./shared/utils/dist
COPY --from=build /app/services/notification-service/dist ./services/notification-service/dist

WORKDIR /app/services/notification-service
EXPOSE 3007
CMD ["node", "dist/index.js"]
