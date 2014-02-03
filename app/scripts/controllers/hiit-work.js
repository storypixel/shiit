'use strict';

angular.module('shiitApp')
.controller('HiitWorkCtrl', function ($scope, $http) {
	$http.get('/api/awesomeThings').success(function(awesomeThings) {
		$scope.awesomeThings = awesomeThings;
	});

	$scope.timerRunning = false;

	$scope.startTimer = function (){
		$scope.$broadcast('timer-start');
		$scope.timerRunning = true;
	};

	$scope.stopTimer = function (){
		$scope.$broadcast('timer-stop');
		$scope.timerRunning = false;
	};

	$scope.pauseTimer = function (){
		$scope.$broadcast('timer-pause');
		$scope.timerRunning = false;
	};

	$scope.resumeTimer = function (){
		$scope.$broadcast('timer-resume');
		$scope.timerRunning = true;
	};
	
	$scope.add5Seconds = function () {
		$scope.$broadcast('timer-add-cd-seconds', 5);
	};

	$scope.timerConsole = 'waiting...';
	$scope.$on('timer-stopped', function (event, args) {
		$scope.timerConsole += 'stopped';
		console.log('-v-');
		console.log(event);
		console.log(args);
		console.log('-0-');
		$scope.digest();
		//+= ' - event.name = '+ event.name + ', timeoutId = ' + args.timeoutId + ', millis = ' + args.millis +'\n';
	});
});
