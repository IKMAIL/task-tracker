FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i --omit=dev
COPY . .
EXPOSE 3001
CMD ["node", "index.js"]
