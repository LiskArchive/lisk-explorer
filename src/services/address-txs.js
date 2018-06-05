/*
 * LiskHQ/lisk-explorer
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import AppServices from './services.module';
import LessMore from './less-more';

AppServices.factory('addressTxs',
	($http, $q) => (data) => {
		const params = Object.assign({}, data, {
			url: '/api/getTransactionsByAddress',
			parent: 'address',
			key: 'transactions',
		});

		const lessMore = new LessMore($http, $q, params);

		lessMore.loadMore = function () {
			this.getData(0, 1, (response) => {
				let changed = false;

				if (this.results[0] && response[0]) {
					changed = (this.results[0].id !== response[0].id);
				}
				if (changed) {
					this.reloadMore();
				} else {
					LessMore.prototype.loadMore.call(this);
				}
			});
		};

		return lessMore;
	});
