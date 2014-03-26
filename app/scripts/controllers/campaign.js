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
) {

	var sessionMarkersIdx = 0
	  , markersBounds     = []
	  // fn declarations
	  , buildCampaign
	  , buildDateos
	  , buildDateosWithImages
	  , buildMarkers
	  , buildFollowersList
	  , getTagsString
	  ;

	$scope.campaign         = {};
	$scope.campaign.leaflet = {};
	$scope.campaign.dateos  = {};


	$scope.campaign.selectedMarker = 'last';

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
			, group			: value.admin_level3
			, label     : { message: '#' + value.tags[0].tag }
			, message   : $interpolate( config.marker )(value)
			, draggable : false
			, focus     : false
			, _id       : value.id
			};
			sessionMarkersIdx += 1;
			markersBounds.push( [ value.position.coordinates[1], value.position.coordinates[0] ] );
		} );
		center.lat  = markers.marker0.lat;
		center.lng  = markers.marker0.lng;
		center.zoom = config.campaign.mapZoomFocus;
		angular.extend( $scope.campaign.leaflet.markers, markers );
		angular.extend( $scope.campaign.leaflet.center, center );
		leafletData.getMap("leafletCampaign")
		.then( function ( map ) {
			map.fitBounds( markersBounds );
		} )
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
			angular.extend( $scope.campaign, response.objects[0] );
			$scope.campaign.followable = !$scope.campaign.isUserFollowing();
			console.log( '$scope.campaign', $scope.campaign )
			$scope.campaign.shareableUrl = config.app.url
				                             + $scope.campaign.user.username + '/'
			                               + $scope.campaign.main_tag.tag;
			buildDateos();
			buildDateosWithImages();
			buildFollowersList();
		}, function ( reason ) {
			console.log( reason );
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
			Api.dateo
			.getDateos( dateoGivens )
			.then( function ( response ) {
				angular.forEach( response.objects, function ( value, key ){
					if ( value.position ) {
						dateos.push( value );
					}
				});
				$scope.campaign.dateos = dateos;
				buildMarkers( { dateos : dateos } );
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
			$scope.campaign.dateosWithImagesHolderHeight = { height : ( Math.ceil( $scope.campaign.dateosWithImages.length / 6 ) * 181 ) + 'px' };
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
		} else {
			buildDateos();
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
			center.zoom = $scope.campaign.leaflet.center.zoom < 15 ? 15 : $scope.campaign.leaflet.center.zoom;
			angular.extend( $scope.campaign.leaflet.center, center );
			$timeout( function () {
				$scope.campaign.leaflet.markers[markerName].focus = true;
			}, 1000 );
		}
		console.log( 'focusDateo', idx, $scope.campaign.leaflet.markers[markerName].focus );
	}

	$scope.campaign.onSelectFilterChange = function () {
		buildDateos();
	}

	$scope.campaign.followTag = function () {
		var id = $scope.campaign.main_tag.id;
		console.log( 'followTag' );
		if ( $scope.campaign.followable ) {
			Api.follow
			.doFollow( { content_type: 'tag', object_id: id } )
			.then( function ( response ) {
				$scope.campaign.followable = false;
				User.updateUserDataFromApi();
			}, function ( reason ) {
				console.log( reason );
			} );
		}
	}

	$scope.campaign.print = function () {
		$window.print();
	}

	$scope.campaign.datear = function () {
		$modal.open( { templateUrl : 'views/datear.html'
		             , controller  : 'DatearCtrl'
		             , windowClass : 'datear-modal'
		             , resolve     : {
		                datearModalGivens : function () {
		                 	return { defaultTag : $scope.campaign.main_tag.tag };
		                 }
		               }
		             } );
	}

	$scope.campaign.share = function () {
		$modal.open( { templateUrl : 'views/share.html'
		             , controller  : 'ShareCtrl'
		             , resolve		 : {
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
		angular.extend( $scope.campaign.leaflet, config.defaultMap );
	}

} ] );
