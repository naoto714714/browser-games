// ========== Game State Management ==========
class GameState {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isPlaying = false;
        this.isPaused = false;
        this.gameStarted = false;

        // Game stats
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.multiplier = 1;
        this.multiplierTimer = 0;

        // Game objects
        this.paddle = null;
        this.ball = null;
        this.blocks = [];
        this.powerUps = [];
        this.particles = [];

        // Input handling
        this.keys = {};
        this.mouseX = 0;

        this.initializeGame();
        this.bindEvents();
    }

    initializeGame() {
        // Initialize particle effects first
        this.particleSystem = new ParticleSystem(this.canvas.width, this.canvas.height);

        // Initialize game objects
        this.paddle = new Paddle(this.canvas.width / 2 - 50, this.canvas.height - 40, 100, 15);
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height - 60, 8);
        this.createBlocks();

        // Start animation loop after all objects are initialized
        this.gameLoop();
    }

    bindEvents() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.isPlaying && this.gameStarted) {
                    this.launchBall();
                }
            }
            if (e.code === 'KeyP') {
                this.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse events for paddle control
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
        });

        // Button events
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
    }

    startGame() {
        this.gameStarted = true;
        this.hideOverlay();
        this.resetGame();
    }

    resetGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.multiplier = 1;
        this.multiplierTimer = 0;
        this.isPlaying = false;

        this.paddle.reset(this.canvas.width / 2 - 50, this.canvas.height - 40);
        this.ball.reset(this.canvas.width / 2, this.canvas.height - 60);
        this.powerUps = [];
        this.particles = [];

        this.createBlocks();
        this.updateUI();
    }

    restartGame() {
        this.gameStarted = true;
        this.hideOverlay();
        this.resetGame();
    }

    launchBall() {
        if (!this.isPlaying && this.gameStarted) {
            this.ball.launch(this.level);
            this.isPlaying = true;
        }
    }

    togglePause() {
        if (this.gameStarted && this.isPlaying) {
            this.isPaused = !this.isPaused;
        }
    }

    createBlocks() {
        this.blocks = [];
        const rows = 6 + Math.floor(this.level / 3);
        const cols = 10;
        const blockWidth = 70;
        const blockHeight = 25;
        const padding = 5;
        const offsetX = (this.canvas.width - (cols * (blockWidth + padding) - padding)) / 2;
        const offsetY = 50;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = offsetX + col * (blockWidth + padding);
                const y = offsetY + row * (blockHeight + padding);

                // Create different types of blocks
                let type = 'normal';
                let hits = 1;

                // Special block probability increases with level
                const specialChance = Math.min(0.3, 0.1 + (this.level - 1) * 0.02);

                if (Math.random() < specialChance) {
                    const types = ['explosive', 'multiball', 'paddle', 'score'];
                    type = types[Math.floor(Math.random() * types.length)];
                } else if (row < 2) {
                    // Top rows are stronger
                    hits = 2;
                }

                this.blocks.push(new Block(x, y, blockWidth, blockHeight, type, hits));
            }
        }
    }

    update() {
        if (!this.gameStarted || this.isPaused || !this.isPlaying) return;

        // Update multiplier timer
        if (this.multiplierTimer > 0) {
            this.multiplierTimer--;
            if (this.multiplierTimer <= 0) {
                this.multiplier = Math.max(1, this.multiplier - 1);
                this.updateUI();
            }
        }

        // Update paddle
        this.paddle.update(this.keys, this.mouseX, this.canvas.width);

        // Update ball
        this.ball.update();

        // Ball collision with walls
        if (this.ball.x <= this.ball.radius || this.ball.x >= this.canvas.width - this.ball.radius) {
            this.ball.dx = -this.ball.dx;
            this.createImpactParticles(this.ball.x, this.ball.y);
        }

        if (this.ball.y <= this.ball.radius) {
            this.ball.dy = -this.ball.dy;
            this.createImpactParticles(this.ball.x, this.ball.y);
        }

        // Ball collision with paddle
        if (this.checkPaddleCollision()) {
            this.handlePaddleCollision();
        }

        // Ball collision with blocks
        this.checkBlockCollisions();

        // Ball fell off screen
        if (this.ball.y > this.canvas.height) {
            this.loseLife();
        }

        // Update power-ups
        this.updatePowerUps();

        // Update particles
        if (this.particleSystem) {
            this.particleSystem.update();
        }

        // Check win condition
        if (this.blocks.length === 0) {
            this.nextLevel();
        }
    }

    checkPaddleCollision() {
        return this.ball.x >= this.paddle.x &&
               this.ball.x <= this.paddle.x + this.paddle.width &&
               this.ball.y + this.ball.radius >= this.paddle.y &&
               this.ball.y - this.ball.radius <= this.paddle.y + this.paddle.height &&
               this.ball.dy > 0;
    }

    handlePaddleCollision() {
        const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
        const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degree angle

        const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
        this.ball.dx = speed * Math.sin(angle);
        this.ball.dy = -Math.abs(speed * Math.cos(angle));

        this.createImpactParticles(this.ball.x, this.ball.y);
    }

    checkBlockCollisions() {
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];

            if (this.ball.x + this.ball.radius >= block.x &&
                this.ball.x - this.ball.radius <= block.x + block.width &&
                this.ball.y + this.ball.radius >= block.y &&
                this.ball.y - this.ball.radius <= block.y + block.height) {

                this.handleBlockCollision(block, i);
                break;
            }
        }
    }

    handleBlockCollision(block, index) {
        // Determine collision side
        const ballCenterX = this.ball.x;
        const ballCenterY = this.ball.y;
        const blockCenterX = block.x + block.width / 2;
        const blockCenterY = block.y + block.height / 2;

        const dx = ballCenterX - blockCenterX;
        const dy = ballCenterY - blockCenterY;

        if (Math.abs(dx / block.width) > Math.abs(dy / block.height)) {
            this.ball.dx = -this.ball.dx;
        } else {
            this.ball.dy = -this.ball.dy;
        }

        // Damage block
        block.hit();

        if (block.isDestroyed()) {
            // Create destruction effects
            this.createBlockDestructionEffect(block);

            // Handle special block effects
            this.handleSpecialBlock(block);

            // Update score
            const points = block.getPoints() * this.multiplier;
            this.score += points;

            // Increase multiplier
            this.multiplier = Math.min(5, this.multiplier + 1);
            this.multiplierTimer = 180; // 3 seconds at 60fps

            // Remove block
            this.blocks.splice(index, 1);

            this.updateUI();
        }
    }

    handleSpecialBlock(block) {
        switch (block.type) {
            case 'explosive':
                this.createExplosion(block.x + block.width / 2, block.y + block.height / 2);
                break;
            case 'multiball':
                this.createMultiBall();
                break;
            case 'paddle':
                this.expandPaddle();
                break;
            case 'score':
                this.score += 500 * this.multiplier;
                this.updateUI();
                break;
        }
    }

    createExplosion(x, y) {
        // Remove nearby blocks
        const explosionRadius = 80;
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            const distance = Math.sqrt(
                Math.pow(x - (block.x + block.width / 2), 2) +
                Math.pow(y - (block.y + block.height / 2), 2)
            );

            if (distance <= explosionRadius) {
                this.createBlockDestructionEffect(block);
                this.score += block.getPoints() * this.multiplier;
                this.blocks.splice(i, 1);
            }
        }

        // Create explosion particle effect
        if (this.particleSystem) {
            this.particleSystem.createExplosion(x, y);
        }
        this.updateUI();
    }

    createMultiBall() {
        // より劇的なマルチボール効果でスピードアップ
        this.ball.dx *= 1.4;  // 1.2から1.4に増加
        this.ball.dy *= 1.4;  // 1.2から1.4に増加

        // 一時的にボールサイズを小さくして視覚的により速く見せる
        const originalRadius = this.ball.radius;
        this.ball.radius *= 0.8;

        // 5秒後に元のサイズに戻す
        setTimeout(() => {
            this.ball.radius = originalRadius;
        }, 5000);
    }

    expandPaddle() {
        this.paddle.width = Math.min(150, this.paddle.width + 20);
        setTimeout(() => {
            this.paddle.width = Math.max(80, this.paddle.width - 20);
        }, 10000);
    }

    createBlockDestructionEffect(block) {
        if (this.particleSystem) {
            this.particleSystem.createBlockDestruction(
                block.x + block.width / 2,
                block.y + block.height / 2,
                block.color
            );
        }
    }

    createImpactParticles(x, y) {
        if (this.particleSystem) {
            this.particleSystem.createImpact(x, y);
        }
    }

    updatePowerUps() {
        // Power-up system would be expanded here
    }

    loseLife() {
        this.lives--;
        this.multiplier = 1;
        this.multiplierTimer = 0;

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.isPlaying = false;
            this.ball.reset(this.canvas.width / 2, this.canvas.height - 60);
            this.paddle.reset(this.canvas.width / 2 - 50, this.canvas.height - 40);
        }

        this.updateUI();
    }

    nextLevel() {
        this.level++;
        this.isPlaying = false;
        this.ball.reset(this.canvas.width / 2, this.canvas.height - 60);
        this.paddle.reset(this.canvas.width / 2 - 50, this.canvas.height - 40);
        this.createBlocks();
        this.updateUI();

        // Level completion bonus
        this.score += 1000 * this.level;
        this.updateUI();
    }

    gameOver() {
        this.isPlaying = false;
        this.gameStarted = false;
        this.showOverlay('GAME OVER', `最終スコア: ${this.score.toLocaleString()}`, true);
    }

    updateUI() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('multiplier').textContent = `×${this.multiplier}`;
    }

    showOverlay(title, text, showRestart = false) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayText').textContent = text;
        document.getElementById('startButton').style.display = showRestart ? 'none' : 'inline-block';
        document.getElementById('restartButton').style.display = showRestart ? 'inline-block' : 'none';
        document.getElementById('gameOverlay').style.display = 'flex';
    }

    hideOverlay() {
        document.getElementById('gameOverlay').style.display = 'none';
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render game objects
        this.paddle.render(this.ctx);
        this.ball.render(this.ctx);

        this.blocks.forEach(block => block.render(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));

        // Render particle effects
        if (this.particleSystem) {
            this.particleSystem.render(this.ctx);
        }

        // Render pause indicator
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
            this.ctx.font = '48px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// ========== Game Objects ==========
class Paddle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 10;
        this.originalWidth = width;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.width = this.originalWidth;
    }

    update(keys, mouseX, canvasWidth) {
        // Keyboard control
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.x = Math.max(0, this.x - this.speed);
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.x = Math.min(canvasWidth - this.width, this.x + this.speed);
        }

        // Mouse control (overrides keyboard)
        if (mouseX > 0) {
            this.x = Math.max(0, Math.min(canvasWidth - this.width, mouseX - this.width / 2));
        }
    }

    render(ctx) {
        // Paddle gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.5, '#0080ff');
        gradient.addColorStop(1, '#004080');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Paddle glow effect
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = 0;
        this.dy = 0;
        this.baseSpeed = 8;  // 基本スピードを6から8に増加
        this.speed = this.baseSpeed;
        this.originalX = x;
        this.originalY = y;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.dx = 0;
        this.dy = 0;
    }

    launch(level = 1) {
        // レベルに応じてスピードを上げる（最大1.5倍）
        const levelMultiplier = Math.min(1.5, 1 + (level - 1) * 0.05);
        this.speed = this.baseSpeed * levelMultiplier;

        // 横方向の初期速度も少し上げる
        this.dx = (Math.random() - 0.5) * 6;  // 4から6に増加
        this.dy = -this.speed;
    }

    update() {
        if (this.dx !== 0 || this.dy !== 0) {
            this.x += this.dx;
            this.y += this.dy;
        }
    }

    render(ctx) {
        // Ball gradient
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.7, '#00ffff');
        gradient.addColorStop(1, '#0080ff');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ball glow effect
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

