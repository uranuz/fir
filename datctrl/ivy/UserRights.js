define('fir/datctrl/ivy/UserRights', [
	'ivy/ClassNode'
], function(ClassNode) {
	function IvyUserRights() {
		this._accessObject = null;
		this._accessKind = null;
		this._data = null;
	};
	__extends(IvyUserRights, ClassNode);
	return __mixinProto(IvyUserRights, {
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
				case 'object': return this._accessObject;
				case 'kind': return this._accessKind;
				case 'data': return this._data;
				case 'hasRight': return true; // TODO: Do actual rights check
				default: throw new Error('Unexpected IvyUserRights attribute: ' + name);
			}
		},
		/** Analogue to void __setAttr__(IvyData, string); in D impl */
		setAttr: function(value, name) {
			switch( name ) {
				case 'object': this._accessObject = value; break;
				case 'kind': this._accessKind = value; break;
				case 'data': this._data = value; break;
				default: throw new Error('Unexpected IvyUserRights attribute: ' + name);
			}
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