# Nest API image (context: repo root)
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY api/package.json api/package-lock.json ./api/
RUN cd api && npm ci

COPY shared shared
COPY api api

WORKDIR /app/api
RUN npm run build

FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production

COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/api/dist ./dist
COPY shared /shared

EXPOSE 3000

CMD ["node", "dist/main.js"]
