define('fir/controls/Mixins/Validation/Validation', [
	'css!fir/controls/Mixins/Validation/Validation'
], function() {
// Because client-side template rendering not implemented yet so do it like that
var popupMarkup =
'<div class="fir-Validation e-popup">\
	<div class="fir-Validation e-topRow">\
		<div class="fir-Validation e-closeBtn">X</div>\
	</div>\
	<div class="fir-Validation e-message"></div>\
</div>';
	return {
		initValidation: function() {
			if( !this._validation && this._validators && this._validators.length ) {
				for( var i = 0; i < this._validators.length; ++i ) {
					var vld = this._validators[i];
					if( vld.elem && typeof(vld.fn) === 'function' ) {
						vld._bondValidator = this._elemValidationDoer.bind(this, vld);
						this._elems(vld.elem).on('blur', vld._bondValidator);
					}
				}
				var popup = $(popupMarkup).appendTo('body').hide();
				this._validation = {
					popup: popup,
					closeBtn: popup.find('.e-closeBtn'),
					message: popup.find('.e-message')
				};
				this._validation.closeBtn.on('click', this._onPopupCloseBtn_click.bind(this));
			}
		},
		_elemValidationDoer: function(vld, ev) {
			var
				elem = $(ev.currentTarget),
				result = vld.fn(vld, ev.currentTarget),
				popup = this._validation.popup;
			if( result != null && result !== true ) {
				var message = typeof(result) == 'string'? result: 'Field value is not valid';
				popup.find('.e-message').text(message);
				popup.show();
				popup.css({
					left: elem.offset().left,
					top: elem.offset().top - popup.outerHeight()
				}).show();
				elem.addClass('fir-IsInvalidField');
			} else {
				elem.removeClass('fir-IsInvalidField');
				popup.hide();
			}
		},
		_onPopupCloseBtn_click: function() {
			this._validation.popup.hide();
		}
	};
});
