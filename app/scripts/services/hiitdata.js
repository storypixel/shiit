'use strict';

angular.module('shiitApp')
  .factory('HiitData', function () {
    // Service logic
    // ...

    // Public API here
    return {
      durationData: function(){
        return {
          workSeconds: 5,
          restSeconds: 0,
          numReps: 1,
          totalSeconds: 5
        };
      }
    };
  });
