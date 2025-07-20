import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_GROUND_MARGIN,
  PLAYER_EYE_OFFSET,
  PLAYER_EYE_RADIUS,
  GROUND_HEIGHT,
  TONGUE_MAX_LENGTH,
  TONGUE_EXTEND_SPEED,
  TONGUE_ANGLE_DEGREES,
  TONGUE_WIDTH,
  TONGUE_CHECK_INTERVAL,
  COLORS
} from './constants.js';

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

    this.tongue = {
      active: false,
      extending: false,
      length: 0,
      maxLength: TONGUE_MAX_LENGTH,
      extendSpeed: TONGUE_EXTEND_SPEED,
      angle: (TONGUE_ANGLE_DEGREES * Math.PI) / 180,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
    };
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
    if (!this.tongue.active) {
      this.tongue.active = true;
      this.tongue.extending = true;
      this.tongue.length = 0;
    }
  }

  releaseTongue() {
    if (this.tongue.active) {
      this.tongue.extending = false;
    }
  }

  updateTongue() {
    if (!this.tongue.active) return;

    if (this.tongue.extending) {
      this.tongue.length += this.tongue.extendSpeed;
      if (this.tongue.length >= this.tongue.maxLength) {
        this.tongue.length = this.tongue.maxLength;
        this.tongue.extending = false;
      }
    } else {
      this.tongue.active = false;
      this.tongue.length = 0;
    }

    this.tongue.startX = this.x + this.width / 2;
    this.tongue.startY = this.y + this.height / 2;
    this.tongue.endX = this.tongue.startX + Math.cos(this.tongue.angle) * this.tongue.length * this.direction;
    this.tongue.endY = this.tongue.startY - Math.sin(this.tongue.angle) * this.tongue.length;
  }

  update(inputManager, ground) {
    if (inputManager.isLeftPressed()) {
      this.moveLeft(ground);
    } else if (inputManager.isRightPressed()) {
      this.moveRight(ground);
    }

    if (inputManager.isSpacePressed()) {
      this.startTongue();
    } else {
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
      COLORS.PLAYER_EYE
    );

    if (this.tongue.active && this.tongue.length > 0) {
      renderer.drawLine(
        this.tongue.startX,
        this.tongue.startY,
        this.tongue.endX,
        this.tongue.endY,
        COLORS.TONGUE,
        TONGUE_WIDTH
      );
    }
  }

  checkCollision(bean) {
    return (
      bean.x < this.x + this.width &&
      bean.x + bean.width > this.x &&
      bean.y < this.y + this.height &&
      bean.y + bean.height > this.y
    );
  }

  checkTongueCollision(bean) {
    if (!this.tongue.active || this.tongue.length === 0) return false;

    const dx = this.tongue.endX - this.tongue.startX;
    const dy = this.tongue.endY - this.tongue.startY;
    const len = Math.sqrt(dx * dx + dy * dy);

    for (let i = 0; i <= len; i += TONGUE_CHECK_INTERVAL) {
      const ratio = i / len;
      const checkX = this.tongue.startX + dx * ratio;
      const checkY = this.tongue.startY + dy * ratio;

      if (checkX >= bean.x && checkX <= bean.x + bean.width && checkY >= bean.y && checkY <= bean.y + bean.height) {
        return true;
      }
    }

    return false;
  }
}
