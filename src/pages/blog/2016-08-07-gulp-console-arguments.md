---
title: Gulp 使用命令行参数
tags:
  - Gulp
quote:
  content: ''
  author: ''
  source: ''
date: 2016-08-07T12:00:00.000Z
layout: blog-post
description: ''
---

命令行参数的好处就是方便控制，引用 Stack Overflow 的一个[回答](http://stackoverflow.com/a/23088183)：

> The environment setting is available during all subtasks. So I can use this flag on the watch task too.

通过 `require('gulp-util').env` 获得参数：


```javascript
var util = require('gulp-util');

gulp.task('styles', function() {
  return gulp.src(['src/styles/' + (util.env.theme ? util.env.theme : 'main') + '.scss'])
    .pipe(compass({
        config_file: './config.rb',
        sass   : 'src/styles',
        css    : 'dist/styles',
        style  : 'expanded'

    }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'ff 17', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(livereload(server))
    .pipe(gulp.dest('dist/styles'))
    .pipe(notify({ message: 'Styles task complete' }));
});
```

就可以这么用：

```bash
gulp watch --theme literature
```



