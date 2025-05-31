/**
 * Reaction Time Game Logic
 * 反射神経ゲームのメインロジック
 */

class ReactionGame {
    constructor(canvas, pixelRenderer) {
        this.canvas = canvas;
        this.renderer = pixelRenderer;
        
        // ゲーム状態
        this.gameState = 'waiting'; // waiting, countdown, ready, signal, reaction, result
        this.score = 0;
        this.level = 1;
        this.bestTime = localStorage.getItem('bestReactionTime') || null;
        this.currentRound = 0;
        this.maxRounds = 5;
        
        // タイミング関連
        this.countdownTimer = 0;
        this.countdownValue = 3;
        this.signalStartTime = 0;
        this.reactionTime = 0;
        this.signalDelay = 0; // ランダム遅延
        
        // 難易度設定
        this.difficulty = {
            1: { minDelay: 2000, maxDelay: 5000, falseStartPenalty: 500 },
            2: { minDelay: 1500, maxDelay: 4000, falseStartPenalty: 400 },
            3: { minDelay: 1000, maxDelay: 3500, falseStartPenalty: 300 },
            4: { minDelay: 800, maxDelay: 3000, falseStartPenalty: 200 },
            5: { minDelay: 600, maxDelay: 2500, falseStartPenalty: 100 }
        };
        
        // 音声効果（Web Audio API使用）
        this.audioContext = null;
        this.initAudio();
        
        // 入力ハンドリング
        this.setupInputHandlers();
        
        // キャラクター状態
        this.catExpression = 'normal';
        this.catPosition = { x: 80, y: 60 };
        this.signalLight = 'red';
        
        // パフォーマンス評価
        this.performanceMessages = {
            excellent: ['完璧！', '素晴らしい反射神経！', '忍者並みの速さ！'],
            good: ['良い反応！', 'なかなかやるね！', 'いい感じ！'],
            average: ['普通だね', 'もう少し早く！', '集中して！'],
            slow: ['遅いよ〜', '気を引き締めて！', '頑張って！'],
            falseStart: ['フライング！', '早すぎる！', '待って！']
        };
    }
    
