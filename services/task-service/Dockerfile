# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy root workspace manifests (enables npm workspaces resolution)
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy shared library source
COPY shared/utils ./shared/utils

# Copy this service's source
COPY services/task-service ./services/task-service

# Install all workspace dependencies
RUN npm install

# Build shared utils first (service TypeScript compilation depends on it)
RUN npm run build --workspace=shared/utils

# Build the service
RUN npm run build --workspace=services/task-service

# ---- Production stage ----
FROM node:20-alpine
WORKDIR /app

# Copy workspace manifests so npm can create workspace symlinks
COPY package*.json ./
COPY shared/utils/package.json ./shared/utils/
COPY services/task-service/package.json ./services/task-service/

# Install production dependencies only (creates node_modules/@task-tracker/utils symlink)
RUN npm install --omit=dev

# Copy compiled shared utils (symlink target must exist at runtime)
COPY --from=build /app/shared/utils/dist ./shared/utils/dist

# Copy compiled service
COPY --from=build /app/services/task-service/dist ./services/task-service/dist

WORKDIR /app/services/task-service
EXPOSE 3002
CMD ["node", "dist/index.js"]
