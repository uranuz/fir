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

	/**
	 * Special method that could be used to call constructors of the base class and mixins
	 */
	function __superctor() {
		this.superproto.constructor.apply(this, arguments);
		for( var i = 0; i < this.mixins.length; ++i ) {
			var mixin = this.mixins[i];
			if( typeof mixin === 'function' ) {
				mixin.apply(this, arguments);
			}
		}
	}

	var __hasProp = {}.hasOwnProperty;
	function __extends(child, parent) {
		parent = parent || Object; // By default base is Object
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
		child.prototype.superctor = __superctor;

		return child;
	}

	var SPECIAL_FIELDS = [
		'constructor',
		'superproto',
		'superctor'
	];
	function __mixinProtoSingle(dst, src) {
		if( src == null ) {
			return dst;
		} else if( !(src instanceof Object) ) {
			throw new Error('Expected object as class mixin');
		}
		for( key in src ) {
			// Don't copy Object's built in properties
			if(
				((typeof {}[key] == "undefined") || ({}[key] != src[key]))
				&& SPECIAL_FIELDS.indexOf(key) < 0
			) {
				dst.prototype[key] = src[key];
			}
		}
		dst.prototype.mixins = dst.prototype.mixins || [];
		dst.prototype.mixins.push(src);

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

	/**
	 * Helper used to generate class emulation. Could be used in one of forms
	 * 1. FirClass(ctor, base, mixins, props)
	 * 2. FirClass(ctor, base, mixins)
	 * 3. FirClass(ctor, base)
	 * 4. FirClass(ctor, mixins)
	 * 5. FirClass(ctor, props)
	 * 
	 * Where:
	 * 	ctor - class constructor function
	 * 	base - base class constructor function
	 * 	mixins - array of mixins (mixins are objects). Mixins will be added to class prototype.
	 * 		So they are intended to be used to add methods and static propertied (not instance fields)
	 * 	props - single mixin that will me added to mixins. Used for convenience
	 * Returns original ctor argument, but modified by setting base class and properties from mixins
	 */
	function FirClass(ctor, maybeBase, maybeMixins, maybeProps) {
		var base, mixins, props;
		if( typeof(ctor) !== 'function' ) {
			throw new Error('Expected function as class constructor!');
		}
		if( typeof(maybeBase) === 'function' ) {
			base = maybeBase;
		} else if( maybeBase instanceof Array ) {
			mixins = maybeBase;
		} else if( maybeBase instanceof Object ) {
			props = maybeBase;
		} else if( maybeBase != null ) {
			throw new Error('Unexpected type of "maybeBase" argument');
		}

		if( maybeMixins instanceof Array ) {
			if( mixins ) {
				throw new Error('Duplicate mixins');
			}
			mixins = maybeMixins;
		} else if( maybeMixins instanceof Object && typeof(maybeMixins) !== 'function' ) {
			if( props ) {
				throw new Error('Duplicate props');
			}
			props = maybeMixins;
		} else if( maybeMixins != null ) {
			throw new Error('Unexpected type of "maybeMixins" argument');
		}

		if( maybeProps instanceof Object && typeof(maybeMixins) !== 'function' ) {
			if( props ) {
				throw new Error('Duplicate props');
			}
			props = maybeProps;
		} else if( maybeProps != null ) {
			throw new Error('Unexpected type of "maybeProps" argument');
		}

		__extends(ctor, base);

		mixins = mixins || [];
		mixins.push(props);
		return __mixinProto(ctor, mixins);
	}
	window.__extends = __extends;
	window.__mixinProto = __mixinProto;
	window.FirClass = FirClass;
});