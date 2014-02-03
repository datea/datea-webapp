'use strict';

angular.module('dateaWebApp')
.directive('bgFromApi',
[ 'config'
, function (
  config
) {
	return {
		restrict: 'A',
		link: function postLink(scope, element, attrs) {
			var img = attrs.bgFromApi ? config.api.imgUrl + attrs.bgFromApi : 'http://lorempixel.com/160/150/cats/';
			element.css( { 'background': 'url('+img+') no-repeat'
			             , 'background-size': 'cover'
			             } );
		}
	};
}]);
