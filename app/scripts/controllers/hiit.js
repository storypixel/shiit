'use strict';

angular.module('shiitApp')
.controller('HiitCtrl', function ($state, $scope, $timeout, HiitData, localStorageService) {
	var playSound = function(id){ return id && undefined; },
	pauseSound = function(){},
	aPhrase = function(){},
	sounds,
	speech = ('speechSynthesis' in window);

	// second clause added to allow work in FireFox
	if (speech && window.SpeechSynthesisUtterance) {
		aPhrase = function(){
			return 'That was awesome work.';
		};
				
		// Synthesis support. Make your web apps talk!
		var soundNewRound = new window.SpeechSynthesisUtterance('Go!'),
			soundRest = new window.SpeechSynthesisUtterance('Rest!'),
			soundFinished = new window.SpeechSynthesisUtterance('Workout complete. Congratulations! ' + aPhrase()),
			soundReady = new window.SpeechSynthesisUtterance('Get Ready!'),
			soundGoTime = new window.SpeechSynthesisUtterance('Get Ready!'),
			soundThree = new window.SpeechSynthesisUtterance('Three'),
			soundTwo = new window.SpeechSynthesisUtterance('Two'),
			soundOne = new window.SpeechSynthesisUtterance('One'),
			soundError = new window.SpeechSynthesisUtterance('Ah Damn');

		sounds = {
			'rest' : soundRest,
			'work' : soundNewRound,
			'ready': soundReady,
			'finished' : soundFinished,
			'gotime' : soundGoTime,
			'count3' : soundThree,
			'count2' : soundTwo,
			'count1' : soundOne
		};
		// play speech synthesis sounds
		playSound = function (id) {
			window.speechSynthesis.speak(sounds[id] || soundError);
		};
	} else {
		var masterSound = new window.buzz.sound( 'sounds/master', { formats: [ 'mp3' ] }),
			hintSoundRange = [3, 4],
			roundStartSoundRange = [0, 2.8],
			roundEndSoundRange = [10, 11],
			doneSoundRange = [6, 8],
			soundPromise;

		sounds = {
			'rest' : roundEndSoundRange,
			'work' : roundStartSoundRange,
			'ready': hintSoundRange,
			'finished' : doneSoundRange,
			'count3' : hintSoundRange,
			'count2' : hintSoundRange,
			'count1' : hintSoundRange,
			'gotime' : hintSoundRange
		};

		playSound = function (id){
			var range = sounds[id] || sounds.count3;
			if ( angular.isDefined(soundPromise) ){
				$timeout.cancel(soundPromise);
			}
			var startTime = range[0],
				endTime = range[1],
				ms = 1000 * (endTime - startTime);
			// play a sound
			masterSound.setTime(startTime).play();
			// stop it after a time
			soundPromise = $timeout(pauseSound, ms);
		};
		//other sounds
		pauseSound = function(){
			//masterSound.pause();
			soundPromise = undefined;
		};
	}

	if (localStorageService.get('HiitData') === null){
		localStorageService.set('HiitData', JSON.stringify(HiitData.durationData()));
	}

	$scope.data = localStorageService.get('HiitData');

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
		//console.log('updating cycle');
		var o = [
			{'name' : 'work', 'value' : +workTime}, // convert to number with +
			{'name' : 'rest', 'value' : +restTime}
		];
		//console.log(o);
		return o;
	}

	var workLimit = limitRange(5, 180),
		restLimit = limitRange(0, 60),
		repsLimit = limitRange(1, 90);

	$scope.goToWork = function(){
		playSound('gotime'); // "3", "2", or "1"		
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
		$scope.currentRound = data.round;
		if (data.cycle === 'work'){
			playSound('work');
		} else {
			if (data.round >= $scope.data.numReps){
				$scope.$broadcast('ians-timer:reset');
				$scope.stateName = 'finished';
				//playSound('finished');
				return;
			}
			playSound('rest');


		}
		$scope.stateName = data.cycle;
	});

	// whenever it goes from rest to work or vice versa...
	$scope.$on('ians-timer:finished', function () {
		playSound('finished');
	});

	// whenever it goes from rest to work or vice versa...
	$scope.$on('ians-timer:tick', function (event, data) {
		if ( (data.time < 4) && ($scope.stateName === 'rest') ){
			playSound('count'+data.time); // "3", "2", or "1"
		}
	});

	$scope.$watch('data.totalSeconds', function() {
		angular.extend($scope.data.cycle, updateCycle(+$scope.data.workSeconds, +$scope.data.restSeconds));
		localStorageService.set('HiitData', JSON.stringify($scope.data));
	});
});
