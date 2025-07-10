const STORAGE_KEY = 'song-list';
const addBtn = document.querySelector('.add-button');
const titleInput = document.querySelector('.add-box input[type="text"]');
const urlInput = document.querySelector('.add-box input[type="url"]');
const songList = document.getElementById('songList');
const songCount = document.getElementById('songCount');

function getYouTubeID(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtu.be')) return urlObj.pathname.slice(1);
    if (urlObj.hostname.includes('youtube.com')) return urlObj.searchParams.get('v');
  } catch {
    return null;
  }
  return null;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();
  const ampm = h >= 12 ? '오후' : '오전';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${y}. ${m}. ${d}. ${ampm} ${h12}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function loadSongs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveSongs(songs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

function updateSongCount() {
  const count = songList.children.length;
  songCount.textContent = `${count} ${count === 1 ? 'song' : 'songs'}`;
}

function createSongCardElement(song) {
  const { title, videoID, addedAt } = song;
  const card = document.createElement('div');
  card.className = 'song-card';

  const thumbImg = document.createElement('img');
  thumbImg.src = `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
  thumbImg.width = 120;
  thumbImg.height = 90;
  thumbImg.className = 'thumbnail';
  thumbImg.alt = title;

  const infoDiv = document.createElement('div');
  infoDiv.className = 'song-info';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'song-title';
  titleDiv.textContent = title;

  const dateDiv = document.createElement('div');
  dateDiv.className = 'song-date';
  dateDiv.textContent = formatDate(new Date(addedAt));

  infoDiv.append(titleDiv, dateDiv);

  const btnForm = document.createElement('form');
  btnForm.className = 'song-buttons';

  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'play-button';
  playBtn.textContent = '▶';
  playBtn.onclick = () => {
    const url = `song.html?title=${encodeURIComponent(title)}&videoID=${videoID}`;
    window.open(url, '_blank');
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-button';
  const img = document.createElement('img');
  img.src = 'image/trach.png';
  deleteBtn.appendChild(img);
  deleteBtn.onclick = () => {
    songList.removeChild(card);
    const updated = loadSongs().filter(s => s.videoID !== videoID || s.addedAt !== addedAt);
    saveSongs(updated);
    updateSongCount();
  };

  btnForm.append(playBtn, deleteBtn);
  card.append(thumbImg, infoDiv, btnForm);

  return card;
}


function renderSongs() {
  songList.innerHTML = '';
  loadSongs().forEach(song => songList.appendChild(createSongCardElement(song)));
  updateSongCount();
}

addBtn.onclick = () => {
  const title = titleInput.value.trim();
  const url = urlInput.value.trim();
  if (!title || !url) return alert('노래 제목과 유튜브 URL을 모두 입력하세요.');
  const videoID = getYouTubeID(url);
  if (!videoID) return alert('유효한 유튜브 URL을 입력하세요.');

  const songs = loadSongs();
  if (songs.some(s => s.videoID === videoID && s.title === title)) {
    return alert('이미 추가된 노래입니다.');
  }

  const newSong = { title, videoID, addedAt: new Date().toISOString() };
  songs.push(newSong);
  saveSongs(songs);
  songList.appendChild(createSongCardElement(newSong));
  updateSongCount();
  titleInput.value = '';
  urlInput.value = '';
};

renderSongs();
