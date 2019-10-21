define('fir/datctrl/ivy/Deserializer', [
	'exports',
	'fir/datctrl/Deserializer',
	'fir/datctrl/ivy/RecordSetAdapter',
	'fir/datctrl/ivy/RecordAdapter',
	'fir/datctrl/ivy/EnumFormatAdapter',
	'fir/datctrl/ivy/EnumAdapter',
	'fir/datctrl/ivy/FieldFormatAdapter',
	'fir/datctrl/ivy/RecordFormatAdapter',
	'fir/datctrl/Record',
	'fir/datctrl/RecordSet',
	'fir/datctrl/EnumFormat',
	'fir/datctrl/Enum',
	'fir/datctrl/FieldFormat',
	'fir/datctrl/RecordFormat',
	'ivy/Consts',
	'ivy/ModuleObject',
	'ivy/CodeObject',
	'ivy/ClassNode',
	'fir/ivy/UnwrappableNode'
], function(
	mod,
	Deserializer,
	RecordSetAdapter,
	RecordAdapter,
	EnumFormatAdapter,
	EnumAdapter,
	FieldFormatAdapter,
	RecordFormatAdapter,
	Record,
	RecordSet,
	EnumFormat,
	Enum,
	FieldFormat,
	RecordFormat,
	IvyConsts,
	ModuleObject,
	CodeObject,
	IClassNode,
	UnwrappableNode
) {

var IvyDataType = IvyConsts.IvyDataType;
mod.deserializeItem = function(node, moduleObj) {
	if( node === 'undef' ) {
		return undefined;
	} else if(
		node === null
		|| node === true || node === false || node instanceof Boolean
		|| typeof(node) === 'number' || node instanceof Number
		|| typeof(node) === 'string' || node instanceof String
	) {
		return node;
	} else if( node instanceof Array ) {
		return node; // Do we need deserialize inner items of array?
	} else if( node instanceof Object ) {
		if( node.hasOwnProperty('_t') && typeof(node._t) === 'number' ) {
			// It's Ivy-style serialized value
			switch( node._t ) {
				case IvyDataType.ModuleObject: {
					var
						consts = node.consts,
						moduleObj = new ModuleObject(node.fileName, consts, node.entryPointIndex);
					for( var i = 0; i < consts.length; ++i ) {
						consts[i] = mod.deserializeItem(consts[i], moduleObj);
					}
					return moduleObj;
				}

				case IvyDataType.CodeObject: {
					if( !(moduleObj instanceof ModuleObject) ) {
						throw new Error('ModuleObject is required to deserialize CodeObject')
					}
					return new CodeObject(node.name, node.instrs, moduleObj, node.attrBlocks);
				}
				case IvyDataType.DateTime:
					return new Date(con._v);
				default: break;
			}
		} else if( node.hasOwnProperty('t') && typeof(node.t) === 'string' ) {
			// It's webtank-style serialized value
			var
				typeStr = node.t,
				container = Deserializer.deserializeItem(node);
			if( container == null ) {
				return null; // Не шмогли...
			}
			switch( typeStr ) {
				case 'recordset':
					return new RecordSetAdapter(container);
				case 'record':
					return new RecordAdapter(container);
				case 'enum':
					return node.hasOwnProperty("d")? new EnumAdapter(container): new EnumFormatAdapter(container);
				case "date": case "dateTime": return container;
				default: break;
			}
		}
	}
	return null;
}

mod.unwrapOpts = function(optsNode) {
	if( optsNode instanceof Object ) {
		for( var key in optsNode ) {
			if( !optsNode.hasOwnProperty(key) ) {
				continue;
			}
			if( (optsNode[key] instanceof IClassNode) && optsNode[key].isInstanceOf(UnwrappableNode) ) {
				optsNode[key] = optsNode[key].unwrap();
			}
		}
	}
	return optsNode;
}

mod.wrapOpts = function(vp) {
	if( vp instanceof Object ) {
		for( var key in vp ) {
			if( !vp.hasOwnProperty(key) ) {
				continue;
			}
			if( vp[key] instanceof EnumFormat ) {
				vp[key] = new EnumFormatAdapter(vp[key]);
			} else if( vp[key] instanceof Enum ) {
				vp[key] = new EnumAdapter(vp[key]);
			} else if( vp[key] instanceof Record ) {
				vp[key] = new RecordAdapter(vp[key]);
			} else if( vp[key] instanceof RecordSet ) {
				vp[key] = new RecordSetAdapter(vp[key]);
			} else if( vp[key] instanceof FieldFormat ) {
				vp[key] = new FieldFormatAdapter(vp[key]);
			} else if( vp[key] instanceof RecordFormat ) {
				vp[key] = new RecordFormatAdapter(vp[key]);
			}
		}
	}
	return vp;
}

mod.deserialize = Deserializer.deserializeImpl.bind(null, mod.deserializeItem);
});