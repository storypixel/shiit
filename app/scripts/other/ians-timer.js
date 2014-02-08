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
        secondsAttr: '=seconds',
        cycleAttr: '=cycle',
        roundsAttr: '=rounds'
      },
      controller: ['$scope', '$element', '$attrs', '$filter', function ($scope, $element, $attrs, $filter) {
        var stop,
        startingTime, // when the timer was started
        stoppingTime, // when the timer was last stopped. Useful when timer is "paused"
        currentRound,
        roundLengthInSeconds,
        cribSheet,
        cycleObjectIndex,
        cyclesData;

        console.log('$scope.cycle');
        console.log($scope.cycle);

        function initVariables() {
          if (!angular.isDefined( $scope.cycleAttr )){
            $scope.$emit('ians-timer:error-data');
            return;
          }
          // init
          cyclesData = $scope.cycleAttr;

          $scope.targetSeconds = $scope.secondsAttr;
          $scope.totalRounds = $scope.roundsAttr;

          var sumOfTime = 0,
          slen = cyclesData.length,
          arraysToMake = $scope.totalRounds * slen;
          // ,
          // arraySpotsToFill = $scope.targetSeconds;
          cribSheet = new Array($scope.targetSeconds); // explain this. TODO

          currentRound = 0;
          stoppingTime = undefined;
          cycleObjectIndex = 0;
          $scope.time = $scope.targetSeconds;

          // angular doesn't have a reduce function, so...
          // Sum the times inside cyclesData
          angular.forEach(cyclesData, function(obj){
            sumOfTime += obj.value;
          });

          roundLengthInSeconds = sumOfTime;

          while (arraysToMake--) {
            var currentIndex = arraysToMake % slen,
            size = cyclesData[currentIndex].value,
            temp = new Array(size + 1).join(currentIndex).split('');
            cribSheet = cribSheet.concat(temp);
          }

          // make cribSheet a string. this could support only 10 states
          cribSheet = cribSheet.join('');

          startingTime = Date.now();
        }

        // Update the time to the screen in a way that reflects current round and cycle
        function updateTime() {
          
          if (cycleObjectIndex === undefined){
            console.log('something important not defined. fuck.');
            cycleObjectIndex = 0;
            //$scope.$emit('ians-timer:error-data');
            return;
          }

          var timeAsIndex,
              cycleLength,
              cycleName,
              displayTime,
              lastCycleObjectIndex = cycleObjectIndex;

          // cribIndex is the shadow of $scope.time ono-to our cribSheet that we use
          timeAsIndex = Math.floor( $scope.time - 0.001 );
          // cycleIndex is the index of the object that will tell us if this is a rest or work cycle. Or the relevant cycle when more than two cyclesData

          if (!cycleObjectIndex){
            console.log('cribsheet not defined? horse shit.');
            //$scope.$emit('ians-timer:error-data');
          }

          // console.log('cycleObjectIndex');
          // console.log(cycleObjectIndex);

          cycleObjectIndex = cribSheet.charAt( timeAsIndex ) || 0;

          // how long the current cycle is in seconds. the + in front converts to number
          console.log('testing torublesheome varis');
          console.log($scope.time);
          console.log(timeAsIndex);
          console.log(cycleObjectIndex);
          cycleLength = +cyclesData[ cycleObjectIndex ].value;
          // determine this cycle's name
          cycleName = cyclesData[cycleObjectIndex].name;
          if (cycleObjectIndex !== lastCycleObjectIndex){
            if (cycleObjectIndex === 0){ currentRound++; }
            $scope.$emit('ians-timer:cycle-changed', {'cycle' : cycleName, 'round' : currentRound});
          }
          // given this point in time, what should the user see?          
          displayTime = timeAsIndex % cycleLength;

          writeTime(displayTime + 1); // never hits zero until all is complete
        }

        function writeTime(t){
          $element.text($filter('digitalTime')(t)); // never hits zero until all is complete
        }

        // Watch a variable
        $scope.$watch($attrs.myCurrentTime, function(/*value*/) {
          if ($scope.running){
            console.log('watch changed');
            updateTime();
          }
        });

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
          // if we have started, let's not start twice
          //console.log('Can\'t start timer twice');
          // if ( angular.isDefined(stop) ){ return; }
          
          if ( angular.isDefined(stop) ){
            // I don't know
            startingTime = stoppingTime;
          } else {
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
          }, 200);

          $scope.$emit('ians-timer:started');

        });

        // observe changes to interpolated attribute
        $attrs.$observe('seconds', function(value) {
          console.log('seconds has changed value to ' + value);
        });

        // $attrs.$observe('cycle', function(cycle) {
        //   initVariables(cycle);
        // });

        console.log('testing attributes:');
        console.log($attrs.secondsAttr);

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