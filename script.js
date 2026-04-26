/* ============================================================
   NoorVerse – script.js  (v2 — All Updates Applied)
   Updates: Reader Toolbar, history.pushState nav, Audio fixes,
            Azan system, Toast error handling
   ============================================================ */

'use strict';

/* ── DOM helpers ── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ── State ── */
const State = {
  currentView: 'dashboard',
  surahList: [],
  currentSurah: null,
  qiblaActive: false,
  audioQueue: [],
  audioIndex: 0,
  audioPlaying: false,
  deferredInstallPrompt: null,
  prayerTimings: null,      // UPDATE 4
  azanToggles: {},          // { 'Fajr': true, ... }
  azanFiredToday: {},       // dedup key: 'Fajr_Mon Jan 01 2024'
  azanCheckInterval: null,
};

/* ── UPDATE 3: Validated reciter list ── */
const RECITERS = [
  { value: 'ar.alafasy',            label: 'Mishary Alafasy' },
  { value: 'ar.abdurrahmaansudais', label: 'Abdul Rahman Al-Sudais' },
  { value: 'ar.husary',             label: 'Mahmoud Khalil Al-Husary' },
  { value: 'ar.minshawi',           label: 'Mohamed Siddiq Al-Minshawi' },
  { value: 'ar.muhammadayyoub',     label: 'Muhammad Ayyoub' },
];

/* ── API Endpoints ── */
const API = {
  surahList:    'https://api.alquran.cloud/v1/surah',
  search:       (q) => `https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/quran-uthmani`,
  surahEdition: (num, ed) => `https://api.alquran.cloud/v1/surah/${num}/${ed}`,
  prayerCoord:  (lat, lng) => `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`,
};

/* ============================================================
   UPDATE 5 – TOAST SYSTEM (no native alert/prompt anywhere)
   ============================================================ */
function showToast(message, type = 'info', duration = 3500) {
  const container = $('#toast-container');
  if (!container) return;
  const icons = { error: '⚠️', success: '✅', info: 'ℹ️', warn: '🔔' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${message}</span>`;
  container.appendChild(toast);
  const remove = () => {
    toast.classList.add('toast-hide');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };
  const timer = setTimeout(remove, duration);
  toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

/* ============================================================
   UPDATE 2 – HISTORY-BASED NAVIGATION
   ============================================================ */
function navigateTo(viewId, opts = {}) {
  const current = $(`#view-${State.currentView}`);
  const next    = $(`#view-${viewId}`);
  if (!next) return;

  closeMenu();
  if (current) current.classList.remove('active');
  next.classList.add('active');
  State.currentView = viewId;
  window.scrollTo(0, 0);

  history.pushState({ view: viewId, opts }, '', `#${viewId}`);

  if (viewId === 'surah-list' && State.surahList.length === 0) fetchSurahList();
  if (viewId === 'qibla')  initQibla();
  if (viewId === 'prayer') initPrayerTimes();
  if (viewId === 'reader' && opts.surahNumber) loadSurahReader(opts.surahNumber);
}

/* Physical back button intercept */
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.view) {
    // If a modal is open close it
    const openModalEl = $('.modal-overlay.open');
    if (openModalEl) { closeModal(openModalEl.id); return; }

    const target = e.state.view;
    const el = $(`#view-${target}`);
    if (el) {
      $(`#view-${State.currentView}`)?.classList.remove('active');
      el.classList.add('active');
      State.currentView = target;
      window.scrollTo(0, 0);
      return;
    }
  }
  // Already at root – push stable state to block PWA exit
  history.pushState({ view: 'dashboard' }, '', '#dashboard');
});

/* Delegated click: data-back and data-view */
document.addEventListener('click', (e) => {
  const backBtn  = e.target.closest('[data-back]');
  if (backBtn) { navigateTo(backBtn.dataset.back); return; }
  const viewCard = e.target.closest('[data-view]');
  if (viewCard) { navigateTo(viewCard.dataset.view); return; }
});

/* ============================================================
   HEADER MENU
   ============================================================ */
const menuToggleBtn = $('#menu-toggle-btn');
const sideMenu      = $('#side-menu');
const menuOverlay   = $('#menu-overlay');
const closeMenuBtn  = $('#close-menu-btn');

function openMenu() {
  sideMenu?.classList.add('open');
  menuOverlay?.classList.add('active');
  sideMenu?.setAttribute('aria-hidden', 'false');
}
function closeMenu() {
  sideMenu?.classList.remove('open');
  menuOverlay?.classList.remove('active');
  sideMenu?.setAttribute('aria-hidden', 'true');
}

