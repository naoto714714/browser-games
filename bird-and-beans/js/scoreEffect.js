import { COLORS, FONTS, SCORE_EFFECT_DURATION } from './config.js';

export class ScoreEffect {
  constructor(x, y, score) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.createdAt = Date.now();
    this.duration = SCORE_EFFECT_DURATION;
    this.active = true;
    this.color = this.getColorByScore(score);
  }

  getColorByScore(score) {
    switch (score) {
      case 10:
        return COLORS.SCORE_EFFECT_10;
      case 50:
        return COLORS.SCORE_EFFECT_50;
      case 100:
        return COLORS.SCORE_EFFECT_100;
      case 300:
        return COLORS.SCORE_EFFECT_300;
      case 1000:
        return COLORS.SCORE_EFFECT_1000;
      default:
        return COLORS.SCORE_EFFECT;
    }
  }

  update() {
    const elapsed = Date.now() - this.createdAt;
    if (elapsed >= this.duration) {
      this.active = false;
    }
  }

  render(renderer) {
    if (!this.active) return;

    // スコアテキストをスコアに応じた色で表示
    renderer.drawText(this.score.toString(), this.x, this.y, this.color, FONTS.SCORE_EFFECT);
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
