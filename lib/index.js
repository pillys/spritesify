var fs = require('fs');
var path = require('path');
var async = require('async');
var fsPath = require('fs-path');
var Sprite = require('./Sprite');

function Spritesify(spritespath, urlfix) {
  this.spritespath = spritespath;
  this.urlfix = urlfix;
  return this;
}

/**
 * sprite method
 * @method sprite
 * @param  {String}   spritespath sprite icons path, eg: ./icons/spritesify/
 * @param  {String}   urlfix      the url or relative path
 * @param  {Function} callback    callback function
 */
Spritesify.prototype.sprite = function(callback) {
  var that = this;
  async.waterfall([
    function(callback) {
      fs.readdir(that.spritespath, function(err, dirs) {
        if (err) {
          callback(err);
        } else {
          dirs = dirs.filter(function(name) {
            return /^[^~]*~[^~]+$/.test(name);
          }).map(function(name) {
            return path.join(that.spritespath, name);
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
      var images = [];
      async.eachSeries(list, function(item, callback) {
        if (item.files.length === 0) {
          callback(null);
        } else {
          var sprite = new Sprite({
            size: item.size,
            namespace: item.prefix
          });
          sprite.addImageSrc(item.files, function() {
            var filename = item.prefix + '.png';
            var urlpath = '';
            if(that.csspath && !/^(http|\/)/.test(that.urlfix)) {
              urlpath = path.relative(path.join(that.csspath, '../'), path.join(that.spritespath, that.urlfix + filename));
            } else {
              urlpath = that.urlfix + filename;
            }
            var obj = sprite.compile(urlpath);
            var chunks = [];
            obj.filename = filename;
            obj.png.on('data', function(chunk) {
              chunks.push(chunk);
            });
            obj.png.on('end', function() {
              images.push({
                chunks: chunks,
                css: obj.css,
                filename: filename
              });
              callback(null);
            });
            //obj.png.end();
          });
        }
      }, function(err) {
        if (err) {
          callback(err);
        } else {
          callback(err, images);
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

Spritesify.prototype.css = function(dirpath, csspath, callback) {
  if(typeof csspath === 'function') {
    callback = csspath;
    csspath = false;
  }
  var that = this;
  if(csspath) {
    that.csspath = csspath;
  }
  async.waterfall([
    function(callback) {
      that.save(dirpath, function(err, data) {
        if(err) {
          callback(err);
        } else {
          callback(null, data);
        }
      });
    },
    function(css, callback) {
      if(!csspath) {
        callback(null, css);
      } else {
        async.waterfall([
          function(callback) {
            fs.readFile(csspath, 'utf-8', function(err, data) {
              if(err) {
                callback(null, '');
              } else {
                callback(null, data);
              }
            });
          },
          function(data, callback) {
            var startString = '/*====spritesify====*/';
            var endString = '/*====/spritesify====*/';
            var startIndex = data.indexOf(startString);
            var endIndex = data.indexOf(endString);
            data = data.substring(0, startIndex) + startString + css + endString + data.substring(endIndex + endString.length);
            fs.writeFile(csspath, data, 'utf-8', function(err) {
              if(err) {
                callback(err);
              } else {
                callback(null, css);
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
      }
    }
  ], function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
};

Spritesify.prototype.save = function(dirpath, callback) {
  this.sprite(function(err, data) {
    if(err) {
      callback(err);
    } else {
      fsPath.mkdir(dirpath, function(err) {
        var css = [];
        async.eachSeries(data || [], function(obj, callback) {
          var filepath = path.join(dirpath, obj.filename);
          var ws = fs.createWriteStream(filepath);
          css.push(obj.css);
          obj.chunks.forEach(function(v) {
            ws.write(v);
          });
          ws.on('close', function() {
            callback(null);
          });
          ws.end();
        }, function(err) {
          if(err) {
            callback(err);
          } else {
            callback(null, css.join(''));
          }
        });
      });
    }
  });
};

module.exports = Spritesify;