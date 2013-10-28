'use strict';

angular.module( 'dateaWebApp' )
	.directive( 'wxValidate', [ function () {
		var link
		  , ret
		  ;

		link = function postLink( scope, element, attrs, ctrl ) {
			ctrl.$parsers.unshift( function ( val ) {
				var pattern;

				pattern = new RegExp( attrs.pattern, 'i' );

				scope.validPattern = pattern.test( val ) ? 'valid' : undefined;
				if ( scope.validPattern ) {
					ctrl.$setValidity( attrs.wxValidate, true );
					return val;
				} else {
					ctrl.$setValidity( attrs.wxValidate, false );
					return undefined;
				}

			} );
		}

		ret = { require  : 'ngModel'
		      , restrict : 'A'
		    	, link     : link }

		return ret;
} ] );
