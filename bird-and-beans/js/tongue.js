import {
  TONGUE_MAX_LENGTH,
  TONGUE_EXTEND_SPEED,
  TONGUE_ANGLE_DEGREES,
  TONGUE_WIDTH,
  TONGUE_TIP_RADIUS,
  COLORS,
} from './constants.js';
import { CollisionManager } from './collision.js';

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

  retract() {
    this.active = false;
    this.extending = false;
    this.length = 0;
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
      // 舌のラインを描画
      renderer.drawLine(this.startX, this.startY, this.endX, this.endY, COLORS.TONGUE, TONGUE_WIDTH);

      // 舌の先端を太い円で描画
      renderer.drawCircle(this.endX, this.endY, TONGUE_TIP_RADIUS, COLORS.TONGUE);
    }
  }

  checkCollision(bean) {
    if (!this.active || this.length === 0) return false;

    // 舌の先端（円）とマメ（矩形）の衝突判定
    const tongueTip = {
      x: this.endX,
      y: this.endY,
      radius: TONGUE_TIP_RADIUS,
    };

    return CollisionManager.checkCircleRectCollision(tongueTip, bean);
  }

  reset() {
    this.active = false;
    this.extending = false;
    this.length = 0;
  }
}
