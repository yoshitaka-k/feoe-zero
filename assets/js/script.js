(() => {
  const CONTENT_ID = "page-content";

  // コンテント要素を取得
  function contentEl() {
    return document.getElementById(CONTENT_ID);
  }

  // 同じドキュメントかどうかを判断
  function sameDocument(url) {
    return url.origin === location.origin &&
      url.pathname === location.pathname &&
      url.search === location.search;
  }

  // リンクをクリックしたときに処理を行うかどうかを判断
  function shouldIntercept(event, anchor) {
    if (event.defaultPrevented) return false;
    if (event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return false;
    }
    if (anchor.target && anchor.target !== "_self") return false;
    if (anchor.hasAttribute("download")) return false;

    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return false;
    if (sameDocument(url)) return false;

    return true;
  }

  // ドキュメントを更新
  function updateDocument(doc, url) {
    const next = doc.getElementById(CONTENT_ID);
    const current = contentEl();
    if (!next || !current) return false;

    current.replaceWith(next);
    document.title = doc.title || document.title;

    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView();
        return true;
      }
    }

    window.scrollTo(0, 0);
    return true;
  }

  // ページビューをトラック
  function trackPageView(url) {
    if (typeof gtag === "function") {
      gtag("config", "G-WFR8C7XMQ9", {
        page_path: url.pathname + url.search + url.hash,
      });
    }
  }

  // ページを遷移
  async function navigate(url, { push = true } = {}) {
    const res = await fetch(url.href, {
      headers: { Accept: "text/html" },
    });
    if (!res.ok) {
      location.assign(url.href);
      return;
    }

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const apply = () => {
      if (!updateDocument(doc, url)) {
        location.assign(url.href);
        return;
      }
      if (push) {
        history.pushState({}, "", url.href);
      }
      trackPageView(url);
    };

    if (document.startViewTransition) {
      await document.startViewTransition(apply).finished.catch(() => {});
    } else {
      apply();
    }
  }

  // リンクをクリックしたときに処理を行う
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!anchor || !shouldIntercept(event, anchor)) return;

    event.preventDefault();
    const url = new URL(anchor.href, location.href);
    navigate(url).catch(() => location.assign(url.href));
  });

  // ブラウザの戻るボタンを押したときに処理を行う
  window.addEventListener("popstate", () => {
    navigate(new URL(location.href), { push: false }).catch(() => {
      location.reload();
    });
  });
})();
