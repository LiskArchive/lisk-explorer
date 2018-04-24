# API Endpoints

## Accounts

### /api/getAccount

Retrieves account details.

#### Params

 - `address` - lisk address
 - `publicKey` - account public key

#### Sample request

`/api/getAccount?address=16313739661670634666L`

`/api/getAccount?publicKey=c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f`


#### Sample response

```
{
  "address": "16313739661670634666L",
  "balance": "9815104270000000",
  "delegate": null,
  "incoming_cnt": 2,
  "knowledge": null,
  "multisignatures": [],
  "outgoing_cnt": 18474,
  "publicKey": "c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f",
  "secondPublicKey": "",
  "secondSignature": "",
  "success": true,
  "u_multisignatures": [],
  "unconfirmedBalance": "9815104270000000",
  "unconfirmedSignature": "",
  "voters": [],
  "votes": []
}
```

### /api/getTopAccounts

Retrieves top balance accounts.

#### Params

 - `offset` - ranking number of the first item
 - `limit` - number of objects to be returned [ 1 - 100 ]

#### Sample request

`/api/getTopAccounts?offset=0&limit=100`


#### Sample response

```
{
  "success": true,
  "accounts": [{
    "address": "16313739661670634666L",
    "balance": "9815104270000000",
    "publicKey": "c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f",
    "knowledge": {
      "owner": "genesis_6"
    }
  }]
}
```

## Blocks

### /api/getLastBlocks

Retrieves latest blocks list.

#### Params

 - `n` - ranking number of the first item (offset)

#### Sample request

`/api/getLastBlocks?n=0`


#### Sample response

```
{
  "success": true,
  "blocks": [],
  "pagination": {
    "currentPage": 1,
    "more": true,
    "nextPage": 2
  }
}
```

### /api/getBlock

Retrieves block details by id.

#### Params

 - `blockId` - block id

#### Sample request

`/api/getBlock?blockId=6524861224470851795`


#### Sample response

```
{
  "success": true,
  "block": {
    "blockSignature": "c81204bf67474827fd98584e7787084957f42ce8041e713843dd2bb352b73e81143f68bd74b06da8372c43f5e26406c4e7250bbd790396d85dea50d448d62606",
    "confirmations": 17313,
    "generatorId": "1085993630748340485L",
    "generatorPublicKey": "c96dec3595ff6041c3bd28b76b8cf75dce8225173d1bd00241624ee89b50f2a8",
    "height": 1,
    "id": "6524861224470851795",
    "numberOfTransactions": 103,
    "payloadHash": "31393866326236316138656239356662656564353862383231363738306236386636393766323662383439616366303063386339336262396232346637383364",
    "payloadLength": 19619,
    "previousBlock": "",
    "reward": "0",
    "timestamp": 0,
    "totalAmount": "10000000000000000",
    "totalFee": "0",
    "totalForged": "0",
    "version": 0,
    "delegate": {
      "address": "1330932780504881464L",
      "approval": 98.15,
      "missedblocks": 9,
      "producedblocks": 188,
      "productivity": 95.43,
      "publicKey": "68680ca0bcd4676489976837edeac305c34f652e970386013ef26e67589a2516",
      "rate": 41,
      "username": "genesis_82",
      "vote": "9822932090000000"
    }
  }
}
```

### /api/getHeight

Retrieves block details by height.

#### Params

 - `height` - block height

#### Sample request

`/api/getHeight?height=1`


#### Sample response

