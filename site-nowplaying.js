// Funkcja zamieniająca "FIELDS OF GOLD" na "Fields Of Gold"
function formatToTitleCase(str) {
  if (!str) return "";
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

async function getNowPlayingGrupaZPR(stationId) {
    const container = document.getElementById('resultTrack');
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
            container.innerHTML = `<small>Teraz gramy:</small><br>${artists} - ${track.name}`;
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
        // document.getElementById('program-preview').innerHTML = "Błąd ładowania danych.";
    }
}

function renderProgramGrupaZPR(program) {
    const container = document.getElementById('program-preview');
    
    // if (!program) {
    //     container.innerHTML = "Brak informacji o programie.";
    //     return;
    // }

    if (program.thumbnail_uri !== null) {
        imageDisplay = `<img decoding="async" src="${program.thumbnail_uri}" alt="${program.name}">`;
    } else {
        imageDisplay = '';
    }

    container.innerHTML = `
        <li class="schedule_onair">
        <div class="schedule_cover">${imageDisplay}</div>
        <div class="schedule_content">
        <div class="schedule_item"></div><div class="schedule_hour">${program.hour_start} - ${program.hour_end}</div>
        <div class="schedule_title">${program.name}</div>
        <div class="schedule_author">${program.host}</div>
        </div></li>
    `;
}
// Przykład użycia:
// getCurrentProgram('sc-giFX-r6Hu-5naE', 'ra-4DgR-BbKY-FG3Z');

async function getNowPlayingEurozet(stationId) {
  const url = 'https://rds.eurozet.pl/reader/var/' + stationId + '.json';
  try {
    const container = document.getElementById('resultTrack');
    const response = await fetch(url);
    const text = await response.text();
    
    const jsonString = text.replace(/^rdsData\(|\)$/g, '');
    const data = JSON.parse(jsonString);

    const artist = formatToTitleCase(data.now.artist);
    const title = formatToTitleCase(data.now.title);

    container.innerHTML = `<small>Teraz gramy:</small><br>${artist} - ${title}`;
    
  } catch (error) {
    console.error('Błąd pobierania danych:', error);
    container.innerHTML = "";
  }
}

async function getNowPlayingAgora(stationId) {
  const url = `https://fm.tuba.pl/api3/onStation?limit=1&format=json&id=${stationId}`;
  const container = document.getElementById('resultTrack');

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Sprawdzamy czy onStation to tablica, czy pojedynczy obiekt
    let track = null;
    if (Array.isArray(data) && data.length > 0) {
      track = data[0];
    } else if (data && typeof data === 'object') {
      track = data;
    }

    if (track && track.artist_name && track.song_title) {
      container.innerHTML = `<small>Teraz gramy:</small><br>${track.artist_name} - ${track.song_title}`;
    } else {
      container.innerHTML = ''; // Aktualnie brak informacji o utworze
    }
    
  } catch (error) {
    console.error('Błąd:', error);
    container.innerHTML = ''; // Błąd połączenia
  }
}

async function getNowPlayingGrupaRMF(stationId) {
    const proxyUrl = 'https://cors-anywhere.com/';
    const url = 'https://api.rmfon.pl/stations/' + stationId + '/playlist';
    const container = document.getElementById('resultTrack');

    try {
        const odpowiedz = await fetch(proxyUrl + url);
        if (!odpowiedz.ok) throw new Error('Błąd połączenia z API');

        const dane = await odpowiedz.json();

        // Znajdujemy utwór z "order": 0 (aktualnie grany)
        const utwor = dane.find(item => item.order === 0);

        if (utwor) {
            const tekst = `${utwor.author} - ${utwor.title}`;
            container.innerHTML = `<small>Teraz gramy:</small><br>${tekst}`; // Aktualnie w RMF FM
            
            // Jeśli masz w HTML element <div id="radio"></div>, odkomentuj linię poniżej:
            // document.getElementById('radio').innerText = tekst;
        }
    } catch (blad) {
        console.error('Wystąpił błąd:', blad);
        container.innerHTML = '';
    }
}

async function getNowPlayingRadio(stationId) {
  const proxyUrl = 'https://cors-anywhere.com/';
  const targetUrl = 'https://api.radio.de/stations/now-playing?stationIds=' + stationId;
  const container = document.getElementById('resultTrack');
  
  fetch(proxyUrl + targetUrl)
    .then(response => response.json())
    .then(data => {
      // Zakładając typową strukturę odpowiedzi radio.de
      const currentTrack = data[0]?.title || '';
          container.innerText = `<small>Teraz gramy:</small><br>${currentTrack}`;
      // Wyświetlenie na stronie:
      // document.getElementById('song-title').innerText = currentTrack;
    })
    .catch(error => {
        console.error('Błąd pobierania:', error);
        container.innerText = "";
    });
}

async function getNowPlayingPlaylist(stationId) {
  const proxyUrl = 'https://cors-anywhere.com/';
  const targetUrl = 'https://www.odsluchane.eu/szukaj.php?r=' + stationId;
  // Poprawiony XPath (uproszczony dla lepszej stabilności)
  const xpath = "//div/div[5]/div/table/tbody/tr[position()=last()]/td[2]/a/text()";
  const container = document.getElementById('resultTrack');
      try {
          const response = await fetch(proxyUrl + targetUrl, {
              headers: { 'X-Requested-With': 'XMLHttpRequest' }
          });
  
          if (!response.ok) {
              console.error(`Błąd HTTP: ${response.status}`);
              return;
          }
  
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
  
          const result = doc.evaluate(xpath, doc, null, XPathResult.STRING_TYPE, null);
          const songTitle = result.stringValue.trim();
  
          if (songTitle) {
              container.innerText = `<small>Teraz gramy:</small><br>${songTitle}`; // Ostatnio grany utwór:
          } else {
              console.warn('Nie znaleziono utworu. Sprawdź, czy struktura strony się nie zmieniła.');
              container.innerText = '';
          }
          
      } catch (error) {
          console.error('Błąd połączenia (sieć/CORS):', error);
          container.innerText = '';
      }
}

async function getNowPlayingOpenFm(stationId) {
    const container = document.getElementById('resultTrack');
    // Używamy proxy, aby uniknąć błędów CORS w przeglądarce
    const apiUrl = 'https://open.fm/api/radio/playlist';

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Dostęp do stacji za pomocą stationId jako klucza obiektu
        const station = data[stationId];
        
        // Pobieramy informację z pola 'currentSong'
        const currentSong = station?.currentSong?.string;

        if (currentSong) {
            if (container) container.innerHTML = `<small>Teraz gramy:</small><br>${currentSong}`;
            return currentSong;
        } else {
            if (container) container.innerHTML = ""; // Nie znaleziono utworu.
        }
        
    } catch (error) {
        console.error("Błąd pobierania:", error);
        if (container) container.innerHTML = "Błąd połączenia.";
    }
}
