/**
 * Auto-discovers prototypes: every `src/prototypes/<slug>/index.vue` is listed.
 * Optional metadata: export `prototype: { title, figma }` from the component options.
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
      component: mod.default,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));
