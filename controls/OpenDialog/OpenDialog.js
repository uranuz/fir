define('fir/controls/OpenDialog/OpenDialog', [
	'fir/controls/FirControl',
	'fir/controls/ControlManager',
	'css!fir/controls/OpenDialog/OpenDialog'
], function(FirControl, ControlManager) {
return FirClass(
	function OpenDialog(opts) {
		this.superproto.constructor.call(this, opts);
		this._config = opts.config;
	}, FirControl, {
		open: function(config) {
			config = config || {};
			for( var key in this._config ) {
				if( !config.hasOwnProperty(key) ) {
					config[key] = this._config[key];
				}
			}
			this._elems('dialogWrapper').empty();
			this._dlg = $('<div class="' + this._elemFullClass('dialog') + '">')
				.appendTo(this._elems('dialogWrapper'));
			config.target = $('<div>').appendTo(this._dlg);
			config.success = this._onDialogControl_load.bind(this);
			ControlManager.createControl(config);
		},
		close: function() {
			this._dlg.dialog('close');
		},
		_onDialogControl_load: function(child) {
			var dialogOpts = {
				modal: true
			};
			if( this._config.dialogOpts ) {
				for( var key in this._config.dialogOpts ) {
					if (this._config.dialogOpts.hasOwnProperty(key)) {
						dialogOpts[key] = this._config.dialogOpts[key];
					}
				}
			}

			dialogOpts.close = this._onDialogControl_close.bind(this);

			this._dialogControl = child;
			this._elems('dialog').dialog(dialogOpts);
			// Оповестим, что диалог загрузился
			this._notify('dialogControlLoad', this._dialogControl);
		},
		_onDialogControl_close: function(ev) {
			// Оповестим о готовящемся уничтожении диалога
			this._notify('dialogControlDestroy', this._dialogControl);
			this._dialogControl.destroy();
			this._dialogControl = null;
			this._dlg = null;
			this._elems('dialogWrapper').empty();
		}
});
});