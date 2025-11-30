// カメラクラス
class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.smoothing = 0.1;
    this.deadZone = {
      left: 200,
      right: 300,
      top: 150,
      bottom: 200,
    };
    this.bounds = {
      left: 0,
      right: GAME_CONSTANTS.LEVEL.WIDTH - GAME_CONSTANTS.CANVAS_WIDTH,
      top: 0,
      bottom: GAME_CONSTANTS.LEVEL.HEIGHT - GAME_CONSTANTS.CANVAS_HEIGHT,
    };
    this.shake = {
      intensity: 0,
      duration: 0,
      offsetX: 0,
      offsetY: 0,
    };
  }

  // カメラの更新処理
  update(target) {
    this.updateTarget(target);
    this.updatePosition();
    this.updateShake();
    this.clampToBounds();
  }

  // ターゲット位置の更新
  updateTarget(target) {
    const playerScreenX = target.x - this.x;
    const playerScreenY = target.y - this.y;

    // 水平方向のデッドゾーン処理
    if (playerScreenX < this.deadZone.left) {
      this.targetX = target.x - this.deadZone.left;
    } else if (playerScreenX > this.deadZone.right) {
      this.targetX = target.x - this.deadZone.right;
    }

    // 垂直方向のデッドゾーン処理
    if (playerScreenY < this.deadZone.top) {
      this.targetY = target.y - this.deadZone.top;
    } else if (playerScreenY > this.deadZone.bottom) {
      this.targetY = target.y - this.deadZone.bottom;
    }

    // プレイヤーが右に移動している場合のみカメラを追従
    if (target.velocityX > 0) {
      this.targetX = target.x - this.deadZone.left;
    }
  }

  // カメラ位置の更新（スムージング）
  updatePosition() {
    this.x = Utils.lerp(this.x, this.targetX, this.smoothing);
    this.y = Utils.lerp(this.y, this.targetY, this.smoothing);
  }

  // 画面揺れの更新
  updateShake() {
    if (this.shake.duration > 0) {
      this.shake.duration--;
      this.shake.offsetX = (Math.random() - 0.5) * this.shake.intensity;
      this.shake.offsetY = (Math.random() - 0.5) * this.shake.intensity;
    } else {
      this.shake.offsetX = 0;
      this.shake.offsetY = 0;
    }
  }

  // カメラ位置を境界内に制限
  clampToBounds() {
    this.x = Utils.clamp(this.x + this.shake.offsetX, this.bounds.left, this.bounds.right);
    this.y = Utils.clamp(this.y + this.shake.offsetY, this.bounds.top, this.bounds.bottom);
  }

  // 即座にターゲットに移動
  snapToTarget(target) {
    this.x = target.x - this.deadZone.left;
    this.y = target.y - this.deadZone.top;
    this.targetX = this.x;
    this.targetY = this.y;
    this.clampToBounds();
  }

  // 画面揺れを開始
  startShake(intensity, duration) {
    this.shake.intensity = intensity;
    this.shake.duration = duration;
  }

  // 特定位置にカメラを設定
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
  }

  // カメラの境界を設定
  setBounds(left, right, top, bottom) {
    this.bounds.left = left;
    this.bounds.right = right;
    this.bounds.top = top;
    this.bounds.bottom = bottom;
  }

  // デッドゾーンを設定
  setDeadZone(left, right, top, bottom) {
    this.deadZone.left = left;
    this.deadZone.right = right;
    this.deadZone.top = top;
    this.deadZone.bottom = bottom;
  }

  // スムージング値を設定
  setSmoothing(value) {
    this.smoothing = Utils.clamp(value, 0, 1);
  }

  // ワールド座標をスクリーン座標に変換
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y,
    };
  }

  // スクリーン座標をワールド座標に変換
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y,
    };
  }

  // 矩形がカメラの視界内にあるかチェック
  isInView(x, y, width, height) {
    return (
      x + width > this.x &&
      x < this.x + GAME_CONSTANTS.CANVAS_WIDTH &&
      y + height > this.y &&
      y < this.y + GAME_CONSTANTS.CANVAS_HEIGHT
    );
  }

  // カメラの中心座標を取得
  getCenterX() {
    return this.x + GAME_CONSTANTS.CANVAS_WIDTH / 2;
  }

  getCenterY() {
    return this.y + GAME_CONSTANTS.CANVAS_HEIGHT / 2;
  }

  // カメラを特定のエリアに固定
  lockToArea(x, y, width, height) {
    const cameraWidth = GAME_CONSTANTS.CANVAS_WIDTH;
    const cameraHeight = GAME_CONSTANTS.CANVAS_HEIGHT;

    this.bounds.left = Math.max(x, 0);
    this.bounds.right = Math.min(x + width - cameraWidth, GAME_CONSTANTS.LEVEL.WIDTH - cameraWidth);
    this.bounds.top = Math.max(y, 0);
    this.bounds.bottom = Math.min(y + height - cameraHeight, GAME_CONSTANTS.LEVEL.HEIGHT - cameraHeight);
  }

  // カメラの移動を停止
  stop() {
    this.targetX = this.x;
    this.targetY = this.y;
  }

  // カメラをリセット
  reset() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.shake.intensity = 0;
    this.shake.duration = 0;
    this.shake.offsetX = 0;
    this.shake.offsetY = 0;
  }
}
