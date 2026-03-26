    let playlistInterval = null; // Zmienna globalna do przechowywania ID interwału
    let currentPlaylistName = "Radio"; // Domyślna nazwa listy

    async function fetchPlaylist(name) {
        window.currentPlaylistName = name; // Zapamiętuje nazwę dla funkcji pobierania
        const url = "https://krdrt5370000ym.github.io/player/" + name + ".m3u";
        // ... reszta kodu fetch
        try {
            const response = await fetch(url);
            const text = await response.text();
            const playlist = parseM3U(text);
            displayPlaylist(playlist);
        } catch (err) {
            alert("Błąd ładowania listy. Upewnij się, że link jest poprawny i serwer pozwala na CORS.");
        }
    }

    function downloadToM3U() {
        // Tworzymy pełny adres URL do pliku .m3u
        const fileUrl = "https://krdrt5370000ym.github.io/player/" + currentPlaylistName + ".m3u";
        
        // Tworzymy tymczasowy element <a>, aby wymusić pobieranie
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = currentPlaylistName + ".m3u"; // Sugerowana nazwa pliku
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function parseM3U(data) {
        const lines = data.split('\n');
        const stations = [];
        let currentName = "";
    
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('#EXTINF:')) {
                // Szukamy pierwszego przecinka po "#EXTINF:-1"
                // Używamy split(',', 2), aby podzielić linię tylko na dwie części: 
                // 1. Metadane techniczne (#EXTINF:-1)
                // 2. Cała reszta (Nazwa stacji z jej własnymi przecinkami)
                const parts = line.split(',');
                if (parts.length > 1) {
                    // Usuwamy pierwszy element (metadane) i łączymy resztę z powrotem, 
                    // na wypadek gdyby nazwa stacji miała własne przecinki
                    parts.shift(); 
                    currentName = parts.join(',').trim();
                } else {
                    currentName = "Nieznana stacja";
                }
            } else if (line.startsWith('http')) {
                stations.push({ 
                    name: currentName || "Stacja " + (stations.length + 1), 
                    url: line 
                });
                currentName = ""; 
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
        const streamHttpUrl = streamUrl.slice(0,7) === "http://" ? 'https://tiny-pond-4c8d.krdrt5370000ym2.workers.dev/?url=' + encodeURIComponent(streamUrl) : streamUrl;
    
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
            hlsInstance.loadSource(streamHttpUrl);
            hlsInstance.attachMedia(player);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => player.play());
        } else {
            // Natywna obsługa (Safari/iOS lub MP3)
            
            player.src = streamHttpUrl;
            document.getElementById('resultTrack').innerHTML = '';
            player.play().catch(err => console.error("Błąd odtwarzania:", err));
        }
    
        player.style.display = 'initial';
        document.getElementById('buttons').style.display = 'initial';
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
        // 1. Zatrzymaj poprzedni interwał, jeśli istnieje
        if (playlistInterval) {
            clearInterval(playlistInterval);
        }
    
        fetch("https://krdrt5370000ym.github.io/player/playlist.json")
            .then(res => res.json())
            .then(json => {
                try {
                    const item = json.playlist.find(x => x.stream === streamId);
                    
                    if (item && item.value) {
                        // Funkcja pomocnicza do odświeżania danych
                        const updateTrack = () => {
                            try {
                                // UWAGA: eval() jest ryzykowny. Lepiej zamienić to na konkretną logikę.
                                eval(item.value); 
                            } catch (e) {
                                console.error("Błąd wewnątrz interwału:", e);
                            }
                        };
    
                        // 2. Wykonaj od razu i ustaw nowy interwał
                        updateTrack();
                        playlistInterval = setInterval(updateTrack, 20000); 
    
                    } else {
                        document.getElementById('resultTrack').innerHTML = '';
                    }
                } catch (err) {
                    console.error("Błąd podczas przetwarzania danych:", err);
                    document.getElementById('resultTrack').innerHTML = '';
                }
            })
            .catch(err => console.error("Błąd pobierania danych:", err));
    }
