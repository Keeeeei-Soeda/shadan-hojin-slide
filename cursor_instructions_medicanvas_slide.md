# Cursor指示書：メディキャンバス紹介スライドの挿入＋写真枠のシルエット化

対象リポジトリ：`shadan-hojin-slide`（一般社団法人 国際ヘルスケアAI管理推進協会｜10/4ピッチ用 reveal.jsスライド）

## 0. このドキュメントの使い方

このファイルをリポジトリ直下に置き、Cursorに「`cursor_instructions_medicanvas_slide.md` の仕様どおりに実装して」と指示する。
既存の設計・制約（`cursor_instructions_pitch_slides.md`）はそのまま有効。本書はそこへの**追加変更**のみを定義する。不明点は推測で埋めず、`TODO:` コメントを残して先に進めること。

変更は2つ。
- **変更A**：スライド⑧（他との違い）と⑨（理事紹介）の間に、株式会社メディキャンバスの紹介スライドを1枚挿入する。
- **変更B**：理事紹介⑨・アドバイザー紹介⑩の写真プレースホルダー「写真」を、人物シルエットの線画（SVG）に差し替える。

デザインは既存スライドに合わせる（ネイビー×ゴールド、明朝見出し、自動スタッガーのモーション）。メディキャンバスの会社資料のデザイン（ネイビー×シアン）は踏襲しない。

---

## 変更A：メディキャンバス紹介スライドの挿入

### A-1. 挿入位置

`index.html` の `<div class="slides">` 内。⑧ `s-compare`（`<!-- 他との違い -->`）の閉じ `</section>` と、⑨ `s-board`（`<!-- 理事紹介 -->`）の `<section>` の間に、新しい `<section class="s-practice">` を1つ追加する。

並び順：… → ⑧ s-compare → **（新）s-practice** → ⑨ s-board → ⑩ s-advisors → ⑪ s-closing

### A-2. このスライドの位置づけ

協会（AI管理・認定の中立団体）のピッチに営利企業を並べる形になるため、宣伝ではなく**「協会の監修者が医療AIの最前線で実践している」という専門性の裏付け**として見せる。⑨で「副田 渓｜理事・講師／監修」が登場する直前に置き、流れをつなぐ。末尾に、医療機関向けのCV（相談導線）を1行入れる。

### A-3. レイアウトの意図（確定デザイン）

- 上部：英字ラベル → 明朝タイトル（1行）→ リード文。
- 中央：**2カード**を横並び（患者向け／医療機関向け）。各カードは「ラベル→見出し→説明2行」。
- 下端：**ゴールド地のCTAストリップ**（行動喚起）を1本。
- **左右の余白**：左は他スライドと揃えて `88px` のまま、**右だけ `48px` に詰めて横に広げる**（このスライドのみ。タイトル左端は他スライドと揃い、カード・CTAが右に広がる）。

### A-4. HTML（`index.html` に貼り付け）

モーションは `js/motion.js` が自動付与する（`--i`/`--d` は手書きしない）。カード群は `.m-stagger-children`（コンテナ自体は動かさず子を順次表示）、各カードに `.m-scale` を付ける。既存②と同じ流儀。

```html
      <!-- メディキャンバス紹介（協会監修者の実践的裏付け。⑧と⑨の間） -->
      <section class="s-practice">
        <p class="label">AI IN PRACTICE</p>
        <h2 class="title">最前線でAIを使う実践者が、理事にいます。</h2>
        <p class="lead">その理事・副田が代表を務める株式会社メディキャンバスは、開発もAIを中心に進めています。</p>

        <div class="practice-cards m-stagger-children">
          <div class="practice-card m-scale">
            <p class="label is-sm">PATIENT APPS</p>
            <h3 class="card-title">患者向けのAIアプリ</h3>
            <p class="card-text">医療機関と連携し、患者を支えるAIアプリを開発。</p>
            <p class="card-text">診察サポートや患者コミュニティなど、患者の毎日に寄り添うサービスを届けている。</p>
          </div>
          <div class="practice-card m-scale">
            <p class="label is-sm">HOSPITAL OPERATIONS</p>
            <h3 class="card-title">医療機関向けの業務効率化アプリ</h3>
            <p class="card-text">院内業務をAIで効率化・自動化するアプリを開発。</p>
            <p class="card-text">記録・共有・事務作業の負担を減らし、現場が患者と向き合う時間を生み出す。</p>
          </div>
        </div>

        <div class="practice-cta">
          <p><b>「自社でアプリを作りたい」「AIで自動化したい」</b>医療機関の方は、ぜひ一度ご相談ください。</p>
        </div>

        <aside class="notes"></aside>
      </section>
```

