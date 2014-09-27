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

		, controller: function ($scope, $element, $attrs) {

			$scope.btnLabel = $attrs.btnText !== undefined ? $attrs.btnText : 'datea ';
			$scope.btnClass = $attrs.btnClass !== undefined ? $attrs.btnClass : '';

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

