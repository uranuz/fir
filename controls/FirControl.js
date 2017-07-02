define('fir/controls/FirControl', [
	'fir/common/globals',
	'fir/common/base64',
	'fir/common/text_encoder',
], function(globals, Base64, TextEncoder) {
	var
		controlCounter = 0, // Variable used to generate control names
		controlRegistry = {}; 
	return __mixinProto(function FirControl(opts) {
		if (opts.instanceName) {
			this._instanceName = opts.instanceName;
		} else {
			this._instanceName = 'firControl' + ++controlCounter;
		}

		this._container = opts.container;
		this._childControls = opts.childControls;
		this._cssBaseClass = opts.cssBaseClass;
		this._cssClass = opts.cssClass;
		this._registerControl(this); // Компонент сам себя регистрирует
	}, {
		/// Возвращает имя экземпляра компонента интерфейса
		instanceName: function() {
			return this._instanceName;
		},

		/// Возвращает основной CSS класс, используемый для стилизации компонента
		cssBaseClass: function() {
			return this._cssBaseClass;
		},

		/// Возвращает дополнительные CSS классы для стилизации компонента, добавляемые пользователем
		cssClass: function() {
			return this._cssClass;
		},

		/// Возвращает HTML-класс экземпляра компонента интерфейса
		instanceHTMLClass: function() {
			return this._instanceName? 'i-' + this._instanceName: undefined;
		},

		/// Подписаться на событие с именем ev с помощью обработчика hdl
		subscribe: function(ev, hdl) {
			return $(this).on.apply($(this), arguments);
		},
		/// Отписаться от события с именем ev
		unsubscribe: function(ev, hdl) {
			return $(this).off.apply($(this), arguments);
		},
		/// Подписка на одно срабатывание события с именем ev с помощью обработчика hdl
		once: function(ev, hdl) {
			return $(this).one.apply($(this), arguments);
		},
		/// Оповестить подписчиков о срабатывании события с именем ev
		_notify: function(ev) {
			return $(this).triggerHandler.apply($(this), arguments);
		},
		_elemFullClass: function(el) {
			var cls = "e-" + el + " "
			if( this._instanceName ) {
				cls += "i-" + this._instanceName + " ";
			}
			if( this._cssBaseClass ) {
				cls += this._cssBaseClass + " "
			}
			if( this._cssClass ) {
				cls += this._cssClass + " "
			}
			return cls;
		},
		/// Получить класс для выборки элемента по имени elemName
		_elemClass: function(elemName) {
			return '.' + this.instanceHTMLClass() + '.e-' + elemName;
		},
		/// Получить jQuery элемент этого компонента по имени elemName
		_elems: function(elemName) {
			return this._container.find(this._elemClass(elemName)).addBack(this._elemClass(elemName));
		},
		//Возвращает jQuery-список всех элементов компонента
		_allElems: function() {
			return this._container.find('.' + this.instanceHTMLClass());
		},

		initAllControls: function() {
			var self = this;
			// Выбираем корневые компоненты
			$('[data-fir-module]').filter(function(index, tag) {
				return $(tag).parents('[data-fir-module]').length === 0;
			})
			.each(function(index, controlTag) {
				self._initControlImpl(controlTag);
			});
		},

		_initControlImpl: function(controlTag, parentOpts) {
			var
				self = this,
				moduleName = $(controlTag).attr('data-fir-module'),
				configTag = $(controlTag).find('[data-fir-opts]').filter(function(index, childTag) {
					return $(childTag).closest('[data-fir-module]').is(controlTag);
				}),
				childControlTags = $(controlTag).find('[data-fir-module]').filter(function(index, childTag) {
					// Выбираем элементы для которых ближайшим родителем является controlTag
					return $(childTag).parent().closest('[data-fir-module]').is(controlTag);
				}),
				initThis = function() {
					require([moduleName], function(ControlClass) {
						if( configTag.length > 1 ) {
							throw new Error('Multiple "opts" tags found for control!!!');
						}
						var
							rawOpts = configTag.attr('data-fir-opts'),
							decodedOpts, opts = {};
						if (rawOpts) {
							decodedOpts = Base64.decodeUTF8(rawOpts);
							opts = JSON.parse(decodedOpts);
						}
						opts.container = $(controlTag); // Устанавливаем корневой тэг для компонента
						opts.childControls = currentOpts.childControls; // К этому моменту дочерние уже загрузились
						var control = new ControlClass(opts);
						if( parentOpts != null ) {
							// Добавляем наш компонент в список дочерних для родителя
							// Если компонент - корневой, то parentOpts == null
							parentOpts.childControls.push(control);
							if( --(parentOpts.childLoadCounter) === 0 ) {
								// Все компоненты родителя подгрузились - инициализируем его
								parentOpts.initThis();
							}
						}
					});
				},
				currentOpts = {
					childControls: [], // Список дочерних для текущего компонента
					childLoadCounter: childControlTags.length,
					initThis: initThis
				};
			

			if( currentOpts.childLoadCounter === 0 ) {
				initThis(); // Нет дочерних компонентов - инициализируем сразу, иначе асинхронно
			}
			childControlTags.each(function(index, childTag) {
				self._initControlImpl(childTag, currentOpts); // Инициализируем дочерние компоненты
			});
		},
		_registerControl: function(control) {
			if( controlRegistry[control.instanceName()] ) {
				throw Error('Control with name "' + control.instanceName() + '" already registered!');
			}
			controlRegistry[control.instanceName()] = control;
		},
		findInstanceByName: function(instanceName) {
			return controlRegistry[instanceName];
		},
		getChildInstanceByName: function(name) {
			for( var i = 0; i < this._childControls.length; ++i ) {
				if( this._childControls[i].instanceName() === name ) {
					return this._childControls[i];
				}
			}
			return null;
		},
		// Уничтожить компонент
		destroy: function() {
			// Прибить дочерние компоненты
			for( var i = 0; i < this._childControls.length; ++i ) {
				this._childControls[i].destroy();
			}
			
			// TODO: Отписаться от всяческих событий

			// Удалить вёрстку этого компонента
			if( this._container ) {
				$(this._container).remove();
			}

			// Дерегистрировать компонент из реестра
			if( controlRegistry[this.instanceName()] === this ) {
				delete controlRegistry[this.instanceName()];
			}
		}
	});
});
