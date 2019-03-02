define('fir/controls/Loader/IvyServerRender', [
	'fir/controls/Loader/Abstract'
], function(LoaderAbstract) {
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
			var queryParams = this.serialize(opts.queryParams);
			$.ajax(opts.URI + (queryParams? '?' + queryParams: ''), {
				success: opts.success,
				error: opts.error,
				type: opts.HTTPMethod,
				data: this.serialize(opts.bodyParams)
			});
		},
		linearizeObj: function(params, res, pre) {
			res = res || {};
			pre = pre || '';
			// TODO: implement data serialization logic
			if( params === null ) {
				res[pre] = 'null';
			} else if( params === true ) {
				res[pre] = 'true';
			} else if( params === false ) {
				res[pre] = 'false'
			} else if( typeof(params) === 'number' || params instanceof Number ) {
				res[pre] = String(params);
			} else if( typeof(params) === 'string' || params instanceof String ) {
				res[pre] = params;
			} else if( params instanceof Array ) {
				res[pre] = JSON.stringify(params);
			} else if( params instanceof Date ) {
				res[pre] = params.toISOString();
			} else if( params instanceof Object ) {
				for( var key in params ) {
					if( !params.hasOwnProperty(key) ) {
						continue;
					}
					this.linearizeObj(params[key], res, (pre? pre + '__': '') + key);
				}
			} else if( params !== undefined ) {
				throw new Error('Unexpected thing happened during serialization!');
			}
			return res;
		},
		serialize: function(params) {
			var
				res = '',
				linear = this.linearizeObj(params);
			if( !(linear instanceof Object) ) {
				throw new Error('Expected linearized object');
			}
			for( var key in linear ) {
				if( !linear.hasOwnProperty(key) ) {
					continue;
				}
				var items = (linear[key] instanceof Array)? linear[key]: [linear[key]];
				for( var i = 0; i < items.length; ++i ) {
					if( res ) {
						res += '&';
					}
					res += encodeURIComponent(key) + '=' + encodeURIComponent(items[i]);
				}
			}
			return res;
		}
	}
);
});