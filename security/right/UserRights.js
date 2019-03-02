define('fir/security/right/UserRights', [
	'fir/security/right/iface/Controller',
	'fir/security/right/UserIdentity'
], function(IRightController, UserIdentity) {
return FirClass(
	function UserRights(userIdentity, rightController) {
		if( !(userIdentity instanceof UserIdentity) ) {
			throw new Error('Expected user identity');
		}
		if( !(rightController instanceof IRightController) ) {
			throw new Error('Expected right controller');
		}
		this._userIdentity = userIdentity;
		this._controller = rightController;
	}, {
		hasRight: function(accessObject, accessKind, data) {
			return this._controller.hasRight(this._userIdentity, accessObject, accessKind, data);
		}
});
});
