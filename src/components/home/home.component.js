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
import leaflet from 'leaflet';
import 'leaflet.markercluster';

import AppHome from './home.module';
import template from './home.html';

const HomeConstructor = function ($scope, $http, $interval) {
	const vm = this;

	const setHref = (tx) => {
		tx.hrefSender = tx.senderDelegate ? `/delegate/${tx.senderId}` : `/address/${tx.senderId}`;
		tx.hrefRecipient = tx.recipientDelegate ? `/delegate/${tx.recipientId}` : `/address/${tx.recipientId}`;
	};

	vm.getLastBlocks = () => {
		$http.get('/api/getLastBlocks').then((resp) => {
			if (resp.data.success) {
				vm.blocks = resp.data.blocks.splice(0, 5);
			}
		});
	};

	vm.blocksInterval = $interval(() => {
		vm.getLastBlocks();
	}, 30000);

	vm.getLastBlocks();

	vm.getLastTransactions = () => {
		$http.get('/api/getLastTransactions').then((resp) => {
			if (resp.data.success) {
				vm.txs = resp.data.transactions.splice(0, 5);
				vm.txs.map(setHref);

			}
		});
	};

	vm.transactionsInterval = $interval(() => {
		vm.getLastTransactions();
	}, 30000);

	vm.getLastTransactions();

	const NetworkMap = function () {
		this.markers = {};
		this.options = {
			center: leaflet.latLng(40, 0),
			zoom: 1,
			minZoom: 1,
			maxZoom: 10,
			dragging: !leaflet.Browser.mobile,
			scrollWheelZoom: false,
			tap: false,
		};
		this.map = leaflet.map('map', this.options);
		this.cluster = leaflet.markerClusterGroup({ maxClusterRadius: 50 });

		leaflet.Icon.Default.imagePath = '../../assets/img/leaflet';

		leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.map);

		const PlatformIcon = leaflet.Icon.extend({
			options: {
				iconSize: [32, 41],
				iconAnchor: [16, 41],
				popupAnchor: [0, -41],
			},
		});

		const validLocation = location => location && typeof location.latitude === 'number' &&
		typeof location.longitude === 'number';

		const popupContent = (p) => {
			let content = '<p class="ip">'.concat(p.ip, '</p>');

			if (p.location.hostname) {
				content += '<p class="hostname">'
					.concat('<span class="label">Hostname: </span>', p.location.hostname, '</p>');
			}

			content += '<p class="version">'
				.concat('<span class="label">Version: </span>', p.version, '</p>');

			content += '<p class="os">'
				.concat('<span class="label">OS: </span>', p.os, '</p>');

			if (p.location.city) {
				content += '<p class="city">'
					.concat('<span class="label">City: </span>', p.location.city, '</p>');
			}

			if (p.location.region_name) {
				content += '<p class="region">'
					.concat('<span class="label">Region: </span>', p.location.region_name, '</p>');
			}

			if (p.location.country_name) {
				content += '<p class="country">'
					.concat('<span class="label">Country: </span>', p.location.country_name, '</p>');
			}

			return content;
		};
	};

	this.map = new NetworkMap();
};

AppHome.component('home', {
	template,
	controller: HomeConstructor,
	controllerAs: 'vm',
});
