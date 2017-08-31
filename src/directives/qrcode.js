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
