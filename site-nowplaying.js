async function getNowPlaying(stationId) {
    const container = document.getElementById('container');
    const url = `https://front-api.grupazprmedia.pl/music/v1/now_playing/${stationId}/`;

    try {
        const response = await fetch(url);
        const data = await response.json(); // To jest tablica utworów
        
        const teraz = new Date();

        // FILTR: Szukamy utworu, który już się zaczął (start_time <= teraz)
        // Sortujemy od najnowszego, żeby pierwszy na liście był tym aktualnym
        const aktualneUtwory = data
            .filter(t => new Date(t.start_time) <= teraz)
            .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

        const track = aktualneUtwory[0]; // To jest utwór, który TERAZ gra

        if (track) {
            const artists = Array.isArray(track.artists) ? track.artists.join(' ') : track.artists;
            const startTime = new Date(track.start_time).toLocaleTimeString('pl-PL', {
                hour: '2-digit', 
                minute: '2-digit'
            });

            container.innerHTML = `
                <div style="font-weight: bold; font-size: 1.2em;">${artists} - ${track.name}</div>
                <div style="color: #d32f2f;">Rozpoczęto: ${startTime}</div>
            `;
            console.log("Gramy teraz:", artists, "-", track.name);
        }
    } catch (error) {
        container.innerHTML = "Błąd synchronizacji czasu...";
    }
}
// setInterval(() => getNowPlaying(3990), 20000);
