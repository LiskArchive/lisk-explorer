/*
 * LiskHQ/lisk-explorer
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import angular from 'angular';
import AppBreadCrumb from './bread-crumb.module';
import template from './bread-crumb.html';
import './bread-crumb.css';

AppBreadCrumb.directive('breadCrumb', ($state, $transitions) => {
	const BreadCrumbCtrl = function () {
		/**
		 * Initiates the hierarchy array of sections
		 */
		this.setSections = (next, params, states, breadCrumbValues) => {
			let section = next;
			const sections = [];
			let stateParam = section.url.split('/:')[1];
			if (stateParam) stateParam = stateParam.split('?')[0];

			while (section.parentDir !== section.name) {
				states.forEach((item) => {
					if (item.name === section.parentDir) {
						sections.unshift({
							name: item.name,
							url: this.setPathParams(item.url, breadCrumbValues),
						});
						section = item;
					}
				});
			}

			sections.push({
				name: next.name,
				url: '#',
			});

			if (params[stateParam]) {
				sections.push({
					name: params[stateParam],
					url: '#',
				});
			}

			return sections;
		};

		/**
		 * Replaces any :param in path string with their corresponding values
		 * from given set of breadCrumb values.
		 * Use this method to set values either when initiating
		 * the component/controller of the state
		 * or inside any sync function's callback.
		 */
		this.setPathParams = (path, breadCrumbValues) => {
			const paramsReg = /(?:\/:([^/]+)?)/g;
			const params = path.match(paramsReg);
			let paramName = '';
			let paramValue = '';

			if (params) {
				params.forEach((item) => {
					paramName = item.replace(/(^\/:)|(\?)/g, '');
					paramValue = paramName && breadCrumbValues && breadCrumbValues[paramName] ? breadCrumbValues[paramName] : '';
					path = path.replace(item, `/${paramValue}`);
				});
			}

			return path;
		};
	};

	const BreadCrumbLink = (scope, element, attrs, ctrl) => {
		const init = (values) => {
			const states = $state.get();

			if (!scope.breadCrumb) {
				scope.breadCrumb = {};
			}

			if (values.constructor.name !== 'Transition') {
				angular.merge(scope.breadCrumb, values);
			}

			scope.breadCrumb.set = init;

			scope.sections = ctrl.setSections($state.current, $state.params, states, scope.breadCrumb);
		};

		$transitions.onSuccess({ to: '*' }, init);
	};

	return {
		restrict: 'E',
		template,
		controller: BreadCrumbCtrl,
		link: BreadCrumbLink,
	};
});
