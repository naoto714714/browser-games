// メインゲームロジック

class Game {
    constructor() {
        this.lastUpdateTime = Date.now();
        this.isRunning = false;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        this.uiUpdateInterval = 100; // UI更新間隔（ミリ秒）
        this.lastUIUpdateTime = Date.now();
    }
    
    init() {
        // ゲームの初期化
        console.log('ねこ型ブラックホール養殖場 - 初期化中...');
        
        // セーブデータの読み込み
        const loaded = saveManager.load();
        if (!loaded) {
            console.log('新規ゲーム開始');
        }
        
        // UI要素の初期化
        this.initializeUI();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // 初期UI更新
        this.updateAllUI();
        
        // ゲームループ開始
        this.start();
        
        // 自動セーブ開始
        saveManager.startAutoSave();
        
        console.log('初期化完了！');
    }
    
    initializeUI() {
        // 各マネージャーのUI初期化
        upgradeManager.updateUI();
        passiveManager.updateUI();
        achievementManager.updateUI();
        prestigeManager.updatePrestigeButton();
    }
    
    setupEventListeners() {
        // ペットボタン
        const petButton = document.getElementById('petButton');
        const catBlackhole = document.getElementById('catBlackhole');
        
        const handleClick = (e) => {
            // コンボシステム
            const comboMultiplier = window.comboManager ? comboManager.onClick() : 1;
            
            // クリック処理（コンボボーナス適用）
            const value = this.handleClick(comboMultiplier);
            
            // エフェクト
            effectsManager.animateCatClick();
            
            // マウス位置でフローティング数字表示
            if (e.clientX && e.clientY) {
                effectsManager.showFloatingNumber(value, e.clientX, e.clientY);
            } else {
                effectsManager.showFloatingNumber(value);
            }
        };
        
        if (petButton) {
            petButton.addEventListener('click', handleClick);
        }
        
        if (catBlackhole) {
            catBlackhole.addEventListener('click', handleClick);
        }
        
        // 次元跳躍ボタン
        setupPrestigeButton();
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 's':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        saveManager.save();
                    }
                    break;
                case 'e':
                    if (e.ctrlKey && e.shiftKey) {
                        e.preventDefault();
                        saveManager.exportSave();
                    }
                    break;
                case 'i':
                    if (e.ctrlKey && e.shiftKey) {
                        e.preventDefault();
                        saveManager.importSave();
                    }
                    break;
            }
        });
    }
    
    handleClick(comboMultiplier = 1) {
        // 各種乗数を適用
        const eventMultiplier = eventManager.getClickMultiplier();
        const passiveMultiplier = passiveManager.getClickMultiplier();
        const totalMultiplier = eventMultiplier * passiveMultiplier * comboMultiplier;
        
        // 元のクリック値を保存
        const originalMultiplier = resourceManager.clickMultiplier;
        resourceManager.clickMultiplier *= totalMultiplier;
        
        // クリック実行
        const value = resourceManager.click();
        
        // 乗数を戻す
        resourceManager.clickMultiplier = originalMultiplier;
        
        return value;
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const now = Date.now();
        const deltaTime = now - this.lastUpdateTime;
        
        // ゲーム更新
        this.update(deltaTime);
        
        // 次フレーム
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // 放置収益の計算
        const idleMultiplier = eventManager.getIdleMultiplier() * passiveManager.getIdleMultiplier();
        const originalMultiplier = resourceManager.idleMultiplier;
        resourceManager.idleMultiplier *= idleMultiplier;
        
        resourceManager.updateIdle(deltaTime);
        
        resourceManager.idleMultiplier = originalMultiplier;
        
        // 各システムの更新
        eventManager.update();
        achievementManager.update();
        
        // UI更新（一定間隔で）
        const now = Date.now();
        if (now - this.lastUIUpdateTime >= this.uiUpdateInterval) {
            this.updateUI();
            this.lastUIUpdateTime = now;
        }
        
        this.lastUpdateTime = now;
    }
    
    updateUI() {
        // リソース表示更新
        const graviCoinEl = document.getElementById('graviCoin');
        const singularityLevelEl = document.getElementById('singularityLevel');
        const quantumYarnEl = document.getElementById('quantumYarn');
        const gcPerSecEl = document.getElementById('gcPerSec');
        const clickValueEl = document.getElementById('clickValue');
        
        if (graviCoinEl) {
            graviCoinEl.textContent = formatNumber(resourceManager.graviCoin);
        }
        
        if (singularityLevelEl) {
            singularityLevelEl.textContent = resourceManager.singularityLevel;
        }
        
        if (quantumYarnEl) {
            quantumYarnEl.textContent = formatNumber(resourceManager.quantumYarn);
        }
        
        if (gcPerSecEl) {
            const idleValue = resourceManager.getIdleValue() * 
                eventManager.getIdleMultiplier() * 
                passiveManager.getIdleMultiplier();
            gcPerSecEl.textContent = formatNumber(idleValue);
        }
        
        if (clickValueEl) {
            const clickValue = resourceManager.getClickValue() * 
                eventManager.getClickMultiplier() * 
                passiveManager.getClickMultiplier();
            clickValueEl.textContent = '+' + formatNumber(clickValue);
        }
        
        // 次元跳躍ボタン更新
        prestigeManager.updatePrestigeButton();
        
        // アクティブイベント表示
        this.updateActiveEvents();
    }
    
    updateAllUI() {
        this.updateUI();
        upgradeManager.updateUI();
        passiveManager.updateUI();
        achievementManager.updateUI();
    }
    
    updateActiveEvents() {
        const activeEvents = eventManager.getActiveEventsInfo();
        
        // アクティブイベントをUIに表示（必要に応じて実装）
        if (activeEvents.length > 0) {
            // タイトルバーやステータスバーに表示するなど
        }
    }
    
    // デバッグ用関数
    debug = {
        addGC: (amount) => {
            resourceManager.addGraviCoin(amount);
            console.log(`Added ${amount} GC`);
        },
        
        addQY: (amount) => {
            resourceManager.addQuantumYarn(amount);
            console.log(`Added ${amount} QY`);
        },
        
        setSLv: (level) => {
            resourceManager.singularityLevel = level;
            console.log(`Set SLv to ${level}`);
        },
        
        triggerEvent: (eventId) => {
            const event = eventManager.events.find(e => e.id === eventId);
            if (event) {
                eventManager.startEvent(event);
                console.log(`Triggered event: ${event.name}`);
            } else {
                console.log(`Event not found: ${eventId}`);
            }
        },
        
        unlockAllAchievements: () => {
            achievementManager.achievements.forEach(achievement => {
                achievement.unlock();
            });
            achievementManager.updateUI();
            console.log('All achievements unlocked');
        },
        
        resetSave: () => {
            if (confirm('本当にリセットしますか？')) {
                saveManager.deleteSave();
            }
        }
    };
}

// ゲーム開始
const game = new Game();

// ページ読み込み完了時に初期化
window.addEventListener('DOMContentLoaded', () => {
    game.init();
});

// ページ離脱時に保存
window.addEventListener('beforeunload', () => {
    saveManager.save();
});

// デバッグ用にグローバルに公開
window.game = game;