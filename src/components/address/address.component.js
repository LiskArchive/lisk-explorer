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
        vm.txs = addressTxs($stateParams.address, direction);
    };

    vm.getAddress();
    vm.txs = addressTxs($stateParams.address);
};

AppAddress.component('address', {
    template: template,
    controller: AddressConstructor,
    controllerAs: 'vm'
});
