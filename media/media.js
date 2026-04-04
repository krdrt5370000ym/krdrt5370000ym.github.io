document.querySelectorAll('.has-submenu > a').forEach(menuItem => {
  menuItem.addEventListener('click', function(e) {
    // Jeśli jesteśmy na mobile (szerokość okna < 768px)
    if (window.innerWidth <= 768) {
      e.preventDefault(); // Blokuje przejście do linku przy pierwszym kliknięciu
      const parent = this.parentElement;
      
      // Przełącza klasę .open (otwiera/zamyka)
      parent.classList.toggle('open');
      
      // Opcjonalnie: zamyka inne otwarte submenu
      document.querySelectorAll('.has-submenu').forEach(other => {
        if (other !== parent) other.classList.remove('open');
      });
    }
  });
});

let PODCASTS = [];

// =====================
// LOAD
// =====================

async function loadData(siteId) {
  const [podcasts] = await Promise.all([
    fetch("https://krdrt5370000ym.github.io/media/json/" + siteId + "_podcasts.json").then(r=>r.json())
  ]);

  PODCASTS = podcasts;
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
            : `<div class="podcast_list_name" onclick="LoadPodcast('${p.id}')" style="cursor:pointer;">${p.name}</div>`;

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
  if (id === null) return;

  const podcast = PODCASTS.find(p => p.id === id);
  if (!podcast || podcast.url_immediately || podcast.private === true) return;

  const escapeHTML = (str) => 
    str ? String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])) : "";
  
  const thumb = podcast.thumbnail_text;
  const style = thumb ? [
  thumb.background ? `background:${thumb.background}` : '',
  thumb.color ? `color:${thumb.color}` : ''
  ].filter(Boolean).join(';') : '';
  const name = (thumb && thumb.name) || podcast.name || "";
  const thumbnailDisplay = podcast.thumbnail_uri ? 
  `<img decoding="async" src="${podcast.thumbnail_uri}" alt="${escapeHTML(podcast.name)}">` : "";
  const thumbnailText = thumb ? `<div class="podcast_info_name_box" style="${style}">${name}</div>` : thumbnailDisplay;
  const emailContact = (podcast.email && podcast.email.length > 0) 
  ? podcast.email.map(t => `<a href="mailto:${t}">${t}</a>`).join(', ') 
  : '';
  const podcastList = (podcast.podcast) ? `<audio controls="" id="player" style="display:none;margin-top:10px;margin-left:25px;"><source src=""></audio>
      <div class="podcast_list_episode">
          <h3>Lista odcinków podcastu:</h3>
          <div id="episode-list">Ładowanie odcinków...</div>
      </div>` : '';

  // 1. Tworzymy treść HTML jako string
  const htmlContent = `
    <!DOCTYPE html>
    <html>
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
            <!-- Header -->
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
                            ${podcast.email ? `<div class="podcast_info_email">E-mail: ${emailContact}</div>` : ""}
                            Prowadzący: <div class="podcast_info_djs">${escapeHTML(podcast.host) || "---"}</div>
                            </div>
                        </div>
                    <div class="podcast_info_desc">${podcast.description || "Brak opisu podcastu."}</div>
                    <div class="podcast_info_urls">
                        ${podcast.url ? `<a href="${podcast.url}"><i class="fa-solid fa-link"></i></a>` : ""}
                        ${podcast.url_rss ? `<a href="${podcast.url_rss}"><i class="fa-solid fa-rss"></i></a>` : ""}
                        ${podcast.url_podcast ? `<a href="${podcast.url_podcast}"><i class="fa-solid fa-podcast"></i></a>` : ""}
                        ${podcast.url_spreaker ? `<a href="${podcast.url_spreaker}"><i class="fa-solid fa-table-list"></i></a>` : ""}
                        ${podcast.url_spotify ? `<a href="${podcast.url_spotify}"><i class="fa-brands fa-spotify"></i></a>` : ""}
                        ${podcast.url_kick ? `<a href="${podcast.url_kick}"><i class="fa-brands fa-kickstarter-k"></i></a>` : ""}
                        ${podcast.url_twitch ? `<a href="${podcast.url_twitch}"><i class="fa-brands fa-twitch"></i></a>` : ""}
                        ${podcast.url_youtube ? `<a href="${podcast.url_youtube}"><i class="fa-brands fa-youtube"></i></a>` : ""}
                        ${podcast.url_facebook ? `<a href="${podcast.url_facebook}"><i class="fa-brands fa-facebook"></i></a>` : ""}
                        ${podcast.url_instagram ? `<a href="${podcast.url_instagram}"><i class="fa-brands fa-instagram"></i></a>` : ""}
                        ${podcast.url_tiktok ? `<a href="${podcast.url_tiktok}"><i class="fa-brands fa-tiktok"></i></a>` : ""}
                        ${podcast.url_x ? `<a href="${podcast.url_x}"><i class="fa-brands fa-x-twitter"></i></a>` : ""}
                        ${podcast.url_soundcloud ? `<a href="${podcast.url_soundcloud}"><i class="fa-brands fa-soundcloud"></i></a>` : ""}
                        ${podcast.url_mixcloud ? `<a href="${podcast.url_mixcloud}"><i class="fa-brands fa-mixcloud"></i></a>` : ""}
                    </div>
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

  // 2. Tworzymy Blob i generujemy URL
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const blobURL = URL.createObjectURL(blob);

  // 3. Otwieramy nowe okno z adresem Bloba
  const win = window.open(blobURL, "_blank");

  if (!win) {
    alert("Zablokowano wyskakujące okno!");
    URL.revokeObjectURL(blobURL); // Sprzątamy, jeśli się nie udało
    return;
  }
}

// =====================
// INIT
// =====================
function init() {
  renderPodcasts();
  document.getElementById("categoryFilter").onchange = renderPodcasts;
}
