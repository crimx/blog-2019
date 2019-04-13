---
title: JavaScript 继承总结
tags:
  - Understanding JavaScript
  - JavaScript
  - Inheritance
quote:
  content: 对 JavaScript 中各种继承方法的总结，《JavaScript高级程序设计》笔记
  author: ''
  source: ''
date: 2014-07-27T12:00:00.000Z
layout: blog-post
description: ''
---

先用一个简单的 Person 类作为文章其它例子的前提。

```javascript
function Person(name) {
    if(name !== undefined) {
        this.name = name;
    } else {
        this.name = "StrayBugs";
    }
    this.age = 22;
}

Person.prototype.sayName = function() {
    alert(this.name);
};
```

原型链
------

JavaScript 中实现继承第一个方法是利用原型链。

继承就是要让子类获得父类的属性和方法。原型链的思路是利用原型共享的特点，让父类的一个实例充当子类的原型。父类的实例必然包括了父类的属性与方法，那么子类的所有实例都可以通过原型链一层层找到父类的属性与方法了。

新手很可能会在这里混淆，请分析出下面三种代码中原型与实例的属性与方法。

```javascript
function Man() {

}

//第一种
Man.prototype = Person;
var man = new Man();

//第二种
Man.prototype = Person();
var man = new Man();

//第三种
Man.prototype = new Person();
var man = new Man();
```

第一种：`Man.prototype` 获得的是 `Person` 函数的指针，也就是说，`Man.prototype` 就是 `Person` 函数。这里没有任何调用 `Man.prototype` 的代码，且 `Man` 是个空函数，所以其实例 `man` 的内部属性 `[[prototype]]` 值指向 `Person` 函数。

![sen2][sen2]

第二种：构造函数本质也是函数。`Person()` 相当于执行了构造函数并将返回值赋给原型。因为 `Person()` 没有 `return`，故返回值为 `undefined`，于是代码等价于 `Man.prototype = undefined;`，所以 `man` 的 `[[prototype]]` 值为 `Object`。

第三种：正解。创建了一个 `Person` 实例，有了属性与方法。`Man` 的所有实例将共享这个 `Person` 实例。

![sen3][sen3]

原型链的缺点与创建对象的原型模式一样，适合用来继承方法，不适合继承属性。因为一般情况下我们都希望各个实例的属性值是独立的。而且，因为属性是共用的，大家的值都一样，无法针对某个实例去初始化。

借用构造函数
--------------

与创建对象的思路类似，这里对应构造器模式的是借用构造函数（Constructor Stealing）技术。就是在子类的构造函数中通过 `父类.apply(this)` 或者 `父类.call(this)` 来借用父类构造器。这时每个实例都有单独的副本，互不影响，所以可以在构造函数中传入参数进行初始化。

```javascript
function Man(name) {

    //每个实例都可以有自己的名字
    Person.call(this, name);

    //子类增加的属性
    this.job = 'student';
}

var man1 = new Man();
var man2 = new Man('Jesse');

alert(man1.name); //"StrayBugs"
alert(man2.name); //"Jesse"

alert(man1.sayName); //undefined
alert(man2.sayName); //undefined
```

其缺点与构造函数模式一样，没有继承原型链，方法没有共享。

组合继承
-------

参考创建对象的“组合使用构造函数模式和原型模式”，这里也可以组合构造函数与原型链来实现继承，叫做组合继承（Combination Inheritance）。是 JavaScript 中最常用的继承模式。

```javascript
function Man(name) {

    //每个实例都可以有自己的名字
    Person.call(this, name);

    //子类增加的属性
    this.job = 'student';
}

//继承方法
Man.prototype = new Person();
Man.prototype.constructor = Man;

//子类增加的方法
Man.prototype.sayAge = function() {
    alert(this.age);
};

var man1 = new Man();
var man2 = new Man('Jesse');

man1.sayName(); //"StrayBugs"
man2.sayName(); //"Jesse"
man2.sayAge();  //22

alert(man1 instanceof Man);    //true
alert(man1 instanceof Person); //true
alert(man1.constructor.prototype.isPrototypeOf(man2)); //true
```

