FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --quiet

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:lts-alpine

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./
RUN npm ci --quiet --only=production && npm cache clean --force

COPY --from=builder /usr/src/app/build ./build

ENV NODE_ENV=production
ENV HTTP_PORT 80
EXPOSE 80

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "./build/index.js"]
