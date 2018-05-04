FROM node:6 AS builder

RUN useradd --create-home lisk && \
    npm install -g npm@5.7.1 bower
COPY --chown=lisk:lisk . /home/lisk/lisk-explorer/

USER lisk
WORKDIR /home/lisk/lisk-explorer
RUN npm install && \
    npm run build


FROM node:6-alpine

RUN adduser -D lisk 
COPY --chown=lisk:lisk --from=builder /home/lisk/lisk-explorer /home/lisk/lisk-explorer

USER lisk
WORKDIR /home/lisk/lisk-explorer
CMD ["node", "app.js"]