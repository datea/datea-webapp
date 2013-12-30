'use strict';

angular.module('dateaWebApp')
.service( 'wxAlert', function wxAlert() {
	var wxAlert = {}
	  , alerts  = []
	  , lescope
	  ;

	wxAlert.init = function ( alerts, scope ) {
		lescope  = scope;
		alerts = alerts;
	}

	wxAlert.closeAlert = function ( index ) {
		alerts.splice(index, 1);
		console.log( alerts );
	}

	wxAlert.addAlert = function ( givens ) {
		return $scope.alerts.push( givens ) - 1;
	}

	return wxAlert;
});
