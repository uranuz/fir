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
			this._record = rec;
			this._reloadControl('itemWrapper');
			
			this._selectorDialog.close();
		},

		getRecord: function() {
			return this._record;
		},

		getSelectedKey: function() {
			return this._record? this._record.getKey(): null;
		},

		_getViewParams: function(areaName) {
			if( areaName === 'itemWrapper' ) {
				return {
					record: this.getRecord(),
					itemTemplate: this._itemTemplate,
					displayField: this._displayField,
					emptyText: this._emptyText
				};
			}
		}
});
});
