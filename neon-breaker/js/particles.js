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

  createExplosion(x, y, color = null) {
    // Create multiple particles for explosion effect
    const particleCount = color ? 25 : 15; // 色指定時はより多くのパーティクル
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new ExplosionParticle(x, y, color));
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

  // 🆕 レーザーエフェクト
  createLaserEffect(x1, y1, x2, y2, color = '#ff0040') {
    // レーザービーム作成
    for (let i = 0; i < 30; i++) {
      const progress = i / 29;
      const x = x1 + (x2 - x1) * progress;
      const y = y1 + (y2 - y1) * progress;
      this.particles.push(new LaserParticle(x, y, color));
    }

    // 爆発エフェクトを端点に追加
    this.createExplosion(x1, y1, color);
    this.createExplosion(x2, y2, color);
  }

  // 🆕 スコア爆発エフェクト
  createScoreExplosion(x, y, points) {
    // 大量のゴールドパーティクル
    for (let i = 0; i < 20; i++) {
      this.particles.push(new ScoreParticle(x, y, points));
    }

    // 中央に大きな爆発
    this.createExplosion(x, y, '#ffff00');
  }

  update() {
    // Update and remove dead particles
    this.particles = this.particles.filter((particle) => {
      particle.update();
      return particle.isAlive();
    });

    // Update background particles
    this.backgroundParticles.forEach((particle) => particle.update());
  }

  render(ctx) {
    // Render background particles
    this.backgroundParticles.forEach((particle) => particle.render(ctx));

    // Render effect particles
    this.particles.forEach((particle) => particle.render(ctx));
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
  constructor(x, y, color = null) {
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
    this.color = color || colors[Math.floor(Math.random() * colors.length)];

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
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
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
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

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
  if (Math.random() < 0.3) {
    // Only create trail sometimes for performance
    particles.push(new TrailParticle(x, y));
  }
}

// 🆕 レーザーパーティクル
class LaserParticle extends Particle {
  constructor(x, y, color = '#ff0040') {
    super(x, y);
    this.color = color;
    this.size = 2 + Math.random() * 3;
    this.decay = 0.03;
    this.intensity = 1.0;

    // 軽微な動き
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
  }

  update() {
    super.update();
    this.intensity = this.life;
  }

  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;

    // 強烈な光効果
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.intensity, 0, Math.PI * 2);
    ctx.fill();

    // 内側の白い光
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.intensity * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// 🆕 スコアパーティクル
class ScoreParticle extends Particle {
  constructor(x, y, points) {
    super(x, y);

    // ゴールド色のパーティクル
    this.color = '#ffff00';
    this.size = 3 + Math.random() * 4;
    this.decay = 0.02;
    this.points = points;

    // 上向きの動き
    const angle = -Math.PI / 2 + ((Math.random() - 0.5) * Math.PI) / 3;
    const speed = 2 + Math.random() * 3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.gravity = 0.1;
    this.twinkle = Math.random() * Math.PI * 2;
    this.twinkleSpeed = 0.15;
  }

  update() {
    super.update();
    this.vy += this.gravity;
    this.twinkle += this.twinkleSpeed;
  }

  render(ctx) {
    ctx.save();

    // きらめき効果
    const alpha = this.life * (0.7 + 0.3 * Math.sin(this.twinkle));
    ctx.globalAlpha = alpha;

    // 強い光効果
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;

    // メインの星型パーティクル
    ctx.fillStyle = this.color;
    this.drawStar(ctx, this.x, this.y, this.size, this.size * 0.5, 5);

    ctx.restore();
  }

  drawStar(ctx, x, y, outerRadius, innerRadius, points) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.twinkle);

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

// 🆕 連鎖爆発パーティクル
class ChainExplosionParticle extends ExplosionParticle {
  constructor(x, y) {
    super(x, y, '#ff8000');
    this.size = 2 + Math.random() * 3;
    this.chainPulse = 0;
    this.chainPulseSpeed = 0.2;
  }

  update() {
    super.update();
    this.chainPulse += this.chainPulseSpeed;
  }

  render(ctx) {
    ctx.save();

    // 脈動効果
    const pulseSize = this.size * (1 + 0.3 * Math.sin(this.chainPulse));

    ctx.globalAlpha = this.life;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
