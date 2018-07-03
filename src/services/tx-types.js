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

AppServices.value('txTypes', {
	0: 'Balance transfer',
	1: 'Second signature creation',
	2: 'Delegate registration',
	3: 'Delegate vote',
	4: 'Multi-signature creation',
	5: 'DApp registration',
	6: 'DApp deposit',
	7: 'DApp withdrawal',
});
