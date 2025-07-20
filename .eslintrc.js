/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    es2023: true,
    browser: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest', // パーサに最新構文許可
    sourceType: 'module', // ESM 前提 (CommonJS なら調整)
    // project: 付けない = 型情報なし (高速)
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // ← 最後
  ],
  rules: {
    'no-undef': 'off', // グローバル変数多数のため一時的に無効化
    '@typescript-eslint/no-unused-vars': 'warn', // 警告レベルに下げる
    'no-loss-of-precision': 'off', // 大きな数値リテラルのため無効化
    'no-case-declarations': 'off', // case文での変数宣言を許可
  },
  ignorePatterns: ['dist/', 'build/', 'coverage/', '*.min.js'],
};
