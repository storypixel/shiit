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
				stoppingTime, // when the timer was last stopped. Useful when timer is "paused"
				updateEvery = 1000, // milliseconds
				currentRound,
				roundLength,
				cribSheet,
				oldTime,
				newTime,
				cycleObjectIndex,
				//lastCycleObjectIndex,
				roundSentinel, // a way to track when we get to a new round
				//lastRoundSentinel,  
				cumulativeValue,
				//timeAsIndex,
				sumOfTime,
				cycleLength,
				cycleName;
				//displayTime;

				//console.log('$scope.cycle');
				//console.log($scope.cycle);

				function initVariables() {
					if (!angular.isDefined( $scope.cyclesData )){
						$scope.$emit('ians-timer:error-data');
						//console.log('cycles data is not defined, that is an error');
						return;
					}

					var slen,
					cyclesLeftToAddToCribSheet,
					currentIndex,
					stackOverflowTrick;//,
					//lastRestSubtracted = 0; // maybe this isn't for the ians=timer?

					sumOfTime = 0;
					$scope.warmup = $scope.warmup || 10;
					slen = $scope.cyclesData.length;
					// Assign round length in seconds

					angular.forEach( $scope.cyclesData, function(obj){
						sumOfTime = sumOfTime + obj.value;
						obj.cumulativeValue = sumOfTime; // this helps calculate time visually
						//lastRestSubtracted = obj.value;
					});
					roundLength = sumOfTime;
					$scope.targetSeconds = (sumOfTime * $scope.totalRounds); // - lastRestSubtracted;
					$scope.time = $scope.targetSeconds;
					cyclesLeftToAddToCribSheet = $scope.totalRounds * slen; // - 1; // cycles are encoded as strings. minus 1 because we get rid of the last rest period
					cycleObjectIndex = roundSentinel = currentRound = oldTime = cycleLength = 0; // how many times we go through each set of cycles

					// Make a cribSheet that a guide to know what cycle each second falls into
					cribSheet = []; // 
					while (cyclesLeftToAddToCribSheet--) {
						currentIndex = cyclesLeftToAddToCribSheet % slen;
						// over time produces a cribSheet looking like "1111000011110000" -> 4 seconds rest, 4 seconds work; 2 cycles
						stackOverflowTrick = new Array( $scope.cyclesData[currentIndex].value + 1).join(currentIndex).split(''); //url for stack overflow pls
						cribSheet = cribSheet.concat(stackOverflowTrick);
					}
					// make cribSheet a string. this could support only 10 non-readytime states
					cribSheet = cribSheet.concat(new Array( $scope.warmup + 1 ).join('w').split(''));
					cribSheet = cribSheet.join('');
					//console.log(cribSheet);

					stoppingTime = undefined; // we haven't stopped yet
					$scope.time = $scope.time + $scope.warmup;
					//writeTime($scope.warmup); // hits zero only when time has ran out

					//startingTime = Date.now(); // we start now
				}

				// Update the time to the screen in a way that reflects current round and cycle
				function updateTime() {
		
					/*jslint bitwise: true */ // ^ jslint was complaining about bitwise. turn that off.
					//timeAsIndex = $scope.time; // ($scope.time - 0.001) | 0; // would be a problem if time goes to -1 or less
					/*jslint bitwise: false */
					var ti = $scope.time - 1,
							thisi = ti % roundLength,
							secondsLeftInCycle;
							//secondsLeftInRound = 1 + thisi;


					// this should tell whether this second will belong to rest or work, or the ready time
					//roundSentinel = cycleObjectIndex && !isNaN(cycleObjectIndex) && $scope.cyclesData[ cycleObjectIndex ].cumulativeValue;

					cycleObjectIndex = cribSheet.charAt( ti );

					if (cycleObjectIndex === 'w'){
						if (($scope.time % $scope.warmup) === ($scope.warmup - 1)){
							$scope.$emit('ians-timer:cycle-changed', {'cycle' : 'ready', 'round' : 0});
						}
						// let it hit zero
						writeTime(1 + (($scope.time - 1) % $scope.warmup)); // hits zero only when time has ran out
						return;
					}

					cycleName   = $scope.cyclesData[ cycleObjectIndex ].name; // determine this cycle's name					
					cycleLength  = +$scope.cyclesData[ cycleObjectIndex ].value; // determine this cycle's name					
					cumulativeValue = +$scope.cyclesData[ cycleObjectIndex ].cumulativeValue;
					secondsLeftInCycle = thisi - (roundLength - cumulativeValue);
					// console.log(cycleName + thisi);

					// if time is :25 and work is 10 and rest is 5... 10 seconds into next round.

					if ((secondsLeftInCycle + 1) === cycleLength){
						if ((thisi + 1) === roundLength){
							currentRound++;
							console.log('round incredmented to ' + currentRound);
						}
						console.log('cycle changed to  ' + cycleName);
						$scope.$emit('ians-timer:cycle-changed', {'cycle' : cycleName, 'round' : currentRound});
					}

					writeTime(secondsLeftInCycle + 1); // hits zero only when time has ran out
				}

				function tick(){
					if ($scope.time > 0) {
						$scope.running = true;
						//$scope.time = $scope.targetSeconds - (Date.now() - startingTime) / 1000;
						updateTime(); // update DOM
						$scope.time = $scope.time - updateEvery/1000;
					} else {
						$scope.andDone();
					} // console.log('tick');
				}

				// Put the time on the screen. not sure if this is the encapsulated way to do it
				function writeTime(t){
					newTime = $filter('digitalTime')(t);
					$element.text(newTime); // never hits zero until all is complete
					$scope.$emit('ians-timer:tick', {'time' : t});
				}

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
						//startingTime += Date.now() - stoppingTime;
					} else {
						// Must be the first time the timer has ran, do it right
						//console.log('initting the variables');
						initVariables();
					}

					// start the UI update process; save the timeoutId for canceling
					tick();
					stop = $interval(tick, updateEvery);
					
					$scope.$emit('ians-timer:started');

				});

				// observe changes to interpolated attribute
				// $attrs.$observe('seconds', function(value) {
				//   console.log('seconds has changed value to ' + value);
				// });

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