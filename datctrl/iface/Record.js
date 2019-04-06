define('fir/datctrl/iface/Record', [], function() {
return FirClass(
	function IRecord(opts) {}, {
		//Метод получения значения из записи по имени поля
		get: function(index, defaultValue) {
			throw new Error('Not implemented yet!');
		},
		getLength: function() {
			throw new Error('Not implemented yet!');
		},
		getFormat: function() {
			throw new Error('Not implemented yet!');
		},
		copyFormat: function() {
			throw new Error('Not implemented yet!');
		},
		getKey: function() {
			throw new Error('Not implemented yet!');
		},
		getKeyFieldIndex: function() {
			throw new Error('Not implemented yet!');
		},
		set: function() {
			throw new Error('Not implemented yet!');
		},
		copy: function() {
			throw new Error('Not implemented yet!');
		}
});
});
