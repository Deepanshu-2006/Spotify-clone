const $ = (sel) => document.querySelector(sel);
const audio = $('#audio');

const elSongs = $('#songs');
const elPlaylist = $('#playlist');
const elViewTitle = $('#viewTitle');
const elSearch = $('#searchInput');

const elNowTitle = $('#nowTitle');
const elNowArtist = $('#nowArtist');
const elCurTime = $('#curTime');
const elDurTime = $('#durTime');
const elSeek = $('#seek');
const elVolume = $('#volume');

const btnPlay = $('#btnPlay');
const btnPrev = $('#btnPrev');
const btnNext = $('#btnNext');
const btnLoadDemo = $('#btnLoadDemo');

// Demo library (public-domain sample URLs; replace with your own files)
const library = [
  {
    id: 'demo-1',
    title: 'Acoustic Breeze',
    artist: 'Benjamin Tissot',
    album: 'Demo',
    src: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
  },
  {
    id: 'demo-2',
    title: 'Creative Minds',
    artist: 'Benjamin Tissot',
    album: 'Demo',
    src: 'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3',
  },
  {
    id: 'demo-3',
    title: 'Energy',
    artist: 'Benjamin Tissot',
    album: 'Demo',
    src: 'https://www.bensound.com/bensound-music/bensound-energy.mp3',
  },
];

let filtered = [...library];
let currentIndex = -1;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function renderSongs(list) {
  elSongs.innerHTML = '';
  if (!list.length) {
    elSongs.innerHTML = `<div style="color:#b3b3b3;padding:10px;">No songs found.</div>`;
    return;
  }

  for (let i = 0; i < list.length; i++) {
    const song = list[i];
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = String(i);

    card.innerHTML = `
      <div class="cover" aria-hidden="true"></div>
      <div class="card__title">${escapeHtml(song.title)}</div>
      <div class="card__artist">${escapeHtml(song.artist)}</div>
      <div class="card__badge">${escapeHtml(song.album)}</div>
    `;

    card.addEventListener('click', () => {
      playIndex(i);
    });

    elSongs.appendChild(card);
  }
}

function renderPlaylists() {
  // Simple: one playlist = filtered view
  elPlaylist.innerHTML = '';
  const li = document.createElement('li');
  li.textContent = 'Liked Songs (demo)';
  li.className = 'active';
  elPlaylist.appendChild(li);
}

function setNowPlaying(song) {
  if (!song) {
    elNowTitle.textContent = 'Not playing';
    elNowArtist.textContent = '—';
    return;
  }
  elNowTitle.textContent = song.title;
  elNowArtist.textContent = song.artist;
}

function playIndex(i) {
  const song = filtered[i];
  if (!song) return;

  currentIndex = i;
  audio.src = song.src;
  audio.play().catch(() => {
    // Autoplay may be blocked until user interacts; ignore.
  });

  setNowPlaying(song);
  btnPlay.textContent = '⏸';
}

function togglePlay() {
  if (!audio.src) {
    // if nothing loaded, start first item
    if (filtered.length) playIndex(0);
    return;
  }

  if (audio.paused) {
    audio.play();
    btnPlay.textContent = '⏸';
  } else {
    audio.pause();
    btnPlay.textContent = '▶';
  }
}

function next() {
  if (!filtered.length) return;
  const n = (currentIndex + 1) % filtered.length;
  playIndex(n);
}

function prev() {
  if (!filtered.length) return;
  const p = (currentIndex - 1 + filtered.length) % filtered.length;
  playIndex(p);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Events
btnPlay.addEventListener('click', togglePlay);
btnNext.addEventListener('click', next);
btnPrev.addEventListener('click', prev);

btnLoadDemo.addEventListener('click', () => {
  // In a real app you would fetch / load from your backend.
  filtered = [...library];
  currentIndex = -1;
  elViewTitle.textContent = 'Songs';
  renderSongs(filtered);
  renderPlaylists();
});

elSearch.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  filtered = library.filter(
    (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q)
  );
  renderSongs(filtered);
});

// Player progress
function updateTime() {
  const cur = audio.currentTime || 0;
  const dur = audio.duration || 0;
  elCurTime.textContent = formatTime(cur);
  elDurTime.textContent = formatTime(dur);

  if (Number.isFinite(dur) && dur > 0) {
    elSeek.value = String(Math.floor((cur / dur) * 100));
  } else {
    elSeek.value = '0';
  }
}

audio.addEventListener('timeupdate', updateTime);

audio.addEventListener('loadedmetadata', updateTime);

audio.addEventListener('ended', next);

elSeek.addEventListener('input', (e) => {
  const dur = audio.duration || 0;
  if (!Number.isFinite(dur) || dur <= 0) return;
  const pct = Number(e.target.value) / 100;
  audio.currentTime = dur * pct;
});

elVolume.addEventListener('input', (e) => {
  audio.volume = Number(e.target.value);
});

// Init view
renderSongs(filtered);
renderPlaylists();