補足（モーションの効き方）：`<section>` 直下の `label` / `title` / `lead` / `practice-cta` が順に表示され、`.practice-cards` は `.m-stagger-children` なので自身は動かず、中の2カード（`.m-scale`）が順に拡大表示される。表示順・間隔は自動。`<aside class="notes">` はモーション対象外。

### A-5. CSS（`css/theme.css` に追記）

既存の `.card-title`（明朝30px）・`.card-text`（21px）はそのまま流用する。以下を「⑧ 他との違い」と「⑨ 理事紹介」の間あたり、分かりやすい位置に追記する。

まず、`.lead` は現状 `.s-about .lead` 限定なので、セレクタに `.s-practice .lead` を併記する。

変更前：
```css
.s-about .lead {
  margin: 18px 0 0;
  font-size: 22px;
  color: var(--beige);
}
```
変更後：
```css
.s-about .lead,
.s-practice .lead {
  margin: 18px 0 0;
  font-size: 22px;
  color: var(--beige);
}
```

続けて、このスライド専用の指定を追記する。

```css
/* ================================================================
 * （⑧.5）メディキャンバス紹介
 * ================================================================ */

/* 左は他スライドと揃えて88px、右だけ48pxに詰めて横幅を広げる */
.s-practice { padding-right: 48px; }

/* 小さめの英字ラベル（カード内） */
.s-practice .label.is-sm { font-size: 16px; }

/* 2カード：残りの高さいっぱいに広げて横並び */
.practice-cards {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin: 34px 0 22px;
}
.practice-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 28px 30px;
  border: 1px solid var(--gold-line);
  box-sizing: border-box;
}
.practice-card .card-title { margin-top: 2px; }
/* 2行目の説明は少しだけ控えめに */
.practice-card .card-text + .card-text { opacity: .9; }

/* 行動喚起（CV）：ゴールド地に濃紺文字の横長ストリップ（下端） */
.practice-cta {
  padding: 22px 36px;
  background: var(--gold);
  box-sizing: border-box;
}
.practice-cta p {
  margin: 0;
  font-size: 21px;
  line-height: 1.6;
  font-weight: 500;
  color: var(--bg);
}
.practice-cta p b { font-weight: 700; }
```

レイアウトの仕組み：`<section>` は既存CSSで縦方向のфлекс（`flex-direction: column`）。`.practice-cards` に `flex: 1 1 auto` を与えることで、リード文とCTAの間の余白を2カードが埋め、CTAは自然に下端に来る。2カードはグリッドの行ストレッチで同じ高さにそろう。

### A-6. フォントサイズ下限（既存基準を厳守）

`.card-title` 30px / `.card-text` 21px / ラベル 16px（下限ちょうど）/ タイトル 44px。いずれも既存の下限を満たす。右余白を詰めたことで、タイトルとカード本文1行目は1行に収まる想定。もし環境により改行が出る場合は、**文字を小さくせず**、該当行を短くして調整する（例：カード2の1行目は読点を省いて「院内業務をAIで…」としている）。

---

## 変更B：写真枠を人物シルエット（線画SVG）に差し替える

### B-1. 現状

理事紹介⑨（`.s-board`）の6名と、アドバイザー紹介⑩（`.s-advisors`）の2名は、画像未配置のあいだ `<span class="photo-empty">写真</span>` の「写真」テキストが丸枠内に表示される。`js/media.js` が画像ロード成功時に親へ `.has-image` を付け、CSSで `.photo-empty` を隠す。

### B-2. 変更方針

「写真」テキストを、人物シルエットの線画SVGに置き換える。画像が配置されたら従来どおり画像が表示され、シルエットは隠れる（`.has-image` 制御は維持）。線画SVGのみを使い、フリー素材・AI生成の人物画像は使わない。対象は⑨の6枠・⑩の2枠すべて。

### B-3. HTML（`.photo-empty` の中身を差し替え）

`index.html` 内の `<span class="photo-empty">写真</span>` を、以下に置き換える（⑨⑩の計8箇所すべて同じ内容）。`.photo-empty` クラスは残すこと（表示制御と中央寄せをそのまま使う）。

```html
            <span class="photo-empty" aria-hidden="true">
              <svg class="photo-silhouette" viewBox="0 0 48 48">
                <circle cx="24" cy="18" r="8"/>
                <path d="M9 41 a15 15 0 0 1 30 0"/>
              </svg>
            </span>
```

