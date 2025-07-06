// ========== Game State Management ==========
class GameState {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.isPlaying = false;
    this.isPaused = false;
    this.gameStarted = false;

    // Game stats
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.multiplier = 1;
    this.multiplierTimer = 0;

    // 🆕 コンボシステム
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.lastHitTime = 0;

    // 🆕 革新的システム
    this.balls = []; // 複数ボール管理
    this.powerUpItems = []; // 落下パワーアップアイテム
    this.bossBlock = null; // ボスブロック
    this.isBossLevel = false;
    this.gravity = false; // 重力システム
    this.superComboActive = false;
    this.achievements = new Set(); // 達成システム

    // Game objects
    this.paddle = null;
    this.ball = null; // メインボール（後方互換）
    this.blocks = [];
    this.powerUps = [];
    this.particles = [];

    // Input handling
    this.keys = {};
    this.mouseX = 0;
    this.controlMethod = 'none'; // 'keyboard' または 'mouse'

    this.initializeGame();
    this.bindEvents();

    // 🆕 初期画面でホーム画面を表示
    setTimeout(() => {
      this.showHomeScreen();
    }, 100);
  }

  initializeGame() {
    // Initialize particle effects first
    this.particleSystem = new ParticleSystem(
      this.canvas.width,
      this.canvas.height
    );

    // Initialize game objects
    this.paddle = new Paddle(
      this.canvas.width / 2 - 50,
      this.canvas.height - 40,
      100,
      15
    );

    // 🆕 マルチボールシステム初期化
    this.ball = new Ball(this.canvas.width / 2, this.canvas.height - 60, 8);
    this.balls = [this.ball]; // メインボールをボール配列に追加

    this.createBlocks();

    // Start animation loop after all objects are initialized
    this.gameLoop();
  }

  bindEvents() {
    // Keyboard events
    document.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!this.isPlaying && this.gameStarted) {
          this.launchBall();
        }
      }
      if (e.code === 'KeyP') {
        this.togglePause();
      }
    });

    document.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });

    // Mouse events for paddle control
    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
    });

    // Button events
    document.getElementById('startButton').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('restartButton').addEventListener('click', () => {
      this.restartGame();
    });

    // 🆕 操作方法選択ボタン
    document.getElementById('keyboardButton').addEventListener('click', () => {
      this.selectControlMethod('keyboard');
    });

    document.getElementById('mouseButton').addEventListener('click', () => {
      this.selectControlMethod('mouse');
    });

    // 🆕 HOMEボタン
    document.getElementById('homeButton').addEventListener('click', () => {
      this.goHome();
    });
  }

  // 🆕 操作方法選択
  selectControlMethod(method) {
    this.controlMethod = method;
    this.showStartButton();
  }

  // 🆕 スタートボタン表示
  showStartButton() {
    document.getElementById('controlSelection').style.display = 'none';
    document.getElementById('startButtonContainer').style.display = 'block';
  }

  startGame() {
    if (this.controlMethod === 'none') {
      // 操作方法が選択されていない場合は選択画面を表示
      this.showControlSelection();
      return;
    }

    this.gameStarted = true;
    this.hideOverlay();
    this.resetGame();
  }

  // 🆕 操作方法選択画面表示
  showControlSelection() {
    document.getElementById('controlSelection').style.display = 'block';
    document.getElementById('startButtonContainer').style.display = 'none';
  }

  resetGame() {
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.multiplier = 1;
    this.multiplierTimer = 0;

    // 🆕 コンボリセット
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.lastHitTime = 0;

    // 🚀 革新的システムリセット
    this.powerUpItems = [];
    this.bossBlock = null;
    this.isBossLevel = false;
    this.gravity = false;
    this.superComboActive = false;
    this.achievements.clear();

    this.isPlaying = false;

    this.paddle.reset(this.canvas.width / 2 - 50, this.canvas.height - 40);

    // 🚀 マルチボールシステムリセット
    this.ball.reset(this.canvas.width / 2, this.canvas.height - 60);
    this.balls = [this.ball];

    this.powerUps = [];
    this.particles = [];

    this.createBlocks();
    this.updateUI();
  }

  restartGame() {
    // 操作方法は保持したままゲームをリスタート
    this.gameStarted = true;
    this.hideOverlay();
    this.resetGame();
  }

  launchBall() {
    if (!this.isPlaying && this.gameStarted) {
      // 🚀 マルチボールシステム対応
      this.balls.forEach(ball => {
        if (ball.dx === 0 && ball.dy === 0) {
          ball.launch(this.level);
        }
      });
      this.isPlaying = true;
    }
  }

  togglePause() {
    if (this.gameStarted && this.isPlaying) {
      this.isPaused = !this.isPaused;
    }
  }

  createBlocks() {
    this.blocks = [];
    this.bossBlock = null;
    this.isBossLevel = false;

    // 🔥 ボス戦レベル判定（レベル5の倍数）
    if (this.level % 5 === 0) {
      this.createBossLevel();
      return;
    }

    // 大幅改善：ブロック数を激減してテンポアップ！
    const rows = 3 + Math.floor(this.level / 4); // 3-5行に激減（従来6-8行）
    const cols = 8; // 10列→8列に削減

    const blockWidth = 80; // 70→80に拡大（視認性向上）
    const blockHeight = 28; // 25→28に拡大
    const padding = 8; // 5→8に拡大（見やすさ向上）
    const offsetX =
      (this.canvas.width - (cols * (blockWidth + padding) - padding)) / 2;
    const offsetY = 60; // 50→60（パドルとの距離確保）

    // 🔥 特殊ブロック確率を劇的に向上！
    const baseSpecialChance = 0.35; // 基本35%（従来10%）
    const levelBonus = (this.level - 1) * 0.05; // レベルボーナス5%
    const specialChance = Math.min(0.65, baseSpecialChance + levelBonus); // 最大65%！

    // 🎪 新しい強力な特殊ブロック追加
    const specialTypes = [
      'explosive', // 爆発ブロック
      'laser_h', // 🆕 水平レーザー（行全体消去）
      'laser_v', // 🆕 垂直レーザー（列全体消去）
      'chain', // 🆕 連鎖ブロック（隣接破壊）
      'multiball', // マルチボール
      'mega_score', // 🆕 メガスコア（1000点）
      'paddle_power', // 🆕 パドル強化
      'gravity_bomb', // 🆕 重力爆弾
    ];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * (blockWidth + padding);
        const y = offsetY + row * (blockHeight + padding);

        let type = 'normal';
        let hits = 1;

        // 🎯 戦略的ブロック配置
        if (Math.random() < specialChance) {
          // 上位行ほど強力な特殊ブロック
          if (row === 0 && Math.random() < 0.4) {
            // 最上段40%でレーザーブロック
            type = Math.random() < 0.5 ? 'laser_h' : 'laser_v';
          } else {
            // その他の特殊ブロック
            type =
              specialTypes[Math.floor(Math.random() * specialTypes.length)];
          }
        } else {
          // 通常ブロックも強化
          if (row < 2 && Math.random() < 0.4) {
            hits = 2; // 上位2行の40%が2ヒット
          }
        }

        this.blocks.push(new Block(x, y, blockWidth, blockHeight, type, hits));
      }
    }

    // 🎯 レベルごとの特別配置
    this.addLevelSpecialBlocks(
      rows,
      cols,
      blockWidth,
      blockHeight,
      padding,
      offsetX,
      offsetY
    );
  }

  // 🆕 ボス戦レベル作成
  createBossLevel() {
    this.isBossLevel = true;
    this.bossBlock = new BossBlock(
      this.canvas.width / 2 - 100,
      100,
      200,
      80,
      this.level
    );

    // ボス戦用の少数雑魚ブロック
    const minionCount = 6 + this.level;
    for (let i = 0; i < minionCount; i++) {
      const x = 50 + (i % 6) * 120;
      const y = 200 + Math.floor(i / 6) * 40;
      this.blocks.push(new Block(x, y, 80, 25, 'normal', 1));
    }

    // 重力システム有効化
    this.gravity = true;
  }

  // 🆕 レベル別特別ブロック配置システム
  addLevelSpecialBlocks(
    rows,
    cols,
    blockWidth,
    blockHeight,
    padding,
    offsetX,
    offsetY
  ) {
    // レベル3以上で中央に爆発ブロック確定配置
    if (this.level >= 3 && rows >= 2) {
      const centerCol = Math.floor(cols / 2);
      const centerRow = Math.floor(rows / 2);
      const centerIndex = this.blocks.findIndex(
        block =>
          Math.abs(block.x - (offsetX + centerCol * (blockWidth + padding))) <
            5 &&
          Math.abs(block.y - (offsetY + centerRow * (blockHeight + padding))) <
            5
      );
      if (centerIndex !== -1) {
        this.blocks[centerIndex].type = 'explosive';
        this.blocks[centerIndex].color = this.blocks[centerIndex].getColor();
      }
    }

    // レベル5以上で角にレーザー確定配置
    if (this.level >= 5) {
      const corners = [
        { row: 0, col: 0, type: 'laser_h' },
        { row: 0, col: cols - 1, type: 'laser_v' },
      ];

      corners.forEach(corner => {
        const cornerIndex = this.blocks.findIndex(
          block =>
            Math.abs(
              block.x - (offsetX + corner.col * (blockWidth + padding))
            ) < 5 &&
            Math.abs(
              block.y - (offsetY + corner.row * (blockHeight + padding))
            ) < 5
        );
        if (cornerIndex !== -1) {
          this.blocks[cornerIndex].type = corner.type;
          this.blocks[cornerIndex].color = this.blocks[cornerIndex].getColor();
        }
      });
    }
  }

  update() {
    if (!this.gameStarted || this.isPaused || !this.isPlaying) {return;}

    // Update multiplier timer
    if (this.multiplierTimer > 0) {
      this.multiplierTimer--;
      if (this.multiplierTimer <= 0) {
        this.multiplier = Math.max(1, this.multiplier - 1);
        this.updateUI();
      }
    }

    // コンボタイマー更新
    if (this.comboTimer > 0) {
      this.comboTimer--;
    }

    // Update paddle
    this.paddle.update(
      this.keys,
      this.mouseX,
      this.canvas.width,
      this.controlMethod
    );

    // 🚀 マルチボールシステム更新
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      ball.update();

      // Ball collision with walls
      if (ball.x <= ball.radius || ball.x >= this.canvas.width - ball.radius) {
        ball.dx = -ball.dx;
        this.createImpactParticles(ball.x, ball.y);
      }

      if (ball.y <= ball.radius) {
        ball.dy = -ball.dy;
        this.createImpactParticles(ball.x, ball.y);
      }

      // Ball collision with paddle
      if (this.checkPaddleCollisionWithBall(ball)) {
        this.handlePaddleCollisionWithBall(ball);
      }

      // Ball collision with blocks
      this.checkBlockCollisionsWithBall(ball);

      // 🆕 ボス戦用：ボスとの衝突
      if (this.bossBlock && this.checkBossCollisionWithBall(ball)) {
        this.handleBossCollisionWithBall(ball);
      }

      // Ball fell off screen
      if (ball.y > this.canvas.height) {
        this.balls.splice(i, 1);

        // 全ボールが落下したらライフ減少
        if (this.balls.length === 0) {
          this.loseLife();
        }
      }
    }

    // 🆕 ボス更新
    if (this.bossBlock) {
      this.bossBlock.update(this.canvas.width);

      // ボス撃破チェック
      if (this.bossBlock.isDefeated()) {
        this.defeatBoss();
      }
    }

    // 🆕 パワーアップアイテム更新
    for (let i = this.powerUpItems.length - 1; i >= 0; i--) {
      const item = this.powerUpItems[i];
      item.update();

      // パドルとの衝突判定
      if (this.checkPaddleItemCollision(item)) {
        this.collectPowerUpItem(item);
        this.powerUpItems.splice(i, 1);
      }

      // 画面外に落ちたら削除
      if (item.y > this.canvas.height) {
        this.powerUpItems.splice(i, 1);
      }
    }

    // 🆕 重力システム
    if (this.gravity) {
      this.applyGravityToBlocks();
    }

    // Update power-ups
    this.updatePowerUps();

    // Update particles
    if (this.particleSystem) {
      this.particleSystem.update();
    }

    // Check win condition
    if (this.isBossLevel) {
      if (
        this.bossBlock &&
        this.bossBlock.isDefeated() &&
        this.blocks.length === 0
      ) {
        this.nextLevel();
      }
    } else {
      if (this.blocks.length === 0) {
        this.nextLevel();
      }
    }
  }

  // 🆕 マルチボール用衝突判定
  checkPaddleCollisionWithBall(ball) {
    return (
      ball.x >= this.paddle.x &&
      ball.x <= this.paddle.x + this.paddle.width &&
      ball.y + ball.radius >= this.paddle.y &&
      ball.y - ball.radius <= this.paddle.y + this.paddle.height &&
      ball.dy > 0
    );
  }

  handlePaddleCollisionWithBall(ball) {
    const hitPos = (ball.x - this.paddle.x) / this.paddle.width;
    const angle = ((hitPos - 0.5) * Math.PI) / 3; // Max 60 degree angle

    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    ball.dx = speed * Math.sin(angle);
    ball.dy = -Math.abs(speed * Math.cos(angle));

    this.createImpactParticles(ball.x, ball.y);
  }

  checkBlockCollisionsWithBall(ball) {
    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const block = this.blocks[i];

      if (
        ball.x + ball.radius >= block.x &&
        ball.x - ball.radius <= block.x + block.width &&
        ball.y + ball.radius >= block.y &&
        ball.y - ball.radius <= block.y + block.height
      ) {
        this.handleBlockCollisionWithBall(block, i, ball);
        break;
      }
    }
  }

  // 🆕 ボス衝突判定
  checkBossCollisionWithBall(ball) {
    if (!this.bossBlock) {return false;}

    return (
      ball.x + ball.radius >= this.bossBlock.x &&
      ball.x - ball.radius <= this.bossBlock.x + this.bossBlock.width &&
      ball.y + ball.radius >= this.bossBlock.y &&
      ball.y - ball.radius <= this.bossBlock.y + this.bossBlock.height
    );
  }

  handleBossCollisionWithBall(ball) {
    // ボールの反射
    const ballCenterX = ball.x;
    const ballCenterY = ball.y;
    const bossCenterX = this.bossBlock.x + this.bossBlock.width / 2;
    const bossCenterY = this.bossBlock.y + this.bossBlock.height / 2;

    const dx = ballCenterX - bossCenterX;
    const dy = ballCenterY - bossCenterY;

    if (
      Math.abs(dx / this.bossBlock.width) > Math.abs(dy / this.bossBlock.height)
    ) {
      ball.dx = -ball.dx;
    } else {
      ball.dy = -ball.dy;
    }

    // ボスにダメージ
    this.bossBlock.takeDamage(1);
    this.createImpactParticles(ball.x, ball.y);

    // ボスヒット時の特殊効果
    this.score += 50 * this.multiplier;
    this.updateUI();
  }

  handleBlockCollisionWithBall(block, index, ball) {
    // Determine collision side
    const ballCenterX = ball.x;
    const ballCenterY = ball.y;
    const blockCenterX = block.x + block.width / 2;
    const blockCenterY = block.y + block.height / 2;

    const dx = ballCenterX - blockCenterX;
    const dy = ballCenterY - blockCenterY;

    if (Math.abs(dx / block.width) > Math.abs(dy / block.height)) {
      ball.dx = -ball.dx;
    } else {
      ball.dy = -ball.dy;
    }

    // Damage block
    block.hit();

    if (block.isDestroyed()) {
      // コンボシステム処理
      this.updateCombo();

      // Create destruction effects
      this.createBlockDestructionEffect(block);

      // Handle special block effects
      this.handleSpecialBlock(block);

      // 🆕 パワーアップアイテムドロップ（20%確率）
      if (Math.random() < 0.2) {
        this.dropPowerUpItem(
          block.x + block.width / 2,
          block.y + block.height / 2
        );
      }

      // Update score with combo bonus
      const basePoints = block.getPoints();
      const comboMultiplier = Math.max(1, Math.floor(this.combo / 5) + 1);
      const points = basePoints * this.multiplier * comboMultiplier;
      this.score += points;

      // Increase multiplier
      this.multiplier = Math.min(5, this.multiplier + 1);
      this.multiplierTimer = 180; // 3 seconds at 60fps

      // 🆕 達成システム
      this.checkAchievements(block);

      // Remove block
      this.blocks.splice(index, 1);

      this.updateUI();
    }
  }

  // 🆕 コンボシステム更新
  updateCombo() {
    const currentTime = Date.now();

    // 前回の破壊から2秒以内ならコンボ継続
    if (currentTime - this.lastHitTime < 2000) {
      this.combo++;
    } else {
      this.combo = 1; // コンボリセット
    }

    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.lastHitTime = currentTime;
    this.comboTimer = 120; // 2秒間コンボ表示

    // コンボボーナス
    if (this.combo >= 5) {
      const comboBonus = this.combo * 50 * this.multiplier;
      this.score += comboBonus;
    }
  }

  handleSpecialBlock(block) {
    const centerX = block.x + block.width / 2;
    const centerY = block.y + block.height / 2;

    switch (block.type) {
    case 'explosive':
      this.createExplosion(centerX, centerY);
      break;

    case 'laser_h':
      // 🆕 水平レーザー：行全体を消去
      this.createHorizontalLaser(centerY);
      break;

    case 'laser_v':
      // 🆕 垂直レーザー：列全体を消去
      this.createVerticalLaser(centerX);
      break;

    case 'chain':
      // 🆕 連鎖ブロック：隣接8方向のブロックを破壊
      this.createChainReaction(centerX, centerY);
      break;

    case 'multiball':
      this.createMultiBall();
      break;

    case 'mega_score':
      // 🆕 メガスコア：大量得点 + 視覚エフェクト
      const megaPoints = 1000 * this.multiplier;
      this.score += megaPoints;
      this.createScoreExplosion(centerX, centerY, megaPoints);
      break;

    case 'paddle_power':
      // 🆕 パドル強化：一時的に巨大化 + スピードアップ
      this.activatePaddlePower();
      break;

    case 'gravity_bomb':
      // 🆕 重力爆弾：全ブロックに重力効果
      this.activateGravityBomb();
      break;

    case 'paddle': // 旧システム互換
      this.expandPaddle();
      break;

    case 'score': // 旧システム互換
      this.score += 500 * this.multiplier;
      this.updateUI();
      break;
    }
  }

  // 🆕 水平レーザー実装
  createHorizontalLaser(targetY) {
    const laserHeight = 5; // レーザーの太さ
    let destroyedCount = 0;

    // 同じ行のブロックを全て破壊
    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const block = this.blocks[i];
      if (
        Math.abs(block.y + block.height / 2 - targetY) <
        block.height / 2 + laserHeight
      ) {
        this.createBlockDestructionEffect(block);
        this.score += block.getPoints() * this.multiplier;
        this.blocks.splice(i, 1);
        destroyedCount++;
      }
    }

    // レーザーエフェクト
    if (this.particleSystem) {
      this.particleSystem.createLaserEffect(
        0,
        targetY,
        this.canvas.width,
        targetY,
        '#ff0040'
      );
    }

    // コンボボーナス
    if (destroyedCount > 3) {
      this.score += destroyedCount * 100 * this.multiplier;
      this.multiplier = Math.min(5, this.multiplier + 2);
      this.multiplierTimer = 240; // 4秒延長
    }

    this.updateUI();
  }

  // 🆕 垂直レーザー実装
  createVerticalLaser(targetX) {
    const laserWidth = 5; // レーザーの太さ
    let destroyedCount = 0;

    // 同じ列のブロックを全て破壊
    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const block = this.blocks[i];
      if (
        Math.abs(block.x + block.width / 2 - targetX) <
        block.width / 2 + laserWidth
      ) {
        this.createBlockDestructionEffect(block);
        this.score += block.getPoints() * this.multiplier;
        this.blocks.splice(i, 1);
        destroyedCount++;
      }
    }

    // レーザーエフェクト
    if (this.particleSystem) {
      this.particleSystem.createLaserEffect(
        targetX,
        0,
        targetX,
        this.canvas.height,
        '#4000ff'
      );
    }

    // コンボボーナス
    if (destroyedCount > 3) {
      this.score += destroyedCount * 100 * this.multiplier;
      this.multiplier = Math.min(5, this.multiplier + 2);
      this.multiplierTimer = 240; // 4秒延長
    }

    this.updateUI();
  }

  // 🆕 連鎖反応実装
  createChainReaction(centerX, centerY) {
    const chainRadius = 120; // 連鎖範囲を拡大
    const chainedBlocks = [];

    // 範囲内のブロックを特定
    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const block = this.blocks[i];
      const distance = Math.sqrt(
        Math.pow(centerX - (block.x + block.width / 2), 2) +
          Math.pow(centerY - (block.y + block.height / 2), 2)
      );

      if (distance <= chainRadius) {
        chainedBlocks.push(i);
      }
    }

    // 連鎖エフェクトで段階的に破壊
    chainedBlocks.forEach((blockIndex, delay) => {
      setTimeout(() => {
        if (this.blocks[blockIndex]) {
          const block = this.blocks[blockIndex];
          this.createBlockDestructionEffect(block);
          this.score += block.getPoints() * this.multiplier;
          this.blocks.splice(blockIndex, 1);

          // 各破壊で小爆発エフェクト
          if (this.particleSystem) {
            this.particleSystem.createExplosion(
              block.x + block.width / 2,
              block.y + block.height / 2,
              '#ff8000'
            );
          }
        }
      }, delay * 100); // 100ms間隔で連鎖
    });

    // 連鎖ボーナス
    if (chainedBlocks.length > 5) {
      this.score += chainedBlocks.length * 200 * this.multiplier;
      this.multiplier = Math.min(5, this.multiplier + 3);
      this.multiplierTimer = 300; // 5秒延長
    }

    setTimeout(() => this.updateUI(), chainedBlocks.length * 100);
  }

  // 🆕 スコア爆発エフェクト
  createScoreExplosion(x, y, points) {
    if (this.particleSystem) {
      this.particleSystem.createScoreExplosion(x, y, points);
    }
  }

  // 🆕 パドル強化システム
  activatePaddlePower() {
    // パドルを一時的に1.5倍サイズ + 50%速度アップ
    const originalWidth = this.paddle.width;
    const originalSpeed = this.paddle.speed;

    this.paddle.width = Math.min(200, originalWidth * 1.5);
    this.paddle.speed = originalSpeed * 1.5;

    // 15秒後に元に戻す
    setTimeout(() => {
      this.paddle.width = originalWidth;
      this.paddle.speed = originalSpeed;
    }, 15000);
  }

  createExplosion(x, y) {
    // 🔥 爆発範囲を大幅拡大！（80→150）
    const explosionRadius = 150;
    let destroyedCount = 0;

    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const block = this.blocks[i];
      const distance = Math.sqrt(
        Math.pow(x - (block.x + block.width / 2), 2) +
          Math.pow(y - (block.y + block.height / 2), 2)
      );

      if (distance <= explosionRadius) {
        this.createBlockDestructionEffect(block);
        this.score += block.getPoints() * this.multiplier;
        this.blocks.splice(i, 1);
        destroyedCount++;

        // 🆕 爆発に巻き込まれたブロックが特殊ブロックの場合、連鎖発動
        if (block.type === 'explosive' && Math.random() < 0.7) {
          setTimeout(
            () => {
              this.createExplosion(
                block.x + block.width / 2,
                block.y + block.height / 2
              );
            },
            200 + Math.random() * 300
          );
        }
      }
    }

    // 🆕 大爆発パーティクルエフェクト
    if (this.particleSystem) {
      this.particleSystem.createExplosion(x, y, '#ff8000');

      // 破壊数に応じて追加エフェクト
      if (destroyedCount >= 5) {
        this.particleSystem.createExplosion(x, y, '#ff4000');
      }
      if (destroyedCount >= 10) {
        this.particleSystem.createExplosion(x, y, '#ffff00');
      }
    }

    // 🆕 爆発ボーナスシステム
    if (destroyedCount >= 3) {
      const bonus = destroyedCount * 150 * this.multiplier;
      this.score += bonus;
      this.multiplier = Math.min(
        5,
        this.multiplier + Math.floor(destroyedCount / 3)
      );
      this.multiplierTimer = 180 + destroyedCount * 30; // 破壊数に応じて延長
    }

    this.updateUI();
  }

  createMultiBall() {
    // 🚀 真のマルチボールシステム：追加ボールを複数生成
    const newBallCount = 2 + Math.floor(this.level / 3); // レベルに応じて増加

    for (let i = 0; i < newBallCount; i++) {
      // 既存ボールの平均位置から新ボール生成
      const avgX =
        this.balls.reduce((sum, ball) => sum + ball.x, 0) / this.balls.length;
      const avgY =
        this.balls.reduce((sum, ball) => sum + ball.y, 0) / this.balls.length;

      const newBall = new Ball(avgX + (Math.random() - 0.5) * 100, avgY, 6);

      // ランダムな方向に発射
      const angle = Math.random() * Math.PI * 2;
      const speed = 7;
      newBall.dx = Math.cos(angle) * speed;
      newBall.dy = Math.sin(angle) * speed;

      this.balls.push(newBall);
    }

    // 全ボールを少し速くする
    this.balls.forEach(ball => {
      ball.dx *= 1.2;
      ball.dy *= 1.2;
    });
  }

  // 🆕 重力爆弾効果
  activateGravityBomb() {
    this.gravity = true;

    // 3秒後に重力無効化
    setTimeout(() => {
      this.gravity = false;
    }, 3000);

    // 即座に全ブロックに重力を適用
    this.blocks.forEach(block => {
      block.vy = (block.vy || 0) + 2; // 下向きの速度追加
    });
  }

  // 🆕 重力システム適用
  applyGravityToBlocks() {
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];

      if (!block.vy) {block.vy = 0;}

      // 重力加速度
      block.vy += 0.3;
      block.y += block.vy;

      // 画面下に到達したら反射
      if (block.y + block.height >= this.canvas.height - 50) {
        block.y = this.canvas.height - 50 - block.height;
        block.vy *= -0.7; // 減衰反射
      }
    }
  }

  // 🆕 パワーアップアイテムドロップ
  dropPowerUpItem(x, y) {
    const itemTypes = [
      'extra_life',
      'score_boost',
      'multi_ball',
      'paddle_extend',
      'ball_speed',
      'explosion_power',
    ];

    const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    this.powerUpItems.push(new PowerUpItem(x, y, itemType));
  }

  // 🆕 パワーアップアイテム収集判定
  checkPaddleItemCollision(item) {
    return (
      item.x + item.width >= this.paddle.x &&
      item.x <= this.paddle.x + this.paddle.width &&
      item.y + item.height >= this.paddle.y &&
      item.y <= this.paddle.y + this.paddle.height
    );
  }

  // 🆕 パワーアップアイテム効果適用
  collectPowerUpItem(item) {
    switch (item.type) {
    case 'extra_life':
      this.lives++;
      break;
    case 'score_boost':
      this.score += 2000 * this.multiplier;
      break;
    case 'multi_ball':
      this.createMultiBall();
      break;
    case 'paddle_extend':
      this.expandPaddle();
      break;
    case 'ball_speed':
      this.balls.forEach(ball => {
        ball.dx *= 1.3;
        ball.dy *= 1.3;
      });
      break;
    case 'explosion_power':
      // 次の3回の爆発を強化
      this.explosionPowerUps = 3;
      break;
    }

    this.updateUI();
  }

  // 🆕 達成システム
  checkAchievements(block) {
    // ファーストブロック
    if (this.blocks.length === 23 && !this.achievements.has('first_block')) {
      this.achievements.add('first_block');
      this.score += 1000;
    }

    // コンボマスター
    if (this.combo >= 10 && !this.achievements.has('combo_master')) {
      this.achievements.add('combo_master');
      this.score += 5000;
    }

    // 特殊ブロックハンター
    if (block.type !== 'normal' && !this.achievements.has('special_hunter')) {
      this.achievements.add('special_hunter');
      this.score += 2000;
    }
  }

  // 🆕 ボス撃破処理
  defeatBoss() {
    this.score += 10000 * this.level;
    this.gravity = false;

    // 🔥 残りの雑魚ブロックも全て削除
    this.blocks = [];

    // 大爆発エフェクト
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const x = this.bossBlock.x + Math.random() * this.bossBlock.width;
        const y = this.bossBlock.y + Math.random() * this.bossBlock.height;
        this.createExplosion(x, y);
      }, i * 50);
    }

    // ボス削除とレベル進行準備
    this.bossBlock = null;
    this.isBossLevel = false;

    // 3秒後に自動的にレベル進行
    setTimeout(() => {
      this.nextLevel();
    }, 3000);
  }

  expandPaddle() {
    this.paddle.width = Math.min(150, this.paddle.width + 20);
    setTimeout(() => {
      this.paddle.width = Math.max(80, this.paddle.width - 20);
    }, 10000);
  }

  createBlockDestructionEffect(block) {
    if (this.particleSystem) {
      this.particleSystem.createBlockDestruction(
        block.x + block.width / 2,
        block.y + block.height / 2,
        block.color
      );
    }
  }

  createImpactParticles(x, y) {
    if (this.particleSystem) {
      this.particleSystem.createImpact(x, y);
    }
  }

  updatePowerUps() {
    // Power-up system would be expanded here
  }

  loseLife() {
    this.lives--;
    this.multiplier = 1;
    this.multiplierTimer = 0;

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.isPlaying = false;

      // 🚀 マルチボールシステム対応
      this.ball.reset(this.canvas.width / 2, this.canvas.height - 60);
      this.balls = [this.ball]; // 1つのボールにリセット

      this.paddle.reset(this.canvas.width / 2 - 50, this.canvas.height - 40);
    }

    this.updateUI();
  }

  nextLevel() {
    this.level++;
    this.isPlaying = false;

    // 🚀 マルチボールシステム対応
    this.ball.reset(this.canvas.width / 2, this.canvas.height - 60);
    this.balls = [this.ball]; // 新レベルは1つのボールから開始

    this.paddle.reset(this.canvas.width / 2 - 50, this.canvas.height - 40);
    this.createBlocks();
    this.updateUI();

    // Level completion bonus
    this.score += 1000 * this.level;
    this.updateUI();
  }

  gameOver() {
    this.isPlaying = false;
    this.gameStarted = false;

    // 🆕 ゲームオーバー時の詳細情報
    const gameOverText =
      `最終スコア: ${this.score.toLocaleString()}\n` +
      `到達レベル: ${this.level}\n` +
      `最大コンボ: ${this.maxCombo}`;

    this.showOverlay('GAME OVER', gameOverText, true);
  }

  updateUI() {
    document.getElementById('score').textContent = this.score.toLocaleString();
    document.getElementById('level').textContent = this.level;
    document.getElementById('lives').textContent = this.lives;
    document.getElementById('multiplier').textContent = `×${this.multiplier}`;

    // 🆕 コンボ表示更新
    const comboElement = document.getElementById('combo');
    if (comboElement) {
      if (this.combo > 1 && this.comboTimer > 0) {
        comboElement.textContent = `${this.combo} COMBO!`;
        comboElement.style.display = 'block';
      } else {
        comboElement.style.display = 'none';
      }
    }
  }

  showOverlay(title, text, showRestart = false) {
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayText').textContent = text;

    if (showRestart) {
      // ゲームオーバー時：RESTARTとHOMEボタンを表示
      document.getElementById('controlSelection').style.display = 'none';
      document.getElementById('startButtonContainer').style.display = 'none';
      document.getElementById('gameOverButtons').style.display = 'flex';
    } else {
      // 通常時：操作方法選択を表示
      document.getElementById('controlSelection').style.display = 'block';
      document.getElementById('startButtonContainer').style.display = 'none';
      document.getElementById('gameOverButtons').style.display = 'none';
    }

    document.getElementById('gameOverlay').style.display = 'flex';
  }

  hideOverlay() {
    document.getElementById('gameOverlay').style.display = 'none';
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render game objects
    this.paddle.render(this.ctx);

    // 🚀 マルチボールレンダリング
    this.balls.forEach(ball => ball.render(this.ctx));

    this.blocks.forEach(block => block.render(this.ctx));

    // 🚀 ボスレンダリング
    if (this.bossBlock) {
      this.bossBlock.render(this.ctx);
    }

    // 🚀 パワーアップアイテムレンダリング
    this.powerUpItems.forEach(item => item.render(this.ctx));

    this.powerUps.forEach(powerUp => powerUp.render(this.ctx));

    // Render particle effects
    if (this.particleSystem) {
      this.particleSystem.render(this.ctx);
    }

    // Render pause indicator
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
      this.ctx.font = '48px Orbitron';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        'PAUSED',
        this.canvas.width / 2,
        this.canvas.height / 2
      );
    }
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  // 🆕 ホーム画面に戻る
  goHome() {
    // ゲーム状態を完全リセット
    this.controlMethod = 'none';
    this.gameStarted = false;
    this.isPlaying = false;
    this.isPaused = false;

    // スコアと統計をリセット
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.multiplier = 1;
    this.multiplierTimer = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.lastHitTime = 0;

    // 革新的システムリセット
    this.powerUpItems = [];
    this.bossBlock = null;
    this.isBossLevel = false;
    this.gravity = false;
    this.superComboActive = false;
    this.achievements.clear();

    // オブジェクトリセット
    this.paddle.reset(this.canvas.width / 2 - 50, this.canvas.height - 40);
    this.ball.reset(this.canvas.width / 2, this.canvas.height - 60);
    this.balls = [this.ball];
    this.powerUps = [];
    this.particles = [];

    // UIをリセット
    this.updateUI();

    // ホーム画面を表示
    this.showHomeScreen();
  }

  // 🆕 ホーム画面表示
  showHomeScreen() {
    // オーバーレイタイトルとテキストを初期状態に戻す
    document.getElementById('overlayTitle').textContent = 'NEON BREAKER';
    document.getElementById('overlayText').textContent =
      '未来のブロック崩しへようこそ';

    // 全てのボタンコンテナを非表示
    document.getElementById('controlSelection').style.display = 'block';
    document.getElementById('startButtonContainer').style.display = 'none';
    document.getElementById('gameOverButtons').style.display = 'none';

    // オーバーレイを表示
    document.getElementById('gameOverlay').style.display = 'flex';
  }
}

