/* =============================================
   NoorVerse – script.js
   Full SPA Logic, All Modules
   ============================================= */

'use strict';

/* =============================================
   1. TRANSLATIONS (i18n)
   ============================================= */
const TRANSLATIONS = {
  en: {
    welcome: 'Welcome to NoorVerse',
    card_quran: 'Al-Quran',
    card_qibla: 'Qibla Compass',
    card_prayer: 'Prayer Times',
    card_pdf: 'Read PDF',
    hadith_title: 'Daily Reminder',
    search_placeholder: 'Search Surah by name or number...',
    loading: 'Loading...',
    loading_quran: 'Loading Quran...',
    nav_home: 'Home',
    nav_about: 'About',
    nav_language: 'Language',
    nav_contact: 'Contact Admin',
    nav_install: 'Install App',
    contact_title: 'Contact Admin',
    audio_title: 'Play Audio',
    audio_reciter: 'Reciter',
    audio_start: 'Start Ayah',
    audio_end: 'End Ayah',
    audio_full: '▶ Full Surah',
    audio_selection: '▶ Selection',
    audio_stop: '■ Stop',
    translate: 'Translate',
    audio: 'Audio',
    qibla_title: 'Qibla Direction',
    qibla_detecting: 'Detecting your location...',
    qibla_note: 'Point your phone toward the Qibla direction. Ensure location & compass permissions are granted.',
    prayer_title: 'Prayer Times',
    prayer_detecting: 'Detecting location...',
    about_tagline: 'Light of the Quran in Your Hands',
    about_developer: 'About the Developer',
    about_text: 'Abdur Rahman Mallik is a dedicated student of Islam and technology, passionate about creating Islamic digital tools to benefit the Ummah. His mission is to combine knowledge and technology to help Muslims connect with the Quran.',
    install_title: 'Install NoorVerse',
    install_sub: 'Get the full app experience',
    install_btn: 'Install',
  },
  ur: {
    welcome: 'نورورس میں خوش آمدید',
    card_quran: 'القرآن',
    card_qibla: 'قبلہ کمپاس',
    card_prayer: 'نماز کے اوقات',
    card_pdf: 'پی ڈی ایف پڑھیں',
    hadith_title: 'روزانہ یاد دہانی',
    search_placeholder: 'سورہ تلاش کریں...',
    loading: 'لوڈ ہو رہا ہے...',
    loading_quran: 'قرآن لوڈ ہو رہا ہے...',
    nav_home: 'گھر',
    nav_about: 'ہمارے بارے میں',
    nav_language: 'زبان',
    nav_contact: 'ایڈمن سے رابطہ',
    nav_install: 'ایپ انسٹال کریں',
    contact_title: 'ایڈمن سے رابطہ',
    audio_title: 'آڈیو چلائیں',
    audio_reciter: 'قاری',
    audio_start: 'آیت شروع',
    audio_end: 'آیت ختم',
    audio_full: '▶ پوری سورہ',
    audio_selection: '▶ انتخاب',
    audio_stop: '■ روکیں',
    translate: 'ترجمہ',
    audio: 'آڈیو',
    qibla_title: 'قبلہ سمت',
    qibla_detecting: 'آپ کا مقام معلوم ہو رہا ہے...',
    qibla_note: 'اپنا فون قبلہ سمت کی طرف کریں۔ مقام اور کمپاس کی اجازت دیں۔',
    prayer_title: 'نماز کے اوقات',
    prayer_detecting: 'مقام معلوم ہو رہا ہے...',
    about_tagline: 'قرآن کی روشنی آپ کے ہاتھوں میں',
    about_developer: 'ڈویلپر کے بارے میں',
    about_text: 'عبدالرحمٰن ملک اسلام اور ٹیکنالوجی کے ایک سرشار طالب علم ہیں، جو امت کے فائدے کے لیے اسلامی ڈیجیٹل ٹولز بنانے کے شوقین ہیں۔',
    install_title: 'نورورس انسٹال کریں',
    install_sub: 'مکمل ایپ تجربہ حاصل کریں',
    install_btn: 'انسٹال',
  },
  bn: {
    welcome: 'নূরভার্সে স্বাগতম',
    card_quran: 'আল-কুরআন',
    card_qibla: 'কিবলা কম্পাস',
    card_prayer: 'নামাজের সময়',
    card_pdf: 'পিডিএফ পড়ুন',
    hadith_title: 'দৈনিক স্মরণ',
    search_placeholder: 'সূরা খুঁজুন...',
    loading: 'লোড হচ্ছে...',
    loading_quran: 'কুরআন লোড হচ্ছে...',
    nav_home: 'হোম',
    nav_about: 'আমাদের সম্পর্কে',
    nav_language: 'ভাষা',
    nav_contact: 'অ্যাডমিন যোগাযোগ',
    nav_install: 'অ্যাপ ইনস্টল করুন',
    contact_title: 'অ্যাডমিন যোগাযোগ',
    audio_title: 'অডিও চালান',
    audio_reciter: 'ক্বারী',
    audio_start: 'শুরু আয়াত',
    audio_end: 'শেষ আয়াত',
    audio_full: '▶ পুরো সূরা',
    audio_selection: '▶ নির্বাচন',
    audio_stop: '■ থামান',
    translate: 'অনুবাদ',
    audio: 'অডিও',
    qibla_title: 'কিবলার দিক',
    qibla_detecting: 'আপনার অবস্থান শনাক্ত হচ্ছে...',
    qibla_note: 'আপনার ফোন কিবলার দিকে রাখুন। অবস্থান ও কম্পাসের অনুমতি দিন।',
    prayer_title: 'নামাজের সময়',
    prayer_detecting: 'অবস্থান শনাক্ত হচ্ছে...',
    about_tagline: 'আপনার হাতে কুরআনের আলো',
    about_developer: 'ডেভেলপার সম্পর্কে',
    about_text: 'আব্দুর রহমান মালিক ইসলাম ও প্রযুক্তির একজন নিবেদিত ছাত্র, যিনি উম্মাহর কল্যাণে ইসলামিক ডিজিটাল টুল তৈরিতে উৎসাহী।',
    install_title: 'নূরভার্স ইনস্টল করুন',
    install_sub: 'পূর্ণ অ্যাপ অভিজ্ঞতা পান',
    install_btn: 'ইনস্টল',
  }
};

