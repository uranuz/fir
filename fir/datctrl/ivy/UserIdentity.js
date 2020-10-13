define('fir/datctrl/ivy/UserIdentity', [
	'ivy/types/data/base_class_node',
	'fir/security/right/UserIdentity',
	'fir/ivy/UnwrappableNode'
], function(BaseClassNode, UserIdentity, UnwrappableNode) {
return FirClass(
	function IvyUserIdentity(userIdentity) {
		if( !(userIdentity instanceof UserIdentity) ) {
			throw new Error('Expected UserIdentity');
		}
		this._userIdentity = userIdentity;
	}, BaseClassNode, [UnwrappableNode], {
		/** Analogue to IvyData __getAttr__(string); in D impl */
		__getAttr__: function(name) {
			switch( name ) {
				case `id`: return this._userIdentity.id();
				case `name`: return this._userIdentity.name();
				case `data`: return this._userIdentity.data();
				case `isAuthenticated`: return this._userIdentity.isAuthenticated();
				case `accessRoles`: return this._userIdentity._accessRoles;
				default: throw new Error('Unexpected IvyUserIdentity attribute: ' + name);
			}
		},
		unwrap: function() {
			return this._userIdentity;
		}
});
});