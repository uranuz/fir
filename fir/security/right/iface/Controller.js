define('fir/security/right/iface/Controller', [], function() {
return FirClass(
	function IRightController() {
		throw new Error('Unable to create instance of abstract class IRightController');
	}, {
		hasRight: function(user, accessObject, accessKind, data) {
			return false;
		}
});
});
