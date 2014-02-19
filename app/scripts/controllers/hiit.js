'use strict';

angular.module('shiitApp')
.controller('HiitCtrl', function ($state, $scope, $timeout, HiitData) {
	// $http.get('/api/awesomeThings').success(function(awesomeThings) {
	// 	$scope.awesomeThings = awesomeThings;
	// });
	// var masterSound = new buzz.sound( 'sounds/master', { formats: [ 'mp3' ] }),
	// 		hintSoundRange = [3, 4],
	// 		roundStartSoundRange = [0, 2.8],
	// 		roundEndSoundRange = [10, 11],
	// 		doneSoundRange = [6, 8],
	// 		soundPromise;
	// console.log('ok');
	//console.log(HiitData);
	//var buzz = buzz ? buzz : buzz; // this is a hack. I don't know the right way t o get angularjs to see buzzjs
	var playSound = function(id){ return id && undefined; },
	speech = ('speechSynthesis' in window);

	if (speech) {
		// Synthesis support. Make your web apps talk!
		var soundNewRound = new window.SpeechSynthesisUtterance('Go!'),
			soundRest = new window.SpeechSynthesisUtterance('Rest!'),
			soundFinished = new window.SpeechSynthesisUtterance('Workout complete. Congratulations! You should go wax your biceps now.'),
			soundReady = new window.SpeechSynthesisUtterance('Get Ready!'),
			soundThree = new window.SpeechSynthesisUtterance('Three'),
			soundTwo = new window.SpeechSynthesisUtterance('Two'),
			soundOne = new window.SpeechSynthesisUtterance('One'),
			soundError = new window.SpeechSynthesisUtterance('Ah Damn'),
			sounds = {
				'rest' : soundRest,
				'work' : soundNewRound,
				'ready': soundReady,
				'finished' : soundFinished,
				'count3' : soundThree,
				'count2' : soundTwo,
				'count1' : soundOne
			};
		// play speech synthesis sounds
		playSound = function (id) {
			window.speechSynthesis.speak(sounds[id] || soundError);
		};
	} else {
		// function playSound(range){
		// 	if ( angular.isDefined(soundPromise) ){
		// 		$timeout.cancel(soundPromise);
		// 	}
		// 	var startTime = range[0],
		// 			endTime = range[1],
		// 			ms = 1000 * (endTime - startTime);
		// 	// play a sound
		// 	masterSound.setTime(startTime).play();
		// 	// stop it after a time
		// 	soundPromise = $timeout(pauseSound, ms);
		// }		
		// other sounds
		// function pauseSound(){
		// 	//masterSound.pause();
		// 	soundPromise = undefined;
		// }		
	}

	$scope.data = HiitData.durationData();

	//$scope.stateClass = 'default';
	function limitRange (a, b) {
		return function (n) {
			if (n < a) {
				return a;
			}
			if (n > b) {
				return b;
			}
			return n;
		};
	}

	function updateCycle(workTime, restTime){
		return [
			{'name' : 'work', 'value' : +workTime}, // convert to number with +
			{'name' : 'rest', 'value' : +restTime}
		];
	}

	var workLimit = limitRange(5, 180),
		restLimit = limitRange(0, 60),
		repsLimit = limitRange(1, 90);


	//$scope.data.totalSeconds = ($scope.data.workSeconds + $scope.data.restSeconds) * $scope.data.numReps;


	$scope.goToWork = function(){
		$state.transitionTo('hiit.work');
	};

	// WORK
	$scope.moreWork = function(){
		$scope.data.workSeconds = workLimit($scope.data.workSeconds + 5);
	};

	$scope.lessWork = function(){
		$scope.data.workSeconds = workLimit($scope.data.workSeconds - 5);
	};

	// REST
	$scope.moreRest = function(){
		$scope.data.restSeconds = restLimit($scope.data.restSeconds + 5);
	};

	$scope.lessRest = function(){
		$scope.data.restSeconds = restLimit($scope.data.restSeconds - 5);
	};

	// REPS
	$scope.moreReps = function(){
		$scope.data.numReps = repsLimit($scope.data.numReps + 1);
	};

	$scope.lessReps = function(){
		$scope.data.numReps = repsLimit($scope.data.numReps - 1);
	};

	$scope.calcTotalSeconds = function(){
		$scope.data.totalSeconds = ($scope.data.workSeconds + $scope.data.restSeconds) * $scope.data.numReps;
		return $scope.data.totalSeconds;
	};

	// whenever it goes from rest to work or vice versa...
	$scope.$on('ians-timer:cycle-changed', function (event, data) {
		//console.log('ians-timer:cycle-changed event received');
		//console.log('current round changed to ' + data.round);
		$scope.currentRound = data.round;
		if (data.cycle === 'work'){
//			playSound(roundStartSoundRange);
			playSound('work');
			//soundGroup.play();			
		} else {
			// console.log('round info');
			// console.log(data.round + ' of ' + $scope.data.numReps);
			if (data.round >= $scope.data.numReps){
				$scope.$broadcast('ians-timer:reset');
				$scope.stateName = 'finished';
				//playSound('finished');
				return;
			}
			playSound('rest');


		}
		$scope.stateName = data.cycle;

		//console.log('ians-timer:cycle-changed end' + data.cycle);
	});

	// whenever it goes from rest to work or vice versa...
	$scope.$on('ians-timer:finished', function () {
		//console.log('ians-timer:cycle-changed event received');
		//console.log('current round changed to ' + data.round);
		//playSound(doneSoundRange);
		playSound('finished');
		//console.log('ians-timer:cycle-changed end' + data.cycle);
	});

	// whenever it goes from rest to work or vice versa...
	$scope.$on('ians-timer:tick', function (event, data) {
		//console.log('ians-timer:cycle-changed event received');
		//console.log('current second changed to ' + data.time);
		if ( (data.time < 4) && ($scope.stateName === 'rest') ){
			//console.log('one of the last three seconds');
			//playSound(hintSoundRange);
			playSound('count'+data.time); // "3", "2", or "1"
		}

		//console.log('ians-timer:cycle-changed end' + data.cycle);
	});

	$scope.$watch('data.totalSeconds', function() {
		$scope.data.cycle = updateCycle(+$scope.data.workSeconds, +$scope.data.restSeconds);
		//console.log('data.totalSeconds got an update');
		//$scope.data.totalSeconds = ($scope.data.workSeconds + $scope.data.restSeconds) * $scope.data.numReps;
	});
});
