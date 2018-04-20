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
import AppNetworkMonitor from './network-monitor.module';

/**
 * Sorts given peers based on version strings
 *
 * @param {Object} p1 - First peer to compare
 * @param {Object} p2 - Second peer to compare against
 *
 * @returns {Number} 1, -1, 0 if respectively greater, smaller or equal versions
 */
const sortByVersion = (p1, p2) => {
	const v1 = typeof p1 === 'string' ? p1 : p1.version;
	const v2 = typeof p2 === 'string' ? p2 : p2.version;
	if (v1 === v2) return 0;

	const v1Components = v1.toString().split('.').map(n => parseInt(n, 10));
	const v2Components = v2.toString().split('.').map(n => parseInt(n, 10));
	const char1 = v1.match(/[a-zA-Z]$/);
	const char2 = v2.match(/[a-zA-Z]$/);
	if (char1) v1Components.push(char1[0]);
	if (char2) v2Components.push(char2[0]);

	for (let i = 0; i < v1Components.length && i < v2Components.length; i++) {
		if (v1Components[i] > v2Components[i]) return 1;
		else if (v1Components[i] < v2Components[i]) return -1;
	}

	const diff = v1Components.length - v2Components.length;

	if (diff > 0) return 1;
	else if (diff < 0) return -1;
	return 0;
};

const NetworkMap = function () {
	this.markers = {};
	this.options = { center: leaflet.latLng(40, 0), zoom: 1, minZoom: 1, maxZoom: 10 };
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

	const platformIcons = {
		darwin: new PlatformIcon({ iconUrl: './leaflet/marker-icon-darwin.png' }),
		linux: new PlatformIcon({ iconUrl: './leaflet/marker-icon-linux.png' }),
		win: new PlatformIcon({ iconUrl: './leaflet/marker-icon-win.png' }),
		freebsd: new PlatformIcon({ iconUrl: './leaflet/marker-icon-freebsd.png' }),
		unknown: new PlatformIcon({ iconUrl: './leaflet/marker-icon-unknown.png' }),
	};

	this.addConnected = function (peers) {
		const connected = [];
		peers.connected.forEach((item) => {
			if (validLocation(item.location)) {
				if (!Object.keys(this.markers).includes(item.ip)) {
					this.cluster.addLayer(
						this.markers[item.ip] = leaflet.marker(
							[item.location.latitude, item.location.longitude],
							{ title: item.ipString, icon: platformIcons[item.osBrand.name] },
						).bindPopup(popupContent(item)),
					);
				}
				connected.push(item.ip);
			}
		});

		this.removeDisconnected(connected);
		this.map.addLayer(this.cluster);
	};

	this.removeDisconnected = function (connected) {
		Object.keys(this.markers).forEach((ip) => {
			if (!connected.includes(ip)) {
				const m = this.markers[ip];

				this.map.removeLayer(m);
				this.cluster.removeLayer(m);
				delete this.markers[ip];
			}
		});
	};
};

