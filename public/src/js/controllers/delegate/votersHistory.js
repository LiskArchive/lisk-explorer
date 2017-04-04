'use strict';

var VotersHistoryCtrlConstructor = function ($rootScope, $stateParams, $location, $http, orderBy) {
	var vm = this;

	vm.getDelegateByName = function () {
		$http.get('/api/delegates/getDelegateByName', {
			params: {
				name: $stateParams.name
			}
		}).then(function (resp) {
			if (resp.data.success) {
				vm.delegate = resp.data.delegate;
				vm.delegate.name = $stateParams.name;

				vm.getVotersHistory (vm.delegate.publicKey);
			} else {
				throw 'Account was not found!';
			}
		}).catch(function (error) {
			$location.path('/');
		});
	};

	vm.getVotersHistory = function (publicKey) {
	  $http.get('/api/delegates/getVotersHistory', {
		  params: {
			  publicKey: publicKey
		  }
	  }).then(function (resp) {
		  if (resp.data.success) {
			  vm.history = resp.data.history;
		  } else {
			  throw 'Account was not found!';
		  }
	  }).catch(function (error) {
		  $location.path('/');
	  });
	};

	vm.getDelegateByName();

	vm.table = orderBy('timestamp');
	vm.table.reverse = true;
};

angular.module('lisk_explorer.delegate').controller('VotersHistoryCtrl', VotersHistoryCtrlConstructor);