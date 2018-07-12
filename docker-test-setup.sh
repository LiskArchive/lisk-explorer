#!/bin/bash  
# Purpose of this script is to clean lisk database and load a snapshot to it

if [ ! -f blockchain_explorer.db.gz ]; then
  wget https://downloads.lisk.io/lisk-explorer/dev/blockchain_explorer.db.gz
fi

docker-compose exec lisk-service cp test/known.test.json known.json
docker-compose restart lisk-service

docker-compose stop lisk-core
docker-compose start db
docker-compose run --rm db-task dropdb --if-exists lisk_test
docker-compose run --rm db-task createdb lisk_test
gzip --decompress --to-stdout blockchain_explorer.db.gz |docker-compose run --rm db-task psql >/dev/null
docker-compose start lisk-core
