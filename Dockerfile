FROM node:8 AS builder

RUN useradd --create-home lisk
COPY --chown=lisk:lisk ./package-lock.json ./package.json /home/lisk/lisk-explorer/
WORKDIR /home/lisk/lisk-explorer
USER lisk
RUN npm ci
COPY --chown=lisk:lisk . /home/lisk/lisk-explorer/
RUN mkdir -p public
RUN mkdir -p logs
RUN npm run build


FROM node:8-alpine

RUN adduser -D lisk
COPY --chown=lisk:lisk --from=builder /home/lisk/lisk-explorer /home/lisk/lisk-explorer/

USER lisk
WORKDIR /home/lisk/lisk-explorer
CMD ["node", "app.js"]
