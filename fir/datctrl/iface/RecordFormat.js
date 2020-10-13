define('fir/datctrl/iface/RecordFormat', [], function(helpers) {
return FirClass(
	function IRecordFormat(opts) {}, {
		_reindex: function() {
			throw new Error('Not implemented yet!');
		},
		//Функция расширяет текущий формат, добавляя к нему format
		extend: function(format) {
			throw new Error('Not implemented yet!');
		},
		//Получить индекс поля по имени
		getIndex: function(name) {
			throw new Error('Not implemented yet!');
		},
		//Получить имя поля по индексу
		getName: function(index) {
			throw new Error('Not implemented yet!');
		},
		getFieldFormat: function(index) {
			throw new Error('Not implemented yet!');
		},
		getKeyFieldIndex: function() {
			throw new Error('Not implemented yet!');
		},
		equals: function(format) {
			throw new Error('Not implemented yet!');
		},
		copy: function() {
			throw new Error('Not implemented yet!');
		},
		length: firProperty(function() {
			throw new Error('Not implemented yet!');
		}),
		/** Выводит формат записи в JSON */
		toStdJSON: function() {
			throw new Error('Not implemented yet!');
		}
});
});
