angular.module("dateaWebApp")
.directive("daDateoDetailInline", 
[
	'$rootScope'
,	'$modal'
, 'User'
, 'Api'
, 'config'
, '$translate'
,	function (
		$rootScope
	, $modal
	, User
	, Api
	, config
	, $translate
) {
	return {
			restrict    : "E"
		, templateUrl : "/views/dateo-detail-inline.html"
		, scope       : {
				dateo 			: '='
			, markerIndex	: '=?'
			, mapPresent  : '@'
			, campaignId  : '='
			, mainTag     : '=?'
		}
		, controller  : function ($scope, $element, $attrs) {
				
				var updateComments
					, checkStatus
					;

				$scope.createdFormat        = config.defaultDateFormat;
				$scope.dateFormat           = config.dateFieldFormat;
				$scope.dateo 								= {};
				$scope.comment 							= {}
				$scope.flow  								= {};
				$scope.flow.mapPresent      = ($attrs.mapPresent) ? $scope.$eval($attrs.mapPresent) : true;
				$scope.flow.isUserSignedIn  = User.isSignedIn();
				$scope.flow.showEditBtn     = false;

	    		$scope.$watch('dateo.id', function () {
	    			if ($scope.dateo && $scope.dateo.id) {
	    				$scope.flow.showEditBtn = User.data.id === $scope.dateo.user.id;
	    				$scope.flow.shareableUrl = config.app.url + '/'+$scope.dateo.user.username+'/dateos/'+$scope.dateo.id;
	    				checkStatus();
	    				$scope.dateo.comments = [];
	    				updateComments();
	    				if ($scope.mainTag && $scope.dateo.tags[0] != $scope.mainTag) {
								var i = $scope.dateo.tags.indexOf($scope.mainTag);
								$scope.dateo.tags.splice(i, 1);
								$scope.dateo.tags.unshift($scope.mainTag); 					
							}
	    			}
	    		});

	    		$attrs.$observe('markerIndex', function (index) {
	    			$scope.markerIndex = index;
	    		} );

				$scope.focusDateo = function (index) {
					$rootScope.$broadcast('focus-dateo', {id: $scope.dateo.id});
				};

				$scope.closeDetail = function () {
					$rootScope.$broadcast('close-dateo-detail');
				};

				updateComments = function ( response ) {
					var oldIds = $scope.dateo.comments.map(function (c) {return c.id;});
					Api.comment.getList({content_type__model: 'dateo', object_id: $scope.dateo.id})
					.then(function (response) {
						$scope.dateo.comment_count = response.meta.total_count;
						$scope.dateo.comments = response.objects.map( function (c) {
							c.new = oldIds.indexOf(c.id) === -1;
							return c;
						})
						$scope.comment.loading = false;
						$scope.comment.comment = null;
					}, function (reason) {
						console.log(reason);
					});
				};

				checkStatus = function () {
					var status;
					if ($scope.campaignId && $scope.dateo.admin && $scope.dateo.admin[$scope.campaignId]) {
						status = $scope.dateo.admin[$scope.campaignId].status;
						if (status != 'new') {
							$translate(['DATEO.SOLVED', 'DATEO.REVIEWED'])
							.then(function(t) {
								$scope.flow.status = {
								  msg    : status == 'reviewed' ? t['DATEO.REVIEWED'] : t['DATEO.SOLVED']
								, type   : status
							} 
							});
						} 
					}
				};

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
				};

				$scope.flow.postComment = function () {
					var comment = {};
					if ($scope.comment.comment.trim() && !$scope.comment.loading) {
						$scope.comment.loading = true;
						comment.comment      = $scope.comment.comment;
						comment.object_id    = $scope.dateo.id;
						comment.content_type = 'dateo';
						Api.comment
						.postCommentByDateoId( comment )
						.then( function ( response ) {
							$rootScope.$broadcast('user:doFollow', {followKey: 'dateo.'+$scope.dateo.id});
							updateComments();
							/*Api.dateo
							.getDateos(
							{ user : $routeParams.username
							, id   : +$routeParams.dateoId
							} )
							.then( updateComments );*/
						} );
					}
				};

				$scope.slideDownNewComment = function () {
					$('.slidedown').slideDown('normal', function () {
						$(this).removeClass('slidedown');
					})
				};

				$scope.flow.share = function () {
					var img = $scope.dateo.images.length ? config.api.imgUrl + $scope.dateo.images[0].image : config.app.url + '/static/images/logo-large.png';
					$modal.open( { templateUrl : 'views/share.html'
		             , controller  : 'ShareCtrl'
		             , resolve     : {
		                shareModalGivens : function () {
		                  return { url         : $scope.flow.shareableUrl
		                         , title       : 'Datea | '+$scope.dateo.user.username+' dateó en #'+ $scope.dateo.tags.slice(0,2).join(", #")
		                         , description : $scope.dateo.extract
		                         , image       : img}
		                 }
		             } } );
				};

				$scope.flow.denounce = function ( type, ev ) {
					Api.flag
					.doFlag( { content_type : type
					         , object_id    : +$routeParams.dateoId } )
					.then( function ( response ) {
						$( ev.target ).hide();
					}, function ( reason ) {
						console.log( reason );
					} );
				};

				$scope.flow.focusCommentForm = function () {
					angular.element('#comment-input').focus();
				};

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
				};

				$scope.flow.editDateo = function () {
					modalInstance = $modal.open( { templateUrl : 'views/datear.html'
						             , controller  : 'DatearCtrl'
						             , windowClass : 'datear-modal'
						             , backdrop    : 'static'
						             , resolve     : {
						               datearModalGivens : function () {
						                  return { dateo : $scope.dateo };
						               		}
						               }
						             } );
				};
							
		}
	}
} ] );
