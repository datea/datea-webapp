angular.module("dateaWebApp")
.directive("daRedateo", 
[
  'Api'
, 'User'
, '$location'
, 'localStorageService'
, function (
	  Api
	, User
	, $location
	, localStorageService
) {
	
	return {
		  restrict    : "E"
		, templateUrl : "/views/redateo-button.html"
		, replace		  : true
		, scope: {
			   btnClass  		   : '@'
		   , dateo  		     : '='
		   , redateoCallback : '=?'
		}
		, controller : function ($scope, $element, $attrs) {

			var checkHasRedateado
				, mouseHasLeft
				, ls = localStorageService
				, nextURL
			;

			$scope.redateo           = {};
			$scope.flow              = {};
			$scope.flow.isActive     = false;
			$scope.flow.loading      = false;
			$scope.flow.disabled     = true;
			$scope.flow.hoverEnabled = false;

			$scope.$watch('dateo.id', function () {
				if ($scope.dateo && $scope.dateo.id) {
					if (User.data.id === $scope.dateo.user.id) {
						$scope.flow.hoverEnabled = true;
						$scope.flow.disabled = true;
					}else{
						checkHasRedateado();
					}
				}
			});

			checkHasRedateado = function () {
				if (User.isSignedIn()) {
					Api.redateo
					.getList( { user : User.data.id, dateo : $scope.dateo.id } )
					.then( function ( response ) {
						$scope.flow.disabled =  false;
						$scope.flow.isActive = response.meta.total_count ? true : false;
						$scope.flow.hoverEnabled = true;
						if (response.objects.length) $scope.flow.redateo = response.objects[0];
					}, function ( reason ) {
						console.log( reason );
						$scope.flow.disabled  = false;
						$scope.flow.hoverEnabled = true;
					} )
				}else{
					$scope.flow.disabled = false;
					$scope.flow.hoverEnabled = true;
				}
			}

			$scope.flow.doRedateo = function () {
				if (!User.isSignedIn()) {
					nextURL = $location.path();
					ls.set( 'nextURL', { path: nextURL, count: 0 } );
					$location.path('/registrate');
					return;
				}
				if ( !$scope.flow.loading && !$scope.flow.disabled) {
					$scope.flow.loading = true;
					$scope.flow.hoverEnabled = false;
					mouseHasLeft = false;
					// POST
					if (!$scope.flow.isActive) {
						Api.redateo
						.post( { user : User.data.id, dateo : $scope.dateo.id } )
						.then( function ( response ) {
							$scope.dateo.redateo_count++;
							if (typeof($scope.redateoCallback) != 'undefined') $scope.redateoCallback(response, 'post');
							$scope.flow.loading  = false;
							$scope.flow.isActive = true;
							$scope.flow.redateo = response;
							if (!mouseHasLeft) $scope.flow.hoverEnabled = false;
						}, function ( reason ) {
							console.log( reason );
							$scope.flow.loading = false;
							$scope.flow.hoverEnabled = true;
						} );
					// DELETE
					}else {
						Api.redateo
						.deleteList( { user : User.data.id, dateo : $scope.dateo.id, id: $scope.flow.redateo.id } )
						.then( function ( response ) {
							$scope.dateo.redateo_count--;
							if (typeof($scope.redateoCallback) != 'undefined') $scope.redateoCallback(response, 'delete');
							$scope.flow.loading  = false;
							$scope.flow.isActive = false;
							$scope.flow.redateo = null;
							if (!mouseHasLeft) $scope.flow.hoverEnabled = false;
						}, function ( reason ) {
							console.log( reason );
							$scope.flow.loading = false;
							$scope.flow.hoverEnabled = true;
						} );
					}
				} 
			}

			$scope.flow.onMouseLeave = function () {
				//if ($scope.flow.loading === false) {
					mouseHasLeft = true;
					$scope.flow.hoverEnabled = true;
				//}
			}

		}
	}
} ] );
