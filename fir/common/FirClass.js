define("fir/common/FirClass", [], function() {
	/** Special class that is used to declare properties */
	function FirProperty(descr) {
		if( descr == null ) {
			throw new Error('Expected property desriptor object arument');
		}
		this.descr = descr
	}
	
	/**
	 * Special method that could be used to call constructors of the base class and mixins
	 */
	function __superctor(ctor) {
		if( typeof(ctor) != 'function' ) {
			throw new Error('Expected class constructor function');
		}
		if( !(this instanceof ctor) ) {
			throw new Error('"this" in not instance of specified class');
		}
		var proto = this;
		while( proto ) {
			if( proto.constructor !== ctor ) {
				proto = proto.superproto;
				continue;
			}
			// We shouldn't pass proto argument to contructors
			var ctorArgs = Array.prototype.slice.call(arguments, 1); 
			proto.superproto.constructor.apply(this, ctorArgs);
			for( var i = 0; i < proto.mixins.length; ++i ) {
				var mixin = proto.mixins[i];
				if( typeof mixin === 'function' ) {
					mixin.apply(this, ctorArgs);
				}
			}
			return; // Constructor and mixins get called - so exit
		}
		// TODO: Implement calling constructors for class mixins
		throw new Error('Unable to find class with such constructor in inheritance chain');
	}

	function __isInstanceOf(classOrMixin, thisCtor) {
		thisCtor = thisCtor || __getPrototype(this);
		if( typeof(classOrMixin) !== 'function' ) {
			throw new Error('Expected class or mixin constructor function');
		}
		if( typeof(thisCtor.constructor) !== 'function' ) {
			throw new Error('This class or mixin constructor function');
		}
		if( this instanceof classOrMixin || thisCtor === classOrMixin || thisCtor instanceof classOrMixin ) {
			return true;
		}
		if( thisCtor.mixins == null ) {
			return false;
		}
		for( var i = 0; i < thisCtor.mixins.length; ++i ) {
			var mixin = thisCtor.mixins[i];
			if( typeof mixin === 'function' ) {
				if( this.isInstanceOf(classOrMixin, mixin) ) {
					return true;
				}
			}
		}
		return false;
	}

	function __getPrototype(obj) {
		return obj.prototype || Object.getPrototypeOf(obj)
	};

	function __checkOwnProp(obj, prop) {
		if( !__hasProp.call(obj, prop) && obj[prop] != null ) {
			throw new Error('Expected own property');
		}
	}

	var
		__hasProp = {}.hasOwnProperty,
		SPECIAL_FIELDS = [
			'constructor',
			'prototype',
			'superproto',
			'superctor',
			'mixins',
			'isInstanceOf'
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

		proto.isInstanceOf = __isInstanceOf;

		// Check if they are all own properties
		for( var i = 0; i < SPECIAL_FIELDS.length; ++i ) {
			__checkOwnProp(proto, SPECIAL_FIELDS[i]);
		}

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
			var prop = props[key];
			// Don't copy Object's built in properties and special properties
			if(
				((typeof {}[key] == "undefined") || ({}[key] != prop))
				&& SPECIAL_FIELDS.indexOf(key) < 0
			) {
				
				if( prop instanceof FirProperty ) {
					// Detected instance of property descriptor
					Object.defineProperty(proto, key, prop.descr);
				} else {
					proto[key] = prop;
				}
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
	window.firProperty = function(descr) {
		return new FirProperty(descr);
	};
	return FirClass;
});