menuToggleBtn?.addEventListener('click', openMenu);
closeMenuBtn?.addEventListener('click', closeMenu);
menuOverlay?.addEventListener('click', closeMenu);

$$('.menu-item').forEach(btn => {
  btn.addEventListener('click', () => {
    closeMenu();
    const action = btn.dataset.action;
    if (action === 'home')     navigateTo('dashboard');
    if (action === 'install')  triggerInstall();
    if (action === 'language') openModal('modal-language');
    if (action === 'about')    openModal('modal-about');
    if (action === 'contact')  openModal('modal-contact');
  });
});

/* ============================================================
   MODALS
   ============================================================ */
function openModal(id) {
  const modal = $(`#${id}`);
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  history.pushState({ view: State.currentView, modal: id }, '', `#modal`);
}
function closeModal(id) {
  const modal = $(`#${id}`);
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

$$('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
$$('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

/* ============================================================
   INSTALL BANNER & PWA
   ============================================================ */
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  State.deferredInstallPrompt = e;
  const btn = $('#install-btn-header');
  if (btn) btn.style.display = 'flex';
});

function triggerInstall() {
  if (State.deferredInstallPrompt) {
    State.deferredInstallPrompt.prompt();
    State.deferredInstallPrompt.userChoice.then(() => { State.deferredInstallPrompt = null; });
  } else {
    window.open('https://drive.google.com/uc?id=1io4qGGLfmK3XIA_KFbffTpPbcS2SziG0', '_blank');
  }
}
$('#install-btn-header')?.addEventListener('click', triggerInstall);

function initInstallBanner() {
  if (localStorage.getItem('nv_banner_dismissed')) return;
  const banner = $('#install-banner');
  if (!banner) return;
  setTimeout(() => { banner.style.display = 'block'; }, 2000);
}
$('#install-dismiss-btn')?.addEventListener('click', () => {
  $('#install-banner').style.display = 'none';
  localStorage.setItem('nv_banner_dismissed', '1');
});

/* ============================================================
   SURAH LIST
   ============================================================ */
async function fetchSurahList() {
  const container = $('#surah-list-container');
  container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading Surahs…</p></div>';
  try {
    const res  = await fetch(API.surahList);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.code !== 200) throw new Error('API error');
    State.surahList = json.data;
    renderSurahList(State.surahList);
  } catch {
    container.innerHTML = `<div class="error-state">⚠️ Failed to load Surahs.<br><button onclick="fetchSurahList()" style="margin-top:10px;padding:8px 16px;background:rgba(212,175,55,0.2);border:1px solid #D4AF37;border-radius:8px;color:#D4AF37;cursor:pointer;">Retry</button></div>`;
    showToast('Failed to load Surah list. Check your internet.', 'error');
  }
}

function renderSurahList(list) {
  const container = $('#surah-list-container');
  if (!list.length) {
    container.innerHTML = '<div class="empty-state">No Surahs found.</div>';
    return;
  }
  container.innerHTML = list.map(s => `
    <button class="surah-card" data-surah="${s.number}" aria-label="Open Surah ${s.englishName}">
      <div class="surah-num">${s.number}</div>
      <div class="surah-info">
        <div class="surah-english">${s.englishName}</div>
        <div class="surah-meta">${s.englishNameTranslation} · ${s.numberOfAyahs} Ayahs · ${s.revelationType}</div>
      </div>
      <div class="surah-arabic">${s.name}</div>
    </button>`).join('');

  $$('.surah-card', container).forEach(card => {
    card.addEventListener('click', () =>
      navigateTo('reader', { surahNumber: parseInt(card.dataset.surah) })
    );
  });
}

/* ── Search ── */
let searchDebounceTimer = null;
$('#surah-search-input')?.addEventListener('input', (e) => {
  const q = e.target.value.trim();
  clearTimeout(searchDebounceTimer);
  if (!q) { renderSurahList(State.surahList); return; }
  const isArabic = /[\u0600-\u06FF]/.test(q);
  if (isArabic) {
    const spinner = $('#search-spinner');
    if (spinner) spinner.style.display = 'block';
    searchDebounceTimer = setTimeout(() => searchArabic(q, spinner), 500);
  } else {
    const lower = q.toLowerCase();
    renderSurahList(State.surahList.filter(s =>
      s.number.toString().includes(q) ||
      s.englishName.toLowerCase().includes(lower) ||
      s.englishNameTranslation.toLowerCase().includes(lower)
    ));
  }
});

