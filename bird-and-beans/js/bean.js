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
  DIFFICULTY_INCREASE_FRAMES,
  SCORE_ZONE_1_HEIGHT,
  SCORE_ZONE_2_HEIGHT,
  SCORE_ZONE_3_HEIGHT,
  SCORE_ZONE_1_SCORE,
  SCORE_ZONE_2_SCORE,
  SCORE_ZONE_3_SCORE,
  SCORE_ZONE_4_SCORE,
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
        color =
          Math.floor(this.flashTimer / BEAN_FLASH_INTERVAL) % 2 === 0 ? COLORS.BEAN_FLASHING_1 : COLORS.BEAN_FLASHING_2;
        break;
      default:
        color = COLORS.BEAN_NORMAL;
    }

    renderer.drawCircle(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, color);
  }

  getScore(catchY) {
    if (catchY < SCORE_ZONE_1_HEIGHT) {
      return SCORE_ZONE_1_SCORE;
    } else if (catchY < SCORE_ZONE_2_HEIGHT) {
      return SCORE_ZONE_2_SCORE;
    } else if (catchY < SCORE_ZONE_3_HEIGHT) {
      return SCORE_ZONE_3_SCORE;
    } else {
      return SCORE_ZONE_4_SCORE;
    }
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
    this.updateDifficulty(frameCount);
    this.updateSpawnTimer(deltaTime);
    this.updateBeans(deltaTime);
    this.removeInactiveBeans();
  }

  updateDifficulty(frameCount) {
    if (frameCount % DIFFICULTY_INCREASE_FRAMES === 0) {
      this.speedIncrease += this.speedIncreaseRate;
      this.spawnInterval = Math.max(this.minSpawnInterval, this.spawnInterval * SPAWN_INTERVAL_DECREASE_RATE);
    }
  }

  updateSpawnTimer(deltaTime) {
    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnBean();
      this.spawnTimer = 0;
    }
  }

  updateBeans(deltaTime) {
    const currentSpeed = BEAN_BASE_SPEED + this.speedIncrease;

    this.beans.forEach((bean) => {
      bean.speed = currentSpeed;
      bean.update(deltaTime);
    });
  }

  removeInactiveBeans() {
    this.beans = this.beans.filter((bean) => bean.active && bean.y < CANVAS_HEIGHT);
  }

  spawnBean() {
    const x = this.getRandomSpawnX();
    const type = this.getRandomBeanType();
    this.beans.push(new Bean(x, -BEAN_SPAWN_MARGIN, type));
  }

  getRandomSpawnX() {
    return Math.random() * (this.canvasWidth - BEAN_WIDTH);
  }

  getRandomBeanType() {
    const rand = Math.random();

    if (rand < BEAN_SPAWN_PROBABILITY.FLASHING) {
      return 'flashing';
    } else if (rand < BEAN_SPAWN_PROBABILITY.WHITE) {
      return 'white';
    } else {
      return 'normal';
    }
  }

  render(renderer) {
    this.beans.forEach((bean) => bean.render(renderer));
  }

  checkGroundCollision(ground, audioManager) {
    const beansToRemove = [];

    this.beans.forEach((bean) => {
      if (bean.y + bean.height >= ground.y) {
        beansToRemove.push(bean);
        this.handleBeanGroundCollision(bean, ground, audioManager);
      }
    });

    beansToRemove.forEach((bean) => {
      bean.active = false;
    });
  }

  handleBeanGroundCollision(bean, ground, audioManager) {
    const beanCenterX = bean.x + bean.width / 2;

    switch (bean.type) {
      case 'white':
        ground.fillRandomHole();
        if (audioManager) audioManager.play('fill');
        break;
      case 'flashing':
        ground.fillAllHoles();
        this.clearAllBeans();
        if (audioManager) audioManager.play('powerUp');
        break;
      default:
        ground.createHole(beanCenterX);
        if (audioManager) audioManager.play('hole');
        break;
    }
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
