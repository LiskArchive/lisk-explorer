import moment from 'moment';
import AppFilters from './filters.module';

AppFilters.filter('timeAgo', epochStampFilter => timestamp => moment(epochStampFilter(timestamp)).fromNow());
