const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuBtn = document.getElementById('menuBtn');
const playlistSelect = document.getElementById('playlistSelect');
const stationSearch = document.getElementById('stationSearch');
const container = document.getElementById('playlist-container');
const player = document.getElementById('player');
const currentStationText = document.getElementById('currentStation');
const reloadBtn = document.getElementById('reloadBtn');
const downloadBtn = document.getElementById('downloadBtn');

let currentPlaylist = "Radio";
let currentStation = null;
let currentElement = null;
let playlistInterval = null;
let hls = null;

/* MENU */
menuBtn.onclick = () => {
   sidebar.classList.add("active");
   overlay.classList.add("active");
};

overlay.onclick = closeMenu;

function closeMenu() {
   sidebar.classList.remove("active");
   overlay.classList.remove("active");
}

/* PLAYLIST CHANGE */
playlistSelect.onchange = e => {
   currentPlaylist = e.target.value;
   fetchPlaylist(currentPlaylist);
};

/* SEARCH */
stationSearch.oninput = () => {
   const val = stationSearch.value.toLowerCase();
   document.querySelectorAll('.station-item').forEach(el => {
      el.style.display = el.textContent.toLowerCase().includes(val) ? "" : "none";
   });
};

/* FETCH */
async function fetchPlaylist(name) {
   try {
      const res = await fetch(`https://krdrt5370000ym.github.io/player/${name}.m3u`);
      if (!res.ok) throw new Error();

      const text = await res.text();
      display(parseM3U(text));
   } catch (e) {
      alert("Błąd ładowania playlisty");
   }
}

/* PARSE */
function parseM3U(data) {
   const lines = data.split('\n');
   let name = "";
   const list = [];

   for (let line of lines) {
      line = line.trim();

      if (line.startsWith("#EXTINF")) {
         name = line.split(',').slice(1).join(',') || "Nieznana";
      } else if (line.startsWith("http")) {
         list.push({
            name,
            url: line
         });
      }
   }

   return list;
}

/* DISPLAY */
function display(list) {
   container.innerHTML = "";

   list.forEach(st => {
      const div = document.createElement('div');
      div.className = "station-item";
      div.textContent = st.name;

      div.onclick = () => play(st, div);

      container.appendChild(div);
   });
}

/* PLAY */
function play(st, el) {
   currentStation = st;
   currentElement = el;

   document.querySelectorAll('.station-item').forEach(x => x.classList.remove('active'));
   el.classList.add('active');

   const sm = st.url.slice(0, 7) === "http://" ?
      'https://cors.krdrt5370000ym2.workers.dev/?url=' +
      encodeURIComponent(st.url) : st.url;

   currentStationText.textContent = "Teraz grasz: " + st.name;

   if (hls) {
      hls.destroy();
      hls = null;
   }

   if (sm.includes(".m3u8") && window.Hls && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(sm);
      hls.attachMedia(player);
      siteRadio(st.url);
      playlistNowPlaying(st.url);
   } else {
      player.src = sm;
      siteRadio(st.url);
      playlistNowPlaying(st.url);
   }

   player.style.display = "block";
   player.play().catch(() => {});

   closeMenu();
}

/* RELOAD */
reloadBtn.onclick = () => {
   if (currentStation) play(currentStation, currentElement);
};

/* DOWNLOAD */
// Android czasami automatycznie kategoryzuje pliki .m3u (playlisty) jako pliki muzyczne i przenosi je do folderu Music zamiast Download.
downloadBtn.onclick = () => {
   const fileName = `${currentPlaylist}.m3u`;
   const fileUrl = `https://krdrt5370000ym.github.io/player/${fileName}`;

   const link = document.createElement('a');
   link.href = fileUrl;
   link.download = fileName; // Wymusza pobieranie pliku
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
};

function siteRadio(streamUrl) {
    const resultSite = document.getElementById('resultSite');

    fetch("https://krdrt5370000ym.github.io/player/site.json")
        .then(res => res.json())
        .then(json => {
            // Zmiana na json.site zgodnie z Twoją sugestią
            const item = json.site.find(x => x.stream === streamUrl);

            if (item && item.value) {
                resultSite.innerHTML = `<a href="${item.value}" target="_blank">Przejdź na witrynę</a>`;
            } else {
                resultSite.innerHTML = "";
            }
        })
        .catch(err => {
            console.error("Błąd:", err);
            resultSite.innerHTML = "";
        });
}

function playlistNowPlaying(streamUrl) {
   if (playlistInterval) {
      clearInterval(playlistInterval);
   }

   const updateTrack = () => {
      fetch("https://krdrt5370000ym.github.io/player/playlist.json")
         .then(res => res.json())
         .then(json => {
            const item = json.playlist.find(x => x.stream === streamUrl);
            const resultTrackEl = document.getElementById('resultTrack');

            // Sprawdzamy czy znaleziono strumień i czy ma przypisaną wartość
            if (item && item.value) {
               const match = item.value.match(/^(\w+)\((.*)\)$/);

               if (match) {
                  const functionName = match[1];
                  const argument = match[2].replace(/['"]/g, "");

                  if (typeof window[functionName] === "function") {
                     window[functionName](argument);
                  }
               } else {
                  resultTrackEl.innerText = item.value;
               }
            } else {
               // WARTOŚĆ DOMYŚLNA: Brak danych o utworze w JSON lub brak strumienia
               resultTrackEl.innerText = ""; // Brak informacji o utworze
            }
         })
         .catch(err => {
            console.error("Błąd pobierania metadanych:", err);
            // Wyświetlenie błędu użytkownikowi (opcjonalnie)
            document.getElementById('resultTrack').innerText = ""; // Nie udało się pobrać tytułu
         });
   };

   updateTrack();
   playlistInterval = setInterval(updateTrack, 20000);
}

/* START */
const params = new URLSearchParams(window.location.search);
const playlistParam = params.get('r');

if (playlistParam) {
   currentPlaylist = playlistParam;
   // Aktualizacja wizualna selecta, jeśli istnieje taka opcja
   if (playlistSelect) playlistSelect.value = playlistParam;
}
fetchPlaylist(currentPlaylist);
