export class InputManager {
    constructor() {
        this.keys = {};
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            e.preventDefault();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            e.preventDefault();
        });
        
        window.addEventListener('blur', () => {
            this.keys = {};
        });
    }
    
    isKeyPressed(key) {
        return this.keys[key] || false;
    }
    
    isLeftPressed() {
        return this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a') || this.isKeyPressed('A');
    }
    
    isRightPressed() {
        return this.isKeyPressed('ArrowRight') || this.isKeyPressed('d') || this.isKeyPressed('D');
    }
    
    isSpacePressed() {
        return this.isKeyPressed(' ');
    }
    
    reset() {
        this.keys = {};
    }
}