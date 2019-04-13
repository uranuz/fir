define('fir/security/right/GlobalVarSource', [
	'fir/security/right/iface/DataSource',
	'fir/datctrl/Deserializer'
], function(DataSource, Deserializer) {
return FirClass(
	function GlobalVarSource() {
		var
			right = window.userRightData.right,
			fields = ['rules', 'objects', 'roles', 'rights', 'groupObjects'];
		
		for( var i = 0; i < fields.length; ++i ) {
			this['_' + fields[i]] = (right != null? Deserializer.fromJSON(right[fields[i]]): null);
		}
	}, DataSource, {
		getRules: function() {
			return this._rules;
		},

		getObjects: function() {
			return this._objects;
		},

		getRoles: function() {
			return this._roles;
		},

		getRights: function() {
			return this._rights;
		},

		getGroupObjects: function() {
			return this._groupObjects;
		}
});
});
