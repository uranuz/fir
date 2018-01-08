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

		ctor.prototype = parent.prototype || Object.getPrototypeOf(parent);
		child.prototype = new ctor();
		child.prototype.superproto = ctor.prototype;

		return child;
	}

	function __mixinProtoSingle(dst, src) {
		for( key in src ) {
			//Don't copy Object's built in properties
			if(
				((typeof {}[key] == "undefined") || ({}[key] != src[key]))
				&& key != 'constructor' && key != 'superproto'
			) dst.prototype[key] = src[key];
		}

		return dst;
	}
	function __mixinProto(dst, src) {
		if( src == null )
			return dst;

		if( src instanceof Array ) {
			for( var i = 0; i < src.length; ++i ) {
				__mixinProtoSingle(dst, src[i]);
			}
		} else {
			__mixinProtoSingle(dst, src);
		}
		return dst;
	}
	window.__extends = __extends;
	window.__mixinProto = __mixinProto;
});