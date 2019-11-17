define('fir/security/right/iface/AccessRule', [], function() {
return FirClass(
	function IAccessRule(opts) {
		throw new Error('Unable to create instance of abstract class IAccessRule');
	}, {
		getName: function() {
			return null;
		},
		hasRight: function(identity, data) {
			return false;
		},
		toString: function() {
			return '';
		},
		toStdJSON: function() {
			return {};
		}
});
});
