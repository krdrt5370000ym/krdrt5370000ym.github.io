// Funkcja zamieniająca "FIELDS OF GOLD" na "Fields Of Gold"
function formatToTitleCase(str) {
  if (!str) return "";
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

async function getNowPlayingGrupaZPR(stationId) {
    const container = document.getElementById('container');
    const url = `https://front-api.grupazprmedia.pl/music/v1/now_playing/${stationId}/`;
    const STREAM_DELAY_MS = 20000; // Standardowe opóźnienie ~20s dla ZPR

    try {
        const response = await fetch(url);
        const data = await response.json(); 
        
        // Czas z uwzględnieniem opóźnienia streamu
        const adjustedNow = new Date(Date.now() - STREAM_DELAY_MS);

        // Logika z player_teaser.min.js:
        // 1. Szukamy utworu, gdzie adjustedNow mieści się między start a end.
        let track = data.find(t => {
            const start = new Date(t.start_time);
            const end = t.end_time ? new Date(t.end_time) : null;
            return end && start < adjustedNow && adjustedNow < end;
        });

        // 2. Jeśli nie znaleziono (np. reklama), bierzemy ostatni utwór bez end_time.
        if (!track) {
            track = data.filter(t => !t.end_time).pop();
        }

        if (track) {
            const artists = Array.isArray(track.artists) ? track.artists.join(', ') : track.artists;
            container.innerHTML = `${artists} - ${track.name}`;
        }
    } catch (error) {
        container.innerHTML = "";
        console.error("Błąd pobierania:", error);
    }
}
// setInterval(() => getNowPlayingGrupaZPR(3990), 20000);

async function getCurrentProgramGrupaZPR(siteUid, stationUid = "") {
    const baseUrl = "https://front-api.grupazprmedia.pl/radios/v1/current_program/";
    const url = stationUid ? `${baseUrl}${siteUid}/${stationUid}/` : `${baseUrl}${siteUid}/`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Zakładamy, że interesuje nas pierwszy element z listy
        const program = data; 
        renderProgramGrupaZPR(program);
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
        document.getElementById('program-preview').innerHTML = "Błąd ładowania danych.";
    }
}

function renderProgramGrupaZPR(program) {
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

async function getNowPlayingEurozet(stationid) {
  const url = 'https://rds.eurozet.pl/reader/var/' + id + '.json';
  try {
    const container = document.getElementById('container');
    const response = await fetch(url);
    const text = await response.text();
    
    const jsonString = text.replace(/^rdsData\(|\)$/g, '');
    const data = JSON.parse(jsonString);

    const artist = formatToTitleCase(data.now.artist);
    const title = formatToTitleCase(data.now.title);

    container.innerHTML = `${artist} - ${title}`;
    
  } catch (error) {
    console.error('Błąd pobierania danych:', error);
    container.innerHTML = "";
  }
}
