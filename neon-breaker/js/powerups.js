// ========== Power-up System ==========
class PowerUpManager {
    constructor() {
        this.activePowerUps = [];
        this.fallingPowerUps = [];
    }

    createPowerUp(x, y, type) {
        this.fallingPowerUps.push(new PowerUp(x, y, type));
    }

    update(paddle, ball, gameState) {
        // Update falling power-ups
        this.fallingPowerUps = this.fallingPowerUps.filter(powerUp => {
            powerUp.update();

            // Check collision with paddle
            if (this.checkPaddleCollision(powerUp, paddle)) {
                this.activatePowerUp(powerUp.type, gameState);
                return false; // Remove from falling list
            }

            // Remove if off screen
            return powerUp.y < 700;
        });

        // Update active power-ups (duration countdown)
        this.activePowerUps = this.activePowerUps.filter(powerUp => {
            powerUp.duration--;
            if (powerUp.duration <= 0) {
                this.deactivatePowerUp(powerUp, gameState);
                return false;
            }
            return true;
        });
    }

    checkPaddleCollision(powerUp, paddle) {
        return powerUp.x + powerUp.width >= paddle.x &&
               powerUp.x <= paddle.x + paddle.width &&
               powerUp.y + powerUp.height >= paddle.y &&
               powerUp.y <= paddle.y + paddle.height;
    }

    activatePowerUp(type, gameState) {
        switch (type) {
            case 'bigPaddle':
                this.activateBigPaddle(gameState);
                break;
            case 'slowBall':
                this.activateSlowBall(gameState);
                break;
            case 'extraLife':
                this.activateExtraLife(gameState);
                break;
            case 'multiScore':
                this.activateMultiScore(gameState);
                break;
            case 'shield':
                this.activateShield(gameState);
                break;
        }
    }

    activateBigPaddle(gameState) {
        gameState.paddle.width = Math.min(200, gameState.paddle.width * 1.5);
        this.activePowerUps.push({
            type: 'bigPaddle',
            duration: 600, // 10 seconds at 60fps
            originalWidth: gameState.paddle.originalWidth
        });
    }

    activateSlowBall(gameState) {
        gameState.ball.dx *= 0.7;
        gameState.ball.dy *= 0.7;
        this.activePowerUps.push({
            type: 'slowBall',
            duration: 480, // 8 seconds
            originalSpeed: gameState.ball.speed
        });
    }

    activateExtraLife(gameState) {
        gameState.lives++;
        gameState.updateUI();
        // No duration - instant effect
    }

    activateMultiScore(gameState) {
        gameState.scoreMultiplier = (gameState.scoreMultiplier || 1) * 2;
        this.activePowerUps.push({
            type: 'multiScore',
            duration: 900 // 15 seconds
        });
    }

    activateShield(gameState) {
        gameState.hasShield = true;
        this.activePowerUps.push({
            type: 'shield',
            duration: 1200 // 20 seconds
        });
    }

    deactivatePowerUp(powerUp, gameState) {
        switch (powerUp.type) {
            case 'bigPaddle':
                gameState.paddle.width = powerUp.originalWidth;
                break;
            case 'slowBall':
                // Restore original ball speed
                const currentSpeed = Math.sqrt(gameState.ball.dx * gameState.ball.dx + gameState.ball.dy * gameState.ball.dy);
                const speedRatio = powerUp.originalSpeed / currentSpeed;
                gameState.ball.dx *= speedRatio;
                gameState.ball.dy *= speedRatio;
                break;
            case 'multiScore':
                gameState.scoreMultiplier = Math.max(1, (gameState.scoreMultiplier || 1) / 2);
                break;
            case 'shield':
                gameState.hasShield = false;
                break;
        }
    }

    render(ctx) {
        // Render falling power-ups
        this.fallingPowerUps.forEach(powerUp => powerUp.render(ctx));

        // Render active power-up indicators
        this.renderActivePowerUps(ctx);
    }

    renderActivePowerUps(ctx) {
        const y = 10;
        let x = 10;

        this.activePowerUps.forEach(powerUp => {
            const timeLeft = Math.ceil(powerUp.duration / 60);

            // Power-up icon background
            ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
            ctx.fillRect(x, y, 60, 25);

            // Power-up border
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, 60, 25);

            // Power-up text
            ctx.fillStyle = '#00ffff';
            ctx.font = '10px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(this.getPowerUpSymbol(powerUp.type), x + 15, y + 16);
            ctx.fillText(timeLeft + 's', x + 45, y + 16);

            x += 70;
        });
    }

    getPowerUpSymbol(type) {
        const symbols = {
            bigPaddle: '📏',
            slowBall: '🐌',
            extraLife: '❤️',
            multiScore: '⭐',
            shield: '🛡️'
        };
        return symbols[type] || '?';
    }
}

// ========== Power-up Item Class ==========
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 20;
        this.type = type;
        this.vy = 2;
        this.rotation = 0;
        this.rotationSpeed = 0.05;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.color = this.getColor();
    }

    getColor() {
        const colors = {
            bigPaddle: '#00ff80',
            slowBall: '#8080ff',
            extraLife: '#ff4080',
            multiScore: '#ffff00',
            shield: '#ff8000'
        };
        return colors[this.type] || '#ffffff';
    }

    update() {
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.pulsePhase += 0.1;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        // Pulsing effect
        const pulse = 0.8 + 0.2 * Math.sin(this.pulsePhase);
        ctx.scale(pulse, pulse);

        // Power-up background
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Power-up border
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Power-up symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(this.getSymbol(), 0, 5);

        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }

    getSymbol() {
        const symbols = {
            bigPaddle: '📏',
            slowBall: '🐌',
            extraLife: '❤️',
            multiScore: '⭐',
            shield: '🛡️'
        };
        return symbols[this.type] || '?';
    }
}

// ========== Enhanced Effects ==========
class ShieldEffect {
    constructor(paddle) {
        this.paddle = paddle;
        this.rotation = 0;
        this.opacity = 0.6;
        this.pulsePhase = 0;
    }

    update() {
        this.rotation += 0.02;
        this.pulsePhase += 0.1;
        this.opacity = 0.4 + 0.2 * Math.sin(this.pulsePhase);
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.paddle.x + this.paddle.width / 2, this.paddle.y);
        ctx.rotate(this.rotation);

        // Shield barrier
        const shieldWidth = this.paddle.width + 20;
        const shieldHeight = 40;

        // Shield gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shieldWidth / 2);
        gradient.addColorStop(0, 'rgba(255, 128, 0, 0.3)');
        gradient.addColorStop(0.7, 'rgba(255, 128, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 128, 0, 0.1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(-shieldWidth / 2, -shieldHeight / 2, shieldWidth, shieldHeight);

        // Shield border
        ctx.strokeStyle = '#ff8000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-shieldWidth / 2, -shieldHeight / 2, shieldWidth, shieldHeight);

        ctx.restore();
    }
}

// Random power-up generation helper
function getRandomPowerUpType() {
    const types = ['bigPaddle', 'slowBall', 'extraLife', 'multiScore', 'shield'];
    return types[Math.floor(Math.random() * types.length)];
}
