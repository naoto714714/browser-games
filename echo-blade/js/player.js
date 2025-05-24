// プレイヤークラス
class Player {
    constructor(x, y) {
        // 基本プロパティ
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.PLAYER.WIDTH;
        this.height = GAME_CONFIG.PLAYER.HEIGHT;

        // 物理プロパティ
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = GAME_CONFIG.PLAYER.SPEED;
        this.jumpForce = GAME_CONFIG.PLAYER.JUMP_FORCE;
        this.onGround = false;
        this.gravity = GAME_CONFIG.GRAVITY;

        // 状態管理
        this.health = 100;
        this.maxHealth = 100;
        this.alive = true;
        this.facing = 1; // 1: 右, -1: 左

        // アクション状態
        this.slashing = false;
        this.slashCooldown = 0;
        this.slashDuration = 0.2; // 斬撃アニメーション時間
        this.slashTimer = 0;

        this.dashing = false;
        this.dashCooldown = 0;
        this.dashDuration = GAME_CONFIG.PLAYER.DASH_DURATION;
        this.dashTimer = 0;
        this.dashDistance = GAME_CONFIG.PLAYER.DASH_DISTANCE;
        this.dashDirection = 0;

        // 無敵時間
        this.invincible = false;
        this.invincibilityTimer = 0;
        this.invincibilityDuration = GAME_CONFIG.PLAYER.INVINCIBLE_FRAMES / 60; // フレーム→秒

        // 視覚効果
        this.flashTimer = 0;
        this.trailPositions = [];
        this.maxTrailLength = 10;

        // 斬撃判定
        this.slashHitbox = {
            x: 0,
            y: 0,
            radius: GAME_CONFIG.SLASH.RANGE,
            startAngle: 0,
            endAngle: 0,
            active: false
        };

        // アニメーション
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.bobOffset = 0;
    }

    update(deltaTime) {
        this.handleInput(deltaTime);
        this.updatePhysics(deltaTime);
        this.updateActions(deltaTime);
        this.updateAnimation(deltaTime);
        this.updateEffects(deltaTime);
        this.updateHitbox();
    }

    handleInput(deltaTime) {
        if (!this.alive) return;

        const movement = inputManager.getMovementInput();

        // 移動入力
        if (!this.dashing) {
            this.velocityX = movement.horizontal * this.speed;
            if (movement.horizontal !== 0) {
                this.facing = movement.horizontal > 0 ? 1 : -1;
            }
        }

        // ジャンプ
        if (movement.jump && this.onGround && !this.dashing) {
            this.velocityY = -this.jumpForce;
            this.onGround = false;
            audioManager.playSound('jump');
        }

        // 斬撃
        if (inputManager.isActionPressed('slash') && this.slashCooldown <= 0 && !this.dashing) {
            this.performSlash();
        }

        // ダッシュ
        if (inputManager.isActionPressed('dash') && this.dashCooldown <= 0 && !this.slashing) {
            this.performDash();
        }
    }

    updatePhysics(deltaTime) {
        // 重力適用
        if (!this.onGround && !this.dashing) {
            this.velocityY += this.gravity;
        }

        // ダッシュ中の特別な移動
        if (this.dashing) {
            this.velocityX = this.dashDirection * (this.dashDistance / this.dashDuration);
            this.velocityY = 0; // ダッシュ中は重力無効
        }

        // 位置更新
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        // 画面境界チェック
        this.x = Utils.clamp(this.x, 0, GAME_CONFIG.CANVAS_WIDTH - this.width);

        // 地面判定
        if (this.y >= GAME_CONFIG.FLOOR_Y - this.height) {
            this.y = GAME_CONFIG.FLOOR_Y - this.height;
            this.velocityY = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }

        // 軌跡追加
        this.addTrailPosition();
    }

    updateActions(deltaTime) {
        // 斬撃クールダウン
        if (this.slashCooldown > 0) {
            this.slashCooldown -= deltaTime;
        }

        // 斬撃アニメーション
        if (this.slashing) {
            this.slashTimer -= deltaTime;
            if (this.slashTimer <= 0) {
                this.slashing = false;
                this.slashHitbox.active = false;
            }
        }

        // ダッシュクールダウン
        if (this.dashCooldown > 0) {
            this.dashCooldown -= deltaTime;
        }

        // ダッシュアニメーション
        if (this.dashing) {
            this.dashTimer -= deltaTime;
            if (this.dashTimer <= 0) {
                this.dashing = false;
                this.invincible = false;
            }
        }

        // 無敵時間
        if (this.invincible && !this.dashing) {
            this.invincibilityTimer -= deltaTime;
            if (this.invincibilityTimer <= 0) {
                this.invincible = false;
            }
        }
    }

