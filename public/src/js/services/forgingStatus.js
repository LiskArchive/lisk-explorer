'use strict';

angular.module('lisk_explorer.tools').service('forgingStatus',
  function ($rootScope, epochStampFilter, roundFilter) {
      return function (delegate, lastBlock) {
          var status = { updatedAt: delegate.blocksAt },
              statusAge = 0, blockAge = 0;

          if (delegate.block) {
              status.lastBlock     = delegate.block;
              status.blockAt       = epochStampFilter(delegate.block.timestamp);
              status.networkRound  = roundFilter(lastBlock ? lastBlock.height : 0);
              status.delegateRound = roundFilter(delegate.block.height);
              status.awaitingSlot  = status.networkRound - status.delegateRound;

              statusAge = moment().diff(delegate.blockAt, 'minutes');
              blockAge  = moment().diff(status.blockAt, 'minutes');
          } else {
              status.lastBlock = null;
          }

          if (status.awaitingSlot <= 0) {
              // Forged block in current round
              status.code = 0;
          } else if (!delegate.isRoundDelegate && (status.awaitingSlot === 1 || delegate.missedblocks === 1)) {
              // Missed block in current round
              status.code = 1;
          } else if ((!delegate.isRoundDelegate && status.awaitingSlot > 1) || (delegate.producedblocks === 0 && delegate.missedblocks > 1)) {
              // Missed block in current and last round = not forging
              status.code = 2;
          } else if (status.awaitingSlot === 1) {
              // Awaiting slot, but forged in last round
              status.code = 3;
          } else if (status.awaitingSlot === 2 || delegate.missedblocks === 1) {
              // Awaiting slot, but missed block in last round
              status.code = 4;
          } else if (!status.blockAt) {
              // Awaiting status or unprocessed
              status.code = 5;
          } else {
              // Not Forging
              status.code = 2;
          }

          delegate.status = [status.code, delegate.rate].join(':');
          return status;
      };
  });
