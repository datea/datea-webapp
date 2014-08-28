'use strict';

angular
.module('dateaWebApp')
.constant('config',
	{ app     : { name : 'Datea.pe'
	            , url  : 'http://localhost:9000/#!/'
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
	, dateo   : { sizeImgMax    : 3500000
	            , sizeImgMaxMsg : 'Su archivo es muy grande'
	            , tagsMax       : 7
	            }
	, defaultMap : { bounds   : [ [ -12.0735, -77.0336 ], [ -12.0829, -77.0467 ] ]
	               , center   : { lat: -12.05, lng: -77.06, zoom: 14 }
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
	           , activityVerbs : [ 'dateo', 'commented', 'voted' , 'redateo']
	           , activityContentMsg : { onUser : { 'dateo'     : 'dateó en #{{action_object.tags[0].tag}}'
	                                             , 'commented' : 'comentó tu dateo en #{{action_object.tags[0].tag}}'
	                                             , 'voted'     : 'apoyó tu dateo en #{{action_object.tags[0].tag}}'
	                                             , 'redateo'   : 'redateó tu dateo en #{{action_object.tags[0].tag}}'
	                                             }
	                                  , byUser : { 'dateo'     : 'dateaste en #{{action_object.tags[0].tag}}'
	                                             , 'commented' : 'comentaste el dateo de {{target_user.username}} en #{{target_object.tags[0].tag}}'
	                                             , 'voted'     : 'apoyaste el dateo de {{target_user.username}}'
	                                             , 'redateo'   : 'redateaste a {{target_user.username}} en #{{target_object.tags[0].tag}}'
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
																		, emailExists    : 'La dirección ya está siendo utilizada. ¡Recupera tu contraseña!'
	                                  , http400        : 'El nombre de usuario o correo ya está siendo usado.'} }
	, accountMsgs : {
			  userBannedMsg         : 'Tu usuario ha sido blockeado. Si piensas que esto es injusto, por favor comunicate con nosotros a traves de nuestro <a href="http://ayuda.datea.pe/contacto">formulario de contacto</a>.'
			, userWelcomeReadyMsg   : 'Tu cuenta ha sido activada y ya estás listo(a) para datear. Si quieres, antes puedes hacer ajustes a la configuración de tu usuario acá abajo.'
			, userWelcomeConfirmMsg : 'Ya casi eres datero(a)! Falta que nos confirmes tu dirección de correo (Twitter no nos provee ese dato). Una vez confirmada tu cuenta estarás listo(a) para datear.'
			, duplicateEmailMsg     : 'La dirección de correo ya existe. Por favor utiliza otra, o si no recuerdas tu usuario, puedes salir y recuperar tu clave. Si ingresaste con otro servico (Facebook), por favor vuelve a ingresar con ese servicio.'
			, duplicateUsernameMsg  : 'El nombre de usuario ya existe. Por favor, elige otro.'
			, checkEmailMsg         : '¡Gracias! Ahora revisa tu correo y sigue las instrucciones para activar tu cuenta. Si deseas, puedes cerrar esta ventana.'
			, userConfirmEmailMsg   : 'Antes de poder datear, necesitamos verificar tu dirección de correo. Ingrésala aquí abajo. ¡Gracias!'
			, userConfirmMissingMsg : 'Falta que nos confirmes tu correo para activar tu cuenta. Por favor, chequea tu correo y sigue las instrucciones que te enviamos. Si deseas recibir otro correo de activación, vuelve a cliquear en "Enviar". ¡Gracias!'
			, userConfirmSuccessMsg : 'Tu cuenta ha sido plenamente activada y estas listo(a) para datear. Si deseas, puedes antes hacer ajustes a tu cuenta acá abajo.'
			, registerActivationCompleteMsg : 'Tu cuenta ha sido activada. Ahora puedes ingresar con tu usuario y contraseña.'
			, PasswdResetEmailMsg   : 'Por favor revisa tu correo y sigue las instrucciones para recuperar tu contraseña.'
			, PasswdResetNotFoundMsg: 'No existen dateros con esa dirección ;)'  
	}
	, unknownErrorMsg : 'Hubo un error. Por favor revisa tus datos e intenta de nuevo. Si no funciona, <a href="http://ayuda.datea.pe/contacto">contáctanos</a>.'
	, regex : { email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
	          , text : /^([a-záéíóúñÑÁÉÍÓÚA-Z \-])+$/}

	, layout_100: [] 
	, visualization: { default_other_color: '#CCCCCC'
									 , default_color: '#28BC45'
									 , defaultMarkerIcon : { type     		: 'div'
																				 , iconSize 		: [29, 43]
																				 , iconAnchor	  : [14.5, 43]
																				 , popupAnchor	: [0, -33]
																				 , labelAnchor	: [8, -25]
																				 , className   : 'datea-pin-icon'
																				 , html     		: '<svg width="29" height="43"><g style="clip-path: url(#pinpath);">'
																							 				+ 	'<rect height="43" width="29" fill="#28BC45" />'
																							 				+ 	'<circle cx="14.5" cy="14" r="4" fill="white" />'
																							 				+   '<path d="M0.726,16.239c0-8.38,6.177-15.174,13.795-15.174s13.795,6.793,13.795,15.174c0,10.116-13.795,25.29-13.795,25.29  S0.726,26.355,0.726,16.239" stroke="#999999" fill="none" stroke-width="1" />'
																					 		 				+ '</g></svg>'
																			   }  
									 }      
	}
);

