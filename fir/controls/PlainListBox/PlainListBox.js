define('fir/controls/PlainListBox/PlainListBox', [
	'fir/controls/FirControl',
	'fir/controls/PlainListBox/PlainListBox.scss'
], function(FirControl) {
return FirClass(
	function PlainListBox(opts) {
		this.superproto.constructor.call(this, opts);
	}, FirControl
);
});
