'use strict';

angular.module('dateaWebApp')
.filter('imgFromApi',
[ 'config'
,function (
  config
) {
	// var url = config.api.url.replace(/\/$/, "");
	var url = 'http://datea.pe';
	return function (input) {
		return input && url + input;
	};
}]);
