module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': ['error', { singleQuote: true, semi: true }],
    'no-console': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/require-await': 'error',
  },
  ignorePatterns: ['dist/', 'node_modules/'],
  overrides: [
    {
      files: ['*.spec.ts', '*.test.ts', '**/*.spec.ts', '**/*.test.ts'],
      rules: {
        '@typescript-eslint/require-await': 'error',
      },
    },
  ],
};
