const STORAGE_KEY = 'song-list';

let player;
const titleElement = document.querySelector('.title');
const nextTitleElement = document.querySelector('.song-title');
const queueInfo = document.querySelector('.queue');
const thumbnailContainer = document.querySelector('.thumbnail');
const iframeHole = document.querySelector('.iframe-hole');
const prevBtn = document.querySelector('.ctrl-btn.prev');
const nextBtn = document.querySelector('.ctrl-btn.next');

const params = new URLSearchParams(location.search);
const currentVideoID = params.get('videoID');
const currentTitle = params.get('title');

let playlist = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentIndex = playlist.findIndex(
  s => s.videoID === currentVideoID && s.title === currentTitle
);

if (currentIndex === -1 && currentVideoID && currentTitle) {
  playlist = [{ videoID: currentVideoID, title: currentTitle }];
  currentIndex = 0;
}

function updateInfo(index) {
  const song = playlist[index];
  if (!song) return;

  titleElement.textContent = song.title;

  const nextSongBox = document.querySelector('.next-song');

  const next = playlist[index + 1];
  if (next) {
    nextSongBox.style.display = 'block';

    nextTitleElement.textContent = next.title;
    queueInfo.textContent = `다음 노래 ${playlist.length - index - 1}개`;

    thumbnailContainer.innerHTML = '';
    const thumbImg = document.createElement('img');
    thumbImg.src = `https://img.youtube.com/vi/${next.videoID}/hqdefault.jpg`;
    thumbImg.width = 50;
    thumbImg.height = 50;
    thumbImg.style.borderRadius = '10px';
    thumbImg.alt = next.title;

    thumbnailContainer.appendChild(thumbImg);
  } else {
    nextSongBox.style.display = 'none';
  }
}



function playAt(index) {
  if (index < 0 || index >= playlist.length) return;

  currentIndex = index;
  const videoID = playlist[index].videoID;

  iframeHole.innerHTML = '';
  const playerDiv = document.createElement('div');
  playerDiv.id = 'player';
  iframeHole.appendChild(playerDiv);

  player = new YT.Player('player', {
    width: '300',
    height: '300',
    videoId: videoID,
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0,
      modestbranding: 1
    },
    events: {
      onReady: e => e.target.playVideo(),
      onStateChange: e => {
        if (e.data === YT.PlayerState.ENDED && playlist[currentIndex + 1]) {
          playAt(currentIndex + 1);
        }
      }
    }
  });

  updateInfo(index);
}

prevBtn.onclick = () => {
  if (currentIndex > 0) playAt(currentIndex - 1);
};

nextBtn.onclick = () => {
  if (currentIndex < playlist.length - 1) playAt(currentIndex + 1);
};

function initPlayer() {
  if (currentIndex === -1 && playlist.length > 0) {
    currentIndex = 0;
  }
  if (playlist[currentIndex]) {
    playAt(currentIndex);
  }
}

if (window.YT && YT.Player) {
  initPlayer();
} else {
  window.onYouTubeIframeAPIReady = initPlayer;
}

