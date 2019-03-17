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

	function __getPrototype(obj) {
		return obj.prototype || Object.getPrototypeOf(obj)
	};

	function __checkOwnProp(obj, prop) {
		if( !__hasProp.call(obj, 'mixins') ) {
			throw new Error('Expected own property');
		}
	}

	var
		__hasProp = {}.hasOwnProperty,
		SPECIAL_FIELDS = [
			'constructor',
			'superproto',
			'superctor',
			'mixins'
		];
	function __extends(child, parent, mixins) {
		parent = parent || Object; // By default base is Object

		function classCtor() {} // Define prototype for class
		var parentProto = __getPrototype(parent); // Set up parent's class prototype as constructor's prototype

		classCtor.prototype = parentProto;

		var proto = new classCtor();

		__mixinProto(proto, mixins); // Mixin all properties into ctor

		proto.constructor = child; // Set up constructor function

		// Extra fields are: link to class parent's prototype
		proto.superproto = parentProto;
		// ... and special function to call parent's and all mixins constructors (if they are classes)
		proto.superctor = __superctor;

		// If prototype has its own mixin property then use it. If not then create it
		proto.mixins = mixins;

		// Check if they are all own properties
		__checkOwnProp(proto, 'constructor');
		__checkOwnProp(proto, 'prototype');
		__checkOwnProp(proto, 'superproto');
		__checkOwnProp(proto, 'superctor');
		__checkOwnProp(proto, 'mixins');

		child.prototype = proto;

		return child;
	}

	function __mixinProtoSingle(proto, src) {
		if( src == null ) {
			return proto;
		} else if( !(src instanceof Object) ) {
			throw new Error('Expected object as class mixin');
		}
		var props = (typeof(src) === 'function'? __getPrototype(src): src);
		for( key in props ) {
			// Don't copy Object's built in properties and special properties
			if(
				((typeof {}[key] == "undefined") || ({}[key] != props[key]))
				&& SPECIAL_FIELDS.indexOf(key) < 0
			) {
				proto[key] = props[key];
				__checkOwnProp(proto, key);
			}
		}

		return proto;
	}
	function __mixinProto(proto, src) {
		if( src == null )
			return proto;

		if( src instanceof Array ) {
			for( var i = 0; i < src.length; ++i ) {
				__mixinProtoSingle(proto, src[i]);
			}
		} else {
			__mixinProtoSingle(proto, src);
		}
		return proto;
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

		mixins = mixins || [];
		if( props != null ) {
			mixins.push(props);
		}
		return __extends(ctor, base, mixins);
	}
	window.FirClass = FirClass;
});