```
{
  "success": true,
  "block": {
    "blockSignature": "c81204bf67474827fd98584e7787084957f42ce8041e713843dd2bb352b73e81143f68bd74b06da8372c43f5e26406c4e7250bbd790396d85dea50d448d62606",
    "confirmations": 17313,
    "generatorId": "1085993630748340485L",
    "generatorPublicKey": "c96dec3595ff6041c3bd28b76b8cf75dce8225173d1bd00241624ee89b50f2a8",
    "height": 1,
    "id": "6524861224470851795",
    "numberOfTransactions": 103,
    "payloadHash": "31393866326236316138656239356662656564353862383231363738306236386636393766323662383439616366303063386339336262396232346637383364",
    "payloadLength": 19619,
    "previousBlock": "",
    "reward": "0",
    "timestamp": 0,
    "totalAmount": "10000000000000000",
    "totalFee": "0",
    "totalForged": "0",
    "version": 0,
    "delegate": {
      "address": "1330932780504881464L",
      "approval": 98.15,
      "missedblocks": 9,
      "producedblocks": 188,
      "productivity": 95.43,
      "publicKey": "68680ca0bcd4676489976837edeac305c34f652e970386013ef26e67589a2516",
      "rate": 41,
      "username": "genesis_82",
      "vote": "9822932090000000"
    }
  }
}
```

### /api/getBlockStatus

Retrieves node details.

#### Sample request

`/api/getBlockStatus`

#### Sample response

```
{
  "success": true,
  "broadhash": "2768b267ae621a9ed3b3034e2e8a1bed40895c621bbb1bbd613d92b9d24e54b5",
  "height": 17313,
  "build": "v13:14:28 17/04/2018\n",
  "commit": "9a7e1ef9d5ba40e6b150586bf452064bfb0f831e",
  "epoch": "2016-05-24T17:00:00.000Z",
  "fees": {
    "send": "10000000",
    "vote": "100000000",
    "secondSignature": "500000000",
    "delegate": "2500000000",
    "multisignature": "500000000",
    "dappRegistration": "2500000000",
    "dappWithdrawal": "10000000",
    "dappDeposit": "10000000",
    "data": "10000000"
  },
  "nethash": "198f2b61a8eb95fbeed58b8216780b68f697f26b849acf00c8c93bb9b24f783d",
  "nonce": "O2wTkjqplHII5wPv",
  "milestone": 0,
  "reward": 500000000,
  "supply": 10007577000000000,
  "version": "1.0.0",
  "fee": 10000000
}
```

## Common

### /api/getPriceTicker

Retrieves current currency prices.

#### Params

This request has no params

#### Sample request
`/api/getPriceTicker`

#### Sample response
```
{
  "success": true,
  "tickers": {
    "BTC": {
      "EUR": "7697.62",
      "RUB": "538494.7906872",
      "USD": "9390.8"
    },
    "LSK": {
      "BTC": "0.00137299",
      "EUR": 10.5687552838,
      "RUB": 739.3479626656188,
      "USD": 12.893474491999998
    }
  }
}
```


### /api/search

Performs search among the delegates, accounts, public keys, transactions, blocks and height.

#### Params

 - `id` - search query

#### Sample request

`/api/search?id=genesis`

#### Sample response

```
{
  "success": true,
  "result": {
    "type": "delegate",
    "delegates": [
      {
        "address": "12577917432507761736L",
        "username": "genesis_7",
        "similarity": 0.8571428571428571
      }
    ]
  }
}
```

## Delegates

### /api/delegates/getActive

Retrieves active delegates list.

#### Sample request

`/api/delegates/getActive`


#### Sample response

```
{
  "success": true,
  "delegates": [],
  "totalCount": 403
}
```

### /api/delegates/getStandby

Retrieves standby delegates list.

#### Params

 - `n` - ranking number of the first item (offset)

#### Sample request

`/api/delegates/getStandby?n=0`


#### Sample response

```
{
  "success": true,
  "delegates": [],
  "totalCount": 403,
  "pagination": {
    "currentPage": 1,
    "more": true,
    "nextPage": 2
  }
}
```

### /api/delegates/getLatestRegistrations

Retrieves last 5 delegate registrations list.

#### Sample request

`/api/delegates/getLatestRegistrations`


#### Sample response

