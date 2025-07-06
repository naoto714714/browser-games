// 実績システム

class Achievement {
  constructor(id, name, description, checkCondition, reward) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.checkCondition = checkCondition;
    this.reward = reward;
    this.unlocked = false;
    this.unlockedAt = null;
  }

  check() {
    if (!this.unlocked && this.checkCondition()) {
      this.unlock();
      return true;
    }
    return false;
  }

  unlock() {
    this.unlocked = true;
    this.unlockedAt = Date.now();
    if (this.reward) {
      this.reward();
    }
  }

  getSaveData() {
    return {
      id: this.id,
      unlocked: this.unlocked,
      unlockedAt: this.unlockedAt,
    };
  }

  loadSaveData(data) {
    if (data.unlocked !== undefined) {
      this.unlocked = data.unlocked;
    }
    if (data.unlockedAt !== undefined) {
      this.unlockedAt = data.unlockedAt;
    }
  }
}

class AchievementManager {
  constructor() {
    this.achievements = [
      // GraviCoin関連
      new Achievement(
        'first_thousand',
        '小さな一歩',
        '1,000 GC を獲得',
        () => resourceManager.graviCoin >= 1000,
        () => {
          resourceManager.clickMultiplier *= 1.05;
        },
      ),
      new Achievement(
        'million_gc',
        'ミリオネア',
        '1M GC を獲得',
        () => resourceManager.graviCoin >= 1e6,
        () => {
          resourceManager.idleMultiplier *= 1.1;
        },
      ),
      new Achievement(
        'billion_gc',
        'ビリオネア',
        '1G GC を獲得',
        () => resourceManager.graviCoin >= 1e9,
        () => {
          resourceManager.clickMultiplier *= 1.1;
        },
      ),
      new Achievement(
        'yocto_gc',
        'ヨクトシング到達',
        '1Y GC を獲得',
        () => resourceManager.graviCoin >= 1e24,
        () => {
          resourceManager.idleMultiplier *= 1.2;
        },
      ),

      // クリック関連
      new Achievement(
        'click_100',
        'ねこ好き',
        '100回クリック',
        () => resourceManager.totalClicks >= 100,
        () => {
          resourceManager.baseClick += 0.5;
        },
      ),
      new Achievement(
        'click_1000',
        'ねこマニア',
        '1,000回クリック',
        () => resourceManager.totalClicks >= 1000,
        () => {
          resourceManager.baseClick += 2;
        },
      ),
      new Achievement(
        'click_10000',
        'ねこ中毒',
        '10,000回クリック',
        () => resourceManager.totalClicks >= 10000,
        () => {
          resourceManager.clickMultiplier *= 1.15;
        },
      ),

      // 放置収益関連
      new Achievement(
        'idle_100',
        'ホーキング放射観測',
        '放置収益 100/秒 達成',
        () => resourceManager.getIdleValue() >= 100,
        () => {
          resourceManager.baseIdle += 10;
        },
      ),
      new Achievement(
        'idle_1t',
        '重力波発電所',
        '放置収益 1T/秒 達成',
        () => resourceManager.getIdleValue() >= 1e12,
        () => {
          resourceManager.idleMultiplier *= 1.25;
        },
      ),

      // Singularity Level関連
      new Achievement(
        'slv_10',
        '成長期',
        'Singularity Level 10 達成',
        () => resourceManager.singularityLevel >= 10,
        () => {
          resourceManager.clickMultiplier *= 1.1;
        },
      ),
      new Achievement(
        'slv_50',
        '特異点接近',
        'Singularity Level 50 達成',
        () => resourceManager.singularityLevel >= 50,
        () => {
          resourceManager.idleMultiplier *= 1.15;
        },
      ),
      new Achievement(
        'slv_100',
        '事象の地平線',
        'Singularity Level 100 達成',
        () => resourceManager.singularityLevel >= 100,
        () => {
          resourceManager.clickMultiplier *= 1.2;
          resourceManager.idleMultiplier *= 1.2;
        },
      ),

      // 次元跳躍関連
      new Achievement(
        'first_prestige',
        '次元旅行者',
        '初めて次元跳躍',
        () => resourceManager.totalPrestige >= 1,
        () => {
          /* 特別な報酬なし */
        },
      ),
      new Achievement(
        'prestige_10',
        '多次元ねこ',
        '10回次元跳躍',
        () => resourceManager.totalPrestige >= 10,
        () => {
          resourceManager.baseClick += 5;
        },
      ),
      new Achievement(
        'qy_100',
        '量子毛玉コレクター',
        '100 量子毛玉を保持',
        () => resourceManager.quantumYarn >= 100,
        () => {
          /* 特別な報酬なし */
        },
      ),

      // イベント関連
      new Achievement(
        'first_event',
        'ラッキーキャット',
        '初めてイベント発生',
        () => eventManager.activeEvents.length > 0,
        () => {
          /* 特別な報酬なし */
        },
      ),

      // 総合
      new Achievement(
        'total_earned_1e50',
        '宇宙の支配者',
        '累計 1e50 GC 獲得',
        () => resourceManager.totalGraviCoinEarned >= 1e50,
        () => {
          resourceManager.clickMultiplier *= 1.5;
          resourceManager.idleMultiplier *= 1.5;
        },
      ),
    ];

    this.achievementMap = {};
    this.achievements.forEach(achievement => {
      this.achievementMap[achievement.id] = achievement;
    });

    this.lastCheckTime = Date.now();
    this.checkInterval = 1000; // 1秒ごとにチェック
  }

