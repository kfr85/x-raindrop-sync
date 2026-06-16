'use strict';

(function () {
  function getTweetUrl(article) {
    const link = article.querySelector('a[href*="/status/"]');
    if (!link) return null;
    try {
      const url = new URL(link.href);
      return `https://x.com${url.pathname}`;
    } catch {
      return null;
    }
  }

  function getTweetText(article) {
    const el = article.querySelector('[data-testid="tweetText"]');
    return el ? el.innerText.trim() : '';
  }

  function getAuthor(article) {
    const links = article.querySelectorAll('a[role="link"][href^="/"]');
    for (const link of links) {
      try {
        const pathname = new URL(link.href).pathname;
        if (/^\/[A-Za-z0-9_]{1,15}$/.test(pathname)) {
          return pathname.slice(1);
        }
      } catch {
        // ignore
      }
    }
    return '';
  }

  document.addEventListener(
    'click',
    (e) => {
      const btn = e.target.closest('[data-testid="like"]');
      if (!btn) return;

      const article = btn.closest('article');
      if (!article) return;

      const url = getTweetUrl(article);
      if (!url) return;

      const text = getTweetText(article);
      const author = getAuthor(article);

      chrome.runtime.sendMessage({
        type: 'TWEET_LIKED',
        payload: { url, text, author },
      });
    },
    true
  );
})();
