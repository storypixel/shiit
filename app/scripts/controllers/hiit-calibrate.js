'use strict';

angular.module('shiitApp')
.controller('HiitCalibrateCtrl', function ($scope) {
	// $http.get('/api/awesomeThings').success(function(awesomeThings) {
	// 	$scope.awesomeThings = awesomeThings;
	// });

	var localStateName = 'calibrating';

	$scope.$on('timer-stopped', function (event, data){
		console.log('Timer Stopped - data = ', data);
	});

	//$scope.stateClass = $scope.$parent.defaultStateClass;
	$scope.$on('$viewContentLoaded', function(/*event, viewConfig*/){
		$scope.$parent.stateName = localStateName;
		// Access to all the view config properties.
		// and one special property 'targetView'
		// viewConfig.targetView 
	});


});
