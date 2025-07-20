export class CollisionManager {
  static checkRectCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  static checkPointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  }

  static checkLineRectCollision(lineStart, lineEnd, rect, checkInterval = 5) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    for (let i = 0; i <= len; i += checkInterval) {
      const ratio = i / len;
      const checkX = lineStart.x + dx * ratio;
      const checkY = lineStart.y + dy * ratio;

      if (this.checkPointInRect(checkX, checkY, rect)) {
        return true;
      }
    }

    return false;
  }

  static getBlockIndexFromX(x, blockWidth) {
    return Math.floor(x / blockWidth);
  }

  static isWithinBounds(index, min, max) {
    return index >= min && index < max;
  }
}
