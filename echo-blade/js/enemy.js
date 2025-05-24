// 基底敵クラス
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.health = 1;
        this.maxHealth = 1;
        this.alive = true;

        // 物理プロパティ
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 2;
        this.gravity = GAME_CONFIG.GRAVITY;
        this.onGround = false;

        // AI状態
        this.state = 'idle';
        this.target = null;
        this.actionTimer = 0;

        // 視覚効果
        this.flashTimer = 0;
        this.deathTimer = 0;
        this.deathDuration = 0.5;

        // 報酬
        this.scoreValue = 100;
        this.timeBonus = 0;

        // タイプ
        this.type = 'enemy';
        this.color = GAME_CONFIG.COLORS.ENEMY;
    }

    update(deltaTime, player) {
        if (!this.alive) {
            this.updateDeath(deltaTime);
            return;
        }

        this.updateAI(deltaTime, player);
        this.updatePhysics(deltaTime);
        this.updateEffects(deltaTime);
    }

    updateAI(deltaTime, player) {
        // 基本AIは単純な追跡
        this.target = player;

        if (this.target && this.target.alive) {
            const dx = this.target.getCenterX() - this.getCenterX();
            const distance = Math.abs(dx);

            if (distance > 10) {
                this.velocityX = Math.sign(dx) * this.speed;
            } else {
                this.velocityX = 0;
            }
        }
    }

    updatePhysics(deltaTime) {
        // 重力適用
        if (!this.onGround) {
            this.velocityY += this.gravity;
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
    }

    updateEffects(deltaTime) {
        if (this.flashTimer > 0) {
            this.flashTimer -= deltaTime;
        }
    }

    updateDeath(deltaTime) {
        this.deathTimer += deltaTime;
        return this.deathTimer >= this.deathDuration;
    }

    takeDamage(amount, source = 'unknown') {
        if (!this.alive) return false;

        this.health -= amount;
        this.flashTimer = 0.1;

        if (this.health <= 0) {
            this.die();
            return true;
        }

        return false;
    }

    die() {
        this.alive = false;
        this.velocityX = 0;
        this.velocityY = 0;
        audioManager.playSound('enemyDeath');
    }

    render(ctx) {
        if (this.alive) {
            this.renderAlive(ctx);
        } else {
            this.renderDeath(ctx);
        }
    }

    renderAlive(ctx) {
        let color = this.color;

        // フラッシュ効果
        if (this.flashTimer > 0) {
            color = '#ffffff';
        }

        Utils.drawRect(ctx, this.x, this.y, this.width, this.height, color);
    }

    renderDeath(ctx) {
        const alpha = 1 - (this.deathTimer / this.deathDuration);
        const color = Utils.addAlpha(this.color, alpha);

        // 死亡エフェクト
        const scale = 1 + (this.deathTimer / this.deathDuration) * 0.5;
        const scaledWidth = this.width * scale;
        const scaledHeight = this.height * scale;
        const offsetX = (scaledWidth - this.width) / 2;
        const offsetY = (scaledHeight - this.height) / 2;

        Utils.drawRect(
            ctx,
            this.x - offsetX,
            this.y - offsetY,
            scaledWidth,
            scaledHeight,
            color
        );
    }

    getCenterX() {
        return this.x + this.width / 2;
    }

    getCenterY() {
        return this.y + this.height / 2;
    }

    isDeathFinished() {
        return !this.alive && this.deathTimer >= this.deathDuration;
    }

    getState() {
        return {
            x: this.x,
            y: this.y,
            health: this.health,
            alive: this.alive,
            type: this.type
        };
    }
}

