// パーティクル効果管理システム

class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;

        // 速度
        this.vx = options.vx || (Math.random() - 0.5) * 4;
        this.vy = options.vy || (Math.random() - 0.5) * 4;

        // 外観
        this.size = options.size || Math.random() * 3 + 1;
        this.color = options.color || '#ffff99';
        this.alpha = options.alpha || 1;

        // ライフタイム
        this.life = options.life || 1;
        this.maxLife = this.life;
        this.decay = options.decay || 0.02;

        // エフェクト設定
        this.type = options.type || 'dot';
        this.glow = options.glow || false;
        this.bounce = options.bounce || false;
        this.gravity = options.gravity || 0;
        this.spin = options.spin || 0;
        this.spinSpeed = options.spinSpeed || 0.1;

        // 軌跡効果
        this.trail = [];
        this.trailLength = options.trailLength || 0;
    }

    update(deltaTime) {
        // 位置更新
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // 重力適用
        if (this.gravity !== 0) {
            this.vy += this.gravity * deltaTime;
        }

        // 境界でのバウンス
        if (this.bounce) {
            if (this.x <= 0 || this.x >= 1600) {
                this.vx *= -0.8;
                this.x = Math.max(0, Math.min(1600, this.x));
            }
            if (this.y <= 0 || this.y >= 900) {
                this.vy *= -0.8;
                this.y = Math.max(0, Math.min(900, this.y));
            }
        }

        // 回転
        this.spin += this.spinSpeed * deltaTime;

        // 軌跡記録
        if (this.trailLength > 0) {
            this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }
        }

        // ライフタイム減少
        this.life -= this.decay * deltaTime;
        this.alpha = Math.max(0, this.life / this.maxLife);

        return this.life > 0;
    }

    draw(ctx) {
        if (this.alpha <= 0) return;

        ctx.save();

        // 軌跡描画
        if (this.trail.length > 0) {
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
                const trailAlpha = (i / this.trail.length) * this.alpha * 0.5;

                ctx.globalAlpha = trailAlpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, this.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.globalAlpha = this.alpha;

        // グロー効果
        if (this.glow) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.size * 2;
        }

        ctx.fillStyle = this.color;

        // パーティクルタイプ別描画
        switch (this.type) {
            case 'dot':
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'star':
                this.drawStar(ctx);
                break;

            case 'spark':
                this.drawSpark(ctx);
                break;

            case 'square':
                ctx.translate(this.x, this.y);
                ctx.rotate(this.spin);
                ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
                break;
        }

        ctx.restore();
    }

    drawStar(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.spin);

        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            const innerAngle = angle + Math.PI / 5;
            const innerX = Math.cos(innerAngle) * this.size * 0.5;
            const innerY = Math.sin(innerAngle) * this.size * 0.5;
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawSpark(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.spin);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size * 0.3;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size);
        ctx.stroke();

        ctx.restore();
    }
}

class ParticleManager {
    constructor() {
        this.particles = [];
        this.effects = new Map();
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (!particle.update(deltaTime)) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }

    addParticle(x, y, options) {
        this.particles.push(new Particle(x, y, options));
    }

    // プリセットエフェクト
    createSlashEffect(x, y, angle, isEcho = false) {
        const color = isEcho ? '#99ffff' : '#66ccff';
        const particleCount = isEcho ? 8 : 12;

        for (let i = 0; i < particleCount; i++) {
            const speed = Math.random() * 200 + 100;
            const spreadAngle = angle + (Math.random() - 0.5) * Math.PI / 3;

            this.addParticle(x, y, {
                vx: Math.cos(spreadAngle) * speed,
                vy: Math.sin(spreadAngle) * speed,
                size: Math.random() * 4 + 2,
                color: color,
                life: Math.random() * 0.5 + 0.3,
                decay: 0.8,
                type: 'spark',
                glow: true,
                spinSpeed: (Math.random() - 0.5) * 10
            });
        }
    }

    createDashEffect(x, y, direction) {
        for (let i = 0; i < 15; i++) {
            const speed = Math.random() * 150 + 50;
            const angle = direction + Math.PI + (Math.random() - 0.5) * Math.PI / 2;

            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                color: '#66ccff',
                life: Math.random() * 0.4 + 0.2,
                decay: 1.2,
                type: 'dot',
                glow: true,
                trailLength: 5
            });
        }
    }

    createEnemyDeathEffect(x, y, color = '#ff6666') {
        // 爆発パーティクル
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = Math.random() * 300 + 100;

            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 5 + 2,
                color: color,
                life: Math.random() * 0.8 + 0.5,
                decay: 0.6,
                type: 'star',
                glow: true,
                gravity: 200,
                bounce: true,
                spinSpeed: (Math.random() - 0.5) * 15
            });
        }

        // 中心部の光
        this.addParticle(x, y, {
            vx: 0,
            vy: 0,
            size: 30,
            color: '#ffffff',
            life: 0.3,
            decay: 2,
            type: 'dot',
            glow: true
        });
    }

    createComboEffect(x, y, comboCount) {
        const colors = ['#ffff99', '#ffaa00', '#ff6600', '#ff0000', '#ff00ff'];
        const colorIndex = Math.min(comboCount - 1, colors.length - 1);
        const color = colors[colorIndex];

        for (let i = 0; i < comboCount * 3; i++) {
            const angle = (Math.PI * 2 * i) / (comboCount * 3);
            const distance = 20 + comboCount * 5;

            this.addParticle(
                x + Math.cos(angle) * distance,
                y + Math.sin(angle) * distance,
                {
                    vx: Math.cos(angle) * 50,
                    vy: Math.sin(angle) * 50,
                    size: Math.random() * 3 + 2,
                    color: color,
                    life: 1,
                    decay: 0.4,
                    type: 'star',
                    glow: true,
                    spinSpeed: 5
                }
            );
        }
    }

    createHitEffect(x, y, color = '#ffff99') {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = Math.random() * 150 + 75;

            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 1,
                color: color,
                life: Math.random() * 0.3 + 0.2,
                decay: 1.5,
                type: 'dot',
                glow: true
            });
        }
    }

    createSpawnEffect(x, y, color = '#ff6666') {
        // リング状のパーティクル
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i) / 16;
            const distance = 30;

            this.addParticle(
                x + Math.cos(angle) * distance,
                y + Math.sin(angle) * distance,
                {
                    vx: Math.cos(angle) * 100,
                    vy: Math.sin(angle) * 100,
                    size: Math.random() * 3 + 2,
                    color: color,
                    life: 0.8,
                    decay: 0.5,
                    type: 'square',
                    glow: true,
                    spinSpeed: 8
                }
            );
        }
    }

    createEchoPreviewEffect(x, y) {
        // エコープレビュー用のサブトルな効果
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 20 + 10;

            this.addParticle(
                x + Math.cos(angle) * distance,
                y + Math.sin(angle) * distance,
                {
                    vx: 0,
                    vy: 0,
                    size: Math.random() * 2 + 1,
                    color: '#99ffff',
                    life: 1.5,
                    decay: 0.2,
                    type: 'dot',
                    glow: true,
                    alpha: 0.3
                }
            );
        }
    }

    clear() {
        this.particles = [];
    }

    getParticleCount() {
        return this.particles.length;
    }
}

export { Particle, ParticleManager };
