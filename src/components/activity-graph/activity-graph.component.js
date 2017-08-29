import AppActivityGraph from './activity-graph.module';
import template from './activity-graph.html';
import './activity-graph.css';

const ActivityGraphConstructor = function (activityGraph) {
	activityGraph.call(this, this);
};

AppActivityGraph.component('activityGraph', {
	template,
	controller: ActivityGraphConstructor,
	controllerAs: 'vm',
});
