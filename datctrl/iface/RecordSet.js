define('fir/datctrl/iface/RecordSet', [], function() {
	"use strict";
return FirClass(
	function IRecordSet(opts) {}, {
		/**
		 * Возвращает формат набора записей типа RecordFormat
		 */
		getFormat: function() {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает количество записей в наборе
		 */
		getLength: function() {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает число полей в наборе записей
		 */
		getFieldCount: function() {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает запись по ее идентификатору
		 * @param {*} key Идентификатор записи
		 */
		getRecord: function(key) {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает запись по порядковому номеру index
		 * @param {Integer} index Порядковый номер
		 */
		getRecordAt: function(index) {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает значение первичного ключа по порядковому номеру index
		 * @param {Integer} index Порядковый номер
		 */
		getKey: function(index) {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает true, если в наборе имеется запись с ключом key, иначе - false
		 * @param {*} key Идентификатор записи
		 */
		hasKey: function(key) {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Добавление записи в набор записей
		 * @param {Record} rec Добавляемая запись
		 */
		append: function(rec) {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Удаление записи по идентификатору
		 * @param {*} key Идентификатор записи
		 */
		remove: function(key) {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает глубокую копию набора записей
		 */
		copy: function() {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает массив идентификаторов записей в наборе
		 */
		getKeys: function() {
			throw new Error('Not implemented yet!');
		}
});
});
