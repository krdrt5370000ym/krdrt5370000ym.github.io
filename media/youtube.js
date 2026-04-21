const params = new URLSearchParams(window.location.search);
const youtubeId = params.get("v");
const activeId = youtubeId || null;

if (activeId) {
   document.getElementById('article-post').style.display = 'block';
}

var tag = document.createElement('script');
tag.src = "https://youtube.com/iframe_api";
document.head.appendChild(tag);

let player, isPlaying = false,
   isLooping = false,
   timeUpdater;
let jumpClickCount = 0,
   jumpTimer = null;
const jumpMap = [10, 20, 40, 60, 120, 300, 600, 900, 1200, 1500, 1800];

function onYouTubeIframeAPIReady() {
   if (!activeId) return;
   player = new YT.Player('yt-player', {
      height: '0',
      width: '0',
      videoId: activeId,
      playerVars: {
         controls: 0,
         disablekb: 1,
         modestbranding: 1,
         playsinline: 1,
         vq: 'tiny'
      },
      events: {
         'onStateChange': onStateChange,
         'onReady': onPlayerReady
      }
   });
}

function onPlayerReady() {
   const title = player.getVideoData().title || "Nieznany utwór";
   document.getElementById("song-title").textContent = title;
   document.getElementById("info-id").innerHTML = `ID: <a href="https://www.youtube.com/watch?v=${activeId}">${activeId}</a>`;
   document.title = title + ' || YT Audio Player | krdrt537000ym.github.io';
   if (player.setPlaybackQuality) player.setPlaybackQuality('tiny');
   updateTimer();
}

function showStatus(text) {
   const statusDiv = document.getElementById("status-info");
   statusDiv.textContent = text;
   if (jumpClickCount === 0) {
      setTimeout(() => {
         if (jumpClickCount === 0) statusDiv.textContent = "";
      }, 2000);
   }
}

function togglePlay() {
   if (!player) return;
   isPlaying ? player.pauseVideo() : player.playVideo();
}

function stopVideo() {
   if (!player) return;
   player.stopVideo();
}

function toggleLoop() {
   isLooping = !isLooping;
   const btn = document.getElementById("loopBtn");
   btn.textContent = isLooping ? "🔁 Pętla: WŁ" : "🔁 Pętla: WYŁ";
   btn.classList.toggle("active", isLooping);
}

function toggleMute() {
   if (!player) return;
   const muteBtn = document.getElementById("muteBtn");
   if (player.isMuted()) {
      player.unMute();
      showStatus("Dźwięk włączony (" + player.getVolume() + "%)");
      muteBtn.textContent = "🔊 Unmuted";
      muteBtn.style.background = "#fff";
   } else {
      player.mute();
      showStatus("Wyciszono (Mute)");
      muteBtn.textContent = "🔇 Muted";
      muteBtn.style.background = "#ffcccc";
   }
}

function changeVolume(delta) {
   if (!player) return;
   let newVol = Math.min(Math.max(player.getVolume() + delta, 0), 100);
   player.setVolume(newVol);
   if (newVol > 0 && player.isMuted()) toggleMute();
   showStatus("Głośność: " + newVol + "%");
}

function smartJump(direction) {
   jumpClickCount++;
   const index = Math.min(jumpClickCount, jumpMap.length) - 1;
   const val = jumpMap[index];
   let displayVal = val >= 60 ? (val / 60) + "m" : val + "s";
   showStatus((direction > 0 ? '+' : '-') + displayVal);

   if (jumpTimer) clearTimeout(jumpTimer);
   jumpTimer = setTimeout(() => {
      player.seekTo(player.getCurrentTime() + (val * direction), true);
      jumpClickCount = 0;
      setTimeout(() => {
         if (jumpClickCount === 0) document.getElementById("status-info").textContent = "";
      }, 1000);
   }, 500);
}

function seekTo() {
   const val = document.getElementById("time").value.trim();
   if (!val) return;
   let s = val.includes(':') ? (val.split(':')[0] * 60 + val.split(':')[1] * 1) : val * 1;
   player.seekTo(s, true);
   player.playVideo();
}

function handleEnter(e) {
   if (e.key === "Enter") seekTo();
}

document.addEventListener('keydown', (e) => {
   if (document.activeElement.id === 'time') return;
   if (e.key === "ArrowLeft") {
      e.preventDefault();
      smartJump(-1);
   } else if (e.key === "ArrowRight") {
      e.preventDefault();
      smartJump(1);
   } else if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
   } else if (e.key === "Escape" || e.key === "s") {
      e.preventDefault();
      stopVideo();
   } else if (e.key === "l") {
      e.preventDefault();
      toggleLoop();
   } else if (e.key === "m") {
      e.preventDefault();
      toggleMute();
   } else if (e.key === "-") {
      e.preventDefault();
      changeVolume(-10);
   } else if (e.key === "=") {
      e.preventDefault();
      changeVolume(10);
   }
});

function onStateChange(e) {
   const btn = document.getElementById("playBtn");
   if (e.data === YT.PlayerState.PLAYING) {
      isPlaying = true;
      btn.textContent = "⏸ Pause";
      timeUpdater = setInterval(updateTimer, 500);
   } else {
      isPlaying = false;
      btn.textContent = "▶ Play";
      clearInterval(timeUpdater);
      if (e.data === YT.PlayerState.ENDED && isLooping) {
         player.seekTo(0);
         player.playVideo();
      }
   }
}

function formatTime(s) {
   if (isNaN(s)) return "0:00";
   const m = Math.floor(s / 60);
   const secs = Math.floor(s % 60);
   return m + ":" + (secs < 10 ? '0' : '') + secs;
}

function updateTimer() {
   if (player && player.getCurrentTime) {
      document.getElementById("time-display").textContent =
         formatTime(player.getCurrentTime()) + " / " + formatTime(player.getDuration());
   }
}
