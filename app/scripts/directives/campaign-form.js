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
, 'geoJSONStyle'
, '$translate'
, function(Api, geo, config, leafletData, User, $location, $rootScope, $document, $http, geoJSONStyle, $translate) {
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
	    		  , mainTagInApi
	    		  , campaignNeedsSlug
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
					  , b64_to_utf8
					  , validateCampaign
					  , followTag
					  , hashtagify
					;

					User.isSignedIn() || $location.path( '/' );
	    		mode = $attrs.mode;

	    		

	    		$scope.campaign = { 
	    			  main_tag: {}
	    			, secondary_tags: []
	    			, published: true
	    			, default_vis: 'map'
	    			, layer_files: []
	    		}; 

					$scope.help							= {};
					$scope.flow             = {};
					$scope.flow.categories;
					$scope.flow.loading     = false;
					$scope.flow.validInput  = {};
					$scope.flow.messages    = {};
					$scope.flow.alerts      = [];
					$scope.flow.mode        = mode;
					$scope.flow.leaflet     = {
							controls   : { custom: [drawControl] }
						, center     : config.defaultMap.center
						, fileLayers : []
					};
					leafletData.getMap("leafletNewCampaign").then( function ( map ) {
						$scope.flow.leaflet.map = map;
					});
					$scope.flow.urlBase = $location.protocol()+'://'+$location.host()+'/'+User.data.username+'/';

					$scope.flow.dp = {
						  minDate     : null
						, dateOptions : {
														  'year-format': 'yy'
														, 'starting-day': 1
														}
						, format      : 'dd-MMMM-yyyy'
						, opened      : false
					}
					$scope.flow.dp.openDatepicker = function($event) {
						$event.stopPropagation();
						$event.preventDefault();
						$scope.flow.dp.opened = true;
					}

					$scope.flow.dp.clear = function() {
						$scope.flow.dp.endDate = null;
					}
					// Date watch
					$scope.$watch( 'flow.dp.endDate', function () {
						var notz;
						if ($scope.flow.dp.endDate) {
							$scope.campaign.end_date = $scope.flow.dp.endDate.toISOString();
						}else {
							$scope.campaign.end_date = null;
						}
					} );

	    		// GET CAMPAIGN MODEL FROM API IF EDITING
	    		if (mode === 'edit') {
	    			$scope.flow.loading = true;
	    			campaignGivens = {
	    				  id        : $scope.campaignId
	    				, published : 'all'
	    			}
	    			Api.campaign
						.getCampaigns( campaignGivens )
						.then( function (response) {

								if (response.objects.length === 0 ) {
									$location.path('/404').replace();
									return;
								}

								var latLngs = []
									, polygon
									, polygonBounds
								;

								angular.extend($scope.campaign, response.objects[0]);
								if (User.data.id != $scope.campaign.user.id) {
									$location.path('/');
									return;
								}

								mainTagInApi = $scope.campaign.main_tag.tag;

								$scope.flow.selectedCategory = $scope.campaign.category.id;
								$scope.flow.leaflet.center = {
									  lat  : $scope.campaign.center.coordinates[1]
									, lng  : $scope.campaign.center.coordinates[0]
									, zoom : $scope.campaign.zoom 
								}
								if ($scope.campaign.end_date) {
									$scope.flow.dp.endDate = Date.parse($scope.campaign.end_date);
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
									if (!$scope.flow.leaflet.map.getBounds().contains(polygonBounds)) {
										setTimeout(function() {
											$scope.flow.leaflet.map.fitBounds(polygonBounds);
										}, 300);
									}
								}
								// images
								if ($scope.campaign.image) {
									$scope.flow.img = config.api.imgUrl + $scope.campaign.image.image;
								}
								if ($scope.campaign.image2) {
									$scope.flow.img2 = config.api.imgUrl + $scope.campaign.image2.image;
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
												layer = L.geoJson(gjson, geoJSONStyle).addTo($scope.flow.leaflet.map);
												$scope.flow.leaflet.fileLayers.push({layer: layer, name: fname});
											} );
										}else if (ext === 'json') {
											$http.get(config.api.imgUrl+lf.file)
											.success( function (data) {
												var layer;
												layer = L.geoJson(data, geoJSONStyle).addTo($scope.flow.leaflet.map);
												$scope.flow.leaflet.fileLayers.push({layer: layer, name: fname});
											} );
										}

									});
								}
								// Slug field, if necesary
								if ($scope.campaign.main_tag.tag.toLowerCase() !== $scope.campaign.slug) {
									$scope.flow.showSlugField = true;
								}

								$scope.flow.loading = false;
								// only edit ones own campaigns (protected in api anyway)
								//if (User.data.id != $scope.campaign.user.id) $location.path( '/' );
							}, function (reason) {
								$scope.flow.loading = false;
								console.log(reason);
								if ( reason.status === 404 ) {
									$location.path('/404').replace();
								}
						} );
	    		}

	    		onGeolocation = function ( data ) {
						var leaflet = {};
						
						leaflet = angular.copy( config.defaultMap );

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
								//console.log( 'draw:deleted', e.layers._layers );
								map.removeLayer( layer );
								angular.element('div.leaflet-draw-toolbar-top').show();
							});
						});
					}

					$scope.flow.checkMainTag = function () {
						$scope.campaign.main_tag.tag = hashtagify($scope.campaign.main_tag.tag);
						$scope.flow.messages.mainTagExists = '';
						if ( $scope.campaign.main_tag.tag ) {
							Api.campaign
							.getCampaigns( { main_tag: $scope.campaign.main_tag.tag } )
							.then( function ( response ) {
								var sameTagAndUser = false;
								if ($scope.campaign.id && response.objects.length === 1 && response.objects[0].id == $scope.campaign.id) {
									$scope.flow.validInput.mainTag = true;
									$scope.flow.messages.mainTagExists = '';
									$scope.campaign.slug = $scope.campaign.main_tag.tag;
									$scope.flow.showSlugField = false;
									$scope.flow.campaignNeedsSlug = false;
									return;
								} else {
									$scope.flow.validInput.mainTag     = !response.objects.length ? true : 'warning';
									if (!response.objects.length) {
										$scope.flow.messages.mainTagExists = '';
									}else {
										$translate('CAMPAIGN_FORM.DUPLICATE_MAINTAG').then(function (msg) {
											$scope.flow.messages.mainTagExists = msg;
										});
									}
									$scope.flow.showSlugField = false;
									campaignNeedsSlug = false;
									if (!$scope.campaign.id) {
										angular.forEach(response.objects, function (c) {
											if (c.user.id === User.data.id) {
												sameTagAndUser = true;
												$translate('CAMPAIGN_FORM.DUPLICATE_USER_MAINTAG').then(function (msg) {
													$scope.flow.messages.mainTagExists = msg;
												});
												$scope.campaign.slug = null;
												$scope.flow.showSlugField = true;
												campaignNeedsSlug = true;
											}
										});
									}
									if (!sameTagAndUser) $scope.campaign.slug = $scope.campaign.main_tag.tag;
								}
							}, function ( reason ) {
								console.log( reason	);
							} );
						}else{
							$scope.flow.validInput.mainTag = null;
							$scope.flow.messages.mainTagExists = '';
						}
					}

					$scope.flow.checkSlug = function () {
						if ($scope.campaign.slug) $scope.campaign.slug = $scope.campaign.slug.replace(/[^a-z0-9-]/gi,'');
						if ($scope.campaign.slug) {
							Api.campaign
							.getCampaigns( { slug: $scope.campaign.slug, user: User.data.username } )
							.then( function ( response ) {
								if ($scope.campaign.id && response.objects.length === 1 && response.objects[0].id === $scope.campaign.id) {
									$scope.flow.validInput.slug = true;
									$scope.flow.messages.slugError = '';
								}else{
									$scope.flow.validInput.slug = !response.objects.length ? true : false;
									if (!response.objects.length) {
										$scope.flow.messages.slugError = '';
									}else {									
										$translate('CAMPAIGN_FORM.SLUG_ERROR').then(function (msg) {
											$scope.flow.messages.slugError = msg;
										});
									}
								}
							});
						}else{
							$scope.flow.validInput.slug = null;
						}
					}

					hashtagify = function ( name ) {
						var hashtag = name.split(' ');
						hashtag = hashtag.map( function (w) {
							w = w.replace(/[^a-z0-9]/gi,'');
							return w.charAt(0).toUpperCase() + w.slice(1); 
						});
						return hashtag.join('');
					}

					$scope.flow.addTag = function () {
						$scope.flow.nextTag && $scope.campaign.secondary_tags.push( { title: $scope.flow.nextTag, tag: hashtagify( $scope.flow.nextTag ) } );
						$scope.flow.nextTag = '';
					}

					b64_to_utf8 = function ( str ) {
					  return decodeURIComponent(escape(window.atob( str )));
					}

					// Add File
					$rootScope.$on('datea:fileLoaded', function ( ev, givens ) {
						var xmlStr, xmlDom, gjson, ext, layer;
						ext = givens.data.name.split('.').slice(-1)[0].toLowerCase();
						if (givens.data.name && (ext === 'kml' || ext === 'json')) { 
							$scope.campaign.layer_files.push( { file: { name: givens.data.name , data_uri: givens.file }});
							if (ext === 'kml') {
								xmlStr = b64_to_utf8(givens.file.split(';base64,')[1]);
								xmlDom = (new DOMParser()).parseFromString(xmlStr, 'text/xml');
								gjson  = toGeoJSON.kml(xmlDom, { styles: true });
														
							}else if (ext === 'json') {
								gjson = JSON.parse(b64_to_utf8(givens.file.split(';base64,')[1]));
							}
							layer = L.geoJson(gjson, geoJSONStyle).addTo($scope.flow.leaflet.map);	
							$scope.flow.leaflet.fileLayers.push({layer: layer, name: givens.data.name});
							leafletData.getMap("leafletNewCampaign").then( function ( map ) {
								map.fitBounds(layer.getBounds());
							});
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

						$scope.campaign.category            = getCategory($scope.flow.selectedCategory);
						//$scope.campaign.main_tag          = { tag: $scope.campaign.main_tag.replace('#', '') };
						$scope.campaign.layer_files         = ($scope.campaign.layer_files && $scope.campaign.layer_files.length) ? $scope.campaign.layer_files : [];
						$scope.campaign.center              = { type: 'Point', coordinates: [ -77.027772, -12.121937 ] };
						$scope.campaign.zoom                = $scope.flow.leaflet.center.zoom;

						// Image (if imgData exits, new file is being uploaded, else, stay with the old one, if any)
						if ( $scope.flow.imgData ) {
							$scope.campaign.image = { image : { name  : $scope.flow.imgData.name
	                                  						, data_uri : $scope.flow.img
	                                  					}
		                        					}
						}
						// Image2
						if ( $scope.flow.imgData2 ) {
							$scope.campaign.image2 = { image : { name  : $scope.flow.imgData2.name
		                                  						 , data_uri : $scope.flow.img2
		                                  					}
		                        						}
						}
			
						center = $scope.flow.leaflet.map.getCenter();
						$scope.campaign.center = { coordinates : [ center.lng, center.lat ]
	                        					 , type        : 'Point'
	                        					 }

	          // clean main tag of other model data if changed
	          if (mainTagInApi && mainTagInApi !== $scope.campaign.main_tag.tag) {
	          	$scope.campaign.main_tag = {tag: $scope.campaign.main_tag.tag};
	          }

	          if (validateCampaign()) {
	          	$scope.flow.loading = true;

	          	if ($scope.campaign.id) {
	          		Api.campaign
								.patchCampaign( {objects: [$scope.campaign]} )
								.then( function ( response ) {
									$location.url( '/'+User.data.username+'/'+response.objects[0].slug );
								}, function ( reason ) {
									console.log( 'patchCampaign reason: ', reason );
									$scope.flow.loading = false;
								} );
	          	}else {
								Api.campaign
								.postCampaign( $scope.campaign )
								.then( function ( response ) {
									Api.follow
									.doFollow( { follow_key: 'tag.'+response.main_tag.id} )
									.then(function (fresp) {
										$location.url( '/'+User.data.username+'/'+response.slug );
									});
								}, function ( reason ) {
									console.log( 'postCampaign reason: ', reason );
									$scope.flow.loading = false;
								} );
							}
						}
					}

					validateCampaign = function () {
						var requiredFields = ['name', 'main_tag', 'category', 'short_description', 'mission', 'information_destiny']
						  , isValid = true;

						if (campaignNeedsSlug) requiredFields.push('slug');

						// clear validation
						for (var f in $scope.flow.validInput) {
							$scope.flow.validInput[f] = null;
						}

						for (var i in requiredFields) {
							var f = requiredFields[i];
							if ((f !== 'main_tag' && !$scope.campaign[f]) || (f === 'main_tag' && $.isEmptyObject($scope.campaign[f]))) {
								isValid = false;
								$scope.flow.validInput[f] = false;
							}
						}

						if (!isValid) {
							$translate('CAMPAIGN_FORM.ERROR_INVALID').then(function(msg) {
								$scope.flow.alerts = [msg]
							});
						}

						return isValid;
					};

					$scope.flow.closeAlert = function (index) {
						$scope.flow.alerts.splice(index, 1);
					};

					$scope.flow.autocompleteTag = function ( val ) {
						return Api.tag.getAutocompleteByKeyword( { q: val.replace('#', '') } )
						.then( function ( response ) {
							var tags = [];
							angular.forEach( response.suggestions, function( item ){
								tags.push( item );
							});
							return tags;
						} );
					};

					followTag =  function (tagid) {
						Api.follow
						.doFollow( { follow_key: 'tag.'+tagid} );
					};

					buildCategories();
					buildBoundariesMap();
	    	}

	  	, link: function ($scope, element, attrs) {

	  		//var menuFixThold = angular.element('.campaign-form-nav').position().top - 51;
	  		var menuFixThold = 60;
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
					$scope.$apply(function() { $scope.flow.fixMenu = $document.scrollTop() > menuFixThold; });
				});

				$scope.$watch('flow.fixMenu', function () {
					if ($scope.flow.fixMenu) {
						var new_width = $('.form').width();
						$('.form-alert').width(new_width);
					}
				});

	  	}  
		} 
} ] );