// ========== Game Objects ==========
class Paddle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = 10;
    this.originalWidth = width;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.width = this.originalWidth;
  }

  update(keys, mouseX, canvasWidth, controlMethod) {
    // Keyboard control
    if (controlMethod === 'keyboard') {
      if (keys['ArrowLeft'] || keys['KeyA']) {
        this.x = Math.max(0, this.x - this.speed);
      }
      if (keys['ArrowRight'] || keys['KeyD']) {
        this.x = Math.min(canvasWidth - this.width, this.x + this.speed);
      }
    }

    // Mouse control
    if (mouseX > 0 && controlMethod === 'mouse') {
      this.x = Math.max(
        0,
        Math.min(canvasWidth - this.width, mouseX - this.width / 2)
      );
    }
  }

  render(ctx) {
    // Paddle gradient
    const gradient = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x,
      this.y + this.height
    );
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(0.5, '#0080ff');
    gradient.addColorStop(1, '#004080');

    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Paddle glow effect
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }
}

class Ball {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = 0;
    this.dy = 0;
    this.baseSpeed = 8; // 基本スピードを6から8に増加
    this.speed = this.baseSpeed;
    this.originalX = x;
    this.originalY = y;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.originalX = x;
    this.originalY = y;
    this.dx = 0;
    this.dy = 0;
  }

  launch(level = 1) {
    // レベルに応じてスピードを上げる（最大1.5倍）
    const levelMultiplier = Math.min(1.5, 1 + (level - 1) * 0.05);
    this.speed = this.baseSpeed * levelMultiplier;

    // 横方向の初期速度も少し上げる
    this.dx = (Math.random() - 0.5) * 6; // 4から6に増加
    this.dy = -this.speed;
  }

  update() {
    if (this.dx !== 0 || this.dy !== 0) {
      this.x += this.dx;
      this.y += this.dy;
    }
  }

  render(ctx) {
    // Ball gradient
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.7, '#00ffff');
    gradient.addColorStop(1, '#0080ff');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Ball glow effect
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

