const API_URL =
   'https://youtube.krdrt5370000ym2.workers.dev';

async function forceDownload(url, name) {
    const res = await fetch(url);
    const blob = await res.blob();

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
}

async function init() {

   const titleEl =
      document.getElementById('song-title');

   const audioEl =
      document.getElementById('audio-ctrl');

   const dlEl =
      document.getElementById('dl-link');

   const statusEl =
      document.getElementById('status');

   const loaderEl =
      document.getElementById('loader');

   const thumbEl =
      document.getElementById('thumb');

   const pageEl =
      document.getElementById('show-page');

   const vId =
      new URLSearchParams(window.location.search)
      .get('v');

   if (!vId) {
      document.getElementById('player-screen').style.display = 'none';
      throw new Error('Brak ?v=');
   }

   pageEl.href =
      `https://www.youtube.com/watch?v=${vId}`;

   try {

      statusEl.textContent = 'Łączenie z API...';

      const response =
         await fetch(`${API_URL}/?id=${vId}`);

      if (!response.ok) {
         throw new Error(`HTTP ${response.status}`);
      }

      const data =
         await response.json();

      if (!data?.success) {
         throw new Error(data?.error || 'Brak audio');
      }

      // =========================
      // AUDIO URL (SAFE)
      // =========================
      const audioUrl =
         data?.source?.downloadedFileUrl ||
         data?.source?.audioOnlyUrl;

      if (!audioUrl) {
         throw new Error('Brak URL audio');
      }

      // =========================
      // AUDIO CONFIG (FIXED ORDER)
      // =========================
      audioEl.crossOrigin = 'anonymous';
      audioEl.type =
         data.format === 'mp3' ?
         'audio/mpeg' :
         'audio/webm';

      audioEl.src = audioUrl;

      // =========================
      // UI
      // =========================
      thumbEl.src =
         `https://i.ytimg.com/vi/${data.videoId}/hqdefault.jpg`;
      thumbEl.style.display = 'block';

      dlEl.onclick = (e) => {
         e.preventDefault();
         forceDownload(audioUrl, data.results[0].fileKey || `${data.videoId}.mp3`);
      };

      dlEl.style.display = 'inline-block';

      // =========================
      // EVENTS
      // =========================
      audioEl.addEventListener('canplay', () => {
         statusEl.textContent = 'Gotowe';
         loaderEl.style.display = 'none';
      });

      audioEl.addEventListener('error', (e) => {
         console.error(e);
         statusEl.textContent = 'Błąd audio';
      });

      // =========================
      // AUTOPLAY (SAFE)
      // =========================
      try {
         audioEl.muted = true; // FIX autoplay block
         await audioEl.play();
         audioEl.muted = false;
      } catch (e) {
         console.warn('Autoplay blocked');
      }

      // =========================
      // TITLE + MEDIA SESSION
      // =========================
      await updateTitle(data.videoId);
      setupMediaSession(data.videoId);

   } catch (e) {

      console.error(e);

      loaderEl.style.display = 'none';
      titleEl.textContent = 'Błąd';
      statusEl.textContent = e.message;

   }
}

async function updateTitle(id) {
   try {
      const r = await fetch(
         `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`
      );
      const d = await r.json();

      if (d?.title) {
         document.getElementById('song-title').textContent = d.title;
         document.title = d.title;
      }
   } catch (e) {
      console.error(e);
   }
}

async function setupMediaSession(id) {
   if (!('mediaSession' in navigator)) return;

   try {
      const r = await fetch(
         `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`
      );

      const d = await r.json();

      navigator.mediaSession.metadata = new MediaMetadata({
         title: d.title || 'YT Audio',
         artist: d.author_name || 'YouTube',
         album: 'YouTube Audio',
         artwork: [{
            src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
            sizes: '480x360',
            type: 'image/jpeg'
         }]
      });

   } catch (e) {
      console.error(e);
   }
}

init();
