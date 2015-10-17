angular.module("dateaWebApp")
.directive("datearBtn", [
	'Datear' 
,	'User' 
,	'$location' 
,	'localStorageService'
,   '$translate'
, function(
	  Datear
	, User
	, $location
	, localStorageService
	, $translate
) {
		return {
		  restrict    : "E"
		, templateUrl : "/views/datear-button.html"
		, replace		 : true

		, controller: function ($scope, $element, $attrs) {

			$translate('DATEAR').then(function (t) {
				$scope.btnLabel = $attrs.btnText !== undefined ? $attrs.btnText : t+' ';
			});
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