async function searchArabic(q, spinner) {
  try {
    const res  = await fetch(API.search(q));
    if (!res.ok) throw new Error('Search failed');
    const json = await res.json();
    if (json.code !== 200 || !json.data?.matches) throw new Error('No results');
    const nums = [...new Set(json.data.matches.map(m => m.surah.number))];
    renderSurahList(State.surahList.filter(s => nums.includes(s.number)));
  } catch {
    $('#surah-list-container').innerHTML = '<div class="empty-state">No matches found for that Arabic text.</div>';
  } finally {
    if (spinner) spinner.style.display = 'none';
  }
}

/* ============================================================
   QURAN READER
   ============================================================ */
async function loadSurahReader(surahNumber) {
  const surahMeta = State.surahList.find(s => s.number === surahNumber);
  const title   = $('#reader-title');
  const content = $('#reader-content');
  const trBlock = $('#translation-block');

  if (title && surahMeta) title.textContent = surahMeta.englishName;
  content.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading Surah…</p></div>';
  trBlock.style.display = 'none';
  trBlock.innerHTML = '';
  stopAudio();

  try {
    const cacheKey = `nv_surah_${surahNumber}`;
    let surahData = null;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      surahData = JSON.parse(cached);
    } else {
      const res  = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.code !== 200) throw new Error('API error');
      surahData = json.data;
      try { sessionStorage.setItem(cacheKey, JSON.stringify(surahData)); } catch {}
    }
    State.currentSurah = surahData;
    renderReader(surahData);

    const max = surahData.ayahs.length;
    ['rec-end','tr-end'].forEach(id => { const el=$(`#${id}`); if(el){el.max=max;el.value=max;} });
    ['rec-start','tr-start'].forEach(id => { const el=$(`#${id}`); if(el){el.max=max;el.value=1;} });

  } catch {
    content.innerHTML = `<div class="error-state">⚠️ Failed to load this Surah. Please check your connection.</div>`;
    showToast('Could not load Surah. Check your internet.', 'error');
  }
}

function renderReader(surah) {
  const content  = $('#reader-content');
  const isFatiha = surah.number === 1;
  const isTawbah = surah.number === 9;
  let html = `
    <div class="surah-title-card">
      <div class="surah-title-arabic">${surah.name}</div>
      <div class="surah-title-english">${surah.englishName} — ${surah.englishNameTranslation}</div>
      <div class="surah-title-details">${surah.numberOfAyahs} Ayahs · ${surah.revelationType} · Surah #${surah.number}</div>
    </div>`;
  if (!isFatiha && !isTawbah) {
    html += `<div class="bismillah-text">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>`;
  }
  // UPDATE 2: build continuous mushaf text then wrap in physical-page div
  let mushafText = '';
  surah.ayahs.forEach(a => {
    mushafText += ` ${a.text} <span class="ayah-number" data-ayah="${a.numberInSurah}">${a.numberInSurah}</span> `;
  });
  html += `<div class="mushaf-page"><div class="mushaf-text" dir="rtl">${mushafText}</div></div>`;
  content.innerHTML = html;
}

/* ── Toolbar buttons (UPDATE 1 — ids unchanged) ── */
$('#fab-play')?.addEventListener('click', () => {
  if (!State.currentSurah) { showToast('Please open a Surah first.', 'warn'); return; }
  openModal('modal-recitation');
});
$('#fab-translation')?.addEventListener('click', () => {
  if (!State.currentSurah) { showToast('Please open a Surah first.', 'warn'); return; }
  openModal('modal-translation');
});

/* Full-surah range helpers */
$('#rec-full-btn')?.addEventListener('click', () => {
  const s = State.currentSurah; if (!s) return;
  $('#rec-start').value = 1; $('#rec-end').value = s.ayahs.length;
});
$('#tr-full-btn')?.addEventListener('click', () => {
  const s = State.currentSurah; if (!s) return;
  $('#tr-start').value = 1; $('#tr-end').value = s.ayahs.length;
});

/* ── UPDATE 3: Populate verified reciters ── */
function populateReciters() {
  const sel = $('#reciter-select');
  if (!sel) return;
  sel.innerHTML = RECITERS.map(r => `<option value="${r.value}">${r.label}</option>`).join('');
}

/* ============================================================
   UPDATE 3 – RECITATION AUDIO (robust, validated, no overlap)
   ============================================================ */
const audioEl = $('#quran-audio');

$('#rec-start-btn')?.addEventListener('click', startRecitation);
$('#rec-stop-btn')?.addEventListener('click', () => {
  stopAudio();
  const statusEl = $('#rec-status');
  if (statusEl) statusEl.textContent = '';
});

