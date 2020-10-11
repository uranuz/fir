define('fir/security/right/IvyRule', [
	'ivy/types/data/data',
	'ivy/types/data/consts',
	'ivy/engine',
	'fir/datctrl/ivy/UserIdentity'
], function(idat, IvyConst, IvyEngine, IvyUserIdentity) {
var IvyDataType = IvyConst.IvyDataType;
return FirClass(
	function IvyRule(ivyEngine, name) {
		if( name == null || name.length < 0 ) {
			throw new Error('Expected Ivy rule name');
		}
		if( !(ivyEngine instanceof IvyEngine) ) {
			throw new Error('Expected ivy engine');
		}
		this._name = name;
		this._ivyEngine = ivyEngine;
	}, {
		getName: function() {
			return this._name;
		},
		hasRight: function(identity, data) {
			var splitted = this._name.split(':');
			if( splitted.length < 2 ) {
				return false;
				//throw new Error('Expected at least module and directive names in ivy rule name');
			}
			var moduleName, dirName;

			if( splitted.length == 2 )
			{
				moduleName = splitted[0];
				dirName = splitted[1];
			}
			else
			{
				if( splitted[0] !== 'ivy' ) {
					throw new Error('Expected "ivy" prefix as first argument');
				}
				moduleName = splitted[1];
				dirName = splitted[2];
			}

			var ivyProg = this._ivyEngine.getByModuleName(moduleName);
			if( ivyProg == null ) {
				throw new Error('Ivy module has not been loaded');
			}

			var res = ivyProg.runMethodSync(dirName, {
				identity: new IvyUserIdentity(identity),
				data: data
			});
			
			if(![
				IvyDataType.Undef,
				IvyDataType.Null,
				IvyDataType.Boolean
			].includes(idat.type(res))) {
				throw new Error('Expected Undef, Null or Boolean as rights check result');
			}
			return !!res;
		}
});
});
