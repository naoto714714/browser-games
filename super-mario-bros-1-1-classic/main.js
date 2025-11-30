const k = kaboom({
  width: 960,
  height: 540,
  letterbox: true,
  canvas: document.querySelector('#game'),
  background: [92, 148, 252],
  global: false,
});

const TILE_SIZE = 16;
const WORLD_WIDTH = 230;
const WORLD_HEIGHT = 18;
const GRAVITY = 1600;
const MOVE_SPEED = 140;
const DASH_SPEED = 220;
const JUMP_FORCE = 430;
const BIG_JUMP_FORCE = 520;
const ENEMY_SPEED = 30;
const MUSHROOM_SPEED = 40;
const TIME_LIMIT = 400;

k.setGravity(GRAVITY);

k.loadRoot('https://i.imgur.com/');
k.loadSprite('mario', 'Wb1qfhK.png', {
  sliceX: 3,
  anims: {
    idle: { from: 0, to: 0 },
    run: { from: 0, to: 2, speed: 10, loop: true },
    jump: { from: 1, to: 1 },
    fall: { from: 2, to: 2 },
  },
});
k.loadSprite('goomba', 'KPO3fR9.png');
k.loadSprite('koopa', 'bdrLpi6.png');
k.loadSprite('block', 'pogC9x5.png');
k.loadSprite('surprise', 'gesQ1KP.png');
k.loadSprite('unboxed', 'bdrLpi6.png');
k.loadSprite('coin', 'wbKxhcd.png');
k.loadSprite('mushroom', '0wMd92p.png');
k.loadSprite('pipe-top-left', 'ReTPiWY.png');
k.loadSprite('pipe-top-right', 'hj2GK4n.png');
k.loadSprite('pipe-bottom-left', 'c1cYSbt.png');
k.loadSprite('pipe-bottom-right', 'nqQ79eI.png');

const scoreLabel = document.getElementById('score');
const coinLabel = document.getElementById('coins');
const timeLabel = document.getElementById('time');

let score = 0;
let coins = 0;
let timeLeft = TIME_LIMIT;
let finished = false;

function updateScoreDisplay() {
  scoreLabel.textContent = score.toString().padStart(6, '0');
  coinLabel.textContent = `x${coins.toString().padStart(2, '0')}`;
  timeLabel.textContent = Math.max(0, Math.floor(timeLeft));
}

function big() {
  let timer = 0;
  let isBig = false;
  return {
    id: 'big',
    update() {
      if (isBig) {
        timer -= k.dt();
        if (timer <= 0) {
          this.smallify();
        }
      }
    },
    isBig() {
      return isBig;
    },
    smallify() {
      this.scale = k.vec2(1, 1);
      isBig = false;
    },
    biggify(time) {
      this.scale = k.vec2(1.5, 1.5);
      timer = time ?? 9999;
      isBig = true;
    },
  };
}

function patrol(speed = 30, dir = -1) {
  return {
    id: 'patrol',
    require: ['pos', 'area'],
    add() {
      this.on('collider', (other) => {
        if (other.is('solid') && !other.is('player')) {
          dir = -dir;
        }
      });
    },
    update() {
      this.move(speed * dir, 0);
    },
  };
}

function spawnCloud(x, y) {
  k.add([
    k.rect(36, 16),
    k.color(255, 255, 255),
    k.pos(x, y),
    k.opacity(0.85),
    k.outline(3, k.rgb(200, 200, 200)),
  ]);
}

