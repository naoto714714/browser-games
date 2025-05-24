// プレイヤークラス
class Player extends Entity {
    constructor(x, y) {
        super(x, y, GAME_CONSTANTS.PLAYER.WIDTH, GAME_CONSTANTS.PLAYER.HEIGHT);

        // プレイヤーの状態
        this.powerState = GAME_CONSTANTS.PLAYER_STATE.SMALL;
        this.invincible = false;
        this.invincibilityTimer = 0;
        this.lives = 3;
        this.coins = 0;
        this.score = 0;

        // 移動関連
        this.walkSpeed = GAME_CONSTANTS.PLAYER.WALK_SPEED;
        this.runSpeed = GAME_CONSTANTS.PLAYER.RUN_SPEED;
        this.jumpPower = GAME_CONSTANTS.PLAYER.JUMP_POWER;
        this.maxSpeed = GAME_CONSTANTS.PLAYER.MAX_SPEED;
        this.running = false;
        this.jumping = false;
        this.onGround = false;

        // アニメーション
        this.currentSprite = 'marioSmallStanding';
        this.walkAnimationTimer = 0;
        this.facingDirection = DIRECTION.RIGHT;

        // 入力状態
        this.inputLeft = false;
        this.inputRight = false;
        this.inputJump = false;
        this.inputRun = false;

        // その他
        this.startX = x;
        this.startY = y;
        this.canJump = true;
        this.coyoteTime = 0; // コヨーテタイム（地面から離れた直後でもジャンプ可能）
        this.jumpBufferTime = 0; // ジャンプバッファ（ジャンプボタンを早押ししても有効）
    }

    // プレイヤーの更新処理
    update(deltaTime) {
        if (!this.active) return;

        this.handleInput();
        this.updateMovement();
        this.updateAnimation();
        this.updateInvincibility();
        this.updateTimers();

        // 物理演算は別途 Game クラスで処理
    }

    // 入力処理
    handleInput() {
        // 水平方向の移動
        if (this.inputLeft && !this.inputRight) {
            this.moveLeft();
        } else if (this.inputRight && !this.inputLeft) {
            this.moveRight();
        } else {
            this.stopHorizontalMovement();
        }

        // ジャンプ
        if (this.inputJump) {
            this.jump();
        }
    }

    // 左移動
    moveLeft() {
        this.facingDirection = DIRECTION.LEFT;
        const speed = this.inputRun ? this.runSpeed : this.walkSpeed;
        this.velocityX = Math.max(this.velocityX - 0.5, -speed);
        this.running = this.inputRun && Math.abs(this.velocityX) > this.walkSpeed;
    }

    // 右移動
    moveRight() {
        this.facingDirection = DIRECTION.RIGHT;
        const speed = this.inputRun ? this.runSpeed : this.walkSpeed;
        this.velocityX = Math.min(this.velocityX + 0.5, speed);
        this.running = this.inputRun && Math.abs(this.velocityX) > this.walkSpeed;
    }

    // 水平移動停止
    stopHorizontalMovement() {
        this.velocityX *= 0.8; // 摩擦
        if (Math.abs(this.velocityX) < 0.1) {
            this.velocityX = 0;
        }
        this.running = false;
    }

    // ジャンプ
    jump() {
        if (this.canJump && (this.grounded || this.coyoteTime > 0)) {
            this.velocityY = -this.jumpPower;
            this.grounded = false;
            this.jumping = true;
            this.canJump = false;
            this.coyoteTime = 0;

            // TODO: ジャンプ音を再生
            return true;
        } else if (!this.grounded) {
            // ジャンプバッファ
            this.jumpBufferTime = 10;
        }
        return false;
    }

    // 移動処理の更新
    updateMovement() {
        // コヨーテタイム（地面から離れた直後でもジャンプ可能）
        if (!this.grounded && this.coyoteTime > 0) {
            this.coyoteTime--;
        }

        // ジャンプバッファ（ジャンプボタンを早押ししても有効）
        if (this.jumpBufferTime > 0) {
            this.jumpBufferTime--;
            if (this.grounded) {
                this.jump();
            }
        }

        // 着地処理
        if (this.grounded && this.jumping) {
            this.jumping = false;
            this.canJump = true;
        }

        // 地面から離れた時のコヨーテタイム設定
        if (!this.grounded && !this.jumping && this.coyoteTime === 0) {
            this.coyoteTime = 5;
        }
    }

