// 入力管理クラス
class InputManager {
    constructor() {
        this.keys = new Map();
        this.keysPressed = new Map();
        this.keysReleased = new Map();

        this.mouse = {
            x: 0,
            y: 0,
            leftPressed: false,
            rightPressed: false,
            leftClicked: false,
            rightClicked: false
        };

        // キーバインディング
        this.keyBindings = {
            // 移動
            moveLeft: ['ArrowLeft', 'KeyA'],
            moveRight: ['ArrowRight', 'KeyD'],
            jump: ['ArrowUp', 'Space'],

            // アクション
            slash: ['KeyZ'],
            dash: ['KeyX'],

            // システム
            pause: ['KeyP', 'Escape'],

            // デバッグ
            debug: ['F12']
        };

        // 入力バッファ（コンボ用）
        this.inputBuffer = [];
        this.bufferDuration = 0.5; // 秒

        this.init();
    }

    init() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // マウスイベント
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // コンテキストメニュー無効化（右クリック用）
        document.addEventListener('contextmenu', (e) => e.preventDefault());

        // フォーカス復帰時の入力リセット
        window.addEventListener('blur', () => this.resetAll());
        window.addEventListener('focus', () => this.resetAll());
    }

    handleKeyDown(event) {
        const code = event.code;

        // キーリピート防止
        if (!this.keys.get(code)) {
            this.keysPressed.set(code, true);
            this.addToInputBuffer('key', code);
        }

        this.keys.set(code, true);

        // デフォルト動作の防止（必要に応じて）
        if (this.shouldPreventDefault(code)) {
            event.preventDefault();
        }
    }

    handleKeyUp(event) {
        const code = event.code;
        this.keys.set(code, false);
        this.keysReleased.set(code, true);
    }

    handleMouseDown(event) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();

        this.mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
        this.mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);

        if (event.button === 0) { // 左クリック
            this.mouse.leftPressed = true;
            this.mouse.leftClicked = true;
            this.addToInputBuffer('mouse', 'left');
        } else if (event.button === 2) { // 右クリック
            this.mouse.rightPressed = true;
            this.mouse.rightClicked = true;
            this.addToInputBuffer('mouse', 'right');
        }

        event.preventDefault();
    }

    handleMouseUp(event) {
        if (event.button === 0) {
            this.mouse.leftPressed = false;
        } else if (event.button === 2) {
            this.mouse.rightPressed = false;
        }
    }

    handleMouseMove(event) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();

        this.mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
        this.mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);
    }

    // デフォルト動作を防ぐべきキー
    shouldPreventDefault(code) {
        const preventKeys = [
            'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'KeyA', 'KeyD', 'KeyZ', 'KeyX', 'KeyP', 'Escape'
        ];
        return preventKeys.includes(code);
    }

    // 入力バッファに追加
    addToInputBuffer(type, input) {
        const timestamp = performance.now() / 1000;
        this.inputBuffer.push({ type, input, timestamp });

        // 古いエントリを削除
        this.cleanInputBuffer();
    }

    // 古い入力バッファエントリを削除
    cleanInputBuffer() {
        const currentTime = performance.now() / 1000;
        this.inputBuffer = this.inputBuffer.filter(
            entry => currentTime - entry.timestamp <= this.bufferDuration
        );
    }

    // アクション判定メソッド
    isActionPressed(action) {
        const keys = this.keyBindings[action];
        if (!keys) return false;

        // キーボード判定
        for (const key of keys) {
            if (this.keysPressed.get(key)) return true;
        }

        // マウス判定
        if (action === 'slash' && this.mouse.leftClicked) return true;
        if (action === 'dash' && this.mouse.rightClicked) return true;

        return false;
    }

    isActionHeld(action) {
        const keys = this.keyBindings[action];
        if (!keys) return false;

        // キーボード判定
        for (const key of keys) {
            if (this.keys.get(key)) return true;
        }

        // マウス判定
        if (action === 'slash' && this.mouse.leftPressed) return true;
        if (action === 'dash' && this.mouse.rightPressed) return true;

        return false;
    }

    isActionReleased(action) {
        const keys = this.keyBindings[action];
        if (!keys) return false;

        for (const key of keys) {
            if (this.keysReleased.get(key)) return true;
        }

        return false;
    }

    // 直接キー判定
    isKeyPressed(code) {
        return this.keysPressed.get(code) || false;
    }

    isKeyHeld(code) {
        return this.keys.get(code) || false;
    }

    isKeyReleased(code) {
        return this.keysReleased.get(code) || false;
    }

    // マウス判定
    isMousePressed(button) {
        if (button === 'left') return this.mouse.leftClicked;
        if (button === 'right') return this.mouse.rightClicked;
        return false;
    }

    isMouseHeld(button) {
        if (button === 'left') return this.mouse.leftPressed;
        if (button === 'right') return this.mouse.rightPressed;
        return false;
    }

    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    // 方向入力の判定
    getMovementInput() {
        let horizontal = 0;

        if (this.isActionHeld('moveLeft')) horizontal -= 1;
        if (this.isActionHeld('moveRight')) horizontal += 1;

        return {
            horizontal,
            jump: this.isActionPressed('jump')
        };
    }

    // コンボ入力判定
    checkComboInput(sequence, timeWindow = 0.5) {
        if (sequence.length === 0) return false;

        const currentTime = performance.now() / 1000;
        let sequenceIndex = 0;

        // バッファを新しい順にチェック
        for (let i = this.inputBuffer.length - 1; i >= 0; i--) {
            const entry = this.inputBuffer[i];

            // 時間窓外は無視
            if (currentTime - entry.timestamp > timeWindow) break;

            // シーケンスの次の入力と一致するかチェック
            if (this.matchesSequenceInput(entry, sequence[sequence.length - 1 - sequenceIndex])) {
                sequenceIndex++;

                // 全シーケンス完了
                if (sequenceIndex >= sequence.length) {
                    return true;
                }
            }
        }

        return false;
    }

    matchesSequenceInput(entry, expected) {
        if (entry.type === 'key' && expected.type === 'key') {
            return entry.input === expected.input;
        }
        if (entry.type === 'mouse' && expected.type === 'mouse') {
            return entry.input === expected.input;
        }
        return false;
    }

    // 特殊入力判定
    checkDoubleInput(action, timeWindow = 0.3) {
        const currentTime = performance.now() / 1000;
        const keys = this.keyBindings[action];
        if (!keys) return false;

        let count = 0;
        for (const entry of this.inputBuffer) {
            if (currentTime - entry.timestamp > timeWindow) continue;

            if (entry.type === 'key' && keys.includes(entry.input)) {
                count++;
            }
        }

        return count >= 2;
    }

    // 長押し判定
    getHoldDuration(action) {
        const keys = this.keyBindings[action];
        if (!keys) return 0;

        const currentTime = performance.now() / 1000;
        let earliestPress = currentTime;

        for (const entry of this.inputBuffer) {
            if (entry.type === 'key' && keys.includes(entry.input)) {
                if (this.keys.get(entry.input)) {
                    earliestPress = Math.min(earliestPress, entry.timestamp);
                }
            }
        }

        return currentTime - earliestPress;
    }

    // フレーム更新処理
    update() {
        // pressed/released状態をクリア
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.mouse.leftClicked = false;
        this.mouse.rightClicked = false;

        // 入力バッファのクリーンアップ
        this.cleanInputBuffer();
    }

    // 全入力リセット
    resetAll() {
        this.keys.clear();
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.mouse.leftPressed = false;
        this.mouse.rightPressed = false;
        this.mouse.leftClicked = false;
        this.mouse.rightClicked = false;
        this.inputBuffer = [];
    }

    // 設定の保存と読み込み
    saveSettings() {
        Utils.saveToLocalStorage('inputSettings', {
            keyBindings: this.keyBindings
        });
    }

    loadSettings() {
        const settings = Utils.loadFromLocalStorage('inputSettings', {});
        if (settings.keyBindings) {
            this.keyBindings = { ...this.keyBindings, ...settings.keyBindings };
        }
    }

    // キーバインディング変更
    setKeyBinding(action, keys) {
        if (Array.isArray(keys)) {
            this.keyBindings[action] = keys;
        } else {
            this.keyBindings[action] = [keys];
        }
        this.saveSettings();
    }

    // デバッグ情報
    getDebugInfo() {
        const heldKeys = [];
        for (const [key, held] of this.keys) {
            if (held) heldKeys.push(key);
        }

        return {
            heldKeys,
            mousePosition: this.getMousePosition(),
            mouseButtons: {
                left: this.mouse.leftPressed,
                right: this.mouse.rightPressed
            },
            bufferSize: this.inputBuffer.length
        };
    }
}

// グローバルインスタンス
window.inputManager = new InputManager();
