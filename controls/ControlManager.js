define('fir/controls/ControlManager', [
	'fir/common/base64'
], function(Base64) {
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
	}

// ControlManger is singleton. So module returns instance of class
return new (FirClass(
	function ControlManager() {
		this._controlRegistry = {};
		this._controlCounter = 0; // Variable used to generate control names
	}, {
		ControlLoadState: ControlLoadState,
		/**
		 * Получает осуществляет "рекурсивный" поиск узлов по списку изначальных узлов roots (по селектору).
		 * Выибирает только "наименее вложенные" элементы подходящие по селектору.
		 * Т.е. если внутри подходящего элемента есть еще подходящие, то они уже не будут выбраны.
		 * Элементы из корневого списка (если подходят под селектор) тоже попадут в результат.
		 */
		_getOuterMost: function(roots, selector, stopSelector) {
			var
				jRoots = $(roots),
				nextRoots = [],
				result = [],
				it;
			// Ищем пока есть, где искать
			while( jRoots.length > 0 ) {
				// Проход по всем элементам данного уровня
				for( var i = 0; i < jRoots.length; ++i ) {
					it = jRoots[i];
					if( it.nodeType !== 1 ) {
						continue;
					}
					if( $(it).is(selector) ) {
						result.push(it); // Подошло - добавляем в результат
					} else {
						// Не подошло - будем смотреть детей внутри него
						for( var k = 0; k < it.children.length; ++k ) {
							var child = it.children[k];
							// Не заходим внутрь, если поймали критерий останова
							if( !stopSelector || !$(child).is(stopSelector) ) {
								nextRoots.push(child);
							}
						}
					}
				}
				jRoots = nextRoots;
				nextRoots = [];
			}
			return $(result);
		},

		/** Запускает компоненты в работу после загрузки или обновления верстки */
		launchMarkup: function(newMarkup, state) {
			var self = this;
			if( state == null ) {
				// Выбираем корневые компоненты
				this._getOuterMost(newMarkup, '[data-fir-module]').each(function(index, controlTag) {
					var newState = new ControlLoadState();
					newState.controlTag = $(controlTag);
					self._initControlAndChildren(newState);
				});
			} else {
				state.controlTag = this._getOuterMost(newMarkup, '.' + state.control.instanceHTMLClass());
				if( !state.controlTag || state.controlTag.length !== 1 ) {
					throw new Error(
						'Expected exactly 1 element as control tag!!! '
						+ 'Check if matching instance class is present on control root element '
						+ 'and there is no multiple root control elements in markup.');
				}
				self._initControlAndChildren(state);
			}
		},

		_onControlModuleLoaded: function(state, ControlClass) {
			var
				parentState = state.parentState,
				updateControl = true;
			// К этому моменту дочерние компоненты уже загрузились
			if( state.control == null ) {
				state.opts.container = $(state.controlTag); // Устанавливаем корневой тэг для компонента
				state.opts.childControls = state.childControls; // Прописываем контролы всей пачкой (**)
				state.control = new ControlClass(state.opts);
				state.control._subscribeInternal();
				updateControl = false;
			}

			if( parentState != null ) {
				// Добавляем наш компонент в список дочерних для родителя
				// Если компонент - корневой, то parentState == null
				if( parentState.control == null ) {
					// Родительский контрол не указан - добавляем просто в список, который потом добавляется в строке (**)
					parentState.childControls.push(state.control);
				} else {
					// Есть родительский контрол - добавляем ещё не существующие дочерние к нему
					var existingInst = parentState.control.getChildInstanceByName(state.opts.instanceName);
					if( !existingInst ) {
						parentState.control._childControls.push(existingInst);
					}
				}
			}

			if( updateControl ) {
				// Выполняем обновление состояния, когда уже добавили к родителю (на всякий случай)
				//if (!state.areaName) {
					// Если название области для обновления не указано, то обновлялась вся вёрстка компонента,
					// поэтому прописываем новый корневой тег в _container
					state.control._container = $(state.controlTag);
				//}
				state.control._updateControlState(state.opts);
				if( state.control._container[0].parentNode == null ) {
					console.warn(
						'Container for control ' + state.control.instanceName() + ' has no link to parent node. '
						+ 'Old container might been removed from document during update, '
						+ 'but _container property has not been changed properly!'
					);
				}
				state.control._subscribeInternal();
			}

			state.control._onAfterLoad();

			if( parentState != null && --(parentState.childLoadCounter) === 0 ) {
				// Все компоненты родителя подгрузились - инициализируем его
				this._initCurrentControl(parentState);
			}
		},

		_extractControlOpts: function(rawOpts) {
			var decodedOpts;
			if( rawOpts ) {
				decodedOpts = Base64.decodeUTF8(rawOpts);
				return JSON.parse(decodedOpts);
			}
			return {};
		},

		_initCurrentControl: function(state) {
			require([state.moduleName], this._onControlModuleLoaded.bind(this, state));
		},

		_fillControlStateFromMarkup: function(state) {
			if( state.moduleName ) {
				return state;
			}
			state.configTag = this._getOuterMost($(state.controlTag), '[data-fir-opts]', '[data-fir-module]');
			if( !state.controlTag || state.controlTag.length !== 1 ) {
				throw new Error('Expected exactly 1 element as control tag!!!');
			}
			if( state.configTag.length > 1 ) {
				throw new Error('Multiple "opts" tags found for control!!!');
			}
			state.moduleName = $(state.controlTag).attr('data-fir-module');
			try {
				state.opts = this._extractControlOpts(state.configTag.attr('data-fir-opts'));
			} catch (ex) {
				throw new Error('Failed to parse control options from markup!!!');
			}
			state.childControlTags = this._getOuterMost(state.controlTag.children(), '[data-fir-module]');
			state.childLoadCounter = state.childControlTags.length;
			if( state.control == null ) {
				state.childControls = []; // Список дочерних для текущего компонента
			}
			return state;
		},
		/** Обновление вёрстки компонента при его перезагрузке */
		_updateControlMarkup: function(state) {
			var jAreaNode = state.control._getAreaNode(state.areaName);
			// Замена старой верстки компонента на новую
			// TODO: Нужно проверить, что это не дочерний компонент внутри новой вёрстки,
			// которую не нужно заменять, поскольку она уже будет заменена
			if( jAreaNode.length && state.controlTag.length ) {
				// Обходим баг в jQuery  replaceWith через родной replaceChild
				// Проблема в том, что jQuery вместо родителя заменяемого элемента берет родителя передаваемого на замену
				$.cleanData(jAreaNode); // Почистим jQuery данные старого контейнера, т.к. это делает jQuery
				jAreaNode[0].parentNode.replaceChild(state.controlTag[0], jAreaNode[0]);
			}
		},

		_initControlAndChildren: function(state) {
			var
				self = this,
				childStates = [],
				childrenExist = {};
			this._fillControlStateFromMarkup(state);
			state.childControlTags.each(function(index, childTag) {
				var childState = new ControlLoadState();
				childState.controlTag = $(childTag);
				childState.parentState = state;
				self._fillControlStateFromMarkup(childState);
				if( state.control ) {
					// Если дочерний контрол уже существует в текущем,
					// то сохраняем ссылку на него, чтобы он не был создан заново
					childState.control = state.control.getChildInstanceByName(childState.opts.instanceName);
				}
				childStates.push(childState);
				childrenExist[childState.opts.instanceName] = true;
			});
			if( state.control ) {
				var childControls = state.control._childControls;
				// Лучше будем удалять с конца, чтобы не было проблем с возможным смещением индексов
				for( var j = childControls.length - 1; j > 0; --j ) {
					if( !childrenExist[ childControls[j] ] ) {
						// При перезагрузке компонентов вызываем уничтожение тех компонентов в старой верстке,
						// которых нет в новой верстке.
						childControls[j].destroy();
						childControls.splice(j, 1); // Нужно убрать пустые элементы из массива дочерних
					}
				}
			}
			if( state.control && state.replaceMarkup ) {
				this._updateControlMarkup(state);
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
			for( var i = 0; i < candidates.length; ++i ) {
				// Дерегистрировать компонент из реестра
				if( candidates[i] !== control ) {
					continue;
				}
				if( candidates.length === 1 ) {
					// Если это последний элемент, то удаляем всю "корзину"
					delete this._controlRegistry[name];
				} else {
					candidates.splice(i, 1); // Удаляем с заданной позиции
				}
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
		}
}));
});