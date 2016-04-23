angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};
  $scope.createUser = {};
  $scope.errors = {};
  $scope.hasErrors = false;
  $scope.user = JSON.parse(window.localStorage.getItem('user'));

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.loginModal = modal;
  });

  // Create the logout modal that we will use later
  $ionicModal.fromTemplateUrl('templates/logout.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.logoutModal = modal;
  });
  // Create the info modal that we will use later
  $ionicModal.fromTemplateUrl('templates/additional-info.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.additionalInfoModal = modal;
  });
  // Create the consent modal that we will use later
  $ionicModal.fromTemplateUrl('templates/consent.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.consentModal = modal;
  });
  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.loginModal.hide();
  };
  $scope.closeLogout = function() {
    $scope.logoutModal.hide();
  };
  // Open the login modal
  $scope.login = function() {
    $scope.loginModal.show();
  };
  // Open additional info
  $scope.additionalInfo = function() {
    $scope.additionalInfoModal.show();
  };
  // Close additional info
  $scope.closeAdditionalInfo = function() {
    $scope.additionalInfoModal.hide();
  };
  // Open additional info
  $scope.additionalInfo = function() {
    $scope.consentModal.show();
  };
  // Close additional info
  $scope.closeAdditionalInfo = function() {
    $scope.consentModal.hide();
  };

  $scope.logout = function() {
    $scope.logoutModal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    $http({
      method: 'POST',
      url: 'http://addictionresearch.herokuapp.com/sessions',
      data: {
        "session": {
            "email": $scope.loginData.email,
            "password": $scope.loginData.password
        }
      }
    }).then(function successCallback(response) {
      window.localStorage.setItem('user', JSON.stringify(response.data.user));
      $scope.user = JSON.parse(window.localStorage.getItem('user'));
      $scope.closeLogin();
      window.location.hash = '#/app/profile';

    }, function errorCallback(response) {
      console.log('an error has ocurred', response);
      alert('An Error has Occured, Please Try again');
    });
  };

  $scope.doLogout = function () {
    window.localStorage.removeItem('user');
    $scope.user = {};
    $scope.closeLogout();
    window.location.hash = "#/app/home"
  };

  $scope.doCreate = function() {
    var createUser = $scope.createUser;
    delete createUser.confirm;

    $http({
      method: 'POST',
      url: 'http://addictionresearch.herokuapp.com/users/',
      data: {
        "user": createUser
      }
    }).then( function successCallback(response) {
      console.log('User created', response);

    }, function errorCallback(response) {
      console.log('Create account error', response);
      alert('An Error has Occured, Please Try again');
    })
  };


  // ===========
  // Validations
  // ===========
  $scope.checkErrors = function() {
    var errors = [];
    for (var prop in $scope.errors) {
      if( $scope.errors.hasOwnProperty( prop ) ) {
        errors.push($scope.errors[prop]);
      }
    }
    $scope.hasErrors = errors.indexOf(true) > -1;
  };
  // passwords
  $scope.checkPassword = function() {
    $scope.errors.password = $scope.createUser.password !== $scope.createUser.confirm;
    $scope.checkErrors();
  };

  // email
  $scope.checkEmail = function() {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    $scope.errors.email = !re.test($scope.createUser.email);
    $scope.checkErrors();
  };

})

.controller('SplashCtrl', function($scope, $stateParams) {
});
