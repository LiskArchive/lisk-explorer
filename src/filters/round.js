import AppFilters from './filters.module';

AppFilters.filter('round', () => (height) => {
	if (isNaN(height)) {
		return 0;
	}
	return Math.ceil(height / 101);
});
