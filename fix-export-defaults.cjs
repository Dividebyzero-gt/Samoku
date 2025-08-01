const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, 'src'); // Update if needed
const TARGET_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const exportDefaultRegex = /^\s*export\s+default\s+.*$/gm;
  const exportMatches = [...content.matchAll(exportDefaultRegex)];

  let modified = false;

  if (exportMatches.length > 1) {
    // Keep only the last 'export default' statement
    const lastMatchIndex = exportMatches[exportMatches.length - 1].index;
    content = content.replace(exportDefaultRegex, (match, offset) => {
      if (offset !== lastMatchIndex) {
        modified = true;
        return ''; // Remove extra exports
      }
      return match; // Keep the last one
    });
  }

  // Remove '$RefreshReg$' and 'var _c' if found
  if (content.includes('$RefreshReg$') || content.includes('var _c')) {
    content = content.replace(/var\s+_c;?/g, '');
    content = content.replace(/\$RefreshReg\$\([^)]*\);?/g, '');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (TARGET_EXTENSIONS.includes(path.extname(fullPath))) {
      fixFile(fullPath);
    }
  }
}

console.log(`🔧 Auto-fixing export issues in '${ROOT_DIR}'...\n`);
walkDir(ROOT_DIR);
console.log('\n✅ All done!');