# Browser Games Collection

複数のブラウザゲームをまとめたコレクションプロジェクト。各ゲームは独立したサブディレクトリに配置され、GitHub Pages上で公開されます。

## 🎮 収録ゲーム

### [Super Mario Bros 1-1](./super-mario-bros-1-1/)
**スーパーマリオブラザーズ1-1完全再現**

[➤ ゲームを開始](./super-mario-bros-1-1/)

### [Neon Breaker](./neon-breaker/)
**近未来的ブロック崩しゲーム**

[➤ ゲームを開始](./neon-breaker/)

### [ねこ型ブラックホール養殖場](./cataclysmic-cat-ranch/)
**宇宙×ねこ×インフレ系クリッカーゲーム**

[➤ ゲームを開始](./cataclysmic-cat-ranch/)

### [刹那の見切り](./reaction-time-game/)
**可愛いピクセルアート反射神経バトルゲーム**

[➤ ゲームを開始](./reaction-time-game/)

### [Multi-Instrument Player](./piano-player/)
**5つの楽器を演奏できる本格的ブラウザ音楽プレイヤー**

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
