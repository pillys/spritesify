var fs = require('fs');
var path = require('path');
var async = require('async');
var Sprite = require('./Sprite');

/*
  runPath: spritesify图标目录所在的位置
  cssPath: 输出的 css 文件路径，如果不存在，则不写入css
  urlFix : 替换的 url地址
 */

module.exports = function(runPath, cssPath, urlFix, callback) {
  var combo = !!cssPath;
  runPath = runPath || './';
  urlFix = urlFix || './';
  var pngPath = path.join(runPath, 'spritesify');

  if (!fs.existsSync(pngPath)) {
    callback(new Error('Folder `spritesify` not exists.'));
    return false;
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
      var contents = [];
      async.eachSeries(list, function(item, callback) {
        if (item.files.length === 0) {
          callback(null);
        } else {
          var sprite = new Sprite({
            size: item.size,
            namespace: item.prefix
          });
          sprite.addImageSrc(item.files, function() {
            var pngPath = path.join(runPath, item.prefix + '.png');
            var tmpPath = pngPath + '.tmp';
            console.log('>> building ' + pngPath);
            async.waterfall([
              function(callback) {
                var obj = sprite.compile(urlFix + item.prefix + '.png');
                var wstream = fs.createWriteStream(tmpPath);
                obj.png.on('data', function(data) {
                  wstream.write(data);
                });
                obj.png.on('error', function(err) {
                  console.log('[spritesify error] ' + err);
                });
                obj.png.on('end', function() {
                  wstream.end();
                  contents.push(obj.css);
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
                    callback(null);
                  }
                });
              },
              function(callback) {
                fs.exists(pngPath, function(exists) {
                  try {
                    var newData = fs.readFileSync(tmpPath, 'binary');
                    if (exists) {
                      var oldData = fs.readFileSync(pngPath, 'binary');
                      if (oldData.toString() === newData.toString()) {
                        callback(null, null);
                      } else {
                        callback(null, newData);
                      }
                    } else {
                      callback(null, newData);
                    }
                  } catch (e) {
                    console.log(e);
                    callback(null, null);
                  }
                });
              },
              function(data, callback) {
                if (data) {
                  fs.writeFile(pngPath, data, 'binary', function(err) {
                    if (err) {
                      callback(err);
                    } else {
                      callback(null);
                    }
                  });
                } else {
                  callback(null);
                }
              },
              function(callback) {
                fs.unlink(tmpPath, function(err) {
                  callback(null);
                });
              }
            ], function(err) {
              if (err) {
                callback(err);
              } else {
                callback(null);
              }
            });
          });
        }
      }, function(err) {
        if (err) {
          callback(err);
        } else {
          callback(err, contents.join('\n\n'));
        }
      });
    }
  ], function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
};