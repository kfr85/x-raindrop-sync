'use strict';

const RAINDROP_API = 'https://api.raindrop.io/rest/v1';

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TWEET_LIKED') {
    handleTweet(message.payload, 'x-likes', 'synced_likes');
  } else if (message.type === 'TWEET_BOOKMARKED') {
    handleTweet(message.payload, 'x-bookmarks', 'synced_bookmarks');
  }
});

async function handleTweet({ url, text, author }, tag, syncedKey) {
  const settings = await chrome.storage.sync.get(['raindropToken', 'collectionId']);

  if (!settings.raindropToken) {
    console.warn('[X→Raindrop] APIトークンが未設定です。オプション画面で設定してください。');
    return;
  }

  const local = await chrome.storage.local.get(syncedKey);
  const synced = new Set(local[syncedKey] || []);
  if (synced.has(url)) {
    console.log(`[X→Raindrop] 既に同期済み (${tag}):`, url);
    return;
  }

  const collectionId = parseInt(settings.collectionId) || -1;
  const title = author
    ? `@${author}: ${text.slice(0, 120)}`
    : text.slice(0, 120) || url;

  try {
    const res = await fetch(`${RAINDROP_API}/raindrop`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.raindropToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        link: url,
        title,
        excerpt: text,
        collection: { $id: collectionId },
        tags: [tag],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`[X→Raindrop] APIエラー (${tag}):`, res.status, err);
      return;
    }

    synced.add(url);
    await chrome.storage.local.set({ [syncedKey]: [...synced].slice(-1000) });

    const today = new Date().toISOString().slice(0, 10);
    const { daily_counts } = await chrome.storage.local.get('daily_counts');
    const counts = daily_counts || {};
    counts[today] = (counts[today] || 0) + 1;
    await chrome.storage.local.set({ daily_counts: counts });

    console.log(`[X→Raindrop] 同期完了 (${tag}):`, url);
  } catch (err) {
    console.error(`[X→Raindrop] ネットワークエラー (${tag}):`, err);
  }
}
