#!/bin/bash
set -e

echo "Starting MongoDB..."
docker compose -f docker/docker-compose.yml up mongo -d

echo "Waiting for MongoDB to be healthy..."
until docker compose -f docker/docker-compose.yml exec mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  sleep 2
done

echo "MongoDB ready. Starting all services..."
npx concurrently \
  --names "identity,task,progress,alert,gateway,frontend" \
  --prefix-colors "blue,green,yellow,red,magenta,cyan" \
  "npm run dev --workspace=services/identity-service" \
  "npm run dev --workspace=services/task-service" \
  "npm run dev --workspace=services/progress-service" \
  "npm run dev --workspace=services/alert-service" \
  "npm run dev --workspace=services/api-gateway" \
  "npm start --workspace=apps/web-frontend"
