以下の仕様書を元に、新たなブラウザゲームを作成してください\
新しいブランチで作業を開始し、ゲームが完成したらプルリクエストを出すところまで作業してください\
また、このプロンプトは作成したフォルダ内に `prompt.md` として保存しておくこと\
遠慮は要りません。全力を出して最高で完璧なゲームを作成してください。
ゲームタイトル案

「ねこ型ブラックホール養殖場 (Cataclysmic Cat Ranch)」

コンセプト

宇宙に漂う極小ブラックホールは、ねこ型に擬態して人類に可愛がられることで成長する――そんな世界で、プレイヤーはブラックホールを**撫でる（クリック）**ことで重力エネルギーを採取し、研究資金を稼ぎつつさらなる成長を促す。放置している間もホーキング放射から収益が発生し、ログイン時には資源が桁違いに増えている快感を追求するインフレゲーム。

コアリソース

リソース

説明

GraviCoin (GC)

メイン通貨。クリックおよび放置収益で獲得。

Singularity Level (SLv)

ねこブラックホールの成長度。SLvが高いほどクリック・放置効率が指数的に上昇。

量子毛玉 (QY)

レア通貨。周回リセット（次元跳躍）時に獲得し、恒久パッシブを解放・強化。

主要アクション

撫でるボタン : base_click × (1 + クリック強化) GC を即時取得。

放置収益 : 毎秒 base_idle × SLv × (1 + 放置強化) GC を自動取得。

次元跳躍（リセット） : GC と SLv をリセットし大量の QY を獲得。周回ごとにインフレ速度アップ。

アップグレード例

名称

カテゴリ

効果

初期コスト

コスト増加式

猫じゃらし改良

クリック強化

クリック収益 +20%

100 GC

コスト×1.15^n

クッション型時空安定器

放置強化

base_idle +0.5

500 GC

コスト×1.12^n

特殊相対論おやつ

SLvアップ

SLv +1

1 k GC

コスト×1.25^n

量子毛玉コンデンサー

パッシブ

放置収益 +25% 永続

10 QY

コスト×1.3^n

パッシブスキル（QY消費）

イベントホライゾン拡張 : 放置収益 +X%（累積可）

グラビティポンプロック : クリック効果 +X%

シュレ猫多重化 : 同時に複数ねこBHを養殖、収益多重化

時間反転コア : オフライン放置中も経過時間²で収益計算（長時間放置ほど爆発的）

プレイフィール設計

序盤 : 数値が10倍単位で伸びる爽快感を演出。

中盤 : 桁が指数関数的に増大し、単位を K→M→G→T→P→E→Z→Y→特別命名単位 へ切替。

周回 : QY で新メカニクスを開放し、前周回の最大値を数分で突破する爽快感。

UI/UX : シンプルレイアウト＋ネコミミ演出。数値はコンパクト表記 (1.23e+42) と単位アイコン併用。

ランダムイベント & 実績

宇宙ヤマト便 : 30 秒間クリック報酬×10。

銀河マタタビ祭 : SLv アップグレードコスト半減。

実績例 : 「初めて YC (ヨクシング) 単位到達」「1 秒間に 1 T+ GC 稼ぐ」——実績ごとに恒久バフ。

バランス指針

クリック収益は放置の 20–30% を維持し、能動行動に価値を持たせる。

後半は放置収益がクリックを逆転し、オフライン報酬で帰還時の爆発感を演出。

各アップグレードのコスト曲線は緩やかな指数上昇で「もう少しで買える」心理を刺激。

リセット推奨ポップアップを条件達成時に表示し、プレイヤーに最適なタイミングを示唆。

テキスト＆アートトーン

セリフ: ゆるい猫語 (例:「ニャイーン！ GC が溢れ出してるニャ」)。

ビジュアル: 星空＋カワイイ×シュールな黒猫シルエット。色温度は 7000 K 寄りで暖かい青白系。

この仕様を基に、クリックの爽快感と無限インフレの中毒性を備えた「ねこ型ブラックホール養殖場」を実装してください。