```
{
  "success": true,
  "transactions": [
    ...
    "asset": {
      "delegate": {
        "username": "gottavoteemall",
        "publicKey": "d258627878a9b360fe4934218d2415d66b1ed2ef63ce097280bf02189a91468d",
        "address": "4401082358022424760L"
      }
    },
    "type": 2
  ]
}
```

### /api/delegates/getLatestVotes

Retrieves last 5 votes list.

#### Sample request

`/api/delegates/getLatestVotes`


#### Sample response

```
{
  "success": true,
  "transactions": [
    ...
    "asset": {
      "votes": [
        "+01389197bbaf1afb0acd47bbfeabb34aca80fb372a8f694a1c0716b3398db746",
        "+141b16ac8d5bd150f16b1caa08f689057ca4c4434445e56661831f4e671b7c0a",
        "+67651d29dc8d94bcb1174d5bd602762850a89850503b01a5ffde3b726b43d3d2",
        "+3ff32442bb6da7d60c1b7752b24e6467813c9b698e0f278d48c43580da972135",
        "+5d28e992b80172f38d3a2f9592cad740fd18d3c2e187745cd5f7badf285ed819",
        "+4fe5cd087a319956ddc05725651e56486961b7d5733ecd23e26e463bf9253bb5",
        "+a796e9c0516a40ccd0eee7a32fdc2dc297fee40a9c76fef9c1bb0cf41ae69750",
        "-c3d1bc76dea367512df3832c437c7b2c95508e140f655425a733090da86fb82d",
        "-640dfec4541daed209a455577d7ba519ad92b18692edd9ae71d1a02958f47b1b",
        "-3ea481498521e9fb1201b2295d0e9afa826ac6a3ef51de2f00365f915ac7ac06",
        "-5c4af5cb0c1c92df2ed4feeb9751e54e951f9d3f77196511f13e636cf6064e74"
      ]
    },
    "type": 3
  ]
}
```

### /api/getSearch

Retrieves delegates list where username matchs with a given string

#### Params

 - `q` - delegate username

#### Sample request

`/api/getSearch?q=genesis_10`


#### Sample response

```
{
  "success": true,
  "results": [
    {
      "address": "6147291942291731858L",
      "username": "genesis_10",
      "similarity": 1
    },
    {
      "address": "10881167371402274308L",
      "username": "genesis_100",
      "similarity": 0.9473684210526315
    },
    {
      "address": "6726252519465624456L",
      "username": "genesis_101",
      "similarity": 0.9473684210526315
    }
  ]
}
```

### /api/delegates/getLastBlock

Retrieves last generated block details

#### Sample request

`/api/delegates/getLastBlock`


#### Sample response

```
{
  "success": true,
  "block": {
    "success": true,
    "blockSignature": "78f97e2d5d1649e982f4e61078b41c08629b4d92a591c303a363be320e22cd9a93a91c1ff65449f38a491cce2bd6e8d838299f2f528a42ce3dc15617974f4e09",
    "confirmations": 1,
    "generatorId": "6996737717246838071L",
    "generatorPublicKey": "b5341e839b25c4cc2aaf421704c0fb6ba987d537678e23e45d3ca32454a2908c",
    "height": 26183,
    "id": "9294197171660452555",
    "numberOfTransactions": 0,
    "payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "payloadLength": 0,
    "previousBlock": "5627642679576442806",
    "reward": "0",
    "timestamp": 60468640,
    "totalAmount": "0",
    "totalFee": "0",
    "totalForged": "0",
    "version": 0,
    "delegate": {
      "address": "6996737717246838071L",
      "approval": 99.69,
      "missedblocks": 0,
      "producedblocks": 259,
      "productivity": 100,
      "publicKey": "b5341e839b25c4cc2aaf421704c0fb6ba987d537678e23e45d3ca32454a2908c",
      "rate": 73,
      "username": "genesis_24",
      "vote": "9968542110836600"
    }
  }
}
```

### /api/delegates/getLastBlocks

