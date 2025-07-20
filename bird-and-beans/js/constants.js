// 画面サイズ
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

// プレイヤー関連
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 40;
export const PLAYER_SPEED = 5;
export const PLAYER_GROUND_MARGIN = 10;
export const PLAYER_EYE_OFFSET = 10;
export const PLAYER_EYE_RADIUS = 3;

// 舌関連
export const TONGUE_MAX_LENGTH = 700;
export const TONGUE_EXTEND_SPEED = 20;
export const TONGUE_ANGLE_DEGREES = 45;
export const TONGUE_WIDTH = 5;
export const TONGUE_CHECK_INTERVAL = 5;

// マメ関連
export const BEAN_WIDTH = 20;
export const BEAN_HEIGHT = 20;
export const BEAN_BASE_SPEED = 2;
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
export const SCORE_ZONE_1_HEIGHT = 144; // 最上部ゾーン: 0〜144px
export const SCORE_ZONE_2_HEIGHT = 288; // 上部ゾーン: 144〜288px
export const SCORE_ZONE_3_HEIGHT = 432; // 中部ゾーン: 288〜432px
export const SCORE_ZONE_4_HEIGHT = 576; // 下部ゾーン: 432〜576px
export const SCORE_ZONE_1_SCORE = 1000; // 最上部スコア
export const SCORE_ZONE_2_SCORE = 300; // 上部スコア
export const SCORE_ZONE_3_SCORE = 100; // 中部スコア
export const SCORE_ZONE_4_SCORE = 50; // 下部スコア
export const SCORE_ZONE_5_SCORE = 10; // 最下部スコア

// 地面関連
export const GROUND_BLOCK_COUNT = 30;
export const GROUND_HEIGHT = 40;
export const GROUND_BLOCK_GAP = 1;

// 色
export const COLORS = {
  BACKGROUND: '#1a1a1a',
  PLAYER: '#ff6b6b',
  PLAYER_EYE: '#ffffff',
  TONGUE: '#ff9999',
  BEAN_NORMAL: '#4ecdc4',
  BEAN_WHITE: '#ffffff',
  BEAN_FLASHING_1: '#ffd93d',
  BEAN_FLASHING_2: '#ff6b6b',
  GROUND_BLOCK: '#333333',
  GROUND_HOLE: '#000000',
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

// ローカルストレージ
export const HIGH_SCORE_KEY = 'birdAndBeansHighScore';
