'use strict';

angular
.module('dateaWebApp')
.constant('config',
	{ app     : { name : 'Datea.pe'
	            , url  : 'http://localhost:9000/#/'
	            }
	, api     : { url    : 'http://173.255.200.68/api/v2/'
	            , imgUrl : 'http://173.255.200.68/' 
	          	} 
	, marker  : ['<div class="marker-holder">'
	              ,'<img class="img-circle" src="{{user.markerImage}}" alt="user image">'
	              ,'<div class="part">'
	                ,'<h5>{{user.username}}</h5>'
	                ,'<span class="date">{{_prettyDate}}</span>'
	              ,'</div>'
	              // ,'<span class="tag">#{{tags[0].tag}}</span>'
	              ,'<p>{{extract}}</p>'
	              //,'<a class="btn datea-gray-btn btn-xs pull-right" href="#{{user.username}}/dateos/{{id}}" target="_blank">ver más</a>'
	              , '<a class="popup-detail-btn btn datea-gray-btn btn-xs pull-right" data-index="{{index}}" href="#{{user.username}}/dateos/{{id}}">ver detalle</a>'
	              ,'<div class="stats">'
	              ,		'<span class="stat"><span class="glyphicon glyphicon-thumbs-up"></span>{{vote_count}}</span>'
	              ,		'<span class="stat"><span class="glyphicon glyphicon-comment"></span>{{comment_count}}</span>'
	              ,'</div>'
	            ,'</div>'
	            ].join('')
	, selectFilter : { 'last'          : ''
	                 , 'mostVoted'     : '-vote_count,-created'
	                 , 'mostCommented' : '-comment_count,-created'
	                 }
	, dateo   : { sizeImgMax    : 350000
	            , sizeImgMaxMsg : 'Su archivo es muy grande'
	            , tagsMax       : 7
	            }
	, defaultMap : { bounds   : [ [ -12.0735, -77.0336 ], [ -12.0829, -77.0467 ] ]
	               , center   : { lat: -12.05, lng: -77.06, zoom: 13 }
	               , defaults : { scrollWheelZoom: false }
	               , markers  : {}
	               , tiles    : { url     : 'http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png'
															, options : { attribution : 'Tiles by <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
																					, subdomains  : ['otile1','otile2','otile3','otile4']
																					}
	               							}
	               }
	, defaultDateFormat : "d 'de' MMMM yyyy - H:mm" 
	, defaultBoundsRatio : +0.0075
	, defaultImgProfile : 'static/images/globals/user-default.png'
	, defaultImgBackground : 'static/images/globals/bg-gris.png'
	, defaultImgCampaign: "static/images/globals/campaign-default.jpg"
	, homeSI : { campaignsOffset : 8
	           , paginationLimit : 6
	           , mapZoomOverride : 13
	           , zoomAfterDatear : 16
	           , activityVerbs : [ 'dateo', 'commented', 'voted' ]
	           , activityContentMsg : { onUser : { 'dateo'     : 'dateó en #{{action_object.tags[0].tag}}'
	                                             , 'commented' : 'comentó tu dateo en #{{action_object.tags[0].tag}}'
	                                             , 'voted'     : 'apoyó tu dateo en #{{action_object.tags[0].tag}}'
	                                             }
	                                  , byUser : { 'dateo'     : 'dateaste en #{{action_object.tags[0].tag}}'
	                                             , 'commented' : 'comentaste el dateo de {{target_user.username}} en #{{target_object.tags[0].tag}}'
	                                             , 'voted'     : 'apoyaste el dateo de {{target_user.username}}'
	                                             }
	                                  }
	            , dateosLimitByRequest : 100
	            , defaultMarkersImage : '/static/images/globals/'
	            }
	, profile : { dateosOffset    : 6
	            , campaignsOffset : 6
	            , paginationLimit : 6
	            }
	, activityLog : { activityVerbs : [ 'dateo', 'commented', 'voted' ]
	                , activityContentMsg : { onUser : { 'dateo'     : 'dateó en #{{action_object.tags[0].tag}}'
	                                                  , 'commented' : 'comentó tu dateo en #{{action_object.tags[0].tag}}'
	                                                  , 'voted'     : 'apoyó tu dateo en #{{action_object.tags[0].tag}}'
	                                                  }
	                                       , byUser : { 'dateo'     : 'dateaste en #{{action_object.tags[0].tag}}'
	                                                  , 'commented' : 'comentaste el dateo de {{target_user.username}} en #{{target_object.tags[0].tag}}'
	                                                  , 'voted'     : 'apoyaste el dateo de {{target_user.username}}'
	                                                  }
	                                       }
	                }
	, campaign : { mapZoomFocus : 15 }
	, dashboard : { defaultZoom : 14
	              , validationMsgs : { mainTagExists : 'La etiqueta ya está siendo usada, por favor usar otra.' } }
	, signupForm : { validationMsgs : { usernameExists : 'El nombre de usuario ya ha sido usado.'
	                                  , http400        : 'El nombre de usuario o correo ya está siendo usado.'} }
	, regex : { email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
	          , text : /^([a-záéíóúñÑÁÉÍÓÚA-Z \-])+$/}

	, layout_100: ['tag'] 
	, visualization: { default_other_color: '#CCCCCC'
									 , default_color: '#28BC45'
		}
	, geoJSONStyle: {
									style: function (feature) {
										// TRANSLATE MAPBOX SIMPLE STYLE
										var prop = feature.properties;
										if (prop.stroke && prop.stroke.charAt(0) === '#') {
											prop.color = prop.stroke;
											prop.stroke = true;
										}
										if (prop['stroke-opacity']) prop.opacity = prop['stroke-opacity'];
										if (prop['stroke-width']) prop.weight = prop['stroke-width'];
										if (prop.fill) prop.fillColor = prop.fill;
										if (prop['fill-opacity']) prop.fillOpacity = prop['fill-opacity'];
										return prop;
									}
									, pointToLayer: function(feature, latlon) {
										var marker, label;
										if (feature.properties['marker-size'] && feature.properties['marker-color']) {
	                    var sizes = {
	                        small  : [20, 50]
	                      , medium : [30, 70]
	                      , large  : [35, 90]
	                    };
	                    var fp     = feature.properties || {};
	                    var size   = fp['marker-size'] || 'medium';
	                    var symbol = (fp['marker-symbol']) ? '-' + fp['marker-symbol'] : '';
	                    var color  = fp['marker-color'] || '7e7e7e';
	                    color      = color.replace('#', '');
	 
	                    var url = 'http://a.tiles.mapbox.com/v3/marker/' +
	                          'pin-' +
	                          // Internet Explorer does not support the `size[0]` syntax.
	                          size.charAt(0) + symbol + '+' + color +
	                          ((window.devicePixelRatio === 2) ? '@2x' : '') +
	                          '.png';
	 
	                    marker = new L.Marker(latlon, {
	                        icon: new L.icon({
	                              iconUrl: url
	                            , iconSize: sizes[size]
	                            , iconAnchor: [sizes[size][0] / 2, sizes[size][1] / 2]
	                            , popupAnchor: [sizes[size][0] / 2, 0]
	                        })
	                    });
	                	}else{
	                		marker = L.Marker(latlon);
	                	}
	                	if (feature.properties.title || feature.properties.name) {
	                		label = feature.properties.title || feature.properties.name;
	                		marker.bindLabel(label);
	                	}
	                	return marker;
                }
                , onEachFeature: function (feature, layer) {
                	var content;
                	if (feature.properties.description || feature.properties.popupContent) {
                		content = feature.properties.description || feature.properties.popupContent;
                		layer.bindPopup(content);
                	}
                }
    }        
	}
);

