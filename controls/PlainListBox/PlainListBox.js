define('fir/controls/PlainListBox/PlainListBox', [
	'fir/controls/FirControl',
	'css!fir/controls/PlainListBox/PlainListBox'
], function(FirControl) {
return FirClass(
	function PlainListBox(opts) {
		this.superproto.constructor.call(this, opts);
	}, FirControl
);
});