const NetworkMonitor = function (vm) {
	this.map = new NetworkMap();

	function Platforms() {
		this.counter = [0, 0, 0, 0];
		this.platforms = ['Darwin', 'Linux', 'FreeBSD'];

		this.detect = function (platform) {
			if (typeof platform.group === 'number') {
				this.counter[parseInt(platform.group, 10)]++;
			}
		};

		this.detected = function () {
			return {
				one: { name: this.platforms[0], counter: this.counter[1] },
				two: { name: this.platforms[1], counter: this.counter[2] },
				three: { name: this.platforms[2], counter: this.counter[3] },
				other: { name: null, counter: this.counter[0] },
			};
		};
	}

	const uniq = arrArg => arrArg.filter((elem, pos, arr) => arr.indexOf(elem) === pos);

	function Versions(peers) {
		const inspect = () => {
			if (peers instanceof Array) {
				return uniq(peers.map(p => p.version)).sort(sortByVersion).reverse().slice(0, 3);
			}
			return [];
		};

		this.counter = [0, 0, 0, 0];
		this.versions = inspect();

		this.detect = function (version) {
			let detected = null;

			if (typeof version === 'string') {
				for (let i = 0; i < this.versions.length; i++) {
					if (version === this.versions[i]) {
						detected = version;
						this.counter[i]++;
						break;
					}
				}
			}
			if (detected === null) {
				this.counter[3]++;
			}
		};

		this.detected = function () {
			return {
				one: { num: this.versions[0], counter: this.counter[0] },
				two: { num: this.versions[1], counter: this.counter[1] },
				three: { num: this.versions[2], counter: this.counter[2] },
				other: { num: null, counter: this.counter[3] },
			};
		};
	}

	function Heights(peers) {
		const inspect = () => {
			if (peers instanceof Array) {
				return uniq(peers.map(p => p.height))
					.sort((a, b) => (a - b)).reverse()
					.slice(0, 4);
			}
			return [];
		};

		this.counter = [0, 0, 0, 0, 0];
		this.percent = [0, 0, 0, 0, 0];
		this.heights = inspect();

		this.detect = function (height) {
			let detected = null;

			if (height) {
				for (let i = 0; i < this.heights.length; i++) {
					if (height === this.heights[i]) {
						detected = height;
						this.counter[i]++;
						break;
					}
				}
			}
			if (detected === null) {
				this.counter[4]++;
			}
		};

		this.detected = function () {
			return {
				heights: this.heights,
				counter: this.counter,
			};
		};

		this.calculatePercent = function (connectedPeers) {
			const peersCount = connectedPeers.length;
			for (let i = 0; i < this.counter.length; i++) {
				this.percent[i] = Math.round((this.counter[i] / peersCount) * 100);
			}

			return this.percent;
		};
	}

	this.counter = (peers) => {
		const platforms = new Platforms();
		const versions = new Versions(peers.connected);
		const heights = new Heights(peers.connected);

		peers.connected.forEach((item) => {
			platforms.detect(item.osBrand);
			versions.detect(item.version);
			heights.detect(item.height);
		});

		return {
			connected: peers.connected.length,
			total: peers.connected.length,
			platforms: platforms.detected(),
			versions: versions.detected(),
			heights: heights.detected(),
			percents: heights.calculatePercent(peers.connected),
		};
	};

	this.updatePeers = function (peers) {
		// default sort in sort by version
		vm.peers = {
			connected: peers.list.connected,
		};

		vm.counter = this.counter(vm.peers);
		this.map.addConnected(vm.peers);
	};

	this.updateLastBlock = (lastBlock) => {
		vm.lastBlock = lastBlock.block;
	};

	this.updateBlocks = (blocks) => {
		vm.bestBlock = blocks.best;
		vm.volume = blocks.volume;
	};
};

AppNetworkMonitor.factory('networkMonitor',
	($socket, $rootScope) => (vm) => {
		const networkMonitor = new NetworkMonitor(vm);
		const ns = $socket('/networkMonitor');
		const rate = 3;
		let period = 0;

		ns.on('data', (res) => {
			if (res.peers) {
				networkMonitor.updatePeers(res.peers);
			}
			if (res.lastBlock) { networkMonitor.updateLastBlock(res.lastBlock); }
			if (res.blocks) { networkMonitor.updateBlocks(res.blocks); }
		});

		ns.on('data1', (res) => {
			if (res.lastBlock) {
				networkMonitor.updateLastBlock(res.lastBlock);
			}
		});

		ns.on('data2', (res) => {
			if (res.blocks) {
				networkMonitor.updateBlocks(res.blocks);
			}
		});

		ns.on('data3', (res) => {
			if (res.peers) {
				period = (period >= rate) ? 0 : (period + 1);
				if (period === rate - 1) {
					networkMonitor.updatePeers(res.peers);
				}
			}
		});

		$rootScope.$on('$destroy', () => {
			ns.removeAllListeners();
		});

		$rootScope.$on('$locationChangeStart', () => {
			ns.emit('forceDisconnect');
		});

		return networkMonitor;
	});
