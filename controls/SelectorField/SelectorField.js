define('fir/controls/SelectorField/SelectorField', [
	'fir/controls/FirControl',
	'css!fir/controls/SelectorField/SelectorField'
], function(FirControl) {
'use strict';
return FirClass(
	function SelectorField(opts) {
		this.superctor(SelectorField, opts);
		this._selectorDialog = this.getChildByName(this.instanceName() + 'Dialog');
		this._selectorDialog.subscribe('dialogControlLoad', this._onDialogControl_load.bind(this));
		this._selectEventName = opts.selectEventName;
		if( !this._selectEventName ) {
			throw new Error('Не задана опция selectEventName, название события выбора элемента');
		}
		this._record = opts.record;
		this._emptyText = opts.emptyText;
		this._displayField = opts.displayField;
		this._subscr(function() {
			this._elems('selectBtn').on('click', this._onSelectBtn_click.bind(this));
		});
		this._unsubscr(function() {
			this._elems('selectBtn').off('click');
		});
	}, FirControl, {
		_onSelectBtn_click: function(ev) {
			this._selectorDialog.open({});
		},

		_onDialogControl_load: function(ev, control) {
			control.subscribe(this._selectEventName, this._onItem_select.bind(this));
		},

		_onItem_select: function(ev, rec) {
			if( rec != null ) {
				this._record = rec;
				this._elems('selectBtn').text(rec.get(this._displayField))
			} else {
				this._record = null;
				this._elems('selectBtn').text(this._emptyText);
			}
			this._selectorDialog.close();
		},

		getRecord: function() {
			return this._record;
		}
});
});
