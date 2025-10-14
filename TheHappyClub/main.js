/**
 * main.js
 * Contains project data (sample) and UI behavior for index and event pages.
 * Replace sample images with your own /assets/ when ready.
 */

(function () {
  // Sample data: events list, each event has images grouped into "prints", "solo", "gif"
  const SAMPLE_EVENTS = [
    {
      id: 'e1',
      title: 'Wedding — Anna & Miguel',
      date: 'June 12, 2025',
      banner: 'https://picsum.photos/seed/event1/1400/500',
      thumb: 'https://picsum.photos/seed/event1thumb/600/400',
      prints: createImageArray('w1', 18),
      solo: createImageArray('s1', 14),
      gif: createVideoArray('g1', 8),
    },
    {
      id: 'e2',
      title: 'Birthday Bash — Mark',
      date: 'August 2, 2025',
      banner: 'https://picsum.photos/seed/event2/1400/500',
      thumb: 'https://picsum.photos/seed/event2thumb/600/400',
      prints: createImageArray('w2', 12),
      solo: createImageArray('s2', 10),
      gif: createVideoArray('g2', 6),
    },
    {
      id: 'e3',
      title: 'Company Night',
      date: 'September 20, 2025',
      banner: 'https://picsum.photos/seed/event3/1400/500',
      thumb: 'https://picsum.photos/seed/event3thumb/600/400',
      prints: createImageArray('w3', 24),
      solo: createImageArray('s3', 20),
      gif: createVideoArray('g3', 10),
    }
  ];

  // helpers generate sample images
  function createImageArray(seed, count) {
    const arr = [];
    for (let i = 1; i <= count; i++) {
      arr.push({
        id: `${seed}-${i}`,
        src: `https://picsum.photos/seed/${seed}${i}/1000/700`,
        thumb: `https://picsum.photos/seed/${seed}${i}/600/400`,
        alt: `${seed} photo ${i}`
      });
    }
    return arr;
  }
  function createVideoArray(seed, count) {
    // We'll use repeat sample mp4 (MDN sample) as placeholder; in practice replace with your GIF/mp4.
    const sampleVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    const arr = [];
    for (let i = 1; i <= count; i++) {
      arr.push({
        id: `${seed}-v${i}`,
        src: sampleVideo,
        thumb: `https://picsum.photos/seed/${seed}v${i}/600/400`,
      });
    }
    return arr;
  }

  // Expose app to window
  window.app = {
    initIndex,
    initEvent
  };

  /* ------------------ INDEX PAGE ------------------ */
  function initIndex() {
    const grid = document.getElementById('eventsGrid');
    const loading = document.getElementById('eventsLoading');
    let batch = 0;
    const PAGE_SIZE = 3;

    // infinite-like load on scroll
    function loadNext() {
      const start = batch * PAGE_SIZE;
      const slice = SAMPLE_EVENTS.slice(start, start + PAGE_SIZE);
      slice.forEach(ev => {
        const tile = createEventTile(ev);
        grid.appendChild(tile);
      });
      batch++;
      if (batch * PAGE_SIZE >= SAMPLE_EVENTS.length) {
        loading.textContent = 'All events loaded';
      } else {
        loading.textContent = 'Scroll down to load more';
      }
    }

    loadNext();
    window.addEventListener('scroll', throttle(() => {
      if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 120)) {
        // near bottom
        if (batch * PAGE_SIZE < SAMPLE_EVENTS.length) loadNext();
      }
    }, 250));
  }

  function createEventTile(ev) {
    const a = document.createElement('a');
    a.href = `event.html?id=${encodeURIComponent(ev.id)}`;
    a.className = 'event-tile';
    a.innerHTML = `
      <img loading="lazy" class="event-thumb" src="${ev.thumb}" alt="${escapeHtml(ev.title)}">
      <div class="event-meta">
        <div class="event-title">${escapeHtml(ev.title)}</div>
        <div class="event-date">${escapeHtml(ev.date)}</div>
      </div>
    `;
    return a;
  }

  /* ------------------ EVENT PAGE ------------------ */
  function initEvent() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || SAMPLE_EVENTS[0].id;
    const ev = SAMPLE_EVENTS.find(e => e.id === id) || SAMPLE_EVENTS[0];

    // hero
    const heroImg = document.getElementById('eventHeroImg');
    const titleEl = document.getElementById('eventTitle');
    const dateEl = document.getElementById('eventDate');

    heroImg.src = ev.banner;
    heroImg.alt = ev.title;
    titleEl.textContent = ev.title;
    dateEl.textContent = ev.date;

    // tabs behavior
    const tabs = document.querySelectorAll('.tab-btn');
    let activeTab = 'prints';
    const galleryGrid = document.getElementById('galleryGrid');
    const loading = document.getElementById('galleryLoading');

    // state for lazy-load
    let loadState = {
      prints: { cursor: 0, page: 0, pageSize: 8 },
      solo: { cursor: 0, page: 0, pageSize: 8 },
      gif: { cursor: 0, page: 0, pageSize: 6 }
    };

    function renderTab(tabName, reset = false) {
      activeTab = tabName;
      tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tabName);
        t.setAttribute('aria-selected', t.dataset.tab === tabName ? 'true' : 'false');
      });
      // clear grid if reset
      if (reset) {
        galleryGrid.innerHTML = '';
        Object.keys(loadState).forEach(k => loadState[k].cursor = 0);
      }
      loadMoreForTab(tabName);
    }

    tabs.forEach(btn => {
      btn.addEventListener('click', () => renderTab(btn.dataset.tab, true));
    });

    renderTab('prints', true);

    // infinite loading on scroll within page
    window.addEventListener('scroll', throttle(() => {
      if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200)) {
        loadMoreForTab(activeTab);
      }
    }, 200));

    function loadMoreForTab(tab) {
      loading.style.display = 'block';
      const s = loadState[tab];
      const pageSize = s.pageSize;
      let sourceArr = ev[tab];
      const start = s.cursor;
      const slice = sourceArr.slice(start, start + pageSize);
      slice.forEach(item => {
        if (tab === 'gif') {
          const el = createGifTile(item);
          galleryGrid.appendChild(el);
        } else {
          const el = createPhotoTile(item, tab, sourceArr);
          galleryGrid.appendChild(el);
        }
      });
      s.cursor += slice.length;
      if (s.cursor >= sourceArr.length) {
        loading.textContent = 'All loaded';
      } else {
        loading.textContent = 'Scroll to load more';
      }
    }

    /* create tiles */
    function createPhotoTile(item, tabName, sourceArr) {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.innerHTML = `
        <img class="gallery-thumb" loading="lazy" src="${item.thumb}" alt="${escapeHtml(item.alt || '')}">
        <div class="gallery-caption small muted">${escapeHtml(tabName.toUpperCase())} • ${escapeHtml(item.id)}</div>
      `;
      div.addEventListener('click', () => openLightboxPhoto(item, sourceArr));
      return div;
    }

    function createGifTile(item) {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.innerHTML = `
        <video class="gallery-thumb" loading="lazy" poster="${item.thumb}" muted preload="none" playsinline>
          <source src="${item.src}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
      // icons overlay
      const icons = document.createElement('div');
      icons.className = 'tile-icons';
      icons.innerHTML = `
        <button class="icon-btn download-icon" title="Download">⬇</button>
        <button class="icon-btn share-icon" title="Share">🔗</button>
      `;
      div.appendChild(icons);

      // click handlers
      const video = div.querySelector('video');
      video.addEventListener('click', (e) => {
        e.stopPropagation();
        // toggle play/pause
        if (video.paused) video.play(); else video.pause();
      });
      icons.querySelector('.share-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(location.href);
        flashMessage('Link copied to clipboard');
      });
      icons.querySelector('.download-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        openDownloadModal([item]);
      });

      return div;
    }

    /* ---------- Lightbox & Download modal ---------- */
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImage');
    const lbVideo = document.getElementById('lbVideo');
    const lbCaption = document.getElementById('lbCaption');
    const lbClose = document.getElementById('lbClose');
    const lbPrev = document.getElementById('lbPrev');
    const lbNext = document.getElementById('lbNext');
    const lbShare = document.getElementById('lbShare');
    const lbDownload = document.getElementById('lbDownload');

    let lbState = { array: [], idx: 0 };

    function openLightboxPhoto(item, arr) {
      lbState.array = arr;
      lbState.idx = arr.findIndex(x => x.id === item.id);
      showLB();
    }

    function showLB() {
      const cur = lbState.array[lbState.idx];
      if (!cur) return;
      // distinguish video vs image by src extension
      const isVideo = cur.src && cur.src.endsWith('.mp4'); // our sample video uses .mp4
      if (isVideo) {
        lbImg.style.display = 'none';
        lbVideo.style.display = '';
        lbVideo.src = cur.src;
        lbVideo.load();
      } else {
        lbVideo.style.display = 'none';
        lbVideo.pause && lbVideo.pause();
        lbImg.style.display = '';
        lbImg.src = cur.src;
      }
      lbCaption.textContent = cur.alt || cur.id || '';
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLB() {
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      // clear media
      lbImg.src = '';
      lbVideo.pause && lbVideo.pause();
      lbVideo.src = '';
    }

    lbClose.addEventListener('click', closeLB);
    lbPrev.addEventListener('click', () => {
      lbState.idx = (lbState.idx - 1 + lbState.array.length) % lbState.array.length;
      showLB();
    });
    lbNext.addEventListener('click', () => {
      lbState.idx = (lbState.idx + 1) % lbState.array.length;
      showLB();
    });

    lbShare.addEventListener('click', () => {
      copyToClipboard(location.href);
      flashMessage('Link copied to clipboard');
    });

    lbDownload.addEventListener('click', () => {
      // open download request modal for current image(s)
      const cur = lbState.array[lbState.idx];
      openDownloadModal([cur]);
    });

    // keyboard navigation for lightbox
    window.addEventListener('keydown', (e) => {
      if (lb.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') closeLB();
        if (e.key === 'ArrowLeft') lbPrev.click();
        if (e.key === 'ArrowRight') lbNext.click();
      }
    });

    /* Download Request Modal */
    const downloadModal = document.getElementById('downloadModal');
    const dmClose = document.getElementById('dmClose');
    const dmSubmit = document.getElementById('dmSubmit');
    const dmEmail = document.getElementById('dmEmail');
    const dmMsg = document.getElementById('dmMsg');

    let pendingDownloadItems = [];

    function openDownloadModal(items) {
      pendingDownloadItems = items;
      dmEmail.value = '';
      dmMsg.textContent = '';
      downloadModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeDownloadModal() {
      downloadModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    dmClose.addEventListener('click', closeDownloadModal);

    dmSubmit.addEventListener('click', () => {
      const em = dmEmail.value.trim();
      if (!em || !validateEmail(em)) {
        dmMsg.textContent = 'Please enter a valid email';
        dmMsg.className = 'small muted';
        return;
      }
      // Simulate request (since static site). Replace with fetch to your backend if available.
      dmMsg.textContent = 'Request submitted. You will be notified by email.';
      dmMsg.className = 'small';
      console.log('Download request:', { email: em, items: pendingDownloadItems });
      setTimeout(() => {
        closeDownloadModal();
        flashMessage('Download request received');
      }, 1200);
    });

    /* Utilities */

    function openLightboxPhotoByIndex(arr, idx) {
      lbState.array = arr;
      lbState.idx = idx;
      showLB();
    }

    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    }
    function fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      ta.remove();
    }

    function flashMessage(msg) {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.bottom = '18px';
      el.style.left = '50%';
      el.style.transform = 'translateX(-50%)';
      el.style.background = 'rgba(0,0,0,0.8)';
      el.style.color = '#fff';
      el.style.padding = '10px 14px';
      el.style.borderRadius = '10px';
      el.style.zIndex = 999;
      el.textContent = msg;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
    }

    function validateEmail(email) {
      return /\S+@\S+\.\S+/.test(email);
    }

    /* helper: escape html to avoid injection when using innerHTML for untrusted text */
    function escapeHtml(s) {
      return String(s).replace(/[&<>"'`=\/]/g, function (c) {
        return {
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
          "'": '&#39;', '`': '&#x60;', '=': '&#x3D;', '/': '&#x2F;'
        }[c];
      });
    }
  }

  /* --------------- Shared helpers --------------- */
  function throttle(fn, wait) {
    let last = 0, t = null;
    return function (...args) {
      const now = Date.now();
      if (now - last > wait) {
        last = now; fn.apply(this, args);
      } else {
        clearTimeout(t);
        t = setTimeout(() => { last = Date.now(); fn.apply(this, args); }, wait - (now - last));
      }
    };
  }

})();
