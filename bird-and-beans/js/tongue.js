import {
  TONGUE_MAX_LENGTH,
  TONGUE_EXTEND_SPEED,
  TONGUE_ANGLE_DEGREES,
  TONGUE_WIDTH,
  TONGUE_CHECK_INTERVAL,
  COLORS
} from './constants.js';

export class Tongue {
  constructor() {
    this.active = false;
    this.extending = false;
    this.length = 0;
    this.maxLength = TONGUE_MAX_LENGTH;
    this.extendSpeed = TONGUE_EXTEND_SPEED;
    this.angle = (TONGUE_ANGLE_DEGREES * Math.PI) / 180;
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
  }

  start() {
    if (!this.active) {
      this.active = true;
      this.extending = true;
      this.length = 0;
    }
  }

  release() {
    if (this.active) {
      this.extending = false;
    }
  }

  update(x, y, direction) {
    if (!this.active) return;

    if (this.extending) {
      this.length += this.extendSpeed;
      if (this.length >= this.maxLength) {
        this.length = this.maxLength;
        this.extending = false;
      }
    } else {
      this.active = false;
      this.length = 0;
    }

    this.updatePosition(x, y, direction);
  }

  updatePosition(x, y, direction) {
    this.startX = x;
    this.startY = y;
    this.endX = this.startX + Math.cos(this.angle) * this.length * direction;
    this.endY = this.startY - Math.sin(this.angle) * this.length;
  }

  render(renderer) {
    if (this.active && this.length > 0) {
      renderer.drawLine(
        this.startX,
        this.startY,
        this.endX,
        this.endY,
        COLORS.TONGUE,
        TONGUE_WIDTH
      );
    }
  }

  checkCollision(bean) {
    if (!this.active || this.length === 0) return false;

    const dx = this.endX - this.startX;
    const dy = this.endY - this.startY;
    const len = Math.sqrt(dx * dx + dy * dy);

    for (let i = 0; i <= len; i += TONGUE_CHECK_INTERVAL) {
      const ratio = i / len;
      const checkX = this.startX + dx * ratio;
      const checkY = this.startY + dy * ratio;

      if (
        checkX >= bean.x &&
        checkX <= bean.x + bean.width &&
        checkY >= bean.y &&
        checkY <= bean.y + bean.height
      ) {
        return true;
      }
    }

    return false;
  }

  reset() {
    this.active = false;
    this.extending = false;
    this.length = 0;
  }
}