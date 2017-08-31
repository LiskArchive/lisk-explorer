import AppServices from './services.module';

const ForgingMonitor = function (forgingStatus) {
	const countBy = (arr, mapper) => {
		const result = {};

		arr.forEach((item) => {
			const key = mapper(item);
			if (result[key]) {
				result[key]++;
			} else {
				result[key] = 1;
			}
		});

		return result;
	};

	this.getStatus = delegate => forgingStatus(delegate);

	this.getForgingTotals = (delegates) => {
		const cnt1 = countBy(delegates, (d) => {
			let value;
			switch (d.forgingStatus.code) {
			case 0:
			case 3:
				value = 'forging';
				break;
			case 1:
			case 4:
				value = 'missedBlock';
				break;
			case 2:
				value = 'notForging';
				break;
			default:
				value = 'unprocessed';
				break;
			}
			return value;
		});
		const cnt2 = countBy(delegates, (d) => {
			switch (d.forgingStatus.code) {
			case 3:
			case 4:
				return 'awaitingSlot';
			default:
				return 'unprocessed';
			}
		});

		cnt1.awaitingSlot = cnt2.awaitingSlot;
		return cnt1;
	};

	this.getForgingProgress = (totals) => {
		let unprocessed = totals.unprocessed || 0;
		unprocessed += totals.staleStatus || 0;

		if (unprocessed > 0) {
			return (101 - unprocessed);
		}
		return 101;
	};
};

AppServices.service('forgingMonitor',
	forgingStatus => new ForgingMonitor(forgingStatus));
