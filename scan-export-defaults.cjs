const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, 'src'); // Change if needed
const TARGET_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  const exportDefaultMatches = content.match(/^\s*export\s+default\s+/gm) || [];
  const refreshRegMatch = content.includes('$RefreshReg$') || content.includes('var _c');

  if (exportDefaultMatches.length > 1 || refreshRegMatch) {
    console.log(`⚠️  Found issues in: ${filePath}`);
    if (exportDefaultMatches.length > 1) {
      console.log(`   → Multiple 'export default' statements: ${exportDefaultMatches.length}`);
    }
    if (refreshRegMatch) {
      console.log(`   → Contains '$RefreshReg$' or 'var _c'`);
    }
    console.log('---');
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (TARGET_EXTENSIONS.includes(path.extname(fullPath))) {
      scanFile(fullPath);
    }
  }
}

console.log(`🔎 Scanning for issues in '${ROOT_DIR}' ...\n`);
scanDir(ROOT_DIR);
console.log('\n✅ Scan complete.');