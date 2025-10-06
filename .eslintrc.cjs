/* eslint-disable */
module.exports = {
  root: true,
  ignorePatterns: ['**/*'],
  overrides: [
    {
      files: ['*.ts'],
      excludedFiles: ['*.spec.ts'],
      parserOptions: {
        project: ['tsconfig.json'],
        sourceType: 'module',
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@angular-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:prettier/recommended',
      ],
      plugins: ['simple-import-sort', 'import'],
      rules: {
        'simple-import-sort/imports': 'warn',
        'simple-import-sort/exports': 'warn',
        'import/no-unresolved': 'error',
        'import/order': 'off',
        '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Component'] }],
        '@angular-eslint/directive-class-suffix': ['error', { suffixes: ['Directive'] }],
        '@angular-eslint/no-empty-lifecycle-method': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },
    {
      files: ['*.html'],
      extends: ['plugin:@angular-eslint/template/recommended', 'plugin:prettier/recommended'],
      rules: {
        '@angular-eslint/template/eqeqeq': 'error',
      },
    },
    {
      files: ['*.spec.ts', '**/testing/**/*.ts'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@angular-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
