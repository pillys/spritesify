function Node(x, y, width, height) {
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || Infinity;
  this.height = height || Infinity;
}

Node.prototype.insert = function(image) {
  //  if we're not a leaf
  if (this.image == null && this.left != null && this.right != null) {
    // try inserting into first child
    var newNode = this.left.insert(image);
    if (newNode != null) {
      return newNode;
    }
    //no room, insert into second
    return this.right.insert(image);
  }
  // if there's already a image here
  if (this.image != null) return null;
  // if we're too small
  if (this.width < image.width || this.height < image.height) return null;
  // if we're just right
  if (this.width == image.width && this.height == image.height) {
    this.image = image;
    return this;
  }

  // gotta split this node and create some kids
  var dw = this.width - image.width;
  var dh = this.height - image.height;
  if (dw > dh) {
    this.left = new Node(
      this.x,
      this.y,
      image.width,
      this.height
    );
    this.right = new Node(
      this.x + image.width,
      this.y,
      this.width - image.width,
      this.height
    );
  } else {
    this.left = new Node(
      this.x,
      this.y,
      this.width,
      image.height
    );
    this.right = new Node(
      this.x,
      this.y + image.height,
      this.width,
      this.height - image.height
    );
  }
  // insert into first child we created
  return this.left.insert(image);
};

Node.prototype.getNodeWithImages = function() {
  if (this.image) return [this];
  if (this.left != null && this.right != null) {
    return this.left.getNodeWithImages().concat(this.right.getNodeWithImages())
  }
  return [];
};

module.exports = Node;