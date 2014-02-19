'use strict';

angular.module('shiitApp')
  .factory('HiitData', function () {
    // Service logic
    // ...

    // Public API here
    return {
      durationData: function(){
        return {
          preSeconds: 10,
          workSeconds: 20,
          restSeconds: 10,
          numReps: 8
        };
      }
    };
  });
