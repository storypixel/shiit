'use strict';

angular.module('shiitApp')
.controller('HiitWorkCtrl', function ($state, $scope, $http) {
	$http.get('/api/awesomeThings').success(function(awesomeThings) {
		$scope.awesomeThings = awesomeThings;
	});

	var localStateName = 'ready';

	$scope.timerRunning = false;
	$scope.$parent.stateName = localStateName;

	$scope.startCountdown = function (){
		console.log('starting startCountdown');
		$scope.$broadcast('ians-timer:start');
	};

	$scope.startTimer = function (){
		$scope.$broadcast('ians-timer:start');
	};

	$scope.stopTimer = function (){
		$scope.$broadcast('ians-timer:stop');
	};
	
	/// $scope.timerConsole = 'waiting...';

	$scope.$on('ians-timer:stopped', function () {
		$scope.timerRunning = false;
		// $scope.digest();		
	});

	$scope.$on('ians-timer:started', function () {
		$scope.timerRunning = true;
		// $scope.digest();
	});

	// the data sucks. get better data
	$scope.$on('ians-timer:error-data', function () {
		$state.transitionTo('hiit.calibrate');
		// $scope.digest();
	});

	//$scope.stateClass = $scope.$parent.defaultStateClass;
	$scope.$on('$viewContentLoaded', function(/*event, viewConfig*/){
		console.log('hiit-work view was loaded');
		$scope.$parent.stateName = localStateName;
		$scope.startTimer();
		// Access to all the view config properties.
		// and one special property 'targetView'
		// viewConfig.targetView 
	});

});
