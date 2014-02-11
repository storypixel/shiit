/**
 * angular-simple-timer 
 */
'use strict';

/*
params

	delay:Number, 
	repeatCount:int = 0,
	currentCount //readonly
methods
	reset	()	method
	start	()	method	 
	stop	()	
  */

angular.module('iansTimer', [])
  .directive('iansTimer', ['$interval', function($interval) {
    return {
      restrict: 'A',
      scope: {
        intervalDurationsAttr: '=intervalDurations',
        intervalNamesAttr: '=intervalNames',
        cyclesData: '=cycle',
        totalRounds: '=rounds'
      },
      controller: ['$scope', '$element', '$attrs', '$filter', function ($scope, $element, $attrs, $filter) {
        var stop,
        startingTime, // when the timer was started
        stoppingTime, // when the timer was last stopped. Useful when timer is "paused"
        updateEvery = 250, // milliseconds
        currentRound,
        cribSheet,
        oldTime,
        newTime,
        cycleObjectIndex,
        timeAsIndex,
        cycleLength,
        cycleName,
        displayTime,
        lastCycleObjectIndex;

        console.log('$scope.cycle');
        console.log($scope.cycle);

        function initVariables() {
          if (!angular.isDefined( $scope.cyclesData )){
            $scope.$emit('ians-timer:error-data');
            return;
          }

          var sumOfTime = 0,
          slen,
          cyclesLeftToAddToCribSheet,
          currentIndex,
          stackOverflowTrick;

          slen = $scope.cyclesData.length;
          // Assign round length in seconds
          angular.forEach( $scope.cyclesData, function(obj){ sumOfTime += obj.value; });
          $scope.targetSeconds = sumOfTime * $scope.totalRounds;
          $scope.time = $scope.targetSeconds;
          cyclesLeftToAddToCribSheet = $scope.totalRounds * slen; // cycles are encoded as strings
          cycleObjectIndex = 0;
          currentRound = 0; // how many times we go through each set of cycles
          oldTime = 0;

          // Make a cribsheet that a guide to know what cycle each second falls into
          cribSheet = []; // 
          while (cyclesLeftToAddToCribSheet--) {
            currentIndex = cyclesLeftToAddToCribSheet % slen;
            // over time produces a cribSheet looking like "1111000011110000" -> 4 seconds rest, 4 seconds work; 2 cycles
            stackOverflowTrick = new Array( $scope.cyclesData[currentIndex].value + 1).join(currentIndex).split(''); //url for stack overflow pls
            cribSheet = cribSheet.concat(stackOverflowTrick);
          }
          // make cribSheet a string. this could support only 10 non-readytime states
          cribSheet = cribSheet.join('');

          stoppingTime = undefined; // we haven't stopped yet          
          startingTime = Date.now(); // we start now
        }

        // Update the time to the screen in a way that reflects current round and cycle
        function updateTime() {
    
          lastCycleObjectIndex = cycleObjectIndex;

          /*jslint bitwise: true */ // ^ jslint was complaining about bitwise. turn that off.
          timeAsIndex = ($scope.time - 0.001) | 0; // would be a problem if time goes to -1 or less
          /*jslint bitwise: false */

          // this should tell whether this second will belong to rest or work, or the ready time
          cycleObjectIndex = cribSheet.charAt( timeAsIndex );

          // how long the current cycle is in seconds. 
          cycleLength = +$scope.cyclesData[ cycleObjectIndex ].value; // the + in front converts to number      
          cycleName   = $scope.cyclesData[ cycleObjectIndex ].name; // determine this cycle's name
          displayTime = timeAsIndex % cycleLength; // what the user should see   

          // If the cycleobjectindex changes,that means we went to a new cycle eg. to rest or to work
          if (cycleObjectIndex !== lastCycleObjectIndex){
            // if the new cycle object index is 0, that means we are back to the first cycle e.g. work, which is the top of a new round
            if (cycleObjectIndex === '0'){ currentRound++; } // probably not the most stable approach, but efficient
            $scope.$emit('ians-timer:cycle-changed', {'cycle' : cycleName, 'round' : currentRound});
          }
          // Put the time on the screen and add 1 to make it align with human conventions of time
          writeTime(displayTime + 1); // hits zero only when time has ran out
        }

        // Put the time on the screen. not sure if this is the encapsulated way to do it
        function writeTime(t){
          newTime = $filter('digitalTime')(t);
          //$scope.sauce = t;
          //$scope.$apply();
          $element.text(newTime); // never hits zero until all is complete
          if (oldTime !== newTime){
            /*jslint bitwise: true */
            $scope.$emit('ians-timer:tick', {'time' : t});
            /*jslint bitwise: false */
            oldTime = newTime;
          }
        }

        // Watch a variable
        // $scope.$watch($attrs.myCurrentTime, function(/*value*/) {
        //   if ($scope.running){
        //     //console.log('watch changed');
        //     updateTime();
        //   }
        // });

        // Destroy
        $element.on('$destroy', function() {
          $scope.andDone();
        });

        // We are done running the timer
        $scope.andDone = function(){
          if ( angular.isDefined( stop ) ){
            $scope.justStop(); // just stop, don't erase stop
            stop = undefined; // now erase stop
            writeTime(0);
            $scope.$emit('ians-timer:finished');
          }
        };

        // Stop the timer from running but don't reset it
        $scope.justStop = function(){
          $interval.cancel(stop);
          stoppingTime = Date.now();
          $scope.running = false;
          $scope.$emit('ians-timer:stopped');
        };

        // stop here means pause
        $scope.$on('ians-timer:stop', function(){
          $scope.justStop();
          $scope.$emit('ians-timer:stopped');
        });

        // completely reset
        $scope.$on('ians-timer:reset', function(){
          $scope.andDone();
          initVariables();
          $scope.$emit('ians-timer:resetted');
        });

        $scope.$on('ians-timer:start', function(){
          // If stop is already defined, we are resuming
          if ( angular.isDefined(stop) ){
            startingTime += Date.now() - stoppingTime;
          } else {
            // Must be the first time the timer has ran, do it right
            initVariables();
          }

          // start the UI update process; save the timeoutId for canceling
          stop = $interval(function() {
            if ($scope.time > 0) {
              $scope.running = true;
              $scope.time = $scope.targetSeconds - (Date.now() - startingTime) / 1000;
              updateTime(); // update DOM
            } else {
              $scope.andDone();
            } // console.log('tick');
          }, updateEvery);

          $scope.$emit('ians-timer:started');

        });

        // observe changes to interpolated attribute
        $attrs.$observe('seconds', function(value) {
          console.log('seconds has changed value to ' + value);
        });

      }]
    };
  }
])
.filter('padWithZeros', function() {
  return function(input) {
    return ((input < 10) ? ('0' + input) : input);
  };
})
.filter('digitalTime', function(padWithZerosFilter) {
  // puts seconds 61 into time format 1:01
  return function(secs) {
    var m = Math.floor(secs/60),
      s = padWithZerosFilter(secs % 60);
    return (m + ':' + s);
  };
});