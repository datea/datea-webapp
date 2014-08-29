angular.module('dateaWebApp')
.factory('shareMetaData', [
  'config'
, '$location' 
, function (config, $location) {

	var defaultShareData = {
		  title       : 'Datea - Todos somos dateros'
		, description : 'Comparte y visualiza datos útiles con tu comunidad.' 
		, imageUrl   : config.app.url+'/static/images/logo-large.png'
		, url         : config.app.url
	};

	return {
		  data : angular.copy(defaultShareData)

		, resetToDefault : function () {
				this.data = angular.copy(defaultShareData);
			}

		,	setData : function (givens) {
				this.data.title = givens.title || defaultShareData.title;
				this.data.description = givens.description || defaultShareData.description;
				if (givens.imageUrl) {
					this.data.imageUrl = (givens.imageUrl.indexOf('http') !== -1 ) ? givens.imageUrl : config.api.imgUrl + givens.imageUrl;
				}else{
					this.data.imageUrl = defaultShareData.image_url;
				}
				if (givens.url) {
					this.data.url = (givens.url.indexOf('http') !== -1 ) ? givens.url : config.app.url + '/#!' + givens.url;
				}else{
					this.data.url = config.app.url + '/#!' + $location.path();
				}
			}
	}  
} ] );
