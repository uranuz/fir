define('fir/controls/Mixins/MultiSelect', [
	'fir/controls/Mixins/ItemList'
], function(ItemList) {
'use strict';
return FirClass(
	function MultiSelect() {
		ItemList.apply(this, arguments);
	}, ItemList, {
		/**
		 * Возвращает ключи выбранных элементов из списка
		 * Returns keys of selected items from items list
		 */
		getSelectedKeys: function() {
			return this._getSelectedImpl(/*forKeys=*/true);
		},
		/**
		 * Возвращает выбранные элементы из списка
		 * Returns selected items from items list
		 */
		getSelectedItems: function() {
			return this._getSelectedImpl(/*forKeys=*/false);
		},
		_getSelectedImpl: function(forKeys) {
			if( forKeys !== true && forKeys !== false ) {
				throw new Error('forKeys argument should be true or false');
			}
			if( this._items == null ) {
				return [];
			}
			var
				rawKeys = this._getRawSelectedKeys(),
				selected = [];
			for( var i = 0; i < rawKeys.length; ++i ) {
				var rec = this._items.getRecord(rawKeys[i]);
				selected.push(forKeys? rec.getKey(): rec);
			}
			return selected;
		},
		_getRawSelectedKeys: function() {
			throw new Error('Method should be implemented in order to return raw selected keys');
		}
	}
);
})