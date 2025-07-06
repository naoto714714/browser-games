// クリックコンボシステム

class ComboManager {
  constructor() {
    this.combo = 0;
    this.maxCombo = 0;
    this.lastClickTime = 0;
    this.comboTimeWindow = 1500; // 1.5秒以内にクリックしないとコンボ終了
    this.comboMultiplier = 1;
    this.comboDecayTimer = null;

    // コンボレベルごとの設定
    this.comboThresholds = [
      { count: 5, multiplier: 1.2, name: 'リズム感', color: '#68d391' },
      { count: 10, multiplier: 1.5, name: '集中', color: '#4facfe' },
      { count: 20, multiplier: 2.0, name: '熱中', color: '#43e97b' },
      { count: 30, multiplier: 2.5, name: '夢中', color: '#38a9ff' },
      { count: 50, multiplier: 3.0, name: '狂気', color: '#ff6b81' },
      { count: 75, multiplier: 4.0, name: '超越', color: '#a55eea' },
      { count: 100, multiplier: 5.0, name: '究極', color: '#ffd32a' },
    ];

    this.init();
  }

  init() {
    // コンボ表示用UI要素を作成
    this.createComboUI();
  }

  createComboUI() {
    // コンボ表示コンテナ
    const comboContainer = document.createElement('div');
    comboContainer.id = 'comboContainer';
    comboContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            pointer-events: none;
            font-family: 'Orbitron', monospace;
        `;

    // コンボ数表示
    const comboDisplay = document.createElement('div');
    comboDisplay.id = 'comboDisplay';
    comboDisplay.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 1.2em;
            font-weight: bold;
            text-align: center;
            transform: scale(0);
            transition: all 0.3s ease;
            margin-bottom: 10px;
            border: 2px solid transparent;
        `;
    comboDisplay.textContent = 'COMBO: 0';

    // コンボマルチプライヤー表示
    const multiplierDisplay = document.createElement('div');
    multiplierDisplay.id = 'multiplierDisplay';
    multiplierDisplay.style.cssText = `
            background: rgba(104, 211, 145, 0.9);
            color: white;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 0.9em;
            font-weight: bold;
            text-align: center;
            transform: scale(0);
            transition: all 0.3s ease;
            margin-bottom: 10px;
        `;
    multiplierDisplay.textContent = '×1.0';

    // コンボタイトル表示
    const comboTitle = document.createElement('div');
    comboTitle.id = 'comboTitle';
    comboTitle.style.cssText = `
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 1em;
            font-weight: bold;
            text-align: center;
            transform: scale(0);
            transition: all 0.3s ease;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

    comboContainer.appendChild(comboDisplay);
    comboContainer.appendChild(multiplierDisplay);
    comboContainer.appendChild(comboTitle);
    document.body.appendChild(comboContainer);
  }

  // クリック時にコンボを更新
  onClick() {
    const currentTime = Date.now();

    // 前回のクリックから時間が経ちすぎている場合はコンボリセット
    if (currentTime - this.lastClickTime > this.comboTimeWindow) {
      this.combo = 0;
    }

    this.combo++;
    this.lastClickTime = currentTime;

    // 最大コンボ更新
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    // コンボマルチプライヤーを計算
    this.updateComboMultiplier();

    // UI更新
    this.updateComboUI();

    // コンボエフェクト
    this.showComboEffect();

    // コンボ終了タイマーを設定
    this.resetComboTimer();

    return this.comboMultiplier;
  }

  // コンボマルチプライヤーを計算
  updateComboMultiplier() {
    this.comboMultiplier = 1;

    // コンボ数に応じてマルチプライヤーを設定
    for (let i = this.comboThresholds.length - 1; i >= 0; i--) {
      if (this.combo >= this.comboThresholds[i].count) {
        this.comboMultiplier = this.comboThresholds[i].multiplier;
        break;
      }
    }
  }

  // コンボUI更新
  updateComboUI() {
    const comboDisplay = document.getElementById('comboDisplay');
    const multiplierDisplay = document.getElementById('multiplierDisplay');
    const comboTitle = document.getElementById('comboTitle');

    if (!comboDisplay || !multiplierDisplay || !comboTitle) {
      return;
    }

    // コンボ数表示
    comboDisplay.textContent = `COMBO: ${this.combo}`;

    // マルチプライヤー表示
    multiplierDisplay.textContent = `×${this.comboMultiplier.toFixed(1)}`;

    // コンボが0の場合は非表示
    if (this.combo === 0) {
      comboDisplay.style.transform = 'scale(0)';
      multiplierDisplay.style.transform = 'scale(0)';
      comboTitle.style.transform = 'scale(0)';
      return;
    }

    // コンボレベルに応じた色とタイトルを設定
    let currentThreshold = null;
    for (let i = this.comboThresholds.length - 1; i >= 0; i--) {
      if (this.combo >= this.comboThresholds[i].count) {
        currentThreshold = this.comboThresholds[i];
        break;
      }
    }

    // 表示
    comboDisplay.style.transform = 'scale(1)';
    multiplierDisplay.style.transform = 'scale(1)';

    if (currentThreshold) {
      comboDisplay.style.borderColor = currentThreshold.color;
      comboDisplay.style.boxShadow = `0 0 20px ${currentThreshold.color}`;

      comboTitle.textContent = currentThreshold.name;
      comboTitle.style.background = `linear-gradient(45deg, ${currentThreshold.color}, #764ba2)`;
      comboTitle.style.transform = 'scale(1)';
    } else {
      comboDisplay.style.borderColor = 'transparent';
      comboDisplay.style.boxShadow = 'none';
      comboTitle.style.transform = 'scale(0)';
    }
  }

