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
    },
    // taken from healthkit documentation
    healthkit: {
      permissions: {
        read: [
          'HKCharacteristicTypeIdentifierDateOfBirth',
          'HKQuantityTypeIdentifierBloodAlcoholContent',
          'HKQuantityTypeIdentifierHeartRate',
          'HKQuantityTypeIdentifierBodyMass',
          'HKQuantityTypeIdentifierHeight',
          'HKQuantityTypeIdentifierStepCount'
        ],
        write: [
          'HKQuantityTypeIdentifierHeight',
          'HKQuantityTypeIdentifierBodyMass'
        ]
      },
      height: {
        unit: 'in'
      },
      weight: {
        unit: 'lb'
      },
      heart_rate: {
        unit: 'count/min'
      }
    },
    question: {
      offset: 1 // used for indexing questions
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
  $scope.showSurvey = false;
  $scope.showInstructions = false;
  $scope.loadSpinner = false;
  // computeds
  $scope.hasMissingData = function() {
    if($scope.user) {
      return $scope.user.medical_id === null;
    }
    return false;
  }

  $scope.nothingForUser = function() {
    if($scope.user && !$scope.hasMissingData() && !$scope.showSurvey) {
      return true;
    }

    return false;

  }


  $ionicPlatform.ready(function() {
    console.log('BeneAdd Ready');
    // =====================
    // healthkit permissions
    // =====================
    if ( window.cordova && $scope.user ) {
      $cordovaHealthKit.isAvailable().then(function(yes) {
        console.log('HK avail');
      }, function(no) {
        console.log('HK NOT avail');
      });
      $cordovaHealthKit.requestAuthorization(
        config.healthkit.permissions.read,
        config.healthkit.permissions.write
      ).then(function(success) {
        console.log('HK success');
      }, function(err) {
        console.log('HK error', err);
      });
    }
    // =============
    // notifications
    // =============
    if ( window.cordova && $cordovaLocalNotification) {
      // local notifications permissions
        $cordovaLocalNotification.hasPermission().then(function(hasPermission) {
          // console.log(hasPermission ? "has permissions" : "no permissions");

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
          });
      }

      // register permissions
      function registerPermission() {
        $cordovaLocalNotification.registerPermission().then(function(registeredPermission) {
          // console.log('registeredPermission');
        });
      }

      // listen for action
      function listenForNotificationClick() {
        // console.log('listening for click');
        $rootScope.$on('$cordovaLocalNotification:click', function(event, notification, state) {

          $cordovaLocalNotification.cancelAll().then(function(action) {
            console.log('notification canceled');
            $scope.showSurvey = true;
          });
        })
      }

      // ====================
      // end of notifications
      // ====================
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
    window.location.hash = '#/app/home';
    window.location.reload();
  };

  $scope.doCreate = function() {
    $scope.loadSpinner = true;
    var createUser = $scope.createUser;
    delete createUser.confirm;

    $http({
      method: 'POST',
      url: config.api.users,
      data: {
        "user": createUser
      }
    }).then( function successCallback(response) {
      $scope.showInstructions = true;
      $scope.loadSpinner = false ;
      window.location.hash = '#/app/home';
    }, function errorCallback(response) {
      console.log('Create account error', response);
      $scope.loadSpinner = false;
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
    console.log('update geolocation'
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
.controller('SurveyCtrl', ['config', '$scope', '$ionicModal', '$http', 'irkResults', '$cordovaLocalNotification', function(config, $scope, $ionicModal, $http, irkResults, $cordovaLocalNotification) {
  $scope.surveyComplete = false;
  $scope.surveyError = false;
  $scope.canSurvey = true;
  $scope.hideGate = false;
  $scope.loadSpinner = false;

  $scope.backToHome = function() {
    rescheduleSurvey();
  }

  $scope.noSurvey = function() {
    $scope.canSurvey = false;
  }

  $scope.openModal = function() {
    $scope.loadSpinner = true;
    getQuestions();
  };

  $scope.closeModal = function() {
    var surveyResults = irkResults.getResults();
    // did they complete the survey
    if (surveyResults.childResults.length > 0 && !surveyResults.canceled) {
      $scope.surveyComplete = true;
      postAnswers(surveyResults);
    }

    if ( surveyResults.canceled ) {
      $scope.loadSpinner = false;
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
      $scope.loadSpinner = false;
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
          questionsArray.push('<irk-task><irk-boolean-question-step id="q'+(questions[i].id-config.question.offset)+'" title="'+questions[i].question+'" text="Additional text can go here." true-text="Yes" false-text="No" /></irk-task>');
          break;
        case 'scale':
          questionsArray.push('<irk-task><irk-scale-question-step id="q'+(questions[i].id-config.question.offset)+'" title="'+questions[i].question+'" text="1 being Never &amp; 5 Almost Always" min="1" max="5" step="1" value="3" /></irk-task>');
          break;
        case 'choice':
          questionsArray.push('<irk-task><irk-text-choice-question-step id="q'+(questions[i].id-config.question.offset)+'" title="'+questions[i].question+'" style="single"><irk-text-choice text="1 Never" value="1"></irk-text-choice><irk-text-choice text="2 Rarely" value="2"></irk-text-choice><irk-text-choice text="3 Sometimes" value="3"></irk-text-choice><irk-text-choice text="4 Often" value="4"></irk-text-choice><irk-text-choice text="5 Almost Alway" value="5"></irk-text-choice></irk-text-choice></irk-text-choice-question-step></irk-task>')
          break;
      }
    }
    return questionsArray.join('\n');
  }

  function postAnswers(surveyResults) {
    var answersArray = [];
    var userId = JSON.parse(window.localStorage.user).id

    for(var i = 0; i < surveyResults.childResults.length; i++) {
      var questionId = parseInt(surveyResults.childResults[i].id.slice(1)) + config.question.offset;
      // dont submit null results
      if ( surveyResults.childResults[i].answer ) {
        answersArray.push({
          "user_id": userId,
          "question_id": questionId,
          "answer": surveyResults.childResults[i].answer
        });
      }

    };

    $http({
      method: 'POST',
      url: config.api.answers,
      data: {
        answer: answersArray
      }
    }).then(function successCallback(response) {
      console.log('answers posted', response);
    }, function errorCallback(response) {
      console.log('error submitting answers', response.statusText);
    }).finally(function(){
      // reschedule notifications
      rescheduleSurvey();
    });
  }

  function rescheduleSurvey() {
    if( window.cordova ) {
      $cordovaLocalNotification.schedule({
        id: 12345,
        title: 'You have pending Survey',
        text: 'Please comeback to take survey.',
        every: config.notifications.every
      }).then(function (result) {
        // reset scope
        $scope.surveyComplete = false;
        $scope.surveyError = false;
        $scope.canSurvey = true;
        $scope.hideGate = false;
        $scope.loadSpinner = false;
        // do something
        console.log('notification rescheduled');
        window.location.hash = "#/app/home";
      });
    } else {
      // reset scope
      $scope.surveyComplete = false;
      $scope.surveyError = false;
      $scope.canSurvey = true;
      $scope.hideGate = false;
      $scope.loadSpinner = false;
      window.location.hash = "#/app/home";
    }
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
// ==========================
// Additional Info Controller
// ==========================
.controller('AdditionalInfoCtrl', [
  'config',
  '$scope',
  '$ionicModal',
  '$ionicPlatform',
  '$http',
  'irkResults',
  '$cordovaHealthKit',
  function(config, $scope, $ionicModal, $ionicPlatform, $http, irkResults, $cordovaHealthKit) {
    irkResults = irkResults;
    $scope.user = JSON.parse(window.localStorage.getItem('user'));

    $ionicModal.fromTemplateUrl('templates/additional-info-survey.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      console.log('show modal');
      $scope.modal = modal;
      $scope.modal.show();
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      var surveyResults = irkResults.getResults();
      // did they complete the survey
      if (surveyResults.childResults.length > 0 && !surveyResults.canceled) {
        updateInfo(surveyResults);
      }

      if ( surveyResults.canceled ) {
        window.location.hash = "#/app/home";
      }
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

    function updateInfo(results) {
      console.log(results);
      var answers = results.childResults[0].answer;
      var date = results.end;


      updateUser(answers, date);
    }

    function updateHealthKit(answer, date) {
      if( window.cordova ) {
        // healthkit check
        $cordovaHealthKit.isAvailable().then(function(yes) {
          // save weight
          $cordovaHealthKit.saveWeight(answer.weight, config.healthkit.weight.unit, date).then(function(v) {
          }, function(err) {
            console.log('weight error' + err);
          });
          // save height
          $cordovaHealthKit.saveHeight(answer.height, config.healthkit.height.unit, date).then(function(v) {
          }, function(err) {
            console.log('height error' + err);
          });
        }, function(no) {});
      }
    }

    function updateUser(answers) {
      var dataObj = {
        user: answers
      };
      $http.put(config.api.users+$scope.user.id, dataObj)
      .then(function successCallback(response) {
        // reset localStorage
        window.localStorage.setItem('user', JSON.stringify(response.data.user));
        updateHealthKit(answers, date);
        // redirect home
        window.location.hash = "#/app/home";
      }, function errorCallback(response) {
        alert('Error with the server. Please try again');
        window.location.reload();
        console.log('update user error', response.statusText);
      });
    }
}])
// ==============
// PermissionCtrl
// ==============
.controller('PermissionCtrl', [
  'config',
  '$scope',
  '$cordovaHealthKit',
  function(config, $scope, $cordovaHealthKit) {
    $scope.permissions = {};
    $scope.hasCordova = window.cordova;

    if( window.cordova ) {
      $scope.updatePermissions = function() {
        $cordovaHealthKit.requestAuthorization(
          config.healthkit.permissions.read,
          config.healthkit.permissions.write
        ).then(function(success) {
          console.log('HK success' + success);
        }, function(err) {
          console.log('HK error', err);
        });
      };
      // is aval
      $cordovaHealthKit.isAvailable().then(function(yes) {
        console.log('HK avail');
      }, function(no) {
        console.log('HK NOT avail');
      }).finally(function() {
        $scope.updatePermissions();
      });

    } else {
      $scope.updatePermissions = function() {
        alert('No healthkit Present');
      }
    }

  }
])
.controller('SplashCtrl', function($scope, $stateParams) {
});
