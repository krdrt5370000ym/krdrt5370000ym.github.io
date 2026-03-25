// <div id="episode-list">Ładowanie odcinków...</div>
function SpreakerPodcast(showId) {
    // Dodanie parametru limit=100 pozwala pobrać więcej odcinków w jednym zapytaniu
    const apiUrl = 'https://api.spreaker.com/v2/shows/' + showId + '/episodes?limit=100';
    const container = document.getElementById('episode-list');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Dostęp do tablicy odcinków: response -> items
            const episodes = data.response.items;
            
            if (episodes.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = episodes.map(episode => 
                `<ul class="podcast_list_episode_content">
                    <li class="podcast_list_episode_title">
                        <a href="${episode.site_url}" target="_blank">${episode.title}</a> 
                        <a href="#" onclick="
                            AudioPlayerEpisode('${episode.playback_url}');
                            return false;
                        ">►</a>
                    </li>
                </ul>`
            ).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd Spreaker API:", error);
            container.innerHTML = "Błąd podczas ładowania podcastu.";
        });
}

function GrupaZPRPodcast(podcastUid, SiteUid) {
    // Używamy proxy, ponieważ GitHub nie obsługuje PHP do obejścia CORS
    const apiUrl = `https://front-api.grupazprmedia.pl/media/v1/podcast_series_mobile_app/${podcastUid}/?site_uid=${SiteUid}`;
    const proxyUrl = 'https://corsproxy.io/?url=' + encodeURIComponent(apiUrl);
    
    const container = document.getElementById('episode-list');

    fetch(proxyUrl)
        .then(response => {
            if (!response.ok) {
                // Rzuca błąd z kodem statusu (np. "Błąd sieci: 404")
                throw new Error(`Błąd sieci: ${response.status}`);
            }
            // Sprawdza, czy nagłówek odpowiedzi to faktycznie JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new TypeError("Otrzymano format inny niż JSON!");
            }
            return response.json();
        })
        .then(data => {
            // Grupa ZPR zwraca dane w polu 'episodes'
            const episodes = data.episodes || [];
            
            if (episodes.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = `<ul>${episodes.map(episode => `
                <li class="podcast_list_episode_item">
                    <span class="podcast_list_episode_title">${episode.title}</span>
                    ${episode.playback_url ? `
                        <a href="#" onclick="AudioPlayerEpisode('${episode.playback_url}'); return false;">►</a>
                    ` : ''}
                </li>
            `).join('')}</ul>`;

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd:", error);
            container.innerHTML = "Błąd podczas ładowania podcastu.";
        });
}

function EurozetPodcast(showId, mainUrl, stationId) {
    const apiUrl = 'https://player.radiozet.pl/api/podcasts/getPodcastListByProgram/(node)/' + showId + '/(station)/' + stationId;
    const container = document.getElementById('episode-list');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Dostęp do tablicy odcinków: response -> items
            const episodes = data.data;
            
            if (episodes.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = episodes.map(episode => 
                `<ul class="podcast_list_episode_content">
                    <li class="podcast_list_episode_title">
                        <a href="${mainUrl}${episode.url}" target="_blank">${episode.title}</a> 
                        <a href="#" onclick="
                            AudioPlayerEpisode('${episode.player.stream}');
                            return false;
                        ">►</a>
                    </li>
                </ul>`
            ).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd:", error);
            container.innerHTML = "Błąd podczas ładowania podcastu.";
        });
}
// Wywołanie z Twoim ID
// EurozetPodcast(12345, "https://player.radiozet.pl/", "radiozet");

async function WPPodcast(categoryId, mainUrl) {
    const container = document.getElementById('episode-list');
    const apiUrl = `${mainUrl}/wp-json/wp/v2/posts?categories=${categoryId}&per_page=100`;

    try {
        const response = await fetch(apiUrl);
        const posts = await response.json();

        if (posts.length === 0) {
            container.innerHTML = "Brak dostępnych odcinków.";
            return;
        }

        // Renderujemy szkielet listy
        container.innerHTML = posts.map(post => `
            <ul class="podcast_list_episode_content">
                <li id="post-${post.id}" class="podcast_list_episode_title">
                    <a href="${post.link}" target="_blank">${post.title.rendered}</a>
                    <span class="audio-placeholder"></span>
                </li>
            </ul>
        `).join('');

        // Dla każdego posta doczytujemy plik audio osobnym zapytaniem
        posts.forEach(post => loadAudioForPost(post.id, mainUrl));

    } catch (error) {
        container.innerHTML = "Błąd ładowania.";
    }
}
// Przykład użycia (podaj ID kategorii z Twojego WordPressa)
// WPPodcast(5,"https://radiorsc.pl");

