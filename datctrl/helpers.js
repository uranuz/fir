define('fir/datctrl/helpers', [
	'fir/datctrl/RecordFormat',
	'fir/datctrl/Record',
	'fir/datctrl/RecordSet',
	'fir/datctrl/EnumFormat',
	'fir/datctrl/Enum'
], function(
	RecordFormat,
	Record,
	RecordSet,
	EnumFormat,
	Enum
) {
var
	helpers = {
		isContainerRawData: function(node) {
			return(
				node != null
				&& (node instanceof Object)
				&& node.hasOwnProperty('t')
				&& (typeof(node.t) === 'string' || node.t instanceof String)
			);
		},

		extractorImpl: function(extractor, node) {
			node = extractor(node);
			if( !(node instanceof Object) ) {
				return node;
			}

			for( var key in node ) {
				if( !node.hasOwnProperty(key) ) {
					continue;
				}
				node[key] = extractor(node[key]);
			}
			return node;
		},

		//трансформирует JSON в Record или RecordSet
		fromJSON: function(jsonObj, emptyIfFailed) {
			if( !helpers.isContainerRawData(jsonObj) ) {
				return emptyIfFailed? void(0): jsonObj;
			}

			if( ['record', 'recordset'].indexOf(jsonObj.t) >= 0 )
			{
				var fmt = helpers.recordFormatFromJSON(jsonObj);

				if( jsonObj.t === "record" ) {
					return new Record({
						format: fmt,
						rawData: jsonObj.d
					});
				}
				else if( jsonObj.t === "recordset" ) {
					return new RecordSet({
						format: fmt,
						rawData: jsonObj.d
					});
				}
			} else if( jsonObj.t === 'enum' ) {
				return helpers.enumFromJSON(jsonObj);
			}

			return emptyIfFailed? void(0): jsonObj;
		},
		recordFormatFromJSON: function(jsonObj) {
			var
				kfi = jsonObj.kfi || 0,
				jFormats = jsonObj.f,
				enumFormats = {},
				i = 0, jFmt;

			for( ; i < jFormats.length; ++i ) {
				jFmt = jFormats[i];
				if( jFmt.t === "enum" ) {
					enumFormats[i] = helpers.enumFromJSON(jFmt);
				}
			}

			return new RecordFormat({
				fields: jFormats,
				enumFormats: enumFormats,
				keyFieldIndex: kfi
			});
		},
		enumFromJSON: function(jEnum) {
			if( jEnum.hasOwnProperty("d") ) {
				return new Enum({
					rawData: jEnum.enum,
					value: jEnum.d
				});
			} else {
				return new EnumFormat({
					rawData: jEnum.enum
				})
			}
		}
	};
	helpers.tryExtractLvlContainers = helpers.extractorImpl.bind(null, helpers.fromJSON);
	return helpers;
});
