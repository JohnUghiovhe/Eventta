const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scanDirs = [path.join(root, 'src'), path.join(root, 'frontend', 'src')];
const exts = ['.ts', '.tsx', '.js', '.jsx'];

function listFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir);
  for (const it of items) {
    const full = path.join(dir, it);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...listFiles(full));
    } else if (exts.includes(path.extname(full))) {
      results.push(full);
    }
  }
  return results;
}

function resolveImport(fromFile, importPath) {
  if (!importPath) return null;
  if (importPath.startsWith('.')) {
    const base = path.dirname(fromFile);
    // try several candidates
    for (const ext of exts) {
      const candidate = path.resolve(base, importPath + ext);
      if (fs.existsSync(candidate)) return candidate;
    }
    // try index files
    const candidateIndex = path.resolve(base, importPath, 'index.ts');
    if (fs.existsSync(candidateIndex)) return candidateIndex;
    // try without ext
    const candidateNoExt = path.resolve(base, importPath);
    if (fs.existsSync(candidateNoExt)) return candidateNoExt;
    return null;
  }
  // non-relative imports (node_modules or absolute project aliases) - skip
  return null;
}

function parseImports(file) {
  const src = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+(?:[^'";]+)from\s+['"]([^'"\n]+)['"]/g;
  const dynamicRegex = /require\(['"]([^'"\n]+)['"]\)/g;
  const results = new Set();
  let m;
  while ((m = importRegex.exec(src))) {
    results.add(m[1]);
  }
  while ((m = dynamicRegex.exec(src))) {
    results.add(m[1]);
  }
  return Array.from(results);
}

(function main(){
  const files = [];
  for (const d of scanDirs) files.push(...listFiles(d));
  const graph = new Map();
  for (const f of files) graph.set(f, { imports: new Set(), importedBy: new Set() });

  for (const f of files) {
    const imports = parseImports(f);
    for (const imp of imports) {
      const resolved = resolveImport(f, imp);
      if (resolved && graph.has(resolved)) {
        graph.get(f).imports.add(resolved);
        graph.get(resolved).importedBy.add(f);
      }
    }
  }

  // find files with zero inbound references but not entry points
  const entryPoints = new Set([
    path.join(root, 'src', 'index.ts'),
    path.join(root, 'frontend', 'src', 'main.tsx'),
    path.join(root, 'frontend', 'src', 'index.tsx')
  ]);

  const candidates = [];
  for (const [file, node] of graph.entries()) {
    if (node.importedBy.size === 0 && !entryPoints.has(file)) {
      // ignore tests
      if (file.includes('__tests__') || file.endsWith('.test.ts') || file.endsWith('.spec.ts')) continue;
      candidates.push({ file, imports: Array.from(node.imports), importedBy: Array.from(node.importedBy) });
    }
  }

  console.log('Total scanned files:', files.length);
  console.log('Candidate unused files (zero inbound references):');
  for (const c of candidates) {
    console.log('-', path.relative(root, c.file));
  }
  if (candidates.length === 0) console.log('  (none)');
})();