Retrieves latest blocks generated by a given delegate

#### Params

 - `publicKey` - delegate public key
 - `limit` - number of objects to be returned [ 1 - 20 ]

#### Sample request

`/api/delegates/getLastBlocks?publicKey=b5341e839b25c4cc2aaf421704c0fb6ba987d537678e23e45d3ca32454a2908c&limit=2`


#### Sample response

```
{
  "success": true,
  "blocks": [
    {
      "blockSignature": "78f97e2d5d1649e982f4e61078b41c08629b4d92a591c303a363be320e22cd9a93a91c1ff65449f38a491cce2bd6e8d838299f2f528a42ce3dc15617974f4e09",
      "confirmations": 43,
      "generatorId": "6996737717246838071L",
      "generatorPublicKey": "b5341e839b25c4cc2aaf421704c0fb6ba987d537678e23e45d3ca32454a2908c",
      "height": 26183,
      "id": "9294197171660452555",
      "numberOfTransactions": 0,
      "payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "payloadLength": 0,
      "previousBlock": "5627642679576442806",
      "reward": "0",
      "timestamp": 60468640,
      "totalAmount": "0",
      "totalFee": "0",
      "totalForged": "0",
      "version": 0
    },
    {
      "blockSignature": "2a8a694e11177021579a248ffb002570b4fe5ffa3b9392b9d8101ae0e571d63c068d08ba38160f0a060528119f2510d872fbcdc47b176d33a4d7011bec9cd902",
      "confirmations": 77,
      "generatorId": "6996737717246838071L",
      "generatorPublicKey": "b5341e839b25c4cc2aaf421704c0fb6ba987d537678e23e45d3ca32454a2908c",
      "height": 26149,
      "id": "8550684625941422269",
      "numberOfTransactions": 0,
      "payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "payloadLength": 0,
      "previousBlock": "2767737645242405549",
      "reward": "0",
      "timestamp": 60468300,
      "totalAmount": "0",
      "totalFee": "0",
      "totalForged": "0",
      "version": 0
    }
  ]
}
```

### /api/delegates/getNextForgers

Retrieves delegate public keys for the current forging round

#### Sample request

`/api/delegates/getNextForgers`


#### Sample response

```
{
  "success": true,
  "delegates": [
    ...,
    "1e6ce18addd973ad432f05f16a4c86372eaca054cbdbcaf1169ad6df033f6b85",
    ...,
  ] // 101 items
}
```

## Transactions

### /api/getTransaction

Retrieves transaction details by id.

#### Params

 - `transactionId` - transaction id

#### Sample request

`/api/getTransaction?transactionId=3634383815892709956`


#### Sample response

```
{
  "success": true,
  "transaction": {
    "amount": "0",
    "asset": {
      "delegate": {
        "username": "genesis_51",
        "publicKey": "01389197bbaf1afb0acd47bbfeabb34aca80fb372a8f694a1c0716b3398db746",
        "address": "2581762640681118072L"
      }
    },
    "blockId": "6524861224470851795",
    "confirmations": 17313,
    "fee": "0",
    "height": 1,
    "id": "3634383815892709956",
    "knownRecipient": null,
    "knownSender": {
      "owner": "genesis_51"
    },
    "multisignatures": [],
    "recipientId": "",
    "recipientPublicKey": "",
    "senderId": "2581762640681118072L",
    "senderPublicKey": "01389197bbaf1afb0acd47bbfeabb34aca80fb372a8f694a1c0716b3398db746",
    "signature": "86e6eed7c8adcdfd0b58d4a718847a8bf4a8c61035003871e8b89d1071123ecacb00a34fd228d9a81074c95265281d578ccb5d72a0f679f7a8066bcae92d090e",
    "signatures": [
      "86e6eed7c8adcdfd0b58d4a718847a8bf4a8c61035003871e8b89d1071123ecacb00a34fd228d9a81074c95265281d578ccb5d72a0f679f7a8066bcae92d090e"
    ],
    "timestamp": 0,
    "type": 2
  }
}
```

