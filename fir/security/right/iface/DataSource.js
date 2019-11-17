define('fir/security/right/iface/DataSource', [], function() {
return FirClass(
	function IRightDataSource() {
		throw new Error('Unable to create instance of abstract class IRightDataSource');
	}, {
		getRules: function() {
			return null;
		},

		getObjects: function() {
			return null;
		},

		getRoles: function() {
			return null;
		},

		getRights: function() {
			return null;
		},

		getGroupObjects: function() {
			return null;
		}
});
});
