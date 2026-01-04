(function(){
  console.log('PJAX script loaded');
  // Simple PJAX: intercept internal link clicks and replace `.content`
  function isSameOrigin(url) {
    try {
      const u = new URL(url, location.href);
      return u.origin === location.origin;
    } catch(e) { return false; }
  }

  function isNavigableLink(a) {
    if (!a) return false;
    const href = a.getAttribute('href');
    if (!href) return false;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    if (a.target && a.target !== '' && a.target !== '_self') return false;
    if (href.startsWith('#')) return false;
    return true;
  }

  async function fetchAndSwap(url, addToHistory = true) {
    console.log('PJAX navigating to', url);
    try {
      const res = await fetch(url, { headers: { 'X-PJAX': 'true' } });
      if (!res.ok) {
        // fallback to full navigation
        window.location.href = url;
        return;
      }
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const newContent = doc.querySelector('.content');
      if (!newContent) {
        window.location.href = url; // fallback
        return;
      }
      const curContent = document.querySelector('.content');
      curContent.innerHTML = newContent.innerHTML;

      // update title
      if (doc.title) document.title = doc.title;

      // update body class (for background changes etc.)
      document.body.className = doc.body.className;

      // run scripts found in new content
      const scripts = newContent.querySelectorAll('script');
      scripts.forEach(old => {
        const script = document.createElement('script');
        if (old.src) script.src = old.src;
        else script.textContent = old.textContent;
        document.body.appendChild(script);
        script.onload = () => script.remove();
      });

      if (addToHistory) history.pushState({ url: url }, '', url);

      // dispatch a custom event so page-specific code can init
      window.dispatchEvent(new CustomEvent('pjax:load', { detail: { url } }));
    } catch (err) {
      console.error('PJAX fetch failed, falling back to full load', err);
      window.location.href = url;
    }
  }

  document.addEventListener('click', function(e){
    const a = (e.target && e.target.closest) ? e.target.closest('a') : null;
    console.log('PJAX click handler, target=', e.target, 'anchor=', a);
    if (!a) return;
    if (!isNavigableLink(a)) return;
    const href = a.getAttribute('href');
    if (!isSameOrigin(href)) return; // external
    e.preventDefault();
    fetchAndSwap(href, true);
  });

  window.addEventListener('popstate', function(e){
    const url = (e.state && e.state.url) || location.href;
    fetchAndSwap(url, false);
  });

  // allow other scripts to call manual navigation
  window.pjaxNavigate = fetchAndSwap;
})();
