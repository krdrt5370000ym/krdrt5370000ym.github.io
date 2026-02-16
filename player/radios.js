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

    function playStation(station, element) {
        const player = document.getElementById('player');
        const title = document.getElementById('current-station');
        
        // Aktualizacja UI
        document.querySelectorAll('.station-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
        
        title.innerText = "Teraz grasz: " + station.name;
        player.src = station.url.replace(/^http:\/\//, "");
        player.play();
        player.style='display:initial;';
        document.getElementById('buttons').style='display:initial;';
    }