const TRANSLATION_EDITIONS = {
  en: 'en.asad',
  ur: 'ur.jalandhry',
  bn: 'bn.bengali'
};

const PRAYER_NAMES = {
  en: { Fajr: 'Fajr', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' },
  ur: { Fajr: 'فجر', Dhuhr: 'ظہر', Asr: 'عصر', Maghrib: 'مغرب', Isha: 'عشاء' },
  bn: { Fajr: 'ফজর', Dhuhr: 'যোহর', Asr: 'আসর', Maghrib: 'মাগরিব', Isha: 'এশা' }
};

const PRAYER_ICONS = { Fajr: '🌙', Dhuhr: '☀️', Asr: '🌤️', Maghrib: '🌅', Isha: '🌟' };

const DAILY_HADITHS = [
  { ar: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', text: '"And whoever fears Allah – He will make for him a way out."', source: '— Quran 65:2' },
  { ar: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', text: '"Indeed, with hardship will be ease."', source: '— Quran 94:6' },
  { ar: 'وَلَذِكْرُ اللَّهِ أَكْبَرُ', text: '"And the remembrance of Allah is greatest."', source: '— Quran 29:45' },
  { ar: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', text: '"For indeed, with hardship will be ease."', source: '— Quran 94:5' },
  { ar: 'وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا', text: '"And put your trust in Allah. And sufficient is Allah as Disposer of affairs."', source: '— Quran 33:3' },
  { ar: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', text: '"Sufficient for us is Allah, and [He is] the best Disposer of affairs."', source: '— Quran 3:173' },
  { ar: 'وَاللَّهُ يُحِبُّ الصَّابِرِينَ', text: '"And Allah loves the steadfast."', source: '— Quran 3:146' },
];

/* =============================================
   2. STATE
   ============================================= */
let appLang = 'en';
let historyStack = [];
let currentView = 'dashboard-view';
let surahList = [];
let filteredSurahList = [];
let searchDebounceTimer = null;
let currentSurah = null;
let currentSurahData = null; // arabic text
let isTranslateMode = false;
let audioQueue = [];
let currentAudio = null;
let currentAudioIndex = 0;
let isPlaying = false;
let qiblaWatchId = null;
let deviceHeading = 0;
let qiblaBearing = 0;
let compassEventHandler = null;

/* =============================================
   3. DOM HELPERS
   ============================================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);
const show = el => { if (el) el.style.display = ''; };
const hide = el => { if (el) el.style.display = 'none'; };
const showFlex = el => { if (el) el.style.display = 'flex'; };

/* =============================================
   4. i18n
   ============================================= */
function applyTranslations(lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  $$('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key] !== undefined) el.placeholder = t[key];
  });
  // RTL for urdu
  document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

function setLang(lang) {
  appLang = lang;
  localStorage.setItem('appLang', lang);
  applyTranslations(lang);
  // Update audio end placeholder based on current surah
  if (currentSurah) {
    const s = surahList.find(s => s.number === currentSurah);
    if (s) $('#audio-end').value = s.numberOfAyahs;
  }
}

/* =============================================
   5. NAVIGATION
   ============================================= */
function showView(viewId, pushHistory = true) {
  const prev = currentView;
  if (prev === viewId) return;

  if (pushHistory && prev) historyStack.push(prev);

  const prevEl = $('#' + prev);
  const nextEl = $('#' + viewId);
  if (prevEl) prevEl.classList.remove('active');
  if (nextEl) nextEl.classList.add('active');

  currentView = viewId;
  updateHeader(viewId);

  // Trigger view-specific init
  if (viewId === 'surah-list-view' && surahList.length === 0) fetchSurahList();
  if (viewId === 'qibla-view') initQibla();
  if (viewId === 'prayer-view') initPrayerTimes();

  // Push browser history for back button
  window.history.pushState({ view: viewId }, '', '#' + viewId);
}

function goBack() {
  if (historyStack.length === 0) return;
  const prev = historyStack.pop();
  const curEl = $('#' + currentView);
  const prevEl = $('#' + prev);
  if (curEl) curEl.classList.remove('active');
  if (prevEl) prevEl.classList.add('active');
  currentView = prev;
  updateHeader(prev);
  window.history.back();
}

function updateHeader(viewId) {
  const backBtn = $('#back-btn');
  const logoImg = $('#header-logo');
  const titleEl = $('#header-title');
  const actionsDefault = $('#header-actions-default');
  const actionsReader = $('#header-actions-reader');

  // Reset
  actionsDefault.style.display = 'flex';
  actionsReader.style.display = 'none';

  if (viewId === 'dashboard-view') {
    backBtn.style.display = 'none';
    if (logoImg) logoImg.style.display = '';
    titleEl.textContent = 'NoorVerse';
  } else {
    backBtn.style.display = 'flex';
    if (logoImg) logoImg.style.display = 'none';

    const titles = {
      'surah-list-view': 'Al-Quran',
      'reader-view': currentSurah ? (surahList.find(s => s.number === currentSurah) || {}).englishName || 'Quran Reader' : 'Quran Reader',
      'qibla-view': TRANSLATIONS[appLang].qibla_title || 'Qibla Compass',
      'prayer-view': TRANSLATIONS[appLang].prayer_title || 'Prayer Times',
      'about-view': 'About',
    };
    titleEl.textContent = titles[viewId] || 'NoorVerse';
  }

  if (viewId === 'reader-view') {
    actionsDefault.style.display = 'none';
    actionsReader.style.display = 'flex';
  }

  // Reset translate btn state
  const translateBtn = $('#translate-btn');
  if (translateBtn) translateBtn.classList.toggle('active', isTranslateMode);
}

/* =============================================
   6. MENU
   ============================================= */
function openMenu() {
  const overlay = $('#menu-overlay');
  const menu = $('#app-menu');
  showFlex(overlay);
  show(menu);
}
function closeMenu() {
  hide($('#menu-overlay'));
  hide($('#app-menu'));
}

/* =============================================
   7. SURAH LIST
   ============================================= */
async function fetchSurahList() {
  try {
    const res = await fetch('https://api.alquran.cloud/v1/surah');
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    surahList = data.data;
    filteredSurahList = [...surahList];
    renderSurahList(filteredSurahList);
  } catch (e) {
    $('#surah-list-container').innerHTML = `<div class="error-message"><h3>Connection Error</h3><p>Please check your internet connection and try again.</p></div>`;
  }
}

function renderSurahList(list) {
  const container = $('#surah-list-container');
  if (!list.length) {
    container.innerHTML = `<div class="no-results">No surahs found for your search.</div>`;
    return;
  }
  container.innerHTML = list.map(s => `
    <button class="surah-card glass-card" data-number="${s.number}" aria-label="${s.englishName}">
      <div class="surah-number">${s.number}</div>
      <div class="surah-info">
        <div class="surah-name-en">${s.englishName}</div>
        <div class="surah-meta">${s.englishNameTranslation} • ${s.numberOfAyahs} Ayahs • ${s.revelationType}</div>
      </div>
      <div class="surah-name-ar">${s.name}</div>
    </button>
  `).join('');

  $$('.surah-card').forEach(card => {
    card.addEventListener('click', () => {
      const num = parseInt(card.dataset.number);
      openSurah(num);
    });
  });
}

/* Search */
function handleSurahSearch(query) {
  query = query.trim();
  const clearBtn = $('#search-clear-btn');
  if (query.length > 0) show(clearBtn);
  else hide(clearBtn);

  if (!query) {
    filteredSurahList = [...surahList];
    renderSurahList(filteredSurahList);
    return;
  }
  const lower = query.toLowerCase();
  const num = parseInt(query);

  // Arabic detection
  const isArabic = /[\u0600-\u06FF]/.test(query);

  if (isArabic) {
    filteredSurahList = surahList.filter(s => s.name.includes(query));
  } else if (!isNaN(num)) {
    filteredSurahList = surahList.filter(s => s.number === num);
  } else {
    filteredSurahList = surahList.filter(s =>
      s.englishName.toLowerCase().includes(lower) ||
      s.englishNameTranslation.toLowerCase().includes(lower)
    );
  }
  renderSurahList(filteredSurahList);
}

/* =============================================
   8. QURAN READER
   ============================================= */
async function openSurah(number) {
  isTranslateMode = false;
  currentSurah = number;
  showView('reader-view');

  const container = $('#reader-container');
  container.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><p>Loading Surah...</p></div>`;

  const surah = surahList.find(s => s.number === number);
  if (surah) {
    // Update header title
    $('#header-title').textContent = surah.englishName;
    // Set audio-end default
    const audioEnd = $('#audio-end');
    if (audioEnd) audioEnd.value = surah.numberOfAyahs;
    const audioStart = $('#audio-start');
    if (audioStart) audioStart.value = 1;
  }

  try {
    const [arabicRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`)
    ]);
    if (!arabicRes.ok) throw new Error('Failed');
    const arabicData = await arabicRes.json();
    currentSurahData = arabicData.data;
    renderMushaf(currentSurahData, null);
  } catch (e) {
    container.innerHTML = `<div class="error-message"><h3>Failed to load Surah</h3><p>Please check your internet and try again.</p></div>`;
  }
}

function renderMushaf(surahData, translationData) {
  const container = $('#reader-container');
  const s = surahList.find(s => s.number === surahData.number) || {};
  const isFatiha = surahData.number === 1;
  const isTawbah = surahData.number === 9;

  let html = `<div class="surah-reader-header">
    <div class="surah-name-display">${surahData.name}</div>
    <div class="surah-meta-reader">${s.englishName || ''} • ${surahData.ayahs.length} Ayahs • ${surahData.revelationType || ''}</div>
    ${(!isTawbah && !isFatiha) ? '<div class="bismillah-reader">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ</div>' : ''}
    <div class="decorative-divider">✦ ✦ ✦</div>
  </div>`;

  if (translationData) {
    // Translation Grid Mode
    html += `<div class="translation-grid">`;
    surahData.ayahs.forEach((ayah, i) => {
      const trans = translationData.ayahs[i];
      const transDir = (appLang === 'ur') ? 'rtl' : 'ltr';
      html += `
        <div class="ayah-card glass-card" data-ayah="${ayah.numberInSurah}" id="ayah-card-${ayah.numberInSurah}">
          <div class="ayah-num-badge">Ayah ${ayah.numberInSurah}</div>
          <div class="ayah-arabic-block">${ayah.text}</div>
          <hr class="ayah-divider" />
          <div class="ayah-translation-block ${transDir === 'rtl' ? 'rtl' : ''}">${trans ? trans.text : ''}</div>
        </div>`;
    });
    html += `</div>`;
  } else {
    // Mushaf mode – continuous flowing text
    html += `<div class="mushaf-text-container">`;
    surahData.ayahs.forEach(ayah => {
      html += `<span class="ayah-text" id="ayah-text-${ayah.numberInSurah}" data-ayah="${ayah.numberInSurah}">${ayah.text}</span><span class="ayah-marker" id="ayah-marker-${ayah.numberInSurah}">${toArabicNum(ayah.numberInSurah)}</span> `;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
}

function toArabicNum(n) {
  const arabicNums = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return String(n).split('').map(d => arabicNums[parseInt(d)] || d).join('');
}

async function toggleTranslate() {
  if (!currentSurahData) return;
  isTranslateMode = !isTranslateMode;
  const btn = $('#translate-btn');
  if (btn) btn.classList.toggle('active', isTranslateMode);

  if (isTranslateMode) {
    const container = $('#reader-container');
    const oldHeader = container.querySelector('.surah-reader-header');
    const headerHtml = oldHeader ? oldHeader.outerHTML : '';
    container.innerHTML = `${headerHtml}<div class="loading-spinner"><div class="spinner"></div><p>Loading Translation...</p></div>`;

    try {
      const edition = TRANSLATION_EDITIONS[appLang] || 'en.asad';
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${currentSurah}/${edition}`);
      const data = await res.json();
      renderMushaf(currentSurahData, data.data);
    } catch (e) {
      $('#reader-container').innerHTML += `<div class="error-message"><p>Translation unavailable</p></div>`;
    }
  } else {
    renderMushaf(currentSurahData, null);
  }
}

/* =============================================
   9. AUDIO PLAYBACK
   ============================================= */
function openAudioModal() {
  const overlay = $('#audio-modal-overlay');
  showFlex(overlay);
}
function closeAudioModal() {
  hide($('#audio-modal-overlay'));
}

function stopAudio() {
  isPlaying = false;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  audioQueue = [];
  currentAudioIndex = 0;
  clearAudioHighlights();
  updateAudioStatus('');
}

function clearAudioHighlights() {
  $$('.ayah-marker.playing').forEach(el => el.classList.remove('playing'));
  $$('.ayah-text.playing').forEach(el => el.classList.remove('playing'));
  $$('.ayah-card.playing').forEach(el => el.classList.remove('playing'));
}

function updateAudioStatus(msg) {
  const el = $('#audio-status');
  if (el) el.textContent = msg;
}

function highlightAyah(ayahNum) {
  clearAudioHighlights();
  const marker = $(`#ayah-marker-${ayahNum}`);
  const text = $(`#ayah-text-${ayahNum}`);
  const card = $(`#ayah-card-${ayahNum}`);
  if (marker) { marker.classList.add('playing'); marker.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  if (text) text.classList.add('playing');
  if (card) { card.classList.add('playing'); card.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}

async function playAudioQueue(queue, reciter) {
  stopAudio();
  isPlaying = true;
  audioQueue = [...queue];
  currentAudioIndex = 0;

  const playNext = () => {
    if (!isPlaying || currentAudioIndex >= audioQueue.length) {
      clearAudioHighlights();
      updateAudioStatus(isPlaying ? 'Playback complete.' : '');
      isPlaying = false;
      return;
    }
    const ayahNum = audioQueue[currentAudioIndex];
    const globalNum = currentSurahData.ayahs.find(a => a.numberInSurah === ayahNum)?.number;
    if (!globalNum) { currentAudioIndex++; playNext(); return; }

    updateAudioStatus(`Playing Ayah ${ayahNum} of ${audioQueue.length > 1 ? audioQueue.length + ' selected' : currentSurahData.ayahs.length}...`);
    highlightAyah(ayahNum);

    const url = `https://cdn.islamic.network/quran/audio/64/${reciter}/${globalNum}.mp3`;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.play().catch(() => {
      currentAudioIndex++;
      playNext();
    });
    audio.onended = () => {
      if (!isPlaying) return;
      currentAudioIndex++;
      playNext();
    };
    audio.onerror = () => {
      currentAudioIndex++;
      playNext();
    };
  };
  playNext();
}

function handlePlayFull() {
  if (!currentSurahData) return;
  const reciter = $('#reciter-select').value;
  const queue = currentSurahData.ayahs.map(a => a.numberInSurah);
  closeAudioModal();
  playAudioQueue(queue, reciter);
}

function handlePlaySelection() {
  if (!currentSurahData) return;
  const reciter = $('#reciter-select').value;
  let start = parseInt($('#audio-start').value) || 1;
  let end = parseInt($('#audio-end').value) || currentSurahData.ayahs.length;
  start = Math.max(1, Math.min(start, currentSurahData.ayahs.length));
  end = Math.max(start, Math.min(end, currentSurahData.ayahs.length));
  const queue = [];
  for (let i = start; i <= end; i++) queue.push(i);
  closeAudioModal();
  playAudioQueue(queue, reciter);
}

/* =============================================
   10. QIBLA COMPASS
   ============================================= */
function initQibla() {
  const statusEl = $('#qibla-status');
  const bearingEl = $('#qibla-bearing');

  if (!navigator.geolocation) {
    if (statusEl) statusEl.textContent = 'Geolocation not supported.';
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    qiblaBearing = calcQiblaBearing(lat, lng);

    if (statusEl) statusEl.textContent = `Location found • ${lat.toFixed(3)}°, ${lng.toFixed(3)}°`;
    if (bearingEl) bearingEl.textContent = `Qibla: ${Math.round(qiblaBearing)}°`;

    startCompass();
  }, err => {
    if (statusEl) statusEl.textContent = 'Location permission denied.';
  }, { enableHighAccuracy: true, timeout: 10000 });
}

function calcQiblaBearing(lat1, lng1) {
  const MECCA_LAT = 21.422487;
  const MECCA_LNG = 39.826206;
  const toRad = d => d * Math.PI / 180;
  const toDeg = r => r * 180 / Math.PI;
  const dLng = toRad(MECCA_LNG - lng1);
  const lat1r = toRad(lat1);
  const lat2r = toRad(MECCA_LAT);
  const y = Math.sin(dLng) * Math.cos(lat2r);
  const x = Math.cos(lat1r) * Math.sin(lat2r) - Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function startCompass() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then(state => {
      if (state === 'granted') listenCompass();
    }).catch(() => {});
  } else {
    listenCompass();
  }
}

function listenCompass() {
  if (compassEventHandler) {
    window.removeEventListener('deviceorientationabsolute', compassEventHandler);
    window.removeEventListener('deviceorientation', compassEventHandler);
  }
  compassEventHandler = (e) => {
    let heading = null;
    if (e.absolute && e.alpha !== null) heading = 360 - e.alpha;
    else if (e.webkitCompassHeading !== undefined) heading = e.webkitCompassHeading;
    else if (e.alpha !== null) heading = 360 - e.alpha;
    if (heading === null) return;
    deviceHeading = heading;
    const rotation = (qiblaBearing - deviceHeading + 360) % 360;
    rotateNeedle(rotation);
  };
  window.addEventListener('deviceorientationabsolute', compassEventHandler, true);
  window.addEventListener('deviceorientation', compassEventHandler, true);
}

function rotateNeedle(deg) {
  const needle = $('#compass-needle');
  const fallback = $('#needle-fallback');
  const transform = `translateX(-50%) translateY(-100%) rotate(${deg}deg)`;
  if (needle) needle.style.transform = transform;
  if (fallback) fallback.style.transform = transform;
}

/* =============================================
   11. PRAYER TIMES
   ============================================= */
async function initPrayerTimes() {
  const container = $('#prayer-times-container');
  const locationEl = $('#prayer-location');
  const dateEl = $('#prayer-date');

  if (!navigator.geolocation) {
    if (locationEl) locationEl.textContent = 'Geolocation not supported.';
    return;
  }

  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    try {
      const now = new Date();
      const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      }

      const res = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const timings = data.data.timings;
      const meta = data.data.meta;

      if (locationEl) locationEl.textContent = `${meta.latitude.toFixed(3)}°, ${meta.longitude.toFixed(3)}°`;

      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const names = PRAYER_NAMES[appLang] || PRAYER_NAMES.en;

      // Find next prayer
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      let nextPrayer = null;
      for (const p of prayers) {
        const [h, m] = timings[p].split(':').map(Number);
        if (h * 60 + m > nowMinutes) { nextPrayer = p; break; }
      }

      container.innerHTML = prayers.map(p => {
        const isNext = p === nextPrayer;
        return `<div class="prayer-card glass-card ${isNext ? 'next-prayer' : ''}">
          <div class="prayer-icon">${PRAYER_ICONS[p]}</div>
          <div class="prayer-info">
            <div class="prayer-name">${names[p] || p}</div>
            <div class="prayer-name-ar">${PRAYER_NAMES.ur[p]}</div>
          </div>
          ${isNext ? '<span class="next-badge">Next</span>' : ''}
          <div class="prayer-time">${formatTime(timings[p])}</div>
        </div>`;
      }).join('');

    } catch (e) {
      container.innerHTML = `<div class="error-message"><h3>Failed to load prayer times</h3><p>Please check your connection.</p></div>`;
    }
  }, err => {
    container.innerHTML = `<div class="error-message"><h3>Location Required</h3><p>Please allow location access to see prayer times.</p></div>`;
  }, { enableHighAccuracy: true });
}

function formatTime(time24) {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/* =============================================
   12. INSTALL BANNER
   ============================================= */
function initInstallBanner() {
  if (localStorage.getItem('installDismissed') === '1') return;
  const banner = $('#install-banner');
  setTimeout(() => show(banner), 3000);
  $('#install-dismiss-btn').addEventListener('click', () => {
    hide(banner);
    localStorage.setItem('installDismissed', '1');
  });
}

/* =============================================
   13. DAILY HADITH
   ============================================= */
function setDailyHadith() {
  const idx = new Date().getDay() % DAILY_HADITHS.length;
  const h = DAILY_HADITHS[idx];
  const arEl = $('#hadith-arabic');
  const textEl = $('#hadith-text');
  const srcEl = document.querySelector('.hadith-source');
  if (arEl) arEl.textContent = h.ar;
  if (textEl) textEl.textContent = h.text;
  if (srcEl) srcEl.textContent = h.source;
}

/* =============================================
   14. SERVICE WORKER REGISTRATION
   ============================================= */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}

/* =============================================
   15. EVENT LISTENERS
   ============================================= */
function bindEvents() {
  // Back button
  $('#back-btn').addEventListener('click', goBack);

  // Browser back button
  window.addEventListener('popstate', (e) => {
    if (historyStack.length > 0) {
      const prev = historyStack.pop();
      const curEl = $('#' + currentView);
      const prevEl = $('#' + prev);
      if (curEl) curEl.classList.remove('active');
      if (prevEl) prevEl.classList.add('active');
      currentView = prev;
      updateHeader(prev);
    }
  });

  // Menu open/close
  $('#menu-btn').addEventListener('click', openMenu);
  $('#menu-close-btn').addEventListener('click', closeMenu);
  $('#menu-overlay').addEventListener('click', closeMenu);

  // Menu items
  $$('.menu-item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeMenu();
      showView(btn.dataset.view);
    });
  });
  $('#menu-lang-btn').addEventListener('click', () => {
    closeMenu();
    showLangOverlay();
  });
  $('#menu-contact-btn').addEventListener('click', () => {
    closeMenu();
    showFlex($('#contact-modal-overlay'));
  });
  $('#menu-install-btn').addEventListener('click', () => {
    closeMenu();
    window.open('https://drive.google.com/uc?id=1io4qGGLfmK3XIA_KFbffTpPbcS2SziG0', '_blank');
  });

  // Contact modal close
  $('#contact-close-btn').addEventListener('click', () => hide($('#contact-modal-overlay')));
  $('#contact-modal-overlay').addEventListener('click', (e) => {
    if (e.target === $('#contact-modal-overlay')) hide($('#contact-modal-overlay'));
  });

  // Dashboard feature cards
  $$('.feature-card[data-view]').forEach(card => {
    card.addEventListener('click', () => showView(card.dataset.view));
  });
  $('#pdf-card').addEventListener('click', () => {
    window.open('webquraan.pdf', '_blank');
  });

  // Surah search
  const searchInput = $('#surah-search');
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => handleSurahSearch(e.target.value), 300);
  });
  $('#search-clear-btn').addEventListener('click', () => {
    searchInput.value = '';
    hide($('#search-clear-btn'));
    filteredSurahList = [...surahList];
    renderSurahList(filteredSurahList);
    searchInput.focus();
  });

  // Reader: audio + translate
  $('#audio-btn').addEventListener('click', openAudioModal);
  $('#translate-btn').addEventListener('click', toggleTranslate);
  $('#audio-close-btn').addEventListener('click', closeAudioModal);
  $('#audio-modal-overlay').addEventListener('click', (e) => {
    if (e.target === $('#audio-modal-overlay')) closeAudioModal();
  });
  $('#play-full-btn').addEventListener('click', handlePlayFull);
  $('#play-selection-btn').addEventListener('click', handlePlaySelection);
  $('#stop-btn').addEventListener('click', () => { stopAudio(); closeAudioModal(); });

  // Language buttons in overlay
  $$('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      setLang(lang);
      hideLangOverlay();
    });
  });
}

/* =============================================
   16. LANGUAGE OVERLAY
   ============================================= */
function showLangOverlay() {
  const overlay = $('#lang-overlay');
  overlay.style.display = 'flex';
}

function hideLangOverlay() {
  const overlay = $('#lang-overlay');
  overlay.style.animation = 'fadeOut 0.3s ease forwards';
  setTimeout(() => {
    hide(overlay);
    overlay.style.animation = '';
  }, 300);
}

/* =============================================
   17. INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();

  // Language check
  const savedLang = localStorage.getItem('appLang');
  if (!savedLang) {
    showLangOverlay();
  } else {
    appLang = savedLang;
    applyTranslations(appLang);
  }

  // Set initial browser state
  window.history.replaceState({ view: 'dashboard-view' }, '', '#dashboard-view');

  setDailyHadith();
  bindEvents();
  initInstallBanner();
});
