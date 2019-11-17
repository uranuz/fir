define('fir/datctrl/ivy/UserIdentity', [
	'ivy/ClassNode',
	'fir/security/right/UserIdentity',
	'fir/ivy/UnwrappableNode'
], function(ClassNode, UserIdentity, UnwrappableNode) {
return FirClass(
	function IvyUserIdentity(userIdentity) {
		if( !(userIdentity instanceof UserIdentity) ) {
			throw new Error('Expected UserIdentity');
		}
		this._userIdentity = userIdentity;
	}, ClassNode, [UnwrappableNode], {
		/** Analogue to IvyNodeRange opSlice(); in D impl */
		range: function() {
			throw new Error('Not implemented!');
		},
		/** Analogue to IClassNode opSlice(size_t, size_t); in D impl */
		slice: function(start, end) {
			throw new Error('Not implemented!');
		},
		/** Analogue to:
		 * IvyData opIndex(string);
		 * IvyData opIndex(size_t);
		 * in D impl */
		at: function(index) {
			throw new Error('Not implemented!');
		},
		/** Analogue to IvyData __getAttr__(string); in D impl */
		getAttr: function(name) {
			switch( name ) {
				case `id`: return this._userIdentity.id();
				case `name`: return this._userIdentity.name();
				case `data`: return this._userIdentity.data();
				case `isAuthenticated`: return this._userIdentity.isAuthenticated();
				case `accessRoles`: return this._userIdentity._accessRoles;
				default: throw new Error('Unexpected IvyUserIdentity attribute: ' + name);
			}
		},
		/** Analogue to void __setAttr__(IvyData, string); in D impl */
		setAttr: function(value, name) {
			throw new Error('IvyUserIdentity is read-only!');
		},
		/** Analogue to IvyData __serialize__(); in D impl */
		serialize: function() {
			throw new Error('Not implemented!');
		},
		/** Analogue to size_t length() @property; in D impl */
		getLength: function() {
			throw new Error('Not implemented!');
		},
		unwrap: function() {
			return this._userIdentity;
		}
});
});