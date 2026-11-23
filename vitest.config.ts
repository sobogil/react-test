import { defineConfig } from 'vitest/config';
import { jsxOxc } from './jsx.config';

export default defineConfig({
  oxc: jsxOxc,
  test: {
    include: ['packages/*/test/**/*.test.{ts,tsx}'],
  },
});
