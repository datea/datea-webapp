angular.module("dateaWebApp")
.directive("daDateoDetailInline", 
[
	'$rootScope'
,	'$modal'
, 'User'
, 'Api'
,	function (
		$rootScope
	, $modal
	, User
	, Api
) {
	return {
			restrict    : "E"
		, templateUrl : "/views/dateo-detail-inline.html"
		, scope       : {
				dateo 			: '='
			, markerIndex	: '=?'
			, mapPresent  : '@'
		}
		, controller  : function ($scope, $element, $attrs) {
				
				var updateComments;

				$scope.dateo 								= {};
				$scope.comment 							= {}
				$scope.flow  								= {};
				$scope.flow.mapPresent      = ($attrs.mapPresent) ? $scope.$eval($attrs.mapPresent) : true;
				$scope.flow.isUserSignedIn  = User.isSignedIn();
				
				$attrs.$observe('dateo', function (dateo) {
    			if (angular.isDefined(dateo) && dateo.id) {
    				angular.extend($scope.dateo, dateo);
    			} 
    		});

    		$attrs.$observe('markerIndex', function (index) {
    			$scope.markerIndex = index;
    			console.log('MINDEX', $scope.markerIndex);
    		} );

				$scope.focusDateo = function (index) {
					$rootScope.$broadcast('focus-dateo', {index: $scope.markerIndex});
				}

				$scope.closeDetail = function () {
					$rootScope.$broadcast('close-dateo-detail');
				}

				updateComments = function ( response ) {
					if ( !$scope.dateo.comments ) {
						$scope.dateo.comments = {};
					}
					angular.extend( $scope.dateo.comments, response.objects[0].comments );
				}

				$scope.flow.imgDetail = function ( img ) {
					var givens;

					givens = { templateUrl : 'views/dateo-detail-img.html'
					         , controller  : 'DateoimgCtrl'
					         , resolve     : {
					             img : function () {
					               return img;
					             }
					           }
					         }

					$modal.open( givens );
				}

				$scope.flow.postComment = function () {
					var comment = {};
					comment.comment      = $scope.comment.comment;
					comment.object_id    = $scope.dateo.id;
					comment.content_type = 'dateo';
					Api.comment
					.postCommentByDateoId( comment )
					.then( function ( response ) {
						console.log( response )
						Api.dateo
						.getDateos({id : $scope.dateo.id})
						.then( updateComments );
					} )
				}

				$scope.flow.share = function () {
					$modal.open( { templateUrl: 'views/share.html'
					             , controller : 'ShareCtrl'
					             , resolve    : {
					                 shareModalGivens : function () {
					                 	return { url : $scope.dateo.shareableUrl }
					                 }
					             } } );
				}

				$scope.flow.denounce = function ( type, ev ) {
					Api.flag
					.doFlag( { content_type : type
					         , object_id    : +$routeParams.dateoId } )
					.then( function ( response ) {
						console.log( 'flag', type, +$routeParams.dateoId )
						$( ev.target ).hide();
					}, function ( reason ) {
						console.log( reason );
					} );
				}

				$scope.flow.focusCommentForm = function () {
					angular.element('#comment-input').focus();
				}
				
		}
	}
} ] );
