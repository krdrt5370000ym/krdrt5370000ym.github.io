const inputKeywords = document.getElementById("input-keywords");
const submitButton = document.getElementById("submit");
const musicContainer = document.querySelector(".hits_list");

// JEDEN GLOBALNY ODTWARZACZ
const AUD = new Audio();

// 1. OBSŁUGA WYSZUKIWANIA
submitButton.addEventListener("click", () => {
    const query = inputKeywords.value.trim();
    if (query !== "") {
        getSongData(query);
    } else {
        alert("Wpisz coś w pole wyszukiwania!");
    }
});

async function getSongData(searchTerm) {
    musicContainer.innerHTML = "<p>Ładowanie wyników...</p>";
    const url = `https://shazam.p.rapidapi.com/v2/search?term=${encodeURIComponent(searchTerm)}&locale=pl-PL&offset=0&limit=50`;
    
    const options = {
        method: "GET",
        headers: {
            "X-RapidAPI-Key": "688268f4d0msh69176cddbc5ed7bp1008d5jsn1f63b7d6afe9", // key api: ea4a4a09c7msh91f54f4cc2e9531p160042jsn3a91d4fdbb5e
            "X-RapidAPI-Host": "shazam.p.rapidapi.com"
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        const songs = data.results?.songs?.data || [];

        if (songs.length > 0) {
            setSongDataDisplay(songs);
        } else {
            musicContainer.innerHTML = `<p>Brak wyników dla frazy: <b>${searchTerm}</b></p>`;
        }
    } catch (error) {
        console.error("Błąd:", error);
        musicContainer.innerHTML = "<p>Wystąpił błąd połączenia.</p>";
    }
}

// 2. WYŚWIETLANIE WYNIKÓW
function setSongDataDisplay(songs) {
    musicContainer.innerHTML = ""; 

    songs.forEach(song => {
        const attr = song.attributes;
        const artworkUrl = attr.artwork.url.replace('{w}', '500').replace('{h}', '500');
        const audioUrl = attr.previews && attr.previews.length > 0 ? attr.previews[0].url : "";
        const fullName = attr.artistName + ' - ' + attr.name;

        const songElement = document.createElement("div");
        songElement.className = "song-item";
        songElement.innerHTML = `<li class="hits_list_songs">
                  <div class="song_cover"><img decoding="async" src="${artworkUrl}"></div>
                  <div class="song_content">
                     <div class="song_data">
                        <div class="song_track"><a href="https://www.shazam.com/song/${attr.playParams.id}">${attr.name}</a></div>
                        <div class="song_artist">${attr.artistName}</div>
                        <div class="song_teaser"><a class="fa" data-audio="${audioUrl}"></a><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(fullName)}"><i class="fa-brands fa-youtube"></i></a><a href="https://music.youtube.com/search?q=${encodeURIComponent(fullName)}"><i class="fa-solid fa-music"></i></a><a href="https://open.spotify.com/search/${encodeURIComponent(fullName)}"><i class="fa-brands fa-spotify"></i></a><a href="https://music.apple.com/pl/search?l=pl&term=${encodeURIComponent(fullName)}"><i class="fa-brands fa-apple"></i></a><a href="https://www.deezer.com/search/${encodeURIComponent(fullName)}/track"><i class="fa-brands fa-deezer"></i></a><a href="https://tidal.com/search/tracks?q=${encodeURIComponent(fullName)}"><i class="fa-brands fa-tidal"></i></a></div>
                     </div>
                  </div>
               </li>`;
        musicContainer.appendChild(songElement);
    });
}

// 3. LOGIKA ODTWARZACZA (DELEGACJA ZDARZEŃ)
musicContainer.addEventListener("click", (e) => {
    // Sprawdzamy czy kliknięto w element z atrybutem data-audio
    const btn = e.target.closest("[data-audio]");
    if (!btn) return;

    const src = btn.dataset.audio;
    if (!src) {
        alert("Brak podglądu audio dla tego utworu.");
        return;
    }

    if (AUD.src !== src) {
        AUD.src = src;
    }

    if (AUD.paused) {
        AUD.play();
    } else {
        AUD.pause();
    }

    // Aktualizacja ikon (klasa .pause)
    document.querySelectorAll("[data-audio]").forEach(el => {
        if (el !== btn) el.classList.remove("pause");
    });
    btn.classList.toggle("pause", !AUD.paused);
});

// Reset ikony gdy piosenka się skończy
AUD.addEventListener("ended", () => {
    document.querySelectorAll("[data-audio]").forEach(el => el.classList.remove("pause"));
});