class Block {
  constructor(x, y, width, height, type = 'normal', hits = 1) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.maxHits = hits;
    this.hits = hits;
    this.color = this.getColor();
  }

  getColor() {
    const colors = {
      normal: ['#ff4080', '#ff6060'],
      explosive: ['#ff8000', '#ff4000'],
      multiball: ['#8000ff', '#4000ff'],
      paddle: ['#00ff80', '#00ff40'],
      score: ['#ffff00', '#ffcc00'],
      // 新しい特殊ブロックの色
      laser_h: ['#ff0040', '#cc0030'], // 赤系（水平レーザー）
      laser_v: ['#4000ff', '#3000cc'], // 青系（垂直レーザー）
      chain: ['#ff8040', '#ff6020'], // オレンジ系（連鎖）
      mega_score: ['#ffff40', '#ffcc20'], // 金色（メガスコア）
      paddle_power: ['#40ff80', '#20cc60'], // 緑系（パドル強化）
      gravity_bomb: ['#8040ff', '#6020cc'], // 紫系（重力爆弾）
    };

    const colorPair = colors[this.type] || colors.normal;
    return this.hits === this.maxHits ? colorPair[0] : colorPair[1];
  }

  hit() {
    this.hits--;
    this.color = this.getColor();
  }

  isDestroyed() {
    return this.hits <= 0;
  }

  getPoints() {
    const basePoints = {
      normal: 100,
      explosive: 200,
      multiball: 300,
      paddle: 150,
      score: 500,
      // 新しい特殊ブロックのポイント
      laser_h: 400, // 水平レーザー
      laser_v: 400, // 垂直レーザー
      chain: 350, // 連鎖
      mega_score: 1000, // メガスコア
      paddle_power: 250, // パドル強化
      gravity_bomb: 300, // 重力爆弾
    };

    return (basePoints[this.type] || 100) * this.maxHits;
  }

  render(ctx) {
    // Block gradient with enhanced visuals
    const gradient = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x,
      this.y + this.height
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, this.adjustColor(this.color, -0.3));

    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Enhanced block border with glow effect for special blocks
    if (this.type !== 'normal') {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
    }

    ctx.strokeStyle = this.adjustColor(this.color, 0.3);
    ctx.lineWidth = this.type !== 'normal' ? 3 : 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;

    // Special block indicators with enhanced visuals
    if (this.type !== 'normal') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = this.getSymbolSize() + 'px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(
        this.getTypeSymbol(),
        this.x + this.width / 2,
        this.y + this.height / 2 + 4
      );
    }

    // Hit indicator
    if (this.maxHits > 1) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 10px Orbitron';
      ctx.textAlign = 'right';
      ctx.fillText(this.hits, this.x + this.width - 5, this.y + 12);
    }
  }

  getTypeSymbol() {
    const symbols = {
      explosive: '💥',
      multiball: '⚡',
      paddle: '🎯',
      score: '⭐',
      // 🆕 新しい特殊ブロックのシンボル
      laser_h: '↔️', // 水平レーザー
      laser_v: '↕️', // 垂直レーザー
      chain: '🔗', // 連鎖
      mega_score: '💎', // メガスコア
      paddle_power: '🚀', // パドル強化
      gravity_bomb: '💣', // 重力爆弾
    };
    return symbols[this.type] || '';
  }

  // 🆕 特殊ブロック用のシンボルサイズ調整
  getSymbolSize() {
    const sizes = {
      laser_h: 14,
      laser_v: 14,
      chain: 16,
      mega_score: 18,
      paddle_power: 16,
      gravity_bomb: 14,
    };
    return sizes[this.type] || 12;
  }

  adjustColor(color, factor) {
    const hex = color.replace('#', '');
    const r = Math.max(
      0,
      Math.min(255, parseInt(hex.substr(0, 2), 16) * (1 + factor))
    );
    const g = Math.max(
      0,
      Math.min(255, parseInt(hex.substr(2, 2), 16) * (1 + factor))
    );
    const b = Math.max(
      0,
      Math.min(255, parseInt(hex.substr(4, 2), 16) * (1 + factor))
    );

    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  }
}

