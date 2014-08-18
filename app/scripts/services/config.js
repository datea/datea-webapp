'use strict';

angular
.module('dateaWebApp')
.constant('config',
	{ app     : { name : 'Datea.pe'
	            , url  : 'http://localhost:9000/#/'
	            }
	, api     : { url    : 'http://173.255.200.68/api/v2/'
	            , imgUrl : 'http://173.255.200.68' 
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
	, shortDateFormat : "d/MM/yyyy - H:mm" 
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
	              , validationMsgs : { mainTagExists : 'La etiqueta ya está siendo usada en otra iniciativa. Al menos que quieras compartirla, usa otra.' } }
	, signupForm : { validationMsgs : { usernameExists : 'El nombre de usuario ya ha sido usado.'
	                                  , http400        : 'El nombre de usuario o correo ya está siendo usado.'} }
	, accountMsgs : {
			  userBannedMsg         : 'Tu usuario ha sido blockeado. Si piensas que esto es injusto, por favor comunicate con nosotros a traves de nuestro <a href="http://ayuda.datea.pe/contacto">formulario de contacto</a>.'
			, userWelcomeReadyMsg   : 'Tu cuenta ha sido activada y ya estás listo(a) para datear. Sin embargo, puedes hacer ajustes a la configuración de tu usuario acá abajo.'
			, userWelcomeConfirmMsg : 'Ya casi eres datero(a)! Falta que nos confirmes tu dirección de correo (Twitter no nos provee ese dato). Una vez confirmada tu cuenta estarás listo(a) para datear.'
	}
	, regex : { email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
	          , text : /^([a-záéíóúñÑÁÉÍÓÚA-Z \-])+$/}

	, layout_100: [] 
	, visualization: { default_other_color: '#CCCCCC'
									 , default_color: '#28BC45'
		}        
	}
);

