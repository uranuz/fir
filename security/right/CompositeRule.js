define('fir/security/right/CompositeRule', [
	'fir/security/right/iface/AccessRule'
], function(IAccessRule) {
var RulesRelation = {
	none: 0,
	and: 1,
	or: 2
};
return FirClass(
	function CompositeAccessRule(name, rel, rules) {
		if( typeof(name) !== 'string' && !(name instanceof String) ) {
			throw new Error('Expected string as access rule name!');
		}

		if( RulesRelation.hasOwnProperty(rel) ) {
			throw new Error('Expected value of RulesRelation type!');
		}

		if( !(rules instanceof Array) ) {
			throw new Error('Expected array of access rules!');
		}
		for( var i = 0; i < rules.length; ++i ) {
			if( !(rules[i] instanceof IAccessRule) ) {
				throw new Error('Item with index ' + i + ' is not instance of IAccessRule');
			}
		}
		this._name = name;
		this._rel = rel;
		this._rules = rules;
	}, IAccessRule, {
		RulesRelation: RulesRelation,

		getName: function() {
			return this._name;
		},
		hasRight: function(identity, data) {
			return this._deleg(identity, data);
		}
});
});
