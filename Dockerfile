FROM node:8 AS builder

RUN useradd --create-home lisk && \
    npm install --global bower
# As of Mai 2018 cloud.docker.com runs docker 17.06.1-ce
# however v17.12 is required to use the chown flag
#COPY --chown=lisk:lisk . /home/lisk/lisk-explorer/
COPY . /home/lisk/lisk-explorer/
RUN chown lisk:lisk --recursive /home/lisk/lisk-explorer

USER lisk
WORKDIR /home/lisk/lisk-explorer
RUN npm install && \
    npm run build


FROM node:8-alpine

RUN adduser -D lisk 
#COPY --chown=lisk:lisk --from=builder /home/lisk/lisk-explorer /home/lisk/lisk-explorer/
COPY --from=builder /home/lisk/lisk-explorer /home/lisk/lisk-explorer/
RUN chown lisk:lisk --recursive /home/lisk/lisk-explorer

USER lisk
WORKDIR /home/lisk/lisk-explorer
CMD ["node", "app.js"]