    // アニメーション更新
    updateAnimation() {
        let newSprite = this.currentSprite;

        // パワーアップ状態に応じたベーススプライト名
        const baseName = this.powerState === GAME_CONSTANTS.PLAYER_STATE.SMALL ? 'marioSmall' : 'marioBig';

        if (!this.grounded) {
            // ジャンプ中
            newSprite = baseName + 'Jumping';
        } else if (Math.abs(this.velocityX) > 0.1) {
            // 歩行・走行中
            this.walkAnimationTimer++;
            const animationSpeed = this.running ? 8 : 12;

            if (this.walkAnimationTimer >= animationSpeed) {
                this.walkAnimationTimer = 0;
                const walkFrame = Math.floor(this.animationFrame / 2) % 2;
                newSprite = baseName + (walkFrame === 0 ? 'Walking' : 'Standing');
            }
        } else {
            // 立ち状態
            newSprite = baseName + 'Standing';
        }

        this.currentSprite = newSprite;
        this.spriteKey = newSprite;
        this.direction = this.facingDirection;
    }

    // 無敵時間の更新
    updateInvincibility() {
        if (this.invincible) {
            this.invincibilityTimer--;
            if (this.invincibilityTimer <= 0) {
                this.invincible = false;
                this.visible = true;
            } else {
                // 点滅効果
                this.visible = Math.floor(this.invincibilityTimer / 5) % 2 === 0;
            }
        }
    }

    // タイマー更新
    updateTimers() {
        if (this.jumpBufferTime > 0) {
            this.jumpBufferTime--;
        }
        if (this.coyoteTime > 0) {
            this.coyoteTime--;
        }
    }

    // ダメージを受ける
    takeDamage() {
        if (this.invincible) return false;

        if (this.powerState === GAME_CONSTANTS.PLAYER_STATE.SMALL) {
            // 小さいマリオは死亡
            this.die();
            return true;
        } else {
            // パワーダウン
            this.powerDown();
            return false;
        }
    }

    // パワーダウン
    powerDown() {
        this.powerState = GAME_CONSTANTS.PLAYER_STATE.SMALL;
        this.height = GAME_CONSTANTS.PLAYER.HEIGHT;
        this.y += GAME_CONSTANTS.PLAYER.HEIGHT; // サイズ変更に伴う位置調整
        this.setInvincible(GAME_CONSTANTS.PLAYER.INVINCIBILITY_TIME);
    }

    // パワーアップ
    powerUp(itemType) {
        switch (itemType) {
            case ITEM_TYPES.MUSHROOM:
                if (this.powerState === GAME_CONSTANTS.PLAYER_STATE.SMALL) {
                    this.powerState = GAME_CONSTANTS.PLAYER_STATE.BIG;
                    this.height = GAME_CONSTANTS.PLAYER.HEIGHT * 2;
                    this.y -= GAME_CONSTANTS.PLAYER.HEIGHT;
                }
                break;
            case ITEM_TYPES.FIRE_FLOWER:
                this.powerState = GAME_CONSTANTS.PLAYER_STATE.FIRE;
                if (this.height === GAME_CONSTANTS.PLAYER.HEIGHT) {
                    this.height = GAME_CONSTANTS.PLAYER.HEIGHT * 2;
                    this.y -= GAME_CONSTANTS.PLAYER.HEIGHT;
                }
                break;
        }
    }

    // 無敵状態設定
    setInvincible(duration) {
        this.invincible = true;
        this.invincibilityTimer = duration;
    }

    // 死亡処理
    die() {
        this.lives--;
        this.setInvincible(60); // 1秒間無敵

        if (this.lives <= 0) {
            return { gameOver: true };
        } else {
            this.respawn();
            return { gameOver: false };
        }
    }

    // リスポーン
    respawn() {
        this.x = this.startX;
        this.y = this.startY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.powerState = GAME_CONSTANTS.PLAYER_STATE.SMALL;
        this.height = GAME_CONSTANTS.PLAYER.HEIGHT;
        this.grounded = false;
        this.jumping = false;
        this.setInvincible(GAME_CONSTANTS.PLAYER.INVINCIBILITY_TIME);
    }

    // コイン取得
    collectCoin() {
        this.coins++;
        if (this.coins >= 100) {
            this.coins -= 100;
            this.lives++;
            return { extraLife: true };
        }
        return { extraLife: false };
    }

    // スコア加算
    addScore(points) {
        this.score += points;
    }

    // 入力状態設定
    setInput(left, right, jump, run) {
        this.inputLeft = left;
        this.inputRight = right;
        this.inputJump = jump;
        this.inputRun = run;
    }

    // プレイヤーが小さいかチェック
    isSmall() {
        return this.powerState === GAME_CONSTANTS.PLAYER_STATE.SMALL;
    }

    // プレイヤーが大きいかチェック
    isBig() {
        return this.powerState !== GAME_CONSTANTS.PLAYER_STATE.SMALL;
    }

    // ファイアマリオかチェック
    isFireMario() {
        return this.powerState === GAME_CONSTANTS.PLAYER_STATE.FIRE;
    }

    // デバッグ用：位置リセット
    resetPosition() {
        this.x = this.startX;
        this.y = this.startY;
        this.velocityX = 0;
        this.velocityY = 0;
    }
}