### /api/getUnconfirmedTransactions

Retrieves list of unconfirmed transactions.

#### Sample request

`/api/getUnconfirmedTransactions`


#### Sample response

```
{
  "success": true,
  "transactions": []
}
```

### /api/getLastTransactions

Retrieves list of last 20 transactions.

#### Sample request

`/api/getLastTransactions`


#### Sample response

```
{
  "success": true,
  "transactions": []
}
```

### /api/getTransactionsByAddress

Retrieves transactions list involving a given address.

#### Params

 - `address` - sender or recipient lisk address
 - `senderId` - sender lisk address
 - `recipientId` - recipient lisk address
 - `type` - transaction type (comma separate)
 - `offset` - ranking number of the first item
 - `limit` - number of objects to be returned [ 1 - 100 ]

#### Sample request

`/api/getTransactionsByAddress?address=16313739661670634666L&limit=50&offset=0`


#### Sample response

```
{
  "success": true,
  "transactions": []
}
```

### /api/getTransactionsByBlock

Retrieves transactions list involving a given block.

#### Params

 - `blockId` - block id
 - `offset` - ranking number of the first item
 - `limit` - number of objects to be returned [ 1 - 100 ]

#### Sample request

`/api/getTransactionsByBlock?blockId=6524861224470851795&offset=0&limit=50`


#### Sample response

```
{
  "success": true,
  "transactions": []
}
```

## Exchanges

### /api/exchanges/getOrders

Retrieves recent orders for an exchange given in a parameter.

#### Params

 - `e` - exchange name [ poloniex | bittrex ]

#### Sample request

`/api/exchanges/getOrders?e=poloniex`


#### Sample response

```
{
  "success": true,
  "orders": {
    "asks": [
      [
        0.00136755,
        8715.99461062
      ]
    ],
    "bids": [
      [
        0.00135728,
        703.185
      ]
    ],
    "depth": [
      {
        "price": "0.00132808",
        "amount": "0.41930693",
        "bid": "23.72399799",
        "ask": null
      }
    ]
  }
}
```

### /api/exchanges/getCandles

Retrieves data for the candlestick chart.

#### Params
 - `e` - exchange name [ poloniex | bittrex ]
 - `d` - density [ minute | hour | day ] 

#### Sample request

`/api/exchanges/getCandles?e=poloniex&d=hour`

#### Sample response

```
{
  "success": true,
  "timeframe": "day",
  "exchange": "poloniex",
  "candles": [
    {
      "timestamp": 1521936000,
      "date": "2018-03-25T00:00:00.000Z",
      "high": "0.00139500",
      "low": "0.00134270",
      "open": "0.00135449",
      "close": "0.00137846",
      "liskVolume": "33305.26286293",
      "btcVolume": "45.41268588",
      "firstTrade": 5482872,
      "lastTrade": 5483650,
      "nextEnd": 1521964685,
      "numTrades": 779
    }
  ]
}
```

### /api/exchanges/getStatistics
Retrieves statistics for a given exchange.
#### Params
 - `e` - exchange name [ poloniex | bittrex ]

#### Sample request
`/api/exchanges/getStatistics?e=poloniex`

#### Sample response

```
{
  "success": true,
  "exchange": "poloniex",
  "statistics": {
    "last": "0.00136800",
    "high": "0.00140023",
    "low": "0.00132748",
    "btcVolume": "119.67589436",
    "liskVolume": "88089.87281072",
    "numTrades": 2993
  }
}
```

## Statistics

### /api/statistics/getLastBlock

It gets last block from the blockchain.

#### Params
No params.


#### Sample request
`/api/statistics/getLastBlock`

#### Sample response

