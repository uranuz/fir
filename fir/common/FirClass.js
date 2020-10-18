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
				if( typeof(mixin) !== 'function' ) {
					continue;
				}
				mixin.apply(this, ctorArgs);
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

	function __getParentProps(proto) {
		var
			res = {},
			mixins = proto.mixins || [],
			props = proto.props || {};
		// Passing through all the mixins for this class and try to find their Fir
		for( var i = 0; i < mixins.length; ++i ) {
			var mixin = mixins[i];
			var
				mixinProto = __getPrototype(mixin),
				parentProps = __getParentProps(mixinProto);
			for( var key in parentProps ) {
				if( !parentProps.hasOwnProperty(key) ) {
					continue;
				}
				res[key] = parentProps[key];
			}
		}
		for( var key in props ) {
			if( !props.hasOwnProperty(key) ) {
				continue;
			}
			var prop = props[key];
			// Taking FirProperty instances
			if( !(prop instanceof FirProperty) ) {
				continue;
			}
			res[key] = prop;
		}
		return res;
	}

	var
		__hasProp = {}.hasOwnProperty,
		SPECIAL_FIELDS = [
			'constructor',
			'prototype',
			'superproto',
			'superctor',
			'mixins',
			'isInstanceOf',
			'props'
		];
	function __extends(child, parent, mixins) {
		parent = parent || Object; // By default base is Object

		function classCtor() {} // Define prototype for class
		var parentProto = __getPrototype(parent); // Set up parent's class prototype as constructor's prototype

		classCtor.prototype = parentProto;

		var proto = new classCtor();

		// If prototype has its own mixin property then use it. If not then create it
		proto.mixins = mixins;

		// Contains property descriptors
		proto.props = {};

		__mixinProto(proto); // Mixin all properties into ctor

		proto.constructor = child; // Set up constructor function

		// Extra fields are: link to class parent's prototype
		proto.superproto = parentProto;
		// ... and special function to call parent's and all mixins constructors (if they are classes)
		proto.superctor = __superctor;

		proto.isInstanceOf = __isInstanceOf;

		// Check if they are all own properties
		for( var i = 0; i < SPECIAL_FIELDS.length; ++i ) {
			__checkOwnProp(proto, SPECIAL_FIELDS[i]);
		}

		child.prototype = proto;

		return child;
	}

	function __mixinProtoSingle(proto, mixin) {
		if( mixin == null ) {
			return proto;
		} else if( !(mixin instanceof Object) ) {
			throw new Error('Expected object as class mixin');
		}
		var props = (typeof(mixin) === 'function'? __getPrototype(mixin): mixin);
		for( var key in props ) {
			var prop = props[key];
			if( SPECIAL_FIELDS.includes(key) ) {
				// These fields are special so do nothing with them
				continue;
			}
			// Don't copy Object's built in properties
			// If typeof built-in property of Object is undefined then there is no such property.
			// Otherwise if values of property of Object not equal with our value
			// then it means that we shall override built-in property of Object
			if( (typeof {}[key] !== "undefined") && ({}[key] === prop) ) {
				continue;
			}
			if( prop instanceof FirProperty ) {
				// Detected instance of property descriptor
				// Add it to props and shall define later
				proto.props[key] = prop;
			} else {
				proto[key] = prop;
				__checkOwnProp(proto, key);
			}
		}

		return proto;
	}
	function __mixinProto(proto) {
		var mixins = proto.mixins;
		if( mixins == null )
			return proto;
		for( var i = 0; i < mixins.length; ++i ) {
			__mixinProtoSingle(proto, mixins[i]);
		}
		var props = __getParentProps(proto);
		for( var key in props ) {
			if( !props.hasOwnProperty(key) ) {
				continue;
			}
			var prop = props[key];
			Object.defineProperty(proto, key, prop.descr);
			__checkOwnProp(proto, key);
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

	/** 
	 * Allows to define properties in FirClass
	 */
	window.firProperty = function(getterOrDescr, setter) {
		var descr;
		if( getterOrDescr instanceof Object && typeof(getterOrDescr) !== 'function' ) {
			if( setter != null ) {
				throw new Error('If property descriptor is passed as first argument then setter arument is not allowed')
			}
			descr = getterOrDescr;
		} else {
			descr = {};
			if( typeof(getterOrDescr) === 'function' ) {
				descr.get = getterOrDescr
			}
			if( typeof(setter) === 'function' ) {
				descr.set = setter;
			}
		}
		return new FirProperty(descr);
	};

	/**
	 * Allows to create object that could be created without new.
	 * Supports up to 7 parameters (for now), because of limited implementation.
	 * Why 7? Because it's lucky number (I want to believe)
	 */
	window.firPODCtor = function(self, args) {
		var Klass = args.callee;
		if( typeof(Klass) !== 'function' ) {
			throw new Error('Expected "arguments" object of class constructor');
		}
		if( self instanceof Klass ) {
			return null;
		}
		switch( args.length ) {
			case 0: return new Klass;
			case 1: return new Klass(args[0]);
			case 2: return new Klass(args[0], args[1]);
			case 3: return new Klass(args[0], args[1], args[2]);
			case 4: return new Klass(args[0], args[1], args[2], args[3]);
			case 5: return new Klass(args[0], args[1], args[2], args[3], args[4]);
			case 6: return new Klass(args[0], args[1], args[2], args[3], args[4], args[5]);
			case 7: return new Klass(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
			default: throw new Error('To many arguments in POD ctor');
		}
	}
	return FirClass;
});