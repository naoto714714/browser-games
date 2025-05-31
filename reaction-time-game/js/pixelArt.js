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
    
    // 超可愛い猫キャラクター描画
    drawCat(x, y, expression = 'normal') {
        // より詳細で可愛い猫の形状（12x12ピクセル）
        const catBody = [
            [0,0,0,1,1,1,1,1,1,0,0,0],  // 耳の形
            [0,0,1,2,1,1,1,1,2,1,0,0],  // 耳の内側
            [0,1,1,1,1,1,1,1,1,1,1,0],  // 頭上部
            [1,1,1,1,1,1,1,1,1,1,1,1],  // 頭部
            [1,3,3,1,1,1,1,1,1,3,3,1],  // 目の位置
            [1,1,1,1,4,4,4,1,1,1,1,1],  // 鼻の位置
            [1,1,1,1,1,5,5,1,1,1,1,1],  // 口の位置
            [1,1,1,1,1,1,1,1,1,1,1,1],  // 顔下部
            [0,1,1,1,1,1,1,1,1,1,1,0],  // 首部分
            [0,0,1,1,1,1,1,1,1,1,0,0],  // 体上部
            [0,0,0,1,1,1,1,1,1,0,0,0],  // 体中部
            [0,0,0,0,1,1,1,1,0,0,0,0]   // 体下部
        ];
        
        // 表情パターン（より豊富に）
        const expressions = {
            normal: { eyeType: 'normal', mouthType: 'normal', special: null },
            happy: { eyeType: 'happy', mouthType: 'smile', special: 'blush' },
            surprised: { eyeType: 'wide', mouthType: 'o', special: null },
            focused: { eyeType: 'determined', mouthType: 'serious', special: 'sparkle' }
        };
        
        const currentExpr = expressions[expression] || expressions.normal;
        
        const baseColors = [
            null,                    // 0: 透明
            this.colors.catBody,     // 1: 体（薄いピンク）
            this.colors.catDark,     // 2: 耳内側（濃いピンク）
            this.colors.catBlack,    // 3: 目の基本色
            this.colors.catBlack,    // 4: 鼻
            this.colors.catBlack,    // 5: 口
        ];
        
        // 基本形状を描画
        for(let row = 0; row < catBody.length; row++) {
            for(let col = 0; col < catBody[row].length; col++) {
                const colorIndex = catBody[row][col];
                if(colorIndex && baseColors[colorIndex]) {
                    this.drawPixel(x + col, y + row, baseColors[colorIndex]);
                }
            }
        }
        
        // 表情の詳細描画
        this.drawCatExpression(x, y, currentExpr);
        
        // 特殊効果
        if (currentExpr.special === 'blush') {
            this.drawPixel(x + 1, y + 5, this.colors.catBlush);
            this.drawPixel(x + 10, y + 5, this.colors.catBlush);
        }
        
        if (currentExpr.special === 'sparkle') {
            // きらめく目のエフェクト
            this.drawPixel(x + 2, y + 4, this.colors.sparkle);
            this.drawPixel(x + 9, y + 4, this.colors.sparkle);
        }
        
        // 可愛いアクセサリー（リボン）
        this.drawPixel(x + 3, y + 1, this.colors.heart);
        this.drawPixel(x + 4, y + 1, this.colors.heart);
        this.drawPixel(x + 7, y + 1, this.colors.heart);
        this.drawPixel(x + 8, y + 1, this.colors.heart);
    }
    
    // 猫の表情詳細描画
    drawCatExpression(x, y, expression) {
        // 目の描画
        switch(expression.eyeType) {
            case 'normal':
                this.drawPixel(x + 3, y + 4, this.colors.catBlack);
                this.drawPixel(x + 8, y + 4, this.colors.catBlack);
                break;
            case 'happy':
                // 三日月目
                this.drawPixel(x + 2, y + 4, this.colors.catBlack);
                this.drawPixel(x + 3, y + 5, this.colors.catBlack);
                this.drawPixel(x + 4, y + 4, this.colors.catBlack);
                this.drawPixel(x + 7, y + 4, this.colors.catBlack);
                this.drawPixel(x + 8, y + 5, this.colors.catBlack);
                this.drawPixel(x + 9, y + 4, this.colors.catBlack);
                break;
            case 'wide':
                // 大きい目
                this.drawPixel(x + 2, y + 4, this.colors.catBlack);
                this.drawPixel(x + 3, y + 4, this.colors.catBlack);
                this.drawPixel(x + 4, y + 4, this.colors.catBlack);
                this.drawPixel(x + 7, y + 4, this.colors.catBlack);
                this.drawPixel(x + 8, y + 4, this.colors.catBlack);
                this.drawPixel(x + 9, y + 4, this.colors.catBlack);
                break;
            case 'determined':
                // 決意の目
                this.drawPixel(x + 3, y + 4, this.colors.catBlack);
                this.drawPixel(x + 2, y + 5, this.colors.catBlack);
                this.drawPixel(x + 8, y + 4, this.colors.catBlack);
                this.drawPixel(x + 9, y + 5, this.colors.catBlack);
                break;
        }
        
        // 口の描画
        switch(expression.mouthType) {
            case 'normal':
                this.drawPixel(x + 5, y + 6, this.colors.catBlack);
                this.drawPixel(x + 6, y + 6, this.colors.catBlack);
                break;
            case 'smile':
                // 笑顔
                this.drawPixel(x + 4, y + 7, this.colors.catBlack);
                this.drawPixel(x + 5, y + 6, this.colors.catBlack);
                this.drawPixel(x + 6, y + 6, this.colors.catBlack);
                this.drawPixel(x + 7, y + 7, this.colors.catBlack);
                break;
            case 'o':
                // 驚きの口
                this.drawPixel(x + 5, y + 6, this.colors.catBlack);
                this.drawPixel(x + 6, y + 6, this.colors.catBlack);
                this.drawPixel(x + 5, y + 7, this.colors.catBlack);
                this.drawPixel(x + 6, y + 7, this.colors.catBlack);
                break;
            case 'serious':
                // 真剣な口
                this.drawPixel(x + 4, y + 6, this.colors.catBlack);
                this.drawPixel(x + 5, y + 6, this.colors.catBlack);
                this.drawPixel(x + 6, y + 6, this.colors.catBlack);
                this.drawPixel(x + 7, y + 6, this.colors.catBlack);
                break;
        }
        
        // 鼻は共通
        this.drawPixel(x + 5, y + 5, this.colors.catBlack);
        this.drawPixel(x + 6, y + 5, this.colors.catBlack);
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
    
    // 超魅力的な敵キャラクター描画
    drawEnemy(x, y, enemyType = 'basic', expression = 'normal') {
        // より詳細で魅力的な敵の形状（12x12ピクセル）
        const enemyBody = [
            [0,0,0,1,1,1,1,1,1,0,0,0],  // 角のような耳
            [0,0,1,2,1,1,1,1,2,1,0,0],  // 角の内側
            [0,1,1,1,1,1,1,1,1,1,1,0],  // 頭上部
            [1,1,1,1,1,1,1,1,1,1,1,1],  // 頭部
            [1,3,3,1,1,1,1,1,1,3,3,1],  // 目の位置
            [1,1,1,1,4,4,4,1,1,1,1,1],  // 鼻の位置
            [1,1,1,1,1,5,5,1,1,1,1,1],  // 口の位置
            [1,1,1,1,1,1,1,1,1,1,1,1],  // 顔下部
            [0,1,1,1,1,1,1,1,1,1,1,0],  // 首部分
            [0,0,1,1,1,1,1,1,1,1,0,0],  // 体上部
            [0,0,0,1,1,1,1,1,1,0,0,0],  // 体中部
            [0,0,0,0,1,1,1,1,0,0,0,0]   // 体下部
        ];
        
        // 敵タイプによる色設定とキャラクター性
        const enemyColors = {
            basic: {
                body: '#ffb3e6',
                dark: '#ff80d4',
                accent: '#e91e63',
                name: 'のんびり猫',
                personality: 'cute'
            },
            fast: {
                body: '#ff9999',
                dark: '#ff6666',
                accent: '#ff1744',
                name: 'はりきり猫',
                personality: 'energetic'
            },
            master: {
                body: '#c4b5fd',
                dark: '#a78bfa',
                accent: '#8b5cf6',
                name: 'みすてりー猫',
                personality: 'mysterious'
            }
        };
        
        const colorSet = enemyColors[enemyType] || enemyColors.basic;
        
        const baseColors = [
            null,                    // 0: 透明
            colorSet.body,           // 1: 体
            colorSet.dark,           // 2: 耳/角
            this.colors.catBlack,    // 3: 目の基本色
            this.colors.catBlack,    // 4: 鼻
            this.colors.catBlack,    // 5: 口
        ];
        
        // 基本形状を描画
        for(let row = 0; row < enemyBody.length; row++) {
            for(let col = 0; col < enemyBody[row].length; col++) {
                const colorIndex = enemyBody[row][col];
                if(colorIndex && baseColors[colorIndex]) {
                    this.drawPixel(x + col, y + row, baseColors[colorIndex]);
                }
            }
        }
        
        // 敵の個性的な表情
        this.drawEnemyExpression(x, y, enemyType, colorSet);
        
        // タイプ別の特徴装飾
        this.drawEnemyAccessories(x, y, enemyType, colorSet);
    }
    
    // 敵の表情描画
    drawEnemyExpression(x, y, enemyType, colorSet) {
        switch(enemyType) {
            case 'basic':
                // のんびり目
                this.drawPixel(x + 3, y + 4, this.colors.catBlack);
                this.drawPixel(x + 8, y + 4, this.colors.catBlack);
                // にっこり口
                this.drawPixel(x + 4, y + 7, this.colors.catBlack);
                this.drawPixel(x + 5, y + 6, this.colors.catBlack);
                this.drawPixel(x + 6, y + 6, this.colors.catBlack);
                this.drawPixel(x + 7, y + 7, this.colors.catBlack);
                break;
                
            case 'fast':
                // キラキラ目
                this.drawPixel(x + 2, y + 4, colorSet.accent);
                this.drawPixel(x + 3, y + 4, this.colors.catBlack);
                this.drawPixel(x + 4, y + 4, colorSet.accent);
                this.drawPixel(x + 7, y + 4, colorSet.accent);
                this.drawPixel(x + 8, y + 4, this.colors.catBlack);
                this.drawPixel(x + 9, y + 4, colorSet.accent);
                // 興奮の口
                this.drawPixel(x + 5, y + 6, this.colors.catBlack);
                this.drawPixel(x + 6, y + 6, this.colors.catBlack);
                this.drawPixel(x + 5, y + 7, this.colors.catBlack);
                this.drawPixel(x + 6, y + 7, this.colors.catBlack);
                break;
                
            case 'master':
                // 神秘的な目
                this.drawPixel(x + 2, y + 4, colorSet.accent);
                this.drawPixel(x + 3, y + 4, colorSet.accent);
                this.drawPixel(x + 4, y + 4, colorSet.accent);
                this.drawPixel(x + 7, y + 4, colorSet.accent);
                this.drawPixel(x + 8, y + 4, colorSet.accent);
                this.drawPixel(x + 9, y + 4, colorSet.accent);
                // 微笑み
                this.drawPixel(x + 4, y + 6, this.colors.catBlack);
                this.drawPixel(x + 5, y + 6, this.colors.catBlack);
                this.drawPixel(x + 6, y + 6, this.colors.catBlack);
                this.drawPixel(x + 7, y + 6, this.colors.catBlack);
                break;
        }
        
        // 共通の鼻
        this.drawPixel(x + 5, y + 5, this.colors.catBlack);
        this.drawPixel(x + 6, y + 5, this.colors.catBlack);
    }
    
    // 敵のアクセサリー描画
    drawEnemyAccessories(x, y, enemyType, colorSet) {
        switch(enemyType) {
            case 'basic':
                // 花の飾り
                this.drawPixel(x + 2, y + 1, '#ffeb3b');
                this.drawPixel(x + 9, y + 1, '#ffeb3b');
                break;
                
            case 'fast':
                // 炎のような装飾
                this.drawPixel(x + 1, y + 2, colorSet.accent);
                this.drawPixel(x + 10, y + 2, colorSet.accent);
                this.drawPixel(x + 0, y + 3, colorSet.accent);
                this.drawPixel(x + 11, y + 3, colorSet.accent);
                break;
                
            case 'master':
                // 星の装飾
                this.drawPixel(x + 1, y + 0, this.colors.sparkle);
                this.drawPixel(x + 10, y + 0, this.colors.sparkle);
                this.drawPixel(x + 0, y + 2, this.colors.sparkle);
                this.drawPixel(x + 11, y + 2, this.colors.sparkle);
                // オーラ効果
                this.drawPixel(x + 2, y + 0, colorSet.accent);
                this.drawPixel(x + 9, y + 0, colorSet.accent);
                break;
        }
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