#!/usr/bin/env node
/**
 * scaffold-theme.mjs
 * Copies an existing LEGACY theme folder (default: wire) into a new theme folder
 * src/app/_pages/<name>/: every top-level *.tsx, the components/ subfolder and index.ts.
 * The copy sits at the same depth as its source, so relative imports
 * ('../../components/...', '../NewsletterWebpage') keep working unchanged.
 *
 * v2 brands (default, theglobe, sportsarena, nextfrontier) are NOT scaffolded here;
 * see the neon-v2-brand skill.
 *
 * Usage: npm run scaffold:theme -- <theme-name> [--from <legacyTheme>]
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const pagesDir = join(repoRoot, 'src/app/_pages');

// Keep in sync with V2_THEMES in src/lib/accessories/definitions.ts.
const V2_KEYS = ['default', 'theglobe', 'sportsarena', 'nextfrontier'];
const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

const args = process.argv.slice(2);
let themeName;
let from = 'wire';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--from') {
    from = args[++i];
  } else if (!themeName) {
    themeName = args[i];
  }
}

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!themeName || !from) {
  fail('Usage: npm run scaffold:theme -- <theme-name> [--from <legacyTheme>]');
}
if (!NAME_PATTERN.test(themeName)) {
  fail('Theme name must be lowercase alphanumeric with optional hyphens (e.g. "my-theme")');
}
if (V2_KEYS.includes(themeName)) {
  fail(`"${themeName}" is a v2 theme key. v2 brands are not scaffolded; see the neon-v2-brand skill.`);
}
if (!NAME_PATTERN.test(from) || V2_KEYS.includes(from)) {
  fail(`--from must name a legacy theme folder under src/app/_pages/ (not a v2 key): got "${from}"`);
}

const srcDir = join(pagesDir, from);
const destDir = join(pagesDir, themeName);

if (!existsSync(srcDir) || !statSync(srcDir).isDirectory() || !existsSync(join(srcDir, 'index.ts'))) {
  const legacy = readdirSync(pagesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(pagesDir, e.name, 'index.ts')))
    .map((e) => e.name);
  fail(`Source theme "${from}" not found. Legacy themes: ${legacy.join(', ')}`);
}
if (existsSync(destDir)) {
  fail(`Theme directory already exists: ${destDir}`);
}

mkdirSync(destDir, { recursive: true });

for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
  if (entry.isFile() && extname(entry.name) === '.tsx') {
    cpSync(join(srcDir, entry.name), join(destDir, entry.name));
  } else if (entry.isDirectory() && entry.name === 'components') {
    cpSync(join(srcDir, entry.name), join(destDir, entry.name), { recursive: true });
  }
}

// The barrel exports the same keys as the source; same depth, so its relative paths stay valid.
writeFileSync(join(destDir, 'index.ts'), readFileSync(join(srcDir, 'index.ts'), 'utf8'));

const varName = themeName.charAt(0).toUpperCase() + themeName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());

console.log(`\n✓ Scaffolded theme "${themeName}" from "${from}" at src/app/_pages/${themeName}/`);
console.log('\nFiles created:');
readdirSync(destDir).forEach((f) => console.log(`  ${f}`));
console.log(`
Next steps:
  1. Customise the templates in src/app/_pages/${themeName}/
     (Navbar.tsx and Footer.tsx first; the copies import ./Navbar and ./Footer already if "${from}" did).

  2. Register the theme in src/app/_themeRouter.tsx:

       import * as ${varName} from './_pages/${themeName}';

       const THEME_MAP: Record<string, PageComponents> = {
         ...
         '${themeName}': ${varName},
       };

  3. Set  theme: "${themeName}"  on your Neon site node attributes in the CMS.
`);
