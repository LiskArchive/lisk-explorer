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
module.exports = [
	{
		endpoint: 'getLastBlocks',
		service: 'blocks',
		params: 1,
		data: data => data.blocks.length,
	}, {
		endpoint: 'getBlock',
		service: 'blocks',
		params: '13592630651917052637',
	}, {
		endpoint: 'getBlockStatus',
		service: 'blocks',
		params: undefined,
	},
];
