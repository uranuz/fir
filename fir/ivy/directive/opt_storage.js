define('ivy/interpreter/directive/opt_storage', [
	'ivy/interpreter/directive/utils',
	'ivy/types/data/iface/class_node'
], function(du, IClassNode) {
var IvyDataType = Consts.IvyDataType;
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
	function OptStorageDirInterpreter() {
		this._symbol = new du.DirectiveSymbol(`optStorage`, [du.DirAttr("value", du.IvyAttrType.Any)]);
	}, du.BaseDirectiveInterpreter, {
		interpret: function(interp) {
			var
				optsNode = interp.getValue("opts"),
				optSets = interp.getValue("optSets"); // Global variable
			interp.internalAssert(
				[IvyDataType.AssocArray, IvyDataType.Null].includes(idat.type(optsNode)),
				`Expected assoc array or null as opts parameter`);
			interp.internalAssert(
				idat.type(optSets) === IvyDataType.AssocArray,
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