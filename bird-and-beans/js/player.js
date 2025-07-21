import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_GROUND_MARGIN,
  PLAYER_EYE_OFFSET,
  PLAYER_EYE_RADIUS,
  GROUND_HEIGHT,
  COLORS,
} from './constants.js';
import { Tongue } from './tongue.js';
import { CollisionManager } from './collision.js';

export class Player {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - GROUND_HEIGHT - this.height - PLAYER_GROUND_MARGIN;

    this.speed = PLAYER_SPEED;
    this.direction = 1; // 1: 右向き, -1: 左向き
    this.tongue = new Tongue();

    // 画像の読み込み
    this.imageDefault = null;
    this.imageWalk = null;
    this.imagesLoaded = false;
    this.loadImages();

    // アニメーション状態
    this.isMoving = false;
    this.animationFrame = 0;
    this.animationSpeed = 8; // フレーム数でアニメーション速度を制御
  }

  loadImages() {
    let loadedCount = 0;
    const totalImages = 2;

    // デフォルト画像の読み込み
    this.imageDefault = new Image();
    this.imageDefault.onload = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        this.imagesLoaded = true;
      }
    };
    this.imageDefault.onerror = () => {
      console.warn('Failed to load bird default image');
    };
    this.imageDefault.src = 'assets/bird_default.png';

    // 歩行画像の読み込み
    this.imageWalk = new Image();
    this.imageWalk.onload = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        this.imagesLoaded = true;
      }
    };
    this.imageWalk.onerror = () => {
      console.warn('Failed to load bird walk image');
    };
    this.imageWalk.src = 'assets/bird_walk.png';
  }

  moveLeft(ground) {
    // 舌を伸ばしている間は移動できない
    if (this.tongue.active) return;

    const newX = this.x - this.speed;
    if (newX >= 0 && ground.canPlayerMoveTo(newX, this.width)) {
      this.x = newX;
      this.direction = -1;
    }
  }

  moveRight(ground) {
    // 舌を伸ばしている間は移動できない
    if (this.tongue.active) return;

    const newX = this.x + this.speed;
    if (newX + this.width <= this.canvasWidth && ground.canPlayerMoveTo(newX, this.width)) {
      this.x = newX;
      this.direction = 1;
    }
  }

  startTongue() {
    this.tongue.start();
  }

  releaseTongue() {
    this.tongue.release();
  }

  retractTongue() {
    this.tongue.retract();
  }

  updateTongue() {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    this.tongue.update(centerX, centerY, this.direction);
  }

  update(inputManager, ground) {
    // 移動状態の更新
    this.isMoving = false;

    if (inputManager.isLeftPressed()) {
      this.moveLeft(ground);
      this.isMoving = true;
    } else if (inputManager.isRightPressed()) {
      this.moveRight(ground);
      this.isMoving = true;
    }

    // アニメーションフレームの更新
    if (this.isMoving) {
      this.animationFrame++;
    } else {
      this.animationFrame = 0;
    }

    if (inputManager.isSpaceJustPressed() && !this.tongue.active) {
      this.startTongue();
    } else if (!inputManager.isSpacePressed() && this.tongue.active) {
      this.releaseTongue();
    }

    this.updateTongue();
  }

  render(renderer) {
    if (this.imagesLoaded && this.imageDefault && this.imageWalk) {
      // 画像が読み込まれている場合
      const flipX = this.direction === -1;
      let imageToRender = this.imageDefault;

      // 移動中はアニメーション
      if (this.isMoving) {
        // animationSpeedフレームごとに画像を切り替え
        const showWalkImage = Math.floor(this.animationFrame / this.animationSpeed) % 2 === 1;
        imageToRender = showWalkImage ? this.imageWalk : this.imageDefault;
      }

      renderer.drawImage(imageToRender, this.x, this.y, this.width, this.height, flipX);
    } else {
      // フォールバック: 画像が読み込まれていない場合は図形で描画
      renderer.drawRect(this.x, this.y, this.width, this.height, COLORS.PLAYER);

      renderer.drawCircle(
        this.x + this.width / 2 + this.direction * PLAYER_EYE_OFFSET,
        this.y + PLAYER_EYE_OFFSET,
        PLAYER_EYE_RADIUS,
        COLORS.PLAYER_EYE,
      );
    }

    this.tongue.render(renderer);
  }

  checkCollision(bean) {
    return CollisionManager.checkRectCollision(this, bean);
  }

  checkTongueCollision(bean) {
    return this.tongue.checkCollision(bean);
  }
}
