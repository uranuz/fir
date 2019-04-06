define('fir/datctrl/iface/RecordSet', [], function() {
	"use strict";
return FirClass(
	function IRecordSet(opts) {}, {
		getFormat: function() {
			throw new Error('Not implemented yet!');
		},
		copyFormat: function() {
			throw new Error('Not implemented yet!');
		},
		// Возвращает количество записей в наборе
		getLength: function() {
			throw new Error('Not implemented yet!');
		},
		// Возвращает число полей в наборе записей
		getFieldCount: function() {
			throw new Error('Not implemented yet!');
		},
		// Возвращает запись по ключу
		getRecord: function(key) {
			throw new Error('Not implemented yet!');
		},
		// Возвращает запись по порядковому номеру index
		getRecordAt: function(index) {
			throw new Error('Not implemented yet!');
		},
		// Возвращает значение первичного ключа по порядковому номеру index
		getKey: function(index) {
			throw new Error('Not implemented yet!');
		},
		// Возвращает true, если в наборе имеется запись с ключом key, иначе - false
		hasKey: function(key) {
			throw new Error('Not implemented yet!');
		},
		// Возвращает порядковый номер поля первичного ключа в наборе записей
		getKeyFieldIndex: function() {
			throw new Error('Not implemented yet!');
		},
		// Добавление записи rec в набор записей
		append: function(rec) {
			throw new Error('Not implemented yet!');
		},
		remove: function(key) {
			throw new Error('Not implemented yet!');
		},
		copy: function() {
			throw new Error('Not implemented yet!');
		},
		getKeys: function() {
			throw new Error('Not implemented yet!');
		}
});
});
