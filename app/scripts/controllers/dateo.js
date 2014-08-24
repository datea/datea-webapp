'use strict';

angular.module('dateaWebApp')
.controller('DateoCtrl'
, [ '$scope'
  , '$routeParams'
  , 'Api'
  , 'config'
  , '$location'
  , '$modal'
  , '$window'
  , 'User'
  , 'leafletData'
  , '$timeout'
  , '$rootScope'
, function (
    $scope
  , $routeParams
  , Api
  , config
  , $location
  , $modal
  , $window
  , User
  , leafletData
  , $timeout
  , $rootScope
 ) {
	var dateos
	  , dateosId = []
	  , dateo
	  , modalInstance
	  // fn declarations
	  , buildDateo
	  , updateComments
	  , hasNext
	  , hasUserVoted
	  , buildRelatedCampaigns
	  , setLeaflet
	  ;

	$scope.dateo              = {};
	$scope.flow               = {};
	$scope.flow.notFound      = false;
	$scope.flow.imgUrl        = config.api.imgUrl;
	$scope.flow.showEditBtn   = false;
	$scope.flow.form          = {};
	$scope.flow.form.loading = false;
	$scope.flow.leaflet       = {};
	$scope.flow.messageNext   = ''; 

	$scope.flow.isUserSignedIn = User.isSignedIn();
	$scope.dateFormat = config.defaultDateFormat;

	hasNext = function () {
		return dateo.id < dateo.next_by_user;
	}

	buildDateo = function ( response ) {
		var leaflet = {};
		if( response.objects[0] ) {
			dateo   = response.objects[0];
			$scope.flow.notFound = false;
			
			$scope.flow.messageNext = hasNext() ? 'siguiente' : 'primer';
			angular.extend( $scope.dateo, dateo );
			setLeaflet();
			$scope.flow.shareableUrl = config.app.url + $scope.dateo.user.username + '/dateos/' + $scope.dateo.id;
			buildRelatedCampaigns();

			
			if (User.isSignedIn() && User.data.id === dateo.user.id) $scope.flow.showEditBtn = true;
			console.log( 'buildDateo', dateo );
		} else {
			$scope.flow.notFound = true;
		}
	}

	setLeaflet = function () {
		var leaflet = {};
		if ($scope.dateo.position) {
			leaflet.center = { lat  : $scope.dateo.position.coordinates[1]
				                 , lng  : $scope.dateo.position.coordinates[0]
				                 , zoom : 16
				                 }
			leaflet.markers = { staticy : { lat       : $scope.dateo.position.coordinates[1]
			                              , lng       : $scope.dateo.position.coordinates[0]
			                              , draggable : false
			                              , icon      : config.visualization.defaultMarkerIcon
			                              } }

			leafletData.getMap('leafletDateo').then( function ( map ) {
				$timeout( function () {
					map.invalidateSize();
				}, 200 );
			});
			angular.extend( $scope.flow.leaflet, leaflet );
		}
	}

	buildRelatedCampaigns = function () {
		var campaigns = [];
		angular.forEach($scope.dateo.tags, function (tag) {
			if (tag.campaigns && tag.campaigns.length) {
				angular.forEach(tag.campaigns, function (camp) {
					camp.tag = tag.tag;
					campaigns.push(camp);
				});
			}
		});
		$scope.flow.campaigns = campaigns;
	}

	updateComments = function ( response ) {
		var oldIds = $scope.dateo.comments.map(function (c) {return c.id;});
		Api.comment.getList({content_type__model: 'dateo', object_id: $scope.dateo.id})
		.then(function (response) {
			console.log(response);
			$scope.dateo.comment_count = response.meta.total_count;
			$scope.dateo.comments = response.objects.map( function (c) {
				c.new = oldIds.indexOf(c.id) === -1;
				return c;
			})
			$scope.flow.form.loading = false;
			$scope.flow.form.comment = null;
		}, function (reason) {
			console.log(reason);
		});
	}

	$scope.slideDownComments = function () {
		$('.slidedown').slideDown('normal', function () {
			$(this).removeClass('slidedown');
		})
	}

	$scope.flow.nextDateo = function () {
		$location.path( '/' + $routeParams.username + '/dateos/' + dateo.next_by_user );
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

	$scope.flow.print = function () {
		$window.print();
	}

	$scope.flow.postComment = function () {
		var comment = {};
		if ($scope.flow.form.comment.trim() && !$scope.flow.form.loading) {
			$scope.flow.form.loading = true;
			comment.comment      = $scope.flow.form.comment;
			comment.object_id    = $scope.dateo.id;
			comment.content_type = 'dateo';
			Api.comment
			.postCommentByDateoId( comment )
			.then( function ( response ) {
				//console.log( response );
				$rootScope.$broadcast('user:doFollow', {followKey: 'dateo.'+$scope.dateo.id});
				updateComments();
				/*Api.dateo
				.getDateoByUsernameAndDateoId(
				{ user : $routeParams.username
				, id   : +$routeParams.dateoId
				} )
				.then( updateComments );*/
			} );
		}
	}

	$scope.flow.focusCommentForm = function () {
		angular.element('#comment-input').focus();
	}

	$scope.flow.share = function () {
		$modal.open( { templateUrl: 'views/share.html'
		             , controller : 'ShareCtrl'
		             , resolve    : {
		                 shareModalGivens : function () {
		                 	return { url : $scope.flow.shareableUrl }
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

	$scope.flow.editDateo = function () {
		modalInstance = $modal.open( { templateUrl : 'views/datear.html'
			             , controller  : 'DatearCtrl'
			             , windowClass : 'datear-modal'
			             , backdrop    : 'static'
			             , resolve     : {
			                datearModalGivens : function () {
			                  return { dateo : $scope.dateo 
			                         , datearSuccessCallback: function (dateo) {
																	console.log("EDIT SUCCESS CALLBACK", dateo)
			                         }
			                         };
			                 }
			               }
			             } );
	}

	$scope.$on('user:hasDateado', function (event, args) {
		setLeaflet();
	});

	if ( $routeParams.username && $routeParams.dateoId ) {
			Api.dateo
			.getDateoByUsernameAndDateoId(
			{ user : $routeParams.username
			, id   : +$routeParams.dateoId
			} )
			.then( buildDateo, function ( reason ) {
				if ( reason.status === 404 ) {
					$scope.$apply( function () {
						$scope.flow.notFound = true;
					} );
					console.log( 'usuario no encontrado' );
				}
			} );
			angular.extend( $scope.flow.leaflet, config.defaultMap );
	}

} ] );