可以看到 `instanceof` 与 `isPrototypeOf` 都可以正常工作。

再画个图加深理解。

![sen4][sen4]

可以看到，这个方法还是有点小缺陷。就是子类的原型上还保留了一份无用的共用属性。

原型式继承
---------

原型式继承（Prototypal Inheritance）很特别，它希望利用现有的对象去继承该对象的类。说白了，就是前文的原型链继承那里，将 `new Person()` 换成一个现有的对象（比如 `Person`的一个现有的实例）。封装起来就是这个样子：

```javascript
function object(o) {
    function F() {}
    F.prototype = o;
    return new F();
}
```

可以看到，原理上是跟原型链一样的，可以看做是原型链的简化版，在只需简单地浅复制一个对象时很有用。但同时要注意原型的潜在问题，如下面的例子：

```javascript
var person = new Person();

var man = object(person);
man.name = 'Jesse';

man.sayName(); //"Jesse"
alert(man.age);  //22

person.name = 'StrayBugs';
person.age = 101;

man.sayName(); //"Jesse"
alert(man.age);  //101
```

ECMAScript5 新增 `Object.create()` 方法规范化了原型式继承。

寄生式继承
---------

这时你也许会想，可不可以在原型式继承的基础上再添加方法？当然可以，这就是寄生式继承（Parasitic Inheritance），且寄生式继承不局限于原型式继承。

顾名思义，这里可以联想起寄生构造函数模式，也就是工厂模式的变种。寄生式继承可以看做是原型式继承的增强版。

```javascript
function createMan(person) {

    //这里不一定是 object()，可以是任意能返回新对象的函数
    var man = object(person);
    man.sayAge = function() {
        alert(this.age);
    };
    return man;
}

var person = new Person();

var man = createMan(person);
man.sayAge(); //22
```

这里也可以看到，寄生式继承对象的方法没有复用。

寄生组合式继承
-------------

前面组合继承结尾的时候提了一下，子类的原型上会保留了一份无用的属性。这是因为使用组合继承会调用两次父类构造函数。第一次调用是为子类添加原型 `new Person()` 的时候，第二次是子类构造函数内部调用 `Person.call(this, name)` 。寄生组合式继承解决了这个问题。第一次调用构造函数的目的就是为了得到父类的原型，那么有了原型式继承的浅复制方法，我们就可以直接复制原型了嘛。

```javascript
function inheritPrototype(Man, Person) {
    //只复制原型
    var p = object(Person.prototype);
    p.constructor = Man;
    Man.prototype = p;
}
```

定义：

```javascript
function Man(name) {
    Person.call(this, name);
    this.job = 'student';
}

inheritPrototype(Man, Person);

Man.prototype.sayAge = function() {
    alert(this.age);
};
```

抛开这个函数去看其实就是原型链继承中将 `new Person()` 换成 `object(Person.prototype)`。 `instanceof` 与 `isPrototypeOf` 对 `Person` 依然有效。

```javascript
var man = new Man('Jesse');
man.sayAge();  //22

alert(man instanceof Man);    //true
alert(man instanceof Person); //true

alert(Man.prototype.isPrototypeOf(man));    //true
alert(Person.prototype.isPrototypeOf(man)); //true
```

再画个图加深理解，跟原型链比较。

![sen5][sen5]


总结
----

可见原型几乎贯穿了各种 JavaScript 继承方式。理解以及灵活利用原型是写出优秀代码的关键。无论是继承还是创建对象，最终理想的方案都是将几种不同方式的优点结合在一起，这正是 JavaScript 灵活的魅力。


[sen2]: /img/post/javascript/inheritance-sen2.png
[sen3]: /img/post/javascript/inheritance-sen3.png
[sen4]: /img/post/javascript/inheritance-sen4.png
[sen5]: /img/post/javascript/inheritance-sen5.png

















