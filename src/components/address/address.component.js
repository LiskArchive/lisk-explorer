import 'angular';
import AppAddress from './address.module';
import template from './address.html';

const AddressConstructor = function ($rootScope, $stateParams, $location, $http, addressTxs) {
    const vm = this;
    vm.getAddress = () => {
        $http.get('/api/getAccount', {
            params: {
                address: $stateParams.address
            }
        }).then(resp => {
            if (resp.data.success) {
                vm.address = resp.data;
            } else {
                throw 'Account was not found!';
            }
        }).catch(error => {
            $location.path('/');
        });
    };

    vm.address = {
        address: $stateParams.address
    };

    // Sets the filter for which transactions to display
    vm.filterTxs = direction => {
        vm.direction = direction;
        vm.txs = addressTxs({ address: $stateParams.address, direction });
    };

    vm.searchParams = [];

    vm.availableSearchParams = [
        { key: "senderId", name: "Sender", placeholder: "Sender..." },
        { key: "recipientId", name: "Recipient", placeholder: "Recipient..." },
        { key: "minAmount", name: "Min", placeholder: "Min Amount..." },
        { key: "maxAmount", name: "Max", placeholder: "Max Amount..." },
        { key: "type", name: "Type", placeholder: "Type...", allowMultiple: true },
        { key: "senderPublicKey", name: "SenderPub", placeholder: "Sender Public Key..." },
        { key: "recipientPublicKey", name: "RecipientPub", placeholder: "Recipient Public Key..." },
        { key: "minConfirmations", name: "Min Confirmations", placeholder: "Minimum Confirmations..." }
    ];

    vm.onFiltersUsed = () => {
        vm.cleanByFilters = true;
        let { removeAll } = angular.element(document.getElementsByClassName('search-parameter-input')[0]).scope();
        if (removeAll) {
            removeAll();
        }
    };

    const onSearchBoxCleaned = () => {
        if (vm.cleanByFilters) {
            vm.cleanByFilters = false;
        } else {
            vm.invalidParams = false;
            vm.filterTxs(vm.lastDirection)
            vm.txs.loadData();
        }
    };

    const searchByParams = (params) => {
        if (vm.direction !== 'search') {
            vm.lastDirection = vm.direction;
            vm.direction = 'search';
        }
        vm.invalidParams = false;
        vm.txs = addressTxs(params);
        vm.txs.loadData();
    };

    $rootScope.$on('advanced-searchbox:modelUpdated', function (event, model) {
        const params = {};
        Object.keys(model).forEach((key) => {
            if (model[key] != undefined && model[key] !== '') {
                params[key] = model[key];
            }
            if (key === 'minAmount' || key === 'maxAmount') {
                params[key] *= 1e8;
            }
        });

        if (Object.keys(model).length > 0 && (model.recipientId !== undefined || model.senderId !== undefined)) {
            searchByParams(params);
        } else if (Object.keys(model).length === 0) {
            onSearchBoxCleaned();
        } else {
            vm.invalidParams = true;
        }
    });
    $rootScope.$on('advanced-searchbox:removedAllSearchParam', function (event) {
        onSearchBoxCleaned();
    });

    vm.getAddress();
    vm.txs = addressTxs({ address: $stateParams.address });
};

AppAddress.component('address', {
    template: template,
    controller: AddressConstructor,
    controllerAs: 'vm'
});
