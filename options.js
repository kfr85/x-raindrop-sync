'use strict';

const RAINDROP_API = 'https://api.raindrop.io/rest/v1';

const tokenInput = document.getElementById('token');
const collectionSelect = document.getElementById('collection');
const saveBtn = document.getElementById('save-btn');
const testBtn = document.getElementById('test-btn');
const loadBtn = document.getElementById('load-btn');
const clearBtn = document.getElementById('clear-btn');
const msgEl = document.getElementById('message');

function showMsg(text, type) {
  msgEl.textContent = text;
  msgEl.className = `msg ${type}`;
}

async function fetchCollections(token) {
  const res = await fetch(`${RAINDROP_API}/collections`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.items || [];
}

function populateCollections(collections, selectedId) {
  collectionSelect.innerHTML = '<option value="-1">未整理（デフォルト）</option>';
  for (const col of collections) {
    const opt = document.createElement('option');
    opt.value = col._id;
    opt.textContent = col.title;
    if (String(col._id) === String(selectedId)) opt.selected = true;
    collectionSelect.appendChild(opt);
  }
}

(async () => {
  const { raindropToken, collectionId } = await chrome.storage.sync.get([
    'raindropToken',
    'collectionId',
  ]);
  if (raindropToken) {
    tokenInput.value = raindropToken;
    try {
      const cols = await fetchCollections(raindropToken);
      populateCollections(cols, collectionId);
    } catch {
      // ignore
    }
  }
})();

saveBtn.addEventListener('click', async () => {
  const token = tokenInput.value.trim();
  if (!token) { showMsg('APIトークンを入力してください', 'error'); return; }
  await chrome.storage.sync.set({ raindropToken: token, collectionId: collectionSelect.value });
  showMsg('設定を保存しました', 'success');
});

testBtn.addEventListener('click', async () => {
  const token = tokenInput.value.trim();
  if (!token) { showMsg('APIトークンを入力してください', 'error'); return; }
  try {
    const res = await fetch(`${RAINDROP_API}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    showMsg(`接続成功: ${data.user?.name || data.user?.email || '認証済み'}`, 'success');
  } catch (err) {
    showMsg(`接続失敗: ${err.message}`, 'error');
  }
});

loadBtn.addEventListener('click', async () => {
  const token = tokenInput.value.trim();
  if (!token) { showMsg('APIトークンを先に入力してください', 'error'); return; }
  try {
    const cols = await fetchCollections(token);
    const { collectionId } = await chrome.storage.sync.get('collectionId');
    populateCollections(cols, collectionId);
    showMsg(`${cols.length}件のコレクションを取得しました`, 'success');
  } catch (err) {
    showMsg(`取得失敗: ${err.message}`, 'error');
  }
});

clearBtn.addEventListener('click', async () => {
  await chrome.storage.local.remove('synced_urls');
  showMsg('同期履歴をクリアしました', 'success');
});
