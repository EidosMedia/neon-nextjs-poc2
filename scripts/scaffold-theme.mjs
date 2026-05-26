#!/usr/bin/env node
/**
 * scaffold-theme.mjs
 * Copies the default page templates (src/app/_pages/*.tsx) into a new theme
 * subdirectory, rewrites their relative import paths, and generates an index.ts barrel.
 *
 * Usage: node scripts/scaffold-theme.mjs <theme-name>
 *    or: npm run scaffold:theme -- <theme-name>
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const themeName = process.argv[2];

if (!themeName) {
  console.error('Usage: npm run scaffold:theme -- <theme-name>');
  process.exit(1);
}

if (!/^[a-z][a-z0-9-]*$/.test(themeName)) {
  console.error('Theme name must be lowercase alphanumeric with optional hyphens (e.g. "my-theme")');
  process.exit(1);
}

// Default templates live directly in _pages/ root (not in a subfolder)
const srcDir = join(repoRoot, 'src/app/_pages');
const destDir = join(repoRoot, `src/app/_pages/${themeName}`);

if (existsSync(destDir)) {
  console.error(`Theme directory already exists: ${destDir}`);
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });

// Only copy .tsx files that are top-level templates (not index.ts or subdirectories)
const templateFiles = readdirSync(srcDir, { withFileTypes: true })
  .filter(e => e.isFile() && extname(e.name) === '.tsx')
  .map(e => e.name);

const exports = [];

for (const file of templateFiles) {
  const src = readFileSync(join(srcDir, file), 'utf8');

  // Default templates import from '../components/...' — rewrite to '../../components/...'
  // Also rewrite any cross-_pages sibling imports (e.g. LiveblogPosts imports './LiveblogPosts')
  // — those stay as-is since they are same-directory in the new theme folder too.
  const rewritten = src
    .replace(/from '\.\.\/components\//g, "from '../../components/")
    .replace(/from '\.\.\/components'/g, "from '../../components'");

  writeFileSync(join(destDir, file), rewritten);

  const exportName = file.replace(/\.tsx$/, '');
  exports.push(`export { default as ${exportName} } from './${exportName}';`);
}

// Write barrel index.ts
writeFileSync(join(destDir, 'index.ts'), exports.join('\n') + '\n');

const varName = themeName.charAt(0).toUpperCase() + themeName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());

console.log(`\n✓ Scaffolded theme "${themeName}" at src/app/_pages/${themeName}/`);
console.log('\nFiles created:');
readdirSync(destDir).forEach(f => console.log(`  ${f}`));
console.log(`
Next steps:
  1. Customise the templates in src/app/_pages/${themeName}/
     — each template already uses '../../components/' for shared primitives.
     — Navbar.tsx and Footer.tsx are the first things to change for a new visual identity.

  2. Register the theme in src/app/_themeRouter.tsx:

       import * as ${varName} from './_pages/${themeName}';

       const THEME_MAP = {
         ...
         '${themeName}': ${varName},
       };

  3. Set  theme: "${themeName}"  on your Neon site node attributes in the CMS.
`);
