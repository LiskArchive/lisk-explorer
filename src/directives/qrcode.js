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
import qrcode from 'qrcode-generator';
import AppTools from '../app/app-tools.module';

AppTools.directive('qrcode', () => {
	const QrcodeLinK = ($scope, $element, $attrs) => {
		const typeNumber = 4;
		const errorCorrectionLevel = 'L';
		const qr = qrcode(typeNumber, errorCorrectionLevel);
		qr.addData($attrs.data);
		qr.make();
		$element.html(qr.createSvgTag());
		$element.find('svg').attr({
			viewBox: '8 7 66 69',
			width: '164',
			height: '164',
		});
	};
	return {
		link: QrcodeLinK,
	};
});
