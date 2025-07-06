// パッシブスキルシステム

class Passive {
  constructor(
    id,
    name,
    description,
    baseCost,
    costMultiplier,
    effect,
    maxLevel = -1
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.baseCost = baseCost;
    this.costMultiplier = costMultiplier;
    this.effect = effect;
    this.maxLevel = maxLevel;
    this.level = 0;
    this.unlocked = false;
  }

  getCost() {
    return Math.floor(
      this.baseCost * Math.pow(this.costMultiplier, this.level)
    );
  }

  getEffectValue() {
    return this.effect(this.level);
  }

  getNextEffectValue() {
    return this.effect(this.level + 1);
  }

  canAfford() {
    return resourceManager.quantumYarn >= this.getCost();
  }

  canUpgrade() {
    return (
      this.unlocked &&
      this.canAfford() &&
      (this.maxLevel === -1 || this.level < this.maxLevel)
    );
  }

  unlock() {
    this.unlocked = true;
  }

  purchase() {
    if (this.canUpgrade() && resourceManager.spendQuantumYarn(this.getCost())) {
      this.level++;
      this.applyEffect();
      return true;
    }
    return false;
  }

  applyEffect() {
    // パッシブ効果は永続的なので、各システムで確認して適用
  }

  getSaveData() {
    return {
      id: this.id,
      level: this.level,
      unlocked: this.unlocked,
    };
  }

  loadSaveData(data) {
    if (data.level !== undefined) {this.level = data.level;}
    if (data.unlocked !== undefined) {this.unlocked = data.unlocked;}
  }
}

class PassiveManager {
  constructor() {
    this.passives = [
      new Passive(
        'horizonExpand',
        'イベントホライゾン拡張',
        '放置収益 +25% (永続)',
        10,
        1.3,
        level => level * 0.25
      ),
      new Passive(
        'gravityLock',
        'グラビティポンプロック',
        'クリック効果 +50% (永続)',
        15,
        1.35,
        level => level * 0.5
      ),
      new Passive(
        'schrodingerCat',
        'シュレ猫多重化',
        '全収益 +10% (永続・累積)',
        25,
        1.4,
        level => level * 0.1
      ),
      new Passive(
        'timeReverse',
        '時間反転コア',
        'オフライン収益が時間の2乗で計算される',
        50,
        2.0,
        level => (level > 0 ? 1 : 0),
        1 // 最大レベル1
      ),
      new Passive(
        'quantumLeap',
        '量子跳躍増幅器',
        '次元跳躍時の量子毛玉獲得量 +100%',
        100,
        1.5,
        level => level * 1.0
      ),
      new Passive(
        'singularityBoost',
        '特異点ブースター',
        '初期Singularity Level +1',
        200,
        1.6,
        level => level
      ),
    ];

    this.passiveMap = {};
    this.passives.forEach(passive => {
      this.passiveMap[passive.id] = passive;
    });

    // 最初の3つを解放
    this.passives[0].unlock();
    this.passives[1].unlock();
    this.passives[2].unlock();
  }

  getPassive(id) {
    return this.passiveMap[id];
  }

  getAllPassives() {
    return this.passives;
  }

  hasPassive(id) {
    const passive = this.getPassive(id);
    return passive && passive.level > 0;
  }

  getPassiveLevel(id) {
    const passive = this.getPassive(id);
    return passive ? passive.level : 0;
  }

  purchasePassive(id) {
    const passive = this.getPassive(id);
    if (passive && passive.purchase()) {
      this.updateUI();
      return true;
    }
    return false;
  }

  unlockNextPassive() {
    for (let i = 0; i < this.passives.length; i++) {
      if (!this.passives[i].unlocked) {
        this.passives[i].unlock();
        break;
      }
    }
  }

