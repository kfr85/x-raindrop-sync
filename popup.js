'use strict';

(async () => {
  const { raindropToken } = await chrome.storage.sync.get('raindropToken');
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');

  if (raindropToken) {
    dot.classList.add('ok');
    text.textContent = '同期中';
  } else {
    dot.classList.add('ng');
    text.textContent = '未設定（設定を開いてください）';
  }

  const today = new Date().toISOString().slice(0, 10);
  const { daily_counts } = await chrome.storage.local.get('daily_counts');
  const count = (daily_counts || {})[today] || 0;
  document.getElementById('today-count').textContent = count;
})();
