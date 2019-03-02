define('fir/security/right/GlobalVarSource', [
	'fir/security/right/iface/DataSource',
	'fir/datctrl/helpers'
], function(DataSource, DataHelpers) {
return FirClass(
	function GlobalVarSource() {
		var
			right = window.userRightData.right,
			fields = ['rules', 'objects', 'roles', 'rights', 'groupObjects'];
		
		for( var i = 0; i < fields.length; ++i ) {
			this['_' + fields[i]] = (right != null? DataHelpers.fromJSON(right[fields[i]]): null);
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