  // パッシブ効果の計算
  getIdleMultiplier() {
    let multiplier = 1;

    // イベントホライゾン拡張
    const horizonLevel = this.getPassiveLevel('horizonExpand');
    if (horizonLevel > 0) {
      multiplier += horizonLevel * 0.25;
    }

    // シュレ猫多重化
    const schrodingerLevel = this.getPassiveLevel('schrodingerCat');
    if (schrodingerLevel > 0) {
      multiplier *= 1 + schrodingerLevel * 0.1;
    }

    return multiplier;
  }

  getClickMultiplier() {
    let multiplier = 1;

    // グラビティポンプロック
    const gravityLevel = this.getPassiveLevel('gravityLock');
    if (gravityLevel > 0) {
      multiplier += gravityLevel * 0.5;
    }

    // シュレ猫多重化
    const schrodingerLevel = this.getPassiveLevel('schrodingerCat');
    if (schrodingerLevel > 0) {
      multiplier *= 1 + schrodingerLevel * 0.1;
    }

    return multiplier;
  }

  getPrestigeMultiplier() {
    let multiplier = 1;

    // 量子跳躍増幅器
    const quantumLevel = this.getPassiveLevel('quantumLeap');
    if (quantumLevel > 0) {
      multiplier += quantumLevel * 1.0;
    }

    return multiplier;
  }

  getInitialSingularityLevel() {
    // 特異点ブースター
    return 1 + this.getPassiveLevel('singularityBoost');
  }

  updateUI() {
    const container = document.getElementById('passivesList');
    if (!container) {return;}

    container.innerHTML = '';

    const unlockedPassives = this.passives.filter(p => p.unlocked);

    if (unlockedPassives.length === 0) {
      const noPassivesDiv = document.createElement('div');
      noPassivesDiv.className = 'no-passives-message';
      noPassivesDiv.innerHTML = `
                <div class="message-content">
                    <h3>パッシブスキル未解放</h3>
                    <p>次元跳躍を行うとパッシブスキルが解放されます。</p>
                    <p>必要: 1M GraviCoin</p>
                </div>
            `;
      container.appendChild(noPassivesDiv);
      return;
    }

    this.passives.forEach(passive => {
      if (!passive.unlocked) {return;}

      const div = document.createElement('div');
      div.className = 'passive-item';
      if (!passive.canUpgrade()) {
        div.classList.add('disabled');
      }

      const effectText =
        passive.level === 0
          ? `効果: ${this.formatEffect(
            passive.id,
            passive.getNextEffectValue()
          )}`
          : passive.maxLevel === 1 && passive.level === 1
            ? '効果: 有効'
            : `効果: ${this.formatEffect(
              passive.id,
              passive.getEffectValue()
            )} → ${this.formatEffect(
              passive.id,
              passive.getNextEffectValue()
            )}`;

      div.innerHTML = `
                <div class="item-name">${passive.name}</div>
                <div class="item-effect">${effectText}</div>
                <div class="item-cost">コスト: ${formatNumber(
    passive.getCost()
  )} QY</div>
                ${
  passive.level > 0
    ? `<div class="item-level">Lv.${passive.level}</div>`
    : ''
}
            `;

      div.addEventListener('click', () => {
        if (this.purchasePassive(passive.id)) {
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
    switch (id) {
    case 'horizonExpand':
      return `+${formatPercent(value)}`;
    case 'gravityLock':
      return `+${formatPercent(value)}`;
    case 'schrodingerCat':
      return `+${formatPercent(value)}`;
    case 'timeReverse':
      return value > 0 ? '有効' : '無効';
    case 'quantumLeap':
      return `+${formatPercent(value)}`;
    case 'singularityBoost':
      return `+${value}`;
    default:
      return `+${formatNumber(value)}`;
    }
  }

  getSaveData() {
    return this.passives.map(passive => passive.getSaveData());
  }

  loadSaveData(data) {
    if (!Array.isArray(data)) {return;}

    data.forEach(passiveData => {
      const passive = this.getPassive(passiveData.id);
      if (passive) {
        passive.loadSaveData(passiveData);
      }
    });
  }
}

// グローバルインスタンス
const passiveManager = new PassiveManager();

// パッシブ効果をリソースマネージャーに統合
window.passiveManager = passiveManager;
