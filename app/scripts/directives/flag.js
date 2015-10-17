angular.module("dateaWebApp")
	.directive("daFlag", ['Api', 'User', '$location', 'localStorageService', '$modal', function(Api, User, $location, localStorageService, $modal) {
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
				, ctx
			;

			ls = localStorageService;

			$scope.flow = {};
			$scope.flow.isFlagged = false

			$scope.$watch('flagId', function () {
				if ($scope.flagId) flagId = $scope.flagId;
				$scope.flow.isFlagged = false;
			});

			$attrs.$observe('flagObjType', function () {
				if ($attrs.flagObjType) flagObjType = $attrs.flagObjType;
			});


			$scope.flow.openModal = function () {

				if ($scope.flow.isFlagged) return;

				if ( !User.isSignedIn()) {
					nextURL = $location.path();
					ls.set( 'nextURL', { path: nextURL, count: 0 } );
					$location.path('/registrate');

				} else {

					ctx = {
						  flagObjType : flagObjType
						, flagId      : flagId
					};

					$modal.open( { templateUrl : 'views/flag-form.html'
		             , controller  : 'FlagFormCtrl'
		             , windowClass : 'flag-modal'
		             //, backdrop    : 'static'
		             , resolve     : {
		                flagModalGivens : function () { return ctx; }
		             }
		      })
		      .result.then( function () {
         		$scope.flow.isFlagged = true;
		      });
				}
			}
  	}
  }
} ] );
