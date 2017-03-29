'use strict';

var _ = require('underscore');
var api = require('../lib/api');
var async = require('async');
var request = require('request');
var sql = require('../sql/delegates.js');

module.exports = function (app, connectionHandler, socket) {
    var delegates  = new api.delegates(app),
        connection = new connectionHandler('Delegate Monitor:', socket, this),
        intervals  = [],
        data       = {},
        // Only used in various calculations, will not be emited directly
        tmpData    = {};

    var running = {
        'getActive'        : false,
        'getDelegateBlocks': false,
        'getRegistrations' : false,
        'getVotes'         : false,
        'getNextForgers'   : false
    };

    this.onInit = function () {
        this.onConnect();

        async.parallel([
            // We only call getLastBlock on init, later data.lastBlock will be updated from getLastBlocks
            getLastBlock,
            getActive,
            getRegistrations,
            getVotes,
            getNextForgers
        ],
        function (err, res) {
            if (err) {
                log('Error retrieving: ' + err);
            } else {
                tmpData.nextForgers = res[4];

                data.lastBlock      = res[0];
                data.active         = updateActive(res[1]);
                data.registrations  = res[2];
                data.votes          = res[3];
                data.nextForgers    = cutNextForgers(10);

                log('Emitting new data');
                socket.emit('data', data);

                newInterval(0, 5000, emitData);
                newInterval(1, 1000, emitDelegateBlock);
            }
        }.bind(this));
    };

    this.onConnect = function () {
        log('Emitting existing data');
        socket.emit('data', data);
    };

    this.onDisconnect = function () {
        for (var i = 0; i < intervals.length; i++) {
            clearInterval(intervals[i]);
        }
        intervals = [];
    };

    var newInterval = function (i, delay, cb) {
        if (intervals[i] !== undefined) {
            return null;
        } else {
            intervals[i] = setInterval(cb, delay);
            return intervals[i];
        }
    };

    // Private

    var log = function (msg) {
        console.log('Delegate Monitor:', msg);
    };

    var cutNextForgers = function (count) {
        var data = tmpData.nextForgers.delegates.slice(0, 10);

        _.each(data, function (publicKey, index) {
            var existing = findActiveByPublicKey(publicKey);
            data[index] = existing;
        });

        return data;
    };

    var getActive = function (cb) {
        if (running.getActive) {
            return cb('getActive (already running)');
        }
        running.getActive = true;
        delegates.getActive(
            function (res) { running.getActive = false; cb('Active'); },
            function (res) {
                running.getActive = false;
                getDelegateBlocks(res.delegates, function (err, delegates) {
                    if (err) {
                        return cb(err);
                    } else {
                        res.delegates = delegates;
                        return cb(null, res);
                    }
                });
            }
        );
    };

    var findActiveByPublicKey = function (publicKey) {
        return _.find(data.active.delegates, function (d) {
            return d.publicKey === publicKey;
        });
    };

    var updateDelegate = function (delegate, updateForgingTime) {
        // Update delegate with forging time
        if (updateForgingTime) {
            delegate.forgingTime = tmpData.nextForgers.delegates.indexOf(delegate.publicKey) * 10;
        }

        // Update delegate with info if should forge in current round
        if (tmpData.roundDelegates.indexOf(delegate.publicKey) === -1) {
            delegate.isRoundDelegate = false;
        } else {
            delegate.isRoundDelegate = true;
        }
        return delegate;
    };

    var updateActive = function (results) {
        // Calculate list of delegates that should forge in current round
        tmpData.roundDelegates = getRoundDelegates(tmpData.nextForgers.delegates, data.lastBlock.block.height);

        if (!data.active || !data.active.delegates) {
            return results;
        } else {
            _.each(results.delegates, function (delegate) {
                delegate = updateDelegate(delegate, true);
            });
            return results;
        }
    };

    var getDelegateBlocks = function (delegates, cb) {
        if (running.getDelegateBlocks) {
            return cb('getDelegateBlocks - already running');
        } else {
            running.getDelegateBlocks = true;
        }

        var current;
        var result = _.map(delegates, function (delegate) {
            return delegate.address;
        });

        if (result.length < 101) {
            running.getDelegateBlocks = false;
            return cb('getDelegateBlocks - failed to get active delegates');
        }

        app.db.any(sql.getLastDelegateBlocks({delegates: result}))
            .then(function (result) {
                var cum_balance = 0;
                _.each(result, function (row) {
                    current = _.find(delegates, function (current) {
                        return row.address === current.address;
                    });
                    if (current) {
                        current.block = {timestamp: row.block[0], height: row.block[1]};
                    }
                });
                running.getDelegateBlocks = false;
                return cb(null, delegates);
            }).catch(function (err) {
                if (err) {
                    log(err);
                }
                running.getDelegateBlocks = false;
                return cb(null, delegates);
            });
    };

    var emitDelegateBlock = function () {
        var current;
        // Copy current state
        var currentDelegates = _.map(data.active.delegates, function (delegate) {
            return _.clone(delegate);
        });

        getDelegateBlocks(data.active.delegates, function (err, delegates) {
            if (err) {
                log(err);
                return false;
            }
            _.each(delegates, function (delegate) {
                current = _.find(currentDelegates, function (current) {
                    return delegate.address === current.address && (!current.block || current.block.timestamp < delegate.block.timestamp);
                });
                if (current) {
                    delegate = updateDelegate(delegate, false);
                    emitDelegate(delegate);
                }
            });
        });
    };

    var getLastBlock = function (cb) {
        if (running.getLastBlock) {
            return cb('getLastBlock (already running)');
        }
        running.getLastBlock = true;
        delegates.getLastBlock(
            function (res) { running.getLastBlock = false; cb('LastBlock'); },
            function (res) { running.getLastBlock = false; cb(null, res); }
        );
    };

    var getRegistrations = function (cb) {
        if (running.getRegistrations) {
            return cb('getRegistrations (already running)');
        }
        running.getRegistrations = true;
        delegates.getLatestRegistrations(
            function (res) { running.getRegistrations = false; cb('Registrations'); },
            function (res) { running.getRegistrations = false; cb(null, res); }
        );
    };

    var getVotes = function (cb) {
        if (running.getVotes) {
            return cb('getVotes (already running)');
        }
        running.getVotes = true;
        delegates.getLatestVotes(
            function (res) { running.getVotes = false; cb('Votes'); },
            function (res) { running.getVotes = false; cb(null, res); }
        );
    };

    var getNextForgers = function (cb) {
        if (running.getNextForgers) {
            return cb('getNextForgers (already running)');
        }
        running.getNextForgers = true;
        delegates.getNextForgers(
            function (res) { running.getNextForgers = false; cb('NextForgers'); },
            function (res) { running.getNextForgers = false; cb(null, res); }
        );
    };

    var getRound = function (height) {
        return Math.floor(height / 101) + (height % 101 > 0 ? 1 : 0);
    };

    var getRoundDelegates = function (delegates, height) {
       var currentRound = getRound(height);

       var filtered = delegates.filter(function (delegate, index) {
            return currentRound === getRound(height + index + 1);
       });

       return filtered;
    };

    var delegateName = function (delegate) {
        return delegate.username + '[' + delegate.rate + ']';
    };

    var emitData = function () {
        async.parallel([
            getLastBlock,
            getActive,
            getRegistrations,
            getVotes,
            getNextForgers
        ],
        function (err, res) {
            if (err) {
                log('Error retrieving: ' + err);
            } else {
                tmpData.nextForgers = res[4];

                data.lastBlock      = res[0];
                data.active         = updateActive(res[1]);
                data.registrations  = res[2];
                data.votes          = res[3];
                data.nextForgers    = cutNextForgers(10);

                log('Emitting data');
                socket.emit('data', data);
            }
        }.bind(this));
    };

    var emitDelegate = function (delegate) {
        log('Emitting last blocks for: ' + delegateName(delegate));
        socket.emit('delegate', delegate);
    };
};
