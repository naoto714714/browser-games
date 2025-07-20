import { Renderer } from './render.js';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.renderer = new Renderer(ctx);
        
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.gameOver = false;
        this.frameCount = 0;
        this.lastTime = 0;
        
        this.updateUI();
    }
    
    start() {
        this.gameLoop(0);
    }
    
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        if (!this.gameOver) {
            this.update(deltaTime);
            this.render();
            this.frameCount++;
        }
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    update(deltaTime) {
        // ゲームロジックの更新（後で実装）
    }
    
    render() {
        this.renderer.clear(this.canvas.width, this.canvas.height);
        // 各要素の描画（後で実装）
    }
    
    restart() {
        this.score = 0;
        this.gameOver = false;
        this.frameCount = 0;
        this.updateUI();
        document.getElementById('game-over').classList.add('hidden');
    }
    
    endGame() {
        this.gameOver = true;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
        this.updateUI();
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
    }
    
    loadHighScore() {
        return parseInt(localStorage.getItem('birdAndBeansHighScore') || '0');
    }
    
    saveHighScore() {
        localStorage.setItem('birdAndBeansHighScore', this.highScore.toString());
    }
}