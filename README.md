

# Leasehold Explorer

Leasehold Explorer is a blockchain explorer designed for interaction with Lisk network. It is a part of [Lisk Ecosystem](https://lisk.io), a blockchain platform based on DPoS consensus protocol.

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0)

Leasehold Explorer is a feature-rich single page browser application with following functionalities:

- [Transaction browser](https://explorer.lisk.io/txs/)
  - Shows transactions with their details stored in the blockchain
  - Supports all transaction types with its metadata
  - Allows advanced filtering by date, type, amount etc.

- [Block browser](https://explorer.lisk.io/blocks/)
  - Shows blocks with their details stored in the blockchain

- [Account browser](https://explorer.lisk.io/address/6307579970857064486L)
  - Supports various account types
  - Allows advanced transaction filtering on per-account basis

- [Delegate monitor](https://explorer.lisk.io/delegateMonitor)
  - Shows information about all register delegate accounts
  - Live status of the 101 active delegates

- [Network monitor](https://explorer.lisk.io/networkMonitor)
  - Shows live information about all nodes
  - Shows active and disconnected nodes
  - Public IPs are shown with domain names and geographical location

To make it running at least one Leasehold Core node with public API is needed.

## Installation

Clone the Leasehold Explorer Repository:

```
git clone https://github.com/Leasehold/lisk-explorer.git
cd lisk-explorer
```

### Installation with Docker (recommended)

In order to install Docker, refer to the official [Docker Installation Instruction](https://docs.docker.com/install/).

You will also need Docker Compose [Install Docker Compose](https://docs.docker.com/compose/install/).

> The `docker-compose` configuration assumes that the network called `localhost` is available on your machine. If there is no such a network created you can always add one by using the following command: `docker network create localhost`.

#### Starting application

To start Explorer type the following command:

```
docker-compose up -d
```

It will use latest available version from local hub by default.

#### Stopping application

The following command will remove all containers defined by the `docker-compose.yml`.

```
docker-compose down --volumes
```

For further information about managing and configuring Leasehold Explorer, see [Run With Docker](/docs/run_with_docker.md).

### Installation From Source

For further information about managing and configuring Leasehold Explorer, see [Run From Source](/docs/run_from_source.md).

## Running tests

There are functional backend and end-to-end tests available.

The test suite is described in [Run Tests](/docs/run_tests.md) section.

## Get Involved

|                           |                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Found a bug               | [Create new issue](https://github.com/LiskHQ/lisk-explorer/issues/new)                                                           |
| Want to develop with us   | [Read Contribution Guidelines](https://github.com/LiskHQ/lisk-explorer/blob/development/docs/CONTRIBUTING.md)                    |
| Have ideas to share       | [Come to Lisk.chat](http://lisk.chat)                                                                                            |
| Want to involve community | [Join community gitter](https://gitter.im/LiskHQ/lisk?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) |
| Found a security issue    | [See our bounty program](https://blog.lisk.io/announcing-lisk-bug-bounty-program-5895bdd46ed4)                                   |


