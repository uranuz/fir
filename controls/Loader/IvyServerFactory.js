define('fir/controls/Loader/IvyServerFactory', [
	'fir/controls/Loader/Abstract',
	'ivy/Engine',
	'fir/security/right/UserIdentity',
	'fir/security/right/UserRights',
	'fir/network/json_rpc',
	'fir/datctrl/ivy/Deserializer',
	'fir/datctrl/ivy/UserRights',
	'fir/datctrl/ivy/UserIdentity',
	'ivy/utils'
], function(
	LoaderAbstract,
	IvyEngine,
	UserIdentity,
	UserRights,
	json_rpc,
	IvyDeserializer,
	IvyUserRights,
	IvyUserIdentity,
	iu
) {
return FirClass(
	function IvyServerFactory(engine, userIdentity, userRights, vpaths) {
		if( !(engine instanceof IvyEngine) ) {
			throw new Error('Expected instance of IvyEngine');
		}
		if( !(userIdentity instanceof UserIdentity) ) {
			throw new Error('Expected instance of UserIdentity');
		}
		if( !(userRights instanceof UserRights) ) {
			throw new Error('Expected instance of UserRights');
		}
		this._ivyEngine = engine;
		this._userIdentity = userIdentity;
		this._userRights = userRights;
		this._vpaths = vpaths;
	}, LoaderAbstract, {
		canLoad: function(opts) {
			return !!opts.RPCMethod;
		},
		load: function(opts) {
			var
				prog,
				paramFields = ['queryParams', 'bodyParams'],
				RPCParams = {},
				progData = {},
				extraGlobals = {
					userIdentity: new IvyUserIdentity(this._userIdentity),
					userRights: new IvyUserRights(this._userRights),
					vpaths: this._vpaths
				},
				// List of sources that should be retrieved before rendering
				// First source in template itself. The second is data from remote method.
				// These sources will be retrieved in parallel
				sources = [
					this._ivyEngine.getByModuleName.bind(this._ivyEngine, opts.viewModule, function(res) {
						prog = res;
						tryRunRender();
					})
				],
				// Counter that is used to know when all sources are retrieved
				waitedSourcesCount = null;

			// Ivy module name is required!
			if( typeof(opts.viewModule) !== 'string' && opts.viewModule instanceof String ) {
				throw new Error('Ivy module name required!');
			}

			// Merge all queryParams and bodyParams into RPCParams
			for( var i = 0; i < paramFields.length; ++i ) {
				var
					field = paramFields[i],
					pars = opts[field];
				for( var key in pars ) {
					if( pars.hasOwnProperty(key) ) {
						RPCParams[key] = pars[key];
					}
				}
			}

			// There could be no remote method set for call. In this case just we don't call it
			// and will render plain Ivy template using only global params
			if( typeof(opts.RPCMethod) === 'string' || opts.RPCMethod instanceof String ) {
				sources.push(json_rpc.invoke.bind(this, {
					uri: "/jsonrpc/",
					method: opts.RPCMethod,
					params: RPCParams,
					success: function(data) {
						progData = IvyDeserializer.deserialize(data);
						tryRunRender();
					},
					error: function(res) {
						opts.error(res);
					}
				}));
			} else if( opts.RPCMethod != null ) {
				throw new Error(`Method name must be string or null`);
			}

			waitedSourcesCount = sources.length;
			// Method that initialize actual rendering
			function tryRunRender() {
				--waitedSourcesCount;
				if( waitedSourcesCount > 0 ) {
					return;
				}
				// Put additional view params to pass into Ivy
				for( var key in opts.viewParams ) {
					if( opts.viewParams.hasOwnProperty(key) ) {
						progData[key] = opts.viewParams[key];
					}
				}

				// There 2 modes for running Ivy: run module only or run certain method
				if( typeof(opts.viewMethod) === 'string' || opts.viewMethod instanceof String ) {
					prog.runMethod(opts.viewMethod, progData, extraGlobals).then(
						function(res) {
							opts.success(iu.toString(res));
						},
						function(res) {
							opts.error(res);
						}
					);
				} else {
					prog.run(progData, extraGlobals).then(
						function(res) {
							opts.success(iu.toString(res));
						},
						function(res) {
							opts.error(res);
						}
					);
				}
			}
			for( var i = 0; i < sources.length; ++i ) {
				sources[i]();
			}
		}
	}
);
});
