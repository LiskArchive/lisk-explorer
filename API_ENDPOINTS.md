# API Endpoints

## Accounts

### /api/getAccount

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