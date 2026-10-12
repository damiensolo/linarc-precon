/**
 * Auto-discovers prototypes: every `src/prototypes/<slug>/index.vue` is listed.
 * Optional metadata: export `prototype: { title, figma, records }` from the component options. `records` is a function
 * returning [{ value, label }]: the record ids the screen accepts in the hash, for the sandbox's record picker.
 */
const modules = import.meta.glob('./*/index.vue', { eager: true });

export default Object.entries(modules)
  .map(([file, mod]) => {
    const slug = file.split('/')[1];
    const meta = mod.default.prototype || {};
    return {
      slug,
      title: meta.title || slug,
      figma: meta.figma || '',
      records: meta.records || null,
      component: mod.default,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));
