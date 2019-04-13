define('fir/datctrl/iface/Record', [], function() {
return FirClass(
	function IRecord(opts) {}, {
		/**
		 * Возвращает значение поля в записи
		 * @param {Integer|String} index Порядковый номер поля, либо название поля
		 * @param {*} defaultValue Значение по умолчанию, возвращаемое, если значения нет
		 */
		get: function(index, defaultValue) {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает число полей в записи
		 */
		getLength: function() {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает формат записи типа RecordFormat
		 */
		getFormat: function() {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает идентификатор записи
		 */
		getKey: function() {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Устанавливает значение в поле по индексу
		 * @param {Integer|String} index Номер поля, либо его имя
		 * @param {*} value Устанавливаемое значение, которое должно соответствовать типу поля
		 */
		set: function(index, value) {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает глубокую копию записи
		 */
		copy: function() {
			throw new Error('Not implemented yet!');
		}
});
});
