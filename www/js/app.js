// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ionicResearchKit', 'starter.controllers', 'checklist-model', 'angular-dialgauge', 'ngCordova'])

.run(function($ionicPlatform, $cordovaHealthKit, $ionicModal, $cordovaLocalNotification, $rootScope, $timeout) {
  var bgGeo;

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      // cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // for click notifications
    window.cordova.plugins.notification.local.on('click', function (notification, state) {
      $timeout(function () {
        $rootScope.$broadcast('$cordovaLocalNotification:click', notification, state);
      });
    });

  });
})

.run(function($http) {
  // set headers
  if(typeof(window.localStorage.user) !== "undefined"){
    $http.defaults.headers.common.Authorization = JSON.parse(window.localStorage.getItem('user')).auth_token;
}})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.create', {
    url: '/create',
    views: {
      'menuContent': {
        templateUrl: 'templates/create.html'
      }
    }
  })
  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html'
      }
    }
  })
  .state('app.survey', {
    url: '/survey',
    views: {
      'menuContent': {
        templateUrl: 'templates/survey.html',
        controller: 'SurveyCtrl'
      }
    }
  })
  .state('app.debug', {
    url: '/debug',
    views: {
      'menuContent': {
        templateUrl: 'templates/debug.html'
      }
    }
  })
  .state('app.eligibility', {
    url: '/eligibility',
    views: {
      'menuContent': {
        templateUrl: 'templates/eligibility.html',
        controller: 'EligibilityCtrl'
      }
    }
  })
  .state('app.consent', {
    url: '/consent',
    views: {
      'menuContent': {
        templateUrl: 'templates/consent.html',
        controller: 'ConsentCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
