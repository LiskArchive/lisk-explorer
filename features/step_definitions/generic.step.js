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
const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const {
	waitForElemAndCheckItsText,
	waitForElemAndCheckItsAttr,
	waitForElemAndClickIt,
	waitForElemAndSendKeys,
	// checkAlertDialog,
	waitTime,
	urlChanged,
	elementOccursXTimes,
	scrollTo,
	checkTableContents,
	nameToSelector,
} = require('../support/util.js');

chai.use(chaiAsPromised);
const expect = chai.expect;
const EC = protractor.ExpectedConditions;
const baseURL = browser.params.baseURL;

defineSupportCode(({ Given, When, Then, setDefaultTimeout }) => {
	setDefaultTimeout(20 * 1000);

	Given('I\'m on page "{pageAddress}"', (pageAddress, callback) => {
		browser.ignoreSynchronization = true;
		browser.driver.manage().window().setSize(1200, 1000);
		browser.driver.get('about:blank');
		browser.get(baseURL + pageAddress).then(callback);
	});

	Given('I should be on page "{pageAddress}"', (pageAddress, callback) => {
		const url = pageAddress.indexOf('http') === 0 ? pageAddress : baseURL + pageAddress;
		browser.wait(urlChanged(url), waitTime, `waiting for page ${pageAddress}`);
		expect(browser.getCurrentUrl()).to.eventually.equal(url)
			.and.notify(callback);
	});

	Given('I should be on page that matches "{pageAddressRegexp}"', (pageAddressRegexp, callback) => {
		const url = pageAddressRegexp.indexOf('http') === 0 ? pageAddressRegexp : baseURL + pageAddressRegexp;
		browser.wait(urlChanged(new RegExp(`^${url}$`)), waitTime, `waiting for page ${pageAddressRegexp}`);
		expect(browser.getCurrentUrl()).to.eventually.match(new RegExp(`^${url}$`))
			.and.notify(callback);
	});

	When('I fill in "{value}" to "{fieldName}" field', (value, fieldName, callback) => {
		const selector = nameToSelector(fieldName);
		waitForElemAndSendKeys(`input${selector}, textarea${selector}`, value, callback);
	});

	When('I fill in "{value}" to "{fieldName}" field in "{parentName}" div', (value, fieldName, parentName, callback) => {
		const selector = nameToSelector(fieldName);
		const parent = nameToSelector(parentName);
		waitForElemAndSendKeys(`${parent} input${selector}, ${parent} textarea${selector}`, value, callback);
	});

	When('I hit "enter" in "{fieldName}" field', (fieldName, callback) => {
		const selector = nameToSelector(fieldName);
		waitForElemAndSendKeys(`input${selector}, textarea${selector}`, protractor.Key.ENTER, callback);
	});

	When('I hit "enter" in "{fieldName}" field in "{parentName}" div', (fieldName, parentName, callback) => {
		const selector = nameToSelector(fieldName);
		const parent = nameToSelector(parentName);
		waitForElemAndSendKeys(`${parent} input${selector}, ${parent} textarea${selector}`, protractor.Key.ENTER, callback);
	});

	When('I scroll to "{elementName}"', (elementName, callback) => {
		const selector = nameToSelector(elementName);
		scrollTo(element(by.css(selector))).then(callback);
	});

	When('I click "{elementName}"', (elementName, callback) => {
		const selector = nameToSelector(elementName);
		waitForElemAndClickIt(selector, callback);
	});

	When('I click "{elementName}" no. {index}', (elementName, index, callback) => {
		const selector = nameToSelector(elementName);
		const elem = element.all(by.css(selector)).get(index - 1);
		elem.click().then(callback);
	});

	When('I click "{elementName}" in "{parentName}" div', (elementName, parentName, callback) => {
		const selector = nameToSelector(elementName);
		const parent = nameToSelector(parentName);
		waitForElemAndClickIt(`${parent} ${selector}`, callback);
	});

	When('I click "{elementName}" #{index} in "{parentName}" div', (elementName, index, parentName, callback) => {
		const selector = nameToSelector(elementName);
		const parent = nameToSelector(parentName);
		const elem = element.all(by.css(`${parent} ${selector}`)).get(index - 1);
		elem.click().then(callback);
	});

	When('I click link on row no. {rowIndex} cell no. {cellIndex} of "{tableName}" table', (rowIndex, cellIndex, tableName, callback) => {
		const selector = `table.${tableName.replace(/\s+/g, '-')} tbody tr:nth-child(${rowIndex}) td:nth-child(${cellIndex}) a`;
		waitForElemAndClickIt(selector, callback);
	});

	When('I hover "{elementName}" no. {index}', (elementName, index, callback) => {
		const selector = nameToSelector(elementName);
		browser.wait(EC.presenceOf(element(by.css(selector))), waitTime, `waiting for element '${selector}'`);
		const elem = element.all(by.css(selector)).get(index - 1);
		browser.actions().mouseMove(elem).perform();
		browser.sleep(10).then(callback);
	});

	When('I click link on header cell no. {cellIndex} of "{tableName}" table', (cellIndex, tableName, callback) => {
		const selector = `table.${tableName.replace(/\s+/g, '-')} thead tr th:nth-child(${cellIndex}) a`;
		waitForElemAndClickIt(selector, callback);
	});

	Then('I should see "{text}" in "{elementName}" element', (text, elementName, callback) => {
		const selector = nameToSelector(elementName);
		waitForElemAndCheckItsText(selector, text, callback);
	});

	When('I wait {seconds} seconds', (seconds, callback) => {
		browser.sleep(seconds * 1000).then(callback);
	});

	Then('I should not see "{elementName}" element', (elementName, callback) => {
		const selector = nameToSelector(elementName);
		expect(element(by.css(selector)).isDisplayed()).to.eventually.equal(false)
			.and.notify(callback);
	});

	Then('I should see "{elementName}" element with content that matches:', (elementName, text, callback) => {
		const selector = nameToSelector(elementName);
		const elem = element(by.css(selector));
		browser.wait(EC.presenceOf(elem), waitTime, `waiting for element '${selector}'`);
		expect(elem.getText()).to.eventually.match(new RegExp(`^${text}$`), `inside element "${selector}"`)
			.and.notify(callback);
	});

	Then('I should see "{elementName}" element with content that does not match:', (elementName, text, callback) => {
		const selector = nameToSelector(elementName);
		const elem = element(by.css(selector));
		browser.wait(EC.presenceOf(elem), waitTime, `waiting for element '${selector}'`);
		expect(elem.getText()).to.eventually.not.match(new RegExp(`^${text}$`), `inside element "${selector}"`)
			.and.notify(callback);
	});

	Then('I should see "{elementName}" element that links to "{url}"', (elementName, url, callback) => {
		const selector = nameToSelector(elementName);
		waitForElemAndCheckItsAttr(selector, 'href', url, callback);
	});

	Then('I should see "{text}" in "{selector}" html element', (text, selector, callback) => {
		waitForElemAndCheckItsText(selector, text, callback);
	});

	Then('I should see "{text}" in "{selector}" html element no. {index}', (text, selector, index, callback) => {
		const elem = element.all(by.css(selector)).get(parseInt(index, 10) - 1);
		expect(elem.getText()).to.eventually.equal(text, `inside element "${selector}" no. ${index}`)
			.and.notify(callback || (() => {}));
	});

	Then('I should see table "{tableName}" with {rowCount} rows starting with:', (tableName, rowCount, data, callback) => {
		checkTableContents(tableName, data.rawTable, rowCount, callback);
	});

	Then('I should see table "{tableName}" containing:', (tableName, data, callback) => {
		checkTableContents(tableName, data.rawTable, undefined, callback);
	});

	Then('I should see table "{elementName}" with {rowCount} rows', (elementName, rowCount, callback) => {
		const selector = nameToSelector(elementName);
		browser.wait(elementOccursXTimes(`table${selector} tbody tr`, rowCount), waitTime * 6, `waiting for ${rowCount} instances of 'table${selector} tbody tr'`).then(() => {
			callback();
		});
	});
});

