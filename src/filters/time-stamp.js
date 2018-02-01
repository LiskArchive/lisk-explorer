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
import AppFilters from './filters.module';

AppFilters.filter('timestamp', epochStampFilter => (timestamp) => {
	const stamp = epochStampFilter(timestamp);
	let month = stamp.getMonth() + 1;

	if (month < 10) {
		month = `0${month}`;
	}

	let day = stamp.getDate();

	if (day < 10) {
		day = `0${day}`;
	}

	let hours = stamp.getHours();
	let minutes = stamp.getMinutes();
	let seconds = stamp.getSeconds();

	/**
	 * @todo use zeroFill instead
	 */
	if (hours < 10) {
		hours = `0${hours}`;
	}

	if (minutes < 10) {
		minutes = `0${minutes}`;
	}

	if (seconds < 10) {
		seconds = `0${seconds}`;
	}

	return `${stamp.getFullYear()}/${month}/${day} ${hours}:${minutes}:${seconds}`;
});
