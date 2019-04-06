define('fir/datctrl/ivy/helpers', [
	'exports',
	'fir/datctrl/helpers',
	'fir/datctrl/ivy/RecordSetAdapter',
	'fir/datctrl/ivy/RecordAdapter',
	'fir/datctrl/ivy/EnumFormatAdapter',
	'fir/datctrl/ivy/EnumAdapter'
], function(
	exports,
	DatctrlHelpers,
	RecordSetAdapter,
	RecordAdapter,
	EnumFormatAdapter,
	EnumAdapter
) {

exports.tryExtractContainer = function(node, emptyIfFailed) {
	var container = DatctrlHelpers.fromJSON(node, emptyIfFailed);
	if( container == null ) {
		return emptyIfFailed? void(0): node;
	}
	switch( node.t ) {
		case 'recordset':
			return new RecordSetAdapter(container);
		case 'record':
			return new RecordAdapter(container);
		case 'enum':
			return node.hasOwnProperty("d")? new EnumAdapter(container): new EnumFormatAdapter(container);
		default: break;
	}
	return emptyIfFailed? void(0): node;
};

exports.tryExtractLvlContainers = DatctrlHelpers.extractorImpl.bind(null, exports.tryExtractContainer);
});