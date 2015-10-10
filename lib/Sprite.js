var PNG = require('node-pngjs').PNG,
  Node = require('./Node'),
  path = require('path'),
  ejs = require('ejs'),
  fs = require('fs');

function Sprite(opt) {
  this.opt = opt || {};
  if (this.opt.cssTemplate == null) {
    this.opt.globalTemplate = this.opt.globalTemplate || ' {\n\
  display: inline-block;\n\
  background-image: url(<%- JSON.stringify(relativePngPath) %>);\n\
  background-repeat: no-repeat;\n\
  background-size: <%= width / ratio %>px <%= height / ratio %>px;\n\
<%if(size != 0){%>\
  width: <%= size %>px;\n\
  height: <%= size %>px;\n\
<%}%>\
  vertical-align: middle;\n\
  overflow: hidden;\n\
}\n';

    this.opt.eachTemplate = this.opt.eachTemplate || '<%= "."+node.className %> {\n\
<%if(size == 0){%>\
  width: <%= node.width / ratio %>px;\n\
  height: <%= node.height / ratio %>px;\n\
<%}%>\
  background-position: <%= -node.x / ratio %>px <%= -node.y / ratio %>px;\n\
}\n';

    this.opt.cssTemplate = '<%= "."+ namespace %>' + this.opt.globalTemplate +
      '<% nodes.forEach(function(node){ %>' + this.opt.eachTemplate +
      '<%})%>';

    this.opt.className = '<%= namespace != null ? namespace + "-" : "" %>' +
      '<%= path.basename(node.image.base != null ? path.relative(node.image.base, node.image.path) : node.image.path).replace(/\\.png$/,"").replace(/\\W+/g,"-") %>';
  }
  if (this.opt.ratio == null) {
    this.opt.ratio = 1;
  }
  if (this.opt.namespace == null) {
    this.opt.namespace = null;
  }
  this.images = [];
}

Sprite.prototype.addImageSrc = function(images, cb) {
  var self = this;
  var wait = images.length;
  images.forEach(function(imagePath) {
    fs.createReadStream(imagePath).pipe(new PNG()).on('parsed', function() {
      this.path = imagePath;
      self.images.push(this);
      if (--wait == 0 && cb != null) {
        cb();
      }
    });
  });
};
Sprite.prototype.addFile = function(file, cb) {
  var self = this;
  file.pipe(new PNG()).on('parsed', function() {
    this.path = file.path;
    this.base = file.base;
    self.images.push(this);
    if (cb != null) {
      cb();
    }
  });
};
Sprite.prototype.addFiles = function(files, cb) {
  var self = this;
  var wait = files.length;
  files.forEach(function(file) {
    self.addFile(file, function() {
      if (--wait == 0 && cb != null) {
        cb();
      }
    })
  });
};

Sprite.prototype.compile = function(relativePngPath) {
  var self = this;

  var width = 0;
  var height = 0;

  var root = new Node();
  var sortedImage = this.images.sort(function(a, b) {
    return b.height - a.height;
  });
  sortedImage.forEach(function(image) {
    root.insert(image);
  });

  var nodes = root.getNodeWithImages();
  nodes.forEach(function(node) {
    width = Math.max(width, node.width + node.x);
    height = Math.max(height, node.height + node.y);
  });

  var png = new PNG({
    width: width,
    height: height,
    deflateStrategy: 1
  });

  // clean png
  for (var i = 0; i < width * height * 4; i++) {
    png.data[i] = 0x00;
  }

  nodes.forEach(function(node) {
    // Format Name
    node.className = ejs.render(self.opt.className, {
      path: path,
      node: node,
      size: self.opt.size,
      namespace: self.opt.namespace
    });
    //
    node.image.bitblt(png, 0, 0, node.width, node.height, node.x, node.y);
  });

  cssString = ejs.render(this.opt.cssTemplate, {
    path: path,
    nodes: nodes,
    relativePngPath: relativePngPath.replace(/\\/g, '/'),
    ratio: this.opt.ratio,
    size: self.opt.size,
    namespace: this.opt.namespace,
    width: width,
    height: height
  });

  return {
    css: cssString,
    png: png.pack()
  }
};

module.exports = Sprite;