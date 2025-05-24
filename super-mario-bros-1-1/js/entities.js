// 基本エンティティクラス
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.grounded = false;
        this.active = true;
        this.visible = true;
        this.health = 1;
        this.direction = DIRECTION.RIGHT;
        this.spriteKey = '';
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 10;
    }

    // 更新処理
    update(deltaTime) {
        if (!this.active) return;

        this.updateAnimation();
        this.updatePhysics();
    }

    // 物理処理の更新
    updatePhysics() {
        Physics.applyGravity(this);
        Physics.applyFriction(this);
    }

    // アニメーション更新
    updateAnimation() {
        this.animationTimer++;
        if (this.animationTimer >= this.animationSpeed) {
            this.animationFrame++;
            this.animationTimer = 0;
        }
    }

    // 描画処理
    render(ctx, camera) {
        if (!this.visible || !this.active) return;

        const sprite = SpriteLoader.getSprite(this.spriteKey);
        if (sprite) {
            const screenX = this.x - camera.x;
            const screenY = this.y - camera.y;

            ctx.save();

            // 左向きの場合は水平反転
            if (this.direction === DIRECTION.LEFT) {
                ctx.scale(-1, 1);
                ctx.drawImage(sprite, -screenX - this.width, screenY, this.width, this.height);
            } else {
                ctx.drawImage(sprite, screenX, screenY, this.width, this.height);
            }

            ctx.restore();
        }
    }

    // 衝突判定用の矩形を取得
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    // エンティティ破壊
    destroy() {
        this.active = false;
        this.visible = false;
    }

    // ダメージ処理
    takeDamage(amount = 1) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        }
    }

    // エンティティ復活
    revive() {
        this.active = true;
        this.visible = true;
        this.health = 1;
    }

    // 位置設定
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    // 速度設定
    setVelocity(vx, vy) {
        this.velocityX = vx;
        this.velocityY = vy;
    }

    // 中心座標を取得
    getCenterX() {
        return this.x + this.width / 2;
    }

    getCenterY() {
        return this.y + this.height / 2;
    }
}

// ブロックエンティティ
class Block extends Entity {
    constructor(x, y, type, item = null) {
        super(x, y, GAME_CONSTANTS.TILE_SIZE, GAME_CONSTANTS.TILE_SIZE);
        this.type = type;
        this.item = item;
        this.hit = false;
        this.broken = false;
        this.spriteKey = this.getSpriteKey();
        this.originalY = y;
        this.bumpAnimation = 0;
    }

    // ブロックタイプに応じたスプライトキーを取得
    getSpriteKey() {
        switch (this.type) {
            case BLOCK_TYPES.GROUND:
                return 'ground';
            case BLOCK_TYPES.BRICK:
                return 'brick';
            case BLOCK_TYPES.QUESTION:
                return this.hit ? 'brick' : 'question';
            case BLOCK_TYPES.PIPE:
                return 'pipeTop';
            default:
                return 'brick';
        }
    }

    // ブロックが叩かれた時の処理
    onHit(player) {
        if (this.hit) return null;

        this.hit = true;
        this.bumpAnimation = 10; // バンプアニメーション開始

        if (this.type === BLOCK_TYPES.BRICK) {
            if (player.powerState === GAME_CONSTANTS.PLAYER_STATE.SMALL) {
                // 小さいマリオは壊せない
                return null;
            } else {
                // 大きいマリオは壊せる
                this.broken = true;
                this.destroy();
                return { type: 'break', points: 50 };
            }
        } else if (this.type === BLOCK_TYPES.QUESTION) {
            this.spriteKey = 'brick';
            if (this.item) {
                const itemResult = this.spawnItem();
                return itemResult;
            } else {
                // コインを出す
                return { type: 'coin', points: GAME_CONSTANTS.ITEM.COIN.POINTS };
            }
        }

        return null;
    }

    // アイテムを生成
    spawnItem() {
        if (!this.item) return null;

        const item = {
            type: this.item,
            x: this.x,
            y: this.y - GAME_CONSTANTS.TILE_SIZE,
            points: this.getItemPoints()
        };

        return { type: 'item', item: item, points: item.points };
    }

