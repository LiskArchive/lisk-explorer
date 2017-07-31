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
        { key: "amount", name: "Amount", placeholder: "Amount..." },
        { key: "minAmount", name: "Min", placeholder: "Min Amount..." },
        { key: "maxAmount", name: "Max", placeholder: "Max A mount..." },
        { key: "type", name: "Type", placeholder: "Type...", allowMultiple: true }
    ];

    $rootScope.$on('advanced-searchbox:modelUpdated', function (event, model) {
        const params = {};
        Object.keys(model).forEach((key) => {
            if (model[key]) {
                params[key] = model[key];
            }
            if (key === 'minAmount' || key === 'maxAmount') {
                params[key] *= 1e8;
            }
        });

        if (Object.keys(params).length > 0) {
            vm.txs = addressTxs(params);
            vm.txs.loadData();
        }
    });

    vm.getAddress();
    vm.txs = addressTxs({ address: $stateParams.address });
};

AppAddress.component('address', {
    template: template,
    controller: AddressConstructor,
    controllerAs: 'vm'
});
