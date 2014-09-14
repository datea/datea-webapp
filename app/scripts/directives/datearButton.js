angular.module("dateaWebApp")
.directive("datearBtn", [
	'Datear' 
,	'User' 
,	'$location' 
,	'localStorageService'
, function(
	  Datear
	, User
	, $location
	, localStorageService
) {
		return {
		  restrict    : "E"
		, templateUrl : "/views/datear-button.html"
		, replace		 : true
		, scope: {
			  btnClass : '@'
			, btnText  : '@'
			, context  : '='
		}

		, controller: function ($scope, $element, $attrs) {

			$attrs.$observe('context', function (context) {
				console.log("DATEAR CONTEXT", $scope.context);
				console.log($scope);
			});

			$scope.btnLabel = $attrs.btnText !== undefined ? $attrs.btnText : 'datea ';

			$scope.datear = function () {
				if (User.isSignedIn()) {
					Datear.open();
				}else{
					localStorageService.set( 'nextURL', { path: $location.path(), count: 0 } );
					$location.path('/registrate');
				}
			}
		}
	}
} ] );

