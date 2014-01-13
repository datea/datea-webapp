'use strict';

// credits: http://rogeralsing.com/2013/08/26/angularjs-directive-to-check-that-passwords-match-followup/

angular.module('dateaWebApp')
.directive('wxPasswordMatch', [function () {
	return {
		restrict: 'A',
		scope:true,
		require: 'ngModel',
		link: function (scope, elem , attrs,control) {
			var checker = function () {
				var e1 = scope.$eval(attrs.ngModel);
				var e2 = scope.$eval(attrs.wxPasswordMatch);
				return e1 == e2;
			};
			scope.$watch(checker, function (n) {
				control.$setValidity("unique", n);
			});
		}
	};
}]);
