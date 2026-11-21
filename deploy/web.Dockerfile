# Platform image: Angular build served by unprivileged nginx on 8080.
# src/web/Dockerfile (nginx on 80) belongs to the old Docker Compose deployment.
FROM node:26-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY angular.json tsconfig.json tsconfig.app.json ./
COPY public public
COPY shared shared
COPY src src
RUN npx ng build --configuration production

FROM nginxinc/nginx-unprivileged:1.31.7-alpine
# Base images trail Alpine's security fixes; take every fixed package at build time.
USER root
RUN apk upgrade --no-cache
USER 101
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ascend-os/browser /usr/share/nginx/html
EXPOSE 8080
