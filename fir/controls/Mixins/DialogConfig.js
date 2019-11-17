define('fir/controls/Mixins/DialogConfig', [], function() {
return {
	// Добавляет в конфиг опции по умолчанию "из шаблона" OpenDialog
	_prepareConfig: function(config) {
		config = config || {};
		// Мерджим параметры конфигурации по-умолчанию
		for( var key in this._config ) {
			if( !config.hasOwnProperty(key) ) {
				config[key] = this._config[key];
			}
		}

		// Мерджим опции диалога по-умолчанию
		for( var key in this._config.dialogOpts ) {
			if( !config.dialogOpts.hasOwnProperty(key) ) {
				config.dialogOpts[key] = this._config.dialogOpts[key];
			}
		}
		return config;
	}
};
});