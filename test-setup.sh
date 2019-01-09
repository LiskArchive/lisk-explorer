#!/bin/bash
# Purpose of this script is to clean lisk database and load a snapshot to it

# Set env variables
LISK_CORE_DIR=$1
INSTANT=$2
LISK_EXPLORER_DIR=$(pwd)
BLOCKCHAIN_SNAPSHOT=test/data/test_blockchain-explorer.db.gz
LISK_CORE_CONFIG=test/data/core_config.json
DATABASE_NAME=lisk_explorer_test

## Perform initial checks
if [ -z "$LISK_CORE_DIR" ]; then echo "Usage: $0 /path/to/lisk/core [--instant]"; exit 1; fi
if [ ! -d "$LISK_CORE_DIR" ]; then echo "The argument with the Lisk Core path is not a directory"; exit 1; fi
if [ -z "$LISK_CORE_DIR/app.js" ]; then echo "The Lisk Core directory exists but it does not seem to be a Node.js application"; exit 1; fi
if [ -z "$LISK_CORE_DIR/node_modules" ]; then echo "The Lisk Core directory exists but its dependencies are not installed";  exit 1; fi
if [ ! -f "$LISK_EXPLORER_DIR/$BLOCKCHAIN_SNAPSHOT" ]; then echo "Missing snapshot file: $LISK_EXPLORER_DIR/$BLOCKCHAIN_SNAPSHOT"; exit 2; fi
if [ ! -f "$LISK_EXPLORER_DIR/$LISK_CORE_CONFIG" ]; then echo "Missing snapshot file: $LISK_EXPLORER_DIR/$LISK_CORE_CONFIG"; exit 2; fi

# Reload database snapshot
echo "Dropping database $DATABASE_NAME and creating a new one..."
dropdb $DATABASE_NAME
createdb $DATABASE_NAME

echo "Restoring snapshot into $DATABASE_NAME..."
gunzip -fcq "$LISK_EXPLORER_DIR/$BLOCKCHAIN_SNAPSHOT" | psql -d $DATABASE_NAME > /dev/null

# Run the Lisk Core node
echo "Running Lisk Core node..."
cd $LISK_CORE_DIR

# if --instant is set perform all the tests immediately
if [ "$INSTANT" == "--instant" ]
then
	node app.js -c $LISK_EXPLORER_DIR/$LISK_CORE_CONFIG 2&>1 logs/explorer_core.log &
	CORE_PID=$!
	echo "Core PID: $CORE_PID"

	cd $LISK_EXPLORER_DIR
	echo "Rebuilding candles..."
	node_modules/grunt/bin/grunt candles:build > logs\candles_test.log

	# Run functional tests
	echo "Starting Explorer..."
	node app.js > logs\explorer_test.log &
	EXPLORER_PID=$!
	echo "Explorer PID: $EXPLORER_PID"

	npm run test
	kill $EXPLORER_PID
	kill $CORE_PID
else
	PM2_SILENT=true pm2 delete lisk-core
	pm2 start app.js --name=lisk-core -- -c $LISK_EXPLORER_DIR/$LISK_CORE_CONFIG
fi
