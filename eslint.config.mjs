import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // Base recommended rules
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Turn off rules that conflict with Prettier
  eslintConfigPrettier,

  {
    // Ignore build output and node_modules across all workspaces
    ignores: ['**/dist/**', '**/node_modules/**', '**/build/**'],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // You can add custom team rules here later
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  }
);
