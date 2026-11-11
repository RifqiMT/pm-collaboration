# Single-process TeamCompass web host — keeps rooms.json on local disk.
# No Redis required. One container / one writer.
FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production \
    CADENCE_STORE=file \
    CADENCE_DATA_DIR=/data \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY apps/web/package.json apps/web/

RUN npm ci

COPY packages/core packages/core
COPY apps/web apps/web

RUN npm run build \
  && mkdir -p /data \
  && chown -R node:node /data /app

USER node
EXPOSE 3000
VOLUME ["/data"]

CMD ["npm", "run", "start", "-w", "@cadence/web", "--", "-H", "0.0.0.0", "-p", "3000"]
