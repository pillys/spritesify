# spritesify

  easy used css sprites tools.

  can auto combo png files to a single or more, then create the css code or file.

## install

```js
npm install spritesify -g
```

## usage

### basic folder tree

```html
[run]
  ├── spritesify
  │     ├── 40~icons40
  │     │   ├── 1.png
  │     │   ├── 2.png
  │     │   └── 3.png
  │     └── ~normal
  │         ├── 4.png
  │         ├── 5.png
  │         ├── 6.png
  │         └── 7.png
  └── common.css
```

* you need have a folder named "spritesify"
* in "spritesify" folder, some sub folder named "(size)~(class)", linked via '~'

The left side is the common png size, the right side is the class name you want.

If some pngs have the same width and height, you can set 'size' to the png's size, eg: 16~icona, 32~iconb etc.

If the other pngs with different size, you can set 'size' to 0 or empty, eg: ~pica or 0~picb.

'class' means the class name prefix in css

So:

* some 40*40 pngs will be put in "40~icona" folder
* some other different size pngs can be put in "~pica" folder

When we run, it will create two sprited pngs: icona.png / pica.png.

### grammar

```js
spritesify [source] -o [dist]
```
* [source]: source folder
* [dist]: output file name or dir, when is a file, code will insert to the file, when is a dir path, it will create some new css file
* -o: output

```html
<span class="normal normal-4"></span>
<span class="icons40 icons40-1"></span>
```

### combo the png files, and add css-sprites code to ./common.css

command:

```js
spritesify ./ -o ./common.css
```

result: 

```html
[run]
  ├── spritesify
  │     ├── 40~icons40
  │     │   ├── 1.png
  │     │   ├── 2.png
  │     │   └── 3.png
  │     └── ~normal
  │         ├── 4.png
  │         ├── 5.png
  │         ├── 6.png
  │         └── 7.png
  ├── common.css
  ├── icons40.png
  └── normal.png
```

open ./common.css, we'll find the new code is inserted to this file:

```css
/*====spritesify:normal====*/
.normal {
  display: inline-block;
  background-image: url("./normal.png");
  background-repeat: no-repeat;
  background-size: 370px 300px;
  vertical-align: middle;
  overflow: hidden;
}
.normal-4 {
  width: 200px;
  height: 300px;
  background-position: 0px 0px;
}
.normal-6 {
  width: 20px;
  height: 200px;
  background-position: -200px 0px;
}
.normal-5 {
  width: 150px;
  height: 80px;
  background-position: -220px 0px;
}
/*====/spritesify:normal====*/
/*====spritesify:icons40====*/
.icons40 {
  display: inline-block;
  background-image: url("./icons40.png");
  background-repeat: no-repeat;
  background-size: 120px 40px;
  width: 40px;
  height: 40px;
  vertical-align: middle;
  overflow: hidden;
}
.icons40-1 {
  background-position: 0px 0px;
}
.icons40-2 {
  background-position: -40px 0px;
}
.icons40-3 {
  background-position: -80px 0px;
}
/*====/spritesify:icons40====*/
```

then you can use it in html like this:

```html
<span class="normal normal-4"></span>
<span class="icons40 icons40-1"></span>
```

### combo, then set the png's url to http://www.site.com

command:

```js
spritesify ./ -o ./common.css -u http://www.site.com
```

the url now is a http path:

```css
...
  background-image: url("http://www.site.com/normal.png");
...
```

### combo, then create new css files in /usr/local/test 

command:

```js
spritesify ./ -o /usr/local/test
```
result:

```html
[run]
  ├── spritesify
  │     ├── 40~icons40
  │     │   ├── 1.png
  │     │   ├── 2.png
  │     │   └── 3.png
  │     └── ~normal
  │         ├── 4.png
  │         ├── 5.png
  │         ├── 6.png
  │         └── 7.png
  ├── icons40.png
  └── normal.png
```

```html
/usr/local/test
            ├── icons40.css
            └── normal.css
```


## License

  [MIT](LICENSE)