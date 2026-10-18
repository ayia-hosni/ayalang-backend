# --- deps: install all dependencies (incl. dev) for building ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- build: compile TypeScript to dist/ ---
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- prod-deps: install production-only dependencies ---
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- runtime: minimal final image ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache netcat-openbsd
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY docker/entrypoints/backend-entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh && chown nestjs:nodejs ./entrypoint.sh
RUN mkdir -p /data/recordings && chown nestjs:nodejs /data/recordings
USER nestjs
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
