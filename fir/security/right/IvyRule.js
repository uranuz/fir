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
			var moduleName, methodName;

			if( splitted.length == 2 )
			{
				moduleName = splitted[0];
				methodName = splitted[1];
			}
			else
			{
				if( splitted[0] !== 'ivy' ) {
					throw new Error('Expected "ivy" prefix as first argument');
				}
				moduleName = splitted[1];
				methodName = splitted[2];
			}

			var
				res,
				asyncRes = this._ivyEngine.runMethod(
					moduleName,
					methodName, {
						identity: new IvyUserIdentity(identity),
						data: data
					});
			if( !asyncRes.isResolved )
				throw new Error('Expected Undef, Null or Boolean as rights check result');
			asyncRes.then(function(it) {
				res = it;
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
