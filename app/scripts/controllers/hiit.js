'use strict';

angular.module('shiitApp')
.controller('HiitCtrl', function ($state, $scope, $timeout, HiitData, localStorageService) {
	var playSound = function(id){ return id && undefined; },
	pauseSound = function(){},
	aPhrase = function(){},
	sounds,
	speechEnabled = false,
	speech = ('speechSynthesis' in window);

	// second clause added to allow work in FireFox
	// temporarily disabling speech
	if (speechEnabled && speech && window.SpeechSynthesisUtterance) {
		aPhrase = function(){
			var possibilities = [
				'That was awesome work.',
				'You are a beast.',
				'You totally owned it.',
				'Beast mode.',
				'Unstoppable.',
				'Strawberry? What about raw berry.'
			];
			return possibilities[Math.floor(Math.random() * possibilities.length)];
		};

		// Synthesis support. Make your web apps talk!
		var soundNewRound = new window.SpeechSynthesisUtterance('Go!'),
			soundRest = new window.SpeechSynthesisUtterance('Rest!'),
			soundFinished = new window.SpeechSynthesisUtterance('Workout complete. Congratulations! ' + aPhrase()),
			soundQuitting = new window.SpeechSynthesisUtterance('You are kidding me.'),
			soundReady = new window.SpeechSynthesisUtterance('Get Ready!'),
			soundGoTime = new window.SpeechSynthesisUtterance('Get Ready!'),
			soundThree = new window.SpeechSynthesisUtterance('Three'),
			soundTwo = new window.SpeechSynthesisUtterance('Two'),
			soundOne = new window.SpeechSynthesisUtterance('One'),
			soundError = new window.SpeechSynthesisUtterance('Ah Damn');

		sounds = {
			'rest' : soundRest,
			'quitting' : soundQuitting,
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
			console.log('looking at '+id);
			window.speechSynthesis.speak(sounds[id] || soundError);
		};
	} else {
		var masterSound = new window.buzz.sound( 'sounds/master', { formats: [ 'mp3' ] }),
			hintSoundRange = [10, 13], // 3 second count
			roundStartSoundRange = [2, 4],
			roundEndSoundRange = [4, 6],
			doneSoundRange = [8, 10],
			soundPromise;

		sounds = {
			'rest' : roundEndSoundRange,
			'quitting' : roundEndSoundRange,
			'work' : roundStartSoundRange,
			'ready': hintSoundRange,
			'finished' : doneSoundRange,
			 'count3' : hintSoundRange,
			 //'count2' : hintSoundRange,
			//'count1' : hintSoundRange,
			'gotime' : hintSoundRange
		};

		playSound = function (id){
			var range = sounds[id];
			if (!range){ return; }
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
			masterSound.pause();
			soundPromise = undefined;
		};
	}

	//localStorageService.clearAll();
	if (!localStorageService.get('HiitData')){
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
		//
		var o = [
			{'name' : 'work', 'value' : +workTime}, // convert to number with +
			{'name' : 'rest', 'value' : +restTime}
		];
		//console.log(o);
		return o;
	}

	function save(){
		if (localStorageService.get('HiitData')){
			localStorageService.set('HiitData', JSON.stringify($scope.data));
		}
	}

	var workLimit = limitRange(5, 180),
		restLimit = limitRange(0, 60),
		repsLimit = limitRange(1, 90),
		progressLineLength = 416;

	$scope.showNext = false;
	$scope.showPrevious = false;
	$scope.progressStyle = {'stroke-dashoffset': 0};

	$scope.goToWork = function(){
		playSound('gotime'); // "3", "2", or "1"
		$state.transitionTo('hiit.work');
	};

	$scope.quit = function(){
		playSound('quitting'); // "3", "2", or "1"
		$state.transitionTo('hiit.calibrate');
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
		//console.log($scope.stateName);
		if ( (data.displayTime < 4) && ( ($scope.stateName === 'rest') || ($scope.stateName === 'work') ) ){
			playSound('count'+data.displayTime); // "3", "2", or "1"
		}
		$scope.data.currentSecond = data.displayTime;
		// show next if there are more rounds to go
		$scope.showNext = $scope.currentRound < $scope.data.numReps;
		// show previous if this isn't the ready countdown AND if we aren't at the very beginning second
		$scope.showPrevious = ($scope.stateName !== 'ready') && (data.time !== $scope.data.totalSeconds);
		//console.log('time is ' + data.time);
		$scope.progress = ($scope.stateName !== 'ready') ? ( (data.time - $scope.data.restSeconds) / ($scope.data.totalSeconds - $scope.data.restSeconds) ) : 0;
		$scope.progressStyle = {'stroke-dashoffset': progressLineLength * $scope.progress};

		save();
	});

	$scope.$watch('data.totalSeconds', function() {
		$scope.data.cycle = updateCycle(+$scope.data.workSeconds, +$scope.data.restSeconds);
		save();
	});
});
