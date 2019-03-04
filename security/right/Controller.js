define('fir/security/right/Controller', [
	'fir/security/right/iface/Controller',
	'fir/security/right/iface/RuleFactory',
	'fir/security/right/iface/DataSource'
], function(
	IRightController,
	IAccessRuleFactory,
	IRightDataSource
) {
var AccessObject = FirClass(function AccessObject(name, isGroup, children, parent) {
	this._name = name;
	this._isGroup = isGroup;
	this._children = children;
	this._parentNum = parent;
}, {
	name: function() {
		return this._name;
	},

	isGroup: function() {
		return this._isGroup;
	},

	parentNum: function() {
		return this._parentNum;
	},

	toStdJSON: function() {
		var children = [];
		for( var i = 0; i < this._children; ++i ) {
			children.push(this._children[i].toStdJSON());
		}
		return {
			"name": this._name,
			"children": children
		};
	}
}),
RuleWithFlag = function RuleWithFlag(rule, inheritance, distance) {
	this.rule = rule;
	this.inheritance = inheritance;
	this.distance = distance;
};


return FirClass(
	function AccessRightController(ruleFactory, dataSource) {
		if( !(ruleFactory instanceof IAccessRuleFactory) ) {
			throw new Error('Expected instance of IAccessRuleFactory');
		}
		if( !(dataSource instanceof IRightDataSource) ) {
			throw new Error('Expected instance of IRightDataSource');
		}

		this._ruleFactory = ruleFactory;
		this._dataSource = dataSource;
		this._allRules = null;
		this._allObjects = null;
		this._allRoles = null;

		this._rulesByRightKey = null;
		this._objectNumByFullName = null;
		this._roleNumByName = null;
		this._groupObjKeys = null;
	}, IRightController, {
	reloadRightsData: function() {
		// Load of order is important
		this.loadAccessRules();
		this.loadAccessObjects();
		this.loadGroupObjects();
		this.loadAccessRoles();
		this.loadAccessRights();
	},

	_assureLoaded: function() {
		// If all of these are empty then consider that nothing was load yet
		if( this._allRules == null && this._allObjects == null && this._allRoles == null ) {
			this.reloadRightsData();
		}
	},

	hasRight: function(user, accessObject, accessKind, data) {
		if( !user.isAuthenticated() ) {
			return false; // No permission if user is not authenticated
		}

		this._assureLoaded(); // Will load rights lazily

		if( !this._objectNumByFullName.hasOwnProperty(accessObject) ) {
			console.warn('Обращение к несуществующему объекту прав: ' + accessObject);
			return false;
		}
		var
			objectNum = this._objectNumByFullName[accessObject],
			rolesSplitted = (user.data().accessRoles || '').split(';'),
			userRoles = [];

		// Get nonempty role names tha mentioned in the list
		for( var i = 0; i < rolesSplitted.length; ++i ) {
			var role = rolesSplitted[i].split();
			if( role.length && this._roleNumByName.hasOwnProperty(role) ) {
				userRoles.push(role);
			}
		}

		var parentObjects = this._getParentObjectIds(accessObject);

		for( var i = 0; i < userRoles.length; ++i ) {
			var
				roleName = userRoles[i],
				rightKey = this._genRightKey(this._roleNumByName[roleName], objectNum, accessKind),
				item;

			// First of all try to find and apply rule exactly specialized for this object
			if( item = this._rulesByRightKey[rightKey] ) {
				if( item.rule.hasRight(user, data) )
					return true;
				continue; // Do not search in parent object if have specialized right
			}
			// There could be parents for this object with rights that propagate to child objects
			for( var j = 0; j < parentObjects.length; ++j )
			{
				var parentObjNum = parentObjects[j];
				rightKey = this._genRightKey(this._roleNumByName[roleName], parentObjNum, accessKind);
				if( item = this._rulesByRightKey[rightKey] ) {
					if( !item.inheritance ) {
						continue;
					} else if( item.rule.hasRight(user, data) ) {
						return true;
					} else {
						break;
					}
				}
			}
		}
		return false;
	},

	_genRightKey: function(roleNum, objectNum, accessKind) {
		return roleNum + '#' + objectNum + '#' + (accessKind.length? accessKind: null);
	},

	_getParentObjectIds: function(accessObject) {
		// Create list of parent objects starting from the innermost
		var
			accessObjSpl = accessObject.split('.'),
			parentObjects = [], it;
		
		for( var i = accessObjSpl.length - 1; i > 0; --i ) {
			if( !accessObjSpl[i].length ) {
				continue;
			}
			var parentObj = accessObjSpl.slice(0, i).join('.');
			if( it = this._objectNumByFullName[parentObj] ) {
				parentObjects.push(it);
			} else {
				break; // If there is no innest parent then there is no logic to search for outer parent
			}
		}
		return parentObjects;
	},

	/** Load all access rules from database into _allRules */
	loadAccessRules: function() {
		var ruleRS = this._dataSource.getRules();
		this._allRules = {};
		if( ruleRS == null ) {
			return;
		}
		for( var i = 0; i < ruleRS.getLength(); ++i ) {
			this._loadRuleWithChildren(ruleRS.getRecordAt(i), ruleRS);
		}
	},

	_loadRuleWithChildren: function(ruleRec, rulesRS) {
		var already;
		if( already = this._allRules[ruleRec.get("num")] ) {
			return already;
		}
		
		var
			ruleName = ruleRec.get("name"),
			newRule, coreRule;
		if( coreRule = this._ruleFactory.get(ruleName) ) {
			newRule = coreRule;
		} else {
			newRule = new CompositeAccessRule(
				ruleName,
				ruleRec.get("relation") || RulesRelation.none,
				this._loadChildRules(ruleRec, rulesRS)
			);
		}
		this._allRules[ruleRec.get("num")] = newRule;
		return newRule;
	},

	_loadChildRules: function(ruleRec, rulesRS) {
		var
			childRules = [],
			childIds = ruleRec.get("children") || [];
		for( var i = 0; i < childIds.length; ++i ) {
			var childRec = rulesRS.getRecord(childIds[i]);
			childRules.push(this._loadRuleWithChildren(childRec, rulesRS));
		}
		return childRules;
	},

	loadAccessObjects: function() {
		var
			objRS = this._dataSource.getObjects(),
			childKeys = {};

		this._allObjects = {};
		this._objectNumByFullName = {};
		if( objRS == null ) {
			return;
		}

		// For each item get list of children keys
		for( var i = 0; i < objRS.getLength(); ++i ) {
			var
				objRec = objRS.getRecordAt(i),
				currChilds;
			if( objRec.get("parent_num") == null ) {
				continue;
			}

			if( currChilds = childKeys[objRec.get("parent_num")] ) {
				currChilds.push(objRec.get("num"));
			} else {
				childKeys[objRec.get("parent_num")] = [objRec.get("num")];
			}
		}

		for( var i = 0; i < objRS.getLength(); ++i ) {
			this._loadObjectWithChildren(objRS.getRecordAt(i), objRS, childKeys);
		}

		for( var key in this._allObjects )
		{
			var obj = this._allObjects[key];
			if( obj.isGroup() )
				continue; // Don't want to have ability to access group by name

			var fullName = this.getFullObjectName(obj);
			if( this._objectNumByFullName.hasOwnProperty(fullName) ) {
				throw new Error('Duplicated access object name: ' + obj.name());
			}

			this._objectNumByFullName[fullName] = key;
		}
	},

	getFullObjectName: function(obj) {
		var result = '';
		while(obj != null) {
			result = obj.name() + (result.length? ".": '') + result;
			if( obj.parentNum() == null ) {
				break;
			}
			var parentPtr = this._allObjects[obj.parentNum()];
			if( parentPtr == null ) {
				throw new Error('Could not find parent access object by num: ' + obj.parentNum());
			}
			obj = parentPtr;
		}
		return result;
	},

	

	_loadObjectWithChildren: function(objRec, objRS, allChildKeys) {
		var already;
		if( already = this._allObjects[objRec.get("num")] ) {
			return already;
		}
		
		var
			childKeys = allChildKeys[objRec.get("num")] || [],
			childObjs = [], existing, childKey;

		for( var i = 0; i < childKeys.length; ++i ) {
			childKey = childKeys[i];
			if( existing = this._allObjects[childKey] ) {
				childObjs.push(existing);
			} else {
				var childRec = objRS.getRecord(childKey);
				childObjs.push(this._loadObjectWithChildren(childRec, objRS, allChildKeys));
			}
		}
		
		var newObj = new AccessObject(
			objRec.get("name"),
			(objRec.get("is_group") == null? false: objRec.get("is_group")),
			childObjs,
			(objRec.get("parent_num") == null? null: objRec.get("parent_num"))
		);
		this._allObjects[objRec.get("num")] = newObj;
		return newObj;
	},

	loadAccessRoles: function() {
		var roleRS = this._dataSource.getRoles();

		this._allRoles = {};
		this._roleNumByName = {};

		if( roleRS == null ) {
			return;
		}
		for( var i = 0; i < roleRS.getLength(); ++i ) {
			var roleRec = roleRS.getRecordAt(i);
			this._allRoles[roleRec.get("num")] = roleRec.get("name");
			if( this._roleNumByName.hasOwnProperty(roleRec.get("name")) ) {
				throw new Error('Duplicated role with name: ' + roleRec.get("name"));
			}
			this._roleNumByName[roleRec.get("name")] = roleRec.get("num");
		}
	},

	loadAccessRights: function() {
		var rightRS = this._dataSource.getRights();

		this._rulesByRightKey = {};
		if( rightRS == null ) {
			return;
		}
		for( var i = 0; i < rightRS.getLength(); ++i ) {
			var rightRec = rightRS.getRecordAt(i);
			// Currently skip rights without role, or object, or rule specification
			if( rightRec.get("role_num") == null || rightRec.get("object_num") == null || rightRec.get("rule_num") == null )
				continue;

			if( !this._allRoles.hasOwnProperty(rightRec.get("role_num")) )
				continue;

			var obj = this._allObjects[rightRec.get("object_num")];
			if( obj == null )
				continue;

			var rule = this._allRules[rightRec.get("rule_num")];
			if( rule == null )
				continue;

			this._addObjectRight(rightRec.get("object_num"), obj, rightRec, rule, 0);
		}
	},

	_addObjectRight: function(objectNum, obj, rightRec, rule, distance) {
		var objKeys, currObj;
		if( obj.isGroup() ) {
			// We can put links to other groups into group.
			// In that case all of the objects get rights of group where it is placed
			if( objKeys = this._groupObjKeys[objectNum] ) {
				for( var i = 0; i < objKeys.length; ++i ) {
					var objKey = objKeys[i];
					if( currObj = this._allObjects[objKey] ) {
						this._addObjectRight(objKey, currObj, rightRec, rule, distance + 1);
					}
				}
			}
		} else {
			// If it is a plain object then assign rights to it
			var rightKey = this._genRightKey(
				rightRec.get("role_num"),
				objectNum,
				// Consider null and "" are the same
				(rightRec.get("access_kind")? rightRec.get("access_kind"): null))

			var rulePtr = this._rulesByRightKey[rightKey];
			if(
				rulePtr == null
				// Override rule if it is more specific than existing in set
				|| rulePtr.distance() < distance
				// Overwrite rule if existing rule at the same level doesn't have inheritance,
				// because inherited has more permissions and should override
				|| rulePtr.distance() == distance && !rulePtr.inheritance()
			) {
				this._rulesByRightKey[rightKey] = new RuleWithFlag(
					rule,
					(rightRec.get("inheritance") == null? false: rightRec.get("inheritance")),
					distance
				);
			}
		}
	},

	loadGroupObjects: function() {
		var groupObjRS = this._dataSource.getGroupObjects();

		this._groupObjKeys = {};
		if( groupObjRS == null ) {
			return;
		}
		for( var i = 0; groupObjRS.getLength(); ++i ) {
			var groupObj = groupObjRS.getRecordAt(i), it;
			if( groupObj.get("group_num") == null || groupObj.get("object_num") == null )
				continue;

			if( it = this._groupObjKeys[groupObj.get("group_num")] ) {
				it.push(groupObj.get("object_num"));
			} else {
				this._groupObjKeys[groupObj.get("group_num")] = [groupObj.get("object_num")];
			}
		}
	},

	ruleStorage: function() {
		if( this._ruleFactory == null ) {
			throw new Error('Core access rule storage is not initialized!!!');
		}
		return this._ruleFactory;
	},

	rightSource: function() {
		if( this._dataSource == null ) {
			throw new Error('Right source is not initialized!!!');
		}
		return this._dataSource;
	}
});
});
