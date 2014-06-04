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
				img = attrs.bgFromApi ? config.api.imgUrl + attrs.bgFromApi : config.defaultImgCampaign;
			}

			attrs.$observe( 'bgFromApi', function () {
				// img = attrs.bgFromApi ? config.api.imgUrl + attrs.bgFromApi : 'http://lorempixel.com/160/150/cats/';
				setImg();
				element.css( { 'background': '#ebefee url('+img+') no-repeat center center'
				             //, 'background-size': 'cover'
				             } );
			} )
		}
	};
}])
.directive('bgFromApiWide',
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
				img = attrs.bgFromApi ? config.api.imgUrl + attrs.bgFromApi : config.defaultImgBackground;
			}

			attrs.$observe( 'bgFromApiWide', function () {
				// img = attrs.bgFromApi ? config.api.imgUrl + attrs.bgFromApi : 'http://lorempixel.com/160/150/cats/';
				setImg();
				element.css( { 'background': 'url('+img+') repeat-x center center'} );
			} )
		}
	};
}])
;
