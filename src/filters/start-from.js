import AppFilters from './filters.module';

AppFilters.filter('startFrom', () => (input, start) => {
	/** @todo what the hell does this mean? */
	start = +start;
	return input.slice(start);
});
