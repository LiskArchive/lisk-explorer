# Lisk Explorer Test Suite

## Functional Tests

Before running any tests, please ensure Lisk Explorer and Lisk Client are configured to run on the Lisk Testnet.

> Hint: Make sure you have `wget` installed.

```
bash ./test-setup.sh /PATH_TO_LISK_DIR
```

Launch Lisk Explorer (runs on port `6040`):

```
pm2 start pm2-explorer.json
```

Run the test suite:

```
npm test
```

Run individual tests:

```
npm test -- test/api/accounts.js
npm test -- test/api/transactions.js
```

## End-to-end Tests

### Setup for end-to-end tests:

Do all setup steps from "Test" section of this readme

> Hint: Make sure you have `wget` installed.

Setup protractor

```
npm run install:e2e
```

### Run end-to-end test suite:

```
./test-setup.sh /PATH_TO_LISK_DIR
npm run test:e2e -s
```

### Run one end-to-end test feature file:

```
npm run test:e2e -s -- --specs=features/address.feature
```