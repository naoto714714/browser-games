// レベル管理クラス
class Level {
  constructor() {
    this.width = GAME_CONSTANTS.LEVEL.WIDTH;
    this.height = GAME_CONSTANTS.LEVEL.HEIGHT;
    this.blocks = [];
    this.enemies = [];
    this.items = [];
    this.spawnedItems = [];
    this.backgroundObjects = [];

    this.generateLevel();
  }

  // レベル生成
  generateLevel() {
    this.createGround();
    this.createPlatforms();
    this.createPipes();
    this.createEnemies();
    this.createQuestionBlocks();
    this.createBricks();
    this.createBackground();
  }

  // 地面を作成
  createGround() {
    const groundHeight = 2; // 2タイル分の高さ
    const groundY =
      GAME_CONSTANTS.LEVEL.HEIGHT - groundHeight * GAME_CONSTANTS.TILE_SIZE;

    // 基本的な地面（0-2816px）
    for (let x = 0; x < 176; x++) {
      for (let y = 0; y < groundHeight; y++) {
        this.blocks.push(
          new Block(
            x * GAME_CONSTANTS.TILE_SIZE,
            groundY + y * GAME_CONSTANTS.TILE_SIZE,
            BLOCK_TYPES.GROUND
          )
        );
      }
    }

    // 穴の作成（2816-2944px）
    // この部分は地面を作らない

    // 穴の後の地面（2944px以降）
    for (let x = 184; x < 384; x++) {
      for (let y = 0; y < groundHeight; y++) {
        this.blocks.push(
          new Block(
            x * GAME_CONSTANTS.TILE_SIZE,
            groundY + y * GAME_CONSTANTS.TILE_SIZE,
            BLOCK_TYPES.GROUND
          )
        );
      }
    }
  }

  // プラットフォームを作成
  createPlatforms() {
    // 最初の小さなプラットフォーム（320-384px）
    for (let x = 20; x <= 23; x++) {
      this.blocks.push(
        new Block(
          x * GAME_CONSTANTS.TILE_SIZE,
          10 * GAME_CONSTANTS.TILE_SIZE,
          BLOCK_TYPES.GROUND
        )
      );
    }

    // 大きなプラットフォーム（2560-2688px）
    for (let x = 160; x <= 165; x++) {
      this.blocks.push(
        new Block(
          x * GAME_CONSTANTS.TILE_SIZE,
          10 * GAME_CONSTANTS.TILE_SIZE,
          BLOCK_TYPES.GROUND
        )
      );
    }

    // 階段状のプラットフォーム（3520px以降）
    const stairPositions = [
      { x: 220, y: 24, width: 2, height: 1 },
      { x: 224, y: 23, width: 2, height: 2 },
      { x: 228, y: 22, width: 2, height: 3 },
      { x: 232, y: 21, width: 2, height: 4 },
      { x: 240, y: 21, width: 2, height: 4 },
      { x: 244, y: 22, width: 2, height: 3 },
      { x: 248, y: 23, width: 2, height: 2 },
      { x: 252, y: 24, width: 2, height: 1 },
    ];

    stairPositions.forEach(stair => {
      for (let x = 0; x < stair.width; x++) {
        for (let y = 0; y < stair.height; y++) {
          this.blocks.push(
            new Block(
              (stair.x + x) * GAME_CONSTANTS.TILE_SIZE,
              (stair.y + y) * GAME_CONSTANTS.TILE_SIZE,
              BLOCK_TYPES.GROUND
            )
          );
        }
      }
    });
  }

