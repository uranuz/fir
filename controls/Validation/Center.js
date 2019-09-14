define('fir/controls/Validation/Center', [
	'fir/common/helpers'
], function(FirHelpers) {
return new (FirClass(
	function ValidationCenter() {
		this._popup = null;
		this._throttler = FirHelpers.throttle(this._popupThrottler, 200);
	}, {
		setPopup: function(popup) {
			if( this._popup && this._popup !== popup ) {
				this._popup.destroy();
			}
			this._popup = popup;
		},
		unsetPopup: function(popup) {
			if( this._popup && this._popup === popup ) {
				this._popup = null;
			}
		},
		_popupThrottler: function(fn) {
			fn();
		}
	}
))();
});
