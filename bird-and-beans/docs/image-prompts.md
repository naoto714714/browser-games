# 鳥の絵を作成する
## 試行錯誤
### 自力でプロンプト作成
元の画像を見ながら以下のやつまで考えた
```md
添付画像の鳥の絵を、ピクセルアートにしてAIに出力してもらいたい
そのためのプロンプトをyaml形式で考えて教えて

# いま自分が考えた内容
16*16ピクセルの、鳥の絵を作成
背景透過pngで出力

### 特徴
- 16*16ピクセルのピクセルアート
- 全身は真っ赤で、お腹部分のみ白色
- リアル寄りではなく日本のアニメ調で、丸いシルエット
- 目は白目に黒点が入るようにし、右上を向いている
- くちばしは黄色く大きく目立つ
```

### AIにプロンプトを書かせる
期待通りの絵が出ないので、スマブラの画像と自分の考えたプロンプトをAIに見せて、yaml形式にしてもらった

### 目と腹が透過される
白で出力させようとすると、白まで透過されてしまうらしい
light blueにする → すごく怖くなったのでghostwhiteにしてみる → 1/2くらいで白で表示されるようになった

### 歩きモーション
いい感じのやつができたから、できた画像と同じプロンプト(先頭に「このキャラクターの足を歩いているようにして」)を渡して歩きモーションを作ってもらう
4分割でやったけど、画像サイズが変わってしまうのが面倒で1枚ずつ生成
最初の生成から4分割でやればよかった

## 最終プロンプト
```yaml
size: 16x16
output_format: png
background: transparent

prompt: >
  16x16 pixel art sprite, crisp black outline, flat shading, bold primary colors, Japanese anime style, of a round red cartoon bird with a ghostwhite belly, an oversized yellow beak, big ghostwhite eyes with black pupils looking up‑right, two stick‑like legs, transparent background.

negative_prompt: >
  realistic, photo, 3d render, detailed shading, gradients, text, watermark, noise, blur

palette:
  - "#FF0000"  # body
  - "#F8F8FF"  # belly & eye whites
  - "#FFFF00"  # beak
  - "#FF99CC"  # tongue
  - "#000000"  # outline & pupils
  - "transparent"
```
