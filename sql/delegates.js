'use strict';

var _ = require('lodash');
var squel = require ('squel').useFlavour ('postgres');

var DelegatesSql = {
	getLastBlocks: function (params) {
		return squel.select()
			.from('mem_accounts', 'a')
			.field(squel.select()
				.from('blocks', 'b')
				.field('ARRAY[b.timestamp, b.height]')
				.where('b."generatorPublicKey" = a."publicKey"')
				.order('b.height', false)
				.limit(1)
			, 'block')
			.field('a.address', 'address')
			.where('a.address IN ?', params.delegates)
			.where('a."isDelegate" = 1')
			.order('a.vote', false).limit(101)
			.toString();
	}
};

module.exports = DelegatesSql;
