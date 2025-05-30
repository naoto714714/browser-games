// ビジュアルエフェクト

class EffectsManager {
    constructor() {
        this.floatingNumbersContainer = null;
        this.particleContainer = null;
        this.currentUpgradeLevel = 0;
        this.backgroundEffects = [];
        this.init();
    }
    
    init() {
        // フローティング数字用コンテナ
        this.floatingNumbersContainer = document.getElementById('floatingNumbers');
        
        // パーティクル用コンテナを作成
        this.particleContainer = document.createElement('div');
        this.particleContainer.className = 'particle-container';
        this.particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 998;
        `;
        document.body.appendChild(this.particleContainer);
    }
    
    // クリック時のフローティング数字
    showFloatingNumber(value, x, y) {
        if (!this.floatingNumbersContainer) return;
        
        const floatingNumber = document.createElement('div');
        floatingNumber.className = 'floating-number';
        floatingNumber.textContent = '+' + formatNumber(value);
        
        // クリック位置からランダムにずらす
        const offsetX = (Math.random() - 0.5) * 50;
        const offsetY = (Math.random() - 0.5) * 20;
        
        // 位置が指定されていない場合はネコの位置を使用
        if (x === undefined || y === undefined) {
            const catElement = document.getElementById('catBlackhole');
            if (catElement) {
                const rect = catElement.getBoundingClientRect();
                x = rect.left + rect.width / 2;
                y = rect.top + rect.height / 2;
            } else {
                x = window.innerWidth / 2;
                y = window.innerHeight / 2;
            }
        }
        
        floatingNumber.style.left = (x + offsetX) + 'px';
        floatingNumber.style.top = (y + offsetY) + 'px';
        
        this.floatingNumbersContainer.appendChild(floatingNumber);
        
        // アニメーション終了後に削除
        setTimeout(() => {
            floatingNumber.remove();
        }, 2000);
    }
    
    // 購入エフェクト
    showPurchaseEffect(element) {
        if (!element) return;
        
        // 光るエフェクト
        element.style.transition = 'all 0.3s ease';
        element.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.8)';
        element.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            element.style.boxShadow = '';
            element.style.transform = '';
        }, 300);
        
        // パーティクル生成
        this.createPurchaseParticles(element);
    }
    
    // 購入時のパーティクル
    createPurchaseParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: #667eea;
                border-radius: 50%;
                left: ${centerX}px;
                top: ${centerY}px;
                pointer-events: none;
            `;
            
            this.particleContainer.appendChild(particle);
            
            // ランダムな方向に飛ばす
            const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
            const distance = 50 + Math.random() * 50;
            const duration = 500 + Math.random() * 500;
            
            particle.animate([
                {
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    }
    
    // 次元跳躍エフェクト
    showPrestigeEffect() {
        // 画面全体のフラッシュ
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(240, 147, 251, 0.8) 0%, transparent 70%);
            z-index: 9999;
            pointer-events: none;
            animation: prestigeFlash 1s ease-out forwards;
        `;
        
        document.body.appendChild(flash);
        
        // アニメーション定義
        const style = document.createElement('style');
        style.textContent = `
            @keyframes prestigeFlash {
                0% { opacity: 0; transform: scale(0); }
                50% { opacity: 1; }
                100% { opacity: 0; transform: scale(2); }
            }
        `;
        document.head.appendChild(style);
        
        // エフェクト終了後に削除
        setTimeout(() => {
            flash.remove();
            style.remove();
        }, 1000);
        
        // 波紋エフェクト
        this.createPrestigeWaves();
    }
    
    // 次元跳躍時の波紋
    createPrestigeWaves() {
        const catElement = document.getElementById('catBlackhole');
        if (!catElement) return;
        
        const rect = catElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const wave = document.createElement('div');
                wave.style.cssText = `
                    position: absolute;
                    left: ${centerX}px;
                    top: ${centerY}px;
                    width: 100px;
                    height: 100px;
                    margin-left: -50px;
                    margin-top: -50px;
                    border: 3px solid rgba(240, 147, 251, 0.8);
                    border-radius: 50%;
                    pointer-events: none;
                `;
                
                this.particleContainer.appendChild(wave);
                
                wave.animate([
                    {
                        transform: 'scale(1)',
                        opacity: 1
                    },
                    {
                        transform: 'scale(10)',
                        opacity: 0
                    }
                ], {
                    duration: 2000,
                    easing: 'ease-out'
                }).onfinish = () => wave.remove();
            }, i * 200);
        }
    }
    
    // イベント終了通知
    showEventEndNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(245, 87, 108, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
        `;
        notification.textContent = message;
        
        // アニメーション定義
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in forwards';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 500);
        }, 3000);
    }
    
