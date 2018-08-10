#!/bin/bash  
# Purpose of this script is to stop and remove all docker containers

docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker volume rm lisk-explorer_db-data lisk-explorer_lisk-logs
