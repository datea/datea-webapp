'use strict';

angular.module('dateaWebApp')
.service('Api', [
  '$resource'
, 'config'
, '$q'
, function Api(
  $resource
, config
, $q
) {
	var dateo = {};

	dateo.rsrc = $resource( config.api.url + 'dateo/?format=json', {}, {'query': { method: 'GET' }} );

	dateo.getDateoByUsername = function ( username ) {
		var dfd = $q.defer();
		dateo.rsrc.query( { user: username }, function ( response ) {
			dfd.resolve( response );
		} );
		return dfd.promise;
	}

	return { dateo : dateo };

} ] );
