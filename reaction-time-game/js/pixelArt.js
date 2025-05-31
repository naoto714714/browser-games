/**
 * Pixel Art Drawing Module
 * 可愛いピクセルアートキャラクターとエフェクトを描画
 */

class PixelArtRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.pixelSize = 8; // ピクセルサイズ倍率（大きくした）
        
        // カラーパレット（超可愛い新色合い）
        this.colors = {
            // プレイヤーキャラクター色（ミルキーピンクの猫）
            playerBody: '#ffcccb',      // ミルキーピンク
            playerDark: '#ffb3ba',      // 少し濃いピンク
            playerAccent: '#ff69b4',    // 鮮やかピンク（リボン）
            playerBlush: '#ff1493',     // 頬赤
            playerWhite: '#ffffff',     // 白
            playerBlack: '#2c3e50',     // 黒（目、鼻）
            playerBelly: '#fff0f5',     // お腹の白
            
            // 敵キャラクター色
            // ひなたちゃん（黄色系）
            hinataBg: '#fff8dc',        // クリーム色
            hinataMain: '#ffd700',      // 黄金色
            hinataAccent: '#ff8c00',    // オレンジ
            
            // さくらちゃん（桜色系）
            sakuraBg: '#ffe4e1',        // 薄桜色
            sakuraMain: '#ffb6c1',      // 桜色
            sakuraAccent: '#ff69b4',    // 濃い桜色
            
            // そらくん（水色系）
            soraBg: '#e0f6ff',          // 薄水色
            soraMain: '#87ceeb',        // スカイブルー
            soraAccent: '#4169e1',      // ロイヤルブルー
            
            // ほしちゃん（紫色系）
            hoshiBg: '#f0e6ff',         // 薄紫
            hoshiMain: '#dda0dd',       // プラム
            hoshiAccent: '#8a2be2',     // ブルーバイオレット
            
            // かげまる（グレー系）
            kageBg: '#f5f5f5',          // 薄グレー
            kageMain: '#696969',        // ダークグレー
            kageAccent: '#2f4f4f',      // ダークスレートグレー
            
            // UI色
            signalGreen: '#32cd32',     // ライムグリーン
            signalRed: '#ff4500',       // オレンジレッド
            signalYellow: '#ffd700',    // ゴールド
            
            // エフェクト色
            sparkle: '#fff700',         // きらきら
            heart: '#ff1744',           // ハート
            star: '#9370db',            // 紫の星
            
            // 背景色
            skyBlue: '#87ceeb',         // スカイブルー
            cloudWhite: '#ffffff',      // 雲白
            grassGreen: '#90ee90',      // ライトグリーン
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
    
    // 超可愛い背景描画（空・雲・花・虹）
    drawBackground() {
        // 空のグラデーション（よりカラフルに）
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#ff9a9e');      // ピンクの空
        gradient.addColorStop(0.3, '#fecfef');    // 薄紫
        gradient.addColorStop(0.6, '#fecfef');    // 薄紫
        gradient.addColorStop(1, '#a8e6cf');      // 薄緑（地面）
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 虹を描画
        this.drawRainbow();
        
        // 雲を描画
        this.drawClouds();
        
        // 花を描画
        this.drawFlowers();
        
        // キラキラ星を描画
        this.drawBackgroundStars();
        
        // 地面の草を描画
        this.drawGrass();
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
    
    // 虹描画
    drawRainbow() {
        const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
        const centerX = 50;
        const centerY = 20;
        
        for (let i = 0; i < rainbowColors.length; i++) {
            const radius = 15 + i;
            for (let angle = 0; angle < Math.PI; angle += 0.1) {
                const x = Math.floor(centerX + radius * Math.cos(angle));
                const y = Math.floor(centerY + radius * Math.sin(angle));
                if (x >= 0 && x < 100 && y >= 0 && y < 75) {
                    this.drawPixel(x, y, rainbowColors[i]);
                }
            }
        }
    }
    
    // 花描画
    drawFlowers() {
        const flowerPositions = [
            {x: 10, y: 65, color: '#ff69b4'},
            {x: 25, y: 68, color: '#ffd700'},
            {x: 75, y: 67, color: '#ff1493'},
            {x: 90, y: 70, color: '#ff8c00'},
            {x: 15, y: 72, color: '#ff69b4'}
        ];
        
        flowerPositions.forEach(flower => {
            this.drawFlower(flower.x, flower.y, flower.color);
        });
    }
    
    // 個別の花描画
    drawFlower(x, y, color) {
        // 花びら（十字形）
        this.drawPixel(x, y - 1, color);
        this.drawPixel(x - 1, y, color);
        this.drawPixel(x + 1, y, color);
        this.drawPixel(x, y + 1, color);
        this.drawPixel(x, y, '#ffff00'); // 中心は黄色
    }
    
    // 背景の星描画
    drawBackgroundStars() {
        const starPositions = [
            {x: 15, y: 5}, {x: 85, y: 8}, {x: 95, y: 12},
            {x: 25, y: 15}, {x: 70, y: 6}, {x: 40, y: 10}
        ];
        
        starPositions.forEach(star => {
            this.drawStar(star.x, star.y);
        });
    }
    
    // 個別の星描画
    drawStar(x, y) {
        this.drawPixel(x, y, this.colors.sparkle);
        this.drawPixel(x - 1, y, this.colors.sparkle);
        this.drawPixel(x + 1, y, this.colors.sparkle);
        this.drawPixel(x, y - 1, this.colors.sparkle);
        this.drawPixel(x, y + 1, this.colors.sparkle);
    }
    
    // 草描画
    drawGrass() {
        for (let x = 0; x < 100; x += 3) {
            const height = Math.floor(Math.random() * 3) + 1;
            for (let h = 0; h < height; h++) {
                this.drawPixel(x, 72 + h, this.colors.grassGreen);
            }
        }
    }
    
    // 超可愛いプレイヤー猫キャラクター描画（完全新設計）
    drawCat(x, y, expression = 'normal') {
        // 16x16の大きくて詳細な猫（ぷっくりした丸い形）
        const catBody = [
            [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],  // 耳の輪郭
            [0,0,0,1,2,2,1,1,1,1,2,2,1,0,0,0],  // 耳の内側
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],  // 頭の輪郭上
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],  // 頭部上
            [1,1,1,3,3,1,1,1,1,1,1,3,3,1,1,1],  // 目のライン
            [1,1,1,1,1,1,4,4,4,1,1,1,1,1,1,1],  // 鼻のライン
            [1,1,1,1,1,1,1,5,5,1,1,1,1,1,1,1],  // 口のライン
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],  // 顔下部
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],  // 首
            [0,0,1,1,1,6,6,6,6,6,6,1,1,1,0,0],  // お腹部分
            [0,0,1,1,6,6,6,6,6,6,6,6,1,1,0,0],  // お腹中央
            [0,0,0,1,1,6,6,6,6,6,6,1,1,0,0,0],  // お腹下
            [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],  // 体下部
            [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],  // 足部分
            [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],  // 前足
            [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0]   // 前足先
        ];
        
        // 表情パターン
        const expressions = {
            normal: { eyeType: 'normal', mouthType: 'normal', special: null },
            happy: { eyeType: 'happy', mouthType: 'smile', special: 'blush' },
            surprised: { eyeType: 'wide', mouthType: 'o', special: null },
            focused: { eyeType: 'determined', mouthType: 'serious', special: 'sparkle' }
        };
        
        const currentExpr = expressions[expression] || expressions.normal;
        
        const baseColors = [
            null,                        // 0: 透明
            this.colors.playerBody,      // 1: 体（ミルキーピンク）
            this.colors.playerDark,      // 2: 耳内側（濃いピンク）
            this.colors.playerBlack,     // 3: 目の基本色
            this.colors.playerBlack,     // 4: 鼻
            this.colors.playerBlack,     // 5: 口
            this.colors.playerBelly,     // 6: お腹（白）
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
        this.drawPlayerExpression(x, y, currentExpr);
        
        // 特殊効果
        if (currentExpr.special === 'blush') {
            // 頬赤
            this.drawPixel(x + 2, y + 5, this.colors.playerBlush);
            this.drawPixel(x + 13, y + 5, this.colors.playerBlush);
        }
        
        if (currentExpr.special === 'sparkle') {
            // きらめく目のエフェクト
            this.drawPixel(x + 2, y + 4, this.colors.sparkle);
            this.drawPixel(x + 13, y + 4, this.colors.sparkle);
        }
        
        // 可愛いリボン（頭上に大きめ）
        this.drawPlayerRibbon(x, y);
    }
    
    // プレイヤー猫の表情詳細描画
    drawPlayerExpression(x, y, expression) {
        // 目の描画（16x16スケール）
        switch(expression.eyeType) {
            case 'normal':
                // 通常の丸い目
                this.drawPixel(x + 3, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 4, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 11, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 12, y + 4, this.colors.playerBlack);
                break;
            case 'happy':
                // 三日月目（にっこり）
                this.drawPixel(x + 2, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 3, y + 5, this.colors.playerBlack);
                this.drawPixel(x + 4, y + 5, this.colors.playerBlack);
                this.drawPixel(x + 5, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 10, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 11, y + 5, this.colors.playerBlack);
                this.drawPixel(x + 12, y + 5, this.colors.playerBlack);
                this.drawPixel(x + 13, y + 4, this.colors.playerBlack);
                break;
            case 'wide':
                // 大きい驚きの目
                this.drawPixel(x + 2, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 3, y + 3, this.colors.playerBlack);
                this.drawPixel(x + 4, y + 3, this.colors.playerBlack);
                this.drawPixel(x + 5, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 10, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 11, y + 3, this.colors.playerBlack);
                this.drawPixel(x + 12, y + 3, this.colors.playerBlack);
                this.drawPixel(x + 13, y + 4, this.colors.playerBlack);
                break;
            case 'determined':
                // 決意の目（キリッと）
                this.drawPixel(x + 3, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 4, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 2, y + 5, this.colors.playerBlack);
                this.drawPixel(x + 11, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 12, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 13, y + 5, this.colors.playerBlack);
                break;
        }
        
        // 口の描画
        switch(expression.mouthType) {
            case 'normal':
                // 小さなかわいい口
                this.drawPixel(x + 7, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 8, y + 6, this.colors.playerBlack);
                break;
            case 'smile':
                // 笑顔
                this.drawPixel(x + 6, y + 7, this.colors.playerBlack);
                this.drawPixel(x + 7, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 8, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 9, y + 7, this.colors.playerBlack);
                break;
            case 'o':
                // 驚きの口（O形）
                this.drawPixel(x + 7, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 8, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 7, y + 7, this.colors.playerBlack);
                this.drawPixel(x + 8, y + 7, this.colors.playerBlack);
                break;
            case 'serious':
                // 真剣な口（一直線）
                this.drawPixel(x + 6, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 7, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 8, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 9, y + 6, this.colors.playerBlack);
                break;
        }
        
        // 鼻は共通（ハート型）
        this.drawPixel(x + 7, y + 5, this.colors.playerBlack);
        this.drawPixel(x + 8, y + 5, this.colors.playerBlack);
        this.drawPixel(x + 8, y + 6, this.colors.playerBlack);
    }
    
    // プレイヤーのリボン描画
    drawPlayerRibbon(x, y) {
        // 大きなリボン（頭上）
        const ribbonPattern = [
            [0,1,1,0,0,1,1,0],
            [1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,0,0]
        ];
        
        for(let row = 0; row < ribbonPattern.length; row++) {
            for(let col = 0; col < ribbonPattern[row].length; col++) {
                if(ribbonPattern[row][col]) {
                    this.drawPixel(x + col + 4, y + row, this.colors.playerAccent);
                }
            }
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
    
    // 超魅力的な敵キャラクター描画（完全新設計）
    drawEnemy(x, y, enemyType = 'basic', expression = 'normal') {
        // 敵の種類に応じた形状とキャラクター性を決定
        const enemyData = this.getEnemyData(enemyType);
        
        // 16x16の大きくて個性的な敵キャラクター
        const enemyBody = [
            [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],  // 耳の輪郭
            [0,0,0,1,2,2,1,1,1,1,2,2,1,0,0,0],  // 耳の内側
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],  // 頭の輪郭上
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],  // 頭部上
            [1,1,1,3,3,1,1,1,1,1,1,3,3,1,1,1],  // 目のライン
            [1,1,1,1,1,1,4,4,4,1,1,1,1,1,1,1],  // 鼻のライン
            [1,1,1,1,1,1,1,5,5,1,1,1,1,1,1,1],  // 口のライン
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],  // 顔下部
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],  // 首
            [0,0,1,1,1,6,6,6,6,6,6,1,1,1,0,0],  // お腹部分
            [0,0,1,1,6,6,6,6,6,6,6,6,1,1,0,0],  // お腹中央
            [0,0,0,1,1,6,6,6,6,6,6,1,1,0,0,0],  // お腹下
            [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],  // 体下部
            [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],  // 足部分
            [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],  // 前足
            [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0]   // 前足先
        ];
        
        const baseColors = [
            null,                    // 0: 透明
            enemyData.mainColor,     // 1: 体のメイン色
            enemyData.darkColor,     // 2: 耳の色
            this.colors.playerBlack, // 3: 目の基本色
            this.colors.playerBlack, // 4: 鼻
            this.colors.playerBlack, // 5: 口
            enemyData.bellyColor,    // 6: お腹の色
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
        this.drawEnemyExpression(x, y, enemyType, enemyData);
        
        // タイプ別の特徴装飾
        this.drawEnemyAccessories(x, y, enemyType, enemyData);
    }
    
    // 敵のデータ取得
    getEnemyData(enemyType) {
        const enemyDatabase = {
            basic: {
                // ひなたちゃん・さくらちゃん
                mainColor: enemyType === 'basic' ? this.colors.hinataMain : this.colors.sakuraMain,
                darkColor: enemyType === 'basic' ? this.colors.hinataAccent : this.colors.sakuraAccent,
                bellyColor: enemyType === 'basic' ? this.colors.hinataBg : this.colors.sakuraBg,
                accentColor: enemyType === 'basic' ? this.colors.hinataAccent : this.colors.sakuraAccent,
                personality: 'gentle'
            },
            fast: {
                // そらくん・ほしちゃん
                mainColor: enemyType === 'fast' ? this.colors.soraMain : this.colors.hoshiMain,
                darkColor: enemyType === 'fast' ? this.colors.soraAccent : this.colors.hoshiAccent,
                bellyColor: enemyType === 'fast' ? this.colors.soraBg : this.colors.hoshiBg,
                accentColor: enemyType === 'fast' ? this.colors.soraAccent : this.colors.hoshiAccent,
                personality: 'energetic'
            },
            master: {
                // かげまる
                mainColor: this.colors.kageMain,
                darkColor: this.colors.kageAccent,
                bellyColor: this.colors.kageBg,
                accentColor: this.colors.kageAccent,
                personality: 'mysterious'
            }
        };
        
        return enemyDatabase[enemyType] || enemyDatabase.basic;
    }
    
    // 敵の表情描画（16x16スケール対応）
    drawEnemyExpression(x, y, enemyType, enemyData) {
        switch(enemyData.personality) {
            case 'gentle':
                // 優しい目（ひなたちゃん・さくらちゃん）
                this.drawPixel(x + 3, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 4, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 11, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 12, y + 4, this.colors.playerBlack);
                // にっこり笑顔
                this.drawPixel(x + 6, y + 7, this.colors.playerBlack);
                this.drawPixel(x + 7, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 8, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 9, y + 7, this.colors.playerBlack);
                break;
                
            case 'energetic':
                // キラキラした目（そらくん・ほしちゃん）
                this.drawPixel(x + 2, y + 4, enemyData.accentColor);
                this.drawPixel(x + 3, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 4, y + 4, enemyData.accentColor);
                this.drawPixel(x + 5, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 10, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 11, y + 4, enemyData.accentColor);
                this.drawPixel(x + 12, y + 4, this.colors.playerBlack);
                this.drawPixel(x + 13, y + 4, enemyData.accentColor);
                // 興奮の口（O形）
                this.drawPixel(x + 7, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 8, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 7, y + 7, this.colors.playerBlack);
                this.drawPixel(x + 8, y + 7, this.colors.playerBlack);
                break;
                
            case 'mysterious':
                // 神秘的な目（かげまる）
                this.drawPixel(x + 2, y + 4, enemyData.accentColor);
                this.drawPixel(x + 3, y + 4, enemyData.accentColor);
                this.drawPixel(x + 4, y + 4, enemyData.accentColor);
                this.drawPixel(x + 5, y + 4, enemyData.accentColor);
                this.drawPixel(x + 10, y + 4, enemyData.accentColor);
                this.drawPixel(x + 11, y + 4, enemyData.accentColor);
                this.drawPixel(x + 12, y + 4, enemyData.accentColor);
                this.drawPixel(x + 13, y + 4, enemyData.accentColor);
                // 控えめな微笑み
                this.drawPixel(x + 6, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 7, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 8, y + 6, this.colors.playerBlack);
                this.drawPixel(x + 9, y + 6, this.colors.playerBlack);
                break;
        }
        
        // 共通の鼻（ハート型）
        this.drawPixel(x + 7, y + 5, this.colors.playerBlack);
        this.drawPixel(x + 8, y + 5, this.colors.playerBlack);
        this.drawPixel(x + 8, y + 6, this.colors.playerBlack);
    }
    
    // 敵のアクセサリー描画（16x16スケール対応）
    drawEnemyAccessories(x, y, enemyType, enemyData) {
        switch(enemyData.personality) {
            case 'gentle':
                // 花の飾り（ひなたちゃん・さくらちゃん）
                if (enemyType === 'basic') {
                    // ひなたちゃん：太陽の飾り
                    this.drawPixel(x + 2, y + 1, this.colors.hinataAccent);
                    this.drawPixel(x + 3, y + 0, this.colors.hinataAccent);
                    this.drawPixel(x + 12, y + 0, this.colors.hinataAccent);
                    this.drawPixel(x + 13, y + 1, this.colors.hinataAccent);
                } else {
                    // さくらちゃん：桜の花びら
                    this.drawPixel(x + 2, y + 1, this.colors.sakuraAccent);
                    this.drawPixel(x + 3, y + 0, this.colors.sakuraAccent);
                    this.drawPixel(x + 12, y + 0, this.colors.sakuraAccent);
                    this.drawPixel(x + 13, y + 1, this.colors.sakuraAccent);
                }
                break;
                
            case 'energetic':
                // エネルギッシュな装飾（そらくん・ほしちゃん）
                if (enemyType === 'fast') {
                    // そらくん：雲の飾り
                    this.drawPixel(x + 1, y + 2, this.colors.soraAccent);
                    this.drawPixel(x + 2, y + 1, this.colors.cloudWhite);
                    this.drawPixel(x + 13, y + 1, this.colors.cloudWhite);
                    this.drawPixel(x + 14, y + 2, this.colors.soraAccent);
                } else {
                    // ほしちゃん：星の飾り
                    this.drawPixel(x + 1, y + 1, this.colors.star);
                    this.drawPixel(x + 2, y + 0, this.colors.hoshiAccent);
                    this.drawPixel(x + 13, y + 0, this.colors.hoshiAccent);
                    this.drawPixel(x + 14, y + 1, this.colors.star);
                }
                break;
                
            case 'mysterious':
                // かげまる：影のオーラ
                this.drawPixel(x + 0, y + 1, enemyData.accentColor);
                this.drawPixel(x + 1, y + 0, this.colors.sparkle);
                this.drawPixel(x + 2, y + 0, enemyData.accentColor);
                this.drawPixel(x + 13, y + 0, enemyData.accentColor);
                this.drawPixel(x + 14, y + 0, this.colors.sparkle);
                this.drawPixel(x + 15, y + 1, enemyData.accentColor);
                // 神秘的なオーラ効果
                this.drawPixel(x + 0, y + 3, enemyData.accentColor);
                this.drawPixel(x + 15, y + 3, enemyData.accentColor);
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
    
    // 派手で分かりやすい合図描画（大きな「スタート！」）
    drawGoText(x, y) {
        // 大きく分かりやすい「スタート！」の文字
        this.drawStartSignal(x, y);
        
        // 周りに派手なエフェクト
        this.drawSignalEffects(x, y);
    }
    
    // 「スタート！」文字描画
    drawStartSignal(x, y) {
        // 「スタート！」を大きく（日本語なので分かりやすいアイコンで代替）
        // 大きな矢印 + びっくりマーク + 光るエフェクト
        
        // 大きな右向き矢印（10x6）
        const arrowPattern = [
            [1,0,0,0,0,0,0,0,0,0],
            [1,1,0,0,0,0,0,0,0,0],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0,0,0]
        ];
        
        // 矢印を緑色で描画
        for(let row = 0; row < arrowPattern.length; row++) {
            for(let col = 0; col < arrowPattern[row].length; col++) {
                if(arrowPattern[row][col]) {
                    this.drawPixel(x + col - 5, y + row - 3, this.colors.signalGreen);
                }
            }
        }
        
        // びっくりマーク（右側）
        const exclamationPattern = [
            [0,1,1,0],
            [0,1,1,0],
            [0,1,1,0],
            [0,1,1,0],
            [0,0,0,0],
            [0,1,1,0]
        ];
        
        for(let row = 0; row < exclamationPattern.length; row++) {
            for(let col = 0; col < exclamationPattern[row].length; col++) {
                if(exclamationPattern[row][col]) {
                    this.drawPixel(x + col + 6, y + row - 3, this.colors.signalRed);
                }
            }
        }
        
        // 「GO」テキスト（中央）
        const goPattern = [
            [1,1,1,0,1,1,1],
            [1,0,0,0,1,0,1],
            [1,0,1,0,1,1,1],
            [1,0,1,0,1,0,1],
            [1,1,1,0,1,0,1]
        ];
        
        for(let row = 0; row < goPattern.length; row++) {
            for(let col = 0; col < goPattern[row].length; col++) {
                if(goPattern[row][col]) {
                    this.drawPixel(x + col - 2, y + row - 2, this.colors.signalYellow);
                }
            }
        }
    }
    
    // 合図エフェクト描画
    drawSignalEffects(x, y) {
        // 周りに光るエフェクト（4つ角）
        const sparklePositions = [
            {dx: -8, dy: -5}, {dx: 12, dy: -5},
            {dx: -8, dy: 5}, {dx: 12, dy: 5},
            {dx: 0, dy: -8}, {dx: 0, dy: 8},
            {dx: -12, dy: 0}, {dx: 15, dy: 0}
        ];
        
        sparklePositions.forEach(pos => {
            this.drawStar(x + pos.dx, y + pos.dy);
        });
        
        // 光る境界線
        const frame = [
            // 上
            [-10, -6], [-9, -6], [-8, -6], [8, -6], [9, -6], [10, -6], [11, -6], [12, -6], [13, -6],
            // 下
            [-10, 6], [-9, 6], [-8, 6], [8, 6], [9, 6], [10, 6], [11, 6], [12, 6], [13, 6],
            // 左
            [-10, -5], [-10, -4], [-10, -3], [-10, -2], [-10, -1], [-10, 0], [-10, 1], [-10, 2], [-10, 3], [-10, 4], [-10, 5],
            // 右
            [13, -5], [13, -4], [13, -3], [13, -2], [13, -1], [13, 0], [13, 1], [13, 2], [13, 3], [13, 4], [13, 5]
        ];
        
        frame.forEach(pos => {
            // アニメーションに応じて色を変える
            const colors = [this.colors.sparkle, this.colors.signalRed, this.colors.signalYellow];
            const colorIndex = Math.floor(this.animationFrame / 10) % colors.length;
            this.drawPixel(x + pos[0], y + pos[1], colors[colorIndex]);
        });
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