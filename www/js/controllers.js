angular.module('starter.controllers', [])
.factory('config', [function() {
   var config = {
     geolocation: {
       disable: false, // for debugging only
       timeout: 10000
     },
     api: {
       answers: 'http://addictionresearch.herokuapp.com/answers',
       login: 'http://addictionresearch.herokuapp.com/sessions',
       questions: 'http://addictionresearch.herokuapp.com/questions',
       users: 'http://addictionresearch.herokuapp.com/users/'
     },
     notifications: {
      disable: false, // for debugging only
      every: 'minute'
     }
   };
   return config;
 }])

.controller('AppCtrl', [
  'config',
  '$scope',
  '$ionicModal',
  '$ionicPlatform',
  '$cordovaGeolocation',
  '$timeout',
  '$cordovaHealthKit',
  '$http',
  '$rootScope',
  '$cordovaLocalNotification',
  function(config, $scope, $ionicModal, $ionicPlatform, $cordovaGeolocation, $timeout, $cordovaHealthKit, $http, $rootScope, $cordovaLocalNotification) {

  // constant vars
  $scope.loginData = {};
  $scope.createUser = {};
  $scope.errors = {};
  $scope.hasErrors = false;
  $scope.user = JSON.parse(window.localStorage.getItem('user'));
  $scope.geolocation = {};
  $scope.eligible = JSON.parse(window.localStorage.getItem('eligible'));
  $scope.consent = JSON.parse(window.localStorage.getItem('consent'));
  $scope.healthkitAvail = false;

  // healthkit check
  // $cordovaHealthKit.isAvailable().then(function(yes) {
  //   // Is available
  // }, function(no) {
  //   // Is not available
  // });

  $ionicPlatform.ready(function() {
    if ( window.cordova ) {
      // local notifications permissions
        $cordovaLocalNotification.hasPermission().then(function(hasPermission) {
          console.log(hasPermission ? "has permissions" : "no permissions");

          if (!hasPermission) {
            registerPermission();
          } else {
            hasScheduledPermission();
          }
        });

      // hasScheduledPermission
      function hasScheduledPermission() {
        $cordovaLocalNotification.isPresent(12345, $scope).then(function(isPresent) {
            // console.log(isPresent ? "scheduled note" : "no scheduled");
            if($scope.consent) {
              if (!isPresent) {
                scheduleNotification();
              } else {
                listenForNotificationClick();
              }
            }
          });
      }

      // schedule
      function scheduleNotification() {
        $cordovaLocalNotification.schedule({
            id: 12345,
            title: 'You have pending Survey',
            text: 'Please comeback to take survey.',
            every: config.notifications.every
          }).then(function (result) {
            // do something
            console.log(JSON.stringify(result));
          });
      }

      // register permissions
      function registerPermission() {
        $cordovaLocalNotification.registerPermission().then(function(registeredPermission) {
          console.log('registeredPermission');
        });
      }

      // listen for action
      function listenForNotificationClick() {
        $rootScope.$on('$cordovaLocalNotification:click', function(event, notification, state) {
          console.log('clicked');
        })
      }
    }
  });






  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    // regrab locals
    if (toState.url === '/home') {
      $scope.eligible = JSON.parse(window.localStorage.getItem('eligible'));
      $scope.consent = JSON.parse(window.localStorage.getItem('consent'));
      $scope.user = JSON.parse(window.localStorage.getItem('user'));
    }
  });

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
  var posOptions = { timeout: 5000, enableHighAccuracy: false };

  if ( $scope.user && !config.geolocation.disable) {
    var bgGeolocationWatch = window.setInterval(function() {
      $cordovaGeolocation
       .getCurrentPosition(posOptions)

       .then(function (position) {
            updateGeolocation(position);

       }, function(err) {
          console.log('get error ' + err.message + '\ncode: ' + err.code);
       });
    }, config.geolocation.timeout);
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
}])
// ============
// Survey Stuff
// ============
.controller('SurveyCtrl', ['config', '$scope', '$ionicModal', '$http', 'irkResults', function(config, $scope, $ionicModal, $http, irkResults) {
  $scope.takingSurvey = false;
  $scope.surveyError = false;
  $scope.surveyComplete = false;

  $scope.openModal = function() {
    $scope.takingSurvey = true;
    getQuestions();
  };

  $scope.closeModal = function() {
    $scope.takingSurvey = false;
    var surveyResults = irkResults.getResults();
    // did they complete the survey
    if (surveyResults.childResults.length > 0 && !surveyResults.canceled) {
      postAnswers(surveyResults)
    }
    $scope.modal.remove();
  };

  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
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
      console.log('Retrieved Questions', $scope.questions);
      $scope.modal = $ionicModal.fromTemplate(renderSurvey(response.data.questions), {
        scope: $scope,
        animation: 'slide-in-up'
      });
      $scope.modal.show();
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.takingSurvey = false;
      $scope.surveyError = true;
      console.log('questions error', response);
    });
  }

  function renderSurvey(questions) {
    return '<ion-modal-view class="irk-modal">'+
      '<irk-ordered-tasks>'+
          renderQuestions(questions)+
      '</irk-ordered-tasks>'+
    '</ion-modal-view>';
  }

  function renderQuestions(questions) {
    var questionsArray = [];
    for(var i = 0; i < questions.length; i++ ) {
      var questionType = questions[i].q_type;

      switch (questionType) {
        case 'boolean':
          questionsArray.push('<irk-task><irk-boolean-question-step id="q'+questions[i].id+'" title="'+questions[i].question+'" text="Additional text can go here." true-text="Yes" false-text="No" /></irk-task>');
          break;
        case 'scale':
          questionsArray.push('<irk-task><irk-scale-question-step id="q'+questions[i].id+'" title="'+questions[i].question+'" text="1 being Never &amp; 5 Almost Always" min="1" max="5" step="1" value="3" /></irk-task>');
          break;
        case 'choice':
          questionsArray.push('<irk-task><irk-text-choice-question-step id="q'+questions[i].id+'" title="'+questions[i].question+'" style="single"><irk-text-choice text="1 Never" value="1"></irk-text-choice><irk-text-choice text="2 Rarely" value="2"></irk-text-choice><irk-text-choice text="3 Sometimes" value="3"></irk-text-choice><irk-text-choice text="4 Often" value="4"></irk-text-choice><irk-text-choice text="5 Almost Alway" value="5"></irk-text-choice></irk-text-choice></irk-text-choice-question-step></irk-task>')
          break;
      }
    }
    return questionsArray.join('\n');
  }

  function postAnswers(surveyResults) {
    var answersArray = [];
    var userId = JSON.parse(window.localStorage.user).id

    for(var i = 0; i < surveyResults.childResults.length; i++) {
      var questionId = surveyResults.childResults[i].id.slice(1);
      answersArray.push({
        "answer": {
          "user_id": userId,
          "question_id": questionId,
          "answer": surveyResults.childResults[i].answer
        }
      });
    };
    // TODO:
    // how to post to answers shakir
    $http({
      method: 'POST',
      url: config.api.answers,
      data: JSON.stringify(answersArray),
    }).then(function successCallback(response) {
      console.log('answers posted', response);
    }, function errorCallback(response) {
      console.log('an error has ocurred', response);
    });


  }

}])
// ======================
// eligibility controller
// ======================
.controller('EligibilityCtrl', [
  'config',
  '$scope',
  '$ionicModal',
  '$http',
  'irkResults',
  function(config, $scope, $ionicModal, $http, irkResults) {
    $scope.eligible = JSON.parse(window.localStorage.getItem('eligible'));
    irkResults = irkResults;

    $ionicModal.fromTemplateUrl('templates/eligibility-survey.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      if ( !$scope.eligible ) {
        $scope.modal.show();
      }
    });

    $scope.openModal = function() {
      $scope.modal.show();
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
      checkEligibility();
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });

    function checkEligibility() {
      var answers = irkResults.getResults().childResults;
      for(var i = 0; i < answers.length; i++) {
        if ( answers[i].answer === "true") {
          window.localStorage.setItem('eligible', true);
          $scope.eligible = window.localStorage.getItem('eligible');
          window.location = "#/app/home";
        }
      }
    }
  }
])
// ==================
// consent controller
// ==================
.controller('ConsentCtrl', [
  'config',
  '$scope',
  '$ionicModal',
  '$http',
  'irkResults',
  function(config, $scope, $ionicModal, $http, irkResults) {
    $scope.consent = JSON.parse(window.localStorage.getItem('consent'));
    irkResults = irkResults;

    $ionicModal.fromTemplateUrl('templates/consent-survey.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      if ( !$scope.consent ) {
        $scope.modal.show();
      }
    });

    $scope.openModal = function() {
      $scope.modal.show();
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
      updateConsent();
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });

    function updateConsent() {
      var consentResults = irkResults.getResults().childResults;
      var consent = {};
      // find consents
      for(var i = 0; i < consentResults.length; i++) {
          // has consent
          if ( consentResults[i].answer === true ) {
            consent.hasConsented = true;
          }
          // attact sign
          if ( consentResults[i].signature ) {
            consent.signature = consentResults[i].signature;
          }
          // name
          if (typeof(consentResults[i].answer) === 'object') {
            consent.first_name = consentResults[i].answer.s1.givenName;
            consent.last_name  = consentResults[i].answer.s1.familyName;
          }

          if ( consentResults[i].type === 'IRK-CONSENT-SHARING-STEP' ) {
            consent.sharing = consentResults[i].answer;
          }
      }
      // add consent
      if ( consent.hasConsented ) {
        window.localStorage.setItem('consent', JSON.stringify(consent));
        $scope.consent = window.localStorage.getItem('consent');

        window.location.hash = "#/app/home";
      }


    }

}])
.controller('SplashCtrl', function($scope, $stateParams) {
});
