// ユーティリティ関数
const Utils = {
  // 矩形の衝突判定
  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  },

  // 値を範囲内に制限
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  // 線形補間
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  },

  // タイル座標をピクセル座標に変換
  tileToPixel(tilePos) {
    return tilePos * GAME_CONSTANTS.TILE_SIZE;
  },

  // ピクセル座標をタイル座標に変換
  pixelToTile(pixelPos) {
    return Math.floor(pixelPos / GAME_CONSTANTS.TILE_SIZE);
  },

  // 距離計算
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // 角度計算
  angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },

  // スコアを6桁の文字列に変換
  formatScore(score) {
    return score.toString().padStart(6, '0');
  },

  // 時間を3桁の文字列に変換
  formatTime(time) {
    return Math.max(0, time).toString().padStart(3, '0');
  },

  // コインカウントを2桁の文字列に変換
  formatCoins(coins) {
    return Math.min(99, coins).toString().padStart(2, '0');
  },

  // ライフカウントを2桁の文字列に変換
  formatLives(lives) {
    return Math.min(99, lives).toString().padStart(2, '0');
  },

  // ランダムな整数を生成
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // ランダムな浮動小数点数を生成
  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  // 配列からランダムな要素を選択
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  // デバウンス関数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 時間をフレーム数に変換 (60FPS基準)
  secondsToFrames(seconds) {
    return Math.floor(seconds * 60);
  },

  // フレーム数を秒に変換
  framesToSeconds(frames) {
    return frames / 60;
  },

  // カラーコードをRGBA配列に変換
  hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, alpha];
  },

  // 深いオブジェクトコピー
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        clonedObj[key] = this.deepClone(obj[key]);
      }
      return clonedObj;
    }
  },

  // アニメーションフレーム計算
  getAnimationFrame(frameCount, frameRate, totalFrames) {
    return Math.floor(frameCount / frameRate) % totalFrames;
  },
};
