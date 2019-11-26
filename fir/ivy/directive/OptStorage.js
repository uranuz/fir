define('fir/ivy/directive/OptStorage', [
	'ivy/DirectiveInterpreter',
	'ivy/utils',
	'ivy/Consts',
	'ivy/ClassNode'
], function(
	DirectiveInterpreter,
	iu,
	Consts,
	IClassNode
) {
'use strict';
var
	IvyDataType = Consts.IvyDataType,
	DirAttrKind = Consts.DirAttrKind;
var optSetCounter = 0;
var OptStorage = FirClass(
	function OptStorage(optSetId) {
		this._optSetId = optSetId;
	}, IClassNode, {
		/** Analogue to IvyData __serialize__(); in D impl */
		serialize: function() {
			return this._optSetId;
		}
	});

return FirClass(
	function OptStorageInterpreter() {
		this._name = 'optStorage';
		this._attrBlocks = [{
			'kind': DirAttrKind.ExprAttr,
			'exprAttrs': [{
				name: 'opts', typeName: 'any'
			}]
		}, {
			'kind': DirAttrKind.BodyAttr,
			'bodyAttr': {}
		}]
	}, DirectiveInterpreter, {
		interpret: function(interp) {
			var
				optsNode = interp.getValue("opts"), optsType = iu.getDataNodeType(optsNode),
				optSets = interp.getValue("optSets"), optSetsType = iu.getDataNodeType(optSets); // Глобальная переменная
			interp.internalAssert(
				[IvyDataType.AssocArray, IvyDataType.Null].indexOf(optsType) >= 0,
				`Expected assoc array or null as opts parameter`);
			interp.internalAssert(
				optSetsType === IvyDataType.AssocArray,
				`Expected optSets global variable of assoc array type`);

			var optSetId = ++optSetCounter;
			interp.internalAssert(
				typeof(optSets[optSetId]) === 'undefined',
				'Rewriting existing opt set is not allowed');
			optSets[optSetId] = optsNode; // Write opt set to global dict

			interp._stack.push(new OptStorage(optSetId));
		}
	});
});