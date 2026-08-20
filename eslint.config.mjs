// @ts-check
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';

/**
 * Noxra lint configuration.
 *
 * The selector rules are the load-bearing ones: they are what keeps `nx`
 * prefixing and the directive-versus-component distinction consistent as the
 * library grows, which matters more here than in an application because these
 * selectors are public API.
 */
export default tseslint.config(
  {
    ignores: ['dist/**', 'out-tsc/**', 'coverage/**', '.angular/**', 'node_modules/**'],
  },

  // ------------------------------------------------------------ TypeScript
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Noxra's own APIs are explicit; inference is fine for locals.
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // ---------------------------------------------------------- library only
  {
    files: ['projects/noxra/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'nx', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'nx', style: 'kebab-case' },
      ],
    },
  },
  {
    // Test host components exist only to mount a directive; their selectors
    // are never public API, so the element-prefix rule does not apply.
    files: ['projects/noxra/**/*.spec.ts'],
    rules: {
      '@angular-eslint/component-selector': 'off',
    },
  },

  // --------------------------------------------------------- showcase only
  {
    files: ['projects/showcase/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
    },
  },

  // -------------------------------------------------------------- templates
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },

  // ------------------------------------------------------------------ tools
  {
    files: ['tools/**/*.mjs', 'eslint.config.mjs'],
    extends: [eslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        fetch: 'readonly',
        AbortSignal: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly',
      },
    },
  },
);
