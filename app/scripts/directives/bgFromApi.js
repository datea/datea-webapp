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
			var img
			  , setImg
			  ;

			setImg = function () {
				img = attrs.bgFromApi ? config.api.imgUrl + attrs.bgFromApi : 'http://lorempixel.com/160/150/cats/';
			}

			attrs.$observe( 'bgFromApi', function () {
				// img = attrs.bgFromApi ? config.api.imgUrl + attrs.bgFromApi : 'http://lorempixel.com/160/150/cats/';
				setImg();
				element.css( { 'background': 'url('+img+') no-repeat'
				             , 'background-size': 'cover'
				             } );
			} )
		}
	};
}]);
