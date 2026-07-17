(($win, $doc) => {
  // コンテント要素のID
  const NAV_ID = "header-nav";
  const CONTENT_NAV_ID = "content-nav";

  // コンテント要素を取得
  function navEl() {
    return $doc.getElementById(NAV_ID);
  }
  function contentNavEl() {
    return $doc.getElementById(CONTENT_NAV_ID);
  }

  // コンテントナビゲーションを更新
  function updateContentNav() {
    const nav = navEl();
    const contentNav = contentNavEl();
    if (!nav || !contentNav) return;

    const dpr = $win.devicePixelRatio || 1;
    const h = Math.ceil(nav.getBoundingClientRect().height * dpr) / dpr;

    contentNav.style.setProperty("top", `${h}px`);
  }

  // ロード時に更新
  $win.addEventListener("load", () => {
    updateContentNav();
  });

  // リサイズ時に更新
  $win.addEventListener("resize", () => {
    updateContentNav();
  });

  // スクロール時に更新
  $win.addEventListener("scroll", () => {
    updateContentNav();
  });
})(window, document);

/**
 * ページ遷移の制御
 */
(($win, $doc) => {
  // コンテント要素のID
  const CONTENT_ID = "page-content";

  // コンテント要素を取得
  function contentEl() {
    return $doc.getElementById(CONTENT_ID);
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

    // コンテント要素を置き換え
    current.replaceWith(next);
    $doc.title = doc.title || $doc.title;

    // ハッシュがある場合はスクロールを移動
    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      const target = $doc.getElementById(id);
      if (target) {
        target.scrollIntoView();
        return true;
      }
    }

    // スクロールを移動
    $win.scrollTo(0, 0);

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

    // ページを遷移
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

    // ビュートランジションが利用可能な場合は使用
    if ($doc.startViewTransition) {
      await $doc.startViewTransition(apply).finished.catch(() => {});
    } else {
      apply();
    }
  }

  // リンクをクリックしたときに処理を行う
  $doc.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!anchor || !shouldIntercept(event, anchor)) return;

    event.preventDefault();
    const url = new URL(anchor.href, location.href);
    navigate(url).catch(() => location.assign(url.href));
  });

  // ブラウザの戻るボタンを押したときに処理を行う
  $win.addEventListener("popstate", () => {
    navigate(new URL(location.href), { push: false }).catch(() => {
      location.reload();
    });
  });
})(window, document);
