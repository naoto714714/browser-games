// ビジュアルエフェクト

class EffectsManager {
    constructor() {
        this.floatingNumbersContainer = null;
        this.particleContainer = null;
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
                eye.style.height = '40px';
            }, 100);
        });
        
        // ハートパーティクル
        this.createHeartParticle();
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
}

// グローバルインスタンス
const effectsManager = new EffectsManager();
window.effectsManager = effectsManager;