async function startRecitation() {
  const surah = State.currentSurah;
  if (!surah) { showToast('Please open a Surah first.', 'warn'); return; }

  const edition = $('#reciter-select')?.value;
  if (!edition) return;

  // Clamp + auto-swap range
  let s = Math.max(1, Math.min(parseInt($('#rec-start')?.value) || 1, surah.ayahs.length));
  let e = Math.max(1, Math.min(parseInt($('#rec-end')?.value)   || surah.ayahs.length, surah.ayahs.length));
  const start = Math.min(s, e);
  const end   = Math.max(s, e);
  if ($('#rec-start')) $('#rec-start').value = start;
  if ($('#rec-end'))   $('#rec-end').value   = end;

  const statusEl = $('#rec-status');
  if (statusEl) statusEl.innerHTML = '<div class="rec-loading"><div class="spinner"></div> Fetching audio…</div>';

  stopAudio(); // always clear previous

  try {
    const cacheKey = `nv_audio_${surah.number}_${edition}`;
    let ayahsData;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      ayahsData = JSON.parse(cached);
    } else {
      const res  = await fetch(API.surahEdition(surah.number, edition));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.code !== 200) throw new Error('API error');
      ayahsData = json.data.ayahs;
      try { sessionStorage.setItem(cacheKey, JSON.stringify(ayahsData)); } catch {}
    }

    const slice       = ayahsData.slice(start - 1, end);
    const validAudios = slice.map(a => a.audio || (a.audioSecondary && a.audioSecondary[0])).filter(Boolean);

    if (!validAudios.length) {
      if (statusEl) statusEl.textContent = '';
      showToast('Audio not available for this reciter.', 'warn');
      return;
    }

    State.audioQueue   = validAudios;
    State.audioIndex   = 0;
    State.audioPlaying = true;
    if (statusEl) statusEl.textContent = `▶ Playing Ayah ${start}–${end}`;
    playNextAudio(statusEl, start);

  } catch (err) {
    if (statusEl) statusEl.textContent = '';
    showToast('Audio not available for this reciter.', 'warn');
    console.warn('[Audio]', err);
  }
}

function playNextAudio(statusEl, startAyah) {
  if (!State.audioPlaying) return;

  if (State.audioIndex >= State.audioQueue.length) {
    // Only mark complete when all audio actually ended
    State.audioPlaying = false;
    if (statusEl) statusEl.textContent = '✓ Recitation complete.';
    return;
  }

  const url     = State.audioQueue[State.audioIndex];
  const ayahNum = startAyah + State.audioIndex;
  if (statusEl) statusEl.textContent = `▶ Ayah ${ayahNum}`;

  // Full reset to prevent overlap
  audioEl.pause();
  audioEl.removeAttribute('src');
  try { audioEl.load(); } catch {}
  audioEl.src = url;

  // Only advance on genuine end event (UPDATE 3 fix)
  audioEl.onended = () => {
    if (!State.audioPlaying) return;
    State.audioIndex++;
    playNextAudio(statusEl, startAyah);
  };

  audioEl.onerror = () => {
    if (!State.audioPlaying) return;
    console.warn('[Audio] failed to load ayah', ayahNum);
    State.audioIndex++;
    playNextAudio(statusEl, startAyah);
  };

  audioEl.play().catch(err => console.warn('[Audio] play() rejected:', err));
}

function stopAudio() {
  State.audioPlaying = false;
  State.audioQueue   = [];
  State.audioIndex   = 0;
  if (audioEl) {
    audioEl.pause();
    audioEl.onended = null;
    audioEl.onerror = null;
    audioEl.removeAttribute('src');
    try { audioEl.load(); } catch {}
  }
}

/* ============================================================
   TRANSLATION
   ============================================================ */
$('#tr-show-btn')?.addEventListener('click', showTranslation);

