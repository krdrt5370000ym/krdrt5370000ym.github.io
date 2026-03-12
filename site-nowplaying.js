async function getNowPlaying(stationId) {
    const url = `https://front-api.grupazprmedia.pl/music/v1/now_playing/${stationId}/`;
    const container = document.getElementById('container');

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const now = new Date();

        // Szukamy utworu, który aktualnie trwa (teraz jest między start a end)
        // Jeśli nie znajdzie, bierze pierwszy z brzegu (data[0])
        const track = data.find(t => {
            const start = new Date(t.start_time);
            const end = new Date(t.end_time);
            return now >= start && now <= end;
        }) || data[0]; 

        if (track) {
            const artists = Array.isArray(track.artists) ? track.artists.join(' ') : track.artists;
            
            // Wyświetlamy dane
            container.innerHTML = `
                <div class="song">${artists} - ${track.name}</div>
                <div class="time">Gramy od: ${new Date(track.start_time).toLocaleTimeString('pl-PL')}</div>
            `;
            
            console.log("Aktualny utwór:", artists, "-", track.name);
        }
    } catch (e) {
        container.innerHTML = "Błąd synchronizacji...";
    }
}

// setInterval(() => getNowPlaying(3990), 20000);
