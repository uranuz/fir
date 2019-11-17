define('fir/security/right/iface/RuleFactory', [], function() {
return FirClass(
	function IAccessRuleFactory() {
		throw new Error('Unable to create instance of abstract class IAccessRuleFactory');
	}, {
		get: function(name) {
			throw new Error('Not implemented yet!');
		}
});
});
