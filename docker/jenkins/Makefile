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

compose := docker-compose -f docker-compose.explorer.yml -f docker-compose.core.yml -f docker-compose.make.yml -f docker-compose.config.yml -f docker-compose.jenkins.yml

up:
	cp ../explorer/docker-compose.yml docker-compose.explorer.yml
	cp ../core-explorer/docker-compose.yml docker-compose.core.yml
	cp ../core-explorer/docker-compose.make.yml docker-compose.make.yml
	cp ../core-explorer/docker-compose.config.yml docker-compose.config.yml
	cp -a ../core-explorer/config ./
	$(compose) up --detach

coldstart: up
	cp ../../test/data/test_blockchain-explorer.db.gz $(lisk_net)_blockchain.db.gz
	$(compose) stop lisk lisk-explorer
	# $(compose) start db
	$(compose) run --rm db-task dropdb --if-exists $(lisk_db)
	$(compose) run --rm db-task createdb $(lisk_db)
	gzip --decompress --to-stdout $(lisk_net)_blockchain.db.gz |$(compose) run --rm db-task psql >/dev/null
	$(compose) start lisk lisk-explorer

logs:
	$(compose) logs

clean:
	rm -f *blockchain.db.gz
	rm docker-compose.explorer.yml docker-compose.core.yml docker-compose.make.yml docker-compose.config.yml
	rm -rf config

down:
	$(compose) down --volumes --remove-orphans

mrproper: down clean

eslint:
	$(compose) exec -T lisk-explorer npm run eslint

test:
	$(compose) exec -T lisk-explorer npm run test

http_status:
	$(compose) exec lisk-explorer curl --silent --fail 'http://localhost:6040/api/getLastBlocks' >/dev/null