define('fir/datctrl/iface/FieldFormat', [], function() {
return FirClass(
	/**
	 * Интерфейс формата поля данных
	 */
	function IFieldFormat(opts) {}, {
		/**
		 * Возвращает имя поля, для которого определен этот формат
		 */
		getFieldName: function() {
			throw new Error('Not implemented yet!');
		},
		/**
		 * Возвращает строку, определяющую тип поля
		 */
		getType: function() {
			throw new Error('Not implemented yet!');
		}
});
});
