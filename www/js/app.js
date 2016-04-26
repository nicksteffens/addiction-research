// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ngCordova', 'ionic', 'ionicResearchKit', 'starter.controllers'])

.run(function($ionicPlatform) {
  var bgGeo;
  
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      // cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
      // healthkit
      // cordova.plugins.healthkit.isAvailable().then(function(yes) {
      //   // Is available
      //   console.log('healthkit available');
      //   // window.required.healthkit = true;
      // }, function(no) {
      //   // Is not available
      //   console.log('healthkit not available');
      //   // window.required.healthkit = false;
      // });
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }



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
  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
