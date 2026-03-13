async function getNowPlayingGrupaZPR(stationId) {
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

            container.innerHTML = `${artists} - ${track.name}`;
        }
    } catch (error) {
        container.innerHTML = "";
    }
}
// setInterval(() => getNowPlaying(3990), 20000);

async function getCurrentProgramZPR(siteUid, stationUid = "") {
    const baseUrl = "https://front-api.grupazprmedia.pl/radios/v1/current_program/";
    const url = stationUid ? `${baseUrl}${siteUid}/${stationUid}/` : `${baseUrl}${siteUid}/`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Zakładamy, że interesuje nas pierwszy element z listy
        const program = data; 
        renderProgramZPR(program);
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
        document.getElementById('program-preview').innerHTML = "Błąd ładowania danych.";
    }
}

function renderProgramZPR(program) {
    const container = document.getElementById('program-preview');
    
    if (!program) {
        container.innerHTML = "Brak informacji o programie.";
        return;
    }

    container.innerHTML = `
        <img src="${program.thumbnail_uri}" alt="${program.name}">
        <div class="time">${program.hour_start} - ${program.hour_end}</div>
        <div class="title">${program.name}</div>
        <div class="host">${program.host || 'Brak prowadzącego'}</div>
    `;
}
// Przykład użycia:
// getCurrentProgram('sc-giFX-r6Hu-5naE', 'ra-4DgR-BbKY-FG3Z');
