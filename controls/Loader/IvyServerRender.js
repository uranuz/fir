define('fir/controls/Loader/IvyServerRender', [
	'fir/controls/Loader/Abstract',
	'fir/controls/Loader/Serializer'
], function(LoaderAbstract, LoaderSerializer) {
/**
 * Class of control loader that creates request to Ivy view service to render control markup and returns it back
 */
return FirClass(
	function IvyServerRender() {
		
	}, LoaderAbstract, {
		canLoad: function(opts) {
			return !opts.method;
		},
		load: function(opts) {
			for( var key in opts.viewParams ) {
				if( !opts.viewParams.hasOwnProperty(key) ) {
					continue;
				}
				opts.queryParams[key] = opts.viewParams[key];
			}
			var queryParams = LoaderSerializer.serialize(opts.queryParams);
			$.ajax(opts.URI + (queryParams? '?' + queryParams: ''), {
				success: opts.success,
				error: opts.error,
				type: opts.HTTPMethod,
				data: LoaderSerializer.serialize(opts.bodyParams)
			});
		}
	}
);
});