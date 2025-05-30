// リソース管理システム

class Resources {
    constructor() {
        this.graviCoin = 0;
        this.singularityLevel = 1;
        this.quantumYarn = 0;
        
        // 基本値
        this.baseClick = 1;
        this.baseIdle = 0;
        
        // 乗数
        this.clickMultiplier = 1;
        this.idleMultiplier = 1;
        
        // 統計情報
        this.totalGraviCoinEarned = 0;
        this.totalClicks = 0;
        this.totalPrestige = 0;
        
        // オフライン進行用
        this.lastSaveTime = Date.now();
    }
    
    // クリック収益計算
    getClickValue() {
        const baseValue = this.baseClick * this.clickMultiplier * (1 + this.singularityLevel * 0.1);
        return baseValue * this.getBlackHoleCoreMultiplier();
    }
    
    // 放置収益計算（秒あたり）
    getIdleValue() {
        if (this.baseIdle === 0) return 0;
        const baseValue = this.baseIdle * this.singularityLevel * this.idleMultiplier;
        return baseValue * this.getBlackHoleCoreMultiplier();
    }
    
    // ブラックホールコアの全収益倍率
    getBlackHoleCoreMultiplier() {
        if (window.upgradeManager) {
            const coreLevel = upgradeManager.getUpgrade('blackHoleCore').level;
            return 1 + (coreLevel * 0.25);
        }
        return 1;
    }
    
    // クリック処理
    click() {
        const value = this.getClickValue();
        this.addGraviCoin(value);
        this.totalClicks++;
        return value;
    }
    
    // GraviCoin追加
    addGraviCoin(amount) {
        this.graviCoin += amount;
        this.totalGraviCoinEarned += amount;
    }
    
    // GraviCoin消費
    spendGraviCoin(amount) {
        if (this.graviCoin >= amount) {
            this.graviCoin -= amount;
            return true;
        }
        return false;
    }
    
    // 量子毛玉追加
    addQuantumYarn(amount) {
        this.quantumYarn += amount;
    }
    
    // 量子毛玉消費
    spendQuantumYarn(amount) {
        if (this.quantumYarn >= amount) {
            this.quantumYarn -= amount;
            return true;
        }
        return false;
    }
    
    // Singularity Level上昇
    increaseSingularityLevel(amount = 1) {
        this.singularityLevel += amount;
    }
    
    // 放置収益更新（deltaTimeはミリ秒）
    updateIdle(deltaTime) {
        const idlePerSec = this.getIdleValue();
        if (idlePerSec > 0) {
            const earned = idlePerSec * (deltaTime / 1000);
            this.addGraviCoin(earned);
            return earned;
        }
        return 0;
    }
    
    // オフライン進行計算
    calculateOfflineProgress(offlineTime) {
        // オフライン時間を秒に変換
        const offlineSeconds = offlineTime / 1000;
        
        // 時間反転コア効果（後で実装予定）
        let timeMultiplier = 1;
        if (window.passiveManager && window.passiveManager.hasPassive('timeReverse')) {
            // 時間の2乗で計算（最大24時間まで）
            const cappedHours = Math.min(offlineSeconds / 3600, 24);
            timeMultiplier = Math.pow(cappedHours, 2) / cappedHours || 1;
        }
        
        const baseEarnings = this.getIdleValue() * offlineSeconds;
        return baseEarnings * timeMultiplier;
    }
    
    // 次元跳躍時のリセット
    reset() {
        this.graviCoin = 0;
        this.singularityLevel = 1;
        this.totalPrestige++;
        
        // 基本値は保持（パッシブで強化される）
        // this.baseClick = 1;
        // this.baseIdle = 0;
    }
    
    // セーブデータ生成
    getSaveData() {
        return {
            graviCoin: this.graviCoin,
            singularityLevel: this.singularityLevel,
            quantumYarn: this.quantumYarn,
            baseClick: this.baseClick,
            baseIdle: this.baseIdle,
            clickMultiplier: this.clickMultiplier,
            idleMultiplier: this.idleMultiplier,
            totalGraviCoinEarned: this.totalGraviCoinEarned,
            totalClicks: this.totalClicks,
            totalPrestige: this.totalPrestige,
            lastSaveTime: Date.now()
        };
    }
    
    // セーブデータ読み込み
    loadSaveData(data) {
        if (data.graviCoin !== undefined) this.graviCoin = data.graviCoin;
        if (data.singularityLevel !== undefined) this.singularityLevel = data.singularityLevel;
        if (data.quantumYarn !== undefined) this.quantumYarn = data.quantumYarn;
        if (data.baseClick !== undefined) this.baseClick = data.baseClick;
        if (data.baseIdle !== undefined) this.baseIdle = data.baseIdle;
        if (data.clickMultiplier !== undefined) this.clickMultiplier = data.clickMultiplier;
        if (data.idleMultiplier !== undefined) this.idleMultiplier = data.idleMultiplier;
        if (data.totalGraviCoinEarned !== undefined) this.totalGraviCoinEarned = data.totalGraviCoinEarned;
        if (data.totalClicks !== undefined) this.totalClicks = data.totalClicks;
        if (data.totalPrestige !== undefined) this.totalPrestige = data.totalPrestige;
        if (data.lastSaveTime !== undefined) this.lastSaveTime = data.lastSaveTime;
    }
}

// グローバルインスタンス
const resourceManager = new Resources();