function AgoraPodcast(brandId, seriesId, mainUrl) {
    const apiUrl = 'https://podcasts.radioagora.pl/api/getPodcasts?brand_id=' + brandId + '&limit=100&offset=0&series_id=' + seriesId;
    const container = document.getElementById('episode-list');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const episodes = data.records || [];
            
            if (episodes.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = episodes.map(episode => 
                `<ul class="podcast_list_episode_content">
                    <li class="podcast_list_episode_title">
                        <a href="${mainUrl}/podcast/${episode.podcast_seo_url}/${episode.podcast_id}" target="_blank">${episode.podcast_name}</a> 
                        <a href="#" onclick="
                            GetAndPlayAgora(${brandId}, ${episode.podcast_id});
                            return false;"
                        >►</a>
                    </li>
                </ul>`
            ).join('');

            container.innerHTML = htmlContent;
        })
        .catch(err => container.innerHTML = "Błąd API.");
}

// Funkcja pomocnicza pobierająca konkretny strumień przed odtworzeniem
function GetAndPlayAgora(brandId, podcastId) {
    const detailUrl = `https://podcasts.radioagora.pl/api/universalApigetPodcastAll?brand_id=${brandId}&podcast_id=${podcastId}`;
    
    fetch(detailUrl)
        .then(res => res.json())
        .then(data => {
            // Zakładając, że URL strumienia jest w data.podcast_info.player.stream lub podobnej strukturze
            const streamUrl = data.url;
            if (streamUrl) {
                AudioPlayerEpisode(streamUrl);
            } else {
                alert("Nie znaleziono źródła dźwięku.");
            }
        });
}

async function WPPodcastRK(SearchId) {
    const apiUrl = 'https://radiokolor.pl/wp-json/wp/v2/podcast?search=' + SearchId + '&per_page=100';
    const container = document.getElementById('episode-list');
    const parser = new DOMParser();

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd sieci');
            return response.json();
        })
        .then(posts => {
            if (posts.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = posts.map(post => {
                // Parsujemy treść posta, aby wyciągnąć tag <audio> lub <source>
                const docAudio = parser.parseFromString(post.content.rendered, 'text/html');
                const audioTag = docAudio.querySelector('audio source') || docAudio.querySelector('audio');
                const audioUrl = audioTag ? audioTag.getAttribute('src') : '';

                return `
                <ul class="podcast_list_episode_content">
                    <li class="podcast_list_episode_title">
                        <a href="${post.link}" target="_blank">${post.title.rendered}</a> 
                        ${audioUrl ? `<a href="#" onclick="AudioPlayerEpisode('${audioUrl}'); return false;">►</a>` : ''}
                    </li>
                </ul>`;
            }).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd WP API:", error);
            container.innerHTML = "Błąd podczas ładowania postów.";
        });
}

function WPPodcastRVG() {
    const apiUrl = 'https://radiovictoria.pl/wp-json/wp/v2/gosc?per_page=100';
    const container = document.getElementById('episode-list');
    const parser = new DOMParser();

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd sieci');
            return response.json();
        })
        .then(posts => {
            if (posts.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = posts.map(post => {
                // Parsujemy treść posta, aby wyciągnąć tag <audio> lub <source>
                const docAudio = parser.parseFromString(post.content.rendered, 'text/html');
                const audioTag = docAudio.querySelector('audio source') || docAudio.querySelector('audio');
                const audioUrl = audioTag ? audioTag.getAttribute('src') : '';

                return `
                <ul class="podcast_list_episode_content">
                    <li class="podcast_list_episode_title">
                        <a href="${post.link}" target="_blank">${post.title.rendered}</a> 
                        ${audioUrl ? `<a href="#" onclick="AudioPlayerEpisode('${audioUrl}'); return false;">►</a>` : ''}
                    </li>
                </ul>`;
            }).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd WP API:", error);
            container.innerHTML = "Błąd podczas ładowania postów.";
        });
}

