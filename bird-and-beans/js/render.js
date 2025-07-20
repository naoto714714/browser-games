export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    clear(width, height) {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, width, height);
    }
    
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    
    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawLine(x1, y1, x2, y2, color, width = 2) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    
    drawText(text, x, y, color, font = '20px Arial') {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.fillText(text, x, y);
    }
}