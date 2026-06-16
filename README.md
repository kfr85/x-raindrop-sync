# X Likes → Raindrop

X(Twitter)のいいねを自動的に [Raindrop.io](https://raindrop.io) のコレクションに同期するChrome拡張機能です。

## 機能

- X でいいね ❤️ を押した瞬間に自動でRaindropに保存
- 保存先コレクションを選択可能
- 重複保存防止（同じツイートは1回のみ保存）
- 今日の同期数をポップアップで確認
- 同期履歴のクリア機能

## インストール

### 1. リポジトリをクローン

```bash
git clone https://github.com/kfr85/x-raindrop-sync.git
```

### 2. Chromeに読み込む

1. Chromeで `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をON
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. クローンしたフォルダを選択

### 3. Raindrop APIトークンを取得

1. [Raindrop.io 統合設定](https://app.raindrop.io/settings/integrations) を開く
2. 「テストトークン」をコピー

### 4. 拡張機能を設定

1. Chromeのツールバーの拡張機能アイコンをクリック
2. 「設定を開く」をクリック
3. APIトークンを貼り付け
4. 「接続テスト」で動作確認
5. 保存先コレクションを選択（任意）
6. 「保存」をクリック

## 使い方

設定完了後、X(Twitter)でいいね ❤️ を押すと自動的にRaindropに保存されます。
保存されたブックマークには `x-likes` タグが付きます。

## ファイル構成

```
├── manifest.json   # Chrome拡張マニフェスト (Manifest V3)
├── content.js      # X上でいいねボタンのクリックを検知
├── background.js   # Raindrop APIへの保存処理 (Service Worker)
├── popup.html/js   # 拡張機能アイコンクリック時のUI
└── options.html/js # 設定画面
```

## 動作の仕組み

1. `content.js` が X のページに挿入され、`[data-testid="like"]` ボタンへのクリックをキャプチャ
2. ツイートのURL・テキスト・投稿者を取得して `background.js` へ送信
3. `background.js` が Raindrop.io API を呼び出してブックマーク作成
4. 重複チェックのため、同期済みURLを `chrome.storage.local` に記録

## 注意事項

- XのDOM構造が変更されると動作しなくなる可能性があります
- Raindrop.io APIの[レート制限](https://developer.raindrop.io/)にご注意ください
- Manifest V3 / Chrome 120+ 対応
