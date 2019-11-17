define('fir/controls/Loader/IvyServerRender', [
	'fir/controls/Loader/Abstract',
	'fir/controls/Loader/Serializer',
	'fir/common/Deferred'
], function(
	LoaderAbstract,
	LoaderSerializer,
	Deferred
) {
/**
 * Class of control loader that creates request to Ivy view service to render control markup and returns it back
 */
return FirClass(
	function IvyServerRender() {
		
	}, LoaderAbstract, {
		canLoad: function(config) {
			return false;
		},
		load: function(config) {
			var def = new Deferred();
			config.deferred = def;
			for( var key in config.viewParams ) {
				if( !config.viewParams.hasOwnProperty(key) ) {
					continue;
				}
				config.queryParams[key] = config.viewParams[key];
			}
			var queryParams = LoaderSerializer.serialize(config.queryParams);
			$.ajax(config.URI + (queryParams? '?' + queryParams: ''), {
				success: def.resolve.bind(def),
				error: def.reject.bind(def),
				type: config.HTTPMethod,
				data: LoaderSerializer.serialize(config.bodyParams)
			});
			return def;
		}
	}
);
});