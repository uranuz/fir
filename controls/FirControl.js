define('fir/controls/FirControl', [
	'fir/controls/ControlManager',
	'fir/common/globals',
	'fir/common/base64',
	'fir/common/text_encoder',
], function(ControlManager, globals, Base64, TextEncoder) {
return FirClass(
	function FirControl(opts) {
		if (opts.instanceName) {
			this._instanceName = opts.instanceName;
		} else {
			this._instanceName = 'firControl' + ControlManager.getNextNameIndex();
		}

		this._container = opts.container;
		this._childControls = opts.childControls;
		this._cssBaseClass = opts.cssBaseClass;
		this._cssClass = opts.cssClass;
		ControlManager.registerControl(this); // Компонент сам себя регистрирует
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
			return $(this).triggerHandler.call($(this), ev, Array.prototype.slice.call(arguments, 1));
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
		_elems: function(elemName, optional) {
			var
				elemClass = this._elemClass(elemName),
				res = this._container.find(elemClass).addBack(elemClass);
			if( res.length === 0 && !optional ) {
				// Не выбрано элементов по классу. Это нехорошо, если только явно не указано, что они необязательые
				console.log('No elements found by element class: ' + elemClass);
			}
			return res;
		},
		//Возвращает jQuery-список всех элементов компонента
		_allElems: function() {
			return this._container.find('.' + this.instanceHTMLClass());
		},

		_unsubscribeInternal: function() {},
		_subscribeInternal: function() {},
		_getHTTPMethod: function(areaName) {
			return 'get';
		},
		_getRequestURI: function(areaName) {
			return {};
		},
		_getQueryParams: function(areaName) {
			return {};
		},
		_getBodyParams: function(areaName) {
			return {};
		},
		/** Обработчик обновления внутреннего состояния компонента при завершении перезагрузки */
		_updateControlState: function(opts) {},
		/** Обработчик завершения загрузки компонента для переопределения наследниками */
		_onAfterLoad: function() {
			// Публикуем событие о завершении загрузки компонента
			this._notify('onAfterLoad');
		},

		/**
		 * Перезагрузка компонента для обновления отображения и внутреннего состояния.
		 * Предполагается, что при этом компонент полностью не уничтожается, а обновляется, например, вёрстка
		 * (либо какая-то её часть, которая может измениться), обновляются какие-то поля данных и т.п.
		 * Могут при этом полностью пересоздаваться дочерние компоненты, если это соответствует логике работы.
		 * При этом должны сохраняться внешние подписки на события, публикуемые этим компонентом,
		 * однако подписки на события вёрстки и дочерних компонентов будут удаляться в "_unsubscribeInternal"
		 * и воссоздаваться заново (если это необходимо) в "_subscribeInternal".
		 * По сути механизм перезагрузки представляет собой каркас для реализации перезагрузки автором компонента
		 * 
		 * @param areaName {string|null|undefined} Название обновляемой области внутри компонента.
		 * Если не указано, то предполагается полное обновление всего компонента
		 */
		_reloadControl: function(areaName) {
			var
				self = this,
				HTTPMethod = this._getHTTPMethod(areaName).toLowerCase(),
				queryParams = this._getQueryParams(areaName) || {},
				bodyParams,
				queryParamsStr = '';

			if( typeof(queryParams) !== 'object' ) {
				throw new Error('Object expected as query params');
			}
			if( HTTPMethod === 'post' ) {
				bodyParams = this._getBodyParams(areaName) || {};
				if( typeof(bodyParams) !== 'object' ) {
					throw new Error('Object expected as body params');
				}
			}

			this._unsubscribeInternal();
			$.ajax(this._getRequestURI(areaName) + (HTTPMethod === 'post'? '?' + $.param(queryParams): ''), {
				success: function(html) {
					var state = new ControlManager.ControlLoadState();
					state.control = self;
					state.replaceMarkup = true;
					state.areaName = areaName;
					ControlManager.launchMarkup($(html), state);
				},
				error: function(error) {
					console.error(error);
				},
				type: HTTPMethod,
				data: (HTTPMethod === 'post'? bodyParams: queryParams)
			});
		},

		findInstanceByName: function(instanceName) {
			return ControlManager.findInstanceByName(instanceName);
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
			// TODO: Отписаться от всяческих событий
			this._unsubscribeInternal();

			// Прибить дочерние компоненты
			for( var i = 0; i < this._childControls.length; ++i ) {
				this._childControls[i].destroy();
			}

			// Удалить вёрстку этого компонента
			if( this._container ) {
				$(this._container).remove();
			}

			// Дерегистрировать компонент из реестра
			ControlManager.unregisterControl(this);
		}
});
});
