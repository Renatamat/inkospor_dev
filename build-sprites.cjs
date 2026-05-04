// build-sprites.cjs
const path = require('path');
const fs = require('fs');
const Sprite = require('svg-sprite');
const baseConfig = require('./sprite.config.cjs');

function buildSprite(size) {
  const config = {
    ...baseConfig,
    dest: 'public/sprites',
    mode: {
      symbol: {
        mode: 'symbol',
        sprite: `icons-${size}.svg`,
        dest: '.',
        example: false,
      },
    },
  };

  const sprite = new Sprite(config);

  const dir = `source/icons/${size}`;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const svg = fs.readFileSync(filePath, 'utf8');
    sprite.add(filePath, null, svg);
  });

  sprite.compile((error, result) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    Object.values(result).forEach(mode =>
      Object.values(mode).forEach(resource => {
        const outPath = resource.path;
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, resource.contents);
        console.log('Wrote', outPath);
      }),
    );
  });
}

buildSprite(16);
buildSprite(20);
buildSprite(24);
