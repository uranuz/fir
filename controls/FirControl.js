define('fir/controls/FirControl', [
	'fir/controls/ControlManager',
	'fir/controls/Loader/Manager'
], function(ControlManager, LoaderManager) {
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
		this._viewModule = opts.__moduleName__;
		this._viewMethod = opts.__scopeName__;
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

		/**
		 * Адрес для отправки запроса. Если не указано, то используется текущий URI (для REST-запросов).
		 * Либо точка доступа по умолчанию для RPC-запросов
		 */
		_getRequestURI: function(areaName) {
			return '';
		},
		
		/** Предпочитаемый HTTP-метод. Для RPC-запросов не действует */
		_getHTTPMethod: function(areaName) {
			return 'GET';
		},
		
		/** Имя RPC-метода. Если указано, то запрос идет через RPC-протокол */
		_getRPCMethod: function(areaName) {
			return null;
		},

		/** Параметры передаваемые в отображение, но не на основной сервис */
		_getViewParams: function(areaName) {
			return {
				instanceName: this.instanceName()
			};
		}, 
		/**
		 * Параметры, передаваемые на основной сервис, предпочтительно через адресную строку (для REST-запросов)
		 * Но для RPC-вызовов эти параметры добавляются к параметрам метода
		 */
		_getQueryParams: function(areaName) {
			return {};
		},

		/**
		 * Параметры, передаваемые на основной сервис, предпочтительно через тело запроса (для REST-запросов)
		 * Но для RPC-вызовов эти параметры добавляются к параметрам метода
		 */
		_getBodyParams: function(areaName) {
			return {};
		},

		/** Имя модуля (шаблона) интерфейса */
		_getViewModule: function(areaName) {
			return this._viewModule;
		},

		/** Имя метода (компонента) интерфейса */
		_getViewMethod: function(areaName) {
			return areaName? areaName: this._viewMethod;
		},

		_getReloadOpts: function(areaName) {
			return {
				URI: this._getRequestURI(areaName),
				HTTPMethod: this._getHTTPMethod(areaName),
				RPCMethod: this._getRPCMethod(areaName),
				viewParams: this._getViewParams(areaName),
				queryParams: this._getQueryParams(areaName),
				bodyParams: this._getBodyParams(areaName),
				viewModule: this._getViewModule(areaName),
				viewMethod: this._getViewMethod(areaName),
				// Add success/ error handlers
				success: this._onMarkupLoad.bind(this, areaName),
				error: this._onMarkupLoadError.bind(this, areaName)
			};
		},

		_getAreaNode: function(areaName) {
			return this._container;
		},

		/** Обработчик обновления внутреннего состояния компонента при завершении перезагрузки */
		_updateControlState: function(opts) {},
		_onMarkupLoad: function(areaName, html) {
			var state = new ControlManager.ControlLoadState();
			state.control = this;
			state.replaceMarkup = true;
			state.areaName = areaName;
			ControlManager.launchMarkup($(html), state);
		},
		_onMarkupLoadError: function(areaName, error) {
			console.error(error);
		},

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

			LoaderManager.load(this._getReloadOpts(areaName));
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
