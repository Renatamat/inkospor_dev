const path = require('path');

module.exports = {
  dest: 'public/sprites',
  shape: {
    transform: [] // tu możesz kiedyś dodać SVGO, jeśli nie robisz go osobno
  },
  mode: {
    symbol16: {
      mode: 'symbol',
      sprite: 'icons-16.svg',
      dest: '.', // względnie do dest
      example: false
    },
    symbol20: {
      mode: 'symbol',
      sprite: 'icons-20.svg',
      dest: '.',
      example: false
    },
    symbol24: {
      mode: 'symbol',
      sprite: 'icons-24.svg',
      dest: '.',
      example: false
    }
  }
};
