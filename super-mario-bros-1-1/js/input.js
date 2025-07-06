// 入力管理クラス
class InputManager {
  constructor() {
    this.keys = {};
    this.previousKeys = {};
    this.gamepadIndex = null;
    this.gamepad = null;

    this.setupEventListeners();
    this.checkGamepad();
  }

  // イベントリスナーを設定
  setupEventListeners() {
    // キーボードイベント
    document.addEventListener('keydown', e => this.onKeyDown(e));
    document.addEventListener('keyup', e => this.onKeyUp(e));

    // ゲームパッドイベント
    window.addEventListener('gamepadconnected', e =>
      this.onGamepadConnected(e),
    );
    window.addEventListener('gamepaddisconnected', e =>
      this.onGamepadDisconnected(e),
    );

    // フォーカス時の処理
    window.addEventListener('focus', () => this.resetKeys());
    window.addEventListener('blur', () => this.resetKeys());
  }

  // キーダウンイベント
  onKeyDown(event) {
    this.keys[event.code] = true;

    // デフォルトの動作を防ぐ（ゲーム用キーのみ）
    if (this.isGameKey(event.code)) {
      event.preventDefault();
    }
  }

  // キーアップイベント
  onKeyUp(event) {
    this.keys[event.code] = false;

    if (this.isGameKey(event.code)) {
      event.preventDefault();
    }
  }

  // ゲームで使用するキーかチェック
  isGameKey(keyCode) {
    const gameKeys = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Space',
      'KeyX',
      'KeyP',
    ];
    return gameKeys.includes(keyCode);
  }

  // ゲームパッド接続
  onGamepadConnected(event) {
    this.gamepadIndex = event.gamepad.index;
    console.log('Gamepad connected:', event.gamepad.id);
  }

  // ゲームパッド切断
  onGamepadDisconnected(event) {
    if (this.gamepadIndex === event.gamepad.index) {
      this.gamepadIndex = null;
      this.gamepad = null;
    }
    console.log('Gamepad disconnected');
  }

  // ゲームパッドの状態をチェック
  checkGamepad() {
    if (this.gamepadIndex !== null) {
      const gamepads = navigator.getGamepads();
      this.gamepad = gamepads[this.gamepadIndex];
    }
  }

  // 入力状態を更新
  update() {
    // 前フレームのキー状態を保存
    this.previousKeys = { ...this.keys };

    // ゲームパッドの状態を更新
    this.checkGamepad();

    // ゲームパッドの入力をキー入力にマッピング
    if (this.gamepad) {
      this.mapGamepadToKeys();
    }
  }

  // ゲームパッドの入力をキー入力にマッピング
  mapGamepadToKeys() {
    if (!this.gamepad) {
      return;
    }

    // 方向キー・スティック
    const leftPressed =
      this.gamepad.buttons[14]?.pressed || this.gamepad.axes[0] < -0.5;
    const rightPressed =
      this.gamepad.buttons[15]?.pressed || this.gamepad.axes[0] > 0.5;
    const upPressed =
      this.gamepad.buttons[12]?.pressed || this.gamepad.axes[1] < -0.5;
    const downPressed =
      this.gamepad.buttons[13]?.pressed || this.gamepad.axes[1] > 0.5;

    // ボタン
    const jumpPressed =
      this.gamepad.buttons[0]?.pressed || this.gamepad.buttons[1]?.pressed; // A, B
    const runPressed =
      this.gamepad.buttons[2]?.pressed || this.gamepad.buttons[3]?.pressed; // X, Y

    // キー状態を更新
    this.keys['ArrowLeft'] = leftPressed;
    this.keys['ArrowRight'] = rightPressed;
    this.keys['ArrowUp'] = upPressed;
    this.keys['ArrowDown'] = downPressed;
    this.keys['Space'] = jumpPressed;
    this.keys['KeyX'] = runPressed;
  }

  // キーが押されているかチェック
  isKeyPressed(keyCode) {
    return !!this.keys[keyCode];
  }

  // キーが押された瞬間かチェック
  isKeyJustPressed(keyCode) {
    return !!this.keys[keyCode] && !this.previousKeys[keyCode];
  }

  // キーが離された瞬間かチェック
  isKeyJustReleased(keyCode) {
    return !this.keys[keyCode] && !!this.previousKeys[keyCode];
  }

  // 左移動キーが押されているか
  isLeftPressed() {
    return this.isKeyPressed('ArrowLeft');
  }

  // 右移動キーが押されているか
  isRightPressed() {
    return this.isKeyPressed('ArrowRight');
  }

  // ジャンプキーが押されているか
  isJumpPressed() {
    return this.isKeyPressed('Space');
  }

  // ジャンプキーが押された瞬間か
  isJumpJustPressed() {
    return this.isKeyJustPressed('Space');
  }

  // 走るキーが押されているか
  isRunPressed() {
    return this.isKeyPressed('KeyX');
  }

  // ポーズキーが押された瞬間か
  isPauseJustPressed() {
    return this.isKeyJustPressed('KeyP');
  }

  // 上キーが押されているか（パイプ用）
  isUpPressed() {
    return this.isKeyPressed('ArrowUp');
  }

  // 下キーが押されているか（しゃがみ用）
  isDownPressed() {
    return this.isKeyPressed('ArrowDown');
  }

  // すべてのキーをリセット
  resetKeys() {
    this.keys = {};
    this.previousKeys = {};
  }

  // 特定のキーをリセット
  resetKey(keyCode) {
    this.keys[keyCode] = false;
    this.previousKeys[keyCode] = false;
  }

  // プレイヤーの入力状態を取得
  getPlayerInput() {
    return {
      left: this.isLeftPressed(),
      right: this.isRightPressed(),
      jump: this.isJumpPressed(),
      run: this.isRunPressed(),
      up: this.isUpPressed(),
      down: this.isDownPressed(),
      jumpJustPressed: this.isJumpJustPressed(),
      pauseJustPressed: this.isPauseJustPressed(),
    };
  }

  // デバッグ用：現在押されているキーを表示
  getActiveKeys() {
    return Object.keys(this.keys).filter(key => this.keys[key]);
  }

  // 入力デバイスの情報を取得
  getInputDeviceInfo() {
    return {
      hasGamepad: this.gamepad !== null,
      gamepadId: this.gamepad?.id || 'None',
      gamepadButtons: this.gamepad?.buttons.length || 0,
      gamepadAxes: this.gamepad?.axes.length || 0,
    };
  }
}
