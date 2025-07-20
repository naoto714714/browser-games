export class ScoreEffect {
  constructor(x, y, score) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.createdAt = Date.now();
    this.duration = 3000; // 3秒間表示
    this.active = true;
  }

  update() {
    const elapsed = Date.now() - this.createdAt;
    if (elapsed >= this.duration) {
      this.active = false;
    }
  }

  render(renderer) {
    if (!this.active) return;

    // スコアテキストを白色で表示
    renderer.drawText(this.score.toString(), this.x, this.y, '#ffffff', '20px Arial');
  }
}

export class ScoreEffectManager {
  constructor() {
    this.effects = [];
  }

  add(x, y, score) {
    this.effects.push(new ScoreEffect(x, y, score));
  }

  update() {
    this.effects.forEach((effect) => effect.update());
    this.effects = this.effects.filter((effect) => effect.active);
  }

  render(renderer) {
    this.effects.forEach((effect) => effect.render(renderer));
  }

  reset() {
    this.effects = [];
  }
}

