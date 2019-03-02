define('fir/security/right/IvyRuleFactory', [
	'fir/security/right/iface/RuleFactory',
	'fir/security/right/IvyRule',
	'ivy/Engine'
], function(IAccessRuleFactory, IvyRule, IvyEngine) {
return FirClass(
	function IvyRuleFactory(ivyEngine) {
		if( !(ivyEngine instanceof IvyEngine) ) {
			throw new Error('Expected ivy engine');
		}
		this._ivyEngine = ivyEngine;
	}, IAccessRuleFactory, {
		get: function(name) {
			return new IvyRule(this._ivyEngine, name);
		}
	}
);
});
