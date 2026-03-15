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

    let hls; // Globalna instancja, aby móc ją poprawnie niszczyć

    function playStation(station, element) {
        const player = document.getElementById('player');
        const title = document.getElementById('current-station');
        
        // 1. Poprawione odniesienie do URL (station.url zamiast url)
        const streamUrl = station.url;
        const isM3U8 = streamUrl.toLowerCase().includes('.m3u8');
        const mimeType = isM3U8 ? 'application/vnd.apple.mpegurl' : '';
    
        // Aktualizacja UI
        document.querySelectorAll('.station-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
        title.innerText = "Teraz grasz: " + station.name;
    
        // 2. Obsługa HLS.js
        if (isM3U8 && typeof Hls !== 'undefined' && Hls.isSupported()) {
            // Jeśli hls był już zainicjalizowany, warto go zniszczyć przed nowym źródłem
            if (window.hlsInstance) window.hlsInstance.destroy();
            
            const hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(player);
            hls.on(Hls.Events.MANIFEST_PARSED, () => player.play());
            window.hlsInstance = hls; // Zapamiętujemy instancję
        } 
        // 3. Natywna obsługa (Safari/iOS lub standardowe MP3)
        else if (player.canPlayType(mimeType) || !isM3U8) {
            if (window.hlsInstance) {
                window.hlsInstance.destroy();
                window.hlsInstance = null;
            }
            player.src = streamUrl;
            player.play().catch(err => console.error("Błąd autoodtwarzania:", err));
        }
    
        // Pokaż kontrolki
        player.style.display = 'initial';
        document.getElementById('buttons').style.display = 'initial';
    }

    function reloadStation() {
        const audio = document.getElementById('player');
        // Pobieramy aktualny URL (z HLS lub bezpośrednio z audio.src)
        const currentUrl = hls ? hls.url : audio.src;
        
        if (currentUrl) {
            console.log("Przeładowuję strumień...");
            playStation(currentUrl,"");
        }
    }
