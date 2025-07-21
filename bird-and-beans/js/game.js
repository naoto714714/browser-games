import { Renderer } from './render.js';
import { InputManager } from './input.js';
import { Player } from './player.js';
import { BeanManager } from './bean.js';
import { Ground } from './ground.js';
import { AudioManager } from './audio.js';
import { ScoreEffectManager } from './scoreEffect.js';
import { HIGH_SCORE_KEY } from './constants.js';

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.renderer = new Renderer(ctx);

    this.score = 0;
    this.highScore = this.loadHighScore();
    this.gameOver = false;
    this.frameCount = 0;
    this.lastTime = 0;

    this.inputManager = new InputManager();
    this.player = new Player(canvas.width, canvas.height);
    this.beanManager = new BeanManager(canvas.width);
    this.ground = new Ground(canvas.width, canvas.height);
    this.audioManager = new AudioManager();
    this.scoreEffectManager = new ScoreEffectManager();

    this.updateUI();
  }

  start() {
    this.gameLoop(0);
  }

  gameLoop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (!this.gameOver) {
      this.update(deltaTime);
      this.render();
      this.frameCount++;
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(deltaTime) {
    this.player.update(this.inputManager, this.ground, deltaTime);
    this.beanManager.update(deltaTime, this.frameCount);
    this.scoreEffectManager.update();
    this.inputManager.update();

    // 地面との衝突判定
    this.beanManager.checkGroundCollision(this.ground, this.audioManager);

    // 鳥とマメの衝突判定
    this.beanManager.beans.forEach((bean) => {
      if (!bean.active) return;

      // 舌との衝突
      if (this.player.checkTongueCollision(bean)) {
        this.handleBeanCatch(bean);
      }

      // 鳥本体との衝突
      if (this.player.checkCollision(bean)) {
        this.endGame();
      }
    });
  }

  handleBeanCatch(bean) {
    const score = bean.getScore(bean.y);
    this.addScore(score);

    // スコアエフェクトを追加
    this.scoreEffectManager.add(bean.x + bean.width / 2, bean.y + bean.height / 2, score);

    bean.active = false;

    // マメの種類に応じた効果
    switch (bean.type) {
      case 'white':
        this.ground.fillRandomHole();
        this.audioManager.play('fill');
        break;
      case 'flashing':
        this.ground.fillAllHoles();
        this.beanManager.clearAllBeans();
        this.audioManager.play('powerUp');
        break;
      default:
        this.audioManager.play('catch');
        break;
    }

    // 舌を即座に戻す
    this.player.retractTongue();
  }

  render() {
    this.renderer.clear(this.canvas.width, this.canvas.height);
    this.ground.render(this.renderer);
    this.player.render(this.renderer);
    this.beanManager.render(this.renderer);
    this.scoreEffectManager.render(this.renderer);
  }

  restart() {
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;

    this.player = new Player(this.canvas.width, this.canvas.height);
    this.beanManager.reset();
    this.ground = new Ground(this.canvas.width, this.canvas.height);
    this.scoreEffectManager.reset();

    this.updateUI();
    document.getElementById('game-over').classList.add('hidden');
  }

  endGame() {
    this.gameOver = true;
    this.audioManager.play('gameOver');
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    document.getElementById('final-score').textContent = this.score;
    document.getElementById('game-over').classList.remove('hidden');
    this.updateUI();
  }

  addScore(points) {
    this.score += points;
    this.updateUI();
  }

  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('high-score').textContent = this.highScore;
  }

  loadHighScore() {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0');
  }

  saveHighScore() {
    localStorage.setItem(HIGH_SCORE_KEY, this.highScore.toString());
  }
}
