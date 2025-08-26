import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';

export default [{ ignores: ['.pnp.cjs', '.pnp.loader.mjs'] }, prettier, ...svelte.configs.prettier];
