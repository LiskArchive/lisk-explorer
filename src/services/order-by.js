import AppServices from './services.module';

const OrderBy = function (predicate) {
	this.reverse = false;
	this.predicate = predicate;

	this.order = function (currentPredicate) {
		this.reverse = (this.predicate === currentPredicate) ? !this.reverse : false;
		this.predicate = currentPredicate;
	};
};

AppServices.factory('orderBy',
	() => predicate => new OrderBy(predicate));
