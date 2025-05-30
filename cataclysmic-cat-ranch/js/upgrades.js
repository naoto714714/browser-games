// アップグレードシステム

class Upgrade {
    constructor(id, name, description, baseCost, costMultiplier, effect, maxLevel = -1) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.baseCost = baseCost;
        this.costMultiplier = costMultiplier;
        this.effect = effect;
        this.maxLevel = maxLevel;
        this.level = 0;
    }
    
    getCost() {
        return Math.floor(this.baseCost * Math.pow(this.costMultiplier, this.level));
    }
    
    getEffectValue() {
        return this.effect(this.level);
    }
    
    getNextEffectValue() {
        return this.effect(this.level + 1);
    }
    
    canAfford() {
        return resourceManager.graviCoin >= this.getCost();
    }
    
    canUpgrade() {
        return this.canAfford() && (this.maxLevel === -1 || this.level < this.maxLevel);
    }
    
    purchase() {
        if (this.canUpgrade() && resourceManager.spendGraviCoin(this.getCost())) {
            this.level++;
            this.applyEffect();
            return true;
        }
        return false;
    }
    
    applyEffect() {
        // 各アップグレードの効果を適用
        switch(this.id) {
            case 'catToy':
                resourceManager.clickMultiplier = 1 + this.getEffectValue();
                break;
            case 'cushion':
                resourceManager.baseIdle = this.getEffectValue();
                break;
            case 'treats':
                // Singularity Levelは購入時に即座に上昇
                resourceManager.increaseSingularityLevel(1);
                break;
            case 'telescope':
                resourceManager.idleMultiplier = 1 + this.getEffectValue();
                break;
            case 'laser':
                resourceManager.baseClick = 1 + this.getEffectValue();
                break;
        }
    }
    
    getSaveData() {
        return {
            id: this.id,
            level: this.level
        };
    }
    
    loadSaveData(data) {
        if (data.level !== undefined) {
            this.level = data.level;
            // 効果を再適用
            if (this.id !== 'treats') {
                this.applyEffect();
            }
        }
    }
}

class UpgradeManager {
    constructor() {
        this.upgrades = [
            new Upgrade(
                'catToy',
                '猫じゃらし改良',
                'クリック収益 +20%',
                100,
                1.15,
                (level) => level * 0.2
            ),
            new Upgrade(
                'cushion',
                'クッション型時空安定器',
                '放置収益の基本値を増加',
                500,
                1.12,
                (level) => level * 0.5
            ),
            new Upgrade(
                'treats',
                '特殊相対論おやつ',
                'Singularity Level +1',
                1000,
                1.25,
                (level) => level
            ),
            new Upgrade(
                'telescope',
                '重力波望遠鏡',
                '放置収益 +30%',
                5000,
                1.18,
                (level) => level * 0.3
            ),
            new Upgrade(
                'laser',
                'レーザーポインター改',
                'クリック基本値 +2',
                10000,
                1.20,
                (level) => level * 2
            )
        ];
        
        this.upgradeMap = {};
        this.upgrades.forEach(upgrade => {
            this.upgradeMap[upgrade.id] = upgrade;
        });
    }
    
    getUpgrade(id) {
        return this.upgradeMap[id];
    }
    
    getAllUpgrades() {
        return this.upgrades;
    }
    
    purchaseUpgrade(id) {
        const upgrade = this.getUpgrade(id);
        if (upgrade && upgrade.purchase()) {
            this.updateUI();
            return true;
        }
        return false;
    }
    
    updateUI() {
        const container = document.getElementById('upgradesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.upgrades.forEach(upgrade => {
            const div = document.createElement('div');
            div.className = 'upgrade-item';
            if (!upgrade.canUpgrade()) {
                div.classList.add('disabled');
            }
            
            const effectText = upgrade.id === 'treats' 
                ? `SLv: ${resourceManager.singularityLevel} → ${resourceManager.singularityLevel + 1}`
                : upgrade.level === 0
                    ? `効果: ${this.formatEffect(upgrade.id, upgrade.getNextEffectValue())}`
                    : `効果: ${this.formatEffect(upgrade.id, upgrade.getEffectValue())} → ${this.formatEffect(upgrade.id, upgrade.getNextEffectValue())}`;
            
            div.innerHTML = `
                <div class="item-name">${upgrade.name}</div>
                <div class="item-effect">${effectText}</div>
                <div class="item-cost">コスト: ${formatNumber(upgrade.getCost())} GC</div>
                ${upgrade.level > 0 ? `<div class="item-level">Lv.${upgrade.level}</div>` : ''}
            `;
            
            div.addEventListener('click', () => {
                if (this.purchaseUpgrade(upgrade.id)) {
                    // 購入成功時のエフェクト
                    if (window.effectsManager) {
                        window.effectsManager.showPurchaseEffect(div);
                    }
                }
            });
            
            container.appendChild(div);
        });
    }
    
    formatEffect(id, value) {
        switch(id) {
            case 'catToy':
                return `+${formatPercent(value)}`;
            case 'cushion':
                return `+${formatNumber(value)}/秒`;
            case 'telescope':
                return `+${formatPercent(value)}`;
            case 'laser':
                return `+${formatNumber(value)}`;
            default:
                return `+${formatNumber(value)}`;
        }
    }
    
    getSaveData() {
        return this.upgrades.map(upgrade => upgrade.getSaveData());
    }
    
    loadSaveData(data) {
        if (!Array.isArray(data)) return;
        
        data.forEach(upgradeData => {
            const upgrade = this.getUpgrade(upgradeData.id);
            if (upgrade) {
                upgrade.loadSaveData(upgradeData);
            }
        });
    }
    
    // 次元跳躍時のリセット
    reset() {
        this.upgrades.forEach(upgrade => {
            upgrade.level = 0;
        });
        
        // リソースマネージャーの値もリセット
        resourceManager.baseClick = 1;
        resourceManager.baseIdle = 0;
        resourceManager.clickMultiplier = 1;
        resourceManager.idleMultiplier = 1;
    }
}

// グローバルインスタンス
const upgradeManager = new UpgradeManager();