  update() {
    const now = Date.now();
    if (now - this.lastCheckTime >= this.checkInterval) {
      this.checkAchievements();
      this.lastCheckTime = now;
    }
  }

  checkAchievements() {
    const newUnlocks = [];

    this.achievements.forEach(achievement => {
      if (achievement.check()) {
        newUnlocks.push(achievement);
      }
    });

    if (newUnlocks.length > 0) {
      this.showUnlockedAchievements(newUnlocks);
      this.updateUI();
    }
  }

  showUnlockedAchievements(achievements) {
    achievements.forEach((achievement, index) => {
      setTimeout(() => {
        if (window.eventManager) {
          window.eventManager.showCustomEvent(
            '実績解除！',
            `「${achievement.name}」\n${achievement.description}`,
            4000,
          );
        }
      }, index * 1000); // 1秒ずつずらして表示
    });
  }

  updateUI() {
    const container = document.getElementById('achievementsList');
    if (!container) {
      return;
    }

    container.innerHTML = '';

    // 解除済みと未解除を分けて表示
    const unlocked = this.achievements.filter(a => a.unlocked);
    const locked = this.achievements.filter(a => !a.unlocked);

    // 解除済み実績
    unlocked.forEach(achievement => {
      const div = document.createElement('div');
      div.className = 'achievement-item unlocked';

      div.innerHTML = `
                <div class="item-name">✨ ${achievement.name}</div>
                <div class="item-effect">${achievement.description}</div>
            `;

      container.appendChild(div);
    });

    // 未解除実績（ヒント表示）
    locked.forEach(achievement => {
      const div = document.createElement('div');
      div.className = 'achievement-item locked';

      div.innerHTML = `
                <div class="item-name">? ? ?</div>
                <div class="item-effect">${this.getHint(achievement)}</div>
            `;

      container.appendChild(div);
    });
  }

  getHint(achievement) {
    // 実績のヒントを返す
    const hints = {
      first_thousand: 'GCを集めよう',
      million_gc: 'もっとGCを集めよう',
      billion_gc: 'さらにGCを集めよう',
      yocto_gc: '究極のGCコレクター',
      click_100: 'ねこを撫でよう',
      click_1000: 'もっと撫でよう',
      click_10000: 'ひたすら撫でよう',
      idle_100: '放置収益を上げよう',
      idle_1t: '究極の放置収益',
      slv_10: 'ねこを成長させよう',
      slv_50: 'もっと成長させよう',
      slv_100: '究極の成長',
      first_prestige: '次元を超えよう',
      prestige_10: '何度も次元を超えよう',
      qy_100: '量子毛玉を集めよう',
      first_event: '運を味方に',
      total_earned_1e50: '究極の支配者',
    };

    return hints[achievement.id] || '???';
  }

  getUnlockedCount() {
    return this.achievements.filter(a => a.unlocked).length;
  }

  getTotalCount() {
    return this.achievements.length;
  }

  getSaveData() {
    return this.achievements.map(achievement => achievement.getSaveData());
  }

  loadSaveData(data) {
    if (!Array.isArray(data)) {
      return;
    }

    data.forEach(achievementData => {
      const achievement = this.achievementMap[achievementData.id];
      if (achievement) {
        achievement.loadSaveData(achievementData);
      }
    });
  }
}

// グローバルインスタンス
const achievementManager = new AchievementManager();
window.achievementManager = achievementManager;
