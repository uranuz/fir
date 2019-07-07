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
		canLoad: function(config) {
			return true;
		},
		load: function(config) {
			// Ivy module name is required!
			if( typeof(config.ivyModule) !== 'string' && !(config.ivyModule instanceof String) ) {
				throw new Error('Ivy module name required!');
			}

			if( typeof(config.ivyMethod) !== 'string' && !(config.ivyMethod instanceof String) ) {
				throw new Error('Ivy view method name required!');
			}

			this._ivyEngine.getByModuleName(config.ivyModule, this._onIvyModule_load.bind(this, config));
		},

		_getExtraGlobals: function() {
			return {
				userIdentity: new IvyUserIdentity(this._userIdentity),
				userRights: new IvyUserRights(this._userRights),
				vpaths: this._vpaths
			}
		},

		_onIvyModule_load: function(config, prog) {
			var modRes = prog.runSaveState({}, this._getExtraGlobals());
			config.interp = modRes.interp;
			modRes.asyncResult.then(
				this._onIvyModule_init.bind(this, config),
				function(error) {
					config.error(res);
				});
		},

		_onIvyModule_init: function(config) {
			var defOpts = config.interp.getDirAttrDefaults(config.ivyMethod, ['RPCMethod']);
			// Если опция RPCMethod в config задана в null или пустую строку, то это значит, что мы не хотим,
			// чтобы вызывался метод. Но если опция RPCMethod отсутствует (undefined), то используем значение
			// по-умолчанию из опций компонента по умолчанию
			if( typeof(config.RPCMethod) === 'undefined' ) {
				config.RPCMethod = defOpts.RPCMethod;
			}

			if( config.RPCMethod != null && typeof(config.RPCMethod) !== 'string' && !(config.RPCMethod instanceof String) ) {
				throw new Error(`Method name must be string or empty`);
			}

			if( config.RPCMethod ) {
				json_rpc.invoke({
					uri: "/jsonrpc/",
					method: config.RPCMethod,
					params: this._getRPCParams(config),
					success: this._onData_load.bind(this, config),
					error: function(res) {
						config.error(res);
					}
				});
			} else {
				this._onData_load(config, {});
			}
		},

		_getRPCParams: function(config) {
			var
				RPCParams = {},
				paramFields = ['queryParams', 'bodyParams'];
			// Merge all queryParams and bodyParams into RPCParams
			for( var i = 0; i < paramFields.length; ++i ) {
				var
					field = paramFields[i],
					pars = config[field];
				for( var key in pars ) {
					if( pars.hasOwnProperty(key) ) {
						RPCParams[key] = pars[key];
					}
				}
			}
			return RPCParams;
		},

		_onData_load: function(config, rawData) {
			var data = IvyDeserializer.deserialize(rawData);
			// Put additional view params to pass into Ivy
			for( var key in config.viewParams ) {
				if( config.viewParams.hasOwnProperty(key) ) {
					data[key] = config.viewParams[key];
				}
			}

			config.interp.runModuleDirective(config.ivyMethod, data, this._getExtraGlobals()).then(
				function(res) {
					config.success(iu.toString(res));
				},
				function(res) {
					config.error(res);
				});
		}
	}
);
});
