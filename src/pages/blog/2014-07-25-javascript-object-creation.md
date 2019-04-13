---
title: JavaScript 创建对象总结
tags:
  - Understanding JavaScript
  - JavaScript
  - Object
quote:
  content: 对 JavaScript 中各种创建对象方法的总结
  author: ''
  source: ''
date: 2014-07-25T12:00:00.000Z
layout: blog-post
description: ''
---

JavaScript 是一门灵活的语言，就创建对象而言就有各种各样的方法。本文是《JavaScript高级程序设计》（第3版）的笔记，主要是针对各种创建对象方法之间的关系、优缺点进行梳理。每种方法相关的其它细节不是本文重点，我会标记页码。

创建单个对象
------------

1、object 构造函数：调用 `Object` 的构造函数。`person` 的 `constructor` 值是 `Object`。

```javascript
var person = new Object();
person.name = 'StrayBugs';
person.age = 22;
person.job = 'student';
person.sayName = function() {
	alert(this.name);
};
```

2、字面量：不会调用 `Object` 的构造函数。而 `person` 的 `constructor` 值也是 `Object`。

```javascript
var person = {
	name: 'StrayBugs',
	age: 22,
	job: 'student',
	sayName: function() {
		alert(this.name);
	}
}
```

优点：简单、方便  
缺点：批量创建对象很麻烦。不能使用 `instanceof` 来确定对象类型（都是 `Object`）。

工厂模式
--------

工厂模式是为了解决批量创建对象的问题。

就是用一个函数将上述创建单个对象的方法包装起来，就可以减少代码量了。以第一种方法为例：

```javascript
function createPerson(name, age, job) {
	var o = new Object();
	o.name = name;
	o.age = age;
	o.job = job;
	o.sayName = function() {
		alert(this.name);
	};
	return o;
}

var person1 = createPerson('StrayBugs', 22, 'student');  
var person2 = createPerson('Angel', 20, 'Artist');
```

优点：减少了代码量。  
缺点：未能解决对象识别的问题。

构造函数模式
------------

构造函数模式解决了对象识别问题，是基于工厂模式的改进。

是利用了 new 作用域转移的特性。

```javascript
function Person(name, age, job) {
	this.name = name;
	this.age = age;
	this.job = job;
	this.sayName = function() {
		alert(this.name);
	};
}

var person1 = new Person('StrayBugs', 22, 'student');  
var person2 = new Person('Angel', 20, 'Artist');
```

必须用 `new` 操作符来创建 `Person` 实例。以这种方式调用构造函数实际上会经历以下4个步骤：

1. 创建一个新对象； 
2. 将构造函数的作用域赋给新对象（因此 `this` 就指向了这个新对象）； 
3. 执行构造函数中的代码（为这个新对象添加属性）； 
4. 返回新对象。 

此时 `person1` 与 `person2` 都可以用 `constructor` 和 `instanceof` 来验证其对象类型是 `Person`。

当不使用 `new` 来创建对象时，由于在全局作用域中 `this` 指向 `Global`（浏览器中就是 `window` 对象），所以可以直接通过 `window` 对象调用 `sayName`，不建议这么做，会污染全局环境。

也可以用 `call()` 与 `apply()` 来为 `Person` 指定作用域。

优点：在工厂模式的基础上解决了对象识别问题。  
缺点：每个实例的方法都是独立的，多数情况下同个对象的实例方法都是一样的，于是这里造成了冗余。  
偏方：将函数定义单独出来，如下面例子：

```javascript
function Person(name, age, job) {
	this.name = name;
	this.age = age;
	this.job = job;
	this.sayName = sayName;
}

function sayName() {
	alert(this.name);
};

var person1 = new Person('StrayBugs', 22, 'student');  
var person2 = new Person('Angel', 20, 'Artist');
```

这么写是不是很别扭，也没有封装性可言。

原型模式
--------

原型模式很好解决了上面的封装性问题。原型也是 JavaScrip 最重要的特性之一。书本篇幅比较长，这里只为了突出原型要解决的问题，所以会省略很多。

原型就是为了共用而生：默认情况下，每个对象与它的所有实例都共用一个原型。对象可以通过 `.prototype` 访问原型。实例存在内部属性 `[[Prototype]]`，不能直接访问（不推荐使用 `__proto__`）。

```javascript
function Person() {
} 
 
Person.prototype.name = 'StrayBugs'; 
Person.prototype.age = 22; 
Person.prototype.job = 'student'; 
Person.prototype.sayName = function() { 
    alert(this.name); 
}; 
 
var person1 = new Person(); 
person1.sayName();   //"StrayBugs" 
 
var person2 = new Person();
person2.sayName();   //"StrayBugs" 
 
alert(person1.sayName == person2.sayName);  //true
```

原型也可以用字面量来创建，但是其 `constructor` 要手动修改，具体方法及副作用见书 P155。

如下图，原型的 `constructor` 属性指向 `Person`，`Person` 的两个实例的 `[[Prototype]]` 直接指向原型，与 `Person` 没有直接关系。

![prototype][prototype]

上图可以看到三者是共用同一个原型。于是 `Person` 在原型上的改变会影响到所有的实例。

