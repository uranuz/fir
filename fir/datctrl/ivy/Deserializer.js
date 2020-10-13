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
	'ivy/types/data/consts',
	'ivy/types/symbol/module_',
	'ivy/types/module_object',
	'ivy/types/symbol/directive',
	'ivy/types/code_object',
	'ivy/bytecode',
	'ivy/types/symbol/dir_attr',
	'ivy/types/symbol/dir_body_attrs',
	'ivy/types/data/base_class_node',
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
	ModuleSymbol,
	ModuleObject,
	DirectiveSymbol,
	CodeObject,
	Bytecode,
	DirAttr,
	DirBodyAttrs,
	IClassNode,
	UnwrappableNode
) {

var
	IvyDataType = IvyConsts.IvyDataType,
	Instruction = Bytecode.Instruction;

function addInstrs(codeObject, instrs) {
	instrs.forEach(function(instr) {
		codeObject.addInstr(Instruction(instr[0], instr[1]));
	});
}

function parseDirAttrs(rawAttrs) {
	var attrs = [];
	rawAttrs.forEach(function(rawAttr) {
		attrs.push(DirAttr(rawAttr.name, rawAttr.typeName));
	});
	return attrs;
}

function parseBodyAttrs(rawAttrs) {
	return DirBodyAttrs(rawAttrs.isNoscope, rawAttrs.isNoescape);
}

mod.deserializeItem = function(node, parentModuleObject) {
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
						rawCodeObject = consts[0],
						rawSymbol = rawCodeObject.symbol,
						moduleSymbol = new ModuleSymbol(rawSymbol.name),
						moduleObject = new ModuleObject(moduleSymbol),
						codeObject = moduleObject.mainCodeObject;

					addInstrs(moduleObject.mainCodeObject, rawCodeObject.instrs);
					for( var i = 1; i < consts.length; ++i ) {
						moduleObject.addConst(mod.deserializeItem(consts[i], moduleObject));
					}
					return moduleObject;
				}

				case IvyDataType.CodeObject: {
					if( !(parentModuleObject instanceof ModuleObject) ) {
						throw new Error('ModuleObject is required to deserialize CodeObject')
					}
					var
						rawSymbol = node.symbol,
						directiveSymbol = new DirectiveSymbol(
							rawSymbol.name,
							parseDirAttrs(rawSymbol.attrs),
							parseBodyAttrs(rawSymbol.bodyAttrs)),
						codeObject = new CodeObject(directiveSymbol, parentModuleObject);
					addInstrs(codeObject, node.instrs);
					return codeObject;
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