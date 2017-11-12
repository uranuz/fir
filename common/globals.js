define("fir/common/globals", [], function() {
	if (!Function.prototype.bind) {
		Function.prototype.bind = function(oThis) {
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
	}

	var __hasProp = {}.hasOwnProperty;
	function __extends(child, parent) {
		for (var key in parent) {
			if (__hasProp.call(parent, key))
				child[key] = parent[key];
		}

		function ctor() {
			this.constructor = child;
		}

		ctor.prototype = parent.prototype;

		child.prototype = new ctor();
		child.__super__ = parent.prototype;

		return child;
	}

	function __mixinProto(dst, src) {
		for( key in src ) {
			//Don't copy Object's built in properties
			if( (typeof {}[key] == "undefined") || ({}[key] != src[key]) )
				dst.prototype[key] = src[key];
		}

		return dst;
	}
	window.__extends = __extends;
	window.__mixinProto = __mixinProto;
});