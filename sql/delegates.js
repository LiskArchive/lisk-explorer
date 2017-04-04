'use strict';

var DelegatesSql = {
    getLastDelegateBlocks: function (params) {
        return [
            'SELECT',
                'a.address AS address,',
                '(SELECT ARRAY[b.timestamp, b.height] FROM blocks b WHERE b."generatorPublicKey" = a."publicKey" ORDER BY b.height DESC LIMIT 1) AS block',
            'FROM mem_accounts a',
            'WHERE a.address IN (${delegates:csv}) AND a."isDelegate" = 1',
            'LIMIT ' + params.delegates.length
        ].filter(Boolean).join(' ');
    },

    getDelegateByName: 'SELECT ENCODE(m."publicKey", \'hex\') AS "publicKey", m.address AS address FROM mem_accounts m WHERE m."isDelegate" = 1 AND m."username" = ${delegate} LIMIT 1',

    getVotersHistory: function () {
        return [
            'SELECT',
                't.id AS id, b.timestamp AS timestamp, t."senderId" AS sender, a.username AS delegate, a.balance AS balance,',
                '(CASE WHEN position(\'+\' || ${publicKey} in v.votes) > 0 THEN \'vote_add\' ELSE \'vote_remove\' END) AS type',
            'FROM votes v',
            'LEFT JOIN trs t ON t.id = v."transactionId"',
            'LEFT JOIN mem_accounts a ON a."publicKey" = t."senderPublicKey"',
            'LEFT JOIN blocks b ON b.id = t."blockId"',
            'WHERE v.votes LIKE \'%${publicKey:value}%\'',
            'ORDER BY b.timestamp ASC'
        ].filter(Boolean).join(' ');
    }
};

module.exports = DelegatesSql;
