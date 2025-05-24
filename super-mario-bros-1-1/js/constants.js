// ゲーム定数
const GAME_CONSTANTS = {
    // キャンバスサイズ
    CANVAS_WIDTH: 1024,
    CANVAS_HEIGHT: 448,

    // レンダリング設定
    PIXEL_SCALE: 2,

    // 物理定数
    GRAVITY: 0.5,
    TERMINAL_VELOCITY: 12,
    FRICTION: 0.8,

    // プレイヤー定数
    PLAYER: {
        WIDTH: 16,
        HEIGHT: 16,
        WALK_SPEED: 2,
        RUN_SPEED: 4,
        JUMP_POWER: 12,
        MAX_SPEED: 4,
        INVINCIBILITY_TIME: 120 // フレーム数
    },

    // グリッドサイズ
    TILE_SIZE: 16,

    // 敵キャラクター
    ENEMY: {
        GOOMBA: {
            WIDTH: 16,
            HEIGHT: 16,
            SPEED: 1
        },
        KOOPA: {
            WIDTH: 16,
            HEIGHT: 24,
            SPEED: 1.5
        }
    },

    // アイテム
    ITEM: {
        COIN: {
            WIDTH: 16,
            HEIGHT: 16,
            POINTS: 200
        },
        MUSHROOM: {
            WIDTH: 16,
            HEIGHT: 16,
            SPEED: 2,
            POINTS: 1000
        },
        FIRE_FLOWER: {
            WIDTH: 16,
            HEIGHT: 16,
            POINTS: 1000
        }
    },

    // ゲーム状態
    GAME_STATE: {
        START: 'start',
        PLAYING: 'playing',
        GAME_OVER: 'gameOver',
        LEVEL_COMPLETE: 'levelComplete'
    },

    // プレイヤー状態
    PLAYER_STATE: {
        SMALL: 'small',
        BIG: 'big',
        FIRE: 'fire'
    },

    // 色パレット（マリオの伝統的な色）
    COLORS: {
        SKY_BLUE: '#5C94FC',
        GROUND_BROWN: '#C84C0C',
        PIPE_GREEN: '#00A844',
        BRICK_ORANGE: '#FC9838',
        QUESTION_YELLOW: '#FCBC3C',
        MARIO_RED: '#FC0000',
        MARIO_BLUE: '#0038FC',
        MARIO_YELLOW: '#FCBC3C',
        BLACK: '#000000',
        WHITE: '#FFFFFF'
    },

    // レベルデータ関連
    LEVEL: {
        WIDTH: 6144, // 16 * 384 タイル
        HEIGHT: 448,
        GROUND_HEIGHT: 32
    },

    // 音楽・効果音の長さ（フレーム数）
    AUDIO: {
        JUMP_SOUND_LENGTH: 10,
        COIN_SOUND_LENGTH: 15,
        POWER_UP_SOUND_LENGTH: 30
    }
};

// 方向定数（独立した定数として定義）
const DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right'
};

// ブロックタイプ
const BLOCK_TYPES = {
    GROUND: 'ground',
    BRICK: 'brick',
    QUESTION: 'question',
    PIPE: 'pipe',
    FLAG_POLE: 'flagPole',
    CASTLE: 'castle',
    CLOUD: 'cloud',
    HILL: 'hill',
    BUSH: 'bush'
};

// 敵タイプ
const ENEMY_TYPES = {
    GOOMBA: 'goomba',
    KOOPA_TROOPA: 'koopaTroopa'
};

// アイテムタイプ
const ITEM_TYPES = {
    COIN: 'coin',
    MUSHROOM: 'mushroom',
    FIRE_FLOWER: 'fireFlower',
    ONE_UP: 'oneUp'
};

// キー入力
const KEYS = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    JUMP: ' ', // Space
    RUN: 'KeyX',
    PAUSE: 'KeyP'
};
