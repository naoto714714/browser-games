// セーブ/ロードシステム

class SaveManager {
  constructor() {
    this.saveKey = 'cataclysmicCatRanchSave';
    this.autoSaveInterval = 30000; // 30秒ごとに自動セーブ
    this.lastSaveTime = Date.now();
    this.version = '1.0.0';
  }

  // ゲームデータを保存
  save() {
    const saveData = {
      version: this.version,
      timestamp: Date.now(),
      resources: resourceManager.getSaveData(),
      upgrades: upgradeManager.getSaveData(),
      passives: passiveManager.getSaveData(),
      prestige: prestigeManager.getSaveData(),
      events: eventManager.getSaveData(),
      achievements: achievementManager.getSaveData(),
    };

    try {
      const saveString = btoa(JSON.stringify(saveData));
      localStorage.setItem(this.saveKey, saveString);
      this.lastSaveTime = Date.now();
      this.showSaveNotification('ゲームを保存しました');
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      this.showSaveNotification('保存に失敗しました', true);
      return false;
    }
  }

  // ゲームデータを読み込み
  load() {
    try {
      const saveString = localStorage.getItem(this.saveKey);
      if (!saveString) {
        return false;
      }

      const saveData = JSON.parse(atob(saveString));

      // バージョンチェック（将来の互換性のため）
      if (saveData.version !== this.version) {
        this.migrateSaveData(saveData);
      }

      // 各システムにデータを読み込み
      if (saveData.resources) {resourceManager.loadSaveData(saveData.resources);}
      if (saveData.upgrades) {upgradeManager.loadSaveData(saveData.upgrades);}
      if (saveData.passives) {passiveManager.loadSaveData(saveData.passives);}
      if (saveData.prestige) {prestigeManager.loadSaveData(saveData.prestige);}
      if (saveData.events) {eventManager.loadSaveData(saveData.events);}
      if (saveData.achievements)
      {achievementManager.loadSaveData(saveData.achievements);}

      // オフライン進行の計算
      if (saveData.timestamp) {
        const offlineTime = Date.now() - saveData.timestamp;
        this.calculateOfflineProgress(offlineTime);
      }

      this.showSaveNotification('ゲームを読み込みました');
      return true;
    } catch (e) {
      console.error('Load failed:', e);
      this.showSaveNotification('読み込みに失敗しました', true);
      return false;
    }
  }

  // オフライン進行の計算と適用
  calculateOfflineProgress(offlineTime) {
    // 最大72時間までのオフライン進行
    const maxOfflineTime = 72 * 60 * 60 * 1000;
    const cappedOfflineTime = Math.min(offlineTime, maxOfflineTime);

    if (cappedOfflineTime > 60000) {
      // 1分以上オフラインだった場合
      const offlineEarnings =
        resourceManager.calculateOfflineProgress(cappedOfflineTime);

      if (offlineEarnings > 0) {
        resourceManager.addGraviCoin(offlineEarnings);

        // オフライン報酬の通知
        const timeText = formatTime(cappedOfflineTime / 1000);
        if (window.eventManager) {
          window.eventManager.showCustomEvent(
            'おかえりニャ！',
            `${timeText}の間に ${formatNumber(
              offlineEarnings
            )} GC を獲得したニャ！`,
            5000
          );
        }
      }
    }
  }

  // セーブデータの削除
  deleteSave() {
    if (
      confirm('本当にセーブデータを削除しますか？\nこの操作は取り消せません。')
    ) {
      localStorage.removeItem(this.saveKey);
      this.showSaveNotification('セーブデータを削除しました');
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  }

  // セーブデータのエクスポート
  exportSave() {
    const saveString = localStorage.getItem(this.saveKey);
    if (saveString) {
      const textArea = document.createElement('textarea');
      textArea.value = saveString;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showSaveNotification('セーブデータをクリップボードにコピーしました');
    } else {
      this.showSaveNotification('エクスポートするデータがありません', true);
    }
  }

  // セーブデータのインポート
  importSave() {
    const input = prompt('セーブデータを貼り付けてください:');
    if (input) {
      try {
        // 検証
        const testData = JSON.parse(atob(input));
        if (testData.version && testData.resources) {
          localStorage.setItem(this.saveKey, input);
          this.showSaveNotification('セーブデータをインポートしました');
          setTimeout(() => {
            location.reload();
          }, 1000);
        } else {
          throw new Error('Invalid save data');
        }
      } catch (e) {
        this.showSaveNotification('無効なセーブデータです', true);
      }
    }
  }

  // 自動セーブの開始
  startAutoSave() {
    setInterval(() => {
      this.save();
    }, this.autoSaveInterval);
  }

  // セーブ通知の表示
  showSaveNotification(message, isError = false) {
    // 簡易的な通知（effectsManagerが実装されたら置き換え）
    console.log(isError ? '[ERROR]' : '[SAVE]', message);

    if (window.effectsManager) {
      window.effectsManager.showNotification(message, isError);
    }
  }

  // セーブデータの移行（将来のバージョンアップ用）
  migrateSaveData(saveData) {
    // 将来のバージョンアップでセーブデータの構造が変わった場合の処理
    console.log(
      'Migrating save data from version',
      saveData.version,
      'to',
      this.version
    );
  }

  // セーブ統計の取得
  getSaveStats() {
    const saveString = localStorage.getItem(this.saveKey);
    if (!saveString) {return null;}

    try {
      const saveData = JSON.parse(atob(saveString));
      return {
        version: saveData.version,
        lastSaved: new Date(saveData.timestamp).toLocaleString(),
        playTime: this.calculatePlayTime(saveData),
        totalGC: saveData.resources?.totalGraviCoinEarned || 0,
        totalPrestige: saveData.resources?.totalPrestige || 0,
        achievements: `${achievementManager.getUnlockedCount()}/${achievementManager.getTotalCount()}`,
      };
    } catch (e) {
      return null;
    }
  }

  calculatePlayTime(saveData) {
    // 簡易的なプレイ時間計算
    const firstSaveTime = saveData.firstSaveTime || saveData.timestamp;
    const totalMs = Date.now() - firstSaveTime;
    return formatTime(totalMs / 1000);
  }
}

// グローバルインスタンス
const saveManager = new SaveManager();
