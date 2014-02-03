'use strict';

angular.module('shiitFilters', [])
.filter('padWithZeros', function() {
	return function(input) {
		return ((input < 10) ? ('0' + input) : input);
	};
})
.filter('digitalTime', function(padWithZerosFilter) {
  // puts seconds 61 into time format 1:01
	return function(secs) {
		var m = Math.floor(secs/60),
			s = padWithZerosFilter(secs % 60);
		return (m + ':' + s);
	};
});