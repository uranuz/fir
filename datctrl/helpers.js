define('fir/datctrl/helpers', [
	'fir/datctrl/RecordFormat',
	'fir/datctrl/Record',
	'fir/datctrl/RecordSet'
], function(RecordFormat, Record, RecordSet) {
	var helpers = {
		//трансформирует JSON в Record или RecordSet
		fromJSON: function(json) {
			var
				jsonObj = json, fmt;

			if( jsonObj.t === "record" || jsonObj.t === "recordset" )
			{
				fmt = helpers.recordFormatFromJSON(jsonObj);

				if( jsonObj.t === "record" )
				{	return new Record({
						format: fmt,
						data: jsonObj.d
					});
				}
				else if( jsonObj.t === "recordset" )
				{	return new RecordSet({
						format: fmt,
						data: jsonObj.d
					});
				}
			}
		},
		recordFormatFromJSON: function(jsonObj) {
			var
				kfi = jsonObj.kfi || 0,
				jFormats = jsonObj.f,
				enumFormats = {},
				i = 0, jFmt;

			for( ; i < jFormats.length; ++i )
			{
				jFmt = jFormats[i];
				if( jFmt.enum )
				{
					enumFormats[i] = new EnumFormat({
						items: jFmt.enum
					});
				}
			}

			return new RecordFormat({
				fields: jFormats,
				enumFormats: enumFormats,
				keyFieldIndex: kfi
			});
		}
	};
	return helpers;
});
