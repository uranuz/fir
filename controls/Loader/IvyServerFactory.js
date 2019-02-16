define('fir/controls/Loader/IvyServerFactory', [
	"fir/common/globals",
	'fir/controls/Loader/Abstract',
	'ivy/Engine',
	'ivy/EngineConfig',
	'ivy/RemoteModuleLoader',
	'fir/network/json_rpc',
	'fir/datctrl/ivy/helpers',
	'fir/datctrl/ivy/UserRights',
	'fir/datctrl/ivy/UserIdentity',
	'ivy/utils'
], function(
	globals,
	LoaderAbstract,
	IvyEngine,
	IvyEngineConfig,
	RemoteModuleLoader,
	json_rpc,
	FirIvyHelpers,
	IvyUserRights,
	IvyUserIdentity,
	iu
) {
return FirClass(
	function IvyServerFactory() {
		this._ivyEngine = new IvyEngine(
			new IvyEngineConfig(),
			new RemoteModuleLoader('/dyn/server/template')
		);
	}, LoaderAbstract, {
		canLoad: function(opts) {
			return !!opts.method;
		},
		load: function(opts) {
			var
				prog,
				progData = {},
				extraGlobals = {
					userRights: new IvyUserRights(),
					userIdentity: new IvyUserIdentity()
				},
				// List of sources that should be retrieved before rendering
				// First source in template itself. The second is data from remote method.
				// These sources will be retrieved in parallel
				sources = [
					this._ivyEngine.getByModuleName.bind(this._ivyEngine, opts.ivyModule, function(res) {
						prog = res;
						tryRunRender();
					})
				],
				// Counter that is used to know when all sources are retrieved
				waitedSourcesCount = null;

			// Ivy module name is required!
			if( typeof(opts.ivyModule) !== 'string' && opts.ivyModule instanceof String ) {
				throw new Error('Ivy module name required!');
			}

			// There could be no remote method set for call. In this case just we don't call it
			// and will render plain Ivy template using only global params
			if( typeof(opts.method) === 'string' || opts.method instanceof String ) {
				sources.push(json_rpc.invoke.bind(this, {
					uri: "/jsonrpc/",
					method: opts.method,
					params: opts.params,
					success: function(data) {
						progData = FirIvyHelpers.tryExtractLvlContainers(data);
						tryRunRender();
					},
					error: function(res) {
						opts.error(res);
					}
				}));
			} else if( opts.method != null ) {
				throw new Error(`Method name must be string or null`);
			}

			waitedSourcesCount = sources.length;
			// Method that initialize actual rendering
			function tryRunRender() {
				--waitedSourcesCount;
				if( waitedSourcesCount > 0 ) {
					return;
				}
				progData.instanceName = opts.queryParams.instanceName; // TODO: fix this hardcode
				// There 2 modes for running Ivy: run module only or run certain method
				if( typeof(opts.ivyMethod) === 'string' || opts.ivyMethod instanceof String ) {
					prog.runMethod(opts.ivyMethod, progData, extraGlobals).then(
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