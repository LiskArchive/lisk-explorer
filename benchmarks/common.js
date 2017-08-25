

module.exports = function (app, api) {
	const common = new api.common(app, api);

	this.getPriceTicker = function (deferred) {
		common.getPriceTicker(
			(data) => {
				deferred.resolve();
				console.log('common.getPriceTicker ~>', 'Error retrieving price ticker:', data.error);
			},
			(data) => {
				deferred.resolve();
				console.log('common.getPriceTicker ~>', 'price ticker retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.search = function (deferred) {
		common.search(
			'12907382053545086321C',
			(data) => {
				deferred.resolve();
				console.log('common.search ~>', 'Error retrieving search result:', data.error);
			},
			(data) => {
				deferred.resolve();
				console.log('common.search ~>', 'search result retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};
};