    // 汎用通知
    showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${isError ? 'rgba(245, 87, 108, 0.9)' : 'rgba(102, 126, 234, 0.9)'};
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 0.9em;
            z-index: 1000;
            animation: fadeInUp 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOutDown 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    // ネコのアニメーション
    animateCatClick() {
        const catElement = document.getElementById('catBlackhole');
        if (!catElement) return;
        
        // 目を閉じるアニメーション
        const eyes = catElement.querySelectorAll('.cat-eye');
        eyes.forEach(eye => {
            eye.style.transition = 'height 0.1s ease';
            eye.style.height = '5px';
            setTimeout(() => {
                eye.style.height = '38px';
            }, 100);
        });
        
        // ハートパーティクル
        this.createHeartParticle();
        
        // 新しいクリックエフェクト
        this.createClickRipple();
        this.createClickSparks();
        this.createClickShockwave();
    }
    
    // ハートパーティクル
    createHeartParticle() {
        const catElement = document.getElementById('catBlackhole');
        if (!catElement) return;
        
        const rect = catElement.getBoundingClientRect();
        const heart = document.createElement('div');
        heart.style.cssText = `
            position: absolute;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top}px;
            font-size: 20px;
            pointer-events: none;
        `;
        heart.textContent = '💕';
        
        this.particleContainer.appendChild(heart);
        
        heart.animate([
            {
                transform: 'translateY(0) scale(1)',
                opacity: 1
            },
            {
                transform: 'translateY(-50px) scale(1.5)',
                opacity: 0
            }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => heart.remove();
    }
    
    // アップグレード進行度に応じた画面変化
    updateEnvironmentEffects() {
        const totalUpgrades = this.calculateTotalUpgrades();
        
        // レベル段階を計算（5レベルごとに変化）
        const upgradeStage = Math.floor(totalUpgrades / 5);
        
        if (upgradeStage !== this.currentUpgradeLevel) {
            this.currentUpgradeLevel = upgradeStage;
            this.applyEnvironmentStage(upgradeStage);
            this.showUpgradeStageTransition(upgradeStage);
        }
    }
    
    // 総アップグレード数を計算
    calculateTotalUpgrades() {
        if (!window.upgradeManager) return 0;
        
        return upgradeManager.getAllUpgrades().reduce((total, upgrade) => {
            return total + upgrade.level;
        }, 0);
    }
    
    // 環境段階を適用
    applyEnvironmentStage(stage) {
        // 既存の背景エフェクトをクリア
        this.clearBackgroundEffects();
        
        const body = document.body;
        const starsContainer = [
            document.getElementById('stars'),
            document.getElementById('stars2'), 
            document.getElementById('stars3')
        ];
        
        switch(stage) {
            case 0: // 初期状態
                body.style.background = 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)';
                break;
                
            case 1: // レベル5-9: 星雲が見え始める
                body.style.background = 'radial-gradient(ellipse at bottom, #1b2735 0%, #0f1b2e 50%, #090a0f 100%)';
                this.addNebulaEffect();
                break;
                
            case 2: // レベル10-14: 銀河の渦が現れる
                body.style.background = 'radial-gradient(ellipse at bottom, #2d1b69 0%, #1b2735 50%, #090a0f 100%)';
                this.addGalaxyEffect();
                break;
                
            case 3: // レベル15-19: 時空の歪みエフェクト
                body.style.background = 'radial-gradient(ellipse at bottom, #4c1d95 0%, #2d1b69 50%, #090a0f 100%)';
                this.addSpaceDistortionEffect();
                break;
                
            case 4: // レベル20-24: 多次元空間
                body.style.background = 'radial-gradient(ellipse at bottom, #7c3aed 0%, #4c1d95 50%, #1e1b4b 100%)';
                this.addMultidimensionalEffect();
                break;
                
            default: // レベル25+: 宇宙の終焉
                if (stage >= 5) {
                    body.style.background = 'radial-gradient(ellipse at bottom, #ec4899 0%, #7c3aed 30%, #1e1b4b 100%)';
                    this.addCosmicEndEffect();
                }
                break;
        }
        
        // 星の速度を段階に応じて加速
        starsContainer.forEach((star, index) => {
            if (star) {
                const baseSpeed = [50, 100, 150][index];
                const newSpeed = Math.max(baseSpeed - (stage * 10), 10);
                star.style.animationDuration = `${newSpeed}s`;
            }
        });
    }
    
    // 背景エフェクトをクリア
    clearBackgroundEffects() {
        this.backgroundEffects.forEach(effect => {
            if (effect && effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        });
        this.backgroundEffects = [];
    }
    
    // 星雲エフェクト
    addNebulaEffect() {
        const nebula = document.createElement('div');
        nebula.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                       radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
            z-index: -1;
            animation: nebulaFloat 20s ease-in-out infinite;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes nebulaFloat {
                0%, 100% { transform: scale(1) rotate(0deg); }
                50% { transform: scale(1.1) rotate(2deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(nebula);
        this.backgroundEffects.push(nebula, style);
    }
    
    // 銀河エフェクト
    addGalaxyEffect() {
        const galaxy = document.createElement('div');
        galaxy.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 300px;
            height: 300px;
            margin: -150px 0 0 -150px;
            background: conic-gradient(from 0deg, transparent, rgba(139, 92, 246, 0.2), transparent, rgba(59, 130, 246, 0.2), transparent);
            border-radius: 50%;
            z-index: -1;
            animation: galaxyRotate 30s linear infinite;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes galaxyRotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(galaxy);
        this.backgroundEffects.push(galaxy, style);
    }
    
    // 時空歪みエフェクト
    addSpaceDistortionEffect() {
        const distortion = document.createElement('div');
        distortion.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-conic-gradient(from 0deg at 50% 50%, 
                transparent 0deg, rgba(236, 72, 153, 0.05) 45deg, transparent 90deg);
            z-index: -1;
            animation: spaceDistort 15s ease-in-out infinite;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spaceDistort {
                0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
                50% { transform: scale(1.05) rotate(180deg); opacity: 0.7; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(distortion);
        this.backgroundEffects.push(distortion, style);
    }
    
    // 多次元エフェクト
    addMultidimensionalEffect() {
        for (let i = 0; i < 3; i++) {
            const dimension = document.createElement('div');
            dimension.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at ${30 + i * 20}% ${40 + i * 15}%, 
                    rgba(${180 + i * 30}, ${100 + i * 50}, 255, 0.1) 0%, transparent 40%);
                z-index: -1;
                animation: dimensionShift${i} ${20 + i * 5}s ease-in-out infinite;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes dimensionShift${i} {
                    0%, 100% { transform: translateX(0) scale(1); opacity: 0.3; }
                    33% { transform: translateX(${(i - 1) * 50}px) scale(1.1); opacity: 0.6; }
                    66% { transform: translateX(${(1 - i) * 50}px) scale(0.9); opacity: 0.4; }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(dimension);
            this.backgroundEffects.push(dimension, style);
        }
    }
    
    // 宇宙終焉エフェクト
    addCosmicEndEffect() {
        const cosmicEnd = document.createElement('div');
        cosmicEnd.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 50% 50%, 
                rgba(236, 72, 153, 0.2) 0%, 
                rgba(124, 58, 237, 0.1) 30%,
                rgba(30, 27, 75, 0.8) 70%,
                #000 100%);
            z-index: -1;
            animation: cosmicPulse 10s ease-in-out infinite;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cosmicPulse {
                0%, 100% { transform: scale(1); opacity: 0.5; }
                50% { transform: scale(1.02); opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(cosmicEnd);
        this.backgroundEffects.push(cosmicEnd, style);
    }
    
    // アップグレード段階移行エフェクト
    showUpgradeStageTransition(stage) {
        const messages = [
            "🌌 宇宙の深淵が見え始めた...",
            "✨ 星雲が渦巻いている...", 
            "🌀 銀河の中心が見えてきた...",
            "⚡ 時空に歪みが生じている...",
            "🔮 多次元空間が開かれた...",
            "💫 宇宙の終焉が近づいている..."
        ];
        
        if (stage < messages.length) {
            this.showStageUpgradeNotification(messages[stage]);
        }
        
        // 画面フラッシュエフェクト
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%);
            z-index: 9998;
            pointer-events: none;
            animation: stageTransitionFlash 2s ease-out forwards;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes stageTransitionFlash {
                0% { opacity: 0; transform: scale(0.5); }
                30% { opacity: 1; transform: scale(1); }
                100% { opacity: 0; transform: scale(1.5); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
            style.remove();
        }, 2000);
    }
    
    // 段階アップグレード通知
    showStageUpgradeNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(236, 72, 153, 0.95) 100%);
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 1.2em;
            font-weight: bold;
            text-align: center;
            z-index: 9999;
            animation: stageNotificationSlide 3s ease-out forwards;
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.5);
        `;
        notification.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes stageNotificationSlide {
                0% { opacity: 0; transform: translate(-50%, -100px) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, 0px) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }
    
    // クリック時の波紋エフェクト
    createClickRipple() {
        const catElement = document.getElementById('catBlackhole');
        if (!catElement) return;
        
        const rect = catElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    left: ${centerX}px;
                    top: ${centerY}px;
                    width: 20px;
                    height: 20px;
                    margin-left: -10px;
                    margin-top: -10px;
                    border: 2px solid rgba(104, 211, 145, 0.8);
                    border-radius: 50%;
                    pointer-events: none;
                `;
                
                this.particleContainer.appendChild(ripple);
                
                ripple.animate([
                    {
                        transform: 'scale(1)',
                        opacity: 1
                    },
                    {
                        transform: 'scale(8)',
                        opacity: 0
                    }
                ], {
                    duration: 800,
                    easing: 'ease-out'
                }).onfinish = () => ripple.remove();
            }, i * 100);
        }
    }
    
    // クリック時のスパークエフェクト
    createClickSparks() {
        const catElement = document.getElementById('catBlackhole');
        if (!catElement) return;
        
        const rect = catElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 8; i++) {
            const spark = document.createElement('div');
            spark.style.cssText = `
                position: absolute;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 3px;
                height: 15px;
                background: linear-gradient(to bottom, #fbbf24, #f59e0b);
                border-radius: 2px;
                pointer-events: none;
                transform-origin: 50% 100%;
            `;
            
            this.particleContainer.appendChild(spark);
            
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 60 + Math.random() * 40;
            
            spark.animate([
                {
                    transform: `rotate(${angle}rad) translate(0, 0) scale(1)`,
                    opacity: 1
                },
                {
                    transform: `rotate(${angle}rad) translate(0, -${distance}px) scale(0.3)`,
                    opacity: 0
                }
            ], {
                duration: 600,
                easing: 'ease-out'
            }).onfinish = () => spark.remove();
        }
    }
    
    // クリック時の衝撃波エフェクト
    createClickShockwave() {
        const catElement = document.getElementById('catBlackhole');
        if (!catElement) return;
        
        const rect = catElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const shockwave = document.createElement('div');
        shockwave.style.cssText = `
            position: absolute;
            left: ${centerX}px;
            top: ${centerY}px;
            width: 100px;
            height: 100px;
            margin-left: -50px;
            margin-top: -50px;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        `;
        
        this.particleContainer.appendChild(shockwave);
        
        shockwave.animate([
            {
                transform: 'scale(0.3)',
                opacity: 1
            },
            {
                transform: 'scale(2)',
                opacity: 0
            }
        ], {
            duration: 400,
            easing: 'ease-out'
        }).onfinish = () => shockwave.remove();
    }
}

// グローバルインスタンス
const effectsManager = new EffectsManager();
window.effectsManager = effectsManager;