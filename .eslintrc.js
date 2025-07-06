module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script',
  },
  rules: {
    // 自動修正可能なスタイルルールのみエラーとして扱う
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-blocks': ['error', 'always'],
    'keyword-spacing': ['error'],
    'space-infix-ops': ['error'],

    // 警告のみ
    'no-unused-vars': 'warn',
    'no-console': 'warn',

    // エラーになりそうなルールは無効化
    'no-undef': 'off',
    'no-loss-of-precision': 'off',
    'prefer-const': 'off',
    'no-var': 'off',
    eqeqeq: 'off',
    curly: 'off',
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
