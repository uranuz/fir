define('fir/controls/CheckBoxList/CheckBoxList', [
	'fir/controls/FirControl',
	'css!fir/controls/CheckBoxList/CheckBoxList'
], function(FirControl) {
	__extends(CheckBoxList, FirControl);

	function CheckBoxList(opts) {
		opts = opts || {};
		FirControl.call(this, opts);

		this._block = this._elems('block');
		this._masterSwitchLabel = this._elems('masterSwitchLabel')
			.on('click', this.onMasterSwitch_Click.bind(this));
		this._masterSwitchInput = this._elems('masterSwitchInput');
		this._itemLabels = this._elems('itemLabel')
			.on('click', this.onItem_Click.bind(this));
		this._inputs = this._elems('itemInput');
	}

	return __mixinProto(CheckBoxList, {
		onMasterSwitch_Click: function() {
			for( var i = 0; i < this._inputs.length; ++i ) {
				var input = $(this._inputs[i]);
				input.prop('checked', this._masterSwitchInput.prop('checked'));
			}
		},
		onResetItem_Click: function() {

		},
		onItem_Click: function(ev) {
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
		}
	});
});
