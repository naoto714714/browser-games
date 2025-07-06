// メインゲームクラス
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = GAME_CONSTANTS.GAME_STATE.START;

    // ゲームシステム
    this.inputManager = new InputManager();
    this.audioManager = new AudioManager();
    this.camera = new Camera();

    // ゲームオブジェクト
    this.level = null;
    this.player = null;

    // ゲーム状態
    this.gameTime = 400; // 制限時間（秒）
    this.frameCount = 0;
    this.deltaTime = 0;
    this.lastFrameTime = 0;
    this.paused = false;

    // HUD要素
    this.hudElements = {
      score: document.getElementById('scoreValue'),
      coins: document.getElementById('coinCount'),
      time: document.getElementById('timeValue'),
      lives: document.getElementById('livesCount'),
    };

    this.setupCanvas();
    this.showStartScreen();
  }

  // キャンバス設定
  setupCanvas() {
    // ピクセルアート用の設定
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
  }

  // スタート画面を表示
  showStartScreen() {
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
  }

  // ゲーム開始
  startGame() {
    this.state = GAME_CONSTANTS.GAME_STATE.PLAYING;
    document.getElementById('startScreen').classList.add('hidden');

    // ゲームオブジェクトを初期化
    this.initializeGame();

    // 音響を有効化
    this.audioManager.enableAudio();

    // ゲームループ開始
    this.gameLoop();
  }

  // ゲーム初期化
  initializeGame() {
    // レベル作成
    this.level = new Level();

    // プレイヤー作成
    this.player = new Player(100, 350);

    // カメラ設定
    this.camera.snapToTarget(this.player);

    // ゲーム状態リセット
    this.gameTime = 400;
    this.frameCount = 0;
    this.paused = false;

    // HUD更新
    this.updateHUD();
  }

  // ゲームループ
  gameLoop() {
    if (this.state !== GAME_CONSTANTS.GAME_STATE.PLAYING) {
      return;
    }

    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    // 入力処理
    this.inputManager.update();
    this.handleInput();

    if (!this.paused) {
      // ゲーム更新
      this.update(this.deltaTime);

      // 描画
      this.render();

      // フレームカウント
      this.frameCount++;
    }

    // 次のフレーム
    requestAnimationFrame(() => this.gameLoop());
  }

  // 入力処理
  handleInput() {
    const input = this.inputManager.getPlayerInput();

    // ポーズ
    if (input.pauseJustPressed) {
      this.togglePause();
      return;
    }

    // ゲーム開始（スタート画面から）
    if (
      this.state === GAME_CONSTANTS.GAME_STATE.START &&
      input.jumpJustPressed
    ) {
      this.startGame();
      return;
    }

    // ゲームオーバー画面からリスタート
    if (
      this.state === GAME_CONSTANTS.GAME_STATE.GAME_OVER &&
      input.jumpJustPressed
    ) {
      this.restartGame();
      return;
    }

    // プレイヤー入力
    if (this.state === GAME_CONSTANTS.GAME_STATE.PLAYING && !this.paused) {
      this.player.setInput(input.left, input.right, input.jump, input.run);
    }
  }

  // ゲーム更新
  update(deltaTime) {
    // タイマー更新（60FPS基準）
    if (this.frameCount % 60 === 0) {
      this.gameTime--;
      if (this.gameTime <= 0) {
        this.gameOver();
        return;
      }
    }

    // プレイヤー更新
    this.player.update(deltaTime);

    // 物理演算
    this.updatePhysics();

    // レベル更新
    this.level.update(deltaTime);

    // カメラ更新
    this.camera.update(this.player);

    // 衝突検出
    this.handleCollisions();

    // HUD更新
    this.updateHUD();

    // レベル完了チェック
    this.checkLevelComplete();
  }

  // 物理演算更新
  updatePhysics() {
    // プレイヤーの物理演算
    Physics.applyGravity(this.player);

    // レベルのソリッドブロックとの衝突
    const solidBlocks = this.level.getSolidBlocks();
    Physics.resolveCollisionWithTiles(this.player, solidBlocks);

    // 世界境界チェック
    const boundResult = Physics.checkWorldBounds(
      this.player,
      this.level.width,
      this.level.height
    );
    if (boundResult.fellOffWorld) {
      this.playerDie();
    }

    // 敵の物理演算
    this.level.enemies.forEach(enemy => {
      if (enemy.active) {
        Physics.applyGravity(enemy);
        Physics.resolveCollisionWithTiles(enemy, solidBlocks);

        // 敵の方向転換チェック
        if (enemy instanceof Goomba) {
          enemy.checkDirectionChange(solidBlocks);
        }
      }
    });

    // アイテムの物理演算
    this.level.spawnedItems.forEach(item => {
      if (item.active) {
        Physics.applyGravity(item);
        Physics.resolveCollisionWithTiles(item, solidBlocks);

        // アイテムの方向転換
        if (item.type === ITEM_TYPES.MUSHROOM) {
          const nextX = item.x + item.velocityX;
          let shouldTurn = false;

          for (const block of solidBlocks) {
            if (
              Physics.checkRectCollision(
                { x: nextX, y: item.y, width: item.width, height: item.height },
                block
              )
            ) {
              shouldTurn = true;
              break;
            }
          }

          if (shouldTurn) {
            item.changeDirection();
          }
        }
      }
    });
  }

  // 衝突検出
  handleCollisions() {
    // プレイヤーとブロックの衝突（ブロック叩き）
    this.checkPlayerBlockCollisions();

    // プレイヤーと敵の衝突
    this.checkPlayerEnemyCollisions();

    // プレイヤーとアイテムの衝突
    this.checkPlayerItemCollisions();
  }

  // プレイヤーとブロックの衝突
  checkPlayerBlockCollisions() {
    const playerHead = {
      x: this.player.x + 2,
      y: this.player.y,
      width: this.player.width - 4,
      height: 8,
    };

    this.level.blocks.forEach(block => {
      if (
        block.active &&
        (block.type === BLOCK_TYPES.BRICK ||
          block.type === BLOCK_TYPES.QUESTION) &&
        this.player.velocityY < 0 && // 上昇中
        Physics.checkRectCollision(playerHead, block)
      ) {
        const result = block.onHit(this.player);
        if (result) {
          this.handleBlockHitResult(result, block);
        }
      }
    });
  }

  // ブロック叩きの結果処理
  handleBlockHitResult(result, block) {
    if (result.type === 'coin') {
      this.collectCoin(result.points);
      this.audioManager.playCoin();
    } else if (result.type === 'item') {
      const item = new Item(result.item.x, result.item.y, result.item.type);
      this.level.addItem(item);
      this.player.addScore(result.points);
    } else if (result.type === 'break') {
      this.player.addScore(result.points);
      this.audioManager.playBreak();
      this.camera.startShake(2, 10);
    }
  }

  // プレイヤーと敵の衝突
  checkPlayerEnemyCollisions() {
    this.level.enemies.forEach(enemy => {
      if (enemy.isAlive() && Physics.checkEntityCollision(this.player, enemy)) {
        const result = enemy.onPlayerCollision(this.player);
        if (result) {
          if (
            result.type === 'defeat' ||
            result.type === 'shell' ||
            result.type === 'kick'
          ) {
            this.player.addScore(result.points);
            this.audioManager.playStomp();
          } else if (result.type === 'damage') {
            this.playerTakeDamage();
          }
        }
      }
    });
  }

  // プレイヤーとアイテムの衝突
  checkPlayerItemCollisions() {
    this.level.spawnedItems.forEach(item => {
      if (item.active && Physics.checkEntityCollision(this.player, item)) {
        const result = item.collect(this.player);
        if (result) {
          this.handleItemCollection(result);
        }
      }
    });
  }

  // アイテム取得処理
  handleItemCollection(result) {
    switch (result.type) {
    case ITEM_TYPES.COIN:
      this.collectCoin(result.points);
      this.audioManager.playCoin();
      break;
    case ITEM_TYPES.MUSHROOM:
    case ITEM_TYPES.FIRE_FLOWER:
      this.player.powerUp(result.type);
      this.player.addScore(result.points);
      this.audioManager.playPowerUp();
      break;
    case ITEM_TYPES.ONE_UP:
      this.player.lives++;
      this.audioManager.playOneUp();
      break;
    }
  }

  // コイン取得
  collectCoin(points) {
    this.player.addScore(points);
    const coinResult = this.player.collectCoin();
    if (coinResult.extraLife) {
      this.audioManager.playOneUp();
    }
  }

  // プレイヤーダメージ
  playerTakeDamage() {
    const damageResult = this.player.takeDamage();
    if (damageResult) {
      this.playerDie();
    } else {
      this.audioManager.playPowerUp(); // パワーダウン音
      this.camera.startShake(3, 20);
    }
  }

  // プレイヤー死亡
  playerDie() {
    const deathResult = this.player.die();
    this.audioManager.playDie();
    this.camera.startShake(5, 30);

    if (deathResult.gameOver) {
      setTimeout(() => this.gameOver(), 2000);
    }
  }

  // レベル完了チェック
  checkLevelComplete() {
    const flagPos = this.level.getFlagPolePosition();
    if (this.player.x >= flagPos.x) {
      this.levelComplete();
    }
  }

  // レベル完了
  levelComplete() {
    this.state = GAME_CONSTANTS.GAME_STATE.LEVEL_COMPLETE;
    // TODO: レベル完了処理
    console.log('Level Complete!');
  }

  // ゲームオーバー
  gameOver() {
    this.state = GAME_CONSTANTS.GAME_STATE.GAME_OVER;
    document.getElementById('gameOverScreen').classList.remove('hidden');
  }

  // ゲーム再開
  restartGame() {
    this.state = GAME_CONSTANTS.GAME_STATE.START;
    document.getElementById('gameOverScreen').classList.add('hidden');
    this.showStartScreen();
  }

  // ポーズ切り替え
  togglePause() {
    this.paused = !this.paused;
  }

  // HUD更新
  updateHUD() {
    if (this.hudElements.score) {
      this.hudElements.score.textContent = Utils.formatScore(this.player.score);
    }
    if (this.hudElements.coins) {
      this.hudElements.coins.textContent = Utils.formatCoins(this.player.coins);
    }
    if (this.hudElements.time) {
      this.hudElements.time.textContent = Utils.formatTime(this.gameTime);
    }
    if (this.hudElements.lives) {
      this.hudElements.lives.textContent = Utils.formatLives(this.player.lives);
    }
  }

  // 描画
  render() {
    // 画面クリア
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // レベル描画
    this.level.render(this.ctx, this.camera);

    // プレイヤー描画
    this.player.render(this.ctx, this.camera);

    // デバッグ情報（開発時）
    if (window.DEBUG) {
      this.renderDebugInfo();
    }
  }

  // デバッグ情報描画
  renderDebugInfo() {
    this.ctx.save();
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(
      `Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      10,
      20
    );
    this.ctx.fillText(
      `Velocity: (${this.player.velocityX.toFixed(
        2
      )}, ${this.player.velocityY.toFixed(2)})`,
      10,
      35
    );
    this.ctx.fillText(`Grounded: ${this.player.grounded}`, 10, 50);
    this.ctx.fillText(
      `Camera: (${Math.floor(this.camera.x)}, ${Math.floor(this.camera.y)})`,
      10,
      65
    );
    this.ctx.fillText(`FPS: ${Math.floor(1 / this.deltaTime)}`, 10, 80);
    this.ctx.restore();
  }

  // ゲーム状態取得
  getState() {
    return {
      state: this.state,
      gameTime: this.gameTime,
      frameCount: this.frameCount,
      paused: this.paused,
      player: {
        x: this.player?.x || 0,
        y: this.player?.y || 0,
        score: this.player?.score || 0,
        lives: this.player?.lives || 0,
        coins: this.player?.coins || 0,
      },
    };
  }
}
