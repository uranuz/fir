define('fir/datctrl/ivy/UserRights', [
	'ivy/types/data/iface/class_node',
	'fir/security/right/UserRights'
], function(ClassNode, UserRights) {
return FirClass(
	function IvyUserRights(rights) {
		if( !(rights instanceof UserRights) ) {
			throw new Error('Expected UserRights');
		}
		this._rights = rights;
		this._accessObject = null;
		this._accessKind = null;
		this._data = null;
	}, ClassNode, {
		/** Analogue to IvyData __getAttr__(string); in D impl */
		__getAttr__: function(name) {
			switch( name ) {
				case 'object': return this._accessObject;
				case 'kind': return this._accessKind;
				case 'data': return this._data;
				case 'hasRight': return this._rights.hasRight(this._accessObject, this._accessKind, this._data);
				default: throw new Error('Unexpected IvyUserRights attribute: ' + name);
			}
		},
		/** Analogue to void __setAttr__(IvyData, string); in D impl */
		__setAttr__: function(value, name) {
			switch( name ) {
				case 'object': this._accessObject = value; break;
				case 'kind': this._accessKind = value; break;
				case 'data': this._data = value; break;
				default: throw new Error('Unexpected IvyUserRights attribute: ' + name);
			}
		}
	});
});