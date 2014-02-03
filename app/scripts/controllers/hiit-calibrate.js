'use strict';

angular.module('shiitApp')
.controller('HiitCalibrateCtrl', function ($scope, $http) {
	$http.get('/api/awesomeThings').success(function(awesomeThings) {
		$scope.awesomeThings = awesomeThings;
	});

	$scope.$on('timer-stopped', function (event, data){
		console.log('Timer Stopped - data = ', data);
	});
});
