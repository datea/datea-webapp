angular.module("dateaWebApp")
.directive("daCampaignForm", [ 
  'Api'
, 'geolocation'
, 'config'
, 'leafletData'
, 'User'
, '$location'
, '$rootScope'
, '$document'
, '$http'
, function(Api, geo, config, leafletData, User, $location, $rootScope, $document, $http) {
	return {
	      restrict: "E"
	    	, scope: {
	    		  mode 				  : '='
	    		, campaignId		: '=?'
	    	} 
	    , templateUrl: "views/campaign-form.html"
	    , controller: function ($scope, $element, $attrs) {

	    		var mode
	    		  , campaignGivens
					// boundary map options fix
					  , drawnItems  = new L.FeatureGroup()
					  , options     = { edit: { featureGroup: drawnItems }
					                  , draw: { marker: false, polyline: false, circle: false, rectangle: false, polygon: { allowIntersection: false } } }
					  , drawControl = new L.Control.Draw(options)
					// fn declarations
					  , buildCategories
					  , getCategory
					  , buildBoundariesMap
					  , onGeolocation
					  , onGeolocationError
					  , newCampaignInstance
					  , b64_to_utf8
					;

					$scope.loading  = false;
	    		$scope.campaign = { 
	    			  main_tag: {}
	    			, secondary_tags: []
	    			, published: true
	    			, default_vis: 'map'
	    			, layer_files: []
	    		}; 

					$scope.newCampaign      = {};
					$scope.flow             = {};
					$scope.flow.categories;
					$scope.flow.validInput  = {};
					$scope.flow.messages    = {};
					$scope.flow.leaflet     = {
							controls   : { custom: [drawControl] }
						, center     : config.defaultMap.center
						, fileLayers : []
					};
					$scope.flow.minDate     = null;
					$scope.flow.dateOptions = {
																			'year-format': "'yy'"
																		, 'starting-day': 1
																	};
					leafletData.getMap("leafletNewCampaign").then( function ( map ) {
						$scope.flow.leaflet.map = map;
					});

					User.isSignedIn() || $location.path( '/' );
	    		mode = $attrs.mode;

	    		// GET CAMPAIGN MODEL FROM API IF EDITING
	    		if (mode == 'edit') {
	    			$scope.loading = true;
	    			campaignGivens = {
	    				  id     : $scope.campaignId
	    			}
	    			Api.campaign
						.getCampaigns( campaignGivens )
						.then( function (response) {
								var latLngs = []
									, polygon
									, polygonBounds
								;
								angular.extend($scope.campaign, response.objects[0]);
								console.log($scope.campaign);
								$scope.flow.selectedCategory = $scope.campaign.category.id;
								$scope.flow.leaflet.center = {
									  lat  : $scope.campaign.center.coordinates[1]
									, lng  : $scope.campaign.center.coordinates[0]
									, zoom : $scope.campaign.zoom 
								}
								// boundary
								if ($scope.campaign.boundary && $scope.campaign.boundary.coordinates) {
									// leaflet draw cannot handle geojson at the moment (sadly)
									// var polygon = L.geoJson(boundary);
									// HACKING TO GET draw working without geojson
									angular.forEach($scope.campaign.boundary.coordinates[0], function (c) {
										latLngs.push(L.latLng(c[1], c[0]));
									} );
									polygon = L.polygon(latLngs, {
										  color       : '#E65F00'
										, fillColor   : '#E65F00'
										, fillOpacity : 0.2
									});
									drawnItems.addLayer(polygon);
									$scope.flow.leaflet.map.addLayer(polygon);
									
									// check if polygon is in map bounds, otherwise adjust viewport
									polygonBounds = polygon.getBounds();
									if (!map.getBounds().contains(polygonBounds)) {
										setTimeout(function() {
											$scope.flow.leaflet.map.fitBounds(polygonBounds);
										}, 300);
									}
								}
								// image
								if ($scope.campaign.image) {
									$scope.flow.img = config.api.imgUrl + $scope.campaign.image.image;
								}
								// layer files
								if ($scope.campaign.layer_files && $scope.campaign.layer_files.length > 0) {
									angular.forEach($scope.campaign.layer_files, function (lf) {
										var fname, ext;
										fname = lf.file.split('/').slice(-1)[0];
										ext   = fname.split('.').slice(-1)[0].toLowerCase();
										if (ext === 'kml') {
											$http.get(config.api.imgUrl+lf.file)
											.success( function (data) {
												var gjson, layer;
												gjson = toGeoJSON.kml(data, { styles: true });
												layer = L.geoJson(gjson, config.geoJSONStyle).addTo($scope.flow.leaflet.map);
												$scope.flow.leaflet.fileLayers.push({layer: layer, name: fname});
											} );
										}else if (ext === 'json') {
											$http.get(config.api.imgUrl+lf.file)
											.success( function (data) {
												var layer;
												layer = L.geoJson(data, config.geoJSONStyle).addTo($scope.flow.leaflet.map);
												$scope.flow.leaflet.fileLayers.push({layer: layer, name: fname});
											} );
										}

									});
								}
								$scope.loading = false;
								// only edit ones own campaigns (protected in api anyway)
								//if (User.data.id != $scope.campaign.user.id) $location.path( '/' );
							}, function (reason) {
								console.log(reason);
						} );
	    		}

	    		onGeolocation = function ( data ) {
						var leaflet = {};
						console.log('sup onGeolocation')
						leaflet.center = { lat  : data.coords.latitude
						                 , lng  : data.coords.longitude
						                 , zoom : config.dashboard.defaultZoom
						                 }
						//leaflet.controls = { draw : { marker: false, polyline: false } }
						angular.extend( $scope.flow.leaflet, leaflet );
					}

					onGeolocationError = function () {
						console.log('sup onGeolocationError')
						// angular.extend( $$scope.newCampaign.leaflet, config.defaultMap );
					}

					buildCategories = function () {
						Api.category
						.getCategories( {} )
						.then( function ( response ) {
							$scope.flow.categories = response.objects;
							//console.log( $scope.flow.categories );
						} );
					}

					getCategory = function (id) {
						for (var i=0; i<$scope.flow.categories.length; i++) {
							if ($scope.flow.categories[i].id == id) return $scope.flow.categories[i];
						}
					}

					buildBoundariesMap = function () {
						geo.getLocation( { timeout:10000 } )
						.then( onGeolocationError, onGeolocationError );

						angular.extend( $scope.flow.leaflet, config.defaultMap );
						angular.extend( $scope.flow.leaflet, { controls : { custom: [drawControl] } });

						leafletData.getMap("leafletNewCampaign").then( function ( map ) {
							map.on('draw:created', function ( e ) {
								var layer = e.layer;
								$scope.campaign.boundary = layer.toGeoJSON().geometry;
								drawnItems.addLayer( layer );
								map.addLayer( layer );
								angular.element('div.leaflet-draw-toolbar-top').hide();
							});
							map.on('draw:deleted', function ( e ) {
								var layer = e.layers._layers[ Object.keys( e.layers._layers )[0] ];
								console.log( 'draw:deleted', e.layers._layers );
								map.removeLayer( layer );
								angular.element('div.leaflet-draw-toolbar-top').show();
							});
						});
					}

					$scope.flow.checkMainTag = function () {
						$scope.campaign.main_tag.tag = $scope.flow.hashtagify($scope.campaign.main_tag.tag);
						$scope.flow.messages.mainTagExists = '';
						if ( $scope.campaign.main_tag.tag ) {
							Api.campaign
							.getCampaigns( { main_tag: $scope.campaign.main_tag.tag } )
							.then( function ( response ) {
								console.log( 'checkMainTag', response, !!response.objects.length );
								if ($scope.campaign.id && response.objects[0].id == $scope.campaign.id) {
									$scope.flow.validInput.mainTag = true;
									$scope.flow.messages.mainTagExists = '';
									return;
								}
								$scope.flow.validInput.mainTag     = !response.objects.length;
								$scope.flow.messages.mainTagExists = !response.objects.length ? '' : config.dashboard.validationMsgs.mainTagExists;
							}, function ( reason ) {
								console.log( reason	);
							} );
						}
					}

					$scope.flow.hashtagify = function ( name ) {
						var hashtag = [];
						name.replace('#','').split(' ').map( function (v) { hashtag.push( v.charAt(0).toUpperCase() + v.slice(1) ) } );
						return hashtag.join('');
					}

					$scope.flow.addTag = function () {
						$scope.flow.nextTag && $scope.campaign.secondary_tags.push( { title: $scope.flow.nextTag, tag: $scope.flow.hashtagify( $scope.flow.nextTag ) } );
						$scope.flow.nextTag = '';
					}

					b64_to_utf8 = function ( str ) {
					  return decodeURIComponent(escape(window.atob( str )));
					}

					// Add File
					$rootScope.$on('datea:fileLoaded', function ( ev, givens ) {
						var xmlStr, xmlDom, gjson, ext, layer;
						if (givens.data.name) { 
							ext = givens.data.name.split('.').slice(-1)[0].toLowerCase();
							$scope.campaign.layer_files.push( { file: { name: givens.data.name , data_uri: givens.file }});
							if (ext === 'kml') {
								xmlStr = b64_to_utf8(givens.file.split(';base64,')[1]);
								xmlDom = (new DOMParser()).parseFromString(xmlStr, 'text/xml');
								gjson  = toGeoJSON.kml(xmlDom, { styles: true });
								//console.log("MAPBOX KML", gjson);
														
							}else if (ext === 'json') {
								gjson = JSON.parse(b64_to_utf8(givens.file.split(';base64,')[1]));
								//console.log("MAPBOX GEOJSON", gjson);
							}
							layer = L.geoJson(gjson, config.geoJSONStyle).addTo($scope.flow.leaflet.map);	
							$scope.flow.leaflet.fileLayers.push({layer: layer, name: givens.data.name});
							//console.log("GEOJSON", gjson);
						}
						$scope.flow.nextFile     = null;
						$scope.flow.nextFileData = null;
					});

					$scope.flow.arrowUp = function ( idx ) {
						var temp;
						if ( idx > 0 ) {
							temp = $scope.campaign.secondary_tags[ idx - 1 ];
							$scope.campaign.secondary_tags[ idx - 1 ] = $scope.campaign.secondary_tags[ idx ];
							$scope.campaign.secondary_tags[ idx ]     = temp;
						}
					}

					$scope.flow.arrowDown = function ( idx ) {
						var temp;
						if ( idx < $scope.campaign.secondary_tags.length - 1 ) {
							temp = $scope.campaign.secondary_tags[ idx + 1 ];
							$scope.campaign.secondary_tags[ idx + 1 ] = $scope.campaign.secondary_tags[ idx ];
							$scope.campaign.secondary_tags[ idx ]     = temp;
						}
					}

					$scope.flow.removeTag = function ( idx ) {
						$scope.campaign.secondary_tags.splice( idx, 1 );
					}

					$scope.flow.removeFile = function ( idx ) {
						$scope.campaign.layer_files.splice( idx, 1 );
						$scope.flow.leaflet.map.removeLayer($scope.flow.leaflet.fileLayers[idx].layer);
						$scope.flow.leaflet.fileLayers.splice( idx, 1 );
					}

					// Date picker
					$scope.flow.today = function() {
						$scope.flow.dt = new Date();
					};
					// $$scope.flow.today();

					$scope.flow.save = function () {
						var center;

						$scope.campaign.end_date            = $scope.flow.dt && $scope.flow.dt;
						$scope.campaign.short_description   = $scope.campaign.short_description.substring(0,140);
						$scope.campaign.mission             = $scope.campaign.mission.substring(0,500);
						$scope.campaign.category            = getCategory($scope.flow.selectedCategory);
						//$scope.campaign.main_tag            = { tag: $scope.campaign.main_tag.replace('#', '') };
						$scope.campaign.layer_files               = $scope.campaign.layer_files.length && $scope.campaign.layer_files;
						$scope.campaign.center              = { type: 'Point', coordinates: [ -77.027772, -12.121937 ] };
						$scope.campaign.zoom                = $scope.flow.leaflet.center.zoom;

						// Image (if imgData exits, new file is being uploaded, else, stay with the old one, if any)
						if ( $scope.flow.imgData ) {
							$scope.campaign.image = [ { image : { name  : $scope.flow.imgData.name
		                                  						, data_uri : $scope.flow.img
		                                  					}
		                        						, order : 0
		                        						}
		                      						];
						}
						
						center = $scope.flow.leaflet.map.getCenter();
						$scope.campaign.center = { coordinates : [ center.lng, center.lat ]
	                        					 , type        : 'Point'
	                        					 }
	          console.log($scope.campaign);
						Api.campaign
						.postCampaign( $scope.campaign )
						.then( function ( response ) {
							console.log( 'postCampaign', response);
						}, function ( reason ) {
							console.log( 'postCampaign reason: ', reason );
						} );
					}

					buildCategories();
					buildBoundariesMap();
	    	}
	  	, link: function ($scope, element, attrs) {

	  		var menuFixThold = angular.element('.campaign-form-nav').position().top - 51;
	  		//console.log(menuFixThold);
	  		$scope.scrollTo = function($event, element, offset) {
						$event.stopPropagation();
						$event.preventDefault();
						$scope.flow.isScrolling = true;
						var elem = angular.element(document.getElementById(element));
						$document.scrollToElement(elem, offset, 400).then(function() {
							$scope.flow.isScrolling = false;
						});
					}

				$document.on('scroll', function() {
					$scope.$apply(function() { $scope.fixMenu = $document.scrollTop() > menuFixThold; });
				});

	  	}  
		} 
} ] );
