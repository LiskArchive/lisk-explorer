
# Run Lisk Explorer with Docker

Clone the Lisk Explorer Repository:

```
git clone https://github.com/LiskHQ/lisk-explorer.git
cd lisk-explorer
```

## Using docker-compose

This is a recommended way to install Lisk Explorer.

The default config points to official mainnet Lisk Core nodes. You can override the variables `LISK_HOST` and `LISK_PORT` by using a custom environment file. Refer to the Docker documentation for more details.

The docker-compose always takes the latest version available from Docker Hub. If you consider using a specified version you can override the configuration in the `docker-compose.yml` file.

> If you want to make a build from your locally modified version the first command you would like to use is `docker build ./ -t lisk/explorer:latest` in the root project directory.

> The `docker-compose` configuration assumes that the network called `localhost` is available on your machine. If there is no such a network created you can always add one by using the following command: `docker network create localhost`.

### Starting application

To start Explorer type the following command:

```
docker-compose up -d
```

It will use latest available version from local hub by default.

### Stopping application

The following command will remove all containers defined by the `docker-compose.yml`.

```
docker-compose down --volumes
```

The parameter `--volumes` will remove all associated volumes that would not be useful anyway - next instances after `docker-compose up` create new volumes so the data will not be reused.

> The example above will stop whole application gracefully but it leaves images in your repository. It is useful only if you plan to run the solution again. Otherwise you may want to clean up after these containers. You can use additional param for this purpose: `--rmi local` to remove untagged images. In case you want to remove all images related to this application add `--rmi all` to the `docker-compose` command.

### Building other version than the latest

If you want to build other version, you have to change the tag name in `docker-compose.yml`. You can also build from your local branch by adding `build .` under section called `lisk-explorer:`.

## Alternative: Manual Docker deployment

First, build a new docker image in your local repository.
Replace `<TAG_NAME>` with the branch or tag name ex. `1.5.0`.

```
docker build https://github.com/LiskHQ/lisk-explorer.git#<TAG_NAME> -t lisk-explorer:<TAG_NAME>
```

Create dedicated virtual network for Lisk. This method replaces deprecated Docker parameter `--link`. In this example the virtual network is called `lisk-net`, but it may be changed to any other valid name. It is important to keep consistency and apply that name for every `--network` parameter used in commands below.

```
docker network create lisk-net
```

Create containers with Redis and FreeGeoIP.
```
docker run --name=lisk-redis --network=lisk-net -d redis:alpine
docker run --name=lisk-freegeoip --network=lisk-net --restart=always -d fiorix/freegeoip
```
Run the application within the same network that you created in the second step.

Replace `<LISK_NODE_IP>` and `<LISK_NODE_PORT>` accordingly.
Remember that in order to use any Lisk node your IP must be whitelisted, or the node must be configured to accept unknown IPs.

```
docker run -p 6040:6040 \
	-e LISK_HOST=<LISK_NODE_IP> \
	-e LISK_PORT=<LISK_NODE_PORT> \
	-e REDIS_HOST=lisk-redis \
	-e FREEGEOIP_HOST=lisk-freegeoip \
	--network=lisk-net \
	--name=lisk-explorer \
	-d lisk-explorer:1.4.3
```

You may also want to initialize Market Watcher data.

```
docker exec -it lisk-explorer ~/lisk-explorer/node_modules/grunt/bin/grunt candles:build
```
