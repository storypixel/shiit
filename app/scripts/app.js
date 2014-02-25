'use strict';

angular.module('shiitApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.router',
  'iansTimer',
  'shiitFilters',
  'LocalStorageModule'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

    // For any unmatched url, send to /route1
    $urlRouterProvider.when('/endless/nothing', 'partials/nothing.html');
    $urlRouterProvider.otherwise('/hiit');
      
    $stateProvider
      .state('hiit', {
        url: '/hiit',
        abstract: true,
        templateUrl: 'partials/hiit.html',
        controller: 'HiitCtrl'
      })
      .state('hiit.calibrate', {
        url: '',
        templateUrl: 'partials/hiit-calibrate.html',
        controller: 'HiitCalibrateCtrl'
      })
      .state('hiit.work', {
        url: '/work',
        templateUrl: 'partials/hiit-work.html',
        controller: 'HiitWorkCtrl'
      });

    $locationProvider.html5Mode(true);
      
    // Intercept 401s and 403s and redirect you to login
    $httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
      return {
        'responseError': function(response) {
          if(response.status === 401 || response.status === 403) {
            $location.path('/login');
            return $q.reject(response);
          }
          else {
            return $q.reject(response);
          }
        }
      };
    }]);
  })
  .run(function ($rootScope, $location, Auth) {

    // Redirect to login if route requires auth and you're not logged in
    // $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    //   console.log('testy state change');
    //   console.log(event);
    //   console.log(toState);
    //   console.log(toParams);
    //   console.log(fromState);
    //   console.log(fromParams);
    // });

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
      //console.log('testy route change');
      if (next.authenticate && !Auth.isLoggedIn()) {
        $location.path('/login');
      }
    });
  });