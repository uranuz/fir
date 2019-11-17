define('fir/datctrl/RecordSetMixin', [
	'fir/datctrl/iface/RecordSet',
	'fir/datctrl/Record'
], function(IRecordSet, Record) {
	"use strict";
return FirClass(
	function RecordSetMixin(opts) {}, IRecordSet, {
		getFormat: function() {
			return this._fmt;
		},
		//Возвращает количество записей в наборе
		getLength: function() {
			return this._d.length;
		},
		//Возвращает запись по порядковому номеру index
		getRecordAt: function(index) {
			if( index < this._d.length )
				return this._d[index];
			else
				return null;
		},
		//Возвращает значение первичного ключа по порядковому номеру index
		getKey: function(index) {
			return this._d[index].get(this._fmt.getKeyFieldIndex());
		},
		//Возвращает порядковый номер поля первичного ключа в наборе записей
		getKeyFieldIndex: function() {
			return this._fmt.getKeyFieldIndex();
		},
		getKeys: function() {
			var
				keys = [],
				kfi = this._fmt.getKeyFieldIndex();
			for( var i = 0; i < this._d.length; ++i ) {
				keys.push(this._d[i].get(kfi));
			}
			return keys;
		}
});
});
