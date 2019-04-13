---
title: V8 是如何实现 JavaScript Hoist 的
tags:
  - Recommended
  - Understanding JavaScript
  - JavaScript
  - 闲读源码
quote:
  content: The one who says he can and the one who says he can't are both usually true.
  author: will smith
  source: ''
date: 2015-03-29T12:00:00.000Z
layout: blog-post
description: ''
---

首先
----

今天在知乎上看到一个问题“[JavaScript有预编译吗？](http://www.zhihu.com/question/29105940/answer/43277384)”，题主实际上是对 JavaScript 变量提升（hoist）机制的实现过程有疑惑。我刚知道 hoist 时也好奇过浏览器是怎么实现的，就跑去看了一下 V8 引擎的源码，做了一些笔记，现在正好趁机整理出来。

Hoist
-----

var 和 function 的 hoist 是老生常谈的问题，网上有大量资料，[JavaScript 秘密花园](https://bonsaiden.github.io/JavaScript-Garden/zh/#function.scopes)

V8 源码
-------

墙外：[Chromium](https://code.google.com/p/chromium)  
墙内：[GitHub](https://github.com/v8/v8-git-mirror/blob/master/src/dateparser.cc)

V8 的 Hoist
-----------

V8 中变量提升涉及到两个步骤，Parse 和 Analyze 。先 Parse 一遍代码得出 AST （抽象语法树）等信息，再把信息 Analyze 一遍。虽然 V8 有“预语法分析”,「preparser.h」， 只是为了收集信息辅助后续加速的，不属于预编译。

Talk is cheap, let me show you the code.

Parse 部分
----------

在「`parser.cc`」里

var 声明的处理在 `Parser::ParseVariableDeclarations` 函数中，对于 `var a = 2`，V8 是将声明和赋值分开处理的，即转换为 `var a; a = 2;` ，然后前者由 `Parser::Declare` 提升。提升就是将每一层作用域用户声明的变量都放在该层的 `variables_` 表中。

```cpp
Block* Parser::ParseVariableDeclarations( /*...*/ ) {
  /*...*/
  // 一层层地向外找合适的声明作用域
  Scope* declaration_scope = DeclarationScope(mode);
  /*...*/
  // 分析出变量名
  name = ParseIdentifier(kDontAllowEvalOrArguments, CHECK_OK);
  /*...*/
  // 下面会详细讲 proxy
  VariableProxy* proxy = NewUnresolved(name, mode);
  // 进一步封装
  Declaration* declaration =
      factory()->NewVariableDeclaration(proxy, mode, scope_, pos);
  // 声明变量，注意 VAR 声明时第二个参数是 false
  Variable* var = Declare(declaration, mode != VAR, CHECK_OK);
  /*...*/
  // 如果接下来还有等号的话（带赋值的变量声明）
  if (peek() == Token::ASSIGN /*...*/ ) {
    /*...*/
    // 解析出待赋的值
    value = ParseAssignmentExpression(var_context != kForStatement, CHECK_OK);
    /*...*/
  }
  /*...*/
  // 按正常的赋值表达式语句解析
  VariableProxy* proxy = initialization_scope->NewUnresolved(factory(), name);
    Assignment* assignment = factory()->NewAssignment(init_op, proxy, value, pos);
    block->AddStatement(
        factory()->NewExpressionStatement(assignment, RelocInfo::kNoPosition),
        zone());
  /*...*/
}
```

function 声明在 `Parser::ParseFunctionDeclaration` 中，

```cpp
Statement* Parser::ParseFunctionDeclaration( /*...*/ ) {
  /*...*/
  // 可以看到函数体在这里也一并读取了
  FunctionLiteral* fun = ParseFunctionLiteral( /*...*/ );
  /*...*/
  // 与var 声明大同小异
  VariableProxy* proxy = NewUnresolved(name, mode);
  Declaration* declaration =
      factory()->NewFunctionDeclaration(proxy, mode, fun, scope_, pos);
  // 注意这里的 true
  Declare(declaration, true, CHECK_OK);
  /*...*/
}
```

注意两者传入 `Parser::Declare` 函数的第二个参数值（`resolve`）不一样。

前面提过，对于“var a = 2”，V8 是将声明和赋值分开处理的，即转换为 `var a; a = 2;` 。`var a;` 提升后， `a = 2;` 还在原来的位置，相当于拆散了。

在 ES5 中，除了 `function` 作用域外还有 `with` 和 `catch` 可以产生作用域的（最近也做了[笔记](http://www.crimx.com/2015/03/09/es6-function-vs-block-scope)）。而 var 的 hoist 是提升到函数作用域的最前面，所以会有下面的情况：

```javascript
(function fn() {

  try {throw 1} catch(a) {
    console.log(a); // 1 ,这里的 a 是 catch 的
    var a = 3; // 这里的 a 也是 catch 的
  }

  console.log(a); // undefined ,这里的 a 是 fn 的

}());
```

所以对于 var 的声明，不可以在读到 `var a = 3;` 时就绑定，于是 V8 的 proxy 变量代理的机制就显得十分有用了。

对于 var 声明， proxy 不跟变量绑定，而是在 Parse 一遍后的 Analyze 阶段再统一进行绑定，所以传入 false；而由于函数没有上面的情况，在 Parse 的时候就可以将其 proxy 与变量绑定，于是传入的 resolve 为 true。

看看 `Parser::Declare` 如何处理变量：

```cpp
Variable* Parser::Declare(Declaration* declaration, bool resolve, bool* ok) {
  VariableProxy* proxy = declaration->proxy();
  DCHECK(proxy->raw_name() != NULL);
  const AstRawString* name = proxy->raw_name();
  VariableMode mode = declaration->mode();

  // 层层向外找最近的声明作用域
  Scope* declaration_scope = DeclarationScope(mode);

  // 只有符合以下几个声明作用域才会进行注册
  if (declaration_scope->is_function_scope() ||
      declaration_scope->is_strict_eval_scope() ||
      declaration_scope->is_block_scope() ||
      declaration_scope->is_module_scope() ||
      declaration_scope->is_script_scope()) {
    // 看看有没有被注册了
    var = declaration_scope->LookupLocal(name);
    // 如果没有就新注册一个
    if (var == NULL) {
      // var 和 function 还有 ES6 的 let const 等等都会在这里做标记
      var = declaration_scope->DeclareLocal(
          name, mode, declaration->initialization(),
          declaration->IsFunctionDeclaration() ? Variable::FUNCTION
                                               : Variable::NORMAL,
          kNotAssigned);
    } else if ( /*...*/ ) {
      /*...*/ // ES6 相关
    } else if (mode == VAR) {
      // 如果之前已经注册了的话，就可能被赋过值了
      var->set_maybe_assigned();
    }
  }

  /*...*/

  // 对于每次声明 V8 都会挂载一个 declaration 节点
  // 虽然只有在必要的时候才会生成相应代码
  // 但对于一个变量有过多的 declaration 节点必然会影响查找性能
  // 所以尽量不要重复声明
  declaration_scope->AddDeclaration(declaration);

  /*...*/

  // 前面提到的传入的 resolve 
  // function 为 true
  // var 为 false
  if (resolve && var != NULL) {
    // 绑定在一起
    proxy->BindTo(var);
  }
  return var;
}
```

Analyze 部分
------------

在「`scope.cc`」里

Analyze 是由最外层 `Scope::Analyze` 开始，一层层向里递归的查看需要 resolve 的作用域，然后对该作用域的每一个需要 resolve 的 proxy 再一层层向外递归查找最近的同名变量进行绑定。


总结
----

V8 为了处理声明提升，在每层作用域都会维护一个独立的声明作用域（`variables_` 表），这样运行时就可以从声明作用域中递归查找变量。为了处理一些不能确定的特殊情况，V8 会将 proxy 与变量的绑定推迟到 Analyze 阶段。

所以对 var 和 function 提升的处理在语法分析阶段就搞定了，不需要预编译。

【完】

