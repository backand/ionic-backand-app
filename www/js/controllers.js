angular.module('SimpleRESTIonic.controllers', [])

    .controller('LoginCtrl', function (Backand, $state, $rootScope, LoginService, $scope, $ionicModal) {
        var login = this;

        function signin() {
            LoginService.signin(login.email, login.password)
                .then(function () {
                    onLogin();
                }, function (error) {
                    console.log(error)
                })
        }

        function anonymousLogin() {
            LoginService.anonymousLogin();
            onLogin();
        }

        function onLogin() {
            $rootScope.$broadcast('authorized');
            $state.go('tab.objects');
            login.username = Backand.getUsername();
            console.log('onLogin');
        }

        function signout() {
            LoginService.signout()
                .then(function () {
                    $state.go('tab.login');
                    $rootScope.$broadcast('logout');
                    $state.go($state.current, {}, {reload: true});
                    $scope.modal.show();
                })

        }

        function socialSignIn(provider) {
            $scope.modal.hide();
            LoginService.socialSignIn(provider)
                .then(onValidLogin, onErrorInLogin);

        }

        function socialSignUp(provider) {
            LoginService.socialSignUp(provider)
                .then(onValidLogin, onErrorInLogin);

        }

        onValidLogin = function(response){
            onLogin();
            login.username = response.data;
            console.log('onValidLogin');
            $state.go('tab.objects');
        }

        onErrorInLogin = function(rejection){
            login.error = rejection.data;
            $rootScope.$broadcast('logout');

        }


        login.username = '';
        login.error = '';
        login.signin = signin;
        login.signout = signout;
        login.anonymousLogin = anonymousLogin;
        login.socialSignup = socialSignUp;
        login.socialSignin = socialSignIn;

        $scope.contact = {
            name: 'Mittens Cat',
            info: 'Tap anywhere on the card to open the modal'
        }

        $ionicModal.fromTemplateUrl('contact-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal
        })  

        $scope.openModal = function() {
            $scope.modal.show()
        }

        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
    })

    .controller('SignUpCtrl', function (Backand, $state, $rootScope, LoginService) {
        var vm = this;

        vm.signup = signUp;

        function signUp(){
            vm.errorMessage = '';

            LoginService.signup(vm.firstName, vm.lastName, vm.email, vm.password, vm.again)
                .then(function (response) {
                    // success
                    onLogin();
                }, function (reason) {
                    if(reason.data.error_description !== undefined){
                        vm.errorMessage = reason.data.error_description;
                    }
                    else{
                        vm.errorMessage = reason.data;
                    }
                });
        }


        function onLogin() {
            $rootScope.$broadcast('authorized');
            $state.go('tab.objects');
        }


        vm.email = '';
        vm.password ='';
        vm.again = '';
        vm.firstName = '';
        vm.lastName = '';
        vm.errorMessage = '';
    })

    .controller('DashboardCtrl', function (Backand, ItemsModel, $rootScope, $state, LoginService) {
        var vm = this;

        function goToBackand() {
            window.location = 'http://docs.backand.com';
        }

        function signout() {
            LoginService.signout()
                .then(function () {
                    $state.go('tab.login');
                    $rootScope.$broadcast('logout');
                    $state.go($state.current, {}, {reload: true});
                })

        }

        function getAll() {
            ItemsModel.all()
                .then(function (result) {
                    vm.data = result.data.data;
                    console.log(vm.data);
                });
        }

        function clearData() {
            vm.data = null;
        }

        function create(object) {
            ItemsModel.create(object)
                .then(function (result) {
                    cancelCreate();
                    getAll();
                });
        }

        function update(object) {
            ItemsModel.update(object.id, object)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                });
        }

        function deleteObject(id) {
            ItemsModel.delete(id)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                });
        }

        function initCreateForm() {
            vm.newObject = {name: '', description: ''};
        }

        function setEdited(object) {
            vm.edited = angular.copy(object);
            vm.isEditing = true;
        }

        function isCurrent(id) {
            return vm.edited !== null && vm.edited.id === id;
        }

        function cancelEditing() {
            vm.edited = null;
            vm.isEditing = false;
        }

        function cancelCreate() {
            initCreateForm();
            vm.isCreating = false;
        }

        vm.objects = [];
        vm.edited = null;
        vm.isEditing = false;
        vm.isCreating = false;
        vm.getAll = getAll;
        vm.create = create;
        vm.update = update;
        vm.delete = deleteObject;
        vm.setEdited = setEdited;
        vm.isCurrent = isCurrent;
        vm.cancelEditing = cancelEditing;
        vm.cancelCreate = cancelCreate;
        vm.goToBackand = goToBackand;
        vm.isAuthorized = false;
        vm.signout = signout;

        $rootScope.$on('authorized', function () {
            vm.isAuthorized = true;
            getAll();
        });

        $rootScope.$on('logout', function () {
            clearData();
        });

        if (!vm.isAuthorized) {
            $rootScope.$broadcast('logout');
        }

        initCreateForm();
        getAll();

    });

