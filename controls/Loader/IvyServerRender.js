define('fir/controls/Loader/IvyServerRender', [
	"fir/common/globals",
	'fir/controls/Loader/Abstract'
], function(globals, LoaderAbstract) {
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
			$.ajax(opts.URI + (opts.HTTPMethod === 'post'? '?' + $.param(opts.queryParams): ''), {
				success: opts.success,
				error: opts.error,
				type: opts.HTTPMethod,
				data: (opts.HTTPMethod === 'post'? opts.bodyParams: opts.queryParams)
			});
		}
	}
);
});