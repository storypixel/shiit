'use strict';

angular.module('shiitApp')
.controller('HiitWorkCtrl', function ($state, $scope) {
	// $http.get('/api/awesomeThings').success(function(awesomeThings) {
	// 	$scope.awesomeThings = awesomeThings;
	// });

	var localStateName = 'ready';

	$scope.timerRunning = false;
	$scope.$parent.stateName = localStateName;

	// Makethe timer start counting now
	$scope.startTimer = function (){
		$scope.$broadcast('ians-timer:start');
	};

	// Make the timer stop counting now
	$scope.stopTimer = function (){
		$scope.$broadcast('ians-timer:stop');
	};
	
	// Heard when the timer has stopped or paused (same)
	$scope.$on('ians-timer:stopped', function () {
		$scope.timerRunning = false;
		// $scope.digest();		
	});

	// Heard when the timer has started or resumed (same)
	$scope.$on('ians-timer:started', function () {
		$scope.timerRunning = true;
		// $scope.digest();
	});

	// the data sucks. get better data. send them to calibrate page to formulate that data
	$scope.$on('ians-timer:error-data', function () {
		$state.transitionTo('hiit.calibrate');
		// $scope.digest();
	});

	//$scope.stateClass = $scope.$parent.defaultStateClass;
	$scope.$on('$viewContentLoaded', function(/*event, viewConfig*/){
		//console.log('hiit-work view was loaded');
		$scope.$parent.stateName = localStateName;
		console.log('inspecting data cycle stuff');
		console.log($scope.$parent.data.cycle);
		$scope.startTimer();
		// Access to all the view config properties.
		// and one special property 'targetView'
		// viewConfig.targetView 
	});

});
