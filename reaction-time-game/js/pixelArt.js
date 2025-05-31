/**
 * Pixel Art Drawing Module
 * 可愛いピクセルアートキャラクターとエフェクトを描画
 */

class PixelArtRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.pixelSize = 8; // ピクセルサイズ倍率（大きくした）
        
        // カラーパレット（可愛い色合い）
        this.colors = {
            // キャラクター色
            catBody: '#ffb3ba',      // ピンクの猫
            catDark: '#ff8a94',      // 濃いピンク
            catWhite: '#ffffff',     // 白
            catBlack: '#2c3e50',     // 黒（目、鼻）
            catBlush: '#ff6b9d',     // 頬赤
            
            // UI色
            signalGreen: '#4ecdc4',  // 緑信号
            signalRed: '#ff6b6b',    // 赤信号
            signalYellow: '#ffd93d', // 黄信号
            
            // エフェクト色
            sparkle: '#fff700',      // きらきら
            heart: '#ff1744',        // ハート
            star: '#7c4dff',         // 星
            
            // 背景色
            skyBlue: '#a8e6cf',      // 空色
            cloudWhite: '#ffffff',   // 雲白
            grassGreen: '#88d8a3',   // 草緑
            
            // 敵キャラクター色
            enemyBody: '#ff8fab',    // 敵のピンク
            enemyDark: '#ff5757',    // 敵の濃いピンク
            enemyEvil: '#d63031',    // 敵の邪悪な赤
        };
        
        // アニメーション用の状態
        this.animationFrame = 0;
        this.sparkles = [];
        this.hearts = [];
    }
    
    // ピクセル描画（基本単位）
    drawPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.pixelSize, 
            y * this.pixelSize, 
            this.pixelSize, 
            this.pixelSize
        );
    }
    
    // 背景描画（空と雲）
    drawBackground() {
        // 空のグラデーション
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, this.colors.skyBlue);
        gradient.addColorStop(1, '#e8f5e8');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 雲を描画
        this.drawClouds();
    }
    
    // 雲描画
    drawClouds() {
        const cloudPositions = [
            {x: 20, y: 10}, {x: 80, y: 15}, {x: 140, y: 8}, {x: 180, y: 20}
        ];
        
        cloudPositions.forEach(pos => {
            this.drawCloud(pos.x, pos.y);
        });
    }
    
    // 個別の雲描画
    drawCloud(startX, startY) {
        const cloud = [
            [0,0,1,1,0,0],
            [0,1,1,1,1,0],
            [1,1,1,1,1,1],
            [1,1,1,1,1,1],
            [0,1,1,1,1,0]
        ];
        
        for(let y = 0; y < cloud.length; y++) {
            for(let x = 0; x < cloud[y].length; x++) {
                if(cloud[y][x]) {
                    this.drawPixel(startX + x, startY + y, this.colors.cloudWhite);
                }
            }
        }
    }
    
    // 可愛い猫キャラクター描画
    drawCat(x, y, expression = 'normal') {
        // 猫の基本形状
        const catBody = [
            [0,0,1,1,1,1,0,0],
            [0,1,2,1,1,2,1,0],
            [1,1,1,1,1,1,1,1],
            [1,3,1,1,1,1,3,1],
            [1,1,4,1,1,4,1,1],
            [1,1,1,5,5,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,0]
        ];
        
        // 表情パターン
        const expressions = {
            normal: {eyes: 3, mouth: 5},
            happy: {eyes: 6, mouth: 7},
            surprised: {eyes: 8, mouth: 9},
            focused: {eyes: 10, mouth: 5}
        };
        
        const colors = [
            null,                    // 0: 透明
            this.colors.catBody,     // 1: 体
            this.colors.catDark,     // 2: 耳
            this.colors.catBlack,    // 3: 目（通常）
            this.colors.catBlack,    // 4: 鼻
            this.colors.catBlack,    // 5: 口（通常）
            this.colors.catBlack,    // 6: 目（嬉しい）
            this.colors.catBlack,    // 7: 口（笑顔）
            this.colors.catBlack,    // 8: 目（驚き）
            this.colors.catBlack,    // 9: 口（驚き）
            this.colors.catBlack     // 10: 目（集中）
        ];
        
        // 猫を描画
        for(let row = 0; row < catBody.length; row++) {
            for(let col = 0; col < catBody[row].length; col++) {
                const colorIndex = catBody[row][col];
                if(colorIndex && colors[colorIndex]) {
                    this.drawPixel(x + col, y + row, colors[colorIndex]);
                }
            }
        }
        
        // 頬赤を追加（可愛さアップ）
        if(expression === 'happy') {
            this.drawPixel(x + 1, y + 4, this.colors.catBlush);
            this.drawPixel(x + 6, y + 4, this.colors.catBlush);
        }
    }
    
    // 信号機描画
    drawTrafficLight(x, y, currentSignal) {
        // 信号機の枠
        const frame = [
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,2,0,1],
            [1,0,0,0,1],
            [1,0,3,0,1],
            [1,0,0,0,1],
            [1,0,4,0,1],
            [1,0,0,0,1],
            [1,1,1,1,1]
        ];
        
        const colors = [
            null,                      // 0: 透明
            this.colors.catBlack,      // 1: 枠
            currentSignal === 'red' ? this.colors.signalRed : '#555',     // 2: 赤
            currentSignal === 'yellow' ? this.colors.signalYellow : '#555', // 3: 黄
            currentSignal === 'green' ? this.colors.signalGreen : '#555'   // 4: 緑
        ];
        
        for(let row = 0; row < frame.length; row++) {
            for(let col = 0; col < frame[row].length; col++) {
                const colorIndex = frame[row][col];
                if(colorIndex && colors[colorIndex]) {
                    this.drawPixel(x + col, y + row, colors[colorIndex]);
                }
            }
        }
    }
    
    // きらきらエフェクト追加
    addSparkle(x, y) {
        this.sparkles.push({
            x: x,
            y: y,
            life: 30,
            maxLife: 30,
            size: Math.random() * 2 + 1
        });
    }
    
    // ハートエフェクト追加
    addHeart(x, y) {
        this.hearts.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -Math.random() * 0.5 - 0.5,
            life: 60,
            maxLife: 60,
            size: Math.random() * 1.5 + 1
        });
    }
    
    // きらきら描画
    drawSparkle(sparkle) {
        const alpha = sparkle.life / sparkle.maxLife;
        const size = Math.floor(sparkle.size);
        
        // 十字形のきらきら
        this.ctx.globalAlpha = alpha;
        this.drawPixel(sparkle.x, sparkle.y, this.colors.sparkle);
        this.drawPixel(sparkle.x - 1, sparkle.y, this.colors.sparkle);
        this.drawPixel(sparkle.x + 1, sparkle.y, this.colors.sparkle);
        this.drawPixel(sparkle.x, sparkle.y - 1, this.colors.sparkle);
        this.drawPixel(sparkle.x, sparkle.y + 1, this.colors.sparkle);
        this.ctx.globalAlpha = 1;
    }
    
    // ハート描画
    drawHeart(heart) {
        const alpha = heart.life / heart.maxLife;
        
        // シンプルなハート形状
        const heartShape = [
            [0,1,0,1,0],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [0,1,1,1,0],
            [0,0,1,0,0]
        ];
        
        this.ctx.globalAlpha = alpha;
        for(let row = 0; row < heartShape.length; row++) {
            for(let col = 0; col < heartShape[row].length; col++) {
                if(heartShape[row][col]) {
                    this.drawPixel(
                        Math.floor(heart.x) + col - 2, 
                        Math.floor(heart.y) + row - 2, 
                        this.colors.heart
                    );
                }
            }
        }
        this.ctx.globalAlpha = 1;
    }
    
    // カウントダウン数字描画
    drawCountdownNumber(x, y, number) {
        const numbers = {
            3: [
                [1,1,1,1],
                [0,0,0,1],
                [0,1,1,1],
                [0,0,0,1],
                [1,1,1,1]
            ],
            2: [
                [1,1,1,1],
                [0,0,0,1],
                [1,1,1,1],
                [1,0,0,0],
                [1,1,1,1]
            ],
            1: [
                [0,0,1,0],
                [0,1,1,0],
                [0,0,1,0],
                [0,0,1,0],
                [0,1,1,1]
            ]
        };
        
        const pattern = numbers[number];
        if(!pattern) return;
        
        for(let row = 0; row < pattern.length; row++) {
            for(let col = 0; col < pattern[row].length; col++) {
                if(pattern[row][col]) {
                    this.drawPixel(x + col, y + row, this.colors.catBlack);
                }
            }
        }
    }
    
    // 敵キャラクター描画
    drawEnemy(x, y, enemyType = 'basic', expression = 'normal') {
        // 敵の基本形状（猫ベースだが少し違う）
        const enemyBody = [
            [0,0,1,1,1,1,0,0],
            [0,1,2,1,1,2,1,0],
            [1,1,1,1,1,1,1,1],
            [1,3,1,1,1,1,3,1],
            [1,1,4,1,1,4,1,1],
            [1,1,1,5,5,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,0]
        ];
        
        // 敵タイプによる色設定
        const enemyColors = {
            basic: {
                body: this.colors.enemyBody,
                dark: this.colors.enemyDark,
                accent: this.colors.enemyEvil
            },
            fast: {
                body: '#ff6b6b',
                dark: '#e55353',
                accent: '#d63031'
            },
            master: {
                body: '#a29bfe',
                dark: '#6c5ce7',
                accent: '#5f3dc4'
            }
        };
        
        const colorSet = enemyColors[enemyType] || enemyColors.basic;
        
        const colors = [
            null,                    // 0: 透明
            colorSet.body,           // 1: 体
            colorSet.dark,           // 2: 耳
            this.colors.catBlack,    // 3: 目
            this.colors.catBlack,    // 4: 鼻
            colorSet.accent,         // 5: 口（邪悪）
        ];
        
        // 敵を描画
        for(let row = 0; row < enemyBody.length; row++) {
            for(let col = 0; col < enemyBody[row].length; col++) {
                const colorIndex = enemyBody[row][col];
                if(colorIndex && colors[colorIndex]) {
                    this.drawPixel(x + col, y + row, colors[colorIndex]);
                }
            }
        }
        
        // 敵の特徴的な目（邪悪）
        this.drawPixel(x + 2, y + 3, colorSet.accent);
        this.drawPixel(x + 5, y + 3, colorSet.accent);
    }
    
    // VS表示
    drawVSText(x, y) {
        const vsPattern = [
            [1,0,0,0,1,0,1,1,1],
            [1,0,0,0,1,0,1,0,0],
            [0,1,0,1,0,0,1,1,0],
            [0,0,1,0,0,0,0,0,1],
            [0,0,1,0,0,0,1,1,1]
        ];
        
        for(let row = 0; row < vsPattern.length; row++) {
            for(let col = 0; col < vsPattern[row].length; col++) {
                if(vsPattern[row][col]) {
                    this.drawPixel(x + col, y + row, this.colors.signalRed);
                }
            }
        }
    }
    
    // 「GO!」テキスト描画
    drawGoText(x, y) {
        // シンプルな「GO!」
        const goPattern = [
            [1,1,1,0,1,1,1,0,1],
            [1,0,0,0,1,0,1,0,1],
            [1,0,1,0,1,1,1,0,1],
            [1,0,1,0,1,0,1,0,0],
            [1,1,1,0,1,0,1,0,1]
        ];
        
        for(let row = 0; row < goPattern.length; row++) {
            for(let col = 0; col < goPattern[row].length; col++) {
                if(goPattern[row][col]) {
                    this.drawPixel(x + col, y + row, this.colors.signalGreen);
                }
            }
        }
    }
    
    // エフェクト更新
    updateEffects() {
        // きらきら更新
        this.sparkles = this.sparkles.filter(sparkle => {
            sparkle.life--;
            return sparkle.life > 0;
        });
        
        // ハート更新
        this.hearts = this.hearts.filter(heart => {
            heart.x += heart.vx;
            heart.y += heart.vy;
            heart.life--;
            return heart.life > 0;
        });
    }
    
    // 全エフェクト描画
    drawEffects() {
        this.sparkles.forEach(sparkle => this.drawSparkle(sparkle));
        this.hearts.forEach(heart => this.drawHeart(heart));
    }
    
    // 画面クリア
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // アニメーションフレーム更新
    nextFrame() {
        this.animationFrame++;
        this.updateEffects();
    }
}