function buildLevelGrid() {
  const grid = Array.from({ length: WORLD_HEIGHT }, () => Array(WORLD_WIDTH).fill(' '));

  const set = (x, y, char) => {
    if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) grid[y][x] = char;
  };
  const fillRow = (y, char) => {
    for (let x = 0; x < WORLD_WIDTH; x++) set(x, y, char);
  };
  const fillRect = (x1, y1, w, h, char) => {
    for (let y = y1; y < y1 + h; y++) {
      for (let x = x1; x < x1 + w; x++) {
        set(x, y, char);
      }
    }
  };

  // Ground
  fillRow(WORLD_HEIGHT - 1, '#');
  fillRect(0, WORLD_HEIGHT - 2, WORLD_WIDTH, 1, '#');

  // Starting bricks and question blocks
  fillRect(20, 9, 4, 1, '=');
  fillRect(30, 9, 1, 1, 'M');
  fillRect(31, 9, 1, 1, '=');
  fillRect(32, 9, 1, 1, 'Q');
  fillRect(33, 9, 1, 1, '=');
  fillRect(34, 9, 1, 1, 'Q');
  fillRect(35, 9, 1, 1, '=');
  fillRect(44, 9, 6, 1, '=');

  // Coin arc near start
  [58, 60, 62, 64].forEach((x, i) => set(x, 7 - i % 2, 'c'));

  // Pipes with increasing height
  const placePipe = (x, height) => {
    for (let h = 0; h < height; h++) {
      const leftChar = h === height - 1 ? '{' : '(';
      const rightChar = h === height - 1 ? '}' : ')';
      set(x, WORLD_HEIGHT - 2 - h, leftChar);
      set(x + 1, WORLD_HEIGHT - 2 - h, rightChar);
    }
  };
  placePipe(70, 3);
  placePipe(86, 4);
  placePipe(104, 4);
  placePipe(122, 5);

  // Mid-level bricks and hidden coin run
  fillRect(140, 9, 2, 1, 'Q');
  fillRect(146, 9, 8, 1, '=');
  fillRect(152, 5, 3, 1, 'c');
  fillRect(170, 9, 5, 1, '=');

  // Stairs before flag
  for (let h = 0; h < 5; h++) {
    fillRect(182 + h, WORLD_HEIGHT - 2 - h, 1, h + 1, 's');
  }

  // Flag pole and castle
  fillRect(195, 3, 1, WORLD_HEIGHT - 3, 'f');
  set(195, WORLD_HEIGHT - 2, 'F');
  fillRect(202, WORLD_HEIGHT - 6, 6, 5, 'C');
  fillRect(203, WORLD_HEIGHT - 7, 4, 1, 'C');

  // Decorative floating bricks
  fillRect(15, 5, 3, 1, '=');
  fillRect(55, 6, 2, 1, '=');
  fillRect(98, 6, 3, 1, '=');
  fillRect(160, 6, 2, 1, 'Q');

  // Enemy placements
  [35, 52, 95, 130, 165, 175].forEach((x) => set(x, WORLD_HEIGHT - 2, 'g'));
  [110, 150].forEach((x) => set(x, WORLD_HEIGHT - 2, 'k'));

  return grid.map((row) => row.join(''));
}

const levelPlan = buildLevelGrid();

const level = k.addLevel(levelPlan, {
  tileWidth: TILE_SIZE,
  tileHeight: TILE_SIZE,
  tiles: {
    '#': () => [
      k.rect(TILE_SIZE, TILE_SIZE),
      k.color(202, 128, 64),
      k.outline(3, k.rgb(160, 88, 44)),
      k.area(),
      k.body({ isStatic: true }),
      k.z(1),
      'solid',
    ],
    '=': () => [k.sprite('block'), k.area(), k.solid(), 'solid', 'brick'],
    'Q': () => [k.sprite('surprise'), k.area(), k.solid(), 'solid', 'question', { content: 'coin' }],
    'M': () => [k.sprite('surprise'), k.area(), k.solid(), 'solid', 'question', { content: 'mushroom' }],
    'c': () => [k.sprite('coin'), k.area({ scale: 0.8 }), 'coin', { floating: true }],
    'g': () => [k.sprite('goomba'), k.area(), k.body(), patrol(ENEMY_SPEED), k.origin('bot'), 'danger'],
    'k': () => [k.sprite('goomba'), k.area(), k.body(), patrol(ENEMY_SPEED), k.origin('bot'), 'danger'],
    '(': () => [
      k.sprite('pipe-bottom-left'),
      k.area(),
      k.solid(),
      k.scale(0.5),
      'solid',
      'pipe',
    ],
    ')': () => [
      k.sprite('pipe-bottom-right'),
      k.area(),
      k.solid(),
      k.scale(0.5),
      'solid',
      'pipe',
    ],
    '{': () => [
      k.sprite('pipe-top-left'),
      k.area(),
      k.solid(),
      k.scale(0.5),
      'solid',
      'pipe',
    ],
    '}': () => [
      k.sprite('pipe-top-right'),
      k.area(),
      k.solid(),
      k.scale(0.5),
      'solid',
      'pipe',
    ],
    'f': () => [k.rect(4, TILE_SIZE), k.color(240, 240, 240), k.area(), k.solid(), 'solid', 'flagpole'],
    'F': () => [k.rect(14, 14), k.color(46, 184, 46), k.area(), k.solid(), 'flag'],
    'C': () => [k.rect(TILE_SIZE, TILE_SIZE), k.color(191, 83, 28), k.outline(3, k.rgb(128, 52, 18)), k.area(), k.solid(), 'castle'],
    's': () => [k.rect(TILE_SIZE, TILE_SIZE), k.color(196, 108, 64), k.area(), k.solid(), 'solid'],
  },
});

const player = k.add([
  k.sprite('mario', { anim: 'idle' }),
  k.pos(40, 0),
  k.area({ shape: new k.Rect(k.vec2(0, 2), 12, 14) }),
  k.body(),
  k.origin('bot'),
  big(),
  'player',
]);

k.add([
  k.rect(level.width() * TILE_SIZE, 16),
  k.color(0, 0, 0),
  k.pos(0, k.height() - 16),
  k.fixed(),
  k.opacity(0.1),
]);

const clouds = [15, 45, 90, 135, 170, 210];
clouds.forEach((x, i) => spawnCloud(x * TILE_SIZE, 40 + (i % 2) * 20));

