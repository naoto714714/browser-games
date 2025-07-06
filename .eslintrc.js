module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: 'error',
    curly: 'error',
  },
  globals: {
    // ゲームで使用されるグローバル変数を定義
    game: 'writable',
    resources: 'writable',
    upgrades: 'writable',
    achievements: 'writable',
    prestige: 'writable',
    effects: 'writable',
    combos: 'writable',
    events: 'writable',
    passives: 'writable',
    saveManager: 'writable',
  },
};
