define('fir/controls/ControlManager', [
	'fir/common/base64',
	'fir/common/Deferred',
	'fir/datctrl/Deserializer',
	'fir/controls/Loader/Manager',
	'fir/common/helpers'
], function(
	Base64,
	Deferred,
	Deserializer,
	LoaderManager,
	helpers
) {
	function ControlLoadState() {
		this.controlTag = null; // This control (or area) root tag
		this.configTag = null; // Configuration tag 'data-fir-opts' inside control tag
		this.opts = null; // Parsed options
		this.moduleName = null; // Path to module of this control
		this.control = null; // This control instance
		this.childControlTags = null; // Root tags of child controls
		this.childControls = null; // Child control instances
		this.childLoadCounter = null; // Count of remaining child controls that need to be loaded
		this.parentState = null; // Instance of ControlLoadState for parent control
		this.replaceMarkup = null;
		this.areaName = null;
		this.onAfterLoad = null; // Deffered that needs to be called on finish load
		this.optSets = null;
	}

	ControlLoadState.prototype.getOptSets = function() {
		if( this.optSets != null ) {
			return this.optSets;
		}
		if( this.parentState != null ) {
			return this.parentState.getOptSets();
		}
	}

// ControlManger is singleton. So module returns instance of class
return new (FirClass(
	function ControlManager() {
		this._controlRegistry = {};
		this._controlCounter = 0; // Variable used to generate control names
	}, {
		ControlLoadState: ControlLoadState,

		/** Оживляет все компоненты в данной верстке */
		reviveMarkup: function(newMarkup) {
			// Выбираем корневые компоненты
			helpers.getOuterMost(newMarkup, '[data-fir-module]').each(function(index, controlTag) {
				var newState = new ControlLoadState();
				newState.controlTag = $(controlTag);
				this._initControlAndChildren(newState);
			}.bind(this));
		},

		/** Запускает компоненты в работу после загрузки или обновления верстки */
		reviveControlMarkup: function(newMarkup, state) {
			state = state || new ControlLoadState();
			state.onAfterLoad = new Deferred();
			state.controlTag = helpers.getOuterMost(
				newMarkup,
				(state.control? '.' + state.control.instanceHTMLClass(): '[data-fir-module]')
			);
			if( !state.controlTag || state.controlTag.length !== 1 ) {
				throw new Error(
					'Expected exactly 1 element as control tag!!! '
					+ 'Check if matching instance class is present on control root element '
					+ 'and there is no multiple root control elements in markup.');
			}
			this._initControlAndChildren(state);
			return state.onAfterLoad;
		},

		_onControlModuleLoaded: function(state, ControlClass) {
			if( !ControlClass && state.control == null ) {
				// Контрол либо уже загружен, либо мы должны получить JS-модуль контрола
				throw new Error('Unable to load JS control module: ' + state.moduleName)
			}
			var
				parentState = state.parentState,
				updateControl = true;
			// Как только сохранили себе локально ссылку на состояние родителя,
			// то удаляем ее из состояния потомка во избежания утечек памяти и возможности обратиться к родителю
			state.parentState = null;

			// К этому моменту дочерние компоненты уже загрузились
			if( state.control == null ) {
				state.opts.container = $(state.controlTag); // Устанавливаем корневой тэг для компонента
				state.opts.childControls = state.childControls; // Прописываем контролы всей пачкой (*#*)
				state.control = new ControlClass(state.opts);
				updateControl = false;
			}

			if( parentState != null ) {
				var parentControl = parentState.control;
				// Добавляем наш компонент в список дочерних для родителя
				// Если компонент - корневой, то parentState == null
				if( parentControl == null ) {
					// Родительский контрол не указан - добавляем просто в список, который потом добавляется в строке (*#*)
					parentState.childControls.push(state.control);
				} else {
					// Есть родительский контрол - добавляем ещё не существующие дочерние к нему
					var existingInst = parentControl.getChildByName(state.opts.instanceName);
					if( !existingInst ) {
						parentControl._childControls.push(state.control);
					}
				}
			}

			if( updateControl ) {
				// Выполняем обновление состояния, когда уже добавили к родителю (на всякий случай)
				if (!state.areaName) {
					// Если название области для обновления не указано, то обновлялась вся вёрстка компонента,
					// поэтому прописываем новый корневой тег компонента
					state.control._container = $(state.controlTag);
				}
				if( state.control._getContainer()[0].parentNode == null ) {
					console.warn(
						'Container for control ' + state.control.instanceName() + ' has no link to parent node. '
						+ 'Old container might been removed from document during update, '
						+ 'but _container property has not been changed properly!'
					);
				}
			}

			state.control._onSubscribe(state.areaName);
			// Публикуем событие о завершении загрузки компонента
			state.control._onAfterLoadInternal(state.areaName, state.opts);
			if( state.onAfterLoad ) {
				// Сообщаем в Deferred о результате
				state.onAfterLoad.resolve(state.control, state.areaName, state.opts);
			}

			if( parentState != null && --(parentState.childLoadCounter) === 0 ) {
				// Все компоненты родителя подгрузились - инициализируем его
				this._initCurrentControl(parentState);
			}
		},

		/** Декодирует опции компонента из base64 */
		_extractControlOpts: function(rawOpts) {
			var decodedOpts;
			if( typeof(rawOpts) == 'string' || (rawOpts instanceof String) ) {
				decodedOpts = Base64.decodeUTF8(rawOpts);
				return JSON.parse(decodedOpts);
			} else if( rawOpts != null ) {
				throw new Error('Expected string or null');
			}
			return {};
		},

		_initCurrentControl: function(state) {
			require([state.moduleName], this._onControlModuleLoaded.bind(this, state));
		},
		/** Получает состояние компонента из верстки. Добавляет состояние в контекст перезагрузки state */
		_fillControlStateFromMarkup: function(state) {
			if( state.moduleName ) {
				// Опции уже получены
				return state;
			}
			state.configTag = helpers.getOuterMost($(state.controlTag), '[data-fir-opts]', '[data-fir-module]', true);
			if( !state.controlTag || state.controlTag.length !== 1 ) {
				throw new Error('Expected exactly 1 element as control tag!!!');
			}
			if( state.configTag.length > 1 ) {
				throw new Error('Multiple "opts" tags found for control!!!');
			}
			state.moduleName = $(state.controlTag).attr('data-fir-module');
			var
				optSets = state.getOptSets(),
				optData = state.configTag.attr('data-fir-opts');
			// Если заданы наборы опций, то следует получать опции оттуда. Значит - верстка строится на интерфейсе
			// Если наборы опций не заданы, то опции закодированы в верстке в Base64
			if( optSets != null ) {
				state.opts = optSets[optData];
				delete optSets[optData]; // Избавимся от набора опций сразу как получили его
			} else {
				state.opts = this._extractControlOpts(optData);
				state.opts = Deserializer.deserialize(state.opts); // В первой ветке десериализация не нужна
			}
			state.childControlTags = helpers.getOuterMost(state.controlTag.children(), '[data-fir-module]');
			state.childLoadCounter = state.childControlTags.length;
			if( state.control == null ) {
				state.childControls = []; // Список дочерних для текущего компонента
			}
			return state;
		},

		_initControlAndChildren: function(state) {
			var
				self = this,
				childStates = [],
				existingChildren = {};
			// Заполняем контекст загрузки данного контрола из верстки
			this._fillControlStateFromMarkup(state);
			state.childControlTags.each(function(index, childTag) {
				// Создаем контексты загрузки для каждого из дочерних компонентов, найденных в верстке
				var childState = new ControlLoadState();
				childState.controlTag = $(childTag);
				childState.parentState = state;
				self._fillControlStateFromMarkup(childState);
				if( state.control ) {
					// Если дочерний контрол уже существует в текущем,
					// то сохраняем ссылку на него, чтобы он не был создан заново
					childState.control = state.control.getChildByName(childState.opts.instanceName);
				}
				childStates.push(childState);
				existingChildren[childState.opts.instanceName] = true;
			});
			if( state.control ) {
				// Уничтожаем компоненты, которых уже нет в новой верстке
				state.control._destroyNonExisentChildControls(state, existingChildren);

				// Отписываемся от событий верстки ровно перед заменой этой верстки,
				// чтобы если что-то отвалилось до этой точки, то события не перестанут работать
				state.control._onUnsubscribe(state.areaName);
				if( state.replaceMarkup ) {
					state.control._updateControlMarkup(state);
				}
			}
			if( state.childLoadCounter === 0 ) {
				// Нет дочерних компонентов - инициализируем сразу, иначе асинхронно
				this._initCurrentControl(state);
			}
			// require нужен, т.к. при использовании сборок дочерние модули часто находятся в родителе,
			// и нужно подгрузить родителя первым
			require([state.moduleName], function() {
				for( var i = 0; i < childStates.length; ++i ) {
					self._initControlAndChildren(childStates[i]); // Инициализируем дочерние компоненты
				}
			});
		},
		registerControl: function(control) {
			var
				name = control.instanceName(),
				already = false;
			if( !this._controlRegistry.hasOwnProperty(name) ) {
				this._controlRegistry[name] = [];
			} else if( this._controlRegistry[name].length ) {
				console.warn('Control with name "' + name + '" already registered!');
			}
			for(var i = 0; i < this._controlRegistry[name].length; ++i ) {
				var testControl = this._controlRegistry[name][i];
				if( testControl === control ) {
					already = true;
					console.warn('Duplicate registration of the same control with name: ' + name);
					break;
				}
			}
			if( !already ) {
				this._controlRegistry[name].push(control);
			}
		},
		unregisterControl: function(control) {
			var
				name = control.instanceName(),
				candidates = this._controlRegistry[name];
			if( !candidates || candidates.length === 0 ) {
				return;
			}
			if( candidates.length === 1 && candidates[0] === control ) {
				// Если это последний элемент, то удаляем всю "корзину"
				delete this._controlRegistry[name];
				return;
			}
			for( var i = 0; i < candidates.length; ++i ) {
				// Дерегистрировать компонент из реестра
				if( candidates[i] !== control ) {
					continue;
				}
				candidates.splice(i, 1); // Удаляем с заданной позиции
			}
		},
		findInstanceByName: function(instanceName) {
			var candidates = this._controlRegistry[instanceName];
			if( !candidates || candidates.length === 0 ) {
				return null;
			}
			if( candidates.length > 1 ) {
				console.warn('There are ' + candidates.length + ' controls with name "' + instanceName + '" in registry');
			}
			return candidates[0];
		},
		getNextNameIndex: function() {
			return ++this._controlCounter;
		},
		reloadControl: function(control, areaName, extraConfig) {
			var def = new Deferred();
			control._onBeforeLoadInternal(areaName);
			var
				config = control._getReloadOpts(areaName),
				state = new ControlLoadState();
			config.optSets = {};
			state.optSets = config.optSets;
			LoaderManager.load(
				this._mergeConfig(config, extraConfig)
			).then(
				control._onMarkupLoad.bind(control, areaName, state),
				control._onMarkupLoadError.bind(control));
			return def;
		},
		_mergeConfig: function(config, extraConfig) {
			config = config || {};
			if( !extraConfig ) {
				return config;
			}
			for( var key in extraConfig ) {
				if( !extraConfig.hasOwnProperty(key) ) {
					continue;
				}
				if( ['viewParams', 'queryParams', 'bodyParams'].indexOf(key) >= 0 ) {
					// Merge method call params and template call params only
					config[key] = config[key] || {};
					var
						inConfig = config[key],
						inExtraConfig = extraConfig[key];
					for( var inKey in inExtraConfig ) {
						if( !inExtraConfig.hasOwnProperty(inKey) ) {
							continue;
						}
						if( typeof(inExtraConfig[inKey]) === 'undefined' ) {
							delete inConfig[inKey];
							continue;
						}
						inConfig[inKey] = inExtraConfig[inKey];
					}
				} else {
					// The rest config params are overwritten
					config[key] = extraConfig[key];
				}
			}
			return config;
		},
		createControl: function(config) {
			if( config == null ) {
				throw new Error('Expected config object');
			}
			var
				def = new Deferred(),
				target = config.target,
				state = new ControlLoadState();
			if( !target ) {
				throw new Error('Required target tag to be replaced by control');
			}
			// Don't want to keep target in opts to reduce leaks;
			config.target = null;
			delete config.target;
			config.optSet = {};
			state.optSets = config.optSets;

			LoaderManager.load(config).then(
				this._onMarkupLoad.bind(this, def, target, state),
				this._onMarkupLoadError.bind(this, def));
			return def;
		},
		/** Коллбэк, вызываемый когда готова верстка созданного шаблона */
		_onMarkupLoad: function(def, target, state, html) {
			var
				target = $(target)[0],
				newMarkup = $(html);
			if( newMarkup.length !== 1 ) {
				throw new Error('Expected exactly one root tag in markup when creating control');
			}
			// Replace specified target node with loaded markup
			target.parentNode.replaceChild(newMarkup[0], target);
			// Revive markup. Get onAfterLoad Deferred as result...
			this.reviveControlMarkup(newMarkup, state).then(
				this._onMarkupRevive.bind(this, def),
				this._onMarkupReviveError.bind(this, def));
		},
		/** Коллбэк, вызываемый когда произошла ошибка при создании верстки шаблона */
		_onMarkupLoadError: function(def, err) {
			console.error(err);
			def.reject(err);
		},
		/** Коллбэк, вызываемый при "оживлении" верстки. Т.е. созданы классы, отвечающие за работу компонента */
		_onMarkupRevive: function(def, control, areaName, opts) {
			def.resolve(control, areaName, opts);
		},
		/** Коллбек, вызываемый при ошибке "оживления" верстки компонента */
		_onMarkupReviveError: function(def, err) {
			def.reject(err);
		}
}));
});
