angular.module("dateaWebApp")
	.directive("daFlag", ['Api', 'User', '$location', 'localStorageService', function(Api, User, $location, localStorageService) {
		return {
		 restrict    : "E"
		,templateUrl : "/views/flag-button.html"
		,replace		 : true
		,scope: {
			  flagId    	: '='
			, flagObjType	: '@'
		}

		, controller: function ($scope, $element, $attrs) {

			var flagId
				, flagObjType
				, nextURL
				, ls
			;

			ls = localStorageService;

			$scope.flow = {};
			$scope.flow.flagLabel = 'denunciar';
			$scope.flow.isFlagged = false

			$scope.$watch('flagId', function () {
				if ($scope.flagId) flagId = $scope.flagId;
				$scope.flow.flagLabel = 'denunciar';
				$scope.flow.isFlagged = false;
			});

			$attrs.$observe('flagObjType', function () {
				if ($attrs.flagObjType) flagObjType = $attrs.flagObjType;
			});

			$scope.flow.doFlag = function () {

				if ( !User.isSignedIn()) {
					nextURL = $location.path();
					ls.set( 'nextURL', { path: nextURL, count: 0 } );
					$location.path('/registrate');

				} else if (!$scope.flow.isFlagged) {
					$scope.flow.flagLabel = 'cargando...';
					Api.flag
					.doFlag( { content_type : flagObjType
					         , object_id    : flagId } )
					.then( function ( response ) {
						console.log( 'flag', flagObjType, flagId );
						$scope.flow.flagLabel = 'denunciado!';
						$scope.flow.isFlagged = true;
					}, function ( reason ) {
						console.log( reason );
						$scope.flow.flagLabel = 'denunciar';
					} );
				}
			}
  	}
  }
} ] );
