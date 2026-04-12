async function uruchomPodcast() {
   const params = new URLSearchParams(window.location.search);
   const uid = params.get('uid');
   const station = params.get('st');

   if (!uid || !station) {
      document.body.innerHTML = "Błąd: Brak parametrów 'uid' lub 'st' w adresie URL.";
      document.title = window.location.href;
      return;
   }

   try {
      // Funkcja pomocnicza z POPRAWIONĄ ŚCIEŻKĄ: /media/json/
      const fetchJSON = async (fileName) => {
         const url = `https://krdrt5370000ym.github.io/media/json/${station}_${fileName}.json`;
         try {
            const res = await fetch(url);
            if (!res.ok) return fileName === 'config' ? {} : [];

            const data = await res.json();

            // Twoja poprawka: standaryzacja CONFIG i SCHEDULE
            if (fileName === 'config') {
               return (Array.isArray(data) ? data[0] : data) || {};
            }

            // Dla schedule i programs upewniamy się, że to zawsze tablica (do .filter i .find)
            return Array.isArray(data) ? data : [];

         } catch (e) {
            return (fileName === 'config') ? {} : [];
         }
      };

      // Wywołanie w Promise.all pozostaje bez zmian:
      const [PODCASTS, CONFIG] = await Promise.all([
         fetchJSON('podcasts'),
         fetchJSON('config')
      ]);
      
      const podcast = PODCASTS.find(p => p.id === uid);

      if (!podcast || podcast.private === true) {
         document.body.innerHTML = "Nie znaleziono podcastu o ID: " + uid;
         document.title = window.location.href;
         return;
      }

      // 2. Obsługa natychmiastowego przekierowania
      if (podcast.url_immediately) {
         window.location.href = podcast.url_immediately;
         return;
      }

      // 3. Przygotowanie zmiennych pomocniczych
      const escapeHTML = (str) =>
         str ? String(str).replace(/[&<>"']/g, m => ({
            '&': '&',
            '<': '<',
            '>': '>',
            '"': '"',
            "'": "'"
         } [m])) : "";

      const occurrencesHostA = podcast.host || "---";

      const thumb = podcast.thumbnail_text;
      const style = thumb ? [
         thumb.background ? `background:${thumb.background}` : '',
         thumb.color ? `color:${thumb.color}` : ''
      ].filter(Boolean).join(';') : '';

      const name = (thumb && thumb.name) || podcast.name || "";
      const thumbnailDisplay = podcast.thumbnail_uri ?
         `<img decoding="async" src="${podcast.thumbnail_uri}" alt="${escapeHTML(podcast.name)}">` : "";

      const thumbnailText = thumb ? `<div class="podcast_info_name_box" style="${style}">${escapeHTML(name)}</div>` : thumbnailDisplay;

      const emailContact = (Array.isArray(podcast.email) && podcast.email.length > 0) ?
         podcast.email.map(t => `<a href="mailto:${t}">${escapeHTML(t)}</a>`).join(', ') :
         '';

      const podcastList = (podcast.podcast) ? `
          <audio controls="" id="player" style="display:none;margin-top:10px;margin-left:25px;"><source src=""></audio>
          <div class="podcast_list_episode">
              <h3>Lista odcinków podcastu:</h3>
              <div id="episode-list">Ładowanie odcinków...</div>
          </div>` : '';

      const socialConfig = [{
            key: 'url',
            icon: 'fa-solid fa-link'
         },
         {
            key: 'url_rss',
            icon: 'fa-solid fa-rss'
         },
         {
            key: 'url_podcast',
            icon: 'fa-solid fa-podcast'
         },
         {
            key: 'url_spreaker',
            icon: 'fa-solid fa-table-list'
         },
         {
            key: 'url_spotify',
            icon: 'fa-brands fa-spotify'
         },
         {
            key: 'url_kick',
            icon: 'fa-brands fa-kickstarter-k'
         },
         {
            key: 'url_twitch',
            icon: 'fa-brands fa-twitch'
         },
         {
            key: 'url_youtube',
            icon: 'fa-brands fa-youtube'
         },
         {
            key: 'url_facebook',
            icon: 'fa-brands fa-facebook'
         },
         {
            key: 'url_instagram',
            icon: 'fa-brands fa-instagram'
         },
         {
            key: 'url_tiktok',
            icon: 'fa-brands fa-tiktok'
         },
         {
            key: 'url_x',
            icon: 'fa-brands fa-x-twitter'
         },
         {
            key: 'url_soundcloud',
            icon: 'fa-brands fa-soundcloud'
         },
         {
            key: 'url_mixcloud',
            icon: 'fa-brands fa-mixcloud'
         }
      ];

      const socialUrlsHtml = socialConfig
         .filter(cfg => podcast[cfg.key])
         .map(cfg => `<a href="${podcast[cfg.key]}" target="_blank"><i class="${cfg.icon}"></i></a>`)
         .join('\n');

      // 4. Budowanie treści (Zmienione na document.documentElement.innerHTML)
      const fullHTML = `<!DOCTYPE html>
            <html lang="pl">
                <head>
                    <meta charset="UTF-8">
                    <meta name='robots' content='noindex, follow' />
                    <title>${escapeHTML(podcast.name)} | krdrt537000ym.github.io</title>
                    <script src="https://krdrt5370000ym.github.io/site-head.js"><\/script>
                </head>
                <body class="w3-light-grey">
                    <link rel="stylesheet" href="https://krdrt5370000ym.github.io/media/media.css">
                    <link rel="stylesheet" href="https://krdrt5370000ym.github.io/style.css">
                    <script src="https://krdrt5370000ym.github.io/site-topscreen.js"><\/script>
                    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"><\/script>
                    <div class="w3-main" style="margin-left:300px;margin-top:43px;">
                        <header class="w3-container" style="padding-top:22px">
                            <h5><b><i class="fa-solid fa-podcast"></i> Podcasty</b></h5>
                        </header>
                        <div class="w3-row-padding w3-margin-bottom">
                            <p class="podcast_info_title">${escapeHTML(podcast.name)}</p>
                            <div class="podcast_info_box">
                                <div class="podcast_info_cover">${thumbnailText}</div>
                                <div class="podcast_info_data">
                                    ${podcast.onair ? `<div class="podcast_info_airtime">${escapeHTML(podcast.onair)}</div>` : ""}
                                    ${podcast.label ? `<div class="podcast_info_producter">Wydawca: ${escapeHTML(podcast.label)}</div>` : ""}
                                    ${emailContact ? `<div class="podcast_info_email">E-mail: ${emailContact}</div>` : ""}
                                    <div class="podcast_info_djs"><small>Prowadzący:</small><br>${escapeHTML(occurrencesHostA)}</div>
                                </div>
                            </div>
                            <div class="podcast_info_desc">${podcast.description || "Brak opisu podcastu."}</div>
                            <div class="podcast_info_urls">${socialUrlsHtml}</div>
                            ${podcastList}
                        </div>
                        <script src="https://krdrt5370000ym.github.io/site-bottomscreen.js"><\/script>
                    </div>
                    <script src="https://krdrt5370000ym.github.io/site-sidebar.js"><\/script>
                    <script src="https://krdrt5370000ym.github.io/media/site-episode.js"><\/script>
                    <script src="https://krdrt5370000ym.github.io/media/site-audio.js"><\/script>
                    ${podcast.podcast ? `<script>${podcast.podcast}<\/script>` : ""}
                </body>
            </html>`;

      // Podmiana całej strony
      document.open();
      document.write(fullHTML);
      document.close();

   } catch (err) {
      console.error(err);
      document.body.innerHTML = "Błąd krytyczny: " + err.message;
   }
}
uruchomPodcast();
