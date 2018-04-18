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

/**
 * Sorts given peers based on version strings
 *
 * @param {Object} p1 - First peer to compare
 * @param {Object} p2 - Second peer to compare against
 *
 * @returns {Number} 1, -1, 0 if respectively greater, smaller or equal versions
 */
const sortByVersion = (p1, p2) => {
	const v1 = typeof p1 === 'string' ? p1 : p1.version;
	const v2 = typeof p2 === 'string' ? p2 : p2.version;
	if (v1 === v2) return 0;

	const v1Components = v1.toString().split('.').map(n => parseInt(n, 10));
	const v2Components = v2.toString().split('.').map(n => parseInt(n, 10));
	const char1 = v1.match(/[a-zA-Z]$/);
	const char2 = v2.match(/[a-zA-Z]$/);
	if (char1) v1Components.push(char1[0]);
	if (char2) v2Components.push(char2[0]);

	for (let i = 0; i < v1Components.length && i < v2Components.length; i++) {
		if (v1Components[i] > v2Components[i]) return 1;
		else if (v1Components[i] < v2Components[i]) return -1;
	}

	const diff = v1Components.length - v2Components.length;

	if (diff > 0) return 1;
	else if (diff < 0) return -1;
	return 0;
};

const osSort = (p1, p2) => {
	if (p1 === p2) return 0;
	return (p1 > p2) ? 1 : -1;
};

const numericSort = (p1, p2) => p1 - p2;

const stringSort = (p1, p2) => {
	if (p1 === p2) return 0;
	return (p1 > p2) ? 1 : -1;
};

const OrderBy = function (predicate) {
	this.reverse = false;
	this.predicate = predicate;

	this.setPredicate = (currentPredicate) => {
		this.reverse = (this.predicate === currentPredicate) ? !this.reverse : false;
		this.predicate = currentPredicate;
	};

	this.order = (el1, el2) => {
		if (this.predicate === 'version') {
			return sortByVersion(el1.value, el2.value);
		}
		if (this.predicate === 'port' || this.predicate === 'height') {
			return numericSort(el1.value, el2.value);
		}
		if (this.predicate === 'os') {
			return osSort(el1.value, el2.value);
		}
		return stringSort(el1.value, el2.value);
	};
};

AppServices.factory('orderBy',
	() => predicate => new OrderBy(predicate));