  // パイプを作成
  createPipes() {
    const pipes = [
      { x: 28, height: 2 }, // 最初の小さなパイプ
      { x: 38, height: 3 }, // 2番目のパイプ
      { x: 46, height: 4 }, // 3番目のパイプ
      { x: 57, height: 4 }, // 4番目のパイプ（ワープあり）
      { x: 163, height: 2 }, // 後半のパイプ
      { x: 179, height: 2 }, // 最後のパイプ
    ];

    pipes.forEach(pipe => {
      const pipeY =
        GAME_CONSTANTS.LEVEL.HEIGHT -
        32 -
        pipe.height * GAME_CONSTANTS.TILE_SIZE;

      // パイプの本体を作成
      for (let y = 0; y < pipe.height; y++) {
        // パイプは2タイル分の幅
        for (let x = 0; x < 2; x++) {
          this.blocks.push(
            new Block(
              (pipe.x + x) * GAME_CONSTANTS.TILE_SIZE,
              pipeY + y * GAME_CONSTANTS.TILE_SIZE,
              BLOCK_TYPES.PIPE
            )
          );
        }
      }
    });
  }

  // 敵を配置
  createEnemies() {
    const enemyPositions = [
      {
        x: 22 * GAME_CONSTANTS.TILE_SIZE,
        y: 22 * GAME_CONSTANTS.TILE_SIZE,
        type: ENEMY_TYPES.GOOMBA,
      },
      {
        x: 40 * GAME_CONSTANTS.TILE_SIZE,
        y: 22 * GAME_CONSTANTS.TILE_SIZE,
        type: ENEMY_TYPES.GOOMBA,
      },
      {
        x: 53 * GAME_CONSTANTS.TILE_SIZE,
        y: 22 * GAME_CONSTANTS.TILE_SIZE,
        type: ENEMY_TYPES.GOOMBA,
      },
      {
        x: 54 * GAME_CONSTANTS.TILE_SIZE,
        y: 22 * GAME_CONSTANTS.TILE_SIZE,
        type: ENEMY_TYPES.GOOMBA,
      },
      {
        x: 82 * GAME_CONSTANTS.TILE_SIZE,
        y: 22 * GAME_CONSTANTS.TILE_SIZE,
        type: ENEMY_TYPES.GOOMBA,
      },
      {
        x: 99 * GAME_CONSTANTS.TILE_SIZE,
        y: 22 * GAME_CONSTANTS.TILE_SIZE,
        type: ENEMY_TYPES.KOOPA_TROOPA,
      },
      {
        x: 125 * GAME_CONSTANTS.TILE_SIZE,
        y: 22 * GAME_CONSTANTS.TILE_SIZE,
        type: ENEMY_TYPES.GOOMBA,
      },
      {
        x: 142 * GAME_CONSTANTS.TILE_SIZE,
        y: 22 * GAME_CONSTANTS.TILE_SIZE,
        type: ENEMY_TYPES.GOOMBA,
      },
      {
        x: 143 * GAME_CONSTANTS.TILE_SIZE,
        y: 22 * GAME_CONSTANTS.TILE_SIZE,
        type: ENEMY_TYPES.GOOMBA,
      },
      {
        x: 175 * GAME_CONSTANTS.TILE_SIZE,
        y: 22 * GAME_CONSTANTS.TILE_SIZE,
        type: ENEMY_TYPES.GOOMBA,
      },
      {
        x: 176 * GAME_CONSTANTS.TILE_SIZE,
        y: 22 * GAME_CONSTANTS.TILE_SIZE,
        type: ENEMY_TYPES.GOOMBA,
      },
    ];

    enemyPositions.forEach(pos => {
      let enemy;
      if (pos.type === ENEMY_TYPES.GOOMBA) {
        enemy = new Goomba(pos.x, pos.y);
      } else if (pos.type === ENEMY_TYPES.KOOPA_TROOPA) {
        enemy = new KoopaTroopa(pos.x, pos.y);
      }
      if (enemy) {
        this.enemies.push(enemy);
      }
    });
  }

