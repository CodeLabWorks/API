import fs from 'fs';
import path from 'path';

const apiDir = path.resolve(process.cwd(), 'public/api');
const outputFile = path.resolve(process.cwd(), 'api-routes.js');

function walkDir(dir, baseRoute = '') {
  let results = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const newBaseRoute = path.join(baseRoute, entry.name);
      results = results.concat(walkDir(fullPath, newBaseRoute));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      // Create route path, replace backslashes with forward slashes on Windows
      const routePath = path.join(baseRoute, entry.name.replace(/\.js$/, '')).replace(/\\/g, '/');
      results.push({ filePath: fullPath, routePath });
    }
  }
  return results;
}

function generateRoutes() {
  if (!fs.existsSync(apiDir)) {
    console.error('API directory not found:', apiDir);
    process.exit(1);
  }

  const files = walkDir(apiDir);

  let imports = '';
  let routeMapEntries = [];

  files.forEach(({ filePath, routePath }, idx) => {
    const importName = `route${idx}`;
    // Get relative import path from current file (api-routes.js) to the route file
    // Note: api-routes.js is at project root, so relative path is from project root
    let relativeImportPath = path.relative(path.dirname(outputFile), filePath);
    if (!relativeImportPath.startsWith('.')) relativeImportPath = './' + relativeImportPath;
    // Normalize path to posix style (slashes) for imports
    relativeImportPath = relativeImportPath.replace(/\\/g, '/');

    imports += `import * as ${importName} from '${relativeImportPath}';\n`;
    routeMapEntries.push(`  "${routePath}": ${importName}`);
  });

  const content = `${imports}\nexport default {\n${routeMapEntries.join(',\n')}\n};\n`;

  fs.writeFileSync(outputFile, content, 'utf8');

  console.log(`Generated route manifest with ${files.length} routes at ${outputFile}`);
}

generateRoutes();
