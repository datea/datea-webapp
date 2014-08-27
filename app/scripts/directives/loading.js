angular.module("dateaWebApp")
.directive("daLoading", function() {
	return {
		 restrict    : "A"
		,scope: {
			daLoading  : '='
		}

		,link: function (scope, element, attrs) {

			scope.$watch('daLoading', function (){
				console.log("DA LOADING", scope.daLoading);
				if (scope.daLoading) {
					element.addClass('datea-loading');
				}else {
					element.removeClass('datea-loading');
				}
			})
			element.append('<div class="datea-loading-icon"><i class="fa fa-circle-o-notch fa-spin"></i></div>');
		}
	}
} );