class Block {
    constructor(x, y, width, height, type = 'normal', hits = 1) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.maxHits = hits;
        this.hits = hits;
        this.color = this.getColor();
    }

    getColor() {
        const colors = {
            normal: ['#ff4080', '#ff6060'],
            explosive: ['#ff8000', '#ff4000'],
            multiball: ['#8000ff', '#4000ff'],
            paddle: ['#00ff80', '#00ff40'],
            score: ['#ffff00', '#ffcc00']
        };

        const colorPair = colors[this.type] || colors.normal;
        return this.hits === this.maxHits ? colorPair[0] : colorPair[1];
    }

    hit() {
        this.hits--;
        this.color = this.getColor();
    }

    isDestroyed() {
        return this.hits <= 0;
    }

    getPoints() {
        const basePoints = {
            normal: 100,
            explosive: 200,
            multiball: 300,
            paddle: 150,
            score: 500
        };

        return (basePoints[this.type] || 100) * this.maxHits;
    }

    render(ctx) {
        // Block gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.adjustColor(this.color, -0.3));

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Block border
        ctx.strokeStyle = this.adjustColor(this.color, 0.3);
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Special block indicators
        if (this.type !== 'normal') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '12px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(this.getTypeSymbol(), this.x + this.width / 2, this.y + this.height / 2 + 4);
        }

        // Hit indicator
        if (this.maxHits > 1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 10px Orbitron';
            ctx.textAlign = 'right';
            ctx.fillText(this.hits, this.x + this.width - 5, this.y + 12);
        }
    }

    getTypeSymbol() {
        const symbols = {
            explosive: '💥',
            multiball: '⚡',
            paddle: '🎯',
            score: '⭐'
        };
        return symbols[this.type] || '';
    }

    adjustColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) * (1 + factor)));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) * (1 + factor)));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) * (1 + factor)));

        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new GameState();
});
