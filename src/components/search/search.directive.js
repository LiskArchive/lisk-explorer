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
import AppSearch from './search.module';
import template from './search.html';

AppSearch.directive('search', ($rootScope, $location, $timeout, Global, $http) => {
	const SearchCtrl = function () {
		const sch = this;
		this.loading = false;
		this.badQuery = false;

		const _badQuery = () => {
			this.badQuery = true;

			$timeout(() => {
				this.badQuery = false;
			}, 4000);
		};

		const _resetSearch = () => {
			this.q = '';
			this.loading = false;

			$timeout(() => {
				sch.showingResults = false;
			}, 200);
		};

		this.onSearchIconClick = () => {
			if (!this.mobileView) {
				this.search();
			} else {
				this.activeForm = !this.activeForm;
				$timeout(() => {
					document.getElementById('search').focus();
				}, 500);
			}
		};

		this.hideSuggestion = () => {
			if (!this.loading) {
				_resetSearch();
			}
		};

		this.search = () => {
			this.badQuery = false;
			this.loading = true;
			sch.showingResults = false;

			$http.get(`${$rootScope.apiBaseUrl}/unifiedSearch`, {
				params: {
					q: this.q,
				},
			}).then((resp) => {
				sch.loading = false;
				if (resp.data.success === false || resp.data.result.length === 0) {
					_badQuery();
				} else if (resp.data.result.length === 1) {
					_resetSearch();

					$location.path(`/${resp.data.result[0].type}/${resp.data.result[0].id}`);
				} else {
					sch.results = resp.data.result.slice(0, 8);
					sch.showingResults = true;
				}
			});
		};
	};

	const SearchLink = function (scope) {
		scope.activeForm = !scope.mobileView;
	};

	return {
		restrict: 'E',
		replace: true,
		link: SearchLink,
		controller: SearchCtrl,
		controllerAs: 'sch',
		scope: {
			mobileView: '@',
		},
		bindToController: true,
		template,
	};
});
