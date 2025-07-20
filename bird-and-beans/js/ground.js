export class Ground {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.blockCount = 30;
        this.blockWidth = canvasWidth / this.blockCount;
        this.blockHeight = 40;
        this.y = canvasHeight - this.blockHeight;
        
        this.blocks = new Array(this.blockCount).fill(true);
    }
    
    createHole(x) {
        const blockIndex = Math.floor(x / this.blockWidth);
        if (blockIndex >= 0 && blockIndex < this.blockCount) {
            this.blocks[blockIndex] = false;
        }
    }
    
    fillHole(x) {
        const blockIndex = Math.floor(x / this.blockWidth);
        if (blockIndex >= 0 && blockIndex < this.blockCount) {
            this.blocks[blockIndex] = true;
        }
    }
    
    fillRandomHole() {
        const holes = this.blocks
            .map((block, index) => ({ block, index }))
            .filter(item => !item.block)
            .map(item => item.index);
        
        if (holes.length > 0) {
            const randomIndex = holes[Math.floor(Math.random() * holes.length)];
            this.blocks[randomIndex] = true;
            return randomIndex;
        }
        return -1;
    }
    
    fillAllHoles() {
        this.blocks.fill(true);
    }
    
    canPlayerMoveTo(x, width) {
        const leftBlockIndex = Math.floor(x / this.blockWidth);
        const rightBlockIndex = Math.floor((x + width - 1) / this.blockWidth);
        
        for (let i = leftBlockIndex; i <= rightBlockIndex; i++) {
            if (i >= 0 && i < this.blockCount && !this.blocks[i]) {
                return false;
            }
        }
        return true;
    }
    
    render(renderer) {
        for (let i = 0; i < this.blockCount; i++) {
            if (this.blocks[i]) {
                const x = i * this.blockWidth;
                renderer.drawRect(x, this.y, this.blockWidth - 1, this.blockHeight, '#333333');
            } else {
                const x = i * this.blockWidth;
                renderer.drawRect(x, this.y, this.blockWidth - 1, this.blockHeight, '#000000');
            }
        }
    }
}