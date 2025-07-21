import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_ANIMATION_INTERVAL,
  PLAYER_IMAGE_DEFAULT,
  PLAYER_IMAGE_WALK,
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
    // Y座標は後でsetGroundPositionで設定される
    this.y = 0;

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
    this.animationTimer = 0;
  }

  loadImages() {
    let loadedCount = 0;
    const totalImages = 2;

    const checkAllImagesLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        this.imagesLoaded = true;
      }
    };

    const loadImage = (src, errorMessage) => {
      const img = new Image();
      img.onload = checkAllImagesLoaded;
      img.onerror = () => console.warn(errorMessage);
      img.src = src;
      return img;
    };

    this.imageDefault = loadImage(PLAYER_IMAGE_DEFAULT, 'Failed to load bird default image');
    this.imageWalk = loadImage(PLAYER_IMAGE_WALK, 'Failed to load bird walk image');
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

  setGroundPosition(ground) {
    this.y = ground.getTopY() - this.height;
  }

  updateTongue() {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    this.tongue.update(centerX, centerY, this.direction);
  }

  update(inputManager, ground, deltaTime = 16) {
    // 移動状態の更新
    this.isMoving = false;

    if (inputManager.isLeftPressed()) {
      this.moveLeft(ground);
      this.isMoving = true;
    } else if (inputManager.isRightPressed()) {
      this.moveRight(ground);
      this.isMoving = true;
    }

    // アニメーションタイマーの更新
    if (this.isMoving) {
      this.animationTimer += deltaTime;
    } else {
      this.animationTimer = 0;
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
        // PLAYER_ANIMATION_INTERVALミリ秒ごとに画像を切り替え
        const showWalkImage = Math.floor(this.animationTimer / PLAYER_ANIMATION_INTERVAL) % 2 === 1;
        imageToRender = showWalkImage ? this.imageWalk : this.imageDefault;
      }

      renderer.drawImage(imageToRender, this.x, this.y, this.width, this.height, flipX);
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
