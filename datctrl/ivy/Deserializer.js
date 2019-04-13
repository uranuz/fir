define('fir/datctrl/ivy/Deserializer', [
	'exports',
	'fir/datctrl/Deserializer',
	'fir/datctrl/ivy/RecordSetAdapter',
	'fir/datctrl/ivy/RecordAdapter',
	'fir/datctrl/ivy/EnumFormatAdapter',
	'fir/datctrl/ivy/EnumAdapter'
], function(
	mod,
	Deserializer,
	RecordSetAdapter,
	RecordAdapter,
	EnumFormatAdapter,
	EnumAdapter
) {

mod.tryExtractContainer = function(node, emptyIfFailed) {
	var container = Deserializer.fromJSON(node, emptyIfFailed);
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

mod.tryExtractLvlContainers = Deserializer.extractorImpl.bind(null, mod.tryExtractContainer);
});