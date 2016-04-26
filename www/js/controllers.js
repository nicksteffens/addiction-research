angular.module('starter.controllers', [])
.factory('config', [function() {
   var config = {
     geolocation: {
       disable: true, // for debugging only
       timeout: 5000 // in milliseconds
     },
     api: {
       answers: 'http://addictionresearch.herokuapp.com/answers',
       login: 'http://addictionresearch.herokuapp.com/sessions',
       questions: 'http://addictionresearch.herokuapp.com/questions',
       users: 'http://addictionresearch.herokuapp.com/users/'
     }
   };
   return config;
 }])
.controller('AppCtrl', function(config, $scope, $ionicModal, $cordovaGeolocation, $timeout, $cordovaHealthKit, $http) {

  // constant vars
  $scope.loginData = {};
  $scope.createUser = {};
  $scope.errors = {};
  $scope.hasErrors = false;
  $scope.user = JSON.parse(window.localStorage.getItem('user'));
  $scope.geolocation = {};

  // ======
  // Modals
  // ======
  $scope.openModal = function(whichModal) {
    $ionicModal.fromTemplateUrl('templates/'+whichModal+'.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.closeModal = function() {
   $scope.modal.hide();
 };

 // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

  // =============
  // End of Modals
  // =============

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    $http({
      method: 'POST',
      url: config.api.login,
      data: {
        "session": {
            "email": $scope.loginData.email,
            "password": $scope.loginData.password
        }
      }
    }).then(function successCallback(response) {
      window.localStorage.setItem('user', JSON.stringify(response.data.user));
      $scope.user = JSON.parse(window.localStorage.getItem('user'));
      $scope.modal.hide();
      window.location.hash = '#/app/profile';

    }, function errorCallback(response) {
      console.log('an error has ocurred', response);
      alert('An Error has Occured, Please Try again');
    });
  };

  $scope.doLogout = function () {
    window.localStorage.removeItem('user');
    $scope.user = {};
    $scope.closeModal('logout');
    window.location.hash = "#/app/home"
  };

  $scope.doCreate = function() {
    var createUser = $scope.createUser;
    delete createUser.confirm;

    $http({
      method: 'POST',
      url: config.api.users,
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
  // ==================
  // End of Validations
  // ==================

  // ===========
  // Geolocation
  // ===========
  var posOptions = { timeout: 3000, enableHighAccuracy: false };
  var watchDelay = 5000;

  if ( $scope.user && config.geolocation.on) {
    var bgGeolocationWatch = window.setInterval(function() {
      $cordovaGeolocation
       .getCurrentPosition(posOptions)

       .then(function (position) {
            updateGeolocation(position);

       }, function(err) {
          console.log('get error ' + err.message + '\ncode: ' + err.code);
       });
    }, watchDelay);
  }



  function updateGeolocation(position) {
    $scope.geolocation.lat  = position.coords.latitude;
    $scope.geolocation.long = position.coords.longitude;
    $scope.geolocation.timestamp = position.timestamp;
    console.log('update geolocation '
      + $scope.geolocation.lat + '   '
      + $scope.geolocation.long + '\nat: '
      + $scope.geolocation.timestamp
    );
  }

  // ==================
  // End of Geolocation
  // ==================
})
// ============
// Survey Stuff
// ============
.controller('SurveyCtrl', function(config, $scope, $ionicModal, $http) {
  $scope.data = {};
  $scope.questions = [];
  $scope.takingSurvey = false;
  $scope.surveyError = false;

  $scope.openModal = function() {
    $ionicModal.fromTemplateUrl('templates/survey-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.takingSurvey = true;
      $scope.surveyError = false;
      getQuestions();
    });
  };

  $scope.closeModal = function() {
    $scope.takingSurvey = false;
    $scope.questions = [];
    $scope.modal.remove();
  };

  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    console.log("survey results", $scope.data);
    $scope.modal.remove();
  });

  // get the questions
  function getQuestions() {
    $http({
      method: 'GET',
      url: config.api.questions
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      $scope.questions = response.data.questions;
      console.log('Retrieved Questions', $scope.questions);
      $scope.modal.show();
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.takingSurvey = false;
      $scope.surveyError = true;
      $scope.modal.remove();
      console.log('questions error', response);
    });
  }

})
.controller('SplashCtrl', function($scope, $stateParams) {
});
