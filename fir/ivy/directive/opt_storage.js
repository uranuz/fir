define('fir/ivy/directive/opt_storage', [
	'ivy/interpreter/directive/utils',
	'fir/ivy/opt_set'
], function(du, OptSet) {
var IvyDataType = du.IvyDataType;
return FirClass(
	function OptStorageDirInterpreter() {
		this._symbol = new du.DirectiveSymbol("optStorage", [du.DirAttr("opts", du.IvyAttrType.Any)]);
	}, du.BaseDirectiveInterpreter, {
		interpret: function(interp) {
			var
				opts = interp.getValue("opts"),
				optSets = du.idat.assocArray(interp.getGlobalValue("optSets")); // Global variable
			interp.log.internalAssert(
				[IvyDataType.AssocArray, IvyDataType.Null].includes(du.idat.type(opts)),
				`Expected assoc array or null as opts parameter`);

			var optSet = new OptSet();
			optSets[optSet.id] = opts; // Write opt set to global dict
			interp._stack.push(optSet);
		}
	});
});