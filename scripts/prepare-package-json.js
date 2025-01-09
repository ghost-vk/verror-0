import fs from 'fs';
import path from 'path';

const buildDir = './lib';
(function () {
  fs.readdir(buildDir, function (err, dirs) {
    if (err) {
      throw err;
    }
    dirs.forEach(function (dir) {
      const packageJsonFile = path.join(buildDir, dir, '/package.json');
      let content = null;
      switch (dir) {
        case 'esm': {
          content = '{"type":"module"}';
          break;
        }
        case 'cjs': {
          content = '{"type":"commonjs"}';
          break;
        }
      }
      if (content && !fs.existsSync(packageJsonFile)) {
        fs.writeFile(packageJsonFile, new Uint8Array(Buffer.from(content)), function (err) {
          if (err) {
            throw err;
          }
        });
      }
    });
  });
})();