async function showTranslation() {
  const surah = State.currentSurah;
  if (!surah) { showToast('Please open a Surah first.', 'warn'); return; }

  const lang = $('#lang-select')?.value;
  let s = Math.max(1, Math.min(parseInt($('#tr-start')?.value) || 1, surah.ayahs.length));
  let e = Math.max(1, Math.min(parseInt($('#tr-end')?.value)   || surah.ayahs.length, surah.ayahs.length));
  const start = Math.min(s, e); const end = Math.max(s, e);
  if ($('#tr-start')) $('#tr-start').value = start;
  if ($('#tr-end'))   $('#tr-end').value   = end;

  const trBlock = $('#translation-block');
  trBlock.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading translation…</p></div>';
  trBlock.style.display = 'block';
  closeModal('modal-translation');

  try {
    const cacheKey = `nv_tr_${surah.number}_${lang}`;
    let ayahsData;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      ayahsData = JSON.parse(cached);
    } else {
      const res  = await fetch(API.surahEdition(surah.number, lang));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.code !== 200) throw new Error('API error');
      ayahsData = json.data.ayahs;
      try { sessionStorage.setItem(cacheKey, JSON.stringify(ayahsData)); } catch {}
    }

    const labels = { 'en.asad': 'English — Muhammad Asad', 'ur.jalandhry': 'Urdu — Jalandhry', 'bn.bengali': 'Bengali' };
    const slice  = ayahsData.slice(start - 1, end);

    // UPDATE 3: get the Arabic ayahs for the same range from State.currentSurah
    const arabicAyahs = (State.currentSurah && State.currentSurah.ayahs)
      ? State.currentSurah.ayahs.slice(start - 1, end)
      : [];

    let html = `<div class="translation-header">📖 ${labels[lang] || lang} | Ayah ${start}–${end}</div>`;

    slice.forEach((a, i) => {
      const ayahNum   = start + i;
      const dir       = (lang.startsWith('ur') || lang.startsWith('bn')) ? 'rtl' : 'ltr';
      const arabicTxt = arabicAyahs[i] ? arabicAyahs[i].text : '';

      // UPDATE 3: each card shows Arabic on top, then translated text below
      html += `
        <div class="translation-item">
          <div class="translation-ayah-num">
            <span class="ayah-number" style="width:22px;height:22px;font-size:0.6rem;">${ayahNum}</span>
            Ayah ${ayahNum}
          </div>
          <div class="translation-arabic" dir="rtl">${arabicTxt}</div>
          <div class="translation-text" dir="${dir}">${a.text}</div>
        </div>`;
    });

    trBlock.innerHTML = html;
    trBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch {
    trBlock.innerHTML = '<div class="error-state">⚠️ Failed to load translation.</div>';
    showToast('Translation fetch failed. Please try again.', 'error');
  }
}

/* ============================================================
   QIBLA COMPASS
   ============================================================ */
function initQibla() {
  if (State.qiblaActive) return;
  State.qiblaActive = true;

  const info    = $('#qibla-info');
  const wrapper = $('#compass-wrapper');
  const needle  = $('#qibla-needle');
  const bdisplay= $('#qibla-bearing-display');
  const hint    = $('#qibla-hint');
  const toRad   = d => d * Math.PI / 180;
  const MLAT = 21.422487, MLNG = 39.826206;

  function calcBearing(lat, lng) {
    const dLng = toRad(MLNG - lng);
    const lat1 = toRad(lat), lat2 = toRad(MLAT);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  if (!navigator.geolocation) {
    info.innerHTML = '<div class="error-state">Geolocation not supported.</div>'; return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const bearing = calcBearing(pos.coords.latitude, pos.coords.longitude);
    bdisplay.textContent = `${Math.round(bearing)}°`;
    info.style.display = 'none'; wrapper.style.display = 'flex';

    let fired = false;
    function handleOrientation(e) {
      let heading = null;
      if (typeof e.webkitCompassHeading !== 'undefined') heading = e.webkitCompassHeading;
      else if (e.absolute && typeof e.alpha === 'number') heading = (360 - e.alpha) % 360;
      if (heading !== null) {
        fired = true;
        needle.style.transform = `rotate(${(bearing - heading + 360) % 360}deg)`;
        hint.textContent = 'Align the needle with the Kaaba ✦';
      }
    }

    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(p => {
        if (p === 'granted') {
          window.addEventListener('deviceorientationabsolute', handleOrientation, true);
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          needle.style.transform = `rotate(${bearing}deg)`;
          hint.textContent = `Qibla is at ${Math.round(bearing)}° from North`;
        }
      }).catch(() => { needle.style.transform = `rotate(${bearing}deg)`; });
    } else {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      setTimeout(() => {
        if (!fired) {
          needle.style.transform = `rotate(${bearing}deg)`;
          hint.textContent = `Static bearing: ${Math.round(bearing)}° from North`;
        }
      }, 1500);
    }
  }, () => {
    info.innerHTML = `<div class="error-state">⚠️ Location access denied.<br>Please allow location to use Qibla Compass.</div>`;
    showToast('Location access denied. Enable it in browser settings.', 'error');
  }, { enableHighAccuracy: true, timeout: 10000 });
}

/* ============================================================
   PRAYER TIMES + UPDATE 4 (Azan system)
   ============================================================ */
