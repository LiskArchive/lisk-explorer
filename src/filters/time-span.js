import moment from 'moment';
import AppFilters from './filters.module';

AppFilters.filter('timeSpan', epochStampFilter => (a, b) => moment.duration(
	epochStampFilter(a) -
				(b ? epochStampFilter(b) : new Date()),
).humanize());
