define('fir/ivy/directive/StandardFactory', [
	'ivy/interpreter/directive/standard_factory',
	'fir/ivy/directive/OptStorage',
	'fir/ivy/directive/RemoteCall',
	'fir/ivy/directive/ToJSONBase64'
], function(
	IvyFactory,
	OptStorage,
	RemoteCall,
	ToJSONBase64
) {
	return (function StandardFactory() {
		var factory = IvyFactory();
		factory.add(new OptStorage());
		factory.add(new RemoteCall());
		factory.add(new ToJSONBase64());
		return factory;
	});
});