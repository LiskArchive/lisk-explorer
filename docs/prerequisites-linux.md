# Lisk Explorer installation for Linux

## Prerequisites

These programs and resources are required to install and run Lisk Explorer.

- Nodejs v8.11.2 or higher (<https://nodejs.org/>) -- Nodejs serves as the underlying engine for code execution.

	```bash
	  curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
	  sudo apt-get install -y nodejs
	```
- Update `npm` to the version 6.x

	```bash
	  npm install -g npm@6
	```

- Redis (<http://redis.io>) -- Redis is used for caching parsed exchange data.

	```bash
	  sudo apt-get install -y redis-server
	```

	> Note: you can change your port at this step if you want to have more Redis instances in the future. Remeber to adjust the environment variable `REDIS_PORT` accordingly.

- Freegeoip (<https://github.com/fiorix/freegeoip>) -- Freegeoip is used by the Network Monitor for IP address geo-location.

	```bash
	  wget https://github.com/fiorix/freegeoip/releases/download/v3.4.1/freegeoip-3.4.1-linux-amd64.tar.gz
	  tar -zxf freegeoip-3.4.1-linux-amd64.tar.gz
	  ln -s freegeoip-3.4.1-linux-amd64 freegeoip
	  nohup ./freegeoip/freegeoip > ./freegeoip/freegeoip.log 2>&1 &
	```

- PM2 (https://github.com/Unitech/pm2) -- PM2 manages the node process for Lisk Explorer and handles log rotation (Highly Recommended)

  ```bash
  sudo npm install -g pm2
  ```

- Bower (<https://bower.io/>) -- Bower is used to look after frontend libraries.

	```
	sudo npm install -g bower
	```

- Git (<https://github.com/git/git>) -- Used for cloning and updating Lisk Explorer

  ```bash
  sudo apt-get install -y git
  ```

- Tool chain components -- Used for compiling dependencies

  ```bash
  sudo apt-get install -y python build-essential automake autoconf libtool
  ```