  // ？ブロックを作成
  createQuestionBlocks() {
    const questionBlocks = [
      { x: 16, y: 20, item: ITEM_TYPES.COIN },
      { x: 20, y: 16, item: ITEM_TYPES.MUSHROOM }, // 有名なキノコブロック
      { x: 22, y: 20, item: ITEM_TYPES.COIN },
      { x: 23, y: 16, item: ITEM_TYPES.COIN },
      { x: 78, y: 20, item: ITEM_TYPES.COIN },
      { x: 94, y: 20, item: ITEM_TYPES.COIN },
      { x: 109, y: 16, item: ITEM_TYPES.COIN },
      { x: 109, y: 20, item: ITEM_TYPES.MUSHROOM },
      { x: 112, y: 16, item: ITEM_TYPES.COIN },
      { x: 129, y: 16, item: ITEM_TYPES.COIN },
      { x: 130, y: 20, item: ITEM_TYPES.COIN },
    ];

    questionBlocks.forEach(qBlock => {
      this.blocks.push(
        new Block(
          qBlock.x * GAME_CONSTANTS.TILE_SIZE,
          qBlock.y * GAME_CONSTANTS.TILE_SIZE,
          BLOCK_TYPES.QUESTION,
          qBlock.item
        )
      );
    });
  }

  // レンガブロックを作成
  createBricks() {
    const brickPositions = [
      // 最初のブロック群
      { x: 21, y: 20 },
      { x: 24, y: 20 },
      { x: 25, y: 20 },
      { x: 26, y: 20 },
      { x: 27, y: 20 },
      { x: 21, y: 16 },
      { x: 24, y: 16 },
      { x: 25, y: 16 },
      { x: 26, y: 16 },
      { x: 27, y: 16 },

      // 中間のブロック群
      { x: 80, y: 20 },
      { x: 81, y: 20 },
      { x: 83, y: 20 },
      { x: 84, y: 20 },
      { x: 87, y: 20 },
      { x: 91, y: 20 },
      { x: 92, y: 20 },
      { x: 93, y: 20 },

      // 後半のブロック群
      { x: 101, y: 20 },
      { x: 119, y: 20 },
      { x: 121, y: 20 },
      { x: 122, y: 20 },
      { x: 123, y: 20 },
      { x: 128, y: 20 },
      { x: 131, y: 20 },
      { x: 132, y: 20 },

      // 上層のブロック
      { x: 110, y: 16 },
      { x: 111, y: 16 },
      { x: 113, y: 16 },
      { x: 128, y: 16 },
      { x: 131, y: 16 },
      { x: 132, y: 16 },
      { x: 168, y: 20 },
      { x: 170, y: 20 },
    ];

    brickPositions.forEach(brick => {
      this.blocks.push(
        new Block(
          brick.x * GAME_CONSTANTS.TILE_SIZE,
          brick.y * GAME_CONSTANTS.TILE_SIZE,
          BLOCK_TYPES.BRICK
        )
      );
    });
  }

  // 背景オブジェクトを作成（装飾用）
  createBackground() {
    // 雲の配置
    const cloudPositions = [
      { x: 8, y: 4 },
      { x: 19, y: 4 },
      { x: 27, y: 12 },
      { x: 36, y: 4 },
      { x: 56, y: 4 },
      { x: 72, y: 12 },
      { x: 88, y: 4 },
      { x: 104, y: 4 },
    ];

    // 丘の配置
    const hillPositions = [
      { x: 0, y: 23 },
      { x: 48, y: 23 },
      { x: 96, y: 23 },
      { x: 144, y: 23 },
    ];

    // 茂みの配置
    const bushPositions = [
      { x: 11, y: 25 },
      { x: 41, y: 25 },
      { x: 59, y: 25 },
      { x: 75, y: 25 },
    ];

    // これらは装飾なので当たり判定なし
    cloudPositions.forEach(cloud => {
      this.backgroundObjects.push({
        x: cloud.x * GAME_CONSTANTS.TILE_SIZE,
        y: cloud.y * GAME_CONSTANTS.TILE_SIZE,
        type: 'cloud',
      });
    });

    hillPositions.forEach(hill => {
      this.backgroundObjects.push({
        x: hill.x * GAME_CONSTANTS.TILE_SIZE,
        y: hill.y * GAME_CONSTANTS.TILE_SIZE,
        type: 'hill',
      });
    });

    bushPositions.forEach(bush => {
      this.backgroundObjects.push({
        x: bush.x * GAME_CONSTANTS.TILE_SIZE,
        y: bush.y * GAME_CONSTANTS.TILE_SIZE,
        type: 'bush',
      });
    });
  }

