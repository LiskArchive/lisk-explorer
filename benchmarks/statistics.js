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
		endpoint: 'getLastBlock',
		service: 'statistics',
		title: 'blocks',
		params: undefined,
		data: data => data.volume.blocks,
	}, {
		endpoint: 'getBlocks',
		service: 'statistics',
		title: 'blocks',
		params: undefined,
	}, {
		endpoint: 'getPeers',
		service: 'statistics',
		title: 'peers',
		params: undefined,
		data: data => (data.list.connected.length + data.list.disconnected.length),
	},
];
