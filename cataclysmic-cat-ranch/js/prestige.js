// 次元跳躍システム

class PrestigeManager {
  constructor() {
    this.minGraviCoinForPrestige = 1e6; // 100万GCから次元跳躍可能
    this.baseQuantumYarnGain = 1;
    this.quantumYarnExponent = 0.5; // GCの平方根に比例
  }

  // 次元跳躍可能かチェック
  canPrestige() {
    return resourceManager.graviCoin >= this.minGraviCoinForPrestige;
  }

  // 獲得できる量子毛玉の計算
  calculateQuantumYarnGain() {
    if (!this.canPrestige()) {
      return 0;
    }

    // 基本計算: (GC / 100万) ^ 0.5
    const baseGain = Math.floor(
      Math.pow(
        resourceManager.graviCoin / this.minGraviCoinForPrestige,
        this.quantumYarnExponent
      )
    );

    // パッシブスキルによる倍率
    const multiplier = passiveManager.getPrestigeMultiplier();

    return Math.max(
      this.baseQuantumYarnGain,
      Math.floor(baseGain * multiplier)
    );
  }

  // 次元跳躍実行
  performPrestige() {
    if (!this.canPrestige()) {
      return false;
    }

    const quantumYarnGain = this.calculateQuantumYarnGain();

    // 量子毛玉を獲得
    resourceManager.addQuantumYarn(quantumYarnGain);

    // リソースをリセット
    resourceManager.reset();

    // アップグレードをリセット
    upgradeManager.reset();

    // 初期Singularity Levelを設定（パッシブスキルによる）
    const initialSLv = passiveManager.getInitialSingularityLevel();
    resourceManager.singularityLevel = initialSLv;

    // 次のパッシブスキルを解放
    passiveManager.unlockNextPassive();

    // UIを更新
    this.updatePrestigeButton();

    // 次元跳躍エフェクト
    if (window.effectsManager) {
      window.effectsManager.showPrestigeEffect();
    }

    // 実績チェック
    if (window.achievementManager) {
      window.achievementManager.checkAchievements();
    }

    return true;
  }

  // 次元跳躍ボタンの更新
  updatePrestigeButton() {
    const button = document.getElementById('prestigeButton');
    const rewardSpan = document.getElementById('prestigeReward');

    if (!button || !rewardSpan) {
      return;
    }

    const canPrestige = this.canPrestige();
    const quantumYarnGain = this.calculateQuantumYarnGain();

    button.disabled = !canPrestige;
    rewardSpan.textContent = formatNumber(quantumYarnGain);

    // 次元跳躍可能になったら推奨ポップアップを表示
    if (canPrestige && !this.prestigeRecommended) {
      this.showPrestigeRecommendation();
      this.prestigeRecommended = true;
    }

    // GCが推奨値を下回ったらフラグをリセット
    if (!canPrestige) {
      this.prestigeRecommended = false;
    }
  }

  // 次元跳躍推奨ポップアップ
  showPrestigeRecommendation() {
    if (window.eventManager) {
      window.eventManager.showCustomEvent(
        '次元跳躍推奨',
        `${formatNumber(
          this.calculateQuantumYarnGain()
        )} 量子毛玉を獲得できるニャ！`,
        5000
      );
    }
  }

  // 次元跳躍の説明テキスト生成
  getPrestigeInfo() {
    const quantumYarnGain = this.calculateQuantumYarnGain();
    const currentQY = resourceManager.quantumYarn;
    const totalQY = currentQY + quantumYarnGain;

    return {
      canPrestige: this.canPrestige(),
      quantumYarnGain: quantumYarnGain,
      currentQY: currentQY,
      totalQY: totalQY,
      requirement: this.minGraviCoinForPrestige,
      currentGC: resourceManager.graviCoin,
    };
  }

  // セーブデータ（特に保存するものはないが、将来の拡張のため）
  getSaveData() {
    return {
      prestigeRecommended: this.prestigeRecommended || false,
    };
  }

  loadSaveData(data) {
    if (data.prestigeRecommended !== undefined) {
      this.prestigeRecommended = data.prestigeRecommended;
    }
  }
}

// グローバルインスタンス
const prestigeManager = new PrestigeManager();

// 次元跳躍ボタンのイベントリスナー設定（game.jsから呼ばれる）
function setupPrestigeButton() {
  const button = document.getElementById('prestigeButton');
  if (button) {
    button.addEventListener('click', () => {
      // 確認ダイアログ
      const info = prestigeManager.getPrestigeInfo();
      if (info.canPrestige) {
        const message =
          '次元跳躍を実行しますか？\n\n' +
          `獲得量子毛玉: ${formatNumber(info.quantumYarnGain)}\n` +
          `現在の量子毛玉: ${formatNumber(info.currentQY)} → ${formatNumber(
            info.totalQY
          )}\n\n` +
          '※GraviCoinとSingularity Levelはリセットされます';

        if (confirm(message)) {
          prestigeManager.performPrestige();
        }
      }
    });
  }
}
