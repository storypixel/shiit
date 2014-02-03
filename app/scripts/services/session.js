'use strict';

angular.module('shiitApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
