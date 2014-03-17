/****************************************************************
 * 		 前端MVVM框架的实现
 * 		 	实现第一步：双向绑定
 * 		 @by Aaron
 * 		     分析的源码:https://github.com/RubyLouvre/avalon
 *          	 github:https://github.com/JsAaron/aaMVVM
 *          	 blog:http://www.cnblogs.com/aaronjs/
 *****************************************************************/

var subscribers = 'aaron-' + Date.now();

var MVVM = function() {};


MVVM.define = function(name, factory) {
	var access,
		vModel = {}, //真正的视图模型对象
		scope = {};

	//通过执行函数,把函数内部vm的属性全都通过内部scope挂载
	//    vm.w = 100;
	//    vm.h = 100;
	//    vm.click = function() {
	//        vm.w = parseFloat(vm.w) + 10;
	//        vm.h = parseFloat(vm.h) + 10;
	//    }
	//	  此时 w,h,click的上下文很明显是指向了 scope
	factory(scope);

	//转成监控属性
	access = conversionAccess(scope);

	//转成访问控制器
	vModel = Object.defineProperties(vModel, withValue(access));

	aaObserver.call(vModel);

	console.log(vModel)
};

//转成访问控制器
//set or get
function conversionAccess(scope) {
	var objAccess = {};
	for (var k in scope) {
		accessor = objAccess[k] = function(value) { //set,get访问控制器

		}
	    accessor[subscribers] = [] //订阅者数组
	}

	return objAccess;
}

// 回收同一对象
function withValue(access) {
    var descriptors = {}
    for (var i in access) {
        descriptors[i] = {
			get          : access[i],
			set          : access[i],
			enumerable   : true,
			configurable : true
        }
    }
    return descriptors
}



//==============================参考========================================


//等价Object.defineProperties方法的实现
//	https://developer.mozilla.org/zh-CN/docs/JavaScript/Reference/Global_Objects/Object/defineProperty
//	http://ejohn.org/blog/ecmascript-5-objects-and-properties/
function defineProperties(obj, properties) {
	function convertToDescriptor(desc) {
		function hasProperty(obj, prop) {
			return Object.prototype.hasOwnProperty.call(obj, prop);
		}

		function isCallable(v) {
			// 如果除函数以外,还有其他类型的值也可以被调用,则可以修改下面的语句
			return typeof v === "function";
		}
		if (typeof desc !== "object" || desc === null)
			throw new TypeError("不是正规的对象");
		var d = {};
		if (hasProperty(desc, "enumerable"))
			d.enumerable = !! obj.enumerable;
		if (hasProperty(desc, "configurable"))
			d.configurable = !! obj.configurable;
		if (hasProperty(desc, "value"))
			d.value = obj.value;
		if (hasProperty(desc, "writable"))
			d.writable = !! desc.writable;
		if (hasProperty(desc, "get")) {
			var g = desc.get;
			if (!isCallable(g) && g !== "undefined")
				throw new TypeError("bad get");
			d.get = g;
		}
		if (hasProperty(desc, "set")) {
			var s = desc.set;
			if (!isCallable(s) && s !== "undefined")
				throw new TypeError("bad set");
			d.set = s;
		}

		if (("get" in d || "set" in d) && ("value" in d || "writable" in d))
			throw new TypeError("identity-confused descriptor");
		return d;
	}

	if (typeof obj !== "object" || obj === null)
		throw new TypeError("不是正规的对象");

	properties = Object(properties);
	var keys = Object.keys(properties);
	var descs = [];
	for (var i = 0; i < keys.length; i++)
		descs.push([keys[i], convertToDescriptor(properties[keys[i]])]);
	for (var i = 0; i < descs.length; i++)
		Object.defineProperty(obj, descs[i][0], descs[i][1]);

	return obj;
}