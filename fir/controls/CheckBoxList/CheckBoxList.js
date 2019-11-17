define('fir/controls/CheckBoxList/CheckBoxList', [
	'fir/controls/FirControl',
	'fir/controls/Mixins/MultiSelect',
	'fir/controls/CheckBoxList/CheckBoxList.scss'
], function(FirControl, MultiSelect) {
'use strict';
return FirClass(
	function CheckBoxList(opts) {
		this.superctor(CheckBoxList, opts);

		this._block = this._elems('block');
		this._masterSwitchLabel = this._elems('masterSwitchLabel')
			.on('click', this._onMasterSwitch_Click.bind(this));
		this._masterSwitchInput = this._elems('masterSwitchInput');
		this._itemLabels = this._elems('itemLabel')
			.on('click', this._onItem_Click.bind(this));
		this._inputs = this._elems('itemInput');
	}, FirControl, [MultiSelect], {
		_onMasterSwitch_Click: function() {
			for( var i = 0; i < this._inputs.length; ++i ) {
				var input = $(this._inputs[i]);
				input.prop('checked', this._masterSwitchInput.prop('checked'));
			}
		},
		_onItem_Click: function(ev) {
			var
				allChecked = true,
				allUnchecked = true,
				input;

			for( var i = 0; i < this._inputs.length; ++i ) {
				input = $(this._inputs[i]);
				if( input.prop('checked') ) {
					allUnchecked = false;
				} else {
					allChecked = false;
				}
				if( !allUnchecked && !allChecked )
					break;
			}

			if( !allChecked && !allUnchecked ) {
				this._masterSwitchInput.prop('indeterminate', true);
			} else {
				this._masterSwitchInput.prop('indeterminate', false);
				if( allUnchecked ) {
					this._masterSwitchInput.prop('checked', false);
				} else if( allChecked ) {
					this._masterSwitchInput.prop('checked', true);
				}
			}
		},
		_getRawSelectedKeys: function() {
			var
				inpElems = this._elems('itemInput'),
				keys = [];
			inpElems.each(function(i, inp) {
				if( inp.checked ) {
					keys.push(inp.value);
				}
			});
			return keys;
		}
});
});
