import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

// Import custom rules
import oneDefaultExportRule from './.eslint/custom-rules/one-default-export.js';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import': importPlugin,
      'custom': {
        rules: {
          'one-default-export': oneDefaultExportRule,
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Prevent multiple default exports
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program > ExportDefaultDeclaration ~ ExportDefaultDeclaration',
          message: 'Only one default export allowed per file.',
        },
      ],
      // Additional import rules for better module hygiene
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off', // TypeScript handles this
      // Custom rule to ensure exactly one default export per file
      'custom/one-default-export': 'error',
    },
  }
);
