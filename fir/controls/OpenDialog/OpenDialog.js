define('fir/controls/OpenDialog/OpenDialog', [
	'fir/controls/FirControl',
	'fir/controls/ControlManager',
	'fir/common/Deferred',
	'fir/controls/Mixins/DialogConfig',
	'fir/controls/OpenDialog/OpenDialog.scss'
], function(
	FirControl,
	ControlManager,
	Deferred,
	DialogConfig
) {
return FirClass(
	function OpenDialog(opts) {
		this.superproto.constructor.call(this, opts);
		this._config.dialogOpts = this._config.dialogOpts || {};

		var dialogOpts = this._config.dialogOpts;
		// По-умолчанию создаем модальный диалог
		dialogOpts.modal = true;
		// Добавляем обработчик закрытия диалога
		dialogOpts.close = this._onDialogControl_close.bind(this);
	}, FirControl, [DialogConfig], {
		open: function(config) {
			var def = new Deferred();
			config = this._prepareConfig(config);

			// Чистим все внутри обертки диалога
			this._elems('dialogWrapper').empty();

			// Добавляем div диалога в обертку
			this._dlg = $('<div class="' + this._elemFullClass('dialog') + '">')
				.appendTo(this._elems('dialogWrapper'));

			// Создаем плейсхолдер для компонента, который будет заменен на компонент
			config.target = $('<div>').appendTo(this._dlg);
			ControlManager.createControl(config).then(
				this._onDialogControl_load.bind(this, def, config.dialogOpts),
				def.reject.bind(def)
			);
			return def;
		},
		close: function() {
			this._dlg.dialog('close');
		},
		_onDialogControl_load: function(def, dialogOpts, child) {
			this._dialogControl = child;
			// При уничтожении дочернего компонента сам диалог пусть тоже уничтожается
			this._dialogControl.once('onDestroy', this.close.bind(this));
			this._elems('dialog').dialog(dialogOpts);
			def.resolve(this._dialogControl);
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