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
import ParseMarkdownJs from 'parse-markdown-js';
import InformationBanner from './information-banner.module';
import template from './information-banner.html';

// const parseTweet = (message) => {};

const directiveCtrl = ($scope, $http, $sce) => {
	$scope.text = '';

	$http.get('/api/ui_message').then((result) => {
		if (result.data.success && result.data.content) {
			$scope.text = $sce.trustAsHtml(ParseMarkdownJs(result.data.content));
		} else {
			$http.get('/api/newsfeed').then((result) => {
				if (Array.isArray(result.data) && result.data.length > 0) {
					const topMessage = result.data.sort((a, b) => a.timestamp < b.timestamp)[0];
					const message = topMessage.content.replace(topMessage.url, '');
					const link = `[Read more](${topMessage.url})`;
					$scope.text = $sce.trustAsHtml([ParseMarkdownJs('[Twitter/LiskHQ](https://twitter.com/LiskHQ)'), '--', message, ParseMarkdownJs(link)].join(' '));
				}
			});
		}
	});
};

// eslint-disable-next-line arrow-body-style
InformationBanner.directive('infoBanner', () => {
	return {
		restrict: 'E',
		replace: true,
		scope: true,
		template,
		controller: directiveCtrl,
		controllerAs: 'vm',
	};
});
