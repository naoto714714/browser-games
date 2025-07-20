// ランダムイベントシステム

class GameEvent {
  constructor(id, name, description, effect, duration, chance) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.effect = effect;
    this.duration = duration; // 秒単位
    this.chance = chance; // 発生確率（0-1）
    this.active = false;
    this.endTime = 0;
  }

  start() {
    this.active = true;
    this.endTime = Date.now() + this.duration * 1000;
    this.effect.start();
  }

  end() {
    this.active = false;
    this.endTime = 0;
    this.effect.end();
  }

  update() {
    if (this.active && Date.now() >= this.endTime) {
      this.end();
      return true; // イベント終了
    }
    return false;
  }

  getRemainingTime() {
    if (!this.active) {
      return 0;
    }
    return Math.max(0, Math.floor((this.endTime - Date.now()) / 1000));
  }
}

class EventManager {
  constructor() {
    this.events = [
      new GameEvent(
        'cosmicExpress',
        '宇宙ヤマト便',
        'クリック報酬 ×10！',
        {
          start: () => {
            this.clickMultiplier = 10;
          },
          end: () => {
            this.clickMultiplier = 1;
          },
        },
        30,
        0.05, // 5%の確率
      ),
      new GameEvent(
        'catnipFestival',
        '銀河マタタビ祭',
        'SLvアップグレードコスト半減！',
        {
          start: () => {
            this.upgradeCostMultiplier = 0.5;
          },
          end: () => {
            this.upgradeCostMultiplier = 1;
          },
        },
        60,
        0.03, // 3%の確率
      ),
      new GameEvent(
        'gravityStorm',
        '重力嵐',
        '放置収益 ×5！',
        {
          start: () => {
            this.idleMultiplier = 5;
          },
          end: () => {
            this.idleMultiplier = 1;
          },
        },
        45,
        0.04, // 4%の確率
      ),
      new GameEvent(
        'quantumFluctuation',
        '量子ゆらぎ',
        '全収益 ×3！',
        {
          start: () => {
            this.clickMultiplier = 3;
            this.idleMultiplier = 3;
          },
          end: () => {
            this.clickMultiplier = 1;
            this.idleMultiplier = 1;
          },
        },
        20,
        0.02, // 2%の確率
      ),
      new GameEvent(
        'blackHoleBurp',
        'ブラックホールのげっぷ',
        '即座にGraviCoin大量獲得！',
        {
          start: () => {
            const bonus = resourceManager.getIdleValue() * 300; // 5分相当の放置収益
            resourceManager.addGraviCoin(bonus);
            if (window.effectsManager) {
              window.effectsManager.showFloatingNumber(bonus);
            }
          },
          end: () => {
            /* 即座に終了するイベント */
          },
        },
        0.1, // 即座に終了
        0.03, // 3%の確率
      ),
    ];

    this.activeEvents = [];
    this.lastCheckTime = Date.now();
    this.checkInterval = 10000; // 10秒ごとにチェック

    // 効果の乗数
    this.clickMultiplier = 1;
    this.idleMultiplier = 1;
    this.upgradeCostMultiplier = 1;
  }

  update() {
    const now = Date.now();

    // アクティブなイベントの更新
    this.activeEvents = this.activeEvents.filter((event) => {
      const ended = event.update();
      if (ended) {
        this.showEventEnd(event);
      }
      return !ended;
    });

    // 新しいイベントのチェック
    if (now - this.lastCheckTime >= this.checkInterval) {
      this.checkForNewEvents();
      this.lastCheckTime = now;
    }
  }

  checkForNewEvents() {
    // アクティブなイベントが多すぎる場合はスキップ
    if (this.activeEvents.length >= 2) {
      return;
    }

    this.events.forEach((event) => {
      // すでにアクティブなイベントはスキップ
      if (this.activeEvents.some((e) => e.id === event.id)) {
        return;
      }

      // 確率チェック
      if (Math.random() < event.chance) {
        this.startEvent(event);
      }
    });
  }

  startEvent(event) {
    event.start();
    this.activeEvents.push(event);
    this.showEventStart(event);

    // 実績チェック
    if (window.achievementManager) {
      window.achievementManager.checkAchievements();
    }
  }

  showEventStart(event) {
    const popup = document.getElementById('eventPopup');
    const titleEl = document.getElementById('eventTitle');
    const descEl = document.getElementById('eventDescription');

    if (popup && titleEl && descEl) {
      titleEl.textContent = event.name;
      descEl.textContent = event.description;
      popup.classList.add('active');

      // 一定時間後に非表示
      setTimeout(() => {
        popup.classList.remove('active');
      }, 3000);
    }
  }

  showEventEnd(event) {
    if (window.effectsManager) {
      window.effectsManager.showEventEndNotification(event.name + ' 終了');
    }
  }

  showCustomEvent(title, description, duration = 3000) {
    const popup = document.getElementById('eventPopup');
    const titleEl = document.getElementById('eventTitle');
    const descEl = document.getElementById('eventDescription');

    if (popup && titleEl && descEl) {
      titleEl.textContent = title;
      descEl.textContent = description;
      popup.classList.add('active');

      setTimeout(() => {
        popup.classList.remove('active');
      }, duration);
    }
  }

  // クリック時の乗数取得
  getClickMultiplier() {
    return this.clickMultiplier;
  }

  // 放置収益の乗数取得
  getIdleMultiplier() {
    return this.idleMultiplier;
  }

  // アップグレードコストの乗数取得
  getUpgradeCostMultiplier() {
    return this.upgradeCostMultiplier;
  }

  // アクティブなイベントの情報取得
  getActiveEventsInfo() {
    return this.activeEvents.map((event) => ({
      name: event.name,
      remainingTime: event.getRemainingTime(),
    }));
  }

  // セーブデータ
  getSaveData() {
    return {
      activeEvents: this.activeEvents.map((event) => ({
        id: event.id,
        endTime: event.endTime,
      })),
      lastCheckTime: this.lastCheckTime,
    };
  }

  loadSaveData(data) {
    if (data.lastCheckTime) {
      this.lastCheckTime = data.lastCheckTime;
    }

    if (data.activeEvents && Array.isArray(data.activeEvents)) {
      const now = Date.now();
      data.activeEvents.forEach((savedEvent) => {
        const event = this.events.find((e) => e.id === savedEvent.id);
        if (event && savedEvent.endTime > now) {
          event.active = true;
          event.endTime = savedEvent.endTime;
          event.effect.start();
          this.activeEvents.push(event);
        }
      });
    }
  }
}

// グローバルインスタンス
const eventManager = new EventManager();
window.eventManager = eventManager;
