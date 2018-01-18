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
import AppTools from '../app/app-tools.module';

AppTools.directive('depthChart', ($timeout) => {
	const { AmCharts } = window;

	function DepthChart(scope, elm) {
		const self = this;

		this.style = {
			width: '100%',
			height: '500px',
		};

		this.config = {
			type: 'serial',
			theme: 'light',
			pathToImages: '/img/amcharts/',
			precision: 8,
			colors: ['#38B449', '#d32f2f'],
			dataProvider: [{}],
			valueAxes: [{
				stackType: 'regular',
				position: 'left',
				dashLength: 5,
			}],
			graphs: [{
				fillAlphas: 0.7,
				lineAlpha: 0.5,
				title: 'Bids',
				valueField: 'bid',
			}, {
				fillAlphas: 0.7,
				lineAlpha: 0.5,
				title: 'Asks',
				valueField: 'ask',
			}],
			marginTop: 15,
			chartCursor: {
				fullWidth: true,
				cursorAlpha: 0.1,
				valueBalloonsEnabled: true,
				valueLineBalloonEnabled: true,
				valueLineEnabled: true,
				valueLineAlpha: 0.5,
				cursorColor: '#0299eb',
			},
			categoryField: 'price',
			categoryAxis: {
				startOnAxis: !0,
				dashLength: 5,
				labelRotation: 30,
				labelFunction(n, t) {
					return Number(t.category).toFixed(8);
				},
			},
		};

		this.updateDepth = () => {
			let delay = 0;

			if (!scope.data.depthChart) {
				delay = 500;
				scope.data.depthChart = AmCharts.makeChart('depthChart', self.config);
				scope.data.depthChart.categoryAxesSettings = new AmCharts.CategoryAxesSettings();
			}

			$timeout(() => {
				if (scope.data.tab !== 'depthChart') {
					return;
				}

				if (scope.data.orders.depth.length > 0) {
					scope.data.depthChart.dataProvider = scope.data.orders.depth;
					scope.data.depthChart.validateData();
					elm.contents().css('display', 'block');
				} else {
					scope.data.depthChart.dataProvider = [];
					scope.data.depthChart.validateData();
					elm.contents().css('display', 'none');
					elm.prepend('<p class="amChartsEmpty"><i class="fa fa-exclamation-circle"></i> No Data</p>');
				}

				scope.$emit('$depthChartUpdated');
			}, delay);
		};

		elm.css('width', self.style.width);
		elm.css('height', self.style.height);
	}

	return {
		restrict: 'E',
		replace: true,
		template: '<div id="depthChart"></div>',
		scope: {
			data: '=',
		},
		link(scope, elm, attr) {
			const depthChart = new DepthChart(scope, elm, attr);
			scope.$on('$ordersUpdated', depthChart.updateDepth);
		},
	};
});
