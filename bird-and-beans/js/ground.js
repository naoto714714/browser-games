import { GROUND_BLOCK_COUNT, GROUND_HEIGHT, GROUND_BLOCK_GAP, COLORS } from './constants.js';
import { CollisionManager } from './collision.js';

export class Ground {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.blockCount = GROUND_BLOCK_COUNT;
    this.blockWidth = canvasWidth / this.blockCount;
    this.blockHeight = GROUND_HEIGHT;
    this.y = canvasHeight - this.blockHeight;

    this.blocks = new Array(this.blockCount).fill(true);
  }

  createHole(x) {
    const blockIndex = CollisionManager.getBlockIndexFromX(x, this.blockWidth);
    if (CollisionManager.isWithinBounds(blockIndex, 0, this.blockCount)) {
      this.blocks[blockIndex] = false;
    }
  }

  fillHole(x) {
    const blockIndex = CollisionManager.getBlockIndexFromX(x, this.blockWidth);
    if (CollisionManager.isWithinBounds(blockIndex, 0, this.blockCount)) {
      this.blocks[blockIndex] = true;
    }
  }

  fillRandomHole() {
    const holes = this.getHoleIndices();

    if (holes.length > 0) {
      const randomIndex = holes[Math.floor(Math.random() * holes.length)];
      this.blocks[randomIndex] = true;
      return randomIndex;
    }
    return -1;
  }

  getHoleIndices() {
    return this.blocks.map((block, index) => (!block ? index : -1)).filter((index) => index !== -1);
  }

  fillAllHoles() {
    this.blocks.fill(true);
  }

  canPlayerMoveTo(x, width) {
    const leftBlockIndex = CollisionManager.getBlockIndexFromX(x, this.blockWidth);
    const rightBlockIndex = CollisionManager.getBlockIndexFromX(x + width - 1, this.blockWidth);

    return this.areBlocksSolid(leftBlockIndex, rightBlockIndex);
  }

  areBlocksSolid(startIndex, endIndex) {
    for (let i = startIndex; i <= endIndex; i++) {
      if (CollisionManager.isWithinBounds(i, 0, this.blockCount) && !this.blocks[i]) {
        return false;
      }
    }
    return true;
  }

  render(renderer) {
    this.blocks.forEach((block, i) => {
      const x = i * this.blockWidth;
      const width = this.blockWidth - GROUND_BLOCK_GAP;
      const color = block ? COLORS.GROUND_BLOCK : COLORS.GROUND_HOLE;
      renderer.drawRect(x, this.y, width, this.blockHeight, color);
    });
  }
}