    // 音声初期化
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    // ビープ音生成
    playBeep(frequency = 800, duration = 200, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    // 成功音
    playSuccessSound() {
        this.playBeep(523, 150); // C5
        setTimeout(() => this.playBeep(659, 150), 100); // E5
        setTimeout(() => this.playBeep(784, 200), 200); // G5
    }
    
    // エラー音
    playErrorSound() {
        this.playBeep(220, 300, 'sawtooth'); // A3
    }
    
    // カウントダウン音
    playCountdownSound() {
        this.playBeep(440, 100); // A4
    }
    
    // GO音
    playGoSound() {
        this.playBeep(880, 200); // A5
    }
    
    // 入力ハンドリング設定
    setupInputHandlers() {
        // キーボード入力
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                this.handleInput();
            }
        });
        
        // マウス/タッチ入力
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        // 右クリック無効化
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    // 入力処理
    handleInput() {
        const currentTime = Date.now();
        
        switch (this.gameState) {
            case 'waiting':
                this.startCountdown();
                break;
                
            case 'countdown':
            case 'ready':
                // フライング
                this.handleFalseStart();
                break;
                
            case 'signal':
                // 正常な反応
                this.reactionTime = currentTime - this.signalStartTime;
                this.gameState = 'result';
                this.processReaction();
                break;
        }
    }
    
    // ゲーム開始
    startGame() {
        this.score = 0;
        this.level = 1;
        this.currentRound = 0;
        this.gameState = 'waiting';
        this.catExpression = 'normal';
        this.updateUI();
    }
    
    // カウントダウン開始
    startCountdown() {
        this.gameState = 'countdown';
        this.countdownValue = 3;
        this.countdownTimer = Date.now();
        this.catExpression = 'focused';
        
        this.playCountdownSound();
        
        // カウントダウン処理
        const countdownInterval = setInterval(() => {
            this.countdownValue--;
            
            if (this.countdownValue > 0) {
                this.playCountdownSound();
            } else {
                clearInterval(countdownInterval);
                this.startReadyPhase();
            }
        }, 1000);
    }
    
    // 準備フェーズ
    startReadyPhase() {
        this.gameState = 'ready';
        this.signalLight = 'yellow';
        
        // ランダム遅延設定
        const difficulty = this.difficulty[Math.min(this.level, 5)];
        this.signalDelay = Math.random() * (difficulty.maxDelay - difficulty.minDelay) + difficulty.minDelay;
        
        // 信号表示タイマー
        setTimeout(() => {
            if (this.gameState === 'ready') {
                this.showSignal();
            }
        }, this.signalDelay);
    }
    
    // 信号表示
    showSignal() {
        this.gameState = 'signal';
        this.signalStartTime = Date.now();
        this.signalLight = 'green';
        this.catExpression = 'surprised';
        
        this.playGoSound();
        
        // エフェクト追加
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.renderer.addSparkle(
                    Math.random() * 200,
                    Math.random() * 150
                );
            }, i * 50);
        }
    }
    
    // フライング処理
    handleFalseStart() {
        this.gameState = 'result';
        this.reactionTime = -1; // フライングマーク
        this.catExpression = 'surprised';
        
        this.playErrorSound();
        this.processReaction();
    }
    
    // 反応処理
    processReaction() {
        let performance, message, points = 0;
        
        if (this.reactionTime === -1) {
            // フライング
            performance = 'falseStart';
            const penalty = this.difficulty[Math.min(this.level, 5)].falseStartPenalty;
            this.score = Math.max(0, this.score - penalty);
            this.catExpression = 'surprised';
        } else {
            // 正常な反応時間評価
            if (this.reactionTime < 200) {
                performance = 'excellent';
                points = 1000;
                this.catExpression = 'happy';
            } else if (this.reactionTime < 300) {
                performance = 'good';
                points = 500;
                this.catExpression = 'happy';
            } else if (this.reactionTime < 500) {
                performance = 'average';
                points = 200;
                this.catExpression = 'normal';
            } else {
                performance = 'slow';
                points = 50;
                this.catExpression = 'normal';
            }
            
            // レベルボーナス
            points += (this.level - 1) * 100;
            this.score += points;
            
            // ベストタイム更新
            if (!this.bestTime || this.reactionTime < this.bestTime) {
                this.bestTime = this.reactionTime;
                localStorage.setItem('bestReactionTime', this.bestTime);
                
                // 新記録エフェクト
                for (let i = 0; i < 5; i++) {
                    this.renderer.addHeart(
                        this.catPosition.x + Math.random() * 40,
                        this.catPosition.y + Math.random() * 40
                    );
                }
            }
            
            this.playSuccessSound();
        }
        
        // メッセージ選択
        const messages = this.performanceMessages[performance];
        message = messages[Math.floor(Math.random() * messages.length)];
        
        // UI更新
        this.updateResultUI(message);
        this.updateUI();
        
        // ラウンド進行
        this.currentRound++;
        if (this.currentRound >= this.maxRounds) {
            this.levelUp();
        }
    }
    
    // レベルアップ
    levelUp() {
        this.level++;
        this.currentRound = 0;
        
        // レベルアップエフェクト
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.renderer.addSparkle(
                    Math.random() * 200,
                    Math.random() * 150
                );
            }, i * 30);
        }
        
        this.playSuccessSound();
    }
    
    // 次のラウンド
    nextRound() {
        this.gameState = 'waiting';
        this.catExpression = 'normal';
        this.signalLight = 'red';
        this.reactionTime = 0;
    }
    
    // UI更新
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('best-time').textContent = 
            this.bestTime ? `${this.bestTime}ms` : '---';
    }
    
    // 結果UI更新
    updateResultUI(message) {
        const resultPanel = document.getElementById('result-panel');
        const reactionTimeElement = document.getElementById('reaction-time');
        const messageElement = document.getElementById('result-message');
        
        if (this.reactionTime === -1) {
            reactionTimeElement.textContent = 'フライング！';
        } else {
            reactionTimeElement.textContent = this.reactionTime;
        }
        
        messageElement.textContent = message;
        
        // パネル表示
        document.getElementById('game-status').classList.add('hidden');
        resultPanel.classList.remove('hidden');
    }
    
    // 結果パネル非表示
    hideResultPanel() {
        document.getElementById('result-panel').classList.add('hidden');
        document.getElementById('game-status').classList.remove('hidden');
    }
    
    // メインゲームループ
    update() {
        // 背景描画
        this.renderer.drawBackground();
        
        // キャラクター描画
        this.renderer.drawCat(
            this.catPosition.x, 
            this.catPosition.y, 
            this.catExpression
        );
        
        // 信号機描画
        this.renderer.drawTrafficLight(30, 30, this.signalLight);
        
        // ゲーム状態に応じた描画
        switch (this.gameState) {
            case 'countdown':
                if (this.countdownValue > 0) {
                    this.renderer.drawCountdownNumber(
                        90, 40, this.countdownValue
                    );
                }
                break;
                
            case 'signal':
                this.renderer.drawGoText(80, 45);
                break;
        }
        
        // エフェクト描画
        this.renderer.drawEffects();
        
        // アニメーションフレーム更新
        this.renderer.nextFrame();
    }
    
    // ゲームリセット
    reset() {
        this.startGame();
        this.hideResultPanel();
    }
}