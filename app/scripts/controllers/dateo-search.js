'use strict';

angular.module('dateaWebApp')
.controller( 'DateoSearchCtrl'
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
  , '$http'
  , '$compile'
  , 'shareMetaData'
  , 'Datear'
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
  , $http
  , $compile
  , shareMetaData
  , Datear
) {

	var buildMarkers
	  , buildMarker
	  , buildSearchParams
	  , createMarkerPopup 
	  , checkForHashtagInSearch
	  , addMarker
	  , buildSearchQuery
	  , buildCampaignsInSearch
	  , buildClusterIcon
	  , doSearch
	  , makeSVGClusterIcon
	  , clusterSizeRange
	  , paramsToQuery
	  , serializeXmlNode
	  , sessionMarkersIdx
	  , queryParamsToText
	;

	$scope.query  = {
		  q        : $routeParams.search || ''
		, limit    : $routeParams.limit  || 100
		, order_by : $routeParams.order_by || '-created'
	};

	$scope.result  = {};
	$scope.flow              = {};
	$scope.flow.loading 		 = true;
	$scope.flow.leaflet      = {};
	$scope.flow.result       = {};
	$scope.flow.isHashtag    = false;
	$scope.flow.dateoDetail  = {
		  dateo : null
		, show  : false 
	};
	$scope.flow.activeTab = { 
		  map    : $location.search().tab ? $location.search().tab === 'map': true
		, images : $location.search().tab ? $location.search().tab === 'images': false
	}
	$scope.flow.orderByOptions = [
			  { val: '-created', label: 'últimos'}
			, { val: '-vote_count', label: 'más apoyados'}
			, { val: '-comment_count', label: 'más comentados'}
	];

	angular.extend( $scope.flow.leaflet, config.defaultMap );

	$scope.dateFormat = config.defaultDateFormat;
	shareMetaData.setData({title : 'Datea | buscar dateos'});

	$scope.$watch( 'query.limit', function () {
		$scope.flow.limitLabel = ($scope.query.limit < 1000) ? 'máximo '+$scope.query.limit : 'todos los';
	});

	buildSearchParams = function () {
		var query = {};
		if ($routeParams.search) query.q = $routeParams.search;
		for (var p in $location.search()) {
			if (p !== 'tab') query[p] = $location.search()[p];
		}
		checkForHashtagInSearch();
		queryParamsToText();
		return query;
	}

	checkForHashtagInSearch = function () {
		if ($scope.query.q.match(/^#\S+$/)) {
			$scope.flow.isHashtag = true;
		}
	}

	paramsToQuery = function () {
		var params = {}
			, q;
		for (var p in $scope.query) {
			if (p !== 'q') params[p] = $scope.query[p]; 
		}
		q = $scope.query.q || '';
		$location.path('/buscar/'+q);
		$location.search(params);
	}

	queryParamsToText = function () {
		var text = []
			, q    = $scope.query
		;
		// order by
		if (q.order_by === '-created') text.push('últimos '+q.limit);
		if (q.order_by === '-vote_count') text.push(q.limit+' más apoyados');
		if (q.order_by === '-comment_count') text.push(q.limit+' más comentados');
		// date
		if (q.since && q.until) {
			text.push($filter('date')(q.since, 'd/M/yy') + ' > '+ $filter('date')(q.until, 'd/M/yy'));
		}else{
			if (q.since) text.push('desde &nbsp;'+$filter('date')(q.since, 'd/M/yy'));
			if (q.until) text.push('hasta &nbsp;'+$filter('date')(q.until, 'd/M/yy'));
		}

		$scope.flow.queryTextRep = text;
	}

	doSearch = function ( givens ) {
		var tab = $location.search().tab || 'map'
			, params;

		$scope.flow.showFilter = false;
		$scope.flow.loading = true;

		params = buildSearchParams();

		if (tab === 'map') {
			$scope.result.dateos = [];
			$scope.flow.leaflet.markers = {};
		}else if (tab === 'images') {
			$scope.result.dateosWithImages = [];
			params.has_images = 1;
		}
		Api.dateo
		.getDateos( params )
		.then( function ( response ) {
			var dateos = [];
			if (tab === 'map') {
				angular.forEach( response.objects , function ( value, key ) {
					if ( value.position ) {
						dateos.push( value );
					}
				});
				$scope.flow.dateoShowListNumResults = config.defaultdateoNumResults;
				$scope.result.dateos = dateos;
				buildMarkers( { dateos: dateos } );
			
			}else if (tab === 'images') {
				$scope.result.dateosWithImages = response.objects;
			} 
			$scope.flow.loading = false;
		}, function ( reason ) {
			console.log( reason );
		} );
	};

	$scope.flow.doSearch = function () {
		paramsToQuery();
		doSearch();
	};

	$scope.flow.openTab = function(tab) {
		$scope.query.tab = tab;
		$scope.flow.doSearch();
		if (tab == 'map') {
			leafletData.getMap("leafletSearch")
			.then( function ( map ) {
				map.invalidateSize();
			});
		}
	};

	$scope.flow.autocompleteSearch = function ( val ) {
		return Api.tag.getAutocompleteByKeyword( { q: val.replace('#', '') } )
		.then( function ( response ) {
			var tags = [];
			angular.forEach( response.suggestions, function( item ){
				tags.push( '#'+item );
			});
			return tags;
		} );
	};

	$scope.flow.showMoreListResults = function (ev) {
		$scope.flow.dateoShowListNumResults += config.defaultdateoNumResults;
	};

	buildMarkers = function ( givens ) {
		var dateos  = givens && givens.dateos
			,	markersBounds = []
		;
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
		leafletData.getMap("leafletSearch")
		.then( function ( map ) {
			map.fitBounds( markersBounds );
		} );
	}

	buildMarker = function(dateo) {
		var label;
		label = '#'+dateo.tags.slice(0,2).map(function(t){ return t.tag; }).join(', #');
		if (dateo.tags.length > 2) label = label+'...';

		return {
		  lat       : dateo.position.coordinates[1]
		, lng       : dateo.position.coordinates[0]
		, group     : "search"
		, label     : { message: label }
		//, message     : $interpolate( config.marker )(dateo)
		, draggable   : false
		, focus       : false
		, _id         : dateo.id
		, icon 			  : config.visualization.defaultMarkerIcon
		, riseOnHover : true
		};
	}

	addMarker = function (dateo) {
		var marker = buildMarker(dateo);
		$scope.flow.leaflet.markers['marker'+sessionMarkersIdx] = marker;
		sessionMarkersIdx ++; 
	}

	createMarkerPopup = function (markerName, latLng) {
		$http.get('views/dateo-map-popup.html')
 		.success(function(html) {
 			var compiled, pscope, pelem, idx;
 			idx = parseInt(markerName.replace('marker',''));
 			pscope = $scope.$new(true);
 			pscope.dateo = $scope.result.dateos[idx];
 			pscope.dateFormat = config.defaultDateFormat;
 			pscope.index = idx;
 			pscope.openDetail = function () {
 				$scope.flow.openDateoDetail(idx);
 			}
 			pscope.tags = pscope.dateo.tags.slice(0, 2);
 			compiled = $compile(angular.element(html));
 			pelem = compiled(pscope);

 			if (!latLng) {
 				latLng = L.latLng(pscope.dateo.position.coordinates[1], pscope.dateo.position.coordinates[0]);
 			}

 			leafletData.getMap("leafletSearch")
			.then( function ( map ) {
				L.popup({
					offset: L.point(0, -32)
				})
				.setLatLng(latLng)
				.setContent(pelem[0])
				.openOn(map);
			});
 		});
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

	//Datear.setContext({});

	$scope.$on('user:hasDateado', function (event, args){
		if (args.created) {
			$scope.tag.dateos.unshift(args.dateo);
   		if (args.dateo.is_geolocated) addMarker(args.dateo);
   		if (args.dateo.has_images) $scope.tag.dateosWithImages.unshift(args.dateo);
   		updateTag();
   		$scope.flow.focusDateo(0); 
		}
	});

	$scope.flow.focusDateo = function ( idx ) {
		var markerName;
		markerName  = "marker"+idx;

		leafletData.getMarkers('leafletSearch')
		.then(function (markers) {
			var cluster = leafletMarkersHelpers.getCurrentGroups().search;
			var marker = markers[markerName];
			if (cluster) {
				cluster.zoomToShowLayer(marker, function () {
					$scope.flow.leaflet.markers[markerName].focus;
					createMarkerPopup(markerName, marker.getLatLng());
				});
			} 
		});
	}

	$scope.flow.openDateoDetail = function (index) {
		$scope.flow.dateoDetail.dateo       = $scope.result.dateos[index];
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

	$scope.$on('leafletDirectiveMarker.click', function(event, args) {
		$scope.flow.leaflet.markers[args.markerName].focus = true;
		createMarkerPopup(args.markerName);
	});

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
			.attr( 'class', 'datea-svg-cluster' )
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

	doSearch();

	$scope.$on('$destroy', function () {
		//markersBounds   = [];
		$scope.result = {};
		leafletMarkersHelpers.resetCurrentGroups();
		Datear.resetContext();
	});

} ] );