// グリント（雑魚敵）
class Glint extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.width = 25;
        this.height = 25;
        this.health = 1;
        this.maxHealth = 1;
        this.speed = Utils.random(1.5, 3);
        this.scoreValue = 100;
        this.type = 'glint';
        this.color = GAME_CONFIG.COLORS.ENEMY;

        // グリント特有のプロパティ
        this.aggroRange = 200;
        this.jumpCooldown = 0;
        this.jumpChance = 0.1; // 10%の確率でジャンプ
    }

    updateAI(deltaTime, player) {
        this.target = player;
        this.jumpCooldown -= deltaTime;

        if (this.target && this.target.alive) {
            const dx = this.target.getCenterX() - this.getCenterX();
            const dy = this.target.getCenterY() - this.getCenterY();
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 射程内の場合
            if (distance <= this.aggroRange) {
                // 水平移動
                if (Math.abs(dx) > 10) {
                    this.velocityX = Math.sign(dx) * this.speed;
                } else {
                    this.velocityX = 0;
                }

                // ランダムジャンプ
                if (this.onGround && this.jumpCooldown <= 0 && Math.random() < this.jumpChance) {
                    this.velocityY = -8;
                    this.onGround = false;
                    this.jumpCooldown = 2.0;
                }
            } else {
                this.velocityX *= 0.9; // 減速
            }
        }
    }

    renderAlive(ctx) {
        let color = this.color;

        if (this.flashTimer > 0) {
            color = '#ffffff';
        }

        // シンプルな敵の描画
        Utils.drawRect(ctx, this.x, this.y, this.width, this.height, color);

        // 目を描画
        const eyeSize = 3;
        const eyeOffsetX = this.width * 0.2;
        const eyeOffsetY = this.height * 0.3;

        Utils.drawCircle(ctx, this.x + eyeOffsetX, this.y + eyeOffsetY, eyeSize, '#ffffff');
        Utils.drawCircle(ctx, this.x + this.width - eyeOffsetX, this.y + eyeOffsetY, eyeSize, '#ffffff');
    }
}

// クラッシュシェード（盾持ち）
class CrashShade extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.width = 35;
        this.height = 40;
        this.health = 3;
        this.maxHealth = 3;
        this.speed = 1;
        this.scoreValue = 300;
        this.type = 'crashshade';
        this.color = GAME_CONFIG.COLORS.ENEMY_ALT;

        // 盾システム
        this.shieldActive = true;
        this.shieldDirection = 1; // 1: 右向き, -1: 左向き
        this.turnSpeed = 2; // ターン速度（秒）
        this.turnTimer = 0;
    }

    updateAI(deltaTime, player) {
        this.target = player;
        this.turnTimer += deltaTime;

        if (this.target && this.target.alive) {
            const dx = this.target.getCenterX() - this.getCenterX();

            // プレイヤーの方向に向く（ゆっくり）
            if (this.turnTimer >= this.turnSpeed) {
                this.shieldDirection = Math.sign(dx);
                this.turnTimer = 0;
            }

            // 近づく
            if (Math.abs(dx) > 50) {
                this.velocityX = Math.sign(dx) * this.speed;
            } else {
                this.velocityX = 0;
            }
        }
    }

    takeDamage(amount, source = 'slash') {
        if (!this.alive) return false;

        // 盾の方向からの攻撃は無効
        if (this.shieldActive && source === 'slash') {
            const dx = (source.x || 0) - this.getCenterX();
            const attackDirection = Math.sign(dx);

            if (attackDirection === this.shieldDirection) {
                // 盾で防御
                this.flashTimer = 0.05; // 短いフラッシュ
                return false;
            }
        }

        // 背後からの攻撃は有効
        return super.takeDamage(amount, source);
    }

    renderAlive(ctx) {
        let color = this.color;

        if (this.flashTimer > 0) {
            color = '#ffffff';
        }

        // 本体
        Utils.drawRect(ctx, this.x, this.y, this.width, this.height, color);

        // 盾の描画
        if (this.shieldActive) {
            const shieldWidth = 8;
            const shieldHeight = this.height * 0.8;
            const shieldX = this.shieldDirection > 0 ?
                this.x + this.width :
                this.x - shieldWidth;
            const shieldY = this.y + (this.height - shieldHeight) / 2;

            Utils.drawRect(ctx, shieldX, shieldY, shieldWidth, shieldHeight, '#888888');
        }

        // 方向インジケーター
        const centerX = this.getCenterX();
        const centerY = this.getCenterY();
        const arrowSize = 10;
        const arrowX = centerX + this.shieldDirection * arrowSize;

        Utils.drawLine(ctx, centerX, centerY, arrowX, centerY, '#ffffff', 2);
    }
}

