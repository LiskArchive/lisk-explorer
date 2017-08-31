import AppFilters from './filters.module';

/**
 * @todo Directive
 */
// eslint-disable-next-line no-unused-vars
AppFilters.filter('proposal', $sce => (name, proposals, property) => {
	const temp = (proposals && name) ? proposals[name.toLowerCase()] : null;
	return temp && property ? temp[property] : temp;
});
