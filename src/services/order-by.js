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

const OrderBy = function (predicate) {
	this.reverse = false;
	this.predicate = predicate;

	this.order = function (currentPredicate) {
		this.reverse = (this.predicate === currentPredicate) ? !this.reverse : false;
		this.predicate = currentPredicate;
	};
};

AppServices.factory('orderBy',
	() => predicate => new OrderBy(predicate));
