'use strict';

angular.module('dateaWebApp')
.controller('DatearCtrl',
[ '$scope'
, '$modalInstance'
, 'geolocation'
, function (
  $scope
, $modalInstance
, geo
) {
$scope.datear = {};

$scope.datear.ok = function () {
	// $modalInstance.close($scope.selected.item);
	$modalInstance.dismiss('cancel');
};

$scope.datear.cancel = function () {
	$modalInstance.dismiss('cancel');
};

geo.getLocation().then( function ( data ) {
	var leaflet;
	leaflet = { center : { lat  : data.coords.latitude
	                     , lng  : data.coords.longitude
	                     , zoom : 10
	                     }
	          , markers : { draggy : { lat : data.coords.latitude
	                                 , lng : data.coords.longitude
	                                 , draggable : true
	                                 }
	                      }
	          }

	angular.extend( $scope, leaflet );

} )

angular.extend( $scope, { center   : { lat: -12.05, lng: -77.06, zoom: 10 }
                        , defaults : { scrollWheelZoom: false }
                        // , markers  : { draggy : { lat: -12.05, lng: -77.06, draggable: true } }
                        , markers  : {}
                        } );

}]);
