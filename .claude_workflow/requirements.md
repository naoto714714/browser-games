# 要件定義

## 目的
bird-and-beansゲームの鳥の表示を、移動状態に応じてアニメーションするように変更する。

## 現状把握
- 現在の実装
  - bird_default.pngのみを使用
  - 移動時も静止時も同じ画像を表示
  - 左右の向きには対応済み

- 利用可能な画像
  - `/bird-and-beans/assets/bird_default.png` - デフォルトの立ち絵
  - `/bird-and-beans/assets/bird_walk.png` - 歩行時の画像

## 要求仕様
1. **静止時の表示**
   - 移動していない間は`bird_default.png`を表示し続ける

2. **移動時の表示**
   - 移動中は`bird_default.png`と`bird_walk.png`を交互に表示
   - アニメーションの切り替えタイミングを適切に設定

## 成功基準
1. 静止時は`bird_default.png`のみ表示される
2. 左右移動時に2つの画像が交互に表示される
3. アニメーションが自然に見える
4. 既存の機能（衝突判定、左右反転など）に影響を与えない