`<img>` タグ・`alt`・配置パス（`assets/board/01.jpg`〜`06.jpg`、`assets/advisors/01.jpg`・`02.jpg`）は変更しない。

### B-4. CSS（`css/theme.css` の「写真・QRの枠」セクションに追記）

既存 `.icon-medal` と同じトーン（`fill: none` ＋ ゴールドのストローク）でそろえる。既存の `.photo-empty` / `.photo.has-image .photo-empty { display:none }` はそのまま活かす。

```css
.photo-silhouette {
  width: 46%;
  height: auto;
  fill: none;
  stroke: var(--gold);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  overflow: visible;
}
/* ⑩の大きな写真枠（.is-large）ではシルエットもやや細く */
.photo.is-large .photo-silhouette {
  width: 42%;
  stroke-width: 1.75;
}
```

QRコード枠（`.qr-empty`「QRコード」）は変更しない。大枠⑩の金のリング（`.photo.is-large .ring`）もそのまま。

---

## 共通：公開時の必須作業

### C-1. キャッシュバスティング（CSSを変更したため必須）

`css/theme.css` を変更するので、`index.html` 内の `?v=` の値を**全箇所まとめて**新しい値に書き換える。

- 現状：`?v=20260930-5`（`fonts.css` / `theme.css` / `motion.css` / `media.js` / `motion.js` / `fit.js`）
- 変更後：全箇所を同じ新しい値へ（例：`?v=20261004-1`）

### C-2. フォントサブセットの作り直し（文言を追加したため必須）

同梱フォントはスライドで使う文字だけのサブセット。新スライドで追加した文字（「践」「副」「搭」「院」「率」「担」「減」「寄」「添」など、既存に無い字）は、作り直さないとシステムフォント表示になる。文言を確定させてから、ネット接続した状態で次を実行する（Python 3 必要）。

```sh
python3 scripts/build-fonts.py
```

実行できない環境でも表示自体は崩れない（未収録の字はシステムの明朝／ゴシックで出る）。その場合は `TODO:` を残す。

---

## 完了時の確認（実装後に1つずつチェック）

- [ ] 新スライドが⑧（他との違い）と⑨（理事紹介）の**間**に入っている（⑧ → メディキャンバス → ⑨）
- [ ] タイトル・リード・2カード・CTAの文言が A-4 のとおり
- [ ] タイトル「最前線でAIを使う実践者が、理事にいます。」が1行に収まる
- [ ] カード見出し・本文1行目が改行していない（右余白48pxが効いているか）
- [ ] 左端（ラベル・タイトル）が他スライドと揃っている（左余白88px）
- [ ] CTAがゴールド地・濃紺文字で、スライド下端に配置されている
- [ ] モーションが手動設定なしで再生され、2秒以内に完了する（前のスライドに戻っても再生）
- [ ] 数値実績・絵文字・グラデーション・人物写真が入っていない
- [ ] ⑨6枠・⑩2枠すべてで「写真」テキストが人物シルエット線画に変わっている
- [ ] 画像（`assets/board/*.jpg`・`assets/advisors/*.jpg`）を置けば、従来どおり写真に差し替わる
- [ ] QRコード枠は従来どおり「QRコード」表記のまま
- [ ] `index.html` の `?v=` を全箇所新しい値に更新した
- [ ] （可能なら）`python3 scripts/build-fonts.py` でフォントを作り直した
- [ ] 1280×720基準で文字切れ・はみ出しがない。Chrome／Safariのフルスクリーンで確認

---

## 参考：確定した文言（コピー用）

- ラベル：AI IN PRACTICE
- タイトル：最前線でAIを使う実践者が、理事にいます。
- リード：その理事・副田が代表を務める株式会社メディキャンバスは、開発もAIを中心に進めています。
- カード1：PATIENT APPS ／ 患者向けのAIアプリ
  - 医療機関と連携し、患者を支えるAIアプリを開発。
  - 診察サポートや患者コミュニティなど、患者の毎日に寄り添うサービスを届けている。
- カード2：HOSPITAL OPERATIONS ／ 医療機関向けの業務効率化アプリ
  - 院内業務をAIで効率化・自動化するアプリを開発。
  - 記録・共有・事務作業の負担を減らし、現場が患者と向き合う時間を生み出す。
- CTA：「自社でアプリを作りたい」「AIで自動化したい」医療機関の方は、ぜひ一度ご相談ください。