function WPPodcastRVR() {
    const apiUrl = 'https://radiovictoria.pl/wp-json/wp/v2/reporter?per_page=100';
    const container = document.getElementById('episode-list');
    const parser = new DOMParser();

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd sieci');
            return response.json();
        })
        .then(posts => {
            if (posts.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = posts.map(post => {
                // Parsujemy treść posta, aby wyciągnąć tag <audio> lub <source>
                const docAudio = parser.parseFromString(post.content.rendered, 'text/html');
                const audioTag = docAudio.querySelector('audio source') || docAudio.querySelector('audio');
                const audioUrl = audioTag ? audioTag.getAttribute('src') : '';

                return `
                <ul class="podcast_list_episode_content">
                    <li class="podcast_list_episode_title">
                        <a href="${post.link}" target="_blank">${post.title.rendered}</a> 
                        ${audioUrl ? `<a href="#" onclick="AudioPlayerEpisode('${audioUrl}'); return false;">►</a>` : ''}
                    </li>
                </ul>`;
            }).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd WP API:", error);
            container.innerHTML = "Błąd podczas ładowania postów.";
        });
}

function WPPodcastRVA(ProgramId) {
    // WordPress API zwraca tablicę postów bezpośrednio
    const apiUrl = 'https://radiovictoria.pl/wp-json/wp/v2/programy?audycje=' + ProgramId + '&per_page=100';
    const container = document.getElementById('episode-list');
    const parser = new DOMParser();

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd sieci');
            return response.json();
        })
        .then(posts => {
            if (posts.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = posts.map(post => {
                // Parsujemy treść posta, aby wyciągnąć tag <audio> lub <source>
                const docAudio = parser.parseFromString(post.content.rendered, 'text/html');
                const audioTag = docAudio.querySelector('audio source') || docAudio.querySelector('audio');
                const audioUrl = audioTag ? audioTag.getAttribute('src') : '';

                return `
                <ul class="podcast_list_episode_content">
                    <li class="podcast_list_episode_title">
                        <a href="${post.link}" target="_blank">${post.title.rendered}</a> 
                        ${audioUrl ? `<a href="#" onclick="AudioPlayerEpisode('${audioUrl}'); return false;">►</a>` : ''}
                    </li>
                </ul>`;
            }).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd WP API:", error);
            container.innerHTML = "Błąd podczas ładowania postów.";
        });
}

async function loadAudioForPost(postId, mainUrl) {
    try {
        const audioRes = await fetch(`${mainUrl}/wp-json/wp/v2/media?parent=${postId}&mime_type=audio/mpeg,audio/wav,audio/ogg`);
        const media = await audioRes.json();

        const li = document.getElementById(`post-${postId}`);
        const placeholder = li.querySelector('.audio-placeholder');

        if (media && media.length > 0) {
            const audioUrl = media[0].source_url;
            placeholder.innerHTML = `<a href="#" onclick="AudioPlayerEpisode('${audioUrl}');">▶</a>`;
        } else {
            placeholder.remove(); // Usuwamy napis, jeśli nie ma audio
        }
    } catch (e) {
        console.error("Błąd audio dla ID " + postId);
    }
}

function AudioPlayerEpisode(url) {
    const audio = document.getElementById('player');
    audio.style.display = 'block'; // Pokaż player po kliknięciu
    document.scrollingElement.scrollTop = audio.offsetTop - 50;
    const isM3U8 = url.toLowerCase().includes('.m3u8');

    // 1. Czyszczenie poprzedniej instancji HLS
    if (hls) {
        hls.destroy();
        hls = null;
    }

    // 2. Obsługa strumienia M3U8 (HLS)
    if (isM3U8 && Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => audio.play());
        
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
                else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
            }
        });
    } 
    // 3. Obsługa Safari (natywne HLS) lub zwykłe MP3
    else {
        audio.src = url;
        audio.play().catch(e => console.error("Błąd autostartu:", e));
    }
}
