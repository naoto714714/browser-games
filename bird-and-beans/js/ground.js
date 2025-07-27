import { GROUND_BLOCK_COUNT, GROUND_BLOCK_IMAGE, COLORS, calculateDimensions } from './config.js';
import { CollisionManager } from './collision.js';

export class Ground {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.blockCount = GROUND_BLOCK_COUNT;
    const dimensions = calculateDimensions(canvasWidth, canvasHeight);
    this.blockSize = dimensions.blockSize;
    this.y = canvasHeight - this.blockSize;

    this.blocks = new Array(this.blockCount).fill(true);

    // ブロック画像の読み込み
    this.blockImage = null;
    this.imageLoaded = false;
    this.loadImage();
  }

  loadImage() {
    this.blockImage = new Image();
    this.blockImage.onload = () => {
      this.imageLoaded = true;
    };
    this.blockImage.onerror = () => {
      console.warn('Failed to load ground block image');
      this.imageLoaded = false;
    };
    this.blockImage.src = GROUND_BLOCK_IMAGE;
  }

  createHole(x) {
    const blockIndex = CollisionManager.getBlockIndexFromX(x, this.blockSize);
    if (CollisionManager.isWithinBounds(blockIndex, 0, this.blockCount)) {
      this.blocks[blockIndex] = false;
    }
  }

  fillHole(x) {
    const blockIndex = CollisionManager.getBlockIndexFromX(x, this.blockSize);
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
    const leftBlockIndex = CollisionManager.getBlockIndexFromX(x, this.blockSize);
    const rightBlockIndex = CollisionManager.getBlockIndexFromX(x + width - 1, this.blockSize);

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

  getTopY() {
    return this.y;
  }

  render(renderer) {
    this.blocks.forEach((block, i) => {
      if (block) {
        const x = i * this.blockSize;

        if (this.imageLoaded && this.blockImage) {
          // 画像が読み込まれている場合は画像を描画
          renderer.drawImage(this.blockImage, x, this.y, this.blockSize, this.blockSize);
        } else {
          // フォールバック：画像が読み込まれていない場合は色で描画
          renderer.drawRect(x, this.y, this.blockSize, this.blockSize, COLORS.GROUND_BLOCK);
        }
      }
      // ブロックがない場合は何も描画しない（背景が見える）
    });
  }
}
