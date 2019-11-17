define('fir/controls/Mixins/ItemList', [
	'fir/datctrl/iface/RecordSet'
], function(IRecordSet) {
'use strict';
return FirClass(
	function ItemList(opts) {
		if( opts.items != null && !(opts.items instanceof IRecordSet) ) {
			throw new Error('Expected instance of IRecordSet or null');
		}
		this._items = opts.items;
	}, {
		/**
		 * Возвращает список элементов которым владеет этот компонент
		 * Returns list of items owned by this component
		 */
		getItems: function() {
			return this._items;
		}
	}
);
})