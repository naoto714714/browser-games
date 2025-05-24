// エコー（残響）クラス
class Echo {
    constructor(echoData) {
        // 元のプレイヤー状態を保存
        this.originalX = echoData.x;
        this.originalY = echoData.y;
        this.originalFacing = echoData.facing;
        this.timestamp = echoData.timestamp;

        // 発動条件
        this.delayTime = GAME_CONFIG.SLASH.ECHO_DELAY;
        this.activated = false;
        this.finished = false;

        // エコー斬撃の状態
        this.active = false;
        this.duration = 0.3; // エコー表示時間
        this.timer = 0;

        // 判定領域
        this.x = 0;
        this.y = 0;
        this.radius = GAME_CONFIG.SLASH.RANGE;
        this.startAngle = 0;
        this.endAngle = 0;

        // 視覚効果
        this.alpha = 0;
        this.maxAlpha = 0.4;
        this.glowIntensity = 0;

        // フェードイン/アウト
        this.fadeInDuration = 0.1;
        this.fadeOutDuration = 0.2;
    }

    update(deltaTime) {
        if (this.finished) return;

        const currentTime = performance.now() / 1000;
        const elapsed = currentTime - this.timestamp;

        // 発動時間チェック
        if (!this.activated && elapsed >= this.delayTime) {
            this.activate();
        }

        // アクティブ状態の更新
        if (this.active) {
            this.timer += deltaTime;
            this.updateVisualEffects(deltaTime);

            if (this.timer >= this.duration) {
                this.deactivate();
            }
        }
    }

    activate() {
        this.activated = true;
        this.active = true;
        this.timer = 0;

        // 斬撃判定の設定
        this.setupHitbox();

        // エコー音再生
        audioManager.playSound('echo');
    }

    setupHitbox() {
        // 元の位置に判定を設定
        this.x = this.originalX + GAME_CONFIG.PLAYER.WIDTH / 2 + (this.originalFacing * 30);
        this.y = this.originalY + GAME_CONFIG.PLAYER.HEIGHT / 2;

        // 扇形の角度計算
        const centerAngle = this.originalFacing > 0 ? 0 : Math.PI;
        const halfAngle = Utils.degToRad(GAME_CONFIG.SLASH.ANGLE) / 2;
        this.startAngle = centerAngle - halfAngle;
        this.endAngle = centerAngle + halfAngle;
    }

    updateVisualEffects(deltaTime) {
        const progress = this.timer / this.duration;

        // フェードイン/フェードアウト
        if (progress < this.fadeInDuration / this.duration) {
            // フェードイン
            const fadeProgress = progress / (this.fadeInDuration / this.duration);
            this.alpha = fadeProgress * this.maxAlpha;
            this.glowIntensity = fadeProgress;
        } else if (progress > 1 - (this.fadeOutDuration / this.duration)) {
            // フェードアウト
            const fadeProgress = (1 - progress) / (this.fadeOutDuration / this.duration);
            this.alpha = fadeProgress * this.maxAlpha;
            this.glowIntensity = fadeProgress * 0.5;
        } else {
            // 安定期
            this.alpha = this.maxAlpha;
            this.glowIntensity = 1.0;
        }

        // 波打ち効果
        const waveEffect = Math.sin(progress * Math.PI * 4) * 0.1 + 1.0;
        this.alpha *= waveEffect;
    }

    deactivate() {
        this.active = false;
        this.finished = true;
    }

    // プレイヤーとの当たり判定
    checkPlayerCollision(player) {
        if (!this.active) return false;

        return player.checkEchoCollision(this);
    }

    // 敵との当たり判定
    checkEnemyCollision(enemy) {
        if (!this.active) return false;

        const enemyCenterX = enemy.x + enemy.width / 2;
        const enemyCenterY = enemy.y + enemy.height / 2;

        return Utils.pointInSector(
            enemyCenterX,
            enemyCenterY,
            this.x,
            this.y,
            this.radius,
            this.startAngle,
            this.endAngle
        );
    }

    // 描画
    render(ctx) {
        if (!this.active || this.alpha <= 0) return;

        this.renderGlow(ctx);
        this.renderSlash(ctx);
        this.renderPreview(ctx);
    }

    renderGlow(ctx) {
        // グロー効果
        const glowRadius = this.radius * 1.2;
        const glowAlpha = this.alpha * this.glowIntensity * 0.3;

        if (glowAlpha > 0) {
            Utils.drawGlow(
                ctx,
                this.x,
                this.y,
                glowRadius,
                GAME_CONFIG.COLORS.ECHO,
                glowAlpha
            );
        }
    }

    renderSlash(ctx) {
        const color = Utils.addAlpha(GAME_CONFIG.COLORS.ECHO, this.alpha);

        ctx.save();

        // 扇形のエコー斬撃
        Utils.drawSector(
            ctx,
            this.x,
            this.y,
            this.radius,
            this.startAngle,
            this.endAngle,
            color
        );

        // エコー軌道線
        const trailLength = this.radius * 0.9;
        const startX = this.x + Math.cos(this.startAngle) * trailLength;
        const startY = this.y + Math.sin(this.startAngle) * trailLength;
        const endX = this.x + Math.cos(this.endAngle) * trailLength;
        const endY = this.y + Math.sin(this.endAngle) * trailLength;

        Utils.drawLine(ctx, startX, startY, endX, endY, color, 3);

        // エコー特有の波紋効果
        this.renderWaveEffect(ctx, color);

        ctx.restore();
    }

