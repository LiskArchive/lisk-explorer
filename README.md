# Lisk Explorer

Lisk Explorer is a blockchain explorer designed for interaction with Lisk network.

Lisk Explorer is a feature-rich single page application with following functionalities:

- Transaction browser
  - Shows all transaction details stored in the blockchain
  - Supports all transaction types with its metadata

- Block browser
  - Shows all block details stored in the blockchain

- Delegate monitor
  - Shows information about all register delegate accounts
  - Live status of the 101 active delegates

- Network monitor
  - Shows live information about all nodes
  - Shows active and disconnected nodes
  - Public IPs are shown with domain names and geographical location

To make it running at least one Lisk Core/SDK node with public API is needed.

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0)

## Installation

Clone the Lisk Explorer Repository:

```
git clone https://github.com/LiskHQ/lisk-explorer.git
cd lisk-explorer
```

### Installation with Docker

In order to install Docker, refer to the offcial [Docker Installation Instruction](https://docs.docker.com/install/).

You will also need Docker Compose [Install Docker Compose](https://docs.docker.com/compose/install/)

Update `docker-lisk-core.env` to choose your preferred node. You can easily switch between Mainnet and Testnet nodes by changing content of the env file.

#### Starting application

To start Explorer type the following command:

```
docker-compose up -d
```

It will use lastest available version from local hub by default.

#### Stopping application

The following command will remove all containers defined by the `docker-compose.yml`.

```
docker-compose down --volumes
```

For further information about managing and configuring Lisk Service, see [Run With Docker](/docs/run_with_docker.md)

### Installation From Source

- [Linux Prerequisites](docs/prerequisites-linux.md)
- [MacOS Prerequisites](docs/prerequisites-macos.md)

For further information about managing and configuring Lisk Service, see [Run From Source](/docs/run_from_source.md)


## Get Involved

|                           |                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Found a bug               | [Create new issue](https://github.com/LiskHQ/lisk-service/issues/new)                                                                    |
| Want to develop with us   | [Read Contribution Guidelines](https://github.com/LiskHQ/lisk-service/blob/development/docs/CONTRIBUTING.md)                                                                             |
| Have ideas to share       | [Come to Lisk.chat](http://lisk.chat)                                                                                            |
| Want to involve community | [Join community gitter](https://gitter.im/LiskHQ/lisk?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) |
| Found a security issue    | [See our bounty program](https://blog.lisk.io/announcing-lisk-bug-bounty-program-5895bdd46ed4)                                   |

## Contributors

https://github.com/LiskHQ/lisk-service/graphs/contributors

## License

Copyright © 2016-2019 Lisk Foundation

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the [GNU General Public License](https://github.com/LiskHQ/lisk-service/tree/master/LICENSE) along with this program.  If not, see <http://www.gnu.org/licenses/>.

***

This program also incorporates work previously released with lisk-explorer `1.1.0` (and earlier) versions under the [MIT License](https://opensource.org/licenses/MIT). To comply with the requirements of that license, the following permission notice, applicable to those parts of the code only, is included below:

Copyright © 2016-2017 Lisk Foundation
Copyright © 2015 Crypti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
