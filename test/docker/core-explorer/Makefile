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

coldstart: up
	cp ../../data/test_blockchain-explorer.db.gz $(lisk_net)_blockchain.db.gz
	$(compose) stop lisk
	# $(compose) start db
	$(compose) run --rm db-task dropdb --if-exists $(lisk_db)
	$(compose) run --rm db-task createdb $(lisk_db)
	gzip --decompress --to-stdout $(lisk_net)_blockchain.db.gz |$(compose) run --rm db-task psql >/dev/null
	$(compose) start lisk

logs:
	$(compose) logs

clean:
	rm -f *blockchain.db.gz

down:
	$(compose) down --volumes --remove-orphans

mrproper: down clean
