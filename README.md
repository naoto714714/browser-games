# Browser Games Collection

複数のブラウザゲームをまとめたコレクションプロジェクト。各ゲームは独立したサブディレクトリに配置され、GitHub Pages上で公開されます。

## 🎮 収録ゲーム

### [Super Mario Bros 1-1](./super-mario-bros-1-1/)
**スーパーマリオブラザーズ1-1完全再現**

- 🍄 **特徴**: オリジナル1-1ステージの完全再現、本格的な物理演算
- 🎯 **オリジナル要素**: プロシージャルピクセルアート、Web Audio API音響システム
- 🛠️ **技術**: HTML5 Canvas, Vanilla JavaScript, Object-Oriented Design
- 🕹️ **操作**: 矢印キー移動、スペースでジャンプ、Xで走る

[➤ ゲームを開始](./super-mario-bros-1-1/)

### [Neon Breaker](./neon-breaker/)
**近未来的ブロック崩しゲーム**

- 🚀 **特徴**: サイバーパンク風デザイン、特殊ブロック、パーティクルエフェクト
- 🎯 **オリジナル要素**: 爆発ブロック、マルチプライヤーシステム、ネオンエフェクト
- 🛠️ **技術**: HTML5 Canvas, Vanilla JavaScript, CSS3

[➤ ゲームを開始](./neon-breaker/)

### [ねこ型ブラックホール養殖場](./cataclysmic-cat-ranch/)
**宇宙×ねこ×インフレ系クリッカーゲーム**

- 🐱 **特徴**: ねこ型ブラックホールを撫でてGraviCoin獲得、無限インフレの爽快感
- 🌌 **オリジナル要素**: 次元跳躍システム、量子毛玉、時間反転コア
- 🛠️ **技術**: HTML5, Vanilla JavaScript, CSS3アニメーション
- 🎮 **ジャンル**: インクリメンタル/クリッカー/放置ゲーム

[➤ ゲームを開始](./cataclysmic-cat-ranch/)

### [刹那の見切り](./reaction-time-game/)
**可愛いピクセルアート反射神経バトルゲーム**

- 🐱 **特徴**: 超可愛いねこキャラクター、AIとの反射神経バトル、段階的難易度上昇
- ⚔️ **バトルシステム**: 5種類の個性豊かな敵キャラクターとの一対一勝負
- ⚡ **オリジナル要素**: Web Audio API音響効果、パーティクルエフェクト、12x12高精細ピクセルアート
- 🛠️ **技術**: HTML5 Canvas, Vanilla JavaScript, Web Audio API, レスポンシブデザイン
- 🎮 **操作**: クリック/タップで反応、直感的な操作
- 🏆 **ゲーム性**: 敵より早く反応して勝ち抜け！負けたらゲームオーバー

[➤ ゲームを開始](./reaction-time-game/)

### [Piano Player](./piano-player/)
**高品質音響合成によるリアルなブラウザピアノ**

- 🎹 **特徴**: 3オクターブ（C3-E5）の本格的なピアノ、リアルタイムサウンド生成
- 🎵 **オリジナル要素**: Web Audio APIによる倍音合成、リバーブエフェクト、ADSRエンベロープ
- 🛠️ **技術**: Web Audio API、HTML5、Vanilla JavaScript、レスポンシブデザイン
- 🎮 **操作**: キーボード/マウス/タッチ対応、複数キー同時演奏可能
- 🎨 **デザイン**: リアルな鍵盤デザイン、押下時の影と動きのアニメーション

[➤ ゲームを開始](./piano-player/)

## 🚀 プロジェクト概要

### 公開設定
- **プラットフォーム**: GitHub Pages
- **アクセス方法**: `https://[username].github.io/browser-games/[ゲーム名]/`
- **運用方針**: 静的ファイルのみ（ビルド工程なし）

### ディレクトリ構成
```
browser-games/
├── super-mario-bros-1-1/      # スーパーマリオ1-1完全再現
│   ├── index.html            # ゲームエントリーポイント
│   ├── css/style.css         # スタイルシート
│   ├── js/                   # JavaScript モジュール
│   └── README.md             # ゲーム説明
├── neon-breaker/             # ネオンブロック崩し
│   ├── index.html           # ゲームエントリーポイント
│   ├── css/style.css        # スタイルシート
│   ├── js/                  # JavaScript モジュール
│   └── README.md            # ゲーム説明
├── cataclysmic-cat-ranch/   # ねこ型ブラックホール養殖場
│   ├── index.html           # ゲームエントリーポイント
│   ├── css/style.css        # スタイルシート
│   ├── js/                  # JavaScript モジュール
│   └── README.md            # ゲーム説明
├── reaction-time-game/      # 刹那の見切り（反射神経ゲーム）
│   ├── index.html           # ゲームエントリーポイント
│   ├── css/style.css        # スタイルシート
│   ├── js/                  # JavaScript モジュール
│   └── README.md            # ゲーム説明
├── piano-player/            # ピアノプレイヤー
│   ├── index.html           # ゲームエントリーポイント
│   ├── css/style.css        # スタイルシート
│   ├── js/                  # JavaScript モジュール
│   └── README.md            # ゲーム説明
└── README.md                # このファイル
```

### 開発ルール
1. **エントリーポイント**: 各ゲームは `index.html` から開始
2. **独立性**: ゲーム間で名前衝突を防ぐ
3. **CDN利用**: 外部ライブラリはCDN参照を推奨
4. **レスポンシブ**: モバイル対応必須

## 🛠️ 開発フロー

1. **新規ゲーム作成**
   ```bash
   mkdir <ゲーム名>
   cd <ゲーム名>
   touch index.html README.md
   ```

2. **開発・テスト**
   - ローカル開発サーバーで動作確認
   - VSCode Live Server推奨

3. **デプロイ**
   - mainブランチへマージで自動デプロイ
   - GitHub Pagesで即座に公開

## 🎨 デザインガイドライン

- **モダンUI**: CSS3の最新機能を活用
- **パフォーマンス**: 60FPS維持を目標
- **アクセシビリティ**: キーボード操作対応
- **視覚効果**: アニメーション・エフェクトで魅力向上

## 📝 ライセンス

MIT License - 学習・改良・再配布自由

---

**Updated**: 2025年6月
**Games Count**: 5
**Status**: 🟢 Active Development
