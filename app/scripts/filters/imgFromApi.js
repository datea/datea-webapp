'use strict';

angular.module('dateaWebApp')
.filter('imgFromApi',
[ 'config'
,function (
  config
) {
	return function (input) {
		return input ? config.api.imgUrl + input : config.defaultImgProfile;
	};
}]);
