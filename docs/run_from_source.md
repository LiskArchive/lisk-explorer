# Run Lisk Explorer from Source

Clone the Lisk Explorer Repository:

```
git clone https://github.com/LiskHQ/lisk-explorer.git
cd lisk-explorer
```

## Build Steps

```
npm install
bower install
```

The frontend is using Webpack to create core bundles for Lisk Explorer.

And for generating the minified bundles in production environment run:

`npm run build`


## Post-deployment Actions

#### Market Watcher (candlestick data)
Candlestick data needs to be initialized prior to starting Lisk Explorer. This step writes data to the local Redis instance. Make sure that your application is already deployed and has access to the production Redis database.

To build candlestick data for each exchange run:

`grunt candles:build`

## Managing Lisk Explorer

To test that Lisk Explorer is configured correctly, use the following commands:

```
npm run start          // default config based on environment variables
npm run start:local    // connect with localhost:4000
npm run start:testnet  // connect with testnet
npm run start:mainnet  // connect with mainnet
```

Open: <http://localhost:6040>, or if its running on a remote system, switch `localhost` for the external IP Address of the machine.

Once the process is verified as running correctly, `CTRL+C` and start the process with `PM2`. This will fork the process into the background and automatically recover the process if it fails.

## Optional steps

### Configuration

You can configure the application by setting the following variables manually and running the process from commandline.

```
- LISK_HOST=node.lisk.io       # Lisk Core/SDK host IP/domain name
- LISK_PORT=8000               # Lisk Core/SDK port
- REDIS_HOST=localhost         # Redis host IP
- REDIS_PORT=6379              # Redis port
- REDIS_DB=0                   # Redis database number
```
> The default `config.js` file contains all of the configuration settings for Lisk Explorer. These options can be modified according to comments included in configuration file.

### Frontend source code watcher

For having a watcher to generate bundles continuously for all the changes of the code, Run the following command:

`DEBUG=true npm run watch`

### Google Analytics

If you want to add a meta tag with name and content defined (For example to verify your ownership to Google analytics) run:

```
SERVICE_NAME='your service name' \
CLIENT_ID='you client id' \
npm run build
```

### Market Watcher

In case of problems with candlestick chart it may be beneficial to rebuild the database by running the following command again.

`grunt candles:build`

To update candlestick data manually run after initialization 

`grunt candles:update`

During runtime candlestick data is updated automatically.

### Run with PM2

`pm2 start pm2-explorer.json`

After the process is started its runtime status and log location can be found by issuing this statement:

`pm2 list`

To stop Explorer after it has been started with `PM2`, issue the following command:

`pm2 stop lisk-explorer`
