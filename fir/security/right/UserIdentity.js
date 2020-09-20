define('fir/security/right/UserIdentity', [

], function() {
return FirClass(
	function UserIdentity(userData) {
		this._login = (userData.id? userData.id: null);
		this._name = (userData.name? userData.name: null);
		this._accessRoles = userData.accessRoles;
		this._data = {
			accessRoles: userData.accessRoles.join(';')
		};
		this._sessionId = userData.sessionId;
	}, {
		id: function() {
			return this._login;
		},
		
		///Публикуемое имя пользователя
		name: function() {
			return this._name;
		},
		
		///Дополнительные данные пользователя
		data: function() {
			return this._data;
		},
		
		///Возвращает true, если владелец успешно прошёл проверку подлинности. Иначе false
		isAuthenticated: function() {
			return this._sessionId != null;
		},
		
		///Функция возвращает true, если пользователь входит в группу
		isInRole: function(roleName) {
			return this._accessRoles.includes(roleName);
		},

		///Делает текущий экземпляр удостоверения пользователя недействительным
		invalidate: function() {
			this._login = null;
			this._name = null;
			this._accessRoles = null;
			this._data = null;
			this._sessionId = null;
		}
});
});
