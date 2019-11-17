define("fir/common/polyfill", [], function() {
	'use strict';

	// This is supported starting from IE9. So maybe it is not worth using this polyfill
	Function.prototype.bind = Function.prototype.bind || function bind(oThis) {
		if (typeof this !== 'function') {
			// ближайший аналог внутренней функции
			// IsCallable в ECMAScript 5
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
				fToBind = this,
				fNOP    = function() {},
				fBound  = function() {
					return fToBind.apply(this instanceof fNOP && oThis
								? this
								: oThis,
								aArgs.concat(Array.prototype.slice.call(arguments)));
				};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};

	// This method is not supported in IE at all. So use polyfill for this
	Number.isInteger = Number.isInteger || function isInteger(value) {
		return typeof value === 'number' && 
			isFinite(value) && 
			Math.floor(value) === value;
	};
});