'use strict';

angular.module('shiitApp')
.controller('HiitCtrl', function ($state, $scope, HiitData) {
	// $http.get('/api/awesomeThings').success(function(awesomeThings) {
	// 	$scope.awesomeThings = awesomeThings;
	// });
	
	// console.log('ok');
	//console.log(HiitData);

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
			{'name' : 'work', 'value' : workTime},
			{'name' : 'rest', 'value' : restTime}
		];
	}

	var workLimit = limitRange(5, 120),
		restLimit = limitRange(0, 60),
		repsLimit = limitRange(1, 40);


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
		console.log('current round changed to ' + data.round);
		$scope.stateName = data.cycle;
		$scope.currentRound = data.round;
		//console.log('ians-timer:cycle-changed end' + data.cycle);
	});

	// $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
	// 	// console.log('state change started');
	// 	// console.log(event);
	// 	// console.log(toState);
	// 	// console.log(toParams);
	// 	// console.log(fromState);
	// 	// console.log(fromParams);
	// 	// console.log('state change ended');
	// });

	$scope.$watch('data.totalSeconds', function() {
		$scope.data.cycle = updateCycle($scope.data.workSeconds, $scope.data.restSeconds);
		//$scope.data.totalSeconds = ($scope.data.workSeconds + $scope.data.restSeconds) * $scope.data.numReps;
	});
});
