'use strict';

angular.module('dateaWebApp')
.directive('fileread', [
  '$rootScope'
, 'config'
, function (
  $rootScope
, config
) {
	return {
		scope: { fileread: "=",
			filedata: "="
		},
		link: function (scope, element, attributes) {
			element.bind("change", function (changeEvent) {
				var reader = new FileReader();
				reader.onload = function (loadEvent) {
					scope.$apply(function () {
						scope.fileread = loadEvent.target.result;
						scope.filedata = changeEvent.target.files[0];
						$rootScope.$broadcast( 'datea:fileLoaded', { data: changeEvent.target.files[0], file: loadEvent.target.result } );
					});
				}
				reader.readAsDataURL(changeEvent.target.files[0]);
			});
		}
	}
} ] );
