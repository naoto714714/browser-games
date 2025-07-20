export class Bean {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type; // 'normal', 'white', 'flashing'
        this.speed = 2;
        this.active = true;
        this.flashTimer = 0;
    }
    
    update(deltaTime) {
        this.y += this.speed;
        
        if (this.type === 'flashing') {
            this.flashTimer += deltaTime;
        }
    }
    
    render(renderer) {
        if (!this.active) return;
        
        let color;
        switch (this.type) {
            case 'white':
                color = '#ffffff';
                break;
            case 'flashing':
                color = Math.floor(this.flashTimer / 200) % 2 === 0 ? '#ffd93d' : '#ff6b6b';
                break;
            default:
                color = '#4ecdc4';
        }
        
        renderer.drawCircle(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, color);
    }
    
    getScore(catchY) {
        const maxScore = 300;
        const minScore = 10;
        const scoreRange = maxScore - minScore;
        const heightRatio = (720 - catchY) / 720;
        return Math.floor(minScore + scoreRange * heightRatio);
    }
}

export class BeanManager {
    constructor(canvasWidth) {
        this.canvasWidth = canvasWidth;
        this.beans = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // 2秒
        this.minSpawnInterval = 500; // 最小0.5秒
        this.speedIncrease = 0;
        this.speedIncreaseRate = 0.01; // 時間経過による速度増加率
    }
    
    update(deltaTime, frameCount) {
        this.spawnTimer += deltaTime;
        
        // 時間経過による難易度上昇
        if (frameCount % 600 === 0) { // 10秒ごと（60FPS想定）
            this.speedIncrease += this.speedIncreaseRate;
            this.spawnInterval = Math.max(this.minSpawnInterval, this.spawnInterval * 0.95);
        }
        
        // マメの生成
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnBean();
            this.spawnTimer = 0;
        }
        
        // マメの更新
        this.beans.forEach(bean => {
            bean.speed = 2 + this.speedIncrease;
            bean.update(deltaTime);
        });
        
        // 画面外のマメを削除
        this.beans = this.beans.filter(bean => bean.active && bean.y < 720);
    }
    
    spawnBean() {
        const x = Math.random() * (this.canvasWidth - 20);
        const rand = Math.random();
        let type;
        
        if (rand < 0.05) {
            type = 'flashing';
        } else if (rand < 0.20) {
            type = 'white';
        } else {
            type = 'normal';
        }
        
        this.beans.push(new Bean(x, -20, type));
    }
    
    render(renderer) {
        this.beans.forEach(bean => bean.render(renderer));
    }
    
    checkGroundCollision(ground) {
        const beansToRemove = [];
        
        this.beans.forEach(bean => {
            if (bean.y + bean.height >= ground.y) {
                beansToRemove.push(bean);
                
                if (bean.type === 'white') {
                    ground.fillRandomHole();
                } else if (bean.type === 'flashing') {
                    ground.fillAllHoles();
                    this.clearAllBeans();
                } else {
                    ground.createHole(bean.x + bean.width / 2);
                }
            }
        });
        
        beansToRemove.forEach(bean => {
            bean.active = false;
        });
    }
    
    clearAllBeans() {
        this.beans.forEach(bean => {
            bean.active = false;
        });
    }
    
    reset() {
        this.beans = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2000;
        this.speedIncrease = 0;
    }
}