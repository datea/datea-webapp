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
  , 'leafletMarkersHelpers'
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
  , leafletMarkersHelpers
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
	$scope.dateamap = {};
	$scope.map_is_present = true;
	$scope.colorRange =  d3.scale.category10().range();
	$scope.has_legend = false;


	buildRelatedCampaigns = function () {
		var tags = getTagsString( $scope.campaign );
		console.log( 'buildRelatedCampaigns tags', tags );
		Api.campaign
		.getCampaigns( {tags : tags} )
		.then( function ( response ) {
			$scope.campaign.relatedCampaigns = response.objects[0];
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
			
			value._prettyDate = $filter('date')( value.date, 'fullDate' );
			var tags = [];
			var labelTags = []; 
			angular.forEach(value.tags, function (tag) { 
				if (angular.isDefined($scope.subTags[tag.tag])) labelTags.push('#'+tag.tag);
				tags.push(tag.tag);
			});
			
			markers['marker'+sessionMarkersIdx] = {
			  lat       : value.position.coordinates[1]
			, lng       : value.position.coordinates[0]
			, group     : $scope.campaign.main_tag.tag
			, label     : { message: labelTags.join(',') }
			, message   : $interpolate( config.marker )(value)
			, draggable : false
			, focus     : false
			, _id       : value.id
			, tags      : tags
			, icon 			: buildMarkerIcon(value)
			};
			sessionMarkersIdx += 1;
			//markersBounds.push( [ value.position.coordinates[1], value.position.coordinates[0] ] );
			markersBounds.push(L.latLng(value.position.coordinates[1], value.position.coordinates[0]));
		} );
		center.lat  = markers.marker0.lat;
		center.lng  = markers.marker0.lng;
		center.zoom = config.campaign.mapZoomFocus;
		angular.extend( $scope.campaign.leaflet.markers, markers );
		angular.extend( $scope.campaign.leaflet.center, center );
		leafletData.getMap("leafletCampaign")
		.then( function ( map ) {
			var bounds = L.latLngBounds(markersBounds);
			map.fitBounds( bounds );
		} )
		$scope.campaign.loading.leaflet = false;
		// $scope.campaign.leaflet.markers.marker0.focus = true;
	}

	var buildMarkerIcon = function(dateo) {
		var colors = [];
		angular.forEach(dateo.tags, function(tag){
			if (tag.tag != $scope.campaign.main_tag.tag && angular.isDefined($scope.subTags[tag.tag])) {
				colors.push($scope.subTags[tag.tag].color);
			}
		});
		if (colors.length == 0) colors.push(config.visualization.default_color);
		
		var html = '<svg width="29" height="40"><g style="clip-path: url(#pinpath);">';
		angular.forEach(colors, function (color) {
			html = html + '<rect height="40" width="'+(29 / colors.length)+'" fill="'+color+'" />';
		});
		html = html + '<circle cx="14.5" cy="14" r="5" fill="white" />'
				 + '</g></svg>';

		return {
			type     : 'div',
			iconSize : [29, 40],
			iconAnchor:   [14.5, 40],
			popupAnchor:  [0, -33],
			labelAnchor: [8, -25],
			html     : html
		}
	}

	buildFollowersList = function () {
		$scope.campaign.followers = [];
		Api.user
		.getUsers( { follow_key: 'tag.'+$scope.campaign.main_tag.id } )
		.then( function ( response ) {
			//console.log( 'buildFollowersList', response.objects );
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
				$scope.campaign.shareableUrl = config.app.url
				                               + $scope.campaign.user.username + '/'
				                               + $scope.campaign.main_tag.tag;
				$scope.flow.notFound = false;
				buildSubTags();
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

		// dateoGivens.tags = getTagsString( $scope.campaign );
		dateoGivens.tags = $scope.campaign.main_tag.tag;
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
			//console.log( 'buildDateosWithImages', dateos );
		}, function ( reason ) {
			console.log( reason );
			}
		);
	}

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

	var buildSubTags = function () {
		if ($scope.campaign.secondary_tags.length > 0) $scope.has_legend = true;
		var subTags = {};
		angular.forEach($scope.campaign.secondary_tags, function (tag, key) {
			subTags[tag.tag] = {obj: tag, color: $scope.colorRange[key]}
		});
		$scope.subTags = subTags;
	} 

	$scope.dateamap.focusDateo = function ( idx ) {
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
		defaultMap = angular.copy( config.defaultMap );
		angular.extend( $scope.campaign.leaflet, defaultMap );
	}

	$scope.$on('$destroy', function () {
		markersBounds   = [];
		$scope.campaign = {};
		leafletMarkersHelpers.resetCurrentGroups();
	});

	/**************************************************
		CUSTOM MARKERCLUSTER ICONS: PIES
	***************************************************/

	$scope.buildClusterIcon = function (cluster) {
		var children = cluster.getAllChildMarkers()
		  , n = children.length
		  , d = clusterSizeRange(children.length)
		  , r = d / 2
			,	dataObj = {}
			, data = [];

			//console.log("n", n);
			//console.log("clusterSize", clusterSizeRange(n) );

			angular.forEach(children, function (marker) {
				angular.forEach(marker.options.tags, function(tag) {
					if (tag != $scope.campaign.main_tag.tag) {
						tag = angular.isDefined($scope.subTags[tag]) ? tag : "Otros";
						if (angular.isDefined(dataObj[tag])) {
							dataObj[tag].value ++;
						}else{
							dataObj[tag] = { label: '#'+tag, value : 1, tag: tag};
						}
					}
				});
			});
			for (var j in dataObj) {
				data.push(dataObj[j]);
			}
			var html = makeSVGPie({
				 n: n
				,r: r
				,d: d
				,data: data
			});
			var clusterIcon = new L.DivIcon({
				html: html,
				className: 'marker-cluster',
				iconSize: new L.Point(d,d)
			});
			return clusterIcon;
	}

	var clusterSizeRange = d3.scale.linear()
		.domain([0, 100])
		.range([50, 80])
		.clamp(true); 

	var makeSVGPie = function (opt) {
		var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
		var vis = d3.select(svg).data([opt.data])
			.attr("width", opt.d)
			.attr("height", opt.d)
			.append("svg:g")
			.attr("transform", "translate(" + opt.r + "," + opt.r + ")");
		var arc = d3.svg.arc().outerRadius(opt.r);
		var pie = d3.layout.pie().value(function(d){return d.value;});
		var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
		arcs.append("svg:path").attr("fill", function(a, i){
				if ($scope.campaign.secondary_tags.length == 0) return config.visualization.default_color;
				if (a.data.tag == "Otros") return config.visualization.default_other_color;
				return $scope.subTags[a.data.tag].color;
			})
			.attr("d", arc)
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

	var serializeXmlNode = function (xmlNode) {
    if (typeof window.XMLSerializer != "undefined") {
        return (new window.XMLSerializer()).serializeToString(xmlNode);
    } else if (typeof xmlNode.xml != "undefined") {
        return xmlNode.xml;
    }
    return "";
	}

	$scope.clusterOptions = { 
		iconCreateFunction: $scope.buildClusterIcon,
		//disableClusteringAtZoom: 17,
		polygonOptions: {
			weight: 1,
			fillColor: "#999",
			color: '#999',
			fillOpacity: 0.4
		}
	};

	$scope.onLegendRender = function () {
		var h = angular.element('.legend-holder .tag-list').height();
		if (h > 23) $scope.showLegendExpandLink = true;
	}
	$scope.showLegendExpandLink = false;
	$scope.showLegendContractLink = false;
	$scope.expandLegend = function() {
		console.log("expand");
		angular.element('.legend-holder').addClass('expanded');
		$scope.showLegendExpandLink = false;
		$scope.showLegendContractLink = true;
	}
	$scope.contractLegend = function() {
		angular.element('.legend-holder').removeClass('expanded');
		$scope.showLegendExpandLink = true;
		$scope.showLegendContractLink = false;
	}



} ] );
