# K8s Deployment Update Plan

## Task
Update K8s manifests to deploy all services to a cluster, expose API Gateway and Web Frontend publicly via Ingress, and harden with NetworkPolicy.

## Key Assumptions
- TLS left commented (user choice) — warning comment added to ingress.yaml
- Image names stay as `localhost:5000/<service>:latest` with CI/CD placeholder comment
- ADMIN_GROUP_ID added to identity-service (aligning with docker-compose)
- NetworkPolicy added for backend service isolation (user confirmed)

## Todo

- [ ] Create `k8s/secrets.yaml` — template for `task-tracker-secret` (missing, referenced everywhere)
- [ ] Fix `k8s/web-frontend/service.yaml` — NodePort → ClusterIP (Ingress handles external access)
- [ ] Update `k8s/identity-service/deployment.yaml` — add `ADMIN_GROUP_ID` from secret (missing vs docker-compose)
- [ ] Create `k8s/network-policy/network-policies.yaml` — restrict backend services to allowed callers only
- [ ] Commit and push to `claude/update-k8s-deployment-BeKWH`

## Review
_(to be filled after completion)_
