'use strict';

angular.module('dateaWebApp')
.directive('scrollto', [
  'config'
, function (
  config
) {
	return {
		link: function (scope, element, attributes) {
			var pos
			  , container
			  , target
			  , givens
			  , $container
			  , $target
			  ;

			givens    = scope.$eval( attributes.scrollto );
			pos       = givens.pos
			container = givens.container
			target    = givens.target

			element.bind( 'click', function () {
				$container = $(container);
				$container.animate( { scrollTop: $(target+pos).offset().top - 50 } );
			} );
		}
	}
} ] );