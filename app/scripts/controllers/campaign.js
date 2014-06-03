'use strict';

angular.module('dateaWebApp')
.controller( 'CampaignCtrl'
, [ '$scope'
  , 'Api'
  , '$routeParams'
  , 'config'
  , '$interpolate'
  , 'leafletData'
  , '$timeout'
  , '$filter'
  , 'User'
  , '$window'
  , '$modal'
  , '$location'
, function (
    $scope
  , Api
  , $routeParams
  , config
  , $interpolate
  , leafletData
  , $timeout
  , $filter
  , User
  , $window
  , $modal
  , $location
) {

	var sessionMarkersIdx = 0
	  , markersBounds     = []
	  , defaultMap
	  // fn declarations
	  , buildCampaign
	  , buildDateos
	  , buildDateosWithImages
	  , buildMarkers
	  , buildFollowersList
	  , buildRelatedCampaigns
	  , getTagsString
	  ;

	$scope.campaign         = {};
	$scope.campaign.leaflet = {};
	$scope.campaign.dateos  = {};
	$scope.flow             = {};
	$scope.flow.notFound    = false;

	$scope.campaign.loading = {};
	$scope.campaign.loading.leaflet = true;
	$scope.campaign.loading.dateos  = true;

	$scope.campaign.isUserSignedIn = User.isSignedIn();

	$scope.campaign.selectedMarker = 'last';

	buildRelatedCampaigns = function () {
		var tags = getTagsString( $scope.campaign );
		console.log( 'buildRelatedCampaigns tags', tags );
		Api.campaign
		.getCampaigns( {tags : tags} )
		.then( function ( response ) {
			$scope.campaign.relatedCampaigns = response.objects[0];
			console.log( 'Api campaign', response );
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	buildMarkers = function ( givens ) {
		var dateos  = givens && givens.dateos
		  , markers = {}
		  , center  = {}
		  ;
		// Cleaning
		sessionMarkersIdx = 0;
		$scope.campaign.leaflet.markers = {};

		angular.forEach( dateos, function ( value, key ) {
			// default image for markers
			value.user.image_small = value.user.image_small
			? value.user.image_small
			: config.defaultImgProfile;
			value._prettyDate = $filter('date')( value.date, 'fullDate' );
			markers['marker'+sessionMarkersIdx] = {
			  lat       : value.position.coordinates[1]
			, lng       : value.position.coordinates[0]
			// , group     : value.country
			, group     : $scope.campaign.main_tag.tag
			// , group     : value.admin_level3
			, label     : { message: '#' + value.tags[0].tag }
			, message   : $interpolate( config.marker )(value)
			, draggable : false
			, focus     : false
			, _id       : value.id
			};
			// console.log( ':: group', $scope.campaign.main_tag.tag );
			sessionMarkersIdx += 1;
			markersBounds.push( [ value.position.coordinates[1], value.position.coordinates[0] ] );
		} );
		center.lat  = markers.marker0.lat;
		center.lng  = markers.marker0.lng;
		center.zoom = config.campaign.mapZoomFocus;
		console.log( 'campaign markers', markers );
		angular.extend( $scope.campaign.leaflet.markers, markers );
		angular.extend( $scope.campaign.leaflet.center, center );
		leafletData.getMap("leafletCampaign")
		.then( function ( map ) {
			map.fitBounds( markersBounds );
		} )
		$scope.campaign.loading.leaflet = false;
		// $scope.campaign.leaflet.markers.marker0.focus = true;
	}

	buildFollowersList = function () {
		$scope.campaign.followers = [];
		Api.user
		.getUsers( { follow_key: 'tag.'+$scope.campaign.main_tag.id } )
		.then( function ( response ) {
			console.log( 'buildFollowersList', response.objects );
			angular.extend( $scope.campaign.followers, response.objects );
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	buildCampaign = function () {
		var campaignGivens = {};

		campaignGivens.user     = $routeParams.username;
		campaignGivens.main_tag = $routeParams.campaignName;

		Api.campaign
		.getCampaigns( campaignGivens )
		.then( function ( response ) {
			if ( response.objects[0] ) {
				angular.extend( $scope.campaign, response.objects[0] );
				$scope.campaign.followable = $scope.campaign.isUserSignedIn && !$scope.campaign.isUserFollowing();
				$scope.campaign.shareableUrl = config.app.url
					                             + $scope.campaign.user.username + '/'
				                               + $scope.campaign.main_tag.tag;
				$scope.flow.notFound = false;
				buildDateos();
				buildDateosWithImages();
				buildFollowersList();
				buildRelatedCampaigns();
			} else {
				$scope.flow.notFound = true;
			}
		}, function ( reason ) {
			console.log( reason );
			if ( reason.status === 404 ) {
				$scope.$apply( function () {
					$scope.flow.notFound = true;
				} );
			}
		} );

	}

	getTagsString = function ( givens ) {
		var mainTag       = givens.main_tag
		  , secondaryTags = givens.secondary_tags
		  , secondaryTagsArray = []
		  ;
		angular.forEach( secondaryTags, function ( value, key ) {
			!!value.tag && secondaryTagsArray.push( value.tag );
		});
		return !secondaryTags.length ? mainTag.tag : mainTag.tag + ',' + secondaryTagsArray.join(',');
	}

	buildDateos = function ( givens ) {
		var dateoGivens = {}
		  , dateos      = []
		  , q           = givens && givens.q
		  , withMedia   = givens && givens.withMedia
		  ;

		dateoGivens.tags = getTagsString( $scope.campaign );
		dateoGivens.q    = q;
		if ( $scope.campaign.selectedMarker !== 'last' ) {
			dateoGivens.order_by = config.selectFilter[ $scope.campaign.selectedMarker ];
		}
		if ( $scope.campaign ) {
			$scope.campaign.dateos = [];
			Api.dateo
			.getDateos( dateoGivens )
			.then( function ( response ) {
				if ( response.objects.length ) {
					angular.forEach( response.objects, function ( value, key ){
						if ( value.position ) {
							dateos.push( value );
						}
					});
					$scope.campaign.dateos = dateos;
					buildMarkers( { dateos : dateos } );
					$scope.campaign.loading.dateos = false;
				} else {
					$scope.campaign.leaflet.markers = {};
					$scope.campaign.loading.dateos  = false;
					$scope.campaign.loading.leaflet = false;
				}

			}, function ( reason ) {
				console.log( reason );
			} );
		}
	}

	buildDateosWithImages = function () {
		var dateos = [];
		Api.dateo
		.getDateos( { has_images: 1, tags: getTagsString( $scope.campaign ) } )
		.then( function ( response ) {
			angular.forEach( response.objects, function ( value, key ){
				if ( value.position ) {
					dateos.push( value );
				}
			} );
			$scope.campaign.dateosWithImages = dateos;
			$scope.campaign.dateosWithImagesHolderHeight = { height : ( Math.ceil( $scope.campaign.dateosWithImages.length / 6 ) * 200 ) + 'px' };
			console.log( 'buildDateosWithImages', dateos );
		}, function ( reason ) {
			console.log( reason );
			}
		);
	}

	$scope.campaign.isUserFollowing = function () {
		return !!~User.data.tags_followed.map( function ( t ) { return t.id; } ).indexOf( $scope.campaign.main_tag.id );
	};

	$scope.campaign.searchDateos = function () {
		if ( $scope.campaign.searchDateosKeyword ) {
			buildDateos( { q : $scope.campaign.searchDateosKeyword } );
			$scope.campaign.loading.leaflet = true;
			$scope.campaign.loading.dateos = true;
		} else {
			buildDateos();
			$scope.campaign.loading.leaflet = true;
			$scope.campaign.loading.dateos = true;
		}
	}

	$scope.campaign.focusDateo = function ( idx ) {
		var markerName
		  , center = {}
		  ;
		markerName  = 'marker'+idx;
		if ( $scope.campaign.leaflet.markers[markerName] ) {
			center.lat  = $scope.campaign.leaflet.markers[markerName].lat;
			center.lng  = $scope.campaign.leaflet.markers[markerName].lng;
			center.zoom = $scope.campaign.leaflet.center.zoom < 16 ? 16 : $scope.campaign.leaflet.center.zoom;
			angular.extend( $scope.campaign.leaflet.center, center );
			// $timeout( function () {
				$scope.campaign.leaflet.markers[markerName].focus = true;
			// }, 1000 );
		}
		console.log( 'focusDateo', idx, $scope.campaign.leaflet.markers[markerName].focus );
	}

	$scope.campaign.onSelectFilterChange = function () {
		$scope.campaign.loading.leaflet = true;
		$scope.campaign.loading.dateos = true;
		buildDateos();
	}

	$scope.campaign.followTag = function () {
		var id = $scope.campaign.main_tag.id;
		console.log( 'followTag' );

		if ( $scope.campaign.isUserSignedIn ) {
			if ( $scope.campaign.followable ) {
				$scope.campaign.followable = false;
				Api.follow
				.doFollow( { content_type: 'tag', object_id: id } )
				.then( function ( response ) {
					User.updateUserDataFromApi();
				}, function ( reason ) {
					$scope.campaign.followable = true;
					console.log( reason );
				} );
			}
		} else {
			$location.path('/registrate');
		}

	}

	$scope.campaign.unfollowTag = function () {
		var id = $scope.campaign.main_tag.id;
		if ( !$scope.campaign.followable ) {
			$scope.campaign.followable = true;
			Api.follow
			.doUnfollow( { user: User.data.id, content_type: 'tag', object_id: id } )
			.then( function ( response ) {
				User.updateUserDataFromApi();
			}, function ( reason ) {
				$scope.campaign.followable = false;
				console.log( reason );
			} );
		}
	}

	$scope.campaign.print = function () {
		$window.print();
	}

	$scope.campaign.datear = function () {
		if ( $scope.campaign.isUserSignedIn ) {
			$modal.open( { templateUrl : 'views/datear.html'
			             , controller  : 'DatearCtrl'
			             , windowClass : 'datear-modal'
			             , resolve     : {
			                datearModalGivens : function () {
			                  return { defaultTag    : $scope.campaign.main_tag.tag
			                         , suggestedTags : $scope.campaign.secondary_tags
			                         };
			                 }
			               }
			             } );
		} else {
			$location.path('/registrate');
		}
	}

	$scope.campaign.share = function () {
		$modal.open( { templateUrl : 'views/share.html'
		             , controller  : 'ShareCtrl'
		             , resolve     : {
		                shareModalGivens : function () {
		                  return { url         : $scope.campaign.shareableUrl
		                         , title       : $scope.campaign.name
		                         , description : $scope.campaign.short_description
		                         , image       : $filter('imgFromApi')($scope.campaign.image_thumb) }
		                 }
		             } } );
	}

	if ( $routeParams.username && $routeParams.campaignName ) {
		buildCampaign();
		// $scope.campaign.leaflet = { bounds   : [ [ -12.0735, -77.0336 ], [ -12.0829, -77.0467 ] ]
	 //               , center   : { lat: -12.05, lng: -77.06, zoom: 13 }
	 //               , defaults : { scrollWheelZoom: false }
	 //               , markers  : {}
	 //               }
		defaultMap = angular.copy( config.defaultMap );
		angular.extend( $scope.campaign.leaflet, defaultMap );
		// console.log( 'EXTEND', angular.extend( $scope.campaign.leaflet, config.defaultMap ) );
	}

	$scope.$on('$destroy', function () {
		console.log( 'destroy' );
		markersBounds   = [];
		$scope.campaign = {};
	});

} ] );
