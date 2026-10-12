import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DS_ROOT = path.resolve(__dirname, '../linarc-design-components');

// src/utils/Colors.js does `import tailwindConfig from '../../tailwind.config'`, a CommonJS
// file. The production build converts it, but the dev server serves it raw and the app
// crashes ("does not provide an export named 'default'"). Re-export it as ESM.
const dsTailwindConfigAsEsm = {
  name: 'ds-tailwind-config-esm',
  enforce: 'pre',
  transform(code, id) {
    if (path.normalize(id.split('?')[0]) !== path.join(DS_ROOT, 'tailwind.config.js')) return null;
    return { code: code.replace(/module\.exports\s*=/, 'export default'), map: null };
  },
};

// Prototype files may import the library's own dependencies (portal-vue, moment, …) without installing
// them here: if a bare import doesn't resolve from this repo, resolve it from the library instead.
const dsDependencyFallback = {
  name: 'ds-dependency-fallback',
  enforce: 'pre',
  async resolveId(source, importer, options) {
    if (!importer || importer.startsWith(DS_ROOT) || /^[./\0]/.test(source) || path.isAbsolute(source)) return null;
    const own = await this.resolve(source, importer, { ...options, skipSelf: true });
    if (own) return own;
    return this.resolve(source, path.join(DS_ROOT, 'src/build.js'), { ...options, skipSelf: true });
  },
};

export default defineConfig(({ mode }) => ({
  plugins: [dsTailwindConfigAsEsm, dsDependencyFallback, vue()],
  // Library code reads webpack-style `process.env` (NODE_ENV, VUE_APP_* API ids). Provide NODE_ENV only;
  // VUE_APP_* stay undefined so prototypes never call real APIs.
  define: {
    'process.env': JSON.stringify({ NODE_ENV: mode === 'production' ? 'production' : 'development' }),
  },
  resolve: {
    alias: [
      // Design system source (same alias the library uses internally)
      { find: '@', replacement: path.resolve(DS_ROOT, 'src') },
      { find: '@development/linarc-design-components', replacement: path.resolve(DS_ROOT, 'src/build.js') },
      // Icons used in Button slots (lucide-vue re-exports + Linarc module icons)
      { find: '@development/linarc-icons', replacement: path.resolve(DS_ROOT, 'node_modules/@development/linarc-icons') },
      // Vuex for the mock store in main.js (DatePicker reads holidays / working days from it; F-065)
      { find: /^vuex$/, replacement: path.resolve(DS_ROOT, 'node_modules/vuex/dist/vuex.esm.js') },
      // Webpack-style `~package/...` imports in library SCSS (e.g. datepicker.scss) → the library's node_modules
      { find: /^~(?!\/)(.+)$/, replacement: path.resolve(DS_ROOT, 'node_modules') + '/$1' },
      // This sandbox's own source: `~/prototypes/...`
      { find: /^~\//, replacement: path.resolve(__dirname, 'src') + '/' },
      // CommonJS `clamp` (a dependency of the text editor's colour picker) imported as a default export; served raw
      // in dev because it lives in the library's node_modules. ESM shim. F-036.
      { find: /^clamp$/, replacement: path.resolve(__dirname, 'src/shims/clamp.js') },
    ],
    // Library files would otherwise resolve `vue` from the library's own node_modules,
    // giving two Vue instances (breaks portal-vue, vuex, v-click-outside, etc.).
    dedupe: ['vue'],
    // The library imports directories that only hold an `index.vue` (`@/components/TextEditorV2`), which webpack
    // resolves through its `.vue` extension. Vite's default list has no `.vue`, so FormV2 (via RichTextField) failed to
    // build until it was added. F-036.
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      allow: [
        // Allow serving files from sibling linarc-design-components
        path.resolve(__dirname, '..'),
      ],
    },
  },
}));
