define('fir/controls/OpenDialog/OpenDialog', [
	'fir/controls/FirControl',
	'fir/controls/ControlManager',
	'css!fir/controls/OpenDialog/OpenDialog'
], function(FirControl, ControlManager) {
return FirClass(
	function OpenDialog(opts) {
		this.superproto.constructor.call(this, opts);
		this._config = opts.config;
		this._config.dialogOpts = this._config.dialogOpts || {};

		var dialogOpts = this._config.dialogOpts;
		// По-умолчанию создаем модальный диалог
		dialogOpts.modal = true;
		// Добавляем обработчик закрытия диалога
		dialogOpts.close = this._onDialogControl_close.bind(this);
	}, FirControl, {
		open: function(config) {
			config = this._prepareConfig(config);

			// Чистим все внутри обертки диалога
			this._elems('dialogWrapper').empty();

			// Добавляем div диалога в обертку
			this._dlg = $('<div class="' + this._elemFullClass('dialog') + '">')
				.appendTo(this._elems('dialogWrapper'));

			// Создаем плейсхолдер для компонента, который будет заменен на компонент
			config.target = $('<div>').appendTo(this._dlg);
			config.success = this._onDialogControl_load.bind(this, config.dialogOpts);
			ControlManager.createControl(config);
		},
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
		},
		close: function() {
			this._dlg.dialog('close');
		},
		_onDialogControl_load: function(dialogOpts, child) {
			this._dialogControl = child;
			// При уничтожении дочернего компонента сам диалог пусть тоже уничтожается
			this._dialogControl.once('onDestroy', this.close.bind(this));
			this._elems('dialog').dialog(dialogOpts);
			// Оповестим, что диалог загрузился
			this._notify('dialogControlLoad', this._dialogControl);
		},
		_onDialogControl_close: function(ev) {
			// Оповестим о готовящемся уничтожении диалога
			this._notify('dialogControlDestroy', this._dialogControl);
			this._dialogControl.destroy(); // УтАпить, а воду сжечь...
			this._dialogControl = null;
			this._dlg = null;
			this._elems('dialogWrapper').empty();
		}
});
});