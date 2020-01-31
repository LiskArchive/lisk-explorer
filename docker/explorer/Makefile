.PHONY: clean coldstart mrproper up
all: up

lisk_net := $(shell grep ^ENV_LISK_NETWORK= .env |tail -n 1 |awk -F = '{ gsub("net$$", ""); print $$2 }')
ifeq ($(lisk_net),)
$(error .env file does not exist or ENV_LISK_NETWORK variable is not set.)
endif
lisk_db := $(shell grep ^ENV_LISK_DB_DATABASE= .env |tail -n 1 |awk -F = '{ gsub("net$$", ""); print $$2 }')
ifeq ($(lisk_net),)
$(error .env file does not exist or ENV_LISK_DB_DATABASE variable is not set.)
endif

compose := docker-compose -f docker-compose.yml -f docker-compose.make.yml -f docker-compose.config.yml -f  docker-compose.ports.yml

up:
	$(compose) up --detach

logs:
	$(compose) logs

clean:
	rm -f *blockchain.db.gz

down:
	$(compose) down --volumes --remove-orphans

mrproper: down clean

eslint:
	$(compose) exec lisk-explorer npm run eslint

test:
	$(compose) exec lisk-explorer npm run test

http_status:
	$(compose) exec lisk-explorer curl --silent --fail 'http://localhost:6040/api/getLastBlocks' >/dev/null