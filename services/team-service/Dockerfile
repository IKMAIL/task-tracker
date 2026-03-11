# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy root workspace manifests (enables npm workspaces resolution)
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy shared library source
COPY shared/utils ./shared/utils

# Copy this service's source
COPY services/team-service ./services/team-service

# Install all workspace dependencies
RUN npm install

# Build shared utils first (service TypeScript compilation depends on it)
RUN npm run build --workspace=shared/utils

# Build the service
RUN npm run build --workspace=services/team-service

# ---- Production stage ----
FROM node:20-alpine
WORKDIR /app

# Copy workspace manifests so npm can create workspace symlinks
COPY package*.json ./
COPY shared/utils/package.json ./shared/utils/
COPY services/team-service/package.json ./services/team-service/

# Install production dependencies only (creates node_modules/@task-tracker/utils symlink)
RUN npm install --omit=dev

# Copy compiled shared utils (symlink target must exist at runtime)
COPY --from=build /app/shared/utils/dist ./shared/utils/dist

# Copy compiled service
COPY --from=build /app/services/team-service/dist ./services/team-service/dist

WORKDIR /app/services/team-service
EXPOSE 3006
CMD ["node", "dist/index.js"]
