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