```javascript
Person.prototype.sayName = function() { 
    alert("hi!"); 
};

person1.sayName();   //"hi!" 
person2.sayName();   //"hi!" 
```

注意当实例上存在与原型重名的属性时，实例的属性会屏蔽掉原型的属性。因为先是查看实例中有无该属性，没找到才会去原型中查找。书本 P150。

对象还可以重写原型，但此时已创建的实例依然指向旧原型（前面说了实例原型与对象无直接关系）。书本 P157

优点：共用原型减少了冗余。  
缺点：在原型上的改变会影响到所有的实例，于是实例没有了独立性。

组合使用构造函数模式和原型模式
------------------------------

目的是解决原型模式的独立性问题。将需要共用的属性（一般是方法）定义在原型上，将独立的属性定义在构造函数中。

```javascript
function Person(name, age, job){ 
    this.name = name; 
    this.age = age; 
    this.job = job; 
    this.friends = ["Shelby", "Court"]; 
} 
 
Person.prototype = { 
    constructor : Person, 
    sayName : function(){ 
        alert(this.name); 
    } 
}; 
 
var person1 = new Person('StrayBugs', 22, 'student'); 
var person2 = new Person('Angel', 20, 'Artist'); 
 
person1.friends.push("Van"); 
alert(person1.friends);    //"Shelby,Count,Van" 
alert(person2.friends);    //"Shelby,Count" 
alert(person1.friends === person2.friends);    //false 
alert(person1.sayName === person2.sayName);    //true
```

优点：结合了构造函数模式和原型模式的优点，并解决了其缺点。  
缺点：代码没有很好的封装起来。

动态原型模式
------------

看到这里也应该猜到，动态原型模式就是为了解决上面的封装问题。

```javascript
function Person(name, age, job){ 
 
    //属性 
    this.name = name; 
    this.age = age; 
    this.job = job;

    //方法 
    if (typeof this.sayName != "function"){ 
        Person.prototype.sayName = function(){ 
            alert(this.name); 
        }; 
    } 
} 
 
var friend = new Person('StrayBugs', 22, 'student'); 
friend.sayName(); //'StrayBugs'
```

这里即使有多个方法也只需判断其中一个方法存不存在即可开始初始化。

到了这里其实最后两种创建对象的方法已经非常完美了。接下来讲的是一些特殊情况下，上面都不适应时的方法。

寄生构造函数模式
----------------

顾名思义，有时候我们需要在一些已有的对象上添加一些方法，但是又不能（或不希望）改变该对象的构造函数，就可以用寄生构造函数模式。

```javascript
function createPerson(name, age, job) {
	var o = new Object();
	o.name = name;
	o.age = age;
	o.job = job;
	o.sayName = function() {
		alert(this.name);
	};
	return o;
}

var person1 = new createPerson('StrayBugs', 22, 'student');  
var person2 = new createPerson('Angel', 20, 'Artist');
```

它的定义方法跟工厂模式一模一样，不同的是调用时使用 `new` 创建。这是因为虽然里面都是 `o`，工厂模式中的 `o` 是作为实例，所以返回的是实例。寄生构造函数模式中的 `o` 是作为构造函数，所以返回的是构造函数。下面的例子更贴切。

```javascript
function SpecialArray(){ 
 
    //创建数组 
    var values = new Array(); 
 
    //添加值 
    values.push.apply(values, arguments); 
 
    //添加方法 
    values.toPipedString = function(){ 
        return this.join("|"); 
    }; 
     
    //返回数组 
    return values; 
} 
 
var colors = new SpecialArray("red", "blue", "green"); 
alert(colors.toPipedString()); //"red|blue|green" 
```

这样就在 `Array` 的基础上建立了新的构造函数了。

缺点：与工厂模式一样，不能依赖 `instanceof` 操作符来确定对象类型。

稳妥构造函数模式
----------------

主要是为了在安全执行环境中使用。P161

稳妥构造函数遵循与寄生构造函数类似的模式，但有两点不同：  
一是新创建对象的实例方法不引用 this；  
二是不使用 new 操作符调用构造函数。

```javascript
function Person(name, age, job){ 
     
    //创建要返回的对象 
    var o = new Object(); 

    //可以在这里定义私有变量和函数 
 
    //添加方法 
    o.sayName = function(){ 
        alert(name); 
    };     
     
    //返回对象 
    return o; 
} 
```

这里除了使用 `sayName()` 方法之外，没有其他办法访问 `name` 的值。可以像下面使用稳妥的 `Person` 构造函数。 

```javascript
var friend = Person('StrayBugs', 22, 'student'); 
friend.sayName();  //'StrayBugs'
```

缺点：与寄生构造函数一样，不能依赖 `instanceof` 操作符来确定对象类型。

总结
-----

以上五花八门的创建对象方式正体现了 JavaScript 的灵活性。这里没有好与差的方法，只有最适合的方法。我认为重点是把这几种方法串起来，因为如果不了解其 WHAT HOW WHY，不仅很容易就忘记了，而且不能清晰的了解在什么场合适合运用什么方法。所以希望有机会能看到这篇文章的同学以后不用再愁“对象问题”啦！

[prototype]: /img/post/javascript/object-prototype.png