  // コンボエフェクト
  showComboEffect() {
    if (this.combo <= 1) {
      return;
    }

    // コンボ数に応じたエフェクトの強度
    const intensity = Math.min(this.combo / 50, 1);

    // 数字が大きくなるアニメーション
    const comboDisplay = document.getElementById('comboDisplay');
    if (comboDisplay) {
      comboDisplay.style.transform = 'scale(1.2)';
      setTimeout(() => {
        comboDisplay.style.transform = 'scale(1)';
      }, 150);
    }

    // 特定のコンボ数での特別エフェクト
    const milestone = this.comboThresholds.find(
      threshold => threshold.count === this.combo
    );
    if (milestone) {
      this.showComboMilestoneEffect(milestone);
    }

    // 高コンボ時の画面エフェクト
    if (this.combo >= 20) {
      this.showHighComboEffect(intensity);
    }

    // コンボレベルに応じた猫の表情
    if (window.effectsManager && this.combo >= 10) {
      effectsManager.playComboExpression(this.combo);
    }
  }

  // コンボマイルストーンエフェクト
  showComboMilestoneEffect(milestone) {
    // 画面フラッシュ
    const flash = document.createElement('div');
    flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, ${milestone.color}40 0%, transparent 70%);
            z-index: 9998;
            pointer-events: none;
            animation: comboFlash 0.8s ease-out forwards;
        `;

    const style = document.createElement('style');
    style.textContent = `
            @keyframes comboFlash {
                0% { opacity: 0; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1); }
                100% { opacity: 0; transform: scale(1.2); }
            }
        `;
    document.head.appendChild(style);

    document.body.appendChild(flash);

    setTimeout(() => {
      flash.remove();
      style.remove();
    }, 800);

    // マイルストーン通知
    this.showComboNotification(
      `${milestone.name}コンボ達成！ ×${milestone.multiplier}`,
      milestone.color
    );
  }

  // 高コンボエフェクト
  showHighComboEffect(intensity) {
    if (Math.random() < 0.3 * intensity) {
      // 強度に応じた確率で発動
      // 画面振動エフェクト
      const gameContainer = document.querySelector('.game-container');
      if (gameContainer) {
        gameContainer.style.animation = 'comboShake 0.2s ease-in-out';

        const shakeStyle = document.createElement('style');
        shakeStyle.textContent = `
                    @keyframes comboShake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-2px) translateY(-1px); }
                        75% { transform: translateX(2px) translateY(1px); }
                    }
                `;
        document.head.appendChild(shakeStyle);

        setTimeout(() => {
          gameContainer.style.animation = '';
          shakeStyle.remove();
        }, 200);
      }
    }
  }

  // コンボ通知
  showComboNotification(message, color) {
    const notification = document.createElement('div');
    notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, ${color}ee 0%, #764ba2ee 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1.1em;
            font-weight: bold;
            text-align: center;
            z-index: 9999;
            animation: comboNotificationBounce 1.5s ease-out forwards;
            box-shadow: 0 10px 30px ${color}80;
            font-family: 'Orbitron', monospace;
        `;
    notification.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
            @keyframes comboNotificationBounce {
                0% { opacity: 0; transform: translate(-50%, -80px) scale(0.7); }
                30% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                50% { transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -20px) scale(0.8); }
            }
        `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 1500);
  }

  // コンボタイマーリセット
  resetComboTimer() {
    if (this.comboDecayTimer) {
      clearTimeout(this.comboDecayTimer);
    }

    this.comboDecayTimer = setTimeout(() => {
      this.endCombo();
    }, this.comboTimeWindow);
  }

  // コンボ終了
  endCombo() {
    if (this.combo > 0) {
      const finalCombo = this.combo;
      this.combo = 0;
      this.comboMultiplier = 1;
      this.updateComboUI();

      // コンボ終了通知（5コンボ以上の場合）
      if (finalCombo >= 5) {
        this.showComboEndNotification(finalCombo);
      }
    }
  }

  // コンボ終了通知
  showComboEndNotification(finalCombo) {
    if (window.effectsManager) {
      effectsManager.showNotification(
        `${finalCombo}コンボ終了！お疲れ様でした`,
        false
      );
    }
  }

  // 現在のコンボマルチプライヤーを取得
  getMultiplier() {
    return this.comboMultiplier;
  }

  // コンボ統計を取得
  getStats() {
    return {
      currentCombo: this.combo,
      maxCombo: this.maxCombo,
      multiplier: this.comboMultiplier,
    };
  }

  // セーブデータ
  getSaveData() {
    return {
      maxCombo: this.maxCombo,
    };
  }

  // セーブデータ読み込み
  loadSaveData(data) {
    if (data.maxCombo !== undefined) {
      this.maxCombo = data.maxCombo;
    }
  }
}

// グローバルインスタンス
const comboManager = new ComboManager();
window.comboManager = comboManager;
