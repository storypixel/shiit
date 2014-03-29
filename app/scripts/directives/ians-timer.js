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
				totalRounds: '=rounds',
				warmupDuration: '=warmup'
			},
			controller: ['$scope', '$element', '$attrs', '$filter', function ($scope, $element, $attrs, $filter) {
				var stop,
				//startingTime, // when the timer was started
				//stoppingTime, // when the timer was last stopped. Useful when timer is "paused"
				updateEvery = 1000, // milliseconds
				currentRound,
				roundLength,
				cribSheet,
				oldTime,
				newTime,
				cycleObjectIndex,
				roundSentinel, // a way to track when we get to a new round
				cumulativeValue,
				sumOfTime,
				warmupLeft,
        secondsLeftInCycle,
				cycleLength,
				cycleName,
        currentRoundReadyToChange,
				cycles = angular.copy($scope.cyclesData),
        MINTIME, // the least for $scope.time
        MAXTIME, // the most for $scope.time
        ti,
        thisi,
        thisRound;

				function initVariables() {
					if (!angular.isDefined( cycles )){
						$scope.$emit('ians-timer:error-data');
						return;
					}

					var slen,
					cyclesLeftToAddToCribSheet,
					currentIndex,
					stackOverflowTrick;

					sumOfTime = 0;
          currentRoundReadyToChange = true; // else the round won't update on first run
					warmupLeft = $scope.warmup = $scope.warmup || 0;
					slen = cycles.length;

          // Assign round length in seconds
					angular.forEach( cycles, function(obj, i){
						sumOfTime = sumOfTime + obj.value;
						cycles[i].cumulativeValue = sumOfTime;
					});

          //
					roundLength = sumOfTime;
          MINTIME = 0;
					$scope.time = MAXTIME = sumOfTime * $scope.totalRounds;
					cyclesLeftToAddToCribSheet = $scope.totalRounds * slen; // - 1; // cycles are encoded as strings. minus 1 because we get rid of the last rest period
					cycleObjectIndex = 0;
          roundSentinel = 0;
          currentRound = 0;
          oldTime = 0;
          cycleLength = 0; // how many times we go through each set of cycles

					// Make a cribSheet that a guide to know what cycle each second falls into
					cribSheet = []; //
					while (cyclesLeftToAddToCribSheet--) {
						currentIndex = cyclesLeftToAddToCribSheet % slen;
						// over time produces a cribSheet looking like "1111000011110000" -> 4 seconds rest, 4 seconds work; 2 cycles
						stackOverflowTrick = new Array( cycles[currentIndex].value + 1).join(currentIndex).split(''); //url for stack overflow pls
						cribSheet = cribSheet.concat(stackOverflowTrick);
					}
					// make cribSheet a string. this could support only 10 non-readytime states
					cribSheet = cribSheet.concat(new Array( $scope.warmup + 1 ).join('w').split(''));
					cribSheet = cribSheet.join('');

					$scope.time = $scope.time + $scope.warmup;
				}

				// Update the time to the screen in a way that reflects current round and cycle
				function updateTime(manualControl) {

          ti = $scope.time - 1,
					thisi = ti % roundLength,
          thisRound;

					cycleObjectIndex = cribSheet.charAt( ti );

					if (cycleObjectIndex === 'w'){
						if (($scope.time % $scope.warmup) === ($scope.warmup - 1)){
							$scope.$emit('ians-timer:cycle-changed', {'cycle' : 'ready', 'round' : 0});
						}
						// let it hit zero
            cycleLength = $scope.warmup;
            warmupLeft = warmupLeft - 1;
            secondsLeftInCycle = warmupLeft;
						writeTime(secondsLeftInCycle); // hits zero only when time has ran out
						return;
					}

					cycleName = cycles[ cycleObjectIndex ].name; // determine this cycle's name
					cycleLength  = +cycles[ cycleObjectIndex ].value; // determine this cycle's name
					cumulativeValue = +cycles[ cycleObjectIndex ].cumulativeValue;
          // determine how many seconds are left in rest or work
					secondsLeftInCycle = thisi - (roundLength - cumulativeValue);
          // calculate what round we are on
          thisRound = Math.ceil($scope.totalRounds - ti / sumOfTime);
          //console.log("thisRound is "+thisRound);
					// if time is :25 and work is 10 and rest is 5... 10 seconds into next round.
					//console.log('testing seconds left in cycle: '+secondsLeftInCycle );
          if (secondsLeftInCycle === 0){
            currentRoundReadyToChange = true;
          }
          if (thisRound !== currentRound){
            currentRound = thisRound;
            currentRoundReadyToChange = false;
          }
          if (!manualControl && ((secondsLeftInCycle + 1) === cycleLength)){
						// if ((currentRoundReadyToChange === true) && ((thisi + 1) === roundLength)){
            //
						// }
						$scope.$emit('ians-timer:cycle-changed', {'cycle' : cycleName, 'round' : currentRound});
					}
          // write time
					writeTime(secondsLeftInCycle + 1); // hits zero only when time has ran out
				}

				function tick(){
					if ($scope.time > 0) {
						$scope.running = true;
						updateTime(); // update DOM
						$scope.time = $scope.time - updateEvery/1000;
					} else {
						$scope.andDone();
					}
				}

				// Put the time on the screen. not sure if this is the encapsulated way to do it
				function writeTime(t){
					newTime = $filter('digitalTime')(t);
					$element.text(newTime); // never hits zero until all is complete
					$scope.$emit('ians-timer:tick', {'displayTime' : t, 'time' : $scope.time, cycleLength: cycleLength});
				}

				// Destroy
				$element.on('$destroy', function() {
					$scope.andDone();
				});

				// We are done running the timer, tie up lose ends to prevent leaks
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
					//stoppingTime = Date.now();
					$scope.running = false;
					$scope.$emit('ians-timer:stopped');
				};

				// stop here means pause
				$scope.$on('ians-timer:stop', function(){
					$scope.justStop();
				});

				// completely reset
				$scope.$on('ians-timer:reset', function(){
					$scope.andDone();
					initVariables();
					$scope.$emit('ians-timer:resetted');
				});

				$scope.$on('ians-timer:start', function(){
					// If stop is already defined, we are resuming
					if ( !angular.isDefined(stop) ){
						initVariables();
					}

					// start the UI update process; save the timeoutId for canceling
					tick();
					stop = $interval(tick, updateEvery);
					$scope.$emit('ians-timer:started');
				});

        // go to the previous cycle now
        $scope.$on('ians-timer:go-to-previous-cycle', function(){
          var delta = cycleLength - secondsLeftInCycle;
          //console.log('----\n\nprevious cycle '+secondsLeftInCycle);
          //console.log('delta '+delta);


          // KLUDGE: off-by-one error
          // I don't know why this works exactly, probalby points to a logical error
          // if the timer isn't running and we are at a "full count" for a cycle
          // then let's increment delta. Otherwise going forward is one second short
          if (!$scope.running && (secondsLeftInCycle === (cycleLength - 1))){
            delta = cycleLength;
          }
          $scope.justStop();
          $scope.time = $scope.time + delta;
          updateTime();
        });
        // go to the next cycle now
        $scope.$on('ians-timer:go-to-next-cycle', function(){
          var delta = secondsLeftInCycle;

          // KLUDGE: off-by-one error
          // I don't know why this works exactly, probalby points to a logical error
          // if the timer isn't running and we are at a "full count" for a cycle
          // then let's increment delta. Otherwise going forward is one second short
          if (!$scope.running && (secondsLeftInCycle === (cycleLength - 1))){
            delta = delta + 1;
          }

          $scope.justStop();
          $scope.time = $scope.time - delta;
          updateTime();
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