// 🚀 革新的新クラス：ボスブロック
class BossBlock {
  constructor(x, y, width, height, level) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.level = level;
    this.maxHp = 20 + level * 5;
    this.hp = this.maxHp;
    this.vx = 2 + level * 0.5; // 横移動速度
    this.frozen = false;
    this.attackTimer = 0;
    this.attackCooldown = 120; // 2秒
  }

  update(canvasWidth) {
    if (this.frozen) {return;}

    // 横移動
    this.x += this.vx;

    // 壁で反射
    if (this.x <= 0 || this.x + this.width >= canvasWidth) {
      this.vx = -this.vx;
      this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
    }

    // 攻撃タイマー更新
    this.attackTimer++;
    if (this.attackTimer >= this.attackCooldown) {
      this.attack();
      this.attackTimer = 0;
    }
  }

  attack() {
    // ボス攻撃：下方向にレーザー攻撃（実装は後ほど）
    console.log('Boss Attack!');
  }

  takeDamage(damage) {
    this.hp -= damage;
    if (this.hp < 0) {this.hp = 0;}
  }

  isDefeated() {
    return this.hp <= 0;
  }

  render(ctx) {
    // HPバー背景
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(this.x, this.y - 15, this.width, 8);

    // HPバー
    const hpPercent = this.hp / this.maxHp;
    ctx.fillStyle =
      hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(this.x, this.y - 15, this.width * hpPercent, 8);

    // ボス本体（グラデーション）
    const gradient = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x,
      this.y + this.height
    );
    gradient.addColorStop(0, '#ff0080');
    gradient.addColorStop(0.5, '#8000ff');
    gradient.addColorStop(1, '#0080ff');

    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // ボス外枠（光る効果）
    ctx.shadowColor = '#ff0080';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;

    // ボス文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS', this.x + this.width / 2, this.y + this.height / 2 + 7);
  }
}

