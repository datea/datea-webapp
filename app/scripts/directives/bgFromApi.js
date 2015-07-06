'use strict';

angular.module('dateaWebApp')
.directive('daBgFromApi', 
['config'
, function (
	config
) {
	return {
		restrict: "A",
		scope: {
			daImgSize      : '@',
			daImgPosition  : '@',
			daImgRepeat    : '@',
			daImgType      : '@'
		},
		link: function postLink(scope, element, attrs) {
			var img_url
				, default_img_url
				, setImg
				;
			
			var img_size = angular.isDefined(attrs.daImgSize) ? attrs.daImgSize : 'auto';
			var img_pos  = angular.isDefined(attrs.daImgPosition) ? attrs.daImgPosition : 'center center';
			var img_repeat = angular.isDefined(attrs.daImgRepeat) ? attrs.daImgRepeat : 'no-repeat';
			var img_type = angular.isDefined(attrs.daImgType) ? attrs.daImgType : 'campaign';

			switch (img_type) {
				case 'campaign':
					default_img_url = config.defaultImgCampaign;
					break;
				case 'campaign-lg':
					default_img_url = config.defaultImgCampaignLarge;
					img_size = 'auto';
					break;
				case 'user':
					default_img_url = config.defaultImgProfile;
					break;
				case 'user-bg':
					default_img_url = config.defaultImgBackground;
					break;
				default:
					default_img_url = config.defaultImgCampaign;
			}

			setImg = function() {
				if (attrs.daBgFromApi) {
					img_url = config.api.imgUrl + attrs.daBgFromApi;
				}else{
					img_url = default_img_url; 
				}
				if (img_type === 'campaign-lg') {
					img_size = (attrs.daBgFromApi) ? attrs.daImgSize : 'auto';
				}
			}

			attrs.$observe('daBgFromApi', function () {
				setImg();
				element.css({
					 'background-image'   : 'url('+img_url+')'
					,'background-size'    : img_size
					,'background-repeat'  : img_repeat
			  	,'background-position': img_pos 
				})
			});

 		}
	}
} ] );

