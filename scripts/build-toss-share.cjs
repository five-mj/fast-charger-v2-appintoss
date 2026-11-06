const path = require('node:path');
require('esbuild').buildSync({
  entryPoints: [path.join(__dirname, '../toss-share-entry.js')],
  outfile: path.join(__dirname, '../toss-share-sdk.js'),
  bundle: true, format: 'iife', platform: 'browser', target: 'es2020', minify: true,
});