    updateAnimation(deltaTime) {
        this.animationFrame += this.animationSpeed * deltaTime * 60;

        // ボブ効果（待機時の上下動）
        if (this.onGround && Math.abs(this.velocityX) < 0.1) {
            this.bobOffset = Math.sin(this.animationFrame * 0.1) * 2;
        } else {
            this.bobOffset = 0;
        }
    }

    updateEffects(deltaTime) {
        // フラッシュ効果
        if (this.flashTimer > 0) {
            this.flashTimer -= deltaTime;
        }
    }

    updateHitbox() {
        if (this.slashing && this.slashHitbox.active) {
            // 斬撃判定の中心座標
            this.slashHitbox.x = this.x + this.width / 2 + (this.facing * 30);
            this.slashHitbox.y = this.y + this.height / 2;

            // 扇形の角度計算
            const centerAngle = this.facing > 0 ? 0 : Math.PI;
            const halfAngle = Utils.degToRad(GAME_CONFIG.SLASH.ANGLE) / 2;
            this.slashHitbox.startAngle = centerAngle - halfAngle;
            this.slashHitbox.endAngle = centerAngle + halfAngle;
        }
    }

    performSlash() {
        this.slashing = true;
        this.slashTimer = this.slashDuration;
        this.slashCooldown = GAME_CONFIG.SLASH.COOLDOWN;
        this.slashHitbox.active = true;

        audioManager.playSound('slash');

        // エコー登録（ゲームクラスで処理）
        window.game?.registerEcho({
            x: this.x,
            y: this.y,
            facing: this.facing,
            timestamp: performance.now() / 1000
        });
    }

    performDash() {
        this.dashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldown = 1.0; // 1秒のクールダウン
        this.dashDirection = this.facing;
        this.invincible = true; // ダッシュ中は無敵

        audioManager.playSound('dash');
    }

    takeDamage(amount, source = 'unknown') {
        if (this.invincible || !this.alive) return false;

        this.health -= amount;
        this.flashTimer = 0.2;

        // 無敵時間設定
        this.invincible = true;
        this.invincibilityTimer = this.invincibilityDuration;

        audioManager.playSound('hit');

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }

        return true;
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    die() {
        this.alive = false;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    addTrailPosition() {
        this.trailPositions.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            timestamp: performance.now()
        });

        // 古いポジションを削除
        const now = performance.now();
        this.trailPositions = this.trailPositions.filter(
            pos => now - pos.timestamp < 200 // 200ms
        );

