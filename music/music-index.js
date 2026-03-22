// --- KONFIGURACJA I ZMIENNE ---
let currentOffset = 0;
let currentTerm = "";
const limit = 5;
const AUD = new Audio(); // BRAKUJĄCA LINIA - inicjalizacja odtwarzacza

const inputKeywords = document.getElementById("input-keywords");
const submitButton = document.getElementById("submit");
const musicContainer = document.querySelector(".hits_list");

// Tworzymy przycisk "Pokaż więcej"
const loadMoreBtn = document.createElement("button");
loadMoreBtn.innerText = "Pokaż więcej wyników";
loadMoreBtn.id = "load-more";
loadMoreBtn.style.display = "none"; 
loadMoreBtn.style.margin = "20px auto"; // Wyśrodkowanie
loadMoreBtn.style.display = "none";
musicContainer.after(loadMoreBtn);

// --- 1. OBSŁUGA WYSZUKIWANIA ---
submitButton.addEventListener("click", () => {
    const query = inputKeywords.value.trim();
    if (query !== "") {
        currentTerm = query;
        currentOffset = 0;
        musicContainer.innerHTML = ""; 
        getSongData(currentTerm, currentOffset);
    } else {
        alert("Wpisz coś w pole wyszukiwania!");
    }
});

// --- 2. OBSŁUGA "POKAŻ WIĘCEJ" ---
loadMoreBtn.addEventListener("click", () => {
    currentOffset += limit;
    getSongData(currentTerm, currentOffset);
});

async function getSongData(searchTerm, offset) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.style.display = "block";
    loadMoreBtn.innerText = "Ładowanie...";

    const url = `https://shazam.p.rapidapi.com/v2/search?term=${encodeURIComponent(searchTerm)}&locale=pl-PL&offset=${offset}&limit=${limit}`;
    
    const options = {
        method: "GET",
        headers: {
            "X-RapidAPI-Key": "688268f4d0msh69176cddbc5ed7bp1008d5jsn1f63b7d6afe9",  // key api: ea4a4a09c7msh91f54f4cc2e9531p160042jsn3a91d4fdbb5e
            "X-RapidAPI-Host": "shazam.p.rapidapi.com"
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        const songs = data.results?.songs?.data || [];

        if (songs.length > 0) {
            appendSongsToDisplay(songs);
            loadMoreBtn.style.display = "block";
            loadMoreBtn.disabled = false;
            loadMoreBtn.innerText = "Pokaż więcej wyników";
        } else {
            if (offset === 0) {
                musicContainer.innerHTML = `<p>Brak wyników dla: <b>${searchTerm}</b></p>`;
            }
            loadMoreBtn.style.display = "none";
        }
    } catch (error) {
        console.error("Błąd API:", error);
        loadMoreBtn.style.display = "none";
    }
}

// --- 3. RENDEROWANIE WYNIKÓW ---
function appendSongsToDisplay(songs) {
    songs.forEach(song => {
        const attr = song.attributes;
        const artworkUrl = attr.artwork.url.replace('{w}', '500').replace('{h}', '500');
        const audioUrl = attr.previews?.[0]?.url || "";
        const fullName = `${attr.artistName} - ${attr.name}`;

        const songElement = document.createElement("div");
        songElement.className = "song-item";
        songElement.innerHTML = `
            <li class="hits_list_songs">
                <div class="song_cover"><img src="${artworkUrl}" alt="cover"></div>
                <div class="song_content">
                    <div class="song_data">
                        <div class="song_track">
                            <a target="_blank" href="https://www.shazam.com/song/${attr.playParams.id}">${attr.name}</a>
                        </div>
                        <div class="song_artist">${attr.artistName}</div>
                        <div class="song_teaser">
                            <a class="fa" data-audio="${audioUrl}"></a>
                            <a target="_blank" href="https://www.youtube.com/results?search_query=${encodeURIComponent(fullName)}"><i class="fa-brands fa-youtube"></i></a>
                            <a target="_blank" href="https://music.youtube.com/search?q=${encodeURIComponent(fullName)}"><i class="fa-solid fa-music"></i></a>
                            <a target="_blank" href="https://open.spotify.com/search/${encodeURIComponent(fullName)}"><i class="fa-brands fa-spotify"></i></a>
                            <a target="_blank" href="https://music.apple.com/pl/search?l=pl&term=${encodeURIComponent(fullName)}"><i class="fa-brands fa-apple"></i></a>
                            <a target="_blank" href="https://www.deezer.com/search/${encodeURIComponent(fullName)}/track"><i class="fa-brands fa-deezer"></i></a>
                            <a target="_blank" href="https://tidal.com/search/tracks?q=${encodeURIComponent(fullName)}"><i class="fa-brands fa-tidal"></i></a></div>
                     </div>
                  </div>
               </li>`;
        musicContainer.appendChild(songElement);
    });
}

// --- 4. LOGIKA ODTWARZACZA (DELEGACJA) ---
musicContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-audio]");
    if (!btn) return;

    const src = btn.dataset.audio;
    if (!src) {
        alert("Podgląd niedostępny");
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

    // Ikony wizualne
    document.querySelectorAll("[data-audio]").forEach(el => {
        if (el !== btn) el.classList.remove("pause");
    });
    btn.classList.toggle("pause", !AUD.paused);
});

AUD.addEventListener("ended", () => {
    document.querySelectorAll("[data-audio]").forEach(el => el.classList.remove("pause"));
});
