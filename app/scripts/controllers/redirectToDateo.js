'use strict';

angular.module('dateaWebApp')
.controller('RedirectToDateoCtrl'
, [ '$scope'
	, '$routeParams'
	, 'Api'
	, 'config'
	, '$location'
, function (
		$scope
	, $routeParams
	, Api
	, config
	, $location
 ) {
	if ($routeParams.dateoId) {
		Api.dateo
		.getDateos({id: $routeParams.dateoId})
		.then(function (response) {
			var dateo;
			if (response.objects.length) {
				dateo = response.objects[0];
				$location.path('/'+dateo.user.username+'/dateos/'+dateo.id).replace();
			}else {
				$location.path('/404').replace();
			}
		}, function (reason) {
			if ( reason.status === 404 ) {
				$location.path('/404').replace();
			}
		});
	}
} ] );
