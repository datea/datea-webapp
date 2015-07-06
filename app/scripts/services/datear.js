'use strict';

angular.module('dateaWebApp')
.service('Datear', [
  'config'
, '$modal'  
, function Api(
  config
, $modal
) {

	var datearContext = {};

	return {

		open: function (ctx) {

			if (ctx) {
				if ($.isEmptyObject(ctx)) {
					datearContext = {};
				}else{
					datearContext = ctx;
				}
			}

			$modal.open( { templateUrl : 'views/datear.html'
		             , controller  : 'DatearCtrl'
		             , windowClass : 'datear-modal'
		             , backdrop    : 'static'
		             , resolve     : {
		                datearModalGivens : function () { return datearContext; }
		                }
		            } );
		}
		, setContext: function (ctx) {
			datearContext = ctx;
		}
		, resetContext: function () {
			datearContext = {};
		}
	};
} ] );
