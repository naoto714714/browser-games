export class InputManager {
  constructor() {
    this.keys = {};
    this.prevKeys = {};
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
      this.prevKeys = {};
    });
  }

  isKeyPressed(key) {
    return this.keys[key] || false;
  }

  isLeftPressed() {
    return this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a');
  }

  isRightPressed() {
    return this.isKeyPressed('ArrowRight') || this.isKeyPressed('d');
  }

  isSpacePressed() {
    return this.isKeyPressed(' ');
  }

  isSpaceJustPressed() {
    return this.isKeyPressed(' ') && !this.prevKeys[' '];
  }

  update() {
    this.prevKeys = { ...this.keys };
  }

  reset() {
    this.keys = {};
    this.prevKeys = {};
  }
}