const PRAYER_META = [
  { key: 'Fajr',    nameAr: 'الفجر',  emoji: '🌙', label: 'Fajr',    azanable: true  },
  { key: 'Sunrise', nameAr: 'الشروق', emoji: '🌅', label: 'Sunrise', azanable: false },
  { key: 'Dhuhr',   nameAr: 'الظهر',  emoji: '☀️', label: 'Dhuhr',  azanable: true  },
  { key: 'Asr',     nameAr: 'العصر',  emoji: '🌤️', label: 'Asr',    azanable: true  },
  { key: 'Maghrib', nameAr: 'المغرب', emoji: '🌇', label: 'Maghrib', azanable: true  },
  { key: 'Isha',    nameAr: 'العشاء', emoji: '🌃', label: 'Isha',    azanable: true  },
];

let prayerInitDone = false;

async function initPrayerTimes() {
  const content = $('#prayer-content');
  content.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Getting location…</p></div>';

  if (!navigator.geolocation) {
    content.innerHTML = '<div class="error-state">Geolocation not supported.</div>'; return;
  }

  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    content.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Fetching prayer times…</p></div>';
    try {
      let city = 'Your Location', country = '';
      try {
        const gr = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const gj = await gr.json();
        city    = gj.address.city || gj.address.town || gj.address.village || gj.address.county || 'Your Location';
        country = gj.address.country || '';
      } catch {}

      const res  = await fetch(API.prayerCoord(latitude, longitude));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.code !== 200) throw new Error('API error');

      State.prayerTimings = json.data.timings;
      renderPrayerTimes(State.prayerTimings, city, country, json.data.date?.readable || '');

      if (!prayerInitDone) { prayerInitDone = true; startAzanChecker(); }
    } catch {
      content.innerHTML = '<div class="error-state">⚠️ Failed to fetch prayer times.</div>';
      showToast('Prayer times fetch failed. Check your internet.', 'error');
    }
  }, () => {
    content.innerHTML = `<div class="error-state">⚠️ Location access denied.<br><small>Allow location to get accurate prayer times.</small></div>`;
    showToast('Location access denied for prayer times.', 'error');
  }, { timeout: 10000 });
}

function renderPrayerTimes(timings, city, country, date) {
  const content  = $('#prayer-content');
  const now      = new Date();
  const nowMins  = now.getHours() * 60 + now.getMinutes();
  let nextPrayer = null, minDiff = Infinity;

  PRAYER_META.forEach(p => {
    const t = timings[p.key]; if (!t) return;
    const [h, m] = t.split(':').map(Number);
    const diff   = (h * 60 + m) - nowMins;
    if (diff > 0 && diff < minDiff) { minDiff = diff; nextPrayer = p.key; }
  });

  let html = `
    <div class="prayer-location-card">
      <div class="prayer-location-title">📍 ${city}${country ? ', ' + country : ''}</div>
      <div class="prayer-location-sub">${date}</div>
    </div>
    <div class="prayer-grid">`;

  PRAYER_META.forEach(p => {
    const t = timings[p.key]; if (!t) return;
    const isNext   = p.key === nextPrayer;
    const isOn     = State.azanToggles[p.key] !== false;
    const toggleId = `azan-toggle-${p.key}`;
    html += `
      <div class="prayer-card ${isNext ? 'next-prayer' : ''}" data-prayer="${p.key}">
        <div class="prayer-emoji">${p.emoji}</div>
        <div class="prayer-name">
          <div class="prayer-name-en">${p.label}</div>
          <div class="prayer-name-ar">${p.nameAr}</div>
        </div>
        <div class="prayer-time">${t}</div>
        ${p.azanable ? `
        <div class="azan-toggle-wrap">
          <span class="azan-toggle-label">Azan</span>
          <label class="azan-toggle" title="Toggle Azan for ${p.label}">
            <input type="checkbox" id="${toggleId}" data-prayer="${p.key}" ${isOn ? 'checked' : ''}>
            <span class="azan-toggle-slider"></span>
          </label>
        </div>` : ''}
      </div>`;
  });

  html += `</div>`;
  content.innerHTML = html;

  $$('[id^="azan-toggle-"]', content).forEach(input => {
    input.addEventListener('change', (ev) => {
      const key = ev.target.dataset.prayer;
      State.azanToggles[key] = ev.target.checked;
      showToast(`Azan for ${key} ${ev.target.checked ? 'enabled 🔔' : 'disabled 🔕'}`, ev.target.checked ? 'success' : 'info', 2000);
    });
  });
}

