# Build Angular app (context: repo root)
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY angular.json tsconfig.json tsconfig.app.json ./
COPY public public
COPY shared shared
COPY src src

ARG PRIME_NG_LICENCE=
ENV PRIME_NG_LICENCE=$PRIME_NG_LICENCE
RUN npx ng build --configuration production \
  --define ASCEND_PRIME_NG_LICENCE=$(node -p 'JSON.stringify(process.env.PRIME_NG_LICENCE||"")')

FROM nginx:1.27-alpine

COPY src/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ascend-os/browser /usr/share/nginx/html

EXPOSE 80
