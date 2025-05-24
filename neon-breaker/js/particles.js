// ========== Particle System ==========
class ParticleSystem {
    constructor(canvasWidth = 800, canvasHeight = 600) {
        this.particles = [];
        this.backgroundParticles = [];
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.createBackgroundParticles();
    }

    createBackgroundParticles() {
        // Create floating background particles for atmosphere
        for (let i = 0; i < 20; i++) {
            this.backgroundParticles.push(new BackgroundParticle(this.canvasWidth, this.canvasHeight));
        }
    }

    createExplosion(x, y) {
        // Create multiple particles for explosion effect
        for (let i = 0; i < 15; i++) {
            this.particles.push(new ExplosionParticle(x, y));
        }
    }

    createBlockDestruction(x, y, color) {
        // Create particles when block is destroyed
        for (let i = 0; i < 8; i++) {
            this.particles.push(new BlockParticle(x, y, color));
        }
    }

    createImpact(x, y) {
        // Create small impact particles
        for (let i = 0; i < 5; i++) {
            this.particles.push(new ImpactParticle(x, y));
        }
    }

    update() {
        // Update and remove dead particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.isAlive();
        });

        // Update background particles
        this.backgroundParticles.forEach(particle => particle.update());
    }

    render(ctx) {
        // Render background particles
        this.backgroundParticles.forEach(particle => particle.render(ctx));

        // Render effect particles
        this.particles.forEach(particle => particle.render(ctx));
    }
}

// ========== Particle Classes ==========
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = 2;
        this.color = '#00ffff';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    isAlive() {
        return this.life > 0;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ExplosionParticle extends Particle {
    constructor(x, y) {
        super(x, y);

        // Random explosion direction
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = 3 + Math.random() * 4;
        this.decay = 0.015 + Math.random() * 0.01;

        // Explosion colors
        const colors = ['#ff4000', '#ff8000', '#ffff00', '#ff0080'];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        // Add gravity effect
        this.gravity = 0.1;
    }

    update() {
        super.update();
        this.vy += this.gravity;
        this.vx *= 0.98; // Air resistance
        this.vy *= 0.98;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;

        // Create glowing effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class BlockParticle extends Particle {
    constructor(x, y, blockColor) {
        super(x, y);

        // Random direction with upward bias
        const angle = -Math.PI/2 + (Math.random() - 0.5) * Math.PI;
        const speed = 1 + Math.random() * 3;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = 1 + Math.random() * 3;
        this.decay = 0.02 + Math.random() * 0.01;
        this.color = blockColor;
        this.gravity = 0.15;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        super.update();
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Create small square particle
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);

        ctx.restore();
    }
}

class ImpactParticle extends Particle {
    constructor(x, y) {
        super(x, y);

        // Small burst pattern
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = 1 + Math.random() * 2;
        this.decay = 0.05;
        this.color = '#ffffff';
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;

        // Create sparkle effect
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 5;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class BackgroundParticle {
    constructor(canvasWidth = 800, canvasHeight = 600) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.reset();
        this.y = Math.random() * this.canvasHeight; // Start at random height initially
    }

    reset() {
        this.x = Math.random() * this.canvasWidth;
        this.y = this.canvasHeight + 10;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -0.2 - Math.random() * 0.8;
        this.size = 0.5 + Math.random() * 1.5;
        this.opacity = 0.1 + Math.random() * 0.3;
        this.twinkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.02 + Math.random() * 0.03;

        // Different colors for variety
        const colors = ['#00ffff', '#0080ff', '#8000ff', '#ff0080'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.twinkle += this.twinkleSpeed;

        // Reset when particle goes off screen
        if (this.y < -10 || this.x < -10 || this.x > this.canvasWidth + 10) {
            this.reset();
        }
    }

    render(ctx) {
        ctx.save();

        // Twinkling effect
        const alpha = this.opacity * (0.5 + 0.5 * Math.sin(this.twinkle));
        ctx.globalAlpha = alpha;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ========== Trail Effect ==========
class TrailParticle extends Particle {
    constructor(x, y, color = '#00ffff') {
        super(x, y);
        this.color = color;
        this.size = 1 + Math.random() * 2;
        this.decay = 0.08;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * 0.6;

        ctx.shadowColor = this.color;
        ctx.shadowBlur = 3;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Add trail effect to ball (can be called from game.js)
function createBallTrail(x, y, particles) {
    if (Math.random() < 0.3) { // Only create trail sometimes for performance
        particles.push(new TrailParticle(x, y));
    }
}
