'use strict';

angular.module('dateaWebApp')
.controller('DatearCtrl',
[ '$scope'
, '$modalInstance'
, 'geolocation'
, '$http'
, '$rootScope'
, 'config'
, function (
  $scope
, $modalInstance
, geo
, $http
, $rootScope
, config
) {
	var headers
	  , dateo = {}
	  , alertIndexes = {}
	  ;

headers = { 'Authorization'  : 'Apikey root:106b7be6c0028671fa6e2d57209f53ad42e14a20'
          }

$scope.datear = {};
$scope.dateo  = {};

$scope.alerts = [];

$scope.closeAlert = function ( index ) {
	$scope.alerts.splice(index, 1);
}

$scope.addAlert = function ( givens ) {
	return $scope.alerts.push( givens ) - 1;
}

$rootScope.$on( 'dateo:imgLoaded', function ( ev, givens ) {
	if ( givens.data.size > config.dateo.sizeImgMax ) {
		alertIndexes.imgSize !== void 0 && $scope.closeAlert( alertIndexes.imgSize );
		alertIndexes.imgSize = $scope.addAlert( { type: 'danger', msg: config.dateo.sizeImgMaxMsg } );
	} else {
		alertIndexes.imgSize !== void 0 && $scope.closeAlert( alertIndexes.imgSize );
	}
} );

// /* Static alert close */
// $scope.closeAlert = function ( ev ) {
// 	var $this = angular.element( ev.srcElement );

// 	$this.parent().remove();
// }

// /* Harcoded data*/

// dateo.address   = 'Calle x 546';
// dateo.category  = '/api/v2/category/1/';
// dateo.content   = 'this is a test take six';
// dateo.position  = { coordinates : [ -77.027772, -12.121937 ]
//                   , type        : 'Point'
//                   }
// dateo.tags      = [ { tag : 'testTag' }
//                   , { tag          : 'Aaaa'
//                     , title        : 'aaaa'
//                     , dateo_count  : 0
//                     , description  : 'aaaa'
//                     , follow_count : 0
//                     , id           : 3
//                     , resource_uri : '/api/v2/tag/3/'
//                     }
//                   ]
// dateo.date      = new Date();
// dateo.user      = 1;

// $scope.dateo = dateo;

$scope.datear.ok = function () {
	// $modalInstance.close($scope.selected.item);
	$modalInstance.dismiss('cancel');
};

$scope.datear.cancel = function () {
	$modalInstance.dismiss('cancel');
};

$scope.datear.img = function () {
	var url = 'http://api.datea.pe/api/v2/dateo/?format=json';
	console.log( $scope.dateo.img );
	console.log( $scope.dateo.imgData )

	// dateo.images = [ { image : { name     : $scope.dateo.imgData.name
	//                            , data_uri : $scope.dateo.img
	//                            }
	//                  , order : 0
	//                  }
	//                ];

	// $http( { method  : 'post'
	//        , url     : url
	//        , headers : headers
	//        , data    : dateo
	//        } )
	// .then( function ( response ) {
	// 	console.log( 'Calling api.datea.pe: ', response );
	// } )
}

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

} );

angular.extend( $scope, { center   : { lat: -12.05, lng: -77.06, zoom: 10 }
                        , defaults : { scrollWheelZoom: false }
                        // , markers  : { draggy : { lat: -12.05, lng: -77.06, draggable: true } }
                        , markers  : {}
                        } );

} ] );
