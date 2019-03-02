define('fir/security/right/PlainRule', [
	'fir/security/right/iface/AccessRule'
], function(IAccessRule) {
return FirClass(
	function PlainAccessRule(name, deleg) {
		if( typeof(name) !== 'string' && !(name instanceof String) ) {
			throw new Error('Expected string as access rule name!');
		}
		if( typeof(deleg) !== 'function' ) {
			throw new Error('Expected function as access rule delegate!');
		}
		this._name = name;
		this._deleg = deleg;
	}, IAccessRule, {
		getName: function() {
			return this._name;
		},
		hasRight: function(identity, data) {
			return this._deleg(identity, data);
		}
});
});