```
{
  "block": {
    "blockSignature": "8c789de781f3fba3410b530d85d068ce7e24b65bf320eb325d1f76b7a063f12e6b0970305e5518bf76fcf5eeaaddc8edfd9d992e2f40cff18f5ba75a848d4a0d",
    "confirmations": 1,
    "generatorId": "5370200325671668788L",
    "generatorPublicKey": "03090653ff7e36da53e844581bc7c6d67daa722290a0d64d3a8f1da2f40d2de3",
    "height": 56808,
    "id": "16050871825213953977",
    "numberOfTransactions": 0,
    "payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "payloadLength": 0,
    "previousBlock": "5574987223409863033",
    "reward": "500000000",
    "timestamp": 60469430,
    "totalAmount": "0",
    "totalFee": "0",
    "totalForged": "500000000",
    "version": 0
  },
  "success": true
}
```

### /api/statistics/getBlocks

Gets best block and volume

#### Params
No params.

#### Sample request
`/api/statistics/getBlocks`

#### Sample response
```
{
  "best": {
    "blockSignature": "fc8f15f1ff2103cc982003e2104916f89d6a1b95ba0f966f7c002fbfd00d03591df5595b53cbbc7323816bb9db2469ec8e6291b77fc5ede9c37267226fc7220f",
    "confirmations": 1,
    "generatorId": "2193676322954236363L",
    "generatorPublicKey": "1f3cbc0dc4da90dc6888221979fceea2c07913e6320c5c28bfb49851660766ac",
    "height": 56817,
    "id": "9974235976771307448",
    "numberOfTransactions": 0,
    "payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "payloadLength": 0,
    "previousBlock": "8993335212866437578",
    "reward": 500000000,
    "timestamp": 60469520,
    "totalAmount": 0,
    "totalFee": 0,
    "totalForged": 500000000,
    "version": 0
  },
  "success": true,
  "volume": {
    "amount": 0,
    "beginning": 60468530,
    "blocks": 8640,
    "end": 60382830,
    "txs": 0,
    "withTxs": 0
  }
}
```


### /api/statistics/getPeers

Gets active and disconnected peers with their location data.

#### Params
No params.

#### Sample request
`/api/statistics/getPeers`

#### Sample response
```
{
  "success": true,
  "list": {
    "connected": [
      {
        "ip": "195.201.139.252",
        "port": 5001,
        "state": 2,
        "os": "linux4.15.0-15-generic",
        "version": "1.0.0-beta.6",
        "broadhash": "9a0f70b08300d0d20f0cb8e3e2ab60072233ec613303065fac0a78e304a23956",
        "height": 56829,
        "osBrand": {
          "name": "linux",
          "group": 2
        },
        "humanState": "Connected",
        "location": {
          "ip": "195.201.139.252",
          "country_code": "DE",
          "country_name": "Germany",
          "region_code": "",
          "region_name": "",
          "city": "",
          "zip_code": "",
          "time_zone": "",
          "latitude": 51.2993,
          "longitude": 9.491,
          "metro_code": 0,
          "hostname": "node01.betanet.lisk.prolina.org"
        }
      }
    ],
    "disconnected": [
      {
        "ip": "220.178.235.84",
        "port": 5001,
        "state": 1,
        "os": "linux3.2.0-4-amd64",
        "version": "1.0.0-beta.2",
        "broadhash": "56b850d6913d2151d97faa5cc255d741e9b7d83430a20c348a3e892c173aa07e",
        "height": 29902,
        "osBrand": {
          "name": "linux",
          "group": 2
        },
        "humanState": "Disconnected",
        "location": {
          "ip": "220.178.235.84",
          "country_code": "CN",
          "country_name": "China",
          "region_code": "AH",
          "region_name": "Anhui",
          "city": "Hefei",
          "zip_code": "",
          "time_zone": "Asia/Shanghai",
          "latitude": 31.8639,
          "longitude": 117.2808,
          "metro_code": 0,
          "hostname": "220.178.235.84.unknown"
        }
      }
    ]
  }
}
```

