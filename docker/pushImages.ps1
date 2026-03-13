$VERSION = "1.0.3"

Set-Location "C:\Users\moham\GitHub\task-tracker\docker"

docker compose build

docker tag docker-alert-service:latest localhost:5000/alert-service:$VERSION
docker push localhost:5000/alert-service:$VERSION

docker tag docker-api-gateway:latest localhost:5000/api-gateway:$VERSION
docker push localhost:5000/api-gateway:$VERSION

docker tag docker-identity-service:latest localhost:5000/identity-service:$VERSION
docker push localhost:5000/identity-service$VERSION

docker tag docker-progress-service:latest localhost:5000/progress-service:$VERSION
docker push localhost:5000/progress-$VERSION

docker tag docker-task-service:latest localhost:5000/task-service:$VERSION
docker push localhost:5000/task-service:$VERSION

docker tag docker-team-service:latest localhost:5000/team-service:$VERSION
docker push localhost:5000/team-service:$VERSION

docker tag docker-web-frontend:latest localhost:5000/web-frontend:$VERSION
docker push localhost:5000/web-frontend:$VERSION

docker tag docker-alert-service:latest localhost:5000/alert-service:latest
docker push localhost:5000/alert-service:latest

docker tag docker-api-gateway:latest localhost:5000/api-gateway:latest
docker push localhost:5000/api-gateway:latest

docker tag docker-identity-service:latest localhost:5000/identity-service:latest
docker push localhost:5000/identity-service

docker tag docker-progress-service:latest localhost:5000/progress-service:latest
docker push localhost:5000/progress-service

docker tag docker-task-service:latest localhost:5000/task-service:latest
docker push localhost:5000/task-service:latest

docker tag docker-team-service:latest localhost:5000/team-service:latest
docker push localhost:5000/team-service:latest

docker tag docker-web-frontend:latest localhost:5000/web-frontend:latest
docker push localhost:5000/web-frontend:latest
