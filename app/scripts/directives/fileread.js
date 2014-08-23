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
		scope: { 
				fileread: "="
			, filedata: "="
		},
		link: function (scope, element, attributes) {
			element.bind("change", function (changeEvent) {
				var reader = new FileReader()
					, args
				;
				reader.onload = function (loadEvent) {
					scope.$apply(function () {
						scope.fileread = loadEvent.target.result;
						scope.filedata = changeEvent.target.files[0];
						args = { data: changeEvent.target.files[0], file: loadEvent.target.result }
						if (element[0].id) args.id = element[0].id;
						$rootScope.$broadcast( 'datea:fileLoaded',args);
					});
				}
				reader.readAsDataURL(changeEvent.target.files[0]);
			});
		}
	}
} ] );