/* ── UPDATE 4: Azan checker (every 30s) ── */
function startAzanChecker() {
  if (State.azanCheckInterval) clearInterval(State.azanCheckInterval);
  const check = () => {
    if (!State.prayerTimings) return;
    const now   = new Date();
    const hh    = String(now.getHours()).padStart(2,'0');
    const mm    = String(now.getMinutes()).padStart(2,'0');
    const clock = `${hh}:${mm}`;
    const today = now.toDateString();
    PRAYER_META.forEach(p => {
      if (!p.azanable) return;
      const pTime   = (State.prayerTimings[p.key] || '').substring(0, 5);
      const fireKey = `${p.key}_${today}`;
      if (pTime === clock && State.azanToggles[p.key] !== false && !State.azanFiredToday[fireKey]) {
        State.azanFiredToday[fireKey] = true;
        triggerAzan(p.label, p.emoji);
      }
    });
  };
  check(); // immediate check
  State.azanCheckInterval = setInterval(check, 30000);
}

function triggerAzan(prayerLabel, emoji) {
  const azanPlayer = $('#azan-player');
  const modal      = $('#azan-modal');
  const titleEl    = $('#azan-modal-title');
  const subEl      = $('#azan-modal-sub');
  if (!modal) return;
  if (titleEl) titleEl.textContent = `${emoji} It is time for ${prayerLabel}`;
  if (subEl)   subEl.textContent   = 'حَيَّ عَلَى الصَّلَاةِ — Come to Prayer';
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (azanPlayer) {
    azanPlayer.currentTime = 0;
    azanPlayer.play().catch(() => showToast('Tap anywhere to allow Azan audio.', 'info'));
  }
}

$('#azan-modal-close')?.addEventListener('click', closeAzanModal);
$('#azan-modal')?.addEventListener('click', (e) => {
  if (e.target === $('#azan-modal')) closeAzanModal();
});

function closeAzanModal() {
  const ap = $('#azan-player'); if (ap) { ap.pause(); ap.currentTime = 0; }
  const m  = $('#azan-modal');  if (m)  { m.style.display = 'none'; m.setAttribute('aria-hidden', 'true'); }
  document.body.style.overflow = '';
}

/* ============================================================
   SEARCH TOGGLE (header)
   ============================================================ */
$('#search-toggle-btn')?.addEventListener('click', () => {
  navigateTo('surah-list');
  setTimeout(() => { $('#surah-search-input')?.focus(); }, 350);
});

/* ============================================================
   UPDATE 5 – NETWORK WATCHER
   ============================================================ */
window.addEventListener('offline', () => showToast('You are offline. Some features may not work.', 'warn', 5000));
window.addEventListener('online',  () => showToast('Back online! 🌐', 'success', 2500));

/* ============================================================
   SERVICE WORKER
   ============================================================ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(r => console.log('[NoorVerse] SW registered:', r.scope))
      .catch(e => console.warn('[NoorVerse] SW failed:', e));
  });
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  populateReciters();
  history.replaceState({ view: 'dashboard' }, '', '#dashboard');

  const current = $(`#view-dashboard`);
  if (current) current.classList.add('active');
  State.currentView = 'dashboard';
  window.scrollTo(0, 0);

  initI18n();        // UPDATE 4 – apply saved/default language
  initInstallBanner();
}

document.addEventListener('DOMContentLoaded', init);

/* ============================================================
   UPDATE 4 – i18n LOCALIZATION SYSTEM
   Languages: Bengali (default), Urdu, Hindi, English
   ============================================================ */

