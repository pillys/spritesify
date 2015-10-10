var fs = require('fs');
var path = require('path');
var async = require('async');
var argv = require('minimist')(process.argv.slice(2));
var Sprite = require('./Sprite');
var runPath = path.normalize(argv._.concat(['./'])[0]);
var cssPath = path.normalize(argv.o || './sprites.css');
var pngPath = path.join(runPath, 'spritesify');
var urlFix = argv.u || './';
var combo = /\.css$/.test(argv.o || '');

if (!fs.existsSync(pngPath)) {
  throw new Error('Folder `spritesify` not exists.');
}
if (!/\/$/.test(urlFix)) {
  urlFix = urlFix + '/';
}

async.waterfall([
  function(callback) {
    if (combo) {
      fs.exists(cssPath, function(exists) {
        if (exists) {
          callback(null);
        } else {
          callback(new Error('output css file not exists.'));
        }
      });
    } else {
      callback(null);
    }
  },
  function(callback) {
    fs.readdir(pngPath, function(err, dirs) {
      if (err) {
        callback(err);
      } else {
        dirs = dirs.filter(function(name) {
          return /^[^~]*~[^~]+$/.test(name);
        }).map(function(name) {
          return path.join(pngPath, name);
        });
        callback(null, dirs);
      }
    });
  },
  function(dirs, callback) {
    var list = [];
    async.eachSeries(dirs, function(item, callback) {
      fs.readdir(item, function(err, files) {
        if (err) {
          callback(err);
        } else {
          var itemarr = path.basename(item).split('~');
          files = files.filter(function(name) {
            return /^.*\.png$/.test(name);
          }).map(function(name) {
            return path.join(item, name);
          });
          list.push({
            size: parseInt(itemarr[0]) || 0,
            prefix: itemarr[1],
            files: files
          });
          callback(null);
        }
      });
    }, function(err) {
      callback(err, list);
    });
  },
  function(list, callback) {
    async.eachSeries(list, function(item, callback) {
      if (item.files.length === 0) {
        callback(null);
      } else {
        var sprite = new Sprite({
          size: item.size,
          namespace: item.prefix
        });
        sprite.addImageSrc(item.files, function() {
          var obj = sprite.compile(urlFix + item.prefix + '.png');
          obj.png.pipe(fs.createWriteStream(path.join(runPath, item.prefix + '.png')));
          if (combo) {
            fs.readFile(cssPath, 'utf8', function(err, content) {
              if (err) {
                callback(err);
              } else {
                var startStr = '/*====spritesify:' + item.prefix + '====*/';
                var endStr = '/*====/spritesify:' + item.prefix + '====*/';
                var startIndex = content.indexOf(startStr);
                var endIndex = content.indexOf(endStr);
                if (startIndex === -1 || endIndex === -1) {
                  content = startStr + '\n' + obj.css + '\n' + endStr + content;
                } else {
                  content = content.substring(0, startIndex + startStr.length) + '\n' + obj.css + content.substring(endIndex);
                }
                fs.writeFile(cssPath, content, 'utf8', callback);
              }
            });
          } else {
            fs.writeFile(path.join(cssPath, item.prefix + '.css'), obj.css, 'utf8', callback);
          }
        });
      }
    }, function(err) {
      callback(err, list);
    });
  }
], function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('spritesify ok.');
  }
});