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
      const likeBtn = e.target.closest('[data-testid="like"]');
      const bookmarkBtn = e.target.closest('[data-testid="bookmark"]');
      const btn = likeBtn || bookmarkBtn;
      if (!btn) return;

      const article = btn.closest('article');
      if (!article) return;

      const url = getTweetUrl(article);
      if (!url) return;

      const text = getTweetText(article);
      const author = getAuthor(article);
      const type = likeBtn ? 'TWEET_LIKED' : 'TWEET_BOOKMARKED';

      chrome.runtime.sendMessage({ type, payload: { url, text, author } });
    },
    true
  );
})();
