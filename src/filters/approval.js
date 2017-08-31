import AppFilters from './filters.module';

AppFilters.filter('approval', () => (votes) => {
	if (isNaN(votes)) {
		return 0;
	}
	// (votes / 1e16) * 100
	return (parseInt(votes, 10) / 1e14).toFixed(2);
});