const I18N_DICT = {
  /* ── Bengali (Default) ── */
  bn: {
    welcome:          'NoorVerse-এ স্বাগতম',
    tagline:          'আপনার সম্পূর্ণ ইসলামিক সঙ্গী',
    card_quran:       'আল-কুরআন',
    card_quran_sub:   'পড়ুন ও শুনুন',
    card_qibla:       'কিবলা',
    card_qibla_sub:   'দিক নির্ণয়',
    card_prayer:      'নামাজের সময়',
    card_prayer_sub:  'দৈনিক সূচি',
    card_pdf:         'PDF পড়ুন',
    card_pdf_sub:     'কুরআন ই-বুক',
    daily_reminder:   'দৈনিক স্মরণ',
    hadith_text:      '"তোমাদের মধ্যে সেই ব্যক্তি সর্বোত্তম, যে কুরআন শেখে এবং অপরকে শেখায়।" — নবী মুহাম্মাদ ﷺ',
    menu_home:        'হোম',
    menu_install:     'অ্যাপ ইনস্টল',
    menu_language:    'ভাষা',
    menu_about:       'আমাদের সম্পর্কে',
    menu_contact:     'যোগাযোগ',
    back:             'ফিরে যান',
    surahs:           'সূরাসমূহ',
    translate_btn:    'অনুবাদ',
    play_btn:         'চালান',
  },

  /* ── Urdu ── */
  ur: {
    welcome:          'NoorVerse میں خوش آمدید',
    tagline:          'آپ کا مکمل اسلامی ساتھی',
    card_quran:       'القرآن',
    card_quran_sub:   'پڑھیں اور سنیں',
    card_qibla:       'قبلہ',
    card_qibla_sub:   'سمت معلوم کریں',
    card_prayer:      'نماز کے اوقات',
    card_prayer_sub:  'روزانہ شیڈول',
    card_pdf:         'PDF پڑھیں',
    card_pdf_sub:     'قرآن ای-بک',
    daily_reminder:   'روزانہ یاد دہانی',
    hadith_text:      '"تم میں سے بہترین وہ شخص ہے جو قرآن سیکھے اور سکھائے۔" — نبی محمد ﷺ',
    menu_home:        'ہوم',
    menu_install:     'ایپ انسٹال',
    menu_language:    'زبان',
    menu_about:       'ہمارے بارے میں',
    menu_contact:     'رابطہ کریں',
    back:             'واپس',
    surahs:           'سورتیں',
    translate_btn:    'ترجمہ',
    play_btn:         'چلائیں',
  },

  /* ── Hindi ── */
  hi: {
    welcome:          'NoorVerse में आपका स्वागत है',
    tagline:          'आपका पूर्ण इस्लामिक साथी',
    card_quran:       'अल-क़ुरआन',
    card_quran_sub:   'पढ़ें और सुनें',
    card_qibla:       'क़िबला',
    card_qibla_sub:   'दिशा जानें',
    card_prayer:      'नमाज़ का वक़्त',
    card_prayer_sub:  'दैनिक समय-सारणी',
    card_pdf:         'PDF पढ़ें',
    card_pdf_sub:     'क़ुरआन ई-बुक',
    daily_reminder:   'दैनिक स्मरण',
    hadith_text:      '"तुम में सबसे अच्छा वह है जो क़ुरआन सीखे और सिखाए।" — नबी मुहम्मद ﷺ',
    menu_home:        'होम',
    menu_install:     'ऐप इंस्टॉल करें',
    menu_language:    'भाषा',
    menu_about:       'हमारे बारे में',
    menu_contact:     'संपर्क करें',
    back:             'वापस',
    surahs:           'सूरतें',
    translate_btn:    'अनुवाद',
    play_btn:         'चलाएं',
  },

  /* ── English ── */
  en: {
    welcome:          'Welcome to NoorVerse',
    tagline:          'Your complete Islamic companion',
    card_quran:       'Al‑Quran',
    card_quran_sub:   'Read & Listen',
    card_qibla:       'Qibla',
    card_qibla_sub:   'Find Direction',
    card_prayer:      'Prayer Times',
    card_prayer_sub:  'Daily Schedule',
    card_pdf:         'Read PDF',
    card_pdf_sub:     'Quran eBook',
    daily_reminder:   'Daily Reminder',
    hadith_text:      '"The best among you are those who learn the Quran and teach it." — Prophet Muhammad ﷺ',
    menu_home:        'Home',
    menu_install:     'Install App',
    menu_language:    'Language',
    menu_about:       'About',
    menu_contact:     'Contact Admin',
    back:             'Back',
    surahs:           'Surahs',
    translate_btn:    'Translate',
    play_btn:         'Play',
  },
};

/* Languages that are RTL — used to flip html[dir] */
const RTL_LANGS = new Set(['ur']);

/**
 * Apply a language: update all [data-i18n] elements,
 * set html[lang] and html[dir], highlight active button.
 */
function applyLanguage(code) {
  const dict = I18N_DICT[code] || I18N_DICT['bn'];

  // Update every element with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  // Update html lang & dir
  document.documentElement.lang = code;
  document.documentElement.dir  = RTL_LANGS.has(code) ? 'rtl' : 'ltr';

  // Highlight active lang button in the modal
  document.querySelectorAll('.lang-option-btn').forEach(btn => {
    btn.classList.toggle('active-lang', btn.dataset.lang === code);
  });

  // Persist choice
  localStorage.setItem('nv_lang', code);
}

/** Boot: read saved preference or default to Bengali */
function initI18n() {
  const saved = localStorage.getItem('nv_lang') || 'bn';
  applyLanguage(saved);

  // Wire up lang-option buttons
  document.querySelectorAll('.lang-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.lang;
      applyLanguage(code);
      closeModal('modal-language');
      showToast(
        I18N_DICT[code]?.menu_language
          ? `${I18N_DICT[code].menu_language} ✓`
          : 'Language updated',
        'success',
        1800
      );
    });
  });
}
