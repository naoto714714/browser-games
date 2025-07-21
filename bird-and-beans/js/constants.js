// 画面サイズ
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

// プレイヤー関連
export const PLAYER_WIDTH = 60;
export const PLAYER_HEIGHT = 60;
export const PLAYER_SPEED = 10;
export const PLAYER_GROUND_MARGIN = 10;
export const PLAYER_ANIMATION_INTERVAL = 200; // ミリ秒単位
export const PLAYER_IMAGE_DEFAULT = 'assets/bird_default.png';
export const PLAYER_IMAGE_WALK = 'assets/bird_walk.png';

// 舌関連
export const TONGUE_MAX_LENGTH = 1000;
export const TONGUE_EXTEND_SPEED = 30;
export const TONGUE_ANGLE_DEGREES = 45;
export const TONGUE_WIDTH = 5;
export const TONGUE_CHECK_INTERVAL = 5;
export const TONGUE_TIP_RADIUS = 10; // 舌の先端の半径（当たり判定と描画用）

// マメ関連
export const BEAN_WIDTH = 20;
export const BEAN_HEIGHT = 20;
export const BEAN_BASE_SPEED = 3;
export const BEAN_MIN_SCORE = 10;
export const BEAN_MAX_SCORE = 300;
export const BEAN_FLASH_INTERVAL = 200;
export const BEAN_SPAWN_MARGIN = 20;

// スポーン関連
export const INITIAL_SPAWN_INTERVAL = 2000;
export const MIN_SPAWN_INTERVAL = 500;
export const SPAWN_INTERVAL_DECREASE_RATE = 0.95;
export const SPEED_INCREASE_RATE = 0.01;
export const DIFFICULTY_INCREASE_FRAMES = 600; // 10秒（60FPS想定）

// マメの出現確率
export const BEAN_SPAWN_PROBABILITY = {
  FLASHING: 0.05,
  WHITE: 0.15,
};

// スコアゾーン関連
// 画面高さ720px - 上下40px = 640pxを5分割（各128px）
export const SCORE_ZONES = [
  { maxHeight: 168, score: 1000 },   // 最上部ゾーン: 0〜168px (40px + 128px)
  { maxHeight: 296, score: 300 },    // ゾーン2: 168〜296px (128px幅)
  { maxHeight: 424, score: 100 },    // ゾーン3: 296〜424px (128px幅)
  { maxHeight: 552, score: 50 },     // ゾーン4: 424〜552px (128px幅)
  { maxHeight: Infinity, score: 10 }, // ゾーン5: 552px〜 (128px + 40px)
];

// 地面関連
export const GROUND_BLOCK_COUNT = 30;
export const GROUND_HEIGHT = 40;
export const GROUND_BLOCK_GAP = 1;

// 色
export const COLORS = {
  BACKGROUND: '#696969',
  TONGUE: '#ff9999',
  BEAN_NORMAL: '#4ecdc4',
  BEAN_WHITE: '#ffffff',
  BEAN_FLASHING_1: '#ffd93d',
  BEAN_FLASHING_2: '#ff6b6b',
  GROUND_BLOCK: '#333333',
  GROUND_HOLE: '#000000',
  SCORE_EFFECT: '#ffffff',
};

// オーディオ関連
export const AUDIO_GAIN = 0.3;
export const AUDIO_FADE_TIME = 0.01;
export const AUDIO_FREQUENCIES = {
  CATCH: 800,
  HOLE: 200,
  FILL: 600,
  GAME_OVER: 150,
  POWER_UP: [400, 600, 800],
};
export const AUDIO_DURATIONS = {
  CATCH: 0.1,
  HOLE: 0.2,
  FILL: 0.15,
  GAME_OVER: 0.5,
  POWER_UP: 0.1,
};
export const AUDIO_TYPES = {
  CATCH: 'sine',
  HOLE: 'square',
  FILL: 'triangle',
  GAME_OVER: 'sawtooth',
};

// フォント
export const FONTS = {
  SCORE_EFFECT: '20px Arial',
};

// スコアエフェクト関連
export const SCORE_EFFECT_DURATION = 3000; // 3秒間表示

// ローカルストレージ
export const HIGH_SCORE_KEY = 'birdAndBeansHighScore';
