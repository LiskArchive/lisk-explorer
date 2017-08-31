import AppFilters from './filters.module';

AppFilters.filter('alterWordSeparation', () => {
	const trim = str => str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	const types = {
		dashSeparated: {
			reg: /\s/g,
			alternate: '-',
		},
		spaceSeparated: {
			reg: /-/g,
			alternate: ' ',
		},
	};
	return (phrase, type) => {
		if (type in types) {
			return trim(phrase).replace(types[type].reg, types[type].alternate);
		}
		return false;
	};
});
