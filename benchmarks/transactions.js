const logger = require('../utils/logger');

module.exports = function (app, api) {
	const transactions = new api.transactions(app);

	this.getTransaction = function (deferred) {
		transactions.getTransaction(
			'6538470051935780976',
			(data) => {
				deferred.resolve();
				logger.error('transactions.getTransaction ~>', 'Error retrieving transaction:', data.error);
			},
			() => {
				deferred.resolve();
				logger.info('transactions.getTransaction ~>', 'transaction retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getUnconfirmedTransactions = function (deferred) {
		transactions.getUnconfirmedTransactions(
			(data) => {
				deferred.resolve();
				logger.error('transactions.getUnconfirmedTransactions ~>', 'Error retrieving transactions:', data.error);
			},
			(data) => {
				deferred.resolve();
				logger.info('transactions.getUnconfirmedTransactions ~>', data.transactions.length, 'transactions retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getLastTransactions = function (deferred) {
		transactions.getLastTransactions(
			(data) => {
				deferred.resolve();
				logger.error('transactions.getLastTransactions ~>', 'Error retrieving transactions:', data.error);
			},
			(data) => {
				deferred.resolve();
				logger.info('transactions.getLastTransactions ~>', data.transactions.length, 'transactions retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getTransactionsByAddress = function (deferred) {
		transactions.getTransactionsByAddress(
			{ address: '12907382053545086321C',
				offset: 0,
				limit: 100 },
			(data) => {
				deferred.resolve();
				logger.error('transactions.getTransactionsByAddress ~>', 'Error retrieving transactions:', data.error);
			},
			(data) => {
				deferred.resolve();
				logger.info('transactions.getTransactionsByAddress ~>', data.transactions.length, 'transactions retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getTransactionsByBlock = function (deferred) {
		transactions.getTransactionsByBlock(
			{ blockId: '13592630651917052637',
				offset: 0,
				limit: 100 },
			(data) => {
				deferred.resolve();
				logger.error('transactions.getTransactionsByBlock ~>', 'Error retrieving transactions:', data.error);
			},
			(data) => {
				deferred.resolve();
				logger.info('transactions.getTransactionsByBlock ~>', data.transactions.length, 'transactions retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};
};