    // アイテムのポイントを取得
    getItemPoints() {
        switch (this.item) {
            case ITEM_TYPES.MUSHROOM:
                return GAME_CONSTANTS.ITEM.MUSHROOM.POINTS;
            case ITEM_TYPES.FIRE_FLOWER:
                return GAME_CONSTANTS.ITEM.FIRE_FLOWER.POINTS;
            case ITEM_TYPES.ONE_UP:
                return 0; // 1UPは得点なし
            default:
                return 0;
        }
    }

    // 更新処理
    update(deltaTime) {
        super.update(deltaTime);

        // バンプアニメーション
        if (this.bumpAnimation > 0) {
            this.bumpAnimation--;
            this.y = this.originalY - Math.sin(this.bumpAnimation * 0.5) * 4;
        } else {
            this.y = this.originalY;
        }
    }

    // 衝突可能かチェック
    isSolid() {
        return !this.broken && this.active;
    }
}

// アイテムエンティティ
class Item extends Entity {
    constructor(x, y, type) {
        const size = GAME_CONSTANTS.ITEM.COIN.WIDTH;
        super(x, y, size, size);
        this.type = type;
        this.spriteKey = this.getSpriteKey();
        this.collected = false;
        this.points = this.getPoints();

        // アイテムタイプに応じた初期設定
        this.setupItemBehavior();
    }

    // アイテムタイプに応じたスプライトキーを取得
    getSpriteKey() {
        switch (this.type) {
            case ITEM_TYPES.COIN:
                return 'coin';
            case ITEM_TYPES.MUSHROOM:
                return 'mushroom';
            case ITEM_TYPES.FIRE_FLOWER:
                return 'fireFlower';
            default:
                return 'coin';
        }
    }

    // アイテムのポイントを取得
    getPoints() {
        switch (this.type) {
            case ITEM_TYPES.COIN:
                return GAME_CONSTANTS.ITEM.COIN.POINTS;
            case ITEM_TYPES.MUSHROOM:
                return GAME_CONSTANTS.ITEM.MUSHROOM.POINTS;
            case ITEM_TYPES.FIRE_FLOWER:
                return GAME_CONSTANTS.ITEM.FIRE_FLOWER.POINTS;
            default:
                return 0;
        }
    }

    // アイテムの動作設定
    setupItemBehavior() {
        switch (this.type) {
            case ITEM_TYPES.COIN:
                this.velocityX = 0;
                this.velocityY = -2; // 上に飛び出す
                break;
            case ITEM_TYPES.MUSHROOM:
                this.velocityX = GAME_CONSTANTS.ITEM.MUSHROOM.SPEED;
                this.direction = DIRECTION.RIGHT;
                break;
            case ITEM_TYPES.FIRE_FLOWER:
                this.velocityX = 0;
                this.velocityY = 0;
                break;
        }
    }

    // 更新処理
    update(deltaTime) {
        if (this.collected) return;

        super.update(deltaTime);

        // アイテムタイプ別の特別な処理
        switch (this.type) {
            case ITEM_TYPES.COIN:
                this.updateCoin();
                break;
            case ITEM_TYPES.MUSHROOM:
                this.updateMushroom();
                break;
        }
    }

    // コインの更新
    updateCoin() {
        // コインは重力の影響を受けない（フワフワ浮く）
        this.y += this.velocityY;
        this.velocityY += 0.1; // 緩やかに落下

        // 一定時間で消える
        this.animationTimer++;
        if (this.animationTimer > 60) { // 1秒
            this.destroy();
        }
    }

    // キノコの更新
    updateMushroom() {
        // 壁にぶつかったら方向転換
        if (this.velocityX > 0) {
            this.direction = DIRECTION.RIGHT;
        } else if (this.velocityX < 0) {
            this.direction = DIRECTION.LEFT;
        }
    }

    // アイテム取得処理
    collect(player) {
        if (this.collected) return null;

        this.collected = true;
        this.destroy();

        return {
            type: this.type,
            points: this.points
        };
    }

    // 方向転換
    changeDirection() {
        this.velocityX = -this.velocityX;
        this.direction = this.velocityX > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
    }
}
