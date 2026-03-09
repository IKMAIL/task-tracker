FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i --omit=dev
COPY . .
EXPOSE 3003
CMD ["node", "index.js"]
