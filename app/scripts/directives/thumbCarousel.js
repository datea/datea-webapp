'use strict';

angular.module('dateaWebApp')
.directive('daThumbCarousel', [
	function ( ) {
	return {
		link: function (scope, element, attributes) {
			console.log($element.width());
		}
	}
} ] );
