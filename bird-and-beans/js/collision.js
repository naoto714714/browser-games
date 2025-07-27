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

      if (CollisionManager.checkPointInRect(checkX, checkY, rect)) {
        return true;
      }
    }

    return false;
  }

  static getBlockIndexFromX(x, blockSize) {
    return Math.floor(x / blockSize);
  }

  static isWithinBounds(index, min, max) {
    return index >= min && index < max;
  }

  static checkCircleRectCollision(circle, rect) {
    // 矩形の最も近い点を見つける
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // 円の中心と最も近い点の距離を計算
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    // 距離が円の半径以下であれば衝突
    return distanceSquared <= circle.radius * circle.radius;
  }
}
