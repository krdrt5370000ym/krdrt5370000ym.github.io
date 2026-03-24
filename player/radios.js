    async function fetchPlaylist(name) {
        const url = "https://krdrt5370000ym.github.io/player/" + name + ".m3u";
        try {
            const response = await fetch(url);
            const text = await response.text();
            const playlist = parseM3U(text);
            displayPlaylist(playlist);
        } catch (err) {
            alert("Błąd ładowania listy. Upewnij się, że link jest poprawny i serwer pozwala na CORS.");
        }
    }

    function parseM3U(data) {
        const lines = data.split('\n');
        const stations = [];
        let currentName = "";

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#EXTINF:')) {
                // Wyciąganie nazwy stacji po przecinku
                currentName = line.split('-1,').pop() || "Nieznana stacja";
            } else if (line.startsWith('http')) {
                stations.push({ name: currentName || "Stacja " + (stations.length + 1), url: line });
                currentName = ""; // Reset dla kolejnej stacji
            }
        }
        return stations;
    }

    function displayPlaylist(stations) {
        const container = document.getElementById('playlist-container');
        container.innerHTML = "";
        stations.forEach(station => {
            const div = document.createElement('div');
            div.className = 'station-item';
            div.innerText = station.name;
            div.onclick = () => playStation(station, div);
            container.appendChild(div);
        });
    }

    let hlsInstance = null; // Używamy jednej spójnej zmiennej
    let currentStationData = null; // Przechowujemy dane aktualnej stacji
    let currentStationElement = null; // Przechowujemy referencję do elementu listy

    function playStation(station, element) {
        const player = document.getElementById('player');
        const title = document.getElementById('current-station');
        
        // Zapisujemy aktualny stan dla funkcji reload
        currentStationData = station;
        currentStationElement = element;
    
        const streamUrl = station.url;
        const isM3U8 = streamUrl.toLowerCase().includes('.m3u8');
    
        // UI: Aktualizacja klasy active
        document.querySelectorAll('.station-item').forEach(el => el.classList.remove('active'));
        if (element) element.classList.add('active');
        title.innerText = "Teraz grasz: " + station.name;
    
        // Czyszczenie poprzedniej instancji HLS
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    
        if (isM3U8 && typeof Hls !== 'undefined' && Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(player);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => player.play());
        } else {
            // Natywna obsługa (Safari/iOS lub MP3)
            player.src = streamUrl;
            player.play().catch(err => console.error("Błąd odtwarzania:", err));
        }
    
        player.style.display = 'initial';
        document.getElementById('buttons').style.display = 'initial';
        resultTrack = '';
        playlistNowPlaying(streamUrl);
    }
    
    function reloadStation() {
        if (currentStationData) {
            console.log("Przeładowuję:", currentStationData.name);
            // Ponownie wywołujemy playStation z zapisanymi danymi
            playStation(currentStationData, currentStationElement);
        } else {
            console.warn("Brak wybranej stacji do przeładowania.");
        }
    }

    function playlistNowPlaying(streamId) {
        fetch("https://krdrt5370000ym.github.io/player/playlist.json")
            .then(res => res.json())
            .then(json => {
                const item = json.playlist.find(x => x.stream === streamId);
                if (item) {
                    eval(item.value);
                }
            })
        .catch(err => console.error(err));
    }
