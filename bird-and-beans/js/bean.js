import {
  BEAN_WIDTH,
  BEAN_HEIGHT,
  BEAN_BASE_SPEED,
  BEAN_MIN_SCORE,
  BEAN_MAX_SCORE,
  BEAN_FLASH_INTERVAL,
  BEAN_SPAWN_MARGIN,
  BEAN_SPAWN_PROBABILITY,
  CANVAS_HEIGHT,
  COLORS,
  INITIAL_SPAWN_INTERVAL,
  MIN_SPAWN_INTERVAL,
  SPAWN_INTERVAL_DECREASE_RATE,
  SPEED_INCREASE_RATE,
  DIFFICULTY_INCREASE_FRAMES
} from './constants.js';

export class Bean {
  constructor(x, y, type = 'normal') {
    this.x = x;
    this.y = y;
    this.width = BEAN_WIDTH;
    this.height = BEAN_HEIGHT;
    this.type = type; // 'normal', 'white', 'flashing'
    this.speed = BEAN_BASE_SPEED;
    this.active = true;
    this.flashTimer = 0;
  }

  update(deltaTime) {
    this.y += this.speed;

    if (this.type === 'flashing') {
      this.flashTimer += deltaTime;
    }
  }

  render(renderer) {
    if (!this.active) return;

    let color;
    switch (this.type) {
      case 'white':
        color = COLORS.BEAN_WHITE;
        break;
      case 'flashing':
        color = Math.floor(this.flashTimer / BEAN_FLASH_INTERVAL) % 2 === 0 ? COLORS.BEAN_FLASHING_1 : COLORS.BEAN_FLASHING_2;
        break;
      default:
        color = COLORS.BEAN_NORMAL;
    }

    renderer.drawCircle(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, color);
  }

  getScore(catchY) {
    const scoreRange = BEAN_MAX_SCORE - BEAN_MIN_SCORE;
    const heightRatio = (CANVAS_HEIGHT - catchY) / CANVAS_HEIGHT;
    return Math.floor(BEAN_MIN_SCORE + scoreRange * heightRatio);
  }
}

export class BeanManager {
  constructor(canvasWidth) {
    this.canvasWidth = canvasWidth;
    this.beans = [];
    this.spawnTimer = 0;
    this.spawnInterval = INITIAL_SPAWN_INTERVAL;
    this.minSpawnInterval = MIN_SPAWN_INTERVAL;
    this.speedIncrease = 0;
    this.speedIncreaseRate = SPEED_INCREASE_RATE;
  }

  update(deltaTime, frameCount) {
    this.spawnTimer += deltaTime;

    // 時間経過による難易度上昇
    if (frameCount % DIFFICULTY_INCREASE_FRAMES === 0) {
      this.speedIncrease += this.speedIncreaseRate;
      this.spawnInterval = Math.max(this.minSpawnInterval, this.spawnInterval * SPAWN_INTERVAL_DECREASE_RATE);
    }

    // マメの生成
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnBean();
      this.spawnTimer = 0;
    }

    // マメの更新
    this.beans.forEach((bean) => {
      bean.speed = BEAN_BASE_SPEED + this.speedIncrease;
      bean.update(deltaTime);
    });

    // 画面外のマメを削除
    this.beans = this.beans.filter((bean) => bean.active && bean.y < CANVAS_HEIGHT);
  }

  spawnBean() {
    const x = Math.random() * (this.canvasWidth - BEAN_WIDTH);
    const rand = Math.random();
    let type;

    if (rand < BEAN_SPAWN_PROBABILITY.FLASHING) {
      type = 'flashing';
    } else if (rand < BEAN_SPAWN_PROBABILITY.WHITE) {
      type = 'white';
    } else {
      type = 'normal';
    }

    this.beans.push(new Bean(x, -BEAN_SPAWN_MARGIN, type));
  }

  render(renderer) {
    this.beans.forEach((bean) => bean.render(renderer));
  }

  checkGroundCollision(ground, audioManager) {
    const beansToRemove = [];

    this.beans.forEach((bean) => {
      if (bean.y + bean.height >= ground.y) {
        beansToRemove.push(bean);

        if (bean.type === 'white') {
          ground.fillRandomHole();
          if (audioManager) audioManager.play('fill');
        } else if (bean.type === 'flashing') {
          ground.fillAllHoles();
          this.clearAllBeans();
          if (audioManager) audioManager.play('powerUp');
        } else {
          ground.createHole(bean.x + bean.width / 2);
          if (audioManager) audioManager.play('hole');
        }
      }
    });

    beansToRemove.forEach((bean) => {
      bean.active = false;
    });
  }

  clearAllBeans() {
    this.beans.forEach((bean) => {
      bean.active = false;
    });
  }

  reset() {
    this.beans = [];
    this.spawnTimer = 0;
    this.spawnInterval = INITIAL_SPAWN_INTERVAL;
    this.speedIncrease = 0;
  }
}
