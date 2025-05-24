// スプライトローダー（ピクセルアート生成）
const SpriteLoader = {
    sprites: {},

    // 初期化
    init() {
        this.createAllSprites();
    },

    // 全スプライトを作成
    createAllSprites() {
        this.createMarioSprites();
        this.createEnemySprites();
        this.createBlockSprites();
        this.createItemSprites();
        this.createEnvironmentSprites();
    },

    // キャンバスを作成してピクセルを描画
    createCanvas(width, height, pixelData) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const pixelColor = pixelData[y][x];
                const rgba = this.getColor(pixelColor);

                data[index] = rgba[0];     // R
                data[index + 1] = rgba[1]; // G
                data[index + 2] = rgba[2]; // B
                data[index + 3] = rgba[3]; // A
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    },

    // 色コードを RGBA 配列に変換
    getColor(colorCode) {
        const colors = {
            'T': [0, 0, 0, 0],         // Transparent
            'R': [252, 0, 0, 255],     // Red (Mario)
            'B': [0, 56, 252, 255],    // Blue (Mario)
            'Y': [252, 188, 60, 255],  // Yellow
            'O': [252, 152, 56, 255],  // Orange
            'G': [0, 168, 68, 255],    // Green
            'BR': [196, 76, 12, 255],  // Brown
            'BL': [0, 0, 0, 255],      // Black
            'W': [255, 255, 255, 255], // White
            'GR': [128, 128, 128, 255] // Gray
        };
        return colors[colorCode] || [255, 0, 255, 255]; // Magenta for unknown
    },

    // マリオのスプライトを作成
    createMarioSprites() {
        // Small Mario - Standing
        const smallMarioStanding = [
            ['T','T','T','R','R','R','R','R','T','T','T','T','T','T','T','T'],
            ['T','T','R','R','R','R','R','R','R','R','R','T','T','T','T','T'],
            ['T','T','BR','BR','BR','Y','Y','BL','Y','T','T','T','T','T','T','T'],
            ['T','BR','Y','BR','Y','Y','Y','BL','Y','Y','Y','T','T','T','T','T'],
            ['T','BR','Y','BR','BR','Y','Y','Y','BL','Y','Y','Y','T','T','T','T'],
            ['T','BR','BR','Y','Y','Y','Y','BL','BL','BL','BL','T','T','T','T','T'],
            ['T','T','T','Y','Y','Y','Y','Y','Y','Y','T','T','T','T','T','T'],
            ['T','T','BR','BR','B','BR','BR','BR','T','T','T','T','T','T','T','T'],
            ['T','BR','BR','BR','B','BR','BR','B','BR','BR','BR','T','T','T','T','T'],
            ['BR','BR','BR','BR','B','B','B','B','BR','BR','BR','BR','T','T','T','T'],
            ['Y','Y','BR','B','Y','B','B','Y','B','BR','Y','Y','T','T','T','T'],
            ['Y','Y','Y','B','B','B','B','B','B','Y','Y','Y','T','T','T','T'],
            ['Y','Y','B','B','B','B','B','B','B','B','Y','Y','T','T','T','T'],
            ['T','T','B','B','B','T','T','B','B','B','T','T','T','T','T','T'],
            ['T','BR','BR','BR','T','T','T','T','BR','BR','BR','T','T','T','T','T'],
            ['BR','BR','BR','BR','T','T','T','T','BR','BR','BR','BR','T','T','T','T']
        ];

        // Small Mario - Walking
        const smallMarioWalking = [
            ['T','T','T','R','R','R','R','R','T','T','T','T','T','T','T','T'],
            ['T','T','R','R','R','R','R','R','R','R','R','T','T','T','T','T'],
            ['T','T','BR','BR','BR','Y','Y','BL','Y','T','T','T','T','T','T','T'],
            ['T','BR','Y','BR','Y','Y','Y','BL','Y','Y','Y','T','T','T','T','T'],
            ['T','BR','Y','BR','BR','Y','Y','Y','BL','Y','Y','Y','T','T','T','T'],
            ['T','BR','BR','Y','Y','Y','Y','BL','BL','BL','BL','T','T','T','T','T'],
            ['T','T','T','Y','Y','Y','Y','Y','Y','Y','T','T','T','T','T','T'],
            ['T','T','T','T','BR','B','BR','BR','BR','T','T','T','T','T','T','T'],
            ['T','T','T','BR','B','BR','BR','B','BR','BR','T','T','T','T','T','T'],
            ['T','T','BR','BR','B','B','B','B','BR','BR','BR','T','T','T','T','T'],
            ['T','T','BR','BR','B','Y','B','B','Y','B','BR','BR','T','T','T','T'],
            ['T','T','T','BR','B','B','B','B','B','B','BR','T','T','T','T','T'],
            ['T','T','T','BR','B','B','B','B','B','B','BR','T','T','T','T','T'],
            ['T','T','T','BR','BR','B','T','T','B','BR','BR','T','T','T','T','T'],
            ['T','T','T','T','BR','BR','T','T','BR','BR','T','T','T','T','T','T'],
            ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T']
        ];

        this.sprites.marioSmallStanding = this.createCanvas(16, 16, smallMarioStanding);
        this.sprites.marioSmallWalking = this.createCanvas(16, 16, smallMarioWalking);
    },

    // 敵のスプライトを作成
    createEnemySprites() {
        // Goomba
        const goomba = [
            ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
            ['T','T','T','T','T','BR','BR','BR','BR','T','T','T','T','T','T','T'],
            ['T','T','T','T','BR','BR','BR','BR','BR','BR','T','T','T','T','T','T'],
            ['T','T','T','BR','BR','BR','BR','BR','BR','BR','BR','T','T','T','T','T'],
            ['T','T','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','T','T','T','T'],
            ['T','T','BR','BL','BL','BR','BR','BR','BR','BL','BL','BR','T','T','T','T'],
            ['T','BR','BR','BL','BL','BL','BR','BR','BL','BL','BL','BR','BR','T','T','T'],
            ['T','BR','BR','BR','BL','BL','BR','BR','BL','BL','BR','BR','BR','T','T','T'],
            ['T','BR','BR','BR','BR','BR','BL','BL','BR','BR','BR','BR','BR','T','T','T'],
            ['T','T','BR','BR','BR','BL','BL','BL','BL','BR','BR','BR','T','T','T','T'],
            ['T','T','T','BR','BL','BL','BL','BL','BL','BL','BR','T','T','T','T','T'],
            ['T','T','BR','BL','BL','BL','T','T','BL','BL','BL','BR','T','T','T','T'],
            ['T','BR','BL','BL','BL','T','T','T','T','BL','BL','BL','BR','T','T','T'],
            ['BR','BL','BL','BL','T','T','T','T','T','T','BL','BL','BL','BR','T','T'],
            ['BL','BL','T','T','T','T','T','T','T','T','T','T','BL','BL','T','T'],
            ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T']
        ];

        this.sprites.goomba = this.createCanvas(16, 16, goomba);
    },

    // ブロックのスプライトを作成
    createBlockSprites() {
        // Ground Block
        const ground = [
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR']
        ];

        // Brick Block
        const brick = [
            ['O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O'],
            ['O','O','O','BL','O','O','O','O','BL','O','O','O','O','BL','O','O'],
            ['O','O','O','BL','O','O','O','O','BL','O','O','O','O','BL','O','O'],
            ['BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL'],
            ['O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O'],
            ['O','O','BL','O','O','O','O','BL','O','O','O','O','BL','O','O','O'],
            ['O','O','BL','O','O','O','O','BL','O','O','O','O','BL','O','O','O'],
            ['BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL'],
            ['O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O'],
            ['O','O','O','BL','O','O','O','O','BL','O','O','O','O','BL','O','O'],
            ['O','O','O','BL','O','O','O','O','BL','O','O','O','O','BL','O','O'],
            ['BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL'],
            ['O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O'],
            ['O','O','BL','O','O','O','O','BL','O','O','O','O','BL','O','O','O'],
            ['O','O','BL','O','O','O','O','BL','O','O','O','O','BL','O','O','O'],
            ['BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL']
        ];

        // Question Block
        const question = [
            ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'],
            ['Y','Y','Y','BL','BL','BL','Y','Y','Y','BL','BL','BL','Y','Y','Y','Y'],
            ['Y','Y','BL','BL','BL','BL','BL','Y','BL','BL','BL','BL','BL','Y','Y','Y'],
            ['Y','Y','Y','Y','BL','BL','BL','Y','Y','BL','BL','BL','Y','Y','Y','Y'],
            ['Y','Y','Y','Y','BL','BL','BL','Y','Y','BL','BL','BL','Y','Y','Y','Y'],
            ['Y','Y','Y','BL','BL','BL','BL','Y','Y','BL','BL','BL','Y','Y','Y','Y'],
            ['Y','Y','BL','BL','BL','BL','Y','Y','Y','BL','BL','BL','Y','Y','Y','Y'],
            ['Y','Y','Y','Y','Y','Y','Y','Y','Y','BL','BL','BL','Y','Y','Y','Y'],
            ['Y','Y','Y','Y','BL','BL','BL','Y','Y','BL','BL','BL','Y','Y','Y','Y'],
            ['Y','Y','Y','Y','BL','BL','BL','Y','Y','Y','Y','Y','Y','Y','Y','Y'],
            ['Y','Y','Y','Y','BL','BL','BL','Y','Y','Y','Y','Y','Y','Y','Y','Y'],
            ['BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL'],
            ['BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR','BR'],
            ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'],
            ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'],
            ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y']
        ];

        this.sprites.ground = this.createCanvas(16, 16, ground);
        this.sprites.brick = this.createCanvas(16, 16, brick);
        this.sprites.question = this.createCanvas(16, 16, question);
    },

    // アイテムのスプライトを作成
    createItemSprites() {
        // Coin
        const coin = [
            ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
            ['T','T','T','T','Y','Y','Y','Y','Y','Y','T','T','T','T','T','T'],
            ['T','T','T','Y','Y','Y','Y','Y','Y','Y','Y','T','T','T','T','T'],
            ['T','T','Y','Y','Y','O','Y','Y','O','Y','Y','Y','T','T','T','T'],
            ['T','Y','Y','Y','O','O','Y','Y','O','O','Y','Y','Y','T','T','T'],
            ['T','Y','Y','O','O','O','Y','Y','O','O','O','Y','Y','T','T','T'],
            ['T','Y','Y','O','O','O','O','O','O','O','O','Y','Y','T','T','T'],
            ['T','Y','Y','O','O','O','O','O','O','O','O','Y','Y','T','T','T'],
            ['T','Y','Y','O','O','O','O','O','O','O','O','Y','Y','T','T','T'],
            ['T','Y','Y','O','O','O','Y','Y','O','O','O','Y','Y','T','T','T'],
            ['T','Y','Y','Y','O','O','Y','Y','O','O','Y','Y','Y','T','T','T'],
            ['T','T','Y','Y','Y','O','Y','Y','O','Y','Y','Y','T','T','T','T'],
            ['T','T','T','Y','Y','Y','Y','Y','Y','Y','Y','T','T','T','T','T'],
            ['T','T','T','T','Y','Y','Y','Y','Y','Y','T','T','T','T','T','T'],
            ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
            ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T']
        ];

        this.sprites.coin = this.createCanvas(16, 16, coin);
    },

    // 環境オブジェクトのスプライトを作成
    createEnvironmentSprites() {
        // Pipe Top
        const pipeTop = [
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
            ['G','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','BL','G'],
            ['G','BL','G','G','G','G','G','G','G','G','G','G','G','G','BL','G'],
            ['G','BL','G','G','G','G','G','G','G','G','G','G','G','G','BL','G'],
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G']
        ];

        this.sprites.pipeTop = this.createCanvas(16, 16, pipeTop);
    },

    // スプライトを取得
    getSprite(name) {
        return this.sprites[name] || null;
    }
};
