let PODCASTS = [];

// =====================
// LOAD
// =====================

async function loadData(siteId) {
  const baseUrl = `https://krdrt5370000ym.github.io/media/json/${siteId}`;
  
  // Helper do bezpiecznego fetchowania
  const fetchJson = (suffix) => 
    fetch(`${baseUrl}_${suffix}.json`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);

  try {
    const [podcasts] = await Promise.all([
      fetchJson("podcasts")
    ]);

    // Przypisanie z fallbackiem na puste struktury
    PODCASTS = podcasts || {};

    console.log("Dane załadowane pomyślnie");
  } catch (error) {
    console.error("Błąd podczas ładowania danych:", error);
  }
}

// =====================
// PODCAST LIST
// =====================
function renderPodcasts(){
  const container = document.getElementById("podcast_list");
  const filter = document.getElementById("categoryFilter").value;
  const search = document.getElementById("searchInput").value.toLowerCase(); // Pobieramy frazę
  const escapeHTML = (str) => 
    str ? String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])) : "";

  container.innerHTML = "";

  PODCASTS
    .filter(p => !p.hide_in_podcast && !p.private && !p.archive && (!p.category_not_all || p.category))
    .filter(p => !filter || (p.category && p.category.includes(filter)))
    // NOWY FILTR: Wyszukiwarka tekstowa
    .filter(p => {
      const name = (p.name || "").toLowerCase();
      const host = (p.host || "").toLowerCase();
      return name.includes(search) || host.includes(search);
    })
    .sort((a, b) => {
      const sortA = a.sorted || "";
      const sortB = b.sorted || "";
      const result = sortA.toString().localeCompare(sortB.toString(), undefined, { numeric: true });
      return result !== 0 ? result : a.name.localeCompare(b.name);
    })
    .forEach(p => {
      const el = document.createElement("div");
      el.className = "podcast_list_content";
      
          const thumb = p.thumbnail_text;
          const style = thumb ? [
          thumb.background ? `background:${thumb.background}` : '',
          thumb.color ? `color:${thumb.color}` : ''
          ].filter(Boolean).join(';') : '';
          const name = (thumb && thumb.name) || p.name || "";
          const thumbnailDisplay = p.thumbnail_uri ? 
          `<img decoding="async" src="${p.thumbnail_uri}" alt="${escapeHTML(p.name)}">` : "";
          const thumbnailText = thumb ? `<div class="podcast_list_box" style="${style}">${name}</div>` : thumbnailDisplay;
      
        const podcastUrl = p.url_immediately 
            ? `<div class="podcast_list_name" style="cursor:pointer;"><a href="${p.url_immediately}" target="_blank">${p.name}</a></div>` 
            : `<div class="podcast_list_name" style="cursor:pointer;"><a href="javascript:void(0)" onclick="LoadPodcast('${p.id}')">${p.name}</a></div>`;

      el.innerHTML = `
        <div class="podcast_list_cover">${thumbnailText}</div>
        <div>
            ${podcastUrl}
            <div class="podcast_list_host">${p.only_the_schedule_hosts === true ? '' : p.host}</div>
        </div>
      `;

      container.appendChild(el);
    });
}

// =====================
// PODCAST PAGE
// =====================

function LoadPodcast(id) {
  // 1. Otwieramy okno natychmiast
  const win = window.open("", "_blank");

  if (!win) {
      alert("Zablokowano wyskakujące okienko.");
      return;
  }
  
  if (!id || typeof PODCASTS === 'undefined') {
      console.error("Brak ID lub tablicy PODCASTS");
      win.close();
      return;
  }

  // 2. Szukamy danych
  const podcast = PODCASTS.find(p => p.id === id);
  
  // Jeśli nie znajdzie podcastu, wpiszemy błąd do okna zamiast zostawiać białą stronę
  if (!podcast || podcast.private === true) {
      win.document.write("Nie znaleziono podcastu o ID: " + id);
      win.document.close();
      return;
  }

  if (podcast.url_immediately) {
    win.location.href = podcast.url_immediately; 
    return;
  }

  const escapeHTML = (str) => 
    str ? String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])) : "";
  
  // POPRAWKA: Definicja prowadzących (pobieramy z obiektu podcastu)
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
  
  const emailContact = (Array.isArray(podcast.email) && podcast.email.length > 0) 
    ? podcast.email.map(t => `<a href="mailto:${t}">${escapeHTML(t)}</a>`).join(', ') 
    : '';

  const podcastList = (podcast.podcast) ? `
    <audio controls="" id="player" style="display:none;margin-top:10px;margin-left:25px;"><source src=""></audio>
    <div class="podcast_list_episode">
        <h3>Lista odcinków podcastu:</h3>
        <div id="episode-list">Ładowanie odcinków...</div>
    </div>` : '';

  const socialConfig = [
    { key: 'url', icon: 'fa-link' },
    { key: 'url_rss', icon: 'fa-rss' },
    { key: 'url_podcast', icon: 'fa-podcast' },
    { key: 'url_spreaker', icon: 'fa-table-list' },
    { key: 'url_spotify', icon: 'fa-brands fa-spotify' },
    { key: 'url_kick', icon: 'fa-brands fa-kickstarter-k' },
    { key: 'url_twitch', icon: 'fa-brands fa-twitch' },
    { key: 'url_youtube', icon: 'fa-brands fa-youtube' },
    { key: 'url_facebook', icon: 'fa-brands fa-facebook' },
    { key: 'url_instagram', icon: 'fa-brands fa-instagram' },
    { key: 'url_tiktok', icon: 'fa-brands fa-tiktok' },
    { key: 'url_x', icon: 'fa-brands fa-x-twitter' },
    { key: 'url_soundcloud', icon: 'fa-brands fa-soundcloud' },
    { key: 'url_mixcloud', icon: 'fa-brands fa-mixcloud' }
  ];

  const socialUrlsHtml = socialConfig
    .filter(cfg => podcast[cfg.key])
    .map(cfg => `<a href="${podcast[cfg.key]}" target="_blank"><i class="${cfg.icon}"></i></a>`)
    .join('\n');

  const htmlContent = `
    <!DOCTYPE html>
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
            ${podcast.podcast ? `<script>${podcast.podcast}<\/script>` : ""}
        </body>
    </html>
    `;

    win.document.open();
    win.document.write(htmlContent);
    win.document.close();
}

// =====================
// INIT
// =====================
function init() {
  renderPodcasts();
  document.getElementById("categoryFilter").onchange = renderPodcasts;
}