k.camScale(k.vec2(2.5, 2.5));

let onGround = false;

player.onUpdate(() => {
  if (finished) return;
  const speed = k.isKeyDown('s') ? DASH_SPEED : MOVE_SPEED;
  if (k.isKeyDown('left')) {
    player.move(-speed, 0);
    player.flipX = true;
    if (onGround && player.curAnim() !== 'run') player.play('run');
  } else if (k.isKeyDown('right')) {
    player.move(speed, 0);
    player.flipX = false;
    if (onGround && player.curAnim() !== 'run') player.play('run');
  } else if (onGround && player.curAnim() !== 'idle') {
    player.play('idle');
  }

  if (player.pos.y > k.height() + 200) {
    gameOver();
  }

  const cx = Math.min(Math.max(player.pos.x, k.width() / 2), level.width() * TILE_SIZE - k.width() / 2);
  k.camPos(cx, 180);
});

player.onGround(() => {
  onGround = true;
  if (player.curAnim() === 'jump') player.play('run');
});

player.onFall(() => {
  onGround = false;
  if (player.curAnim() !== 'jump') player.play('jump');
});

k.onKeyPress(['up', 'w', 'space', 'x', 'j'], () => {
  if (finished) return;
  if (player.isGrounded()) {
    player.jump(player.isBig() ? BIG_JUMP_FORCE : JUMP_FORCE);
    player.play('jump');
  }
});

function spawnMushroom(pos) {
  const mush = level.spawn('mushroom', pos);
  mush.use(k.body());
  mush.use(patrol(MUSHROOM_SPEED));
  mush.use(k.origin('bot'));
  mush.isMushroom = true;
}

player.onHeadbutt((obj) => {
  if (obj.is('question')) {
    if (obj.opened) return;
    obj.opened = true;
    obj.use(k.sprite('unboxed'));
    obj.unuse('question');
    if (obj.content === 'coin') {
      spawnCoin(obj.pos.add(0, -TILE_SIZE));
    } else if (obj.content === 'mushroom') {
      spawnMushroom(obj.pos.add(0, -TILE_SIZE));
    }
  }
});

function spawnCoin(pos) {
  const coin = level.spawn('coin', pos);
  coin.use(k.origin('bot'));
  coin.use({ floating: false });
  coin.jump(180);
  k.wait(0.4, () => coin.destroy());
  collectCoin();
}

function stomp(enemy) {
  if (!enemy || finished) return;
  k.destroy(enemy);
  player.jump(JUMP_FORCE * 0.6);
  score += 100;
  updateScoreDisplay();
}

function hitPlayer() {
  if (finished) return;
  if (player.isBig()) {
    player.smallify();
    k.play('powerdown', { volume: 0.2, detune: -1200 });
  } else {
    gameOver();
  }
}

player.onCollide('coin', (c) => {
  if (c.floating) return;
  collectCoin();
  c.destroy();
});

function collectCoin() {
  coins += 1;
  score += 200;
  updateScoreDisplay();
}

player.onCollide('mushroom', (m) => {
  player.biggify(12);
  score += 1000;
  updateScoreDisplay();
  m.destroy();
});

player.onCollide('danger', (d) => {
  if (finished) return;
  if (player.isFalling()) {
    stomp(d);
  } else {
    hitPlayer();
  }
});

player.onCollide('flag', () => {
  if (finished) return;
  finished = true;
  player.use(k.area({}));
  player.use(k.body());
  player.play('idle');
  player.pos.x = 195 * TILE_SIZE - 8;
  const descent = player.pos.y + 80;
  k.tween(player.pos.y, descent, 0.8, (y) => (player.pos.y = y), k.easings.easeInOutSine);
  k.wait(1, () => {
    player.flipX = false;
    player.moveTo(player.pos.x + 64, player.pos.y);
    k.tween(player.pos.x, 205 * TILE_SIZE, 2, (x) => (player.pos.x = x), k.easings.easeInOutSine);
  });
  k.wait(3.2, () => finishStage());
});

player.onCollide('castle', () => {
  if (!finished) finishStage();
});

function finishStage() {
  finished = true;
  score += Math.max(0, Math.floor(timeLeft)) * 50;
  updateScoreDisplay();
  k.add([k.text('COURSE CLEAR!\nTHANK YOU MARIO!', { size: 16, font: 'sink' }), k.pos(player.pos.x - 120, 120), k.color(255, 255, 255), k.area(), k.z(100), k.fixed()]);
}

function gameOver() {
  finished = true;
  k.add([k.text('GAME OVER', { size: 24, font: 'sink' }), k.pos(k.camPos().x - 80, 120), k.color(255, 0, 0), k.z(100)]);
  k.wait(1.5, () => {
    location.reload();
  });
}

k.loop(1, () => {
  if (finished) return;
  timeLeft -= 1;
  if (timeLeft <= 0) {
    gameOver();
  }
  updateScoreDisplay();
});

updateScoreDisplay();
