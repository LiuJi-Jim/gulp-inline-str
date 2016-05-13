```
npm install --save-dev gulp-inline-str
```

```
gulp.src('src/**/*.js')
    .pipe(inlineStr({
        basePath: './src' // -- defaults to __dirname
    })
```

```
var template = __inline('templates/panel.html');
------>
var template = "<div ....... >";
```

