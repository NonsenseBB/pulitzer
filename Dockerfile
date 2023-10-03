FROM node:18-bookworm AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --quiet

COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:18-bookworm-slim

RUN apt-get update \
    && apt-get install -y tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --quiet --only=production && npm cache clean --force

COPY --from=builder /usr/src/app/build ./build

RUN chown -R node:node /app

USER node

ENV NODE_ENV=production
ENV HTTP_PORT 80
EXPOSE 80
HEALTHCHECK CMD curl --fail http://localhost:${HTTP_PORT}/__health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "./build/index.js"]
