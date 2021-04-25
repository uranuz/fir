define('fir/ivy/RemoteModuleLoader', [
	'fir/datctrl/ivy/Deserializer',
	'fir/common/Deferred'
], function(
	IvyDeserializer,
	Deferred
) {
return FirClass(
function RemoteModuleLoader(endpoint) {
	if( !endpoint ) {
		throw Error('Endpoint URL required to load compiled templates!');
	}
	this._endpoint = endpoint;
	this._moduleObjects = {};
}, {
	get: function(moduleName) {
		return this._moduleObjects[moduleName];
	},

	clearCache: function() {
		for( var key in this._moduleObjects ) {
			if( this._moduleObjects.hasOwnProperty(key) ) {
				delete this._moduleObjects[key];
			}
		}
	},

	moduleObjects: function() {
		return this._moduleObjects;
	},

	load: function(moduleName) {
		var
			self = this,
			fResult = new Deferred();
		$.ajax(this._endpoint + '?moduleName=' + moduleName + '&appTemplate=no', {
			success: function(json) {
				fResult.resolve(self.parseModules(json.result), moduleName);
			},
			error: fResult.reject.bind(fResult)
		});
		return fResult;
	},

	parseModules: function(json) {
		var moduleObjects = json.moduleObjects;
		for( var i = 0; i < moduleObjects.length; ++i )
		{
			var rawModule = moduleObjects[i];
			if( this._moduleObjects.hasOwnProperty(rawModule.symbol) ) {
				return; // Module is loaded already. No need to spend time for deserialization
			}
			var moduleObject = IvyDeserializer.deserialize(rawModule);
			this._moduleObjects[moduleObject.symbol.name] = moduleObject;
		}
		return this._moduleObjects;
	}
});
});