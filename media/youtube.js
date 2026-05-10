const API_URL =
   'https://youtube.krdrt5370000ym2.workers.dev';

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

   // VIDEO ID
   const vId =
      new URLSearchParams(window.location.search)
      .get('v');
   if (!vId) {
      throw new Error('Brak parametrów ?v=');
      return;
   }
   try {
      statusEl.textContent =
         'Łączenie z API...';
      // FETCH API
      const response =
         await fetch(`${API_URL}/?id=${vId}`);

      if (!response.ok) {
         throw new Error(
            `HTTP ${response.status}`
         );
      }

      const data =
         await response.json();
      console.log('API RESPONSE:', data);
      if (!data.success) {
         throw new Error(
            data.error || 'Brak audio'
         );
      }

      // AUDIO URL (FIX)
      const audioUrl =
         data.source.downloadedFileUrl ||
         data.source.audioOnlyUrl;

      if (!audioUrl) {
         throw new Error('Brak URL audio');
      }

      // AUDIO SOURCE
      audioEl.src = audioUrl;
      audioEl.type =
         data.format === 'mp3' ?
         'audio/mpeg' :
         'audio/webm';

      // TITLE
      titleEl.textContent =
         'Ładowanie audio...';

      // THUMBNAIL
      thumbEl.src =
         `https://i.ytimg.com/vi/${data.videoId}/hqdefault.jpg`;

      thumbEl.style.display =
         'block';

      // AUDIO SOURCE
      audioEl.src =
         audioUrl;

      // IMPORTANT
      audioEl.crossOrigin =
         'anonymous';

      // DOWNLOAD BUTTON
      dlEl.href = data.source.downloadedFileUrl || data.source.audioOnlyUrl || audioUrl;

      dlEl.download =
         data.results?.[0]?.fileKey ||
         `${data.videoId}.mp3`;

      dlEl.style.display =
         'inline-block';

      // AUDIO EVENTS
      audioEl.addEventListener(
         'canplay',
         () => {
            statusEl.textContent =
               'Gotowe';
            loaderEl.style.display =
               'none';
         }
      );

      audioEl.addEventListener(
         'error',
         (e) => {
            console.error(
               'AUDIO ERROR',
               e
            );
            statusEl.textContent =
               'Błąd odtwarzania audio';
         }
      );

      // AUTOPLAY
      try {
         await audioEl.play();
      } catch (e) {
         console.warn(
            'Autoplay blocked'
         );
      }

      // UPDATE TITLE
      await updateTitle(data.videoId);

      // MEDIA SESSION
      setupMediaSession(data.videoId);

   } catch (e) {
      console.error(e);
      loaderEl.style.display =
         'none';
      titleEl.textContent =
         'Błąd połączenia';
      statusEl.textContent =
         e.message;
   }
}

async function updateTitle(id) {
   try {
      const r =
         await fetch(
            `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`
         );
      const d =
         await r.json();
      if (d.title) {
         document.getElementById(
               'song-title'
            ).textContent =
            d.title;
         document.title =
            d.title;
      }
   } catch (e) {
      console.error(e);
   }
}

async function setupMediaSession(id) {
   if (
      !('mediaSession' in navigator)
   ) {
      return;
   }
   try {
      const r =
         await fetch(
            `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`
         );
      const d =
         await r.json();
      navigator.mediaSession.metadata =
         new MediaMetadata({
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
