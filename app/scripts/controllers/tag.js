'use strict';

angular.module('dateaWebApp')
.controller( 'TagCtrl'
, [ '$scope'
  , 'Api'
  , '$routeParams'
  , '$location'
  , '$q'
  , 'User'
  , '$modal'
  , 'config'
  , '$filter'
  , '$interpolate'
  , 'leafletData'
  , '$timeout'
  , 'leafletMarkersHelpers'
, function (
    $scope
  , Api
  , $routeParams
  , $location
  , $q
  , User
  , $modal
  , config
  , $filter
  , $interpolate
  , leafletData
  , $timeout
  , leafletMarkersHelpers
) {

	var sessionMarkersIdx = 0
	  , markersBounds     = []
	// fn declarations
	  , isMainTag
	  , isUserFollowing
	  , buildDateos
	  , buildDateosWithImages
	  , buildMarkers
	  , buildMarker
	  , addMarker
	  , buildTag
	  , buildCampaignsInTag
	  , updateTag
	  , goToMainTag
	  , buildClusterIcon
	  , makeSVGClusterIcon
	  , clusterSizeRange
	  , serializeXmlNode
	;

	$scope.tag                  = {};
	$scope.tag.selectedMarker   = 'last';
	$scope.flow                 = {};
	$scope.flow.loading 		    = true;
	$scope.flow.notFound        = false;
	$scope.flow.leaflet         = {};
	$scope.flow.isUserSignedIn  = User.isSignedIn();
	$scope.flow.dateoDetail     = {
		  dateo : null
		, show  : false 
	};

	$scope.dateFormat = config.defaultDateFormat;


	isMainTag = function () {
		var dfd = $q.defer();
		Api.campaign
		.getCampaigns( { main_tag: $routeParams.tagName } )
		.then( function ( response ) {
			dfd.resolve( { isMainTag: !!response.objects.length, tagObj: response.objects } );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	buildTag = function () {
		Api.tag
		.getTags( { tag: $routeParams.tagName } )
		.then( function ( response ) {
			if ( response.objects[0] ) {
				angular.extend($scope.tag, response.objects[0]);
				buildDateos();
				buildDateosWithImages();
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

	updateTag = function () {
		Api.tag
		.getTags( { tag: $routeParams.tagName } )
		.then( function ( response ) {
			angular.extend($scope.tag, response.objects[0]);
		}, function (reason) {
			console.log(reason);
		});
	}

	buildDateos = function ( givens ) {
		var dateoGivens = {}
		  , dateos      = []
		  , q           = givens && givens.q
		  ;
		dateoGivens.tags = $scope.tag.tag;
		dateoGivens.q    = q;
		if( $scope.tag.selectedMarker !== 'last' ) {
			dateoGivens.order_by = config.selectFilter[ $scope.tag.selectedMarker ];
		}
		if ( dateoGivens.tags ) {
			$scope.tag.dateos = [];
			Api.dateo
			.getDateos( dateoGivens )
			.then( function ( response ) {
				if ( response.objects.length ) {
					angular.forEach( response.objects , function ( value, key ) {
						if ( value.position ) {
							dateos.push( value );
						}
					});
					$scope.tag.dateos = dateos;
					buildMarkers( { dateos: dateos } );
				} else {
					$scope.flow.leaflet.markers = {};
				}
				$scope.flow.loading = false;
			}, function ( reason ) {
				console.log( reason );
			} )
		}
	}

	buildDateosWithImages = function () {
		var dateos = [];
		Api.dateo
		.getDateos( { has_images: 1, tags: $scope.tag.tag } )
		.then( function ( response ) {
			angular.forEach( response.objects, function ( value, key ) {
				if ( value.position ) {
					dateos.push( value );
				}
			} );
			$scope.tag.dateosWithImages = dateos;
			$scope.tag.dateosWithImagesHolderHeight = { height : ( Math.ceil( $scope.tag.dateosWithImages.length / 6 ) * 200 ) + 'px' };
		}, function ( reason ) {
			console.log( reason );
		} )
	}

	var markerIcon = {
		  type     		: 'div'
		, iconSize 		: [29, 40]
		, iconAnchor	: [14.5, 40]
		, popupAnchor	: [0, -33]
		, labelAnchor	: [8, -25]
		, className   : 'datea-pin-icon'
		, html     		: '<svg width="29" height="40"><g style="clip-path: url(#pinpath);">'
					 				+ 	'<rect height="40" width="29" fill="'+config.visualization.default_color+'" />'
					 				+ 	'<circle cx="14.5" cy="14" r="5" fill="white" />'
			 		 				+ '</g></svg>'
	}

	buildMarkers = function ( givens ) {
		var dateos  = givens && givens.dateos
		  , markers = {}
		  , center  = {}
		  ;
		console.log( 'buildMarkers' );
		// Cleaning
		sessionMarkersIdx = 0;
		$scope.flow.leaflet.markers = {};

		angular.forEach( dateos, function ( value, key ) {
			// default image for markers
			addMarker(value);
			markersBounds.push( [ value.position.coordinates[1], value.position.coordinates[0] ] );
		} );
		//center.lat  = markers.marker0.lat;
		//center.lng  = markers.marker0.lng;
		//center.zoom = config.campaign.mapZoomFocus;
		//angular.extend( $scope.flow.leaflet.markers, markers );
		//angular.extend( $scope.flow.leaflet.center, center );
		leafletData.getMap("leafletTag")
		.then( function ( map ) {
			map.fitBounds( markersBounds );
		} );
	}

	buildMarker = function(dateo) {
			dateo.user.markerImage = dateo.user.image_small
 						? config.api.imgUrl+dateo.user.image_small
						: '/' + config.defaultImgProfile;
			dateo._prettyDate = $filter('date')( dateo.date, 'fullDate' );
			return {
			  lat       : dateo.position.coordinates[1]
			, lng       : dateo.position.coordinates[0]
			, group     : $scope.tag.tag
			, label     : { message: $scope.tag.tag }
			, message     : $interpolate( config.marker )(dateo)
			, draggable   : false
			, focus       : false
			, _id         : dateo.id
			, icon 			  :  markerIcon
			, riseOnHover : true
			};
	}

	addMarker = function (dateo) {
		var marker = buildMarker(dateo);
		$scope.flow.leaflet.markers['marker'+sessionMarkersIdx] = marker;
		sessionMarkersIdx ++; 
	}

	$scope.clusterOptions = { 
		//iconCreateFunction: $scope.buildClusterIcon,
		//disableClusteringAtZoom: 17,
		polygonOptions: {
			weight: 1,
			fillColor: "#999",
			color: '#999',
			fillOpacity: 0.4
		}
	};

	goToMainTag = function ( givens ) {
		$location.path( givens.username + '/' + givens.tagName ).replace();
	}

	$scope.tag.isUserFollowing = function () {
		return isUserFollowing();
	}

	$scope.tag.datear = function () {
		if ( $scope.flow.isUserSignedIn  ) {
			$modal.open( { templateUrl : 'views/datear.html'
			             , controller  : 'DatearCtrl'
			             , windowClass : 'datear-modal'
			             , backdrop    : 'static'
			             , resolve     : {
			                datearModalGivens : function () {
			                   return { 
			                   		defaultTag : $scope.tag.tag
			                   	, datearSuccessCallback: function (dateo) {
	                         		$scope.tag.dateos.unshift(dateo);
	                         		if (dateo.is_geolocated) addMarker(dateo);
	                         		if (dateo.has_images) $scope.tag.dateosWithImages.unshift(dateo);
	                         		updateTag();
	                         		// TODO: fit bounds if marker outside of map view
	                         }
			                   };
			                 }
			               }
			             } );
		} else {
			$location.path('/registrate');
		}
	}

	$scope.flow.focusDateo = function ( idx ) {
		var markerName
		  , center = {}
		  ;
		markerName = 'marker'+idx;
		if ( $scope.flow.leaflet.markers[markerName] ) {
			center.lat  = $scope.flow.leaflet.markers[markerName].lat;
			center.lng  = $scope.flow.leaflet.markers[markerName].lng;
			center.zoom = $scope.flow.leaflet.center.zoom < 15 ? 15 : $scope.flow.leaflet.center.zoom;
			angular.extend( $scope.flow.leaflet.center, center );
			// $timeout( function () {
				$scope.flow.leaflet.markers[markerName].focus = true;
			// }, 1000 );
		}
		console.log( 'focusDateo', idx, $scope.flow.leaflet.markers[markerName].focus );
	}
	$scope.flow.openDateoDetail = function (index) {
		$scope.flow.dateoDetail.dateo       = $scope.tag.dateos[index];
		$scope.flow.dateoDetail.markerIndex = index;
		$scope.flow.dateoDetail.show        = true;
		$scope.flow.focusDateo(index);
	}
	$scope.flow.closeDateoDetail = function (index) {
		$scope.flow.dateoDetail.dateo = null;
		$scope.flow.dateoDetail.show  = false;
	}

	$scope.$on('focus-dateo', function (event, args) {
		$scope.flow.focusDateo(args.index);
	} );
	$scope.$on('open-dateo-detail', function (event, args) {
		$scope.flow.openDateoDetail(args.index);
	} );
	$scope.$on('close-dateo-detail', function () {
		$scope.flow.closeDateoDetail();
	} );
	$scope.$on('leafletDirectiveMap.popupopen', function(event, args){
    $('.popup-detail-btn').click(function (ev) {
    	ev.preventDefault();
    	var index = parseInt($(this).data('index'));
    	$scope.flow.openDateoDetail(index);
    });
  });

	$scope.tag.searchDateos = function () {
		if ( $scope.tag.searchDateosKeyword ) {
			buildDateos( { q: $scope.tag.searchDateosKeyword } );
		} else {
			buildDateos();
		}
		$scope.flow.loading = false;
	}

	$scope.tag.onSelectFilterChange = function () {
		$scope.flow.loading = true;
		buildDateos();
	}

	clusterSizeRange = d3.scale.linear()
		.domain([0, 100])
		.range([50, 80])
		.clamp(true);

	buildClusterIcon = function (cluster) {
		var children = cluster.getAllChildMarkers()
		  , n        = children.length
		  , d        = clusterSizeRange(children.length)
		  , di       = d + 1
		  , r        = d / 2
			, html
			, clusterIcon
		;

		html = makeSVGClusterIcon({
				  n: n
				, r: r
				, d: d
			});

		clusterIcon = new L.DivIcon({
			  html: html
			, className: 'marker-cluster'
			, iconSize: new L.Point(di,di)
		});

		return clusterIcon;
	}

	makeSVGClusterIcon = function (opt) {
		var svg, vis, arc, pie, arcs;
		svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
		vis = d3.select(svg).data([opt.data])
			.attr("width", opt.d)
			.attr("height", opt.d)
			.append("svg:g")
			.attr("transform", "translate(" + opt.r + "," + opt.r + ")");

		vis.append('circle')
			.attr("fill", config.visualization.default_color)
			.attr("r", opt.r)
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("opacity", 0.75);

		vis.append("circle")
			.attr("fill", "#ffffff")
			.attr("r", opt.r / 2.2)
			.attr("cx", 0)
			.attr("cy", 0);

		vis.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("class", "cpie-label")
			.attr("text-anchor", "middle")
			.attr("dy", '.3em')
			.text(opt.n);

		return serializeXmlNode(svg);
	}

	$scope.flow.leaflet.clusterOptions = { 
		  iconCreateFunction : buildClusterIcon
		//, disableClusteringAtZoom: 17
		, polygonOptions     : {
			  weight      : 1
			, fillColor   : "#999"
			, color       : '#999'
			, fillOpacity : 0.4
		}
	};

	serializeXmlNode = function (xmlNode) {
		if (typeof window.XMLSerializer != "undefined") {
    	return (new window.XMLSerializer()).serializeToString(xmlNode);
		} else if (typeof xmlNode.xml != "undefined") {
    	return xmlNode.xml;
		}
    return "";
  }

	if ( $routeParams.tagName ) {
		isMainTag().then( function ( givens ) {
			console.log("TAG MAINTAG", givens);
			if ( givens.isMainTag && givens.tagObj.length === 1) {
				goToMainTag( { username: givens.tagObj[0].user.username
				             , tagName : givens.tagObj[0].main_tag.tag
				             } );
			} else {
				if (givens.tagObj.length > 0) {
					$scope.campaignsInTag = givens.tagObj;
				}
				buildTag();
			}
		}, function ( reason ) {
			console.log( reason );
		} );
		angular.extend( $scope.flow.leaflet, config.defaultMap );
	}

	$scope.$on('$destroy', function () {
		markersBounds   = [];
		$scope.tag = {};
		leafletMarkersHelpers.resetCurrentGroups();
	});

} ] );
