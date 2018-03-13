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
/* global browser, protractor, element, by */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;
const waitTime = 4000;

const EC = protractor.ExpectedConditions;

const waitForElemAndCheckItsText = (selector, text, callback) => {
	const elem = element(by.css(selector));
	browser.wait(EC.presenceOf(elem), waitTime, `waiting for element '${selector}'`);
	expect(elem.getText()).to.eventually.equal(text, `inside element "${selector}"`)
		.and.notify(callback || (() => {}));
};

const waitForElemAndCheckItsAttr = (selector, attr, value, callback) => {
	const elem = element(by.css(selector));
	browser.wait(EC.presenceOf(elem), waitTime, `waiting for element '${selector}'`);
	expect(elem.getAttribute(attr)).to.eventually.equal(value, `in attribute "${attr}" of element "${selector}"`)
		.and.notify(callback || (() => {}));
};

const waitForElemAndClickIt = (selector, callback) => {
	const elem = element(by.css(selector));
	browser.wait(EC.presenceOf(elem), waitTime, `waiting for element '${selector}'`);
	elem.click().then(() => {
		if (callback) callback();
	});
};

const waitForElemAndSendKeys = (selector, keys, callback) => {
	const elem = element(by.css(selector));
	browser.wait(EC.presenceOf(elem), waitTime, `waiting for element '${selector}'`);
	elem.sendKeys(keys).then(() => {
		if (callback) callback();
	});
};

const urlChanged = url => () => browser.getCurrentUrl().then((actualUrl) => {
	if (url instanceof RegExp) {
		return actualUrl.match(url);
	}
	return url === actualUrl;
});

const elementOccursXTimes = (selector, count) => () =>
	element.all(by.css(selector)).count().then(actualCount => `${count}` === `${actualCount}`);

/**
 * Vertically scroll top-left corner of the given element (y-direction) into viewport.
 * @param scrollToElement element to be scrolled into visible area
 */
const scrollTo = (scrollToElement) => {
	const wd = browser.driver;
	return scrollToElement.getLocation().then(loc => wd.executeScript('window.scrollTo(0,arguments[0]);', loc.y));
};

const checkRowsContents = (tableSelector, data, callback) => {
	const rowCount = data.length;
	if (rowCount > 0) {
		let counter = 0;
		const cellCount = data.length * data[0].length;
		for (let i = 0; i < data.length; i++) {
			for (let j = 0; j < data[i].length; j++) {
				const value = data[i][j];
				const selector = `${tableSelector} tr:nth-child(${i + 1}) td:nth-child(${j + 1}), ${tableSelector} tr:nth-child(${i + 1}) th:nth-child(${j + 1})`;
				const elem = element(by.css(selector));
				elem.getText().then((text) => {
					text = text.trim();
					if (value.startsWith('/') && value.endsWith('/')) {
						expect(text).to.match(new RegExp(`^${value.slice(1, -1)}$`), `inside element "${selector}"`);
					} else {
						expect(text).to.equal(value, `inside element "${selector}"`);
					}
					counter++;
					if (counter === cellCount && callback) {
						callback();
					}
				});
			}
		}
	}
};

const nameToSelector = elementName =>
	`.${elementName.replace(/\s+/g, '-')}`.replace(/\.(\d)/, '.\\3$1 ');

const checkTableContents = (tableName, data, rowCount, callback) => {
	const selector = tableName.replace(/\s+/g, '-');
	const hasHeader = data[1] && data[1].join('').match(/^-+$/g);
	if (!rowCount) {
		rowCount = data.length - (hasHeader ? 2 : 0);
	}
	browser.wait(elementOccursXTimes(`table.${selector} tbody tr`, rowCount), waitTime, `waiting for ${rowCount} instances of 'table.${selector} tbody tr'`);
	if (hasHeader) {
		checkRowsContents(`table.${selector} thead`, [data[0]]);
		checkRowsContents(`table.${selector} tbody`, data.slice(2), callback);
	} else {
		checkRowsContents(`table.${selector} tbody`, data, callback);
	}
};

module.exports = {
	waitForElemAndCheckItsText,
	waitForElemAndCheckItsAttr,
	waitForElemAndClickIt,
	waitForElemAndSendKeys,
	waitTime,
	urlChanged,
	elementOccursXTimes,
	scrollTo,
	checkTableContents,
	nameToSelector,
};
