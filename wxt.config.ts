import { defineConfig } from 'wxt';
import background from './entrypoints/background';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    permissions: ['storage'],
  },
});
