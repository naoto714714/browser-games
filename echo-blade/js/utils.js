// ユーティリティ関数
class Utils {
    // 数学関数
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    static radToDeg(rad) {
        return rad * 180 / Math.PI;
    }

    static degToRad(deg) {
        return deg * Math.PI / 180;
    }

    // 乱数
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // コリジョン検出
    static circleCollision(x1, y1, r1, x2, y2, r2) {
        const distance = this.distance(x1, y1, x2, y2);
        return distance < r1 + r2;
    }

    static rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    static pointInRect(px, py, x, y, w, h) {
        return px >= x && px <= x + w && py >= y && py <= y + h;
    }

    static pointInCircle(px, py, cx, cy, r) {
        return this.distance(px, py, cx, cy) <= r;
    }

    // 扇形コリジョン（斬撃判定用）
    static pointInSector(px, py, cx, cy, radius, startAngle, endAngle) {
        const distance = this.distance(px, py, cx, cy);
        if (distance > radius) return false;

        let angle = this.angle(cx, cy, px, py);

        // 角度を正規化 (-π から π)
        while (angle < -Math.PI) angle += 2 * Math.PI;
        while (angle > Math.PI) angle -= 2 * Math.PI;

        // startAngleとendAngleも正規化
        while (startAngle < -Math.PI) startAngle += 2 * Math.PI;
        while (startAngle > Math.PI) startAngle -= 2 * Math.PI;
        while (endAngle < -Math.PI) endAngle += 2 * Math.PI;
        while (endAngle > Math.PI) endAngle -= 2 * Math.PI;

        // 扇形の角度範囲をチェック
        if (startAngle <= endAngle) {
            return angle >= startAngle && angle <= endAngle;
        } else {
            // 角度が0度をまたぐ場合
            return angle >= startAngle || angle <= endAngle;
        }
    }

    // 描画ヘルパー
    static drawCircle(ctx, x, y, radius, color, filled = true) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (filled) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
    }

    static drawRect(ctx, x, y, width, height, color, filled = true) {
        if (filled) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
        } else {
            ctx.strokeStyle = color;
            ctx.strokeRect(x, y, width, height);
        }
    }

    static drawLine(ctx, x1, y1, x2, y2, color, width = 1) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }

    static drawText(ctx, text, x, y, color, font = '16px Arial', align = 'left') {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
    }

    // 扇形描画（斬撃表示用）
    static drawSector(ctx, x, y, radius, startAngle, endAngle, color, filled = true) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.closePath();

        if (filled) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
    }

    // エフェクト描画
    static drawGlow(ctx, x, y, radius, color, intensity = 1) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const alpha = intensity * 0.8;
        gradient.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
        gradient.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // アニメーション関数
    static easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    static easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    static easeIn(t) {
        return t * t * t;
    }

    // DOM操作
    static createElement(tag, className, parent) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (parent) parent.appendChild(element);
        return element;
    }

    static addEventListeners(element, events) {
        for (const [event, handler] of Object.entries(events)) {
            element.addEventListener(event, handler);
        }
    }

    // ローカルストレージ
    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    }

    static loadFromLocalStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
            return defaultValue;
        }
    }

    // 時間フォーマット
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // スコアフォーマット
    static formatScore(score) {
        return score.toLocaleString();
    }

    // デバウンス
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // スロットル
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // カラー操作
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static addAlpha(color, alpha) {
        if (color.startsWith('#')) {
            const rgb = this.hexToRgb(color);
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        }
        return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }
}

// 定数
const GAME_CONFIG = {
    CANVAS_WIDTH: 1600,
    CANVAS_HEIGHT: 900,
    GRAVITY: 0.5,
    FLOOR_Y: 800,

    // プレイヤー設定
    PLAYER: {
        WIDTH: 40,
        HEIGHT: 60,
        SPEED: 6,
        JUMP_FORCE: 12,
        DASH_DISTANCE: 100,
        DASH_DURATION: 0.25,
        INVINCIBLE_FRAMES: 15
    },

    // 斬撃設定
    SLASH: {
        RANGE: 120,
        ANGLE: 120, // degrees
        COOLDOWN: 0.4,
        ECHO_DELAY: 2.0
    },

    // 敵設定
    ENEMY: {
        SPAWN_INTERVAL: 2.0,
        MAX_CONCURRENT: 12
    },

    // タイマー設定
    TIMER: {
        INITIAL: 90,
        WARNING_THRESHOLD: 20,
        CRITICAL_THRESHOLD: 10
    },

    // カラーパレット
    COLORS: {
        BACKGROUND: '#101020',
        PLAYER: '#66ccff',
        ECHO: '#99ffff',
        ENEMY: '#ff6666',
        ENEMY_ALT: '#ffaa33',
        UI_ACCENT: '#ffff99',
        TEXT: '#ffffff'
    }
};

// グローバル変数
window.Utils = Utils;
window.GAME_CONFIG = GAME_CONFIG;
