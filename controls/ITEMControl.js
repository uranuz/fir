define('fir.controls.ITEMControl', [], function() {
	return new (function(_super) {
		return __mixinProto(function ITEMControl(opts) {
			opts = opts || {}
			this._controlName = opts.controlName;
			this._controlTypeName = opts.controlTypeName;
			this._elemsCache = null;
			this._cssBlockName = opts.cssBlockName;
		},
		{

			//Возвращает имя экземпляра компонента интерфейса
			controlName: function() {
				return this._controlName;
			},

			//Возвращает имя типа компонента интерфейса
			controlTypeName: function() {
				return this._controlTypeName;
			},

			//Возвращает HTML-класс экземпляра компонента интерфейса
			instanceHTMLClass: function() {
				return this._controlName ? 'i-' + this._controlName : undefined;
			},

			//Возвращает jQuery-список HTML-элементов с классами экземпляра
			//компонента интерфейса.
			//Это protected-метод для использования только в производных классах
			_elems: function( update ) {
				if( this._elemsCache == null || update === true ) {
					this._elemsCache = $( '.' + this.instanceHTMLClass() );
				}
				return this._elemsCache;
			},

			$el: function(elemSelector) {
				var
					self = this,
					elems;

				if( elemSelector.indexOf(".b-") !== -1 )
					throw new Error("Block selectors are not allowed!!!");

				elems = this.elems.filter(elemSelector);
				elems.$on = function(types, selector, data, fn, /*INTERNAL*/ one) {
					var args = [types];

					// Types can be a map of types/handlers
					if ( typeof types === "object" ) {
						// ( types-Object, selector, data )
						if ( typeof selector !== "string" ) {
							// ( types-Object, data )
							data = data || selector;
							selector = undefined;
						}
						for ( type in types ) {
							this.$on( type, selector, data, types[ type ], one );
						}
						return this;
					}

					if ( data == null && fn == null ) {
						// ( types, fn )
						fn = selector;
						data = selector = undefined;
					} else if ( fn == null ) {
						if ( typeof selector === "string" ) {
							// ( types, selector, fn )
							fn = data;
							data = undefined;
						} else {
							// ( types, data, fn )
							fn = data;
							data = selector;
							selector = undefined;
						}
					}

					if( selector != null )
						args.push( self.__parseSelector(selector) );
					if( data != null )
						args.push( data );

					args.push(function(ev) {
						fn.call(self, ev, $(this));
					});

					this.on.apply(this, args);
				};

				return elems;
			},
			$on: function() {
				return $(this).on.apply($(this), arguments);
			},
			$off: function() {
				return $(this).off.apply($(this), arguments);
			},
			$trigger: function() {
				return $(this).trigger.apply($(this), arguments);
			},
			$triggerHandler: function() {
				return $(this).triggerHandler.apply($(this), arguments);
			},
			__parseSelector: function(selector)
			{
				var newSelector = selector;
				if( selector.indexOf(".b-") !== -1 )
					throw new Error("Block selectors are not allowed!!!");

				blockName = ( this._cssBlockName == null || this._cssBlockName.length == 0 ) ? this.elems.selector : this._cssBlockName;

				newSelector = selector.split(".e-").join(blockName + ".e-");

				return newSelector;
			}
		});
	})();

});
