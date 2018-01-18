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

AppFilters.filter('txRecipient', txTypes => (tx) => {
	if (tx.type === 0) {
		return ((tx.recipientDelegate && tx.recipientDelegate.username) ||
			tx.recipientUsername ||
			(tx.knownRecipient && tx.knownRecipient.owner) ||
			tx.recipientId);
	}
	return (txTypes[parseInt(tx.type, 10)]);
});
