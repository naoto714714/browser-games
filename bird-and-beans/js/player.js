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
  }

  moveLeft(ground) {
    const newX = this.x - this.speed;
    if (newX >= 0 && ground.canPlayerMoveTo(newX, this.width)) {
      this.x = newX;
      this.direction = -1;
    }
  }

  moveRight(ground) {
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
    if (inputManager.isLeftPressed()) {
      this.moveLeft(ground);
    } else if (inputManager.isRightPressed()) {
      this.moveRight(ground);
    }

    if (inputManager.isSpaceJustPressed() && !this.tongue.active) {
      this.startTongue();
    } else if (!inputManager.isSpacePressed() && this.tongue.active) {
      this.releaseTongue();
    }

    this.updateTongue();
  }

  render(renderer) {
    renderer.drawRect(this.x, this.y, this.width, this.height, COLORS.PLAYER);

    renderer.drawCircle(
      this.x + this.width / 2 + this.direction * PLAYER_EYE_OFFSET,
      this.y + PLAYER_EYE_OFFSET,
      PLAYER_EYE_RADIUS,
      COLORS.PLAYER_EYE,
    );

    this.tongue.render(renderer);
  }

  checkCollision(bean) {
    return CollisionManager.checkRectCollision(this, bean);
  }

  checkTongueCollision(bean) {
    return this.tongue.checkCollision(bean);
  }
}