  // アイテムを追加
  addItem(item) {
    this.spawnedItems.push(item);
  }

  // アイテムを削除
  removeItem(item) {
    const index = this.spawnedItems.indexOf(item);
    if (index > -1) {
      this.spawnedItems.splice(index, 1);
    }
  }

  // 指定位置の固体ブロックを取得
  getSolidBlocks() {
    return this.blocks.filter(block => block.isSolid());
  }

  // カメラ範囲内のエンティティを取得
  getEntitiesInRange(cameraX, cameraWidth) {
    const leftBound = cameraX - 100;
    const rightBound = cameraX + cameraWidth + 100;

    return {
      blocks: this.blocks.filter(
        block => block.x + block.width > leftBound && block.x < rightBound
      ),
      enemies: this.enemies.filter(
        enemy =>
          enemy.active &&
          enemy.x + enemy.width > leftBound &&
          enemy.x < rightBound
      ),
      items: this.spawnedItems.filter(
        item =>
          item.active && item.x + item.width > leftBound && item.x < rightBound
      ),
    };
  }

  // レベル全体の更新
  update(deltaTime) {
    // 敵の更新
    this.enemies.forEach(enemy => {
      if (enemy.active) {
        enemy.update(deltaTime);
      }
    });

    // アイテムの更新
    this.spawnedItems.forEach(item => {
      if (item.active) {
        item.update(deltaTime);
      }
    });

    // ブロックの更新（バンプアニメーションなど）
    this.blocks.forEach(block => {
      if (block.active) {
        block.update(deltaTime);
      }
    });

    // 非アクティブなエンティティを削除
    this.enemies = this.enemies.filter(enemy => enemy.active);
    this.spawnedItems = this.spawnedItems.filter(item => item.active);
  }

  // レベル描画
  render(ctx, camera) {
    // 背景色（空色）
    ctx.fillStyle = GAME_CONSTANTS.COLORS.SKY_BLUE;
    ctx.fillRect(
      0,
      0,
      GAME_CONSTANTS.CANVAS_WIDTH,
      GAME_CONSTANTS.CANVAS_HEIGHT
    );

    // 背景オブジェクト（装飾）の描画
    this.backgroundObjects.forEach(obj => {
      const screenX = obj.x - camera.x;
      const screenY = obj.y - camera.y;

      if (
        screenX + GAME_CONSTANTS.TILE_SIZE > 0 &&
        screenX < GAME_CONSTANTS.CANVAS_WIDTH
      ) {
        // TODO: 背景オブジェクトのスプライト描画
        ctx.fillStyle = obj.type === 'cloud' ? 'white' : 'green';
        ctx.fillRect(
          screenX,
          screenY,
          GAME_CONSTANTS.TILE_SIZE * 3,
          GAME_CONSTANTS.TILE_SIZE * 2
        );
      }
    });

    // ブロックの描画
    const visibleBlocks = this.getEntitiesInRange(
      camera.x,
      GAME_CONSTANTS.CANVAS_WIDTH
    ).blocks;
    visibleBlocks.forEach(block => {
      block.render(ctx, camera);
    });

    // 敵の描画
    const visibleEnemies = this.getEntitiesInRange(
      camera.x,
      GAME_CONSTANTS.CANVAS_WIDTH
    ).enemies;
    visibleEnemies.forEach(enemy => {
      enemy.render(ctx, camera);
    });

    // アイテムの描画
    const visibleItems = this.getEntitiesInRange(
      camera.x,
      GAME_CONSTANTS.CANVAS_WIDTH
    ).items;
    visibleItems.forEach(item => {
      item.render(ctx, camera);
    });
  }

  // フラッグポールの位置を取得
  getFlagPolePosition() {
    return {
      x: 198 * GAME_CONSTANTS.TILE_SIZE,
      y: 10 * GAME_CONSTANTS.TILE_SIZE,
    };
  }

  // 城の位置を取得
  getCastlePosition() {
    return {
      x: 202 * GAME_CONSTANTS.TILE_SIZE,
      y: 21 * GAME_CONSTANTS.TILE_SIZE,
    };
  }
}
