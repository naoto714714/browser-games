const SCORE_EFFECT_DURATION = 3000; // 3秒間表示
const SCORE_EFFECT_COLOR = '#ffffff';
const SCORE_EFFECT_FONT = '20px Arial';

export class ScoreEffect {
  constructor(x, y, score) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.createdAt = Date.now();
    this.duration = SCORE_EFFECT_DURATION;
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
    renderer.drawText(this.score.toString(), this.x, this.y, SCORE_EFFECT_COLOR, SCORE_EFFECT_FONT);
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
