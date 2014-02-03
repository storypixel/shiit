'use strict';

angular.module('shiitApp')
.controller('HiitCtrl', function ($state, $scope, $http, HiitData) {
	$http.get('/api/awesomeThings').success(function(awesomeThings) {
		$scope.awesomeThings = awesomeThings;
	});
	
	// console.log('ok');
	console.log(HiitData);

	$scope.data = HiitData.durationData();

	var limitRange = function (a, b) {
			return function (n) {
				if (n < a) {
					return a;
				}
				if (n > b) {
					return b;
				}
				return n;
			};
		},
		workLimit = limitRange(5, 120),
		restLimit = limitRange(0, 60),
		repsLimit = limitRange(1, 40);

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

	// $scope.$watch('[data.workSeconds, data.restSeconds, data.numReps]', function() {
	// 	$scope.data.totalSeconds = ($scope.data.workSeconds + $scope.data.restSeconds) * $scope.data.numReps;
	// });
});
