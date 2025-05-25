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

**Updated**: 2024年
**Games Count**: 2
**Status**: 🟢 Active Development
