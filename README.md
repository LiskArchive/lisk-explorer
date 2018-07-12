# Lisk Explorer

Lisk Explorer is a frontend application for visualising and presenting the information and activity on the Lisk blockchain. It works in conjunction with the Lisk Service API.

[![Build Status](https://travis-ci.org/LiskHQ/lisk-explorer.svg?branch=development)](https://travis-ci.org/LiskHQ/lisk-explorer)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0)

## Prerequisites

These programs and resources are required to install and run Lisk Explorer

- Nodejs v6.12.3 or higher (<https://nodejs.org/>) -- Nodejs serves as the underlying engine for code execution.

  ```
  curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

- Bower (<https://bower.io/>) -- Bower is used to look after frontend libraries.

  `sudo npm install -g bower`

- PM2 (https://github.com/Unitech/pm2) -- PM2 manages the node process for Lisk Explorer and handles log rotation (Highly Recommended)

  `sudo npm install -g pm2`
  
- PM2-logrotate (https://github.com/pm2-hive/pm2-logrotate) -- Manages PM2 logs

  ```
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 100M
  ```

- Git (<https://github.com/git/git>) -- Used for cloning and updating Lisk Explorer

  `sudo apt-get install -y git`

- Tool chain components -- Used for compiling dependencies

  `sudo apt-get install -y python build-essential automake autoconf libtool`

## Installation Steps

Clone the Lisk Explorer Repository:

```
git clone https://github.com/LiskHQ/lisk-explorer.git
cd lisk-explorer
npm install
```

## Build Steps

 Lisk Explorer uses Webpack to create the bundles.
 
 For having a watcher to generate bundles continuously for all the changes of the code, Run the following command:

`npm run start`
 
 And for generating the minified bundles in production environment run:
 
`npm run build`

 If you want to add a meta tag with name and content defined (For example to verify your ownership to Google analytics) run:
 
 `SERVICE_NAME='your service name' CLIENT_ID='you client id' npm run build`

## Post-deployment Actions

## Configuration

The default `config.js` file contains all of the configuration settings for Lisk Explorer. These options can be modified according to comments included in configuration file.

## Managing Lisk Explorer

To test that Lisk Explorer is configured correctly, run the following command:

```
node app.js
```

Open: <http://localhost:6040>, or if its running on a remote system, switch `localhost` for the external IP Address of the machine.

Once the process is verified as running correctly, `CTRL+C` and start the process with `PM2`. This will fork the process into the background and automatically recover the process if it fails.

```
pm2 start pm2-explorer.json
```

After the process is started its runtime status and log location can be found by issuing this statement:

```
pm2 list
```

To stop Explorer after it has been started with `PM2`, issue the following command:

```
pm2 stop lisk-explorer
```

## Docker

#### Starting application

To start Lisk Explorer type the following command:

```
docker-compose up -d
```

It will spin up the Lisk Explorer and its dependencies such as Lisk Service and Lisk Core using lastest available version from local hub by default.

#### Running tests using Docker

Start Lisk Explorer following the previous instruction and then run:

```
bash docker-test-setup.sh
npm run e2e
```

#### Stopping application

The following command will remove all containers defined by the `docker-compose.yml`.

```
docker-compose down --volumes
```

The parameter `--volumes` will remove all associated volumes that would not be useful anyway - next instances after `docker-compose up` create new volumes so the data will not be reused.

The example above will stop whole application gracefully but it leaves images in your repository. It is useful only if you plan to run the solution again. Otherwise you may want to clean up after these containers. You can use additional param for this purpose: `--rmi local` to remove untagged images. In case you want to remove all images related to this application add `--rmi all` to the `docker-compose` command.

### Using docker-compose

You can update `docker-compose.yml` to choose your Lisk Core node. You can easily switch between Mainnet and Testnet nodes.

Replace `<CORE_NODE_IP>` and `<CORE_NODE_PORT>` accordingly.

Remember that in order to use any Lisk Core node your IP must be whitelisted, or the node must be configured to accept unknown IPs.

```
lisk-service:
    ...
    environment:
      - LISK_HOST=<CORE_NODE_IP>
      - LISK_PORT=<CORE_NODE_PORT>
      ...
```

#### Building other version than latest

If you want to build other versions, you have to change the tag name in `docker-compose.yml`. You can also build from your local branch by replacing `image:` tag for `build: .` under section called `lisk-explorer:`.

You can also run Lisk Explorer over different version of Lisk Service or Lisk Core. In order to do that just change the tag name `image:` under the section called `lisk-service:` or `lisk-core:` in `docker-compose.yml`.

### Manual Docker deployment

First, build a new docker image in your local repository.
Replace `<TAG_NAME>` with the branch or tag name ex. `3.0.0`.

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

Replace `<LISK_SERVICE_IP>`, `<LISK_SERVICE_PORT>` and `<TAG_NAME>` accordingly.

Remember that in order to use any Lisk node your IP must be whitelisted, or the node must be configured to accept unknown IPs.

```
docker run -p 6040:6040 \
	-e LISK_SERVICE_HOST=<LISK_SERVICE_IP> \
	-e LISK_SERVICE_PORT=<LISK_SERVICE_PORT> \
	--network=lisk-net \
	--name=lisk-explorer \
	-d lisk-explorer:<TAG_NAME>
```

## End-to-end Tests

### Setup for end-to-end tests:

It's highly recommended to run the tests using Docker. It makes it much easier to run all the required dependencies and setup the database snapshot used in the tests.

```
docker-compose up -d
bash docker-test-setup.sh
```

### Run end-to-end test suite:

```
npm run e2e
```

### Run one end-to-end test feature file:

```
npm run e2e -s -- --specs=features/address.feature
```

## Contributors

https://github.com/LiskHQ/lisk-explorer/graphs/contributors

## License

Copyright © 2016-2017 Lisk Foundation

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the [GNU General Public License](https://github.com/LiskHQ/lisk-explorer/tree/master/LICENSE) along with this program.  If not, see <http://www.gnu.org/licenses/>.

***

This program also incorporates work previously released with lisk-explorer `1.1.0` (and earlier) versions under the [MIT License](https://opensource.org/licenses/MIT). To comply with the requirements of that license, the following permission notice, applicable to those parts of the code only, is included below:

Copyright © 2016-2017 Lisk Foundation  
Copyright © 2015 Crypti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
