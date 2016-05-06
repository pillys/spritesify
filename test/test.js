var sprites = require('../index');
sprites('./', './style.css', '', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('ok');
  }
});