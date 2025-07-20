// 物理演算エンジン
const Physics = {
  // 重力を適用
  applyGravity(entity) {
    if (!entity.grounded) {
      entity.velocityY += GAME_CONSTANTS.GRAVITY;
      entity.velocityY = Math.min(entity.velocityY, GAME_CONSTANTS.TERMINAL_VELOCITY);
    }
  },

  // 摩擦を適用
  applyFriction(entity) {
    if (entity.grounded) {
      entity.velocityX *= GAME_CONSTANTS.FRICTION;
      if (Math.abs(entity.velocityX) < 0.1) {
        entity.velocityX = 0;
      }
    }
  },

  // エンティティの位置を更新
  updatePosition(entity) {
    entity.x += entity.velocityX;
    entity.y += entity.velocityY;
  },

  // 矩形同士の衝突検出
  checkRectCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  },

  // エンティティとタイルの衝突検出・解決
  resolveCollisionWithTiles(entity, tiles) {
    const entityRect = {
      x: entity.x + entity.velocityX,
      y: entity.y,
      width: entity.width,
      height: entity.height,
    };

    // 水平方向の衝突チェック
    let collisionX = false;
    for (const tile of tiles) {
      if (this.checkRectCollision(entityRect, tile)) {
        if (entity.velocityX > 0) {
          // 右方向の移動
          entity.x = tile.x - entity.width;
        } else if (entity.velocityX < 0) {
          // 左方向の移動
          entity.x = tile.x + tile.width;
        }
        entity.velocityX = 0;
        collisionX = true;
        break;
      }
    }

    if (!collisionX) {
      entity.x += entity.velocityX;
    }

    // 垂直方向の衝突チェック
    entityRect.x = entity.x;
    entityRect.y = entity.y + entity.velocityY;

    let collisionY = false;
    entity.grounded = false;

    for (const tile of tiles) {
      if (this.checkRectCollision(entityRect, tile)) {
        if (entity.velocityY > 0) {
          // 下方向の移動（地面に着地）
          entity.y = tile.y - entity.height;
          entity.grounded = true;
        } else if (entity.velocityY < 0) {
          // 上方向の移動（天井にぶつかる）
          entity.y = tile.y + tile.height;
        }
        entity.velocityY = 0;
        collisionY = true;
        break;
      }
    }

    if (!collisionY) {
      entity.y += entity.velocityY;
    }

    return { collisionX, collisionY };
  },

  // エンティティ同士の衝突検出
  checkEntityCollision(entity1, entity2) {
    return this.checkRectCollision(
      {
        x: entity1.x,
        y: entity1.y,
        width: entity1.width,
        height: entity1.height,
      },
      {
        x: entity2.x,
        y: entity2.y,
        width: entity2.width,
        height: entity2.height,
      },
    );
  },

  // 跳ね返り処理
  bounce(entity, surface) {
    if (surface.type === 'horizontal') {
      entity.velocityY = -entity.velocityY * 0.6;
    } else if (surface.type === 'vertical') {
      entity.velocityX = -entity.velocityX * 0.6;
    }
  },

  // プラットフォーム衝突（一方通行の床）
  checkPlatformCollision(entity, platform) {
    const entityBottom = entity.y + entity.height;
    const entityLastBottom = entity.y + entity.height - entity.velocityY;
    const platformTop = platform.y;

    return (
      entity.velocityY > 0 && // 下方向に移動している
      entityLastBottom <= platformTop && // 前のフレームでは上にいた
      entityBottom >= platformTop && // 現在は下に来ている
      entity.x < platform.x + platform.width &&
      entity.x + entity.width > platform.x
    );
  },

  // 世界境界との衝突チェック
  checkWorldBounds(entity, worldWidth, worldHeight) {
    // 左の境界
    if (entity.x < 0) {
      entity.x = 0;
      entity.velocityX = 0;
    }

    // 右の境界
    if (entity.x + entity.width > worldWidth) {
      entity.x = worldWidth - entity.width;
      entity.velocityX = 0;
    }

    // 上の境界
    if (entity.y < 0) {
      entity.y = 0;
      entity.velocityY = 0;
    }

    // 下の境界（死亡判定）
    if (entity.y > worldHeight) {
      return { fellOffWorld: true };
    }

    return { fellOffWorld: false };
  },

  // 移動可能範囲の制限
  constrainToArea(entity, area) {
    entity.x = Utils.clamp(entity.x, area.x, area.x + area.width - entity.width);
    entity.y = Utils.clamp(entity.y, area.y, area.y + area.height - entity.height);
  },

  // スロープ（斜面）との衝突処理
  resolveSlopeCollision(entity, slope) {
    const relativeX = entity.x + entity.width / 2 - slope.x;
    const slopeHeight = slope.height * (relativeX / slope.width);
    const slopeY = slope.y + slope.height - slopeHeight;

    if (entity.y + entity.height > slopeY) {
      entity.y = slopeY - entity.height;
      entity.velocityY = 0;
      entity.grounded = true;
    }
  },

  // 移動する床との衝突処理
  resolveMovingPlatformCollision(entity, platform) {
    if (this.checkEntityCollision(entity, platform)) {
      // プレイヤーが移動する床の上にいる場合
      if (entity.y + entity.height <= platform.y + 5) {
        entity.x += platform.velocityX;
        entity.y = platform.y - entity.height;
        entity.velocityY = 0;
        entity.grounded = true;
      }
    }
  },
};
