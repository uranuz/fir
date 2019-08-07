define('fir/controls/Validation/Center', [
], function() {
return new (FirClass(
	function ValidationCenter() {
		this._popup = null;
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
		}
	}
))();
});