// タイムイーター（ボス）
class TimeEater extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.width = 80;
        this.height = 100;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 0.5;
        this.scoreValue = 5000;
        this.type = 'timeeater';
        this.color = '#8A2BE2'; // 特別な紫色

        // ボス特有のプロパティ
        this.phase = 1;
        this.attackTimer = 0;
        this.attackCooldown = 3.0;
        this.phaseTransitionHealth = 50;

        // 攻撃パターン
        this.attacks = ['floorAttack', 'projectile', 'echoAbsorb'];
        this.currentAttackIndex = 0;

        // エフェクト
        this.chargeEffect = 0;
        this.absorbEffect = 0;
    }

    updateAI(deltaTime, player) {
        this.target = player;
        this.attackTimer += deltaTime;

        // フェーズチェック
        if (this.health <= this.phaseTransitionHealth && this.phase === 1) {
            this.enterPhase2();
        }

        // 基本移動
        if (this.target && this.target.alive) {
            const dx = this.target.getCenterX() - this.getCenterX();

            if (Math.abs(dx) > 100) {
                this.velocityX = Math.sign(dx) * this.speed;
            } else {
                this.velocityX = 0;
            }
        }

        // 攻撃実行
        if (this.attackTimer >= this.attackCooldown) {
            this.executeAttack();
            this.attackTimer = 0;
        }

        // エフェクト更新
        this.updateEffects(deltaTime);
    }

    enterPhase2() {
        this.phase = 2;
        this.speed *= 1.5;
        this.attackCooldown *= 0.7;
        this.color = '#FF4500'; // オレンジ色に変化

        // フェーズ移行エフェクト
        audioManager.playSound('bossStart');
    }

    executeAttack() {
        const attack = this.attacks[this.currentAttackIndex];
        this.currentAttackIndex = (this.currentAttackIndex + 1) % this.attacks.length;

        switch (attack) {
            case 'floorAttack':
                this.floorAttack();
                break;
            case 'projectile':
                this.projectileAttack();
                break;
            case 'echoAbsorb':
                this.echoAbsorbAttack();
                break;
        }
    }

    floorAttack() {
        // 床全体への攻撃（実装は簡略化）
        this.chargeEffect = 1.0;

        // プレイヤーにダメージ判定
        if (this.target && this.target.onGround) {
            this.target.takeDamage(20, 'boss');
        }
    }

    projectileAttack() {
        // 弾幕攻撃（実装は簡略化）
        this.chargeEffect = 0.8;

        // 複数の弾を発射（実際の実装では弾オブジェクトを作成）
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                // 弾の発射エフェクト
                audioManager.playSound('hit');
            }, i * 200);
        }
    }

    echoAbsorbAttack() {
        // エコー吸収攻撃
        this.absorbEffect = 1.0;

        // 近くのエコーを無効化（ゲームクラスで処理）
        if (window.game && window.game.echoManager) {
            const echoes = window.game.echoManager.getAllActiveEchoes();
            echoes.forEach(echo => {
                const distance = Utils.distance(
                    this.getCenterX(), this.getCenterY(),
                    echo.x, echo.y
                );

                if (distance <= 200) {
                    echo.deactivate();
                }
            });
        }
    }

    updateEffects(deltaTime) {
        super.updateEffects(deltaTime);

        if (this.chargeEffect > 0) {
            this.chargeEffect -= deltaTime * 2;
            this.chargeEffect = Math.max(0, this.chargeEffect);
        }

        if (this.absorbEffect > 0) {
            this.absorbEffect -= deltaTime * 1.5;
            this.absorbEffect = Math.max(0, this.absorbEffect);
        }
    }

    die() {
        super.die();
        audioManager.playSound('bossDeath');

        // ボス撃破の特別処理
        if (window.game) {
            window.game.onBossDefeated();
        }
    }

    renderAlive(ctx) {
        let color = this.color;

        if (this.flashTimer > 0) {
            color = '#ffffff';
        }

        // ボスの本体
        Utils.drawRect(ctx, this.x, this.y, this.width, this.height, color);

        // チャージエフェクト
        if (this.chargeEffect > 0) {
            const glowSize = this.chargeEffect * 50;
            Utils.drawGlow(ctx, this.getCenterX(), this.getCenterY(), glowSize, color, this.chargeEffect);
        }

        // 吸収エフェクト
        if (this.absorbEffect > 0) {
            const ringRadius = (1 - this.absorbEffect) * 100;
            const ringColor = Utils.addAlpha('#8A2BE2', this.absorbEffect);
            Utils.drawCircle(ctx, this.getCenterX(), this.getCenterY(), ringRadius, ringColor, false);
        }

        // ヘルスバー
        this.renderHealthBar(ctx);
    }

    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 8;
        const barX = this.x;
        const barY = this.y - 15;

        // 背景
        Utils.drawRect(ctx, barX, barY, barWidth, barHeight, '#333333');

        // ヘルス
        const healthPercent = this.health / this.maxHealth;
        const healthWidth = barWidth * healthPercent;
        const healthColor = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';

        Utils.drawRect(ctx, barX, barY, healthWidth, barHeight, healthColor);

        // 枠
        Utils.drawRect(ctx, barX, barY, barWidth, barHeight, '#ffffff', false);
    }
}

