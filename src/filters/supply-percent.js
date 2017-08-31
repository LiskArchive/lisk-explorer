import AppFilters from './filters.module';

AppFilters.filter('supplyPercent', () => (amount, supply) => {
	const supplyCheck = (supply > 0);
	if (isNaN(amount) || !supplyCheck) {
		return (0).toFixed(2);
	}
	return ((amount / supply) * 100).toFixed(2);
});
