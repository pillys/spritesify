# spritesify

  png 图标自动合并工具

## 安装

```
npm install spritesify --save
```

## 引用
```
var sprites = require('spritesify');

sprites(runPath, cssPath, urlFix, function(err){
    if(err) {
        console.log(err);
    } else {
        console.log('done');
    }
});
```


## 基本的目录结构

```
[运行目录]
  ├── spritesify/
  │     ├── 40~icons40/
  │     │   ├── 1.png
  │     │   ├── 2.png
  │     │   └── 3.png
  │     └── ~normal/
  │         ├── 4.png
  │         ├── 5.png
  │         ├── 6.png
  │         └── 7.png
  └── common.css
```

* 创建一个名为 ``spritesify`` 的目录
* 在目录 ``spritesify`` 中, 子目录以 ``(size)~(class)`` 的形式命名

左侧 ``size`` 表示 png 图片的尺寸，右侧是生成的 css 中对应的 class 名称

如果你有一组相同尺寸的图标，推荐设置 ``size``，这样可以使你的图片结构更加清晰，例如：

``16~icona`` 表示生成的图片是 16 像素序列的 ``icona.png``，对应的 class 为 ``.icona-*** {}``

如果你的图片尺寸不固定，那么 ``size`` 可以省略（或设置为 0），只设置 ``class`` 即可，如：

``~pica`` 或 ``0~picb``

因此：

* 40*40 的 png 图标放入 ``40~somename`` 目录中
* 其它不同尺寸的图标放入 ``~othername`` 目录中

当使用 ``spritesify`` 编译时，将会生成 icona.png / pica.png.

## 参数

* runPath：运行目录（指 ``spritesify/`` 所在的父级目录）
* cssPath：索要生成或合并的 css 文件路径，如果不需要写入 css，该项请传入 ``''``
* urlFix：需要设置的 ``http`` 全路径，如果不需要全路径，该项传入 ``''``
* callback：回调函数

## HTML 用法
```html
<span class="normal normal-4"></span>
<span class="icons40 icons40-1"></span>
```

## License

  [MIT](LICENSE)