define('fir/ivy/RemoteModuleLoader', [
	'fir/datctrl/ivy/Deserializer',
	'ivy/types/data/consts'
], function(
	IvyDeserializer
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

	add: function(moduleObj) {
		this._moduleObjects[moduleObj._name] = moduleObj;
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

	load: function(moduleName, callback) {
		var self = this;
		$.ajax(this._endpoint + '?moduleName=' + moduleName + '&generalTemplate=no', {
			success: function(json) {
				callback(self.parseModules(json.result), moduleName);
			},
			error: function(error) {
				console.error(error);
			}
		});
	},
	parseModules: function(json) {
		var moduleObjects = json.moduleObjects;
		for( var i = 0; i < moduleObjects.length; ++i )
		{
			var rawModule = moduleObjects[i];
			if( this._moduleObjects.hasOwnProperty(rawModule.symbol) ) {
				return; // Module is loaded already
			}
			var moduleObject = IvyDeserializer.deserialize(rawModule);
			this._moduleObjects[moduleObject.symbol.name] = moduleObject;
		}
		return this._moduleObjects;
	}
});
});