// 敵スポーンマネージャー
class EnemyManager {
    constructor() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = GAME_CONFIG.ENEMY.SPAWN_INTERVAL;
        this.maxEnemies = GAME_CONFIG.ENEMY.MAX_CONCURRENT;
        this.waveNumber = 1;
        this.bossSpawned = false;
    }

    update(deltaTime, player) {
        // 敵の更新
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, player);
        }

        // 死亡した敵の削除
        this.enemies = this.enemies.filter(enemy => !enemy.isDeathFinished());

        // 敵のスポーン
        this.updateSpawning(deltaTime);
    }

    updateSpawning(deltaTime) {
        this.spawnTimer += deltaTime;

        if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
            if (!this.bossSpawned && this.shouldSpawnBoss()) {
                this.spawnBoss();
            } else {
                this.spawnRandomEnemy();
            }
            this.spawnTimer = 0;
        }
    }

    shouldSpawnBoss() {
        // ゲーム時間やウェーブ数に基づいてボス出現判定
        return window.game && window.game.gameTimer > 60; // 60秒後
    }

    spawnRandomEnemy() {
        const spawnX = Math.random() < 0.5 ? -50 : GAME_CONFIG.CANVAS_WIDTH + 50;
        const spawnY = GAME_CONFIG.FLOOR_Y - 50;

        const enemyTypes = [Glint, CrashShade];
        const weights = [0.7, 0.3]; // 70% グリント, 30% クラッシュシェード

        const EnemyClass = this.weightedChoice(enemyTypes, weights);
        const enemy = new EnemyClass(spawnX, spawnY);

        this.enemies.push(enemy);
    }

    spawnBoss() {
        const spawnX = GAME_CONFIG.CANVAS_WIDTH / 2 - 40;
        const spawnY = GAME_CONFIG.FLOOR_Y - 100;

        const boss = new TimeEater(spawnX, spawnY);
        this.enemies.push(boss);
        this.bossSpawned = true;

        audioManager.playSound('bossStart');
    }

    weightedChoice(choices, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < choices.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return choices[i];
            }
        }

        return choices[0];
    }

    getEnemiesInRange(x, y, radius) {
        return this.enemies.filter(enemy => {
            if (!enemy.alive) return false;

            const distance = Utils.distance(x, y, enemy.getCenterX(), enemy.getCenterY());
            return distance <= radius;
        });
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
        }
    }

    render(ctx) {
        for (const enemy of this.enemies) {
            enemy.render(ctx);
        }
    }

    renderDebug(ctx) {
        Utils.drawText(
            ctx,
            `Enemies: ${this.enemies.length}`,
            10,
            120,
            'white',
            '14px Arial'
        );

        Utils.drawText(
            ctx,
            `Wave: ${this.waveNumber}`,
            10,
            140,
            'white',
            '14px Arial'
        );
    }

    clear() {
        this.enemies = [];
        this.bossSpawned = false;
    }

    hasBoss() {
        return this.enemies.some(enemy => enemy.type === 'timeeater' && enemy.alive);
    }

    getBoss() {
        return this.enemies.find(enemy => enemy.type === 'timeeater' && enemy.alive);
    }

    getState() {
        return {
            enemyCount: this.enemies.length,
            aliveCount: this.enemies.filter(e => e.alive).length,
            waveNumber: this.waveNumber,
            bossSpawned: this.bossSpawned,
            hasBoss: this.hasBoss()
        };
    }
}

window.Enemy = Enemy;
window.Glint = Glint;
window.CrashShade = CrashShade;
window.TimeEater = TimeEater;
window.EnemyManager = EnemyManager;
