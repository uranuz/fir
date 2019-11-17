define('fir/controls/Validation/Popup/Popup', [
	'fir/controls/FirControl',
	'fir/controls/Validation/Popup/Popup.scss'
], function(FirControl) {
'use strict';
return FirClass(
	function ValidationPopup(opts) {
		this.superctor(ValidationPopup, opts);
		this._subscr(function() {
			this._elems('closeBtn').on('click', this._onPopupCloseBtn_click.bind(this));
		});
		this._unsubscr(function() {
			this._elems('closeBtn').off('click');
		})
	}, FirControl, {
		_onPopupCloseBtn_click: function() {
			this.destroy();
		}
});
});
