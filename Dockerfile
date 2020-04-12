FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm ci --quiet && npm run build

FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --quiet --only=production

COPY --from=builder /usr/src/app/build ./build

ENV NODE_ENV=production
ENV HTTP_PORT 80
EXPOSE 80
CMD ["npm", "start"]
