define('fir/ivy/directive/standard_factory', [
	'ivy/interpreter/directive/standard_factory',
	'fir/ivy/directive/opt_storage',
	'fir/ivy/directive/remote_call',
	'fir/ivy/directive/to_json_base64'
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