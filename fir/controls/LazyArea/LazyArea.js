define('fir/controls/LazyArea/LazyArea', [
	'fir/controls/FirControl',
	'fir/controls/ControlManager',
	'fir/common/Deferred',
	'fir/controls/Mixins/DialogConfig'
], function(
	FirControl,
	ControlManager,
	Deferred,
	DialogConfig
) {
return FirClass(
	function LazyArea(opts) {
		this.superproto.constructor.call(this, opts);
	}, FirControl, [DialogConfig], {
		open: function(config) {
			var def = new Deferred();
			config = this._prepareConfig(config);

			// При открытии шалона в области старое ее содержимое уничтожаем
			this.close();

			// Создаем плейсхолдер для компонента, который будет заменен на компонент
			config.target = $('<div class="' + this._elemFullClass('template') + '">')
				.appendTo(this._elems('container'));
			ControlManager.createControl(config).then(
				this._onTemplate_load.bind(this, def),
				def.reject);
			return def;
		},
		close: function() {
			// Удаляем дочерние компоненты
			this._destroyChildren();
			// Чистим остатки верстки...
			this._elems('container').empty();
		},
		_onTemplate_load: function(def, child) {
			this._childControls.push(child);
			// Перед уничтожением дочернего контрола будет сгенерировано событие
			child.once('onDestroy', this._onDialogControl_close.bind(this));

			// Оповестим, что диалог загрузился
			def.resolve(child);

			this._notify('dialogControlLoad', this._dialogControl);
		},
		_onDialogControl_close: function(ev) {
			// Оповестим о готовящемся уничтожении диалога
			this._notify('dialogControlDestroy', this._dialogControl);
		}
});
});