        if (this.trailPositions.length > this.maxTrailLength) {
            this.trailPositions.shift();
        }
    }

    // 敵との当たり判定
    checkEnemyCollision(enemy) {
        if (this.invincible || !this.alive) return false;

        return Utils.circleCollision(
            this.x + this.width / 2,
            this.y + this.height / 2,
            Math.min(this.width, this.height) / 2,
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            Math.min(enemy.width, enemy.height) / 2
        );
    }

    // 斬撃判定
    checkSlashHit(target) {
        if (!this.slashing || !this.slashHitbox.active) return false;

        const targetCenterX = target.x + target.width / 2;
        const targetCenterY = target.y + target.height / 2;

        return Utils.pointInSector(
            targetCenterX,
            targetCenterY,
            this.slashHitbox.x,
            this.slashHitbox.y,
            this.slashHitbox.radius,
            this.slashHitbox.startAngle,
            this.slashHitbox.endAngle
        );
    }

    // エコーとの当たり判定
    checkEchoCollision(echo) {
        if (this.invincible || !this.alive) return false;

        // ダッシュ中はエコーをすり抜ける
        if (this.dashing) return false;

        const targetCenterX = this.x + this.width / 2;
        const targetCenterY = this.y + this.height / 2;

        return Utils.pointInSector(
            targetCenterX,
            targetCenterY,
            echo.x,
            echo.y,
            echo.radius,
            echo.startAngle,
            echo.endAngle
        );
    }

    // 描画
    render(ctx) {
        if (!this.alive) return;

        this.renderTrail(ctx);
        this.renderBody(ctx);
        this.renderSlash(ctx);
        this.renderEffects(ctx);
    }

    renderTrail(ctx) {
        if (this.trailPositions.length < 2) return;

        const now = performance.now();

        for (let i = 0; i < this.trailPositions.length - 1; i++) {
            const pos = this.trailPositions[i];
            const alpha = 1 - (now - pos.timestamp) / 200;

            if (alpha <= 0) continue;

            const size = alpha * 8;
            const color = Utils.addAlpha(GAME_CONFIG.COLORS.PLAYER, alpha * 0.3);

            Utils.drawCircle(ctx, pos.x, pos.y, size, color);
        }
    }

    renderBody(ctx) {
        const renderX = this.x;
        const renderY = this.y + this.bobOffset;

        // 点滅効果
        if (this.invincible && !this.dashing) {
            const blinkRate = 10; // Hz
            const blinkCycle = Math.sin(performance.now() * 0.001 * blinkRate * Math.PI * 2);
            if (blinkCycle < 0) return;
        }

        // フラッシュ効果
        let color = GAME_CONFIG.COLORS.PLAYER;
        if (this.flashTimer > 0) {
            const flashIntensity = this.flashTimer / 0.2;
            color = Utils.addAlpha('#ffffff', flashIntensity);
        }

        // メインボディ
        if (this.dashing) {
            // ダッシュ中は残像効果
            for (let i = 0; i < 3; i++) {
                const offsetX = -this.dashDirection * i * 15;
                const alpha = (3 - i) / 3 * 0.5;
                const dashColor = Utils.addAlpha(color, alpha);

                Utils.drawRect(ctx, renderX + offsetX, renderY, this.width, this.height, dashColor);
            }
        } else {
            Utils.drawRect(ctx, renderX, renderY, this.width, this.height, color);
        }

        // プレイヤーの詳細（シンプルな描画）
        ctx.save();
        ctx.fillStyle = color;

        // 胴体
        ctx.fillRect(renderX + 5, renderY + 15, this.width - 10, this.height - 25);

        // 頭
        Utils.drawCircle(ctx, renderX + this.width / 2, renderY + 10, 8, color);

        // 剣（向きに応じて描画）
        const swordX = renderX + this.width / 2 + (this.facing * 15);
        const swordY = renderY + 20;
        const swordEndX = swordX + (this.facing * 20);
        const swordEndY = swordY - 10;

        Utils.drawLine(ctx, swordX, swordY, swordEndX, swordEndY, color, 3);

        ctx.restore();
    }

    renderSlash(ctx) {
        if (!this.slashing || !this.slashHitbox.active) return;

        const progress = 1 - (this.slashTimer / this.slashDuration);
        const alpha = Math.sin(progress * Math.PI) * 0.6;
        const color = Utils.addAlpha(GAME_CONFIG.COLORS.PLAYER, alpha);

        // エフェクト描画
        ctx.save();
        ctx.globalAlpha = alpha;

        // 扇形の斬撃エフェクト
        Utils.drawSector(
            ctx,
            this.slashHitbox.x,
            this.slashHitbox.y,
            this.slashHitbox.radius,
            this.slashHitbox.startAngle,
            this.slashHitbox.endAngle,
            color
        );

        // 斬撃軌道
        const trailLength = this.slashHitbox.radius * 0.8;
        const midAngle = (this.slashHitbox.startAngle + this.slashHitbox.endAngle) / 2;
        const startX = this.slashHitbox.x + Math.cos(this.slashHitbox.startAngle) * trailLength;
        const startY = this.slashHitbox.y + Math.sin(this.slashHitbox.startAngle) * trailLength;
        const endX = this.slashHitbox.x + Math.cos(this.slashHitbox.endAngle) * trailLength;
        const endY = this.slashHitbox.y + Math.sin(this.slashHitbox.endAngle) * trailLength;

        Utils.drawLine(ctx, startX, startY, endX, endY, color, 4);

        ctx.restore();
    }

    renderEffects(ctx) {
        // グロー効果
        if (this.dashing) {
            Utils.drawGlow(ctx, this.x + this.width / 2, this.y + this.height / 2, 50, GAME_CONFIG.COLORS.PLAYER, 0.8);
        }
    }

    // デバッグ用描画
    renderDebug(ctx) {
        // 当たり判定
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // 斬撃判定
        if (this.slashing && this.slashHitbox.active) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.slashHitbox.x, this.slashHitbox.y);
            ctx.arc(
                this.slashHitbox.x,
                this.slashHitbox.y,
                this.slashHitbox.radius,
                this.slashHitbox.startAngle,
                this.slashHitbox.endAngle
            );
            ctx.stroke();
        }

        // 状態表示
        Utils.drawText(ctx, `Health: ${this.health}`, this.x, this.y - 30, 'white', '14px Arial');
        Utils.drawText(ctx, `Pos: ${Math.round(this.x)}, ${Math.round(this.y)}`, this.x, this.y - 15, 'white', '12px Arial');
    }

    // ゲッター
    getCenterX() {
        return this.x + this.width / 2;
    }

    getCenterY() {
        return this.y + this.height / 2;
    }

    getState() {
        return {
            x: this.x,
            y: this.y,
            health: this.health,
            alive: this.alive,
            slashing: this.slashing,
            dashing: this.dashing,
            facing: this.facing,
            onGround: this.onGround
        };
    }
}

window.Player = Player;
