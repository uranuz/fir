define('fir/datctrl/ivy/UserIdentity', [
	'ivy/ClassNode'
], function(ClassNode) {
	function IvyUserIdentity() {
		this._sessionId = null; 
		this._login = null;
		this._accessRoles = [];
		this._name = null;
		this._data = {};
	};
	__extends(IvyUserIdentity, ClassNode);
	return __mixinProto(IvyUserIdentity, {
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
				case `id`: return this._sessionId;
				case `name`: return this._name;
				case `data`: return this._data;
				case `isAuthenticated`: return true;
				case `accessRoles`: return this._accessRoles;
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
		}
	});
});