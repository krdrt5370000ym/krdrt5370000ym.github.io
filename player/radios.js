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
            list.push({ name, url: line });
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
    
    const sm = st.url.slice(0,7) === "http://" ?
     'https://tiny-pond-4c8d.krdrt5370000ym2.workers.dev/?url=' +
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
        playlistNowPlaying(st.url);
    } else {
        player.src = sm;
        playlistNowPlaying(st.url);
    }

    player.style.display = "block";
    player.play().catch(()=>{});

    closeMenu();
}

/* RELOAD */
reloadBtn.onclick = () => {
    if (currentStation) play(currentStation, currentElement);
};

/* FORCE PHYSICAL FILE IN /DOWNLOAD */
downloadBtn.onclick = async () => {
    const fileName = `${currentPlaylist}.m3u`;
    const fileUrl = `https://krdrt5370000ym.github.io/player/${fileName}`;

    try {
        const response = await fetch(fileUrl);
        const text = await response.text();
        
        // Używamy 'application/octet-stream' zamiast audio/x-mpegurl
        // To zmusza Androida do pobrania pliku jako "nieznane dane binarne"
        const blob = new Blob([text], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        
        // Ważne: Opóźnienie czyszczenia, aby system zdążył zapisać plik w /Download
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 3000);
    } catch (err) {
        window.location.href = fileUrl;
    }
};

function playlistNowPlaying(streamUrl) {
    if (playlistInterval) {
        clearInterval(playlistInterval);
    }
    const updateTrack = () => {
        fetch("https://krdrt5370000ym.github.io/player/playlist.json")
            .then(res => res.json())
            .then(json => {
                const item = json.playlist.find(x => x.stream === streamUrl);
                
                if (item && item.value) {
                    // Sprawdzamy, czy value zawiera nawiasy (np. "getNowPlayingOpenFm(57)")
                    const match = item.value.match(/^(\w+)\((.*)\)$/);
                    
                    if (match) {
                        const functionName = match[1]; // np. "getNowPlayingOpenFm"
                        const argument = match[2].replace(/['"]/g, ""); // np. "57"

                        if (typeof window[functionName] === "function") {
                            // Wywołujemy funkcję z przekazanym argumentem
                            window[functionName](argument);
                        }
                    } else {
                        // Jeśli to zwykły tekst bez nawiasów
                        document.getElementById('resultTrack').innerText = item.value;
                   }
                }
            })
            .catch(err => console.error("Błąd pobierania metadanych:", err));
    };
    updateTrack();
    playlistInterval = setInterval(updateTrack, 20000); 
}

/* START */
fetchPlaylist(currentPlaylist);
