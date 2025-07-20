// 敵の基底クラス
class Enemy extends Entity {
  constructor(x, y, width, height, type) {
    super(x, y, width, height);
    this.type = type;
    this.alive = true;
    this.defeated = false;
    this.defeatTimer = 0;
    this.points = 0;
    this.direction = DIRECTION.LEFT;
    this.velocityX = -1; // 左に移動
  }

  // 敵の更新処理
  update(deltaTime) {
    if (!this.active || this.defeated) {
      this.updateDefeatAnimation();
      return;
    }

    super.update(deltaTime);
    this.updateMovement();
  }

  // 移動処理の更新
  updateMovement() {
    // 基本的な AI（継承先でオーバーライド）
  }

  // 敗北アニメーションの更新
  updateDefeatAnimation() {
    if (this.defeated) {
      this.defeatTimer++;
      if (this.defeatTimer > 60) {
        // 1秒後に消去
        this.destroy();
      }
    }
  }

  // 踏まれた時の処理
  onStomp(player) {
    if (this.defeated) {
      return null;
    }

    this.defeated = true;
    this.velocityX = 0;
    this.velocityY = 0;

    return {
      type: 'defeat',
      points: this.points,
    };
  }

  // プレイヤーとの衝突処理
  onPlayerCollision(player) {
    if (this.defeated) {
      return null;
    }

    // プレイヤーが上から踏んだ場合
    if (player.velocityY > 0 && player.y + player.height - player.velocityY <= this.y) {
      return this.onStomp(player);
    } else {
      // 横から触れた場合はプレイヤーがダメージを受ける
      return { type: 'damage' };
    }
  }

  // 方向転換
  changeDirection() {
    this.velocityX = -this.velocityX;
    this.direction = this.velocityX > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
  }

  // 敵が生きているかチェック
  isAlive() {
    return this.alive && this.active && !this.defeated;
  }
}

// グンバ
class Goomba extends Enemy {
  constructor(x, y) {
    super(x, y, GAME_CONSTANTS.ENEMY.GOOMBA.WIDTH, GAME_CONSTANTS.ENEMY.GOOMBA.HEIGHT, ENEMY_TYPES.GOOMBA);
    this.velocityX = -GAME_CONSTANTS.ENEMY.GOOMBA.SPEED;
    this.spriteKey = 'goomba';
    this.points = 100;
    this.walkAnimationFrames = ['goomba']; // 歩行アニメーション用のスプライト名配列
    this.currentWalkFrame = 0;
  }

  // グンバの移動処理
  updateMovement() {
    // 歩行アニメーション
    if (this.animationTimer % 20 === 0) {
      this.currentWalkFrame = (this.currentWalkFrame + 1) % this.walkAnimationFrames.length;
      this.spriteKey = this.walkAnimationFrames[this.currentWalkFrame];
    }

    // 基本的な左右移動
    this.x += this.velocityX;
  }

  // 踏まれた時の処理（グンバ特有）
  onStomp(player) {
    if (this.defeated) {
      return null;
    }

    this.defeated = true;
    this.velocityX = 0;
    this.velocityY = 0;
    this.height = 8; // 潰れる
    this.y += 8;

    // プレイヤーを少し跳ね上げる
    player.velocityY = -8;

    return {
      type: 'defeat',
      points: this.points,
    };
  }

  // 壁や崖での方向転換チェック
  checkDirectionChange(tiles) {
    const nextX = this.x + this.velocityX;
    const checkY = this.y + this.height + 1; // 足元より少し下

    // 前方に床があるかチェック
    let hasFloorAhead = false;
    for (const tile of tiles) {
      if (
        tile.x <= nextX + this.width &&
        tile.x + tile.width >= nextX &&
        tile.y <= checkY &&
        tile.y + tile.height >= checkY
      ) {
        hasFloorAhead = true;
        break;
      }
    }

    // 前方に壁があるかチェック
    let hasWallAhead = false;
    for (const tile of tiles) {
      if (Physics.checkRectCollision({ x: nextX, y: this.y, width: this.width, height: this.height }, tile)) {
        hasWallAhead = true;
        break;
      }
    }

    // 床がないか壁がある場合は方向転換
    if (!hasFloorAhead || hasWallAhead) {
      this.changeDirection();
    }
  }
}

// ノコノコ（簡易版）
class KoopaTroopa extends Enemy {
  constructor(x, y) {
    super(x, y, GAME_CONSTANTS.ENEMY.KOOPA.WIDTH, GAME_CONSTANTS.ENEMY.KOOPA.HEIGHT, ENEMY_TYPES.KOOPA_TROOPA);
    this.velocityX = -GAME_CONSTANTS.ENEMY.KOOPA.SPEED;
    this.spriteKey = 'koopa';
    this.points = 200;
    this.shellMode = false;
    this.shellVelocity = 0;
    this.originalHeight = this.height;
  }

  // ノコノコの移動処理
  updateMovement() {
    if (this.shellMode) {
      // 甲羅モードの処理
      this.x += this.shellVelocity;

      // 甲羅が止まったら復活の準備
      if (Math.abs(this.shellVelocity) < 0.1) {
        this.shellVelocity = 0;
        // TODO: 復活タイマーの実装
      }
    } else {
      // 通常モードの移動
      this.x += this.velocityX;
    }
  }

  // 踏まれた時の処理（ノコノコ特有）
  onStomp(player) {
    if (this.defeated) {
      return null;
    }

    if (!this.shellMode) {
      // 通常モードから甲羅モードへ
      this.shellMode = true;
      this.height = this.originalHeight / 2;
      this.y += this.originalHeight / 2;
      this.velocityX = 0;
      this.shellVelocity = 0;
      this.spriteKey = 'koopaShell';

      // プレイヤーを少し跳ね上げる
      player.velocityY = -8;

      return {
        type: 'shell',
        points: this.points,
      };
    } else {
      // 甲羅モードで踏まれたら蹴り飛ばす
      const direction = player.getCenterX() < this.getCenterX() ? 1 : -1;
      this.shellVelocity = direction * 8;

      return {
        type: 'kick',
        points: this.points / 2,
      };
    }
  }

  // プレイヤーとの衝突処理（ノコノコ特有）
  onPlayerCollision(player) {
    if (this.defeated) {
      return null;
    }

    // 甲羅モードで横から触れた場合
    if (this.shellMode && Math.abs(this.shellVelocity) < 0.1) {
      // 甲羅を蹴る
      const direction = player.getCenterX() < this.getCenterX() ? 1 : -1;
      this.shellVelocity = direction * 8;

      return {
        type: 'kick',
        points: 50,
      };
    }

    // 通常の衝突処理
    return super.onPlayerCollision(player);
  }

  // 甲羅モードかチェック
  isShell() {
    return this.shellMode;
  }

  // 甲羅が動いているかチェック
  isMovingShell() {
    return this.shellMode && Math.abs(this.shellVelocity) > 0.1;
  }
}
