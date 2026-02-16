
(function () {
  const SAMPLE_EVENTS = [
    {
      id: 'e1',
      title: 'Jake and Donna Wedding 2026',
      date: 'January 4, 2026',
      banner: 'images/20260104JakeAndDonaWedding2026/cover.jpg',
      thumb: 'images/20260104JakeAndDonaWedding2026/cover.jpg',
      folder: '20260104JakeAndDonaWedding2026',
      prints: createImageArray('w1', 8),
      solo: createImageArray('s1', 6),
      gif: createVideoArray('g1', 4)
    },
  ];

  // ---- helpers for fallback data (keeps old behavior) ----
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
    const sampleVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    const arr = [];
    for (let i = 1; i <= count; i++) {
      arr.push({
        id: `${seed}-v${i}`,
        src: sampleVideo,
        thumb: `https://picsum.photos/seed/${seed}v${i}/600/400`,
        alt: `${seed} video ${i}`
      });
    }
    return arr;
  }

  // Expose app entry points
  window.app = { initIndex, initEvent };

  /* ------------------ INDEX PAGE ------------------ */
  function initIndex() {
    const grid = document.getElementById('eventsGrid');
    const loading = document.getElementById('eventsLoading');
    let batch = 0;
    const PAGE_SIZE = 3;

    function loadNext() {
      const start = batch * PAGE_SIZE;
      const slice = SAMPLE_EVENTS.slice(start, start + PAGE_SIZE);
      slice.forEach(ev => grid.appendChild(createEventTile(ev)));
      batch++;
      loading.textContent =
        batch * PAGE_SIZE >= SAMPLE_EVENTS.length
          ? 'All events loaded'
          : 'Scroll down to load more';
    }

    loadNext();
    window.addEventListener(
      'scroll',
      throttle(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 120) {
          if (batch * PAGE_SIZE < SAMPLE_EVENTS.length) loadNext();
        }
      }, 250)
    );
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
      </div>`;
    return a;
  }

  /* ------------------ EVENT PAGE ------------------ */
  function initEvent() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || SAMPLE_EVENTS[0].id;
    const ev = SAMPLE_EVENTS.find(e => e.id === id) || SAMPLE_EVENTS[0];

    // const heroImg = document.getElementById('eventHeroImg');
    // const titleEl = document.getElementById('eventTitle');
    // const dateEl = document.getElementById('eventDate');
    // heroImg && (heroImg.src = ev.banner || '');
    // heroImg && (heroImg.alt = ev.title || '');
    // titleEl.textContent = ev.title;
    // dateEl.textContent = ev.date;

    const tabs = document.querySelectorAll('.tab-btn');
    const galleryGrid = document.getElementById('galleryGrid');
    const loading = document.getElementById('galleryLoading');
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.textContent = 'Load More';
    loadMoreBtn.className = 'load-more';

    let activeTab = 'prints';
    let allItems = [];   // array of { src, type: 'image'|'video', id?, thumb?, alt? }
    let currentIndex = 0;
    const batchSize = 20;

    // Initialize tabs
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.dataset.tab;
        loadItemsForTab(activeTab, true);
      });
    });

    // IntersectionObserver for lazy loading images/poster
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.dataset.src) {
            if (el.tagName.toLowerCase() === 'img') {
              el.src = el.dataset.src;
              el.onload = () => el.classList.add('loaded');
            } else if (el.tagName.toLowerCase() === 'video') {
              // For video thumbnails we set poster via dataset
              if (el.dataset.poster) el.poster = el.dataset.poster;
            }
            obs.unobserve(el);
          }
        }
      });
    }, { root: null, rootMargin: '120px', threshold: 0.05 });

    // Load items for a tab (attempt folder listing via fetch; fallback to SAMPLE_EVENTS arrays)
    async function loadItemsForTab(tabName, reset = false) {
      if (reset) {
        galleryGrid.innerHTML = '';
        currentIndex = 0;
        allItems = [];
      }
      loading.style.display = 'block';

      const manifestUrl = `images/${ev.folder}/${tabName}/manifest.json`;
      try {
        const res = await fetch(manifestUrl);
        if (!res.ok) throw new Error('Manifest fetch failed');
        const files = await res.json(); // flat array of filenames

        allItems = files.map(file => {
          const lower = file.toLowerCase();
          const path = `images/${ev.folder}/${tabName}/${file}`;
          if (lower.endsWith('.mp4')) {
            return { src: path, type: 'video', thumb: path };
          } else {
            return { src: path, type: 'image', thumb: path };
          }
        });

        if (!allItems.length) {
          loading.textContent = 'No items found in manifest.';
          return;
        }

        renderBatch();
      } catch (err) {
        // fallback to original folder fetch + embedded arrays
        console.warn('Manifest fetch failed, falling back to old method:', err);
        // ...keep your existing fallback code here unchanged...
      } finally {
        setTimeout(() => { loading.style.display = 'none'; }, 300);
      }
    }

    // Render next batch of items (images/videos)
function renderBatch() {
  const nextBatch = allItems.slice(currentIndex, currentIndex + batchSize);
  nextBatch.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-item';

    if (item.type === 'video') {
      // ==== VIDEO ITEM WITH AUTO THUMBNAIL ====
      div.classList.add('video-item');

      // placeholder thumbnail
      const thumbImg = document.createElement('img');
      thumbImg.className = 'video-thumb';
      thumbImg.alt = item.alt || 'Video thumbnail';
      thumbImg.src = 'images/video-placeholder.jpg'; // fallback before frame loads
      div.appendChild(thumbImg);

      // play icon overlay
      const playIcon = document.createElement('div');
      playIcon.className = 'play-overlay';
      playIcon.textContent = '▶';
      div.appendChild(playIcon);

      // overlay icons (download + share)
      const icons = document.createElement('div');
      icons.className = 'tile-icons';
      icons.innerHTML = `
        <button class="icon-btn download-icon" title="Download">⬇</button>
        <button class="icon-btn share-icon" title="Share">🔗</button>
      `;
      div.appendChild(icons);

      // generate thumbnail from first frame
      const tempVideo = document.createElement('video');
      tempVideo.src = item.src;
      tempVideo.muted = true;
      tempVideo.playsInline = true;
      tempVideo.preload = 'auto';
      tempVideo.crossOrigin = 'anonymous';

      tempVideo.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = tempVideo.videoWidth;
        canvas.height = tempVideo.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
        thumbImg.src = canvas.toDataURL('image/png');
      });

      // click on video tile → open lightbox
      div.addEventListener('click', () => {
        openLightboxByItem(item);
      });

      // separate click: download or share
      icons.querySelector('.share-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(location.href);
        flashMessage('Link copied to clipboard');
      });

      icons.querySelector('.download-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        openDownloadModal([item]);
      });

      galleryGrid.appendChild(div);
      observer.observe(thumbImg);
    }
    else {
      // ==== IMAGE ITEM ====
      const img = document.createElement('img');
      img.className = 'gallery-thumb lazy-img';
      img.alt = (item.alt || item.id || 'photo');
      img.dataset.src = item.src || item.thumb; // lazy-load real src
      div.appendChild(img);

      const caption = document.createElement('div');
      caption.className = 'gallery-caption small muted';
      caption.textContent = (item.id || '').toString();
      div.appendChild(caption);

      div.addEventListener('click', () => {
        const arr = allItems.map(x => ({ src: x.src, type: x.type, alt: x.alt || x.id }));
        openLightboxPhoto({ src: item.src, type: 'image', alt: item.alt || item.id }, arr);
      });

      galleryGrid.appendChild(div);
      observer.observe(img);
    }
  });

  currentIndex += batchSize;

  if (currentIndex < allItems.length) {
    if (!galleryGrid.contains(loadMoreBtn)) galleryGrid.after(loadMoreBtn);
  } else {
    if (galleryGrid.contains(loadMoreBtn)) loadMoreBtn.remove();
  }
}


    loadMoreBtn.addEventListener('click', renderBatch);

    // initial tab load
    // set initial active class on the right tab (if any)
    const initialTab = Array.from(tabs).find(t => t.dataset.tab === 'prints');
    if (initialTab) {
      tabs.forEach(t => t.classList.remove('active'));
      initialTab.classList.add('active');
    }
    loadItemsForTab('prints', true);

    /* ---------- Lightbox & Download modal (full original features integrated) ---------- */

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
      // arr: array of { src, type?, alt? }
      lbState.array = arr.map(x => ({ src: x.src, type: x.type || 'image', alt: x.alt || '' }));
      lbState.idx = lbState.array.findIndex(x => x.src === item.src);
      if (lbState.idx < 0) lbState.idx = 0;
      showLB();
    }

    function openLightboxByItem(item) {
      // called when item came from renderBatch and we only have allItems and item
      const arr = allItems.map(x => ({ src: x.src, type: x.type, alt: x.alt || x.id }));
      openLightboxPhoto({ src: item.src, type: item.type }, arr);
    }

    function showLB() {
      const cur = lbState.array[lbState.idx];
      if (!cur) return;

      if (cur.type === 'video' || cur.src.toLowerCase().endsWith('.mp4')) {
        // show video in lbVideo
        lbImg.style.display = 'none';
        lbVideo.style.display = '';
        lbVideo.src = cur.src;
        lbVideo.load();
        lbVideo.play().catch(() => {});
      } else {
        lbVideo.style.display = 'none';
        try { lbVideo.pause(); } catch(e) {}
        lbImg.style.display = '';
        lbImg.src = cur.src;
      }
      lbCaption.textContent = cur.alt || '';
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLB() {
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbImg.src = '';
      try { lbVideo.pause(); } catch(e) {}
      lbVideo.src = '';
    }

    lbClose.addEventListener('click', closeLB);
    lbPrev.addEventListener('click', () => {
      if (!lbState.array.length) return;
      lbState.idx = (lbState.idx - 1 + lbState.array.length) % lbState.array.length;
      showLB();
    });
    lbNext.addEventListener('click', () => {
      if (!lbState.array.length) return;
      lbState.idx = (lbState.idx + 1) % lbState.array.length;
      showLB();
    });

    lbShare.addEventListener('click', () => {
      copyToClipboard(location.href);
      flashMessage('Link copied to clipboard');
    });

    lbDownload.addEventListener('click', () => {
      const cur = lbState.array[lbState.idx];
      openDownloadModal([cur]);
    });

    window.addEventListener('keydown', (e) => {
      if (!lb) return;
      if (lb.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') closeLB();
        if (e.key === 'ArrowLeft') lbPrev.click();
        if (e.key === 'ArrowRight') lbNext.click();
      }
    });

    const UNIQUE_CODE = "jake&donnawedding2026";

    /* Download Request Modal (reuse your original modal UI) */
    const downloadModal = document.getElementById('downloadModal');
    const dmClose = document.getElementById('dmClose');
    const dmSubmit = document.getElementById('dmSubmit');
    const dmCode = document.getElementById('dmCode');
    const dmMsg = document.getElementById('dmMsg');

    let pendingDownloadItems = [];

    function openDownloadModal(items) {
      pendingDownloadItems = items;
      dmMsg && (dmMsg.textContent = '');
      if (downloadModal) downloadModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeDownloadModal() {
      // Remove focus from any element inside the modal
      if (document.activeElement) {
        document.activeElement.blur();
      }

      if (downloadModal) {
        downloadModal.setAttribute('aria-hidden', 'true');
      }

      document.body.style.overflow = '';
    }
    dmClose && dmClose.addEventListener('click', closeDownloadModal);

    dmSubmit && dmSubmit.addEventListener('click', () => {
      const code = dmCode && dmCode.value.trim();

      if (!code) {
        if (dmMsg) {
          dmMsg.textContent = "Please enter Unique Code";
          dmMsg.className = "small muted";
        }
        return;
      }

      if (code !== UNIQUE_CODE) {
        if (dmMsg) {
          dmMsg.textContent = "Invalid Unique code";
          dmMsg.className = "small muted";
        }
        return;
      }

      if (dmMsg) {
        dmMsg.textContent = "Unique code accepted! Downloading...";
        dmMsg.className = "small";
      }

      setTimeout(() => {
        pendingDownloadItems.forEach(item => downloadItems(item));
        closeDownloadModal();
        flashMessage("Your download has started");
      }, 800);
    });


    /* Utilities (copy, flash, fallback copy) */
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

    function escapeHtml(s) {
      return String(s).replace(/[&<>"'`=\/]/g, function (c) {
        return {
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
          "'": '&#39;', '`': '&#x60;', '=': '&#x3D;', '/': '&#x2F;'
        }[c];
      });
    }

  } // end initEvent

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

})(); // IIFE end

function downloadItems(item) {
  // If item is an object (ex: {src: "..."}), extract src
  const actualUrl = (item && typeof item === "object" && item.src) ? item.src : item;

  if (!actualUrl || typeof actualUrl !== "string") {
    console.error("Invalid URL for download:", item);
    return;
  }

  const a = document.createElement("a");
  a.href = actualUrl;
  a.download = actualUrl.split("/").pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
