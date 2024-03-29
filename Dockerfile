FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --quiet

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:18-alpine

RUN apk add --no-cache tini curl

WORKDIR /app

COPY package*.json ./
RUN npm ci --quiet --only=production && npm cache clean --force

COPY --from=builder /usr/src/app/build ./build

ENV NODE_ENV=production
ENV HTTP_PORT 80
EXPOSE 80
HEALTHCHECK CMD curl --fail http://localhost:${HTTP_PORT}/__health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "./build/src/index.js"]
