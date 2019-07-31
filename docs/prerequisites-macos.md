# Lisk Service installation for MacOS

## Prerequisites

These programs and resources are required to install and run Lisk Explorer.

- Nodejs v8.11.2 or higher (<https://nodejs.org/>) -- Nodejs serves as the underlying engine for code execution.
	```bash
	brew update
    brew doctor
	brew install node
	```

- Update `npm` to the version 6.x
	```bash
	npm install -g npm@6
	```

- Redis (<http://redis.io>) -- Redis is used for caching parsed exchange data.
	```bash
	brew install redis
	```

	> Note: you can change your port at this step if you want to have more Redis instances in the future. Remeber to adjust the environment variable `REDIS_PORT` accordingly.

- Freegeoip (<https://github.com/fiorix/freegeoip>) -- Freegeoip is used by the Network Monitor for IP address geo-location.
  ```bash
  wget https://github.com/fiorix/freegeoip/releases/download/v3.4.1/freegeoip-3.4.1-darwin-amd64.tar.gz
  tar -zxf freegeoip-3.4.1-darwin-amd64.tar.gz
  ln -s freegeoip-3.4.1-darwin-amd64 freegeoip
  nohup ./freegeoip/freegeoip > ./freegeoip/freegeoip.log 2>&1 &
  ```

- PM2 (https://github.com/Unitech/pm2) -- PM2 manages the node process for Lisk Service and handles log rotation (Highly Recommended)

  ```bash
  npm install -g pm2
  ```

- Bower (<https://bower.io/>) -- Bower is used to look after frontend libraries.

	```
	sudo npm install -g bower
	```

- Git (<https://github.com/git/git>) -- Used for cloning and updating Lisk Service

  ```bash
  brew install git
  ```

- Tool chain components -- Used for compiling dependencies

  ```bash
  brew install automake autoconf libtool
  ```