    renderWaveEffect(ctx, baseColor) {
        const waveCount = 3;
        const maxWaveRadius = this.radius * 1.5;

        for (let i = 0; i < waveCount; i++) {
            const waveProgress = (this.timer + i * 0.1) / this.duration;
            if (waveProgress > 1) continue;

            const waveRadius = waveProgress * maxWaveRadius;
            const waveAlpha = (1 - waveProgress) * this.alpha * 0.3;
            const waveColor = Utils.addAlpha(baseColor, waveAlpha);

            Utils.drawCircle(ctx, this.x, this.y, waveRadius, waveColor, false);
        }
    }

    renderPreview(ctx) {
        // 発動前のプレビュー表示
        if (this.activated) return;

        const currentTime = performance.now() / 1000;
        const elapsed = currentTime - this.timestamp;
        const remaining = this.delayTime - elapsed;

        if (remaining <= 1.0) { // 1秒前からプレビュー表示
            const previewAlpha = 1 - remaining;
            const previewColor = Utils.addAlpha(GAME_CONFIG.COLORS.ECHO, previewAlpha * 0.2);

            // プレビュー位置を計算
            const previewX = this.originalX + GAME_CONFIG.PLAYER.WIDTH / 2 + (this.originalFacing * 30);
            const previewY = this.originalY + GAME_CONFIG.PLAYER.HEIGHT / 2;

            // プレビュー円を描画
            Utils.drawCircle(ctx, previewX, previewY, this.radius * 0.5, previewColor, false);

            // カウントダウン表示
            if (remaining <= 0.5) {
                const countdownAlpha = (0.5 - remaining) / 0.5;
                const countdownColor = Utils.addAlpha(GAME_CONFIG.COLORS.UI_ACCENT, countdownAlpha);

                Utils.drawText(
                    ctx,
                    Math.ceil(remaining).toString(),
                    previewX,
                    previewY - 30,
                    countdownColor,
                    '20px Orbitron',
                    'center'
                );
            }
        }
    }

    // デバッグ用描画
    renderDebug(ctx) {
        if (this.active) {
            // 判定範囲
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle);
            ctx.stroke();

            // 中心点
            Utils.drawCircle(ctx, this.x, this.y, 3, 'cyan');
        }

        // 発動までの時間
        const currentTime = performance.now() / 1000;
        const elapsed = currentTime - this.timestamp;
        const remaining = this.delayTime - elapsed;

        if (!this.activated) {
            Utils.drawText(
                ctx,
                `Echo in: ${remaining.toFixed(1)}s`,
                this.originalX,
                this.originalY - 10,
                'cyan',
                '12px Arial'
            );
        }
    }

    // 状態取得
    isActive() {
        return this.active;
    }

    isFinished() {
        return this.finished;
    }

    getTimeUntilActivation() {
        if (this.activated) return 0;

        const currentTime = performance.now() / 1000;
        const elapsed = currentTime - this.timestamp;
        return Math.max(0, this.delayTime - elapsed);
    }

    getState() {
        return {
            originalX: this.originalX,
            originalY: this.originalY,
            activated: this.activated,
            active: this.active,
            finished: this.finished,
            timeUntilActivation: this.getTimeUntilActivation()
        };
    }
}

// エコーマネージャークラス
class EchoManager {
    constructor() {
        this.echoes = [];
        this.maxEchoes = 8; // 最大同時エコー数
    }

    update(deltaTime) {
        // エコー更新
        for (const echo of this.echoes) {
            echo.update(deltaTime);
        }

        // 完了したエコーを削除
        this.echoes = this.echoes.filter(echo => !echo.isFinished());
    }

    addEcho(echoData) {
        const echo = new Echo(echoData);
        this.echoes.push(echo);

        // 最大数を超えた場合、最も古いエコーを削除
        if (this.echoes.length > this.maxEchoes) {
            this.echoes.shift();
        }

        return echo;
    }

    checkPlayerCollisions(player) {
        const collisions = [];

        for (const echo of this.echoes) {
            if (echo.checkPlayerCollision(player)) {
                collisions.push(echo);
            }
        }

        return collisions;
    }

    checkEnemyCollisions(enemy) {
        const collisions = [];

        for (const echo of this.echoes) {
            if (echo.checkEnemyCollision(enemy)) {
                collisions.push(echo);
            }
        }

        return collisions;
    }

    getAllActiveEchoes() {
        return this.echoes.filter(echo => echo.isActive());
    }

    render(ctx) {
        // エコーを古い順に描画（重なり対応）
        const sortedEchoes = [...this.echoes].sort((a, b) => a.timestamp - b.timestamp);

        for (const echo of sortedEchoes) {
            echo.render(ctx);
        }
    }

    renderDebug(ctx) {
        for (const echo of this.echoes) {
            echo.renderDebug(ctx);
        }

        // エコー数表示
        Utils.drawText(
            ctx,
            `Active Echoes: ${this.echoes.length}`,
            10,
            100,
            'cyan',
            '14px Arial'
        );
    }

    clear() {
        this.echoes = [];
    }

    getState() {
        return {
            count: this.echoes.length,
            activeCount: this.getAllActiveEchoes().length,
            echoes: this.echoes.map(echo => echo.getState())
        };
    }
}

window.Echo = Echo;
window.EchoManager = EchoManager;