// 🚀 革新的新クラス：パワーアップアイテム
class PowerUpItem {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 24;
    this.type = type;
    this.vy = 2; // 落下速度
    this.pulse = 0;
    this.pulseSpeed = 0.1;
  }

  update() {
    this.y += this.vy;
    this.pulse += this.pulseSpeed;
  }

  getColor() {
    const colors = {
      extra_life: '#00ff00',
      score_boost: '#ffff00',
      multi_ball: '#ff00ff',
      paddle_extend: '#00ffff',
      ball_speed: '#ff8000',
      explosion_power: '#ff0000',
    };
    return colors[this.type] || '#ffffff';
  }

  getSymbol() {
    const symbols = {
      extra_life: '❤️',
      score_boost: '⭐',
      multi_ball: '⚡',
      paddle_extend: '📏',
      ball_speed: '🚀',
      explosion_power: '💣',
    };
    return symbols[this.type] || '?';
  }

  render(ctx) {
    ctx.save();

    // 脈動効果
    const scale = 1 + 0.2 * Math.sin(this.pulse);
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(scale, scale);

    // 光る外枠
    ctx.shadowColor = this.getColor();
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.getColor();
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // シンボル
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.getSymbol(), 0, 6);

    ctx.restore();
  }
}

// Initialize game when page loads
window.addEventListener('load', () => {
